from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from app.core.config import settings
from app.api.routes import background_removal, photo_processing
from app.services.background_removal import get_rembg_session, process_background_removal

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-warm rembg ONNX session on startup so first request has 0 cold-start delay
    try:
        dummy = Image.new("RGB", (64, 64), (240, 240, 240))
        import io
        buf = io.BytesIO()
        dummy.save(buf, format="PNG")
        process_background_removal(buf.getvalue())
        print("✓ AI Neural Model pre-warmed successfully.")
    except Exception as e:
        print(f"Model pre-warm note: {e}")
    yield

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    lifespan=lifespan,
    docs_url="/docs" if settings.environment == "development" else None,
    redoc_url=None,
)

# CORS restricted - Gateway and application communication only
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://lutatech.com",
        "https://www.lutatech.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": "Luta Tech Python AI Microservice",
        "version": settings.version,
        "environment": settings.environment,
    }

# Mount AI routes under /api/v1
app.include_router(background_removal.router, prefix="/api/v1", tags=["Background Removal"])
app.include_router(photo_processing.router, prefix="/api/v1", tags=["Passport Photo Processing"])
