import io
import os
import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove
from app.core.config import settings

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
        preferred_model = settings.rembg_model
        candidates = [preferred_model, "u2netp", "u2net"]
        selected_model = preferred_model
        for name in candidates:
            if os.path.exists(os.path.join(u2net_dir, f"{name}.onnx")):
                selected_model = name
                break
        try:
            _session = new_session(selected_model, session_options=opts)
        except Exception:
            try:
                _session = new_session("u2netp", session_options=opts)
            except Exception:
                _session = new_session("u2net", session_options=opts)
    return _session

def process_background_removal(image_bytes: bytes, bg_color: str = "transparent") -> bytes:
    """
    Remove image background with neural segmentation, edge smoothing, and high-fidelity output.
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    orig_w, orig_h = image.size

    # 512px inference produces sub-second response while preserving sharp silhouette
    MAX_INFERENCE_DIM = 512
    scale = min(1.0, MAX_INFERENCE_DIM / max(orig_w, orig_h))

    if scale < 1.0:
        inf_w = max(1, int(orig_w * scale))
        inf_h = max(1, int(orig_h * scale))
        inf_image = image.resize((inf_w, inf_h), Image.BILINEAR)
    else:
        inf_image = image

    img_buf = io.BytesIO()
    inf_image.save(img_buf, format="PNG")
    img_buf.seek(0)

    output_raw = remove(
        img_buf.read(),
        session=get_rembg_session(),
        alpha_matting=False,
        post_process_mask=False,
    )
    output_inf = Image.open(io.BytesIO(output_raw)).convert("RGBA")
    alpha_inf = np.array(output_inf.split()[3])

    # Clean up minor disconnected noise
    _, binary = cv2.threshold(alpha_inf, 10, 255, cv2.THRESH_BINARY)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    if num_labels > 2:
        areas = stats[1:, cv2.CC_STAT_AREA]
        largest = np.argmax(areas) + 1
        alpha_inf = np.where(labels == largest, alpha_inf, 0).astype(np.uint8)

    # Anti-alias mask borders
    kernel = np.ones((3, 3), np.uint8)
    alpha_inf = cv2.erode(alpha_inf, kernel, iterations=1)
    alpha_inf = cv2.GaussianBlur(alpha_inf, (3, 3), 0)

    # Upscale alpha mask back to original resolution
    if scale < 1.0:
        alpha_full = cv2.resize(alpha_inf, (orig_w, orig_h), interpolation=cv2.INTER_LINEAR)
    else:
        alpha_full = alpha_inf

    alpha_img = Image.fromarray(alpha_full)
    output = image.copy()
    output.putalpha(alpha_img)

    result_buf = io.BytesIO()
    if bg_color.lower() == "transparent":
        output.save(result_buf, format="PNG", optimize=True)
    else:
        r, g, b = 255, 255, 255
        if bg_color.startswith("#") and len(bg_color) == 7:
            try:
                r = int(bg_color[1:3], 16)
                g = int(bg_color[3:5], 16)
                b = int(bg_color[5:7], 16)
            except ValueError:
                pass
        background = Image.new("RGBA", (orig_w, orig_h), (r, g, b, 255))
        background.paste(output, mask=alpha_img)
        background.convert("RGB").save(result_buf, format="PNG", optimize=True)

    result_buf.seek(0)
    return result_buf.getvalue()
