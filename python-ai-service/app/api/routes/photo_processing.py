import io
import json
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from PIL import Image

from app.core.security import verify_internal_secret
from app.services.photo_processor import process_photo
from app.data.photo_specs import get_all_specs, get_spec, list_country_codes
from app.models.response import ProcessResponse

router = APIRouter(dependencies=[Depends(verify_internal_secret)])

@router.get("/requirements", tags=["Requirements"])
async def get_requirements_endpoint():
    return {"countries": get_all_specs()}

@router.get("/requirements/{country_code}", tags=["Requirements"])
async def get_country_requirements_endpoint(country_code: str):
    spec = get_spec(country_code.upper())
    if not spec:
        raise HTTPException(status_code=404, detail=f"Country code '{country_code}' not found")
    return spec

@router.post("/process", response_model=ProcessResponse, tags=["Passport Photo Processing"])
async def process_photo_endpoint(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    options: str = Form(default="{}"),
):
    image_bytes = await file.read()
    if len(image_bytes) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 20MB.")

    try:
        Image.open(io.BytesIO(image_bytes)).verify()
    except Exception:
        raise HTTPException(status_code=400, detail="Unsupported or corrupt image file.")

    try:
        opts = json.loads(options) if isinstance(options, str) else (options or {})
    except Exception:
        opts = {}

    try:
        result = process_photo(
            image_bytes=image_bytes,
            document_type=document_type.upper(),
            brightness=opts.get("brightness", 50),
            contrast=opts.get("contrast", 50),
            saturation=opts.get("saturation", 50),
            remove_bg=opts.get("remove_background", True),
            background_color=opts.get("background_color"),
            do_auto_enhance=opts.get("auto_enhance", True),
            custom_width=opts.get("custom_width"),
            custom_height=opts.get("custom_height"),
            custom_unit=opts.get("custom_unit", "mm"),
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
