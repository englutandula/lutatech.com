from fastapi import Header, HTTPException, status
from app.core.config import settings

async def verify_internal_secret(x_internal_secret: str = Header(None, alias="X-Internal-Secret")):
    """
    Ensure the incoming request originated from our authorized Laravel Backend Gateway.
    Direct unauthorized public access is rejected.
    """
    if not x_internal_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing internal authorization secret.",
        )
    if x_internal_secret != settings.internal_api_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid internal authorization secret.",
        )
    return True
