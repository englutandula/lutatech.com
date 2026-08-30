from PIL import Image
import io


def validate_compliance(image: Image.Image, spec: dict) -> dict:
    warnings = []
    file_req = spec.get("file_requirements", {})
    dims = spec.get("dimensions", {})

    w, h = image.size
    if w != dims.get("width_px") or h != dims.get("height_px"):
        warnings.append(f"Dimensions {w}x{h} differ from required {dims.get('width_px')}x{dims.get('height_px')}")

    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=85)
    size_kb = buffer.tell() / 1024
    max_kb = file_req.get("max_size_kb", 500)
    if size_kb > max_kb:
        warnings.append(f"File size {size_kb:.0f}KB exceeds maximum {max_kb}KB")

    return {
        "compliant": len(warnings) == 0,
        "warnings": warnings,
        "file_size_kb": round(size_kb, 1),
        "dimensions": {"width": w, "height": h},
    }


def compress_to_limit(image: Image.Image, max_size_kb: int = 500) -> tuple[bytes, int]:
    # Fast 1-shot encode for standard 600x600 passport photos (~70KB, well within 500KB)
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=92, dpi=(300, 300))
    if buffer.tell() <= max_size_kb * 1024:
        return buffer.getvalue(), 92
    
    # Adaptive step-down only if oversized
    for quality in (85, 75, 60, 45):
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=quality, dpi=(300, 300))
        if buffer.tell() <= max_size_kb * 1024:
            return buffer.getvalue(), quality
    return buffer.getvalue(), 45
