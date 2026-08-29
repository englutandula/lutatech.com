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
        # Utilize available CPU cores (up to 4) for high-speed multi-threaded inference on VPS
        cpu_threads = min(4, os.cpu_count() or 2)
        opts.intra_op_num_threads = cpu_threads
        opts.inter_op_num_threads = 1
        opts.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL

        u2net_dir = os.path.expanduser("~/.u2net")
        # Default to full studio-grade u2net model on VPS/high-RAM, with u2netp fallback
        preferred_model = os.getenv("REMBG_MODEL", "u2net")
        candidates = [preferred_model, "u2net", "u2netp"]
        selected_model = "u2net"
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
    # 640px inference delivers sub-second execution speed with razor-sharp alpha mask matting
    MAX_INFERENCE_DIM = 640
    orig_w, orig_h = image.size
    scale = min(1.0, MAX_INFERENCE_DIM / max(orig_w, orig_h))

    if scale < 1.0:
        inf_w = max(1, int(orig_w * scale))
        inf_h = max(1, int(orig_h * scale))
        inf_image = image.resize((inf_w, inf_h), Image.BILINEAR)
    else:
        inf_image = image

    img_bytes = io.BytesIO()
    inf_image.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    output_bytes = remove(
        img_bytes.read(),
        session=_get_session(),
        alpha_matting=False,
        post_process_mask=True,
    )
    output_inf = Image.open(io.BytesIO(output_bytes)).convert("RGBA")
    alpha_inf = np.array(output_inf.split()[3])

    # Clean up small disconnected noise components
    _, binary = cv2.threshold(alpha_inf, 10, 255, cv2.THRESH_BINARY)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    if num_labels > 2:
        areas = stats[1:, cv2.CC_STAT_AREA]
        largest = np.argmax(areas) + 1
        alpha_inf = np.where(labels == largest, alpha_inf, 0).astype(np.uint8)

    # Erode the mask slightly to remove halo border from background
    kernel = np.ones((3, 3), np.uint8)
    alpha_inf = cv2.erode(alpha_inf, kernel, iterations=1)
    alpha_inf = cv2.GaussianBlur(alpha_inf, (3, 3), 0)

    # Upscale alpha mask back to original image dimensions with smooth bilinear interpolation
    if scale < 1.0:
        alpha_full = cv2.resize(alpha_inf, (orig_w, orig_h), interpolation=cv2.INTER_LINEAR)
    else:
        alpha_full = alpha_inf

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
