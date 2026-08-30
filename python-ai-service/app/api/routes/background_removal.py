import base64
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from app.core.security import verify_internal_secret
from app.services.background_removal import process_background_removal
from app.core.config import settings

router = APIRouter()

ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"]

@router.post("/background/remove", dependencies=[Depends(verify_internal_secret)])
async def remove_background_endpoint(
    file: UploadFile = File(...),
    bg_color: str = Form("transparent"),
):
    """
    Remove background from uploaded image.
    Protected by X-Internal-Secret.
    """
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image format: {file.content_type}. Allowed formats: JPG, PNG, WEBP.",
        )

    image_bytes = await file.read()
    max_bytes = settings.max_image_size_mb * 1024 * 1024
    if len(image_bytes) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image size exceeds the {settings.max_image_size_mb} MB limit.",
        )

    try:
        processed_png_bytes = process_background_removal(image_bytes, bg_color=bg_color)
        b64_str = base64.b64encode(processed_png_bytes).decode("utf-8")
        data_url = f"data:image/png;base64,{b64_str}"

        return {
            "success": True,
            "message": "Background removed successfully",
            "data": {
                "image_data_url": data_url,
                "format": "png",
                "size_bytes": len(processed_png_bytes),
            },
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process image: {str(e)}",
        )
