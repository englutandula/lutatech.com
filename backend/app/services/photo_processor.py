import base64
import io
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

from PIL import Image, ImageOps

from app.core.background_removal import remove_background
from app.core.cropping import auto_crop_passport, center_crop
from app.core.face_detection import get_primary_face
from app.core.image_enhancement import auto_enhance, enhance_image
from app.core.validator import compress_to_limit, validate_compliance
from app.data.photo_specs import get_spec

_executor = ThreadPoolExecutor(max_workers=2)


def process_photo(
    image_bytes: bytes,
    document_type: str,
    brightness: int = 50,
    contrast: int = 50,
    saturation: int = 50,
    remove_bg: bool = True,
    background_color: str | None = None,
    do_auto_enhance: bool = True,
    custom_width: int | float | None = None,
    custom_height: int | float | None = None,
    custom_unit: str = "mm",
) -> dict:
    start = time.time()

    if document_type == "CUSTOM_SIZE":
        w_raw = float(custom_width or 50)
        h_raw = float(custom_height or 50)
        
        if custom_unit == "px":
            w = w_raw * 25.4 / 300.0
            h = h_raw * 25.4 / 300.0
        elif custom_unit == "in":
            w = w_raw * 25.4
            h = h_raw * 25.4
        else:
            w = w_raw
            h = h_raw
            
        spec = {
            "name": f"Custom Size ({w_raw:g}{custom_unit} x {h_raw:g}{custom_unit})",
            "country": "Custom",
            "dimensions": {
                "width_px": int(w * 300 / 25.4),
                "height_px": int(h * 300 / 25.4),
                "width_mm": w,
                "height_mm": h,
                "dpi": 300,
            },
            "background": {
                "color": background_color or "#FFFFFF",
                "name": "Custom"
            },
            "face_requirements": {
                "head_height_percent": 0.70,
                "eye_level_percent": 0.60,
                "min_head_height_mm": h * 0.50,
                "max_head_height_mm": h * 0.85
            },
            "file_requirements": {
                "max_size_kb": 500,
                "formats": ["JPEG"],
                "color_mode": "RGB"
            },
            "rules": ["Custom photo size rules applied"]
        }
    else:
        spec = get_spec(document_type)
        if not spec:
            raise ValueError(f"Unknown document type: {document_type}")

    dims = spec["dimensions"]
    target_w = dims["width_px"]
    target_h = dims["height_px"]
    face_req = spec["face_requirements"]
    file_req = spec["file_requirements"]
    bg_color = background_color or spec["background"]["color"]

    image = Image.open(io.BytesIO(image_bytes))
    image = ImageOps.exif_transpose(image)
    image = image.convert("RGB")

    # Downscale oversized camera photos (>2048px) to speed up pipeline while retaining crisp 300 DPI passport resolution
    MAX_INPUT_DIM = 2048
    if max(image.size) > MAX_INPUT_DIM:
        image.thumbnail((MAX_INPUT_DIM, MAX_INPUT_DIM), Image.LANCZOS)

    if do_auto_enhance:
        image = auto_enhance(image)

    # Skip enhancement if all sliders are at their default (no-op)
    if not (brightness == 50 and contrast == 50 and saturation == 50):
        image = enhance_image(image, brightness=brightness, contrast=contrast, saturation=saturation)

    # ── Run face detection & background removal in parallel ────────────────
    face: dict | None = None
    bg_image: Image.Image | None = None

    def _detect():
        return get_primary_face(image)

    def _remove_bg():
        return remove_background(image, bg_color=bg_color) if remove_bg else None

    futures = {
        _executor.submit(_detect): "face",
        _executor.submit(_remove_bg): "bg",
    }
    for future in as_completed(futures):
        key = futures[future]
        if key == "face":
            face = future.result()
        else:
            bg_image = future.result()
    # ──────────────────────────────────────────────────────────────────────

    face_detected = face is not None
    face_confidence = face["confidence"] if face else 0.0

    bg_removed_encoded = None
    if remove_bg and bg_image is not None:
        image = bg_image
        buf = io.BytesIO()
        image.save(buf, format="JPEG", quality=92)
        bg_removed_encoded = base64.b64encode(buf.getvalue()).decode("utf-8")

    if face:
        image = auto_crop_passport(
            image,
            face=face,
            target_width=target_w,
            target_height=target_h,
            head_height_percent=face_req["head_height_percent"],
            eye_level_percent=face_req["eye_level_percent"],
            bg_color=bg_color,
        )
    else:
        image = center_crop(image, target_w, target_h, bg_color=bg_color)

    compliance = validate_compliance(image, spec)
    image_bytes_out, _ = compress_to_limit(image, file_req.get("max_size_kb", 500))

    encoded = base64.b64encode(image_bytes_out).decode("utf-8")
    elapsed_ms = round((time.time() - start) * 1000, 1)

    warnings = compliance["warnings"][:]
    if not face_detected:
        warnings.insert(0, "No face detected — image was center-cropped. Please upload a clear frontal photo.")
    elif face_confidence < 0.7:
        warnings.insert(0, "Low face detection confidence. Results may be less accurate.")

    del image, image_bytes_out
    if bg_image is not None:
        del bg_image
    import gc
    gc.collect()

    return {
        "success": True,
        "processed_image": encoded,
        "bg_removed_image": bg_removed_encoded,
        "metadata": {
            "detected_faces": 1 if face_detected else 0,
            "face_confidence": round(face_confidence, 3),
            "dimensions": compliance["dimensions"],
            "file_size_kb": compliance["file_size_kb"],
            "compliant": compliance["compliant"] and face_detected,
            "warnings": warnings,
            "document_type": document_type,
            "country": spec["country"],
            "document_name": spec["name"],
        },
        "processing_time_ms": elapsed_ms,
    }
