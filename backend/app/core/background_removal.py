import io
import os
import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove

_session = None


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
        preferred_model = os.getenv("REMBG_MODEL", "u2net")
        candidates = [preferred_model, "u2net", "birefnet-portrait", "u2netp"]
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


def remove_background(image: Image.Image, bg_color: str = "#FFFFFF") -> Image.Image:
    orig_w, orig_h = image.size
    # 768px provides ultra-fast sub-second execution while maintaining sharp hair & edge definition
    MAX_DIM = 768
    scale = min(1.0, MAX_DIM / max(orig_w, orig_h))

    if scale < 1.0:
        proc_w = max(1, int(orig_w * scale))
        proc_h = max(1, int(orig_h * scale))
        proc_image = image.resize((proc_w, proc_h), Image.LANCZOS)
    else:
        proc_image = image

    img_bytes = io.BytesIO()
    proc_image.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    output_bytes = remove(
        img_bytes.read(),
        session=_get_session(),
        post_process_mask=True,
    )
    output_proc = Image.open(io.BytesIO(output_bytes)).convert("RGBA")
    alpha_proc = np.array(output_proc.split()[3])

    # Clean up white halo/border fringe from light background
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    alpha_clean = cv2.erode(alpha_proc, kernel, iterations=1)
    alpha_clean = cv2.GaussianBlur(alpha_clean, (3, 3), 0.5)

    if scale < 1.0:
        alpha_full = cv2.resize(alpha_clean, (orig_w, orig_h), interpolation=cv2.INTER_LANCZOS4)
    else:
        alpha_full = alpha_clean

    alpha_img = Image.fromarray(alpha_full)
    output = image.convert("RGBA")
    output.putalpha(alpha_img)

    if bg_color.lower() == "transparent":
        return output
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
        return background.convert("RGB")


