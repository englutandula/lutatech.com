"""
High-Quality Background Removal Pipeline
==========================================
Pipeline: U²-Net → Mask Refinement → Alpha Matting → Edge Decontamination → RGBA

Based on the principle that U²-Net's raw mask must NEVER be used directly.
U²-Net output is always a coarse probability map that requires:
  1. Mask refinement  - clean edges, remove noise, preserve hair topology
  2. Alpha matting    - recover sub-pixel transparency at hair/edge boundaries
  3. Decontamination  - remove background color spill from semi-transparent pixels
  4. RGBA assembly    - full-float compositing, no binary pixel deletion
"""
import io
import os
import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove

_session = None


# ---------------------------------------------------------------------------
# Session management
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
        preferred_model = os.getenv("REMBG_MODEL", "u2net_human_seg")
        candidates = [preferred_model, "u2net_human_seg", "u2net", "birefnet-portrait", "u2netp"]
        selected_model = preferred_model
        for name in candidates:
            if os.path.exists(os.path.join(u2net_dir, f"{name}.onnx")):
                selected_model = name
                break
        try:
            _session = new_session(selected_model, session_options=opts)
        except Exception:
            for fallback in ["u2net_human_seg", "u2net", "u2netp"]:
                try:
                    _session = new_session(fallback, session_options=opts)
                    break
                except Exception:
                    continue
    return _session


# ---------------------------------------------------------------------------
# Step 1: U²-Net segmentation  →  raw float probability mask
# ---------------------------------------------------------------------------

def _get_u2net_raw_mask(image: Image.Image) -> np.ndarray:
    """
    Run U²-Net and return a float32 alpha mask in [0, 1] at the image's size.

    Strategy: use rembg's built-in alpha_matting=True as the FIRST pass.
    rembg's alpha matting (via pymatting) is tuned specifically for hair and
    fine edges — it uses the U²-Net mask as a trimap and runs proper alpha matting
    on top. This gives us a much better starting mask than the raw probability map,
    especially for braided hair and flyaways.
    """
    buf = io.BytesIO()
    image.save(buf, format="PNG")
    try:
        # First try with alpha matting enabled (best quality, requires pymatting)
        raw_bytes = remove(
            buf.getvalue(),
            session=_get_session(),
            post_process_mask=True,
            alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=10,
        )
    except Exception:
        # Fallback: no alpha matting
        buf.seek(0)
        raw_bytes = remove(
            buf.getvalue(),
            session=_get_session(),
            post_process_mask=False,
            alpha_matting=False,
        )
    rgba = np.array(Image.open(io.BytesIO(raw_bytes)).convert("RGBA"), dtype=np.float32)
    return rgba[:, :, 3] / 255.0



# ---------------------------------------------------------------------------
# Step 2: Mask refinement  (topology-aware, no over-erosion)
# ---------------------------------------------------------------------------

def _refine_mask(alpha: np.ndarray) -> np.ndarray:
    """
    Refine the alpha matted mask:
      - Remove tiny noise islands (< 200px) that aren't hair
      - Close small interior holes in the body/clothing
      - Preserve ALL soft hair fringe gradients as-is
    Returns float32 alpha in [0, 1].
    """
    uint8 = (alpha * 255).astype(np.uint8)

    # Very low threshold — only cut off near-zero noise (alpha < 2%)
    # This ensures even the faintest hair wisps are kept
    _, binary = cv2.threshold(uint8, 5, 255, cv2.THRESH_BINARY)

    # Remove pure noise blobs < 200px; keep body + meaningful hair clumps
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    if num_labels > 2:
        areas = stats[1:, cv2.CC_STAT_AREA]
        largest = int(np.argmax(areas)) + 1
        keep_mask = np.zeros_like(binary)
        for lbl in range(1, num_labels):
            if lbl == largest or areas[lbl - 1] > 200:
                keep_mask[labels == lbl] = 255
        binary = keep_mask

    # Minimal interior hole fill (doesn't touch the hair fringe)
    close_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    closed = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, close_kernel, iterations=1)
    closed_f = closed.astype(np.float32) / 255.0

    # Blend: solid interior (alpha > 0.7) uses closed mask; edge zone keeps raw alpha
    blend = np.clip((alpha - 0.3) / 0.4, 0.0, 1.0)
    refined = closed_f * blend + alpha * (1.0 - blend)
    return np.clip(refined, 0.0, 1.0)


# ---------------------------------------------------------------------------
# Step 3: Alpha matting  (guided filter on luminance trimap)
# ---------------------------------------------------------------------------

def _alpha_matting_guided(
    rgb: np.ndarray,
    coarse_alpha: np.ndarray,
    radius: int = 5,
    eps: float = 1e-6,
) -> np.ndarray:
    """
    Edge-only guided-filter alpha refinement.

    Acts ONLY on the transition band (5% < alpha < 95%) so the solid body
    interior is never touched and the background stays clean.
    A small radius (5px) means it follows individual hair strands precisely.
    """
    guide = cv2.cvtColor(rgb.astype(np.float32) / 255.0, cv2.COLOR_RGB2GRAY)
    alpha_f = coarse_alpha.astype(np.float32)

    try:
        gf = cv2.ximgproc.createGuidedFilter(
            guide.astype(np.float32), radius=radius, eps=eps
        )
        filtered = gf.filter(alpha_f)
    except AttributeError:
        filtered = _guided_filter_manual(guide, alpha_f, radius, eps)

    filtered = np.clip(filtered, 0.0, 1.0)

    # Blend only in the transition zone (0.05 to 0.95)
    dist_to_edge = 1.0 - np.abs(alpha_f * 2.0 - 1.0)
    transition_weight = np.clip(dist_to_edge / 0.5, 0.0, 1.0)

    refined = filtered * transition_weight + alpha_f * (1.0 - transition_weight)
    return np.clip(refined, 0.0, 1.0)


def _guided_filter_manual(
    guide: np.ndarray,
    src: np.ndarray,
    r: int,
    eps: float,
) -> np.ndarray:
    """Efficient O(N) guided filter via box filter."""
    h, w = guide.shape
    ksize = (2 * r + 1, 2 * r + 1)

    mean_I  = cv2.blur(guide, ksize)
    mean_p  = cv2.blur(src,   ksize)
    mean_Ip = cv2.blur(guide * src, ksize)
    mean_II = cv2.blur(guide * guide, ksize)

    cov_Ip = mean_Ip - mean_I * mean_p
    var_I  = mean_II - mean_I * mean_I

    a = cov_Ip / (var_I + eps)
    b = mean_p - a * mean_I

    mean_a = cv2.blur(a, ksize)
    mean_b = cv2.blur(b, ksize)

    return mean_a * guide + mean_b


# ---------------------------------------------------------------------------
# Step 4: Edge color decontamination  (despill / inpaint)
# ---------------------------------------------------------------------------

def _decontaminate(rgb: np.ndarray, alpha: np.ndarray) -> np.ndarray:
    """
    Remove background color spill from the semi-transparent boundary zone.

    Strategy:
      - Fully opaque core (alpha ≥ 0.92): pure foreground — keep exactly as-is
      - Transition zone (0.05 < alpha < 0.92): mixed pixels containing
        background color bleed — inpaint foreground color outwards, then
        blend so that pixels closer to transparent get more of the pure color
      - Fully transparent (alpha ≤ 0.05): background — irrelevant

    The blend direction is: near-solid → keep original colour;
                            near-transparent → use inpainted foreground colour.
    This eliminates halos without touching the solid body at all.
    """
    solid_fg = (alpha >= 0.92).astype(np.uint8)
    if solid_fg.sum() < 100:
        return rgb

    # Inpaint mask: ONLY the boundary pixels that may carry background bleed
    inpaint_mask = ((alpha > 0.05) & (alpha < 0.92)).astype(np.uint8) * 255
    if not inpaint_mask.any():
        return rgb

    try:
        inpainted = cv2.inpaint(rgb, inpaint_mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)
    except Exception:
        return rgb

    # Blend weight: 0 at solid core (alpha≥0.92 → weight=0 → keep original)
    #               1 at transparent edge (alpha→0 → weight=1 → use inpainted colour)
    # Only applies inside the transition zone; outside it original is used unchanged.
    in_zone = inpaint_mask.astype(np.float32) / 255.0
    # Within the zone, weight = 1 − alpha (higher near transparent)
    zone_weight = (1.0 - np.clip(alpha, 0.0, 1.0)) * in_zone
    zone_weight = zone_weight[:, :, np.newaxis]

    result = rgb.astype(np.float32) * (1.0 - zone_weight) + \
             inpainted.astype(np.float32) * zone_weight
    return np.clip(result, 0, 255).astype(np.uint8)


# ---------------------------------------------------------------------------
# Step 5: Parse background color helper
# ---------------------------------------------------------------------------

def _parse_bg_color(bg_color: str) -> tuple:
    """Return (r, g, b) tuple from hex string or named color."""
    aliases = {
        "blue":       (37, 99, 235),
        "lightblue":  (173, 216, 230),
        "light blue": (173, 216, 230),
        "red":        (220, 38, 38),
        "green":      (34, 197, 94),
        "white":      (255, 255, 255),
        "black":      (0, 0, 0),
        "gray":       (156, 163, 175),
        "grey":       (156, 163, 175),
    }
    key = bg_color.strip().lower()
    if key in aliases:
        return aliases[key]
    if bg_color.startswith("#") and len(bg_color) == 7:
        try:
            return (
                int(bg_color[1:3], 16),
                int(bg_color[3:5], 16),
                int(bg_color[5:7], 16),
            )
        except ValueError:
            pass
    return (255, 255, 255)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def remove_background(image: Image.Image, bg_color: str = "#FFFFFF") -> Image.Image:
    """
    Full high-quality background removal pipeline:

        U²-Net → Mask Refinement → Alpha Matting → Edge Decontamination → RGBA

    Returns:
      - RGBA Image when bg_color="transparent"
      - RGB  Image composited on the requested background color otherwise
    """
    orig_w, orig_h = image.size

    # ── Inference resolution ─────────────────────────────────────────────
    # Process at native resolution up to 1920px on the long side.
    # Higher resolution = finer hair detail in the mask.
    MAX_DIM = 1920
    scale = min(1.0, MAX_DIM / max(orig_w, orig_h))

    if scale < 1.0:
        proc_w = max(1, round(orig_w * scale))
        proc_h = max(1, round(orig_h * scale))
        proc_img = image.resize((proc_w, proc_h), Image.LANCZOS)
    else:
        proc_img = image

    rgb_proc = np.array(proc_img.convert("RGB"))   # uint8 H×W×3

    # ── Step 1: U²-Net segmentation ──────────────────────────────────────
    coarse_alpha = _get_u2net_raw_mask(proc_img)   # float32 [0,1]

    # ── Step 2: Mask refinement ───────────────────────────────────────────
    refined_alpha = _refine_mask(coarse_alpha)

    # ── Step 3: Alpha matting (guided filter) ────────────────────────────
    # Use a modest radius so it follows hair without over-smoothing edges
    matted_alpha = _alpha_matting_guided(rgb_proc, refined_alpha, radius=40, eps=1e-5)

    # ── Step 4: Edge color decontamination ───────────────────────────────
    clean_rgb = _decontaminate(rgb_proc, matted_alpha)

    # ── Upscale to original resolution ───────────────────────────────────
    if scale < 1.0:
        clean_rgb = cv2.resize(clean_rgb, (orig_w, orig_h), interpolation=cv2.INTER_LANCZOS4)
        matted_alpha_up = cv2.resize(
            matted_alpha.astype(np.float32), (orig_w, orig_h),
            interpolation=cv2.INTER_LANCZOS4
        )
    else:
        matted_alpha_up = matted_alpha

    # Clamp to valid range after upscaling interpolation
    matted_alpha_up = np.clip(matted_alpha_up, 0.0, 1.0)
    alpha_uint8 = (matted_alpha_up * 255).round().astype(np.uint8)

    # ── Step 5: Assemble RGBA ────────────────────────────────────────────
    rgba = np.dstack([clean_rgb, alpha_uint8])          # H×W×4
    result_rgba = Image.fromarray(rgba, mode="RGBA")

    if bg_color.strip().lower() == "transparent":
        return result_rgba

    # ── Composite on target background ───────────────────────────────────
    r, g, b = _parse_bg_color(bg_color)
    bg = Image.new("RGBA", (orig_w, orig_h), (r, g, b, 255))
    bg.paste(result_rgba, (0, 0), mask=result_rgba.split()[3])
    return bg.convert("RGB")
