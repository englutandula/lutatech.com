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
        u2net_dir = os.path.expanduser("~/.u2net")
        # Default to u2netp (ultra-lightweight 4.5MB model, <200MB RAM) for smooth execution on 512MB hosts
        preferred_model = os.getenv("REMBG_MODEL", "u2netp")
        candidates = [preferred_model, "u2netp", "u2net"]
        selected_model = "u2netp"
        for name in candidates:
            if os.path.exists(os.path.join(u2net_dir, f"{name}.onnx")):
                selected_model = name
                break
        try:
            _session = new_session(selected_model)
        except Exception:
            try:
                _session = new_session("u2netp")
            except Exception:
                _session = new_session("u2net")
    return _session


def remove_background(image: Image.Image, bg_color: str = "#FFFFFF") -> Image.Image:
    # Downscale large images for fast ONNX mask prediction (640px is optimal for crisp mask & ~1s speed on CPU)
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
