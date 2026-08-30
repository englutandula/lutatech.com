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
    Sharp, crisp background removal without blurry halo or fuzzy feathering edges.
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    orig_w, orig_h = image.size

    # High resolution inference (1200px) ensures crisp silhouette
    MAX_INFERENCE_DIM = 1200
    scale = min(1.0, MAX_INFERENCE_DIM / max(orig_w, orig_h))

    if scale < 1.0:
        inf_w = max(1, int(orig_w * scale))
        inf_h = max(1, int(orig_h * scale))
        inf_image = image.resize((inf_w, inf_h), Image.Resampling.LANCZOS)
    else:
        inf_image = image

    img_buf = io.BytesIO()
    inf_image.save(img_buf, format="PNG")
    img_buf.seek(0)

    output_raw = remove(
        img_buf.read(),
        session=get_rembg_session(),
        alpha_matting=False,
        post_process_mask=True,
    )
    output_inf = Image.open(io.BytesIO(output_raw)).convert("RGBA")
    alpha_inf = np.array(output_inf.split()[3])

    # Clean threshold to eliminate fuzzy semi-transparent border halos
    alpha_clean = np.where(alpha_inf > 20, alpha_inf, 0).astype(np.uint8)
    alpha_clean = np.where(alpha_clean > 220, 255, alpha_clean).astype(np.uint8)

    # Upscale alpha mask back to original resolution with sharp bicubic interpolation
    if scale < 1.0:
        alpha_full = cv2.resize(alpha_clean, (orig_w, orig_h), interpolation=cv2.INTER_CUBIC)
    else:
        alpha_full = alpha_clean

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
