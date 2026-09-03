import io
from PIL import Image
from rembg import remove, new_session

# Pre-load the human segmentation model session
human_session = new_session("u2net_human_seg")

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


def remove_background(image: Image.Image, bg_color: str = "#FFFFFF") -> Image.Image:
    """
    Remove background using u2net_human_seg neural segmentation without heavy CPU Laplacian matting.
    Runs in ~1s on CPU while preserving full human body, shoulders, and soft hair boundaries.
    """
    # 1. Neural network segmentation (fast, no heavy CPU Laplacian matting)
    output = remove(
        image,
        session=human_session,
        alpha_matting=False,
        post_process_mask=True,
    )

    # 2. Return transparent if requested
    if bg_color.strip().lower() == "transparent":
        return output

    # 3. Otherwise, create a solid background and paste the foreground
    r, g, b = _parse_bg_color(bg_color)
    background = Image.new("RGBA", output.size, (r, g, b, 255))

    # Paste using the alpha channel as a mask
    background.paste(output, mask=output.split()[3])

    # Convert to RGB to remove the alpha channel before returning
    return background.convert("RGB")
