import io
import os
import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove

_session = None

def get_rembg_session():
    global _session
    if _session is None:
        import onnxruntime as ort
        opts = ort.SessionOptions()
        cpu_threads = min(4, os.cpu_count() or 2)
        opts.intra_op_num_threads = cpu_threads
        opts.inter_op_num_threads = 1
        opts.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL

        u2net_dir = os.path.expanduser("~/.u2net")
        preferred_model = os.getenv("REMBG_MODEL", "birefnet-portrait")
        candidates = [preferred_model, "birefnet-portrait", "u2net", "u2netp"]
        selected_model = preferred_model
        for name in candidates:
            if os.path.exists(os.path.join(u2net_dir, f"{name}.onnx")):
                selected_model = name
                break
        try:
            _session = new_session(selected_model, session_options=opts)
        except Exception:
            try:
                _session = new_session("u2net", session_options=opts)
            except Exception:
                _session = new_session("u2netp", session_options=opts)
    return _session


def decontaminate_foreground_edges(rgb_np: np.ndarray, alpha_np: np.ndarray) -> np.ndarray:
    """
    Extrapolates solid foreground colors (hair, skin, shirt) into semi-transparent edge pixels.
    This eliminates white/light halos and gray edge blur when placing the cutout onto new backgrounds.
    """
    # Identify non-solid regions (background + soft transition edge)
    not_solid = (alpha_np < 240).astype(np.uint8)
    
    # If almost nothing is solid, return original
    if np.count_nonzero(alpha_np >= 240) < 50:
        return rgb_np

    # Inpaint / propagate solid foreground outwards by 4-5px
    try:
        decontaminated = cv2.inpaint(rgb_np, not_solid, inpaintRadius=4, flags=cv2.INPAINT_TELEA)
        return decontaminated
    except Exception:
        return rgb_np


def remove_background(image: Image.Image, bg_color: str = "#FFFFFF") -> Image.Image:
    """
    Studio-grade background removal with clean hair strands, sharp contours,
    and zero edge blur/white halo artifacts.
    """
    orig_w, orig_h = image.size

    # Use up to 1600px for crisp, high-definition hair strands
    MAX_INFERENCE_DIM = 1600
    scale = min(1.0, MAX_INFERENCE_DIM / max(orig_w, orig_h))

    if scale < 1.0:
        inf_w = max(1, int(orig_w * scale))
        inf_h = max(1, int(orig_h * scale))
        inf_image = image.resize((inf_w, inf_h), Image.Resampling.LANCZOS)
    else:
        inf_image = image

    img_bytes = io.BytesIO()
    inf_image.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    # Neural extraction with birefnet-portrait / u2net
    output_bytes = remove(
        img_bytes.read(),
        session=get_rembg_session(),
        alpha_matting=False,
        post_process_mask=True,
    )
    output_inf = Image.open(io.BytesIO(output_bytes)).convert("RGBA")
    alpha_inf = np.array(output_inf.split()[3])

    # Clean isolated floating noise specks
    _, binary = cv2.threshold(alpha_inf, 15, 255, cv2.THRESH_BINARY)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    if num_labels > 2:
        areas = stats[1:, cv2.CC_STAT_AREA]
        largest = np.argmax(areas) + 1
        alpha_inf = np.where(labels == largest, alpha_inf, 0).astype(np.uint8)

    # Defringe: Clean 1px boundary to clip outer background contamination
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    alpha_clean = cv2.erode(alpha_inf, kernel, iterations=1)

    # Upscale alpha mask to original image size with anti-aliasing
    if scale < 1.0:
        alpha_full = cv2.resize(alpha_clean, (orig_w, orig_h), interpolation=cv2.INTER_CUBIC)
    else:
        alpha_full = alpha_clean

    # Clamp alpha to valid 0-255 range
    alpha_full = np.clip(alpha_full, 0, 255).astype(np.uint8)

    # Convert source image to numpy RGB
    orig_rgb = np.array(image.convert("RGB"))

    # Decontaminate edge pixels: extend solid subject color into semi-transparent borders
    decon_rgb = decontaminate_foreground_edges(orig_rgb, alpha_full)

    if bg_color.lower() == "transparent":
        # Create clean RGBA cutout with decontaminated edge colors
        decon_rgba = cv2.cvtColor(decon_rgb, cv2.COLOR_RGB2RGBA)
        decon_rgba[:, :, 3] = alpha_full
        return Image.fromarray(decon_rgba)
    else:
        # Parse target background color
        r, g, b = 255, 255, 255
        if bg_color.startswith("#") and len(bg_color) == 7:
            try:
                r = int(bg_color[1:3], 16)
                g = int(bg_color[3:5], 16)
                b = int(bg_color[5:7], 16)
            except ValueError:
                pass
        elif bg_color.lower() in ("light blue", "lightblue"):
            r, g, b = 173, 216, 230
        elif bg_color.lower() == "blue":
            r, g, b = 40, 75, 158

        # Exact mathematical linear alpha compositing (prevents color fringe)
        alpha_norm = (alpha_full.astype(np.float32) / 255.0)[:, :, np.newaxis]
        bg_array = np.array([r, g, b], dtype=np.float32).reshape((1, 1, 3))
        comp_rgb = (decon_rgb.astype(np.float32) * alpha_norm + bg_array * (1.0 - alpha_norm))
        comp_rgb = np.clip(comp_rgb, 0, 255).astype(np.uint8)

        return Image.fromarray(comp_rgb)

