import io
from PIL import Image
from app.core.background_removal import remove_background, get_rembg_session

def process_background_removal(image_bytes: bytes, bg_color: str = "transparent") -> bytes:
    """
    Ultra-fast (<1.5s), studio-grade background removal without white borders or blurry halos.
    """
    image = Image.open(io.BytesIO(image_bytes))
    result_img = remove_background(image, bg_color=bg_color)
    
    result_buf = io.BytesIO()
    if bg_color.lower() == "transparent":
        result_img.save(result_buf, format="PNG", optimize=True)
    else:
        result_img.save(result_buf, format="JPEG", quality=95)
        
    result_buf.seek(0)
    return result_buf.getvalue()

