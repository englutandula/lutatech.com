"""
Background Removal Pipeline
============================
  BiRefNet Portrait  →  Decontamination  →  RGBA

BiRefNet already produces soft, well-shaped alpha masks natively —
no alpha matting needed. Decontamination removes any residual
background colour spill from the semi-transparent edge zone.

Fallback chain: birefnet-portrait → u2net_human_seg → u2net → u2netp
"""
import io
import os
import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove

_session = None


# ---------------------------------------------------------------------------
# Session — prefers birefnet-portrait, falls back gracefully
# ---------------------------------------------------------------------------

def _get_session():
    global _session
    if _session is None:
        import onnxruntime as ort
        opts = ort.SessionOptions()
        cpu_threads = min(4, os.cpu_count() or 2)
        opts.intra_op_num_threads = cpu_threads
        opts.inter_op_num_threads = 1
        opts.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL

        u2net_dir = os.path.expanduser("~/.u2net")

        env_model = os.getenv("REMBG_MODEL", "birefnet-portrait")
        candidates = [
            env_model,
            "birefnet-portrait",
            "birefnet-general-lite",
            "u2net_human_seg",
            "u2net",
        ]

        for name in candidates:
            onnx_path = os.path.join(u2net_dir, f"{name}.onnx")
            if os.path.exists(onnx_path):
                try:
                    _session = new_session(name, session_options=opts)
                    print(f"[rembg] Loaded model: {name}")
                    break
                except Exception as e:
                    print(f"[rembg] Failed to load {name}: {e}")
                    continue

        if _session is None:
            # Last resort — let rembg download whatever it can
            _session = new_session("u2net_human_seg", session_options=opts)

    return _session


# ---------------------------------------------------------------------------
# Decontamination — remove background colour spill from edge zone
# ---------------------------------------------------------------------------

def _decontaminate(rgb: np.ndarray, alpha: np.ndarray) -> np.ndarray:
    """
    Removes background colour bleed from semi-transparent edge pixels.

    - Solid core  (alpha >= 235): untouched — pure foreground
    - Edge zone   (5 < alpha < 235): inpainted with foreground colour,
                  blended by (1 - normalised alpha) so pixels closer to
                  transparent get more of the clean inpainted colour
    - Background  (alpha <= 5): irrelevant
    """
    inpaint_mask = ((alpha > 5) & (alpha < 235)).astype(np.uint8) * 255

    if not inpaint_mask.any() or (alpha >= 235).sum() < 50:
        return rgb

    try:
        inpainted = cv2.inpaint(rgb, inpaint_mask, inpaintRadius=3,
                                flags=cv2.INPAINT_TELEA)
    except Exception:
        return rgb

    # Weight: 0 at solid (no change), 1 at fully transparent (full replace)
    zone   = inpaint_mask.astype(np.float32) / 255.0
    weight = (1.0 - alpha.astype(np.float32) / 255.0) * zone
    weight = weight[:, :, np.newaxis]

    result = (rgb.astype(np.float32) * (1.0 - weight)
              + inpainted.astype(np.float32) * weight)
    return np.clip(result, 0, 255).astype(np.uint8)


# ---------------------------------------------------------------------------
# Background colour parser
# ---------------------------------------------------------------------------

def _parse_bg_color(bg_color: str) -> tuple:
    aliases = {
        "blue":       (37,  99,  235),
        "lightblue":  (173, 216, 230),
        "light blue": (173, 216, 230),
        "red":        (220, 38,  38),
        "green":      (34,  197, 94),
        "white":      (255, 255, 255),
        "black":      (0,   0,   0),
        "gray":       (156, 163, 175),
        "grey":       (156, 163, 175),
    }
    key = bg_color.strip().lower()
    if key in aliases:
        return aliases[key]
    if bg_color.startswith("#") and len(bg_color) == 7:
        try:
            return (int(bg_color[1:3], 16),
                    int(bg_color[3:5], 16),
                    int(bg_color[5:7], 16))
        except ValueError:
            pass
    return (255, 255, 255)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def remove_background(image: Image.Image, bg_color: str = "#FFFFFF") -> Image.Image:
    """
    Remove the background using BiRefNet Portrait → decontamination → RGBA.

    BiRefNet produces soft, accurate alpha masks natively — no extra alpha
    matting pass required. The decontamination step cleans up any residual
    background colour spill at the hair / clothing boundary.

    Returns:
      RGBA Image  when bg_color="transparent"
      RGB  Image  composited on the requested background colour otherwise
    """
    orig_w, orig_h = image.size

    # Process at up to 1920 px on the long side for maximum hair detail
    MAX_DIM = 1920
    scale = min(1.0, MAX_DIM / max(orig_w, orig_h))
    if scale < 1.0:
        proc_w = max(1, round(orig_w * scale))
        proc_h = max(1, round(orig_h * scale))
        proc_img = image.resize((proc_w, proc_h), Image.LANCZOS)
    else:
        proc_img = image

    buf = io.BytesIO()
    proc_img.save(buf, format="PNG")

    # ── Step 1: BiRefNet Portrait segmentation ───────────────────────────
    # post_process_mask=True  — applies BiRefNet's own post-processing
    # alpha_matting=False     — BiRefNet already produces soft alpha edges
    output_bytes = remove(
        buf.getvalue(),
        session=_get_session(),
        post_process_mask=True,
        alpha_matting=False,
    )

    rgba_proc = np.array(Image.open(io.BytesIO(output_bytes)).convert("RGBA"))
    rgb_proc  = np.array(proc_img.convert("RGB"))
    alpha_proc = rgba_proc[:, :, 3]   # uint8  [0-255]

    # ── Step 2: Edge colour decontamination ──────────────────────────────
    clean_rgb = _decontaminate(rgb_proc, alpha_proc)

    # ── Step 3: Minimal anti-aliasing (tiny kernel, no blur) ─────────────
    alpha_smooth = cv2.GaussianBlur(alpha_proc, (3, 3), 0.4)

    # ── Step 4: Upscale to original resolution ───────────────────────────
    if scale < 1.0:
        clean_rgb    = cv2.resize(clean_rgb,    (orig_w, orig_h),
                                  interpolation=cv2.INTER_LANCZOS4)
        alpha_smooth = cv2.resize(alpha_smooth, (orig_w, orig_h),
                                  interpolation=cv2.INTER_LANCZOS4)

    # ── Step 5: Assemble RGBA ────────────────────────────────────────────
    rgba = np.dstack([clean_rgb, alpha_smooth])
    result_rgba = Image.fromarray(rgba, mode="RGBA")

    if bg_color.strip().lower() == "transparent":
        return result_rgba

    # ── Step 6: Composite on target background ───────────────────────────
    r, g, b = _parse_bg_color(bg_color)
    bg = Image.new("RGBA", (orig_w, orig_h), (r, g, b, 255))
    bg.paste(result_rgba, (0, 0), mask=result_rgba.split()[3])
    return bg.convert("RGB")
