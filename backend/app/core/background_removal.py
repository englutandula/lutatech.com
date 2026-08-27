from rembg import remove, new_session
from PIL import Image
import numpy as np
import cv2
import io

_session = None

def _get_session():
    global _session
    if _session is None:
        _session = new_session("birefnet-portrait")
    return _session


def remove_background(image: Image.Image, bg_color: str = "#FFFFFF") -> Image.Image:
    # Downscale large images before BiRefNet — faster inference, no quality loss after crop
    MAX_DIM = 1024
    orig_size = image.size
    if max(orig_size) > MAX_DIM:
        image.thumbnail((MAX_DIM, MAX_DIM), Image.LANCZOS)

    img_bytes = io.BytesIO()
    image.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    if bg_color.lower() != "transparent":
        r = int(bg_color[1:3], 16)
        g = int(bg_color[3:5], 16)
        b = int(bg_color[5:7], 16)

    output_bytes = remove(
        img_bytes.read(),
        session=_get_session(),
        alpha_matting=False,
        post_process_mask=True,
    )
    output = Image.open(io.BytesIO(output_bytes)).convert("RGBA")

    alpha_np = np.array(output.split()[3])

    _, binary = cv2.threshold(alpha_np, 10, 255, cv2.THRESH_BINARY)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    if num_labels > 2:
        areas = stats[1:, cv2.CC_STAT_AREA]
        largest = np.argmax(areas) + 1
        alpha_np = np.where(labels == largest, alpha_np, 0).astype(np.uint8)

    # Erode the mask to remove the halo/border from the original background
    kernel = np.ones((3, 3), np.uint8)
    alpha_np = cv2.erode(alpha_np, kernel, iterations=2)

    alpha_smooth = cv2.GaussianBlur(alpha_np, (3, 3), 0)
    alpha_img = Image.fromarray(alpha_smooth)

    output.putalpha(alpha_img)

    if bg_color.lower() == "transparent":
        return output
    else:
        background = Image.new("RGBA", output.size, (r, g, b, 255))
        background.paste(output, mask=alpha_img)
        return background.convert("RGB")
