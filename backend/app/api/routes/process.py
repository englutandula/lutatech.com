import base64
import io
import json
from typing import Optional

import pillow_heif
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, Depends
from starlette.concurrency import run_in_threadpool
from PIL import Image
from sqlalchemy.orm import Session

from app.core.background_removal import remove_background
from app.core.face_detection import detect_faces
from app.models.response import BackgroundRemoveResponse, FaceDetectResponse, FaceLocation, ProcessResponse
from app.services.photo_processor import process_photo
from app.api.deps import get_current_user
from app.database import get_db
from app.models.db_models import User, ToolJob

pillow_heif.register_heif_opener()

router = APIRouter()

MAX_FILE_SIZE = 25 * 1024 * 1024


@router.post("/process", response_model=ProcessResponse)
async def process_endpoint(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    options: str = Form(default="{}"),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 25MB.")

    try:
        Image.open(io.BytesIO(image_bytes)).verify()
    except Exception:
        raise HTTPException(status_code=400, detail="Unsupported or corrupt image file.")

    try:
        opts = json.loads(options)
    except Exception:
        opts = {}

    try:
        result = await run_in_threadpool(
            process_photo,
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

        if current_user:
            try:
                job = ToolJob(
                    user_id=current_user.id,
                    tool_type="passport",
                    status="completed",
                    result_url=result.processed_image,
                )
                db.add(job)
                db.commit()
            except Exception:
                db.rollback()

        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@router.post("/detect-face", response_model=FaceDetectResponse)
async def detect_face_endpoint(file: UploadFile = File(...)):
    image_bytes = await file.read()
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Unsupported or corrupt image file.")
    
    faces = await run_in_threadpool(detect_faces, image)

    return {
        "success": True,
        "faces_detected": len(faces),
        "face_locations": [FaceLocation(**f) for f in faces],
    }


@router.post("/remove-background", response_model=BackgroundRemoveResponse)
@router.post("/ai/remove-background", response_model=BackgroundRemoveResponse)
async def remove_bg_endpoint(
    file: UploadFile = File(...),
    bg_color: Optional[str] = Form(default=None),
    background_color: Optional[str] = Form(default=None),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    image_bytes = await file.read()
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Unsupported or corrupt image file.")
    
    effective_bg = bg_color or background_color or "transparent"
    result = await run_in_threadpool(remove_background, image, bg_color=effective_bg)

    buffer = io.BytesIO()
    if effective_bg.lower() == "transparent":
        result.save(buffer, format="PNG")
    else:
        result.save(buffer, format="JPEG", quality=92)
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")

    if current_user:
        try:
            job = ToolJob(
                user_id=current_user.id,
                tool_type="remove-bg",
                status="completed",
                result_url=encoded,
            )
            db.add(job)
            db.commit()
        except Exception:
            db.rollback()

    return {"success": True, "processed_image": encoded}

