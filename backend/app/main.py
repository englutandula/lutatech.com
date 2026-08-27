import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health, process, requirements
from app.config import settings


def _prewarm():
    """Load AI models in background so first request is fast."""
    try:
        from app.core.background_removal import _get_session
        from app.core.face_detection import _get_mp_detector
        _get_mp_detector()
        _get_session()
        print("✅ AI models pre-warmed and ready.")
    except Exception as e:
        print(f"⚠️  Model pre-warm failed: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    threading.Thread(target=_prewarm, daemon=True).start()
    yield


app = FastAPI(title=settings.app_name, version=settings.version, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(requirements.router, prefix="/api", tags=["requirements"])
app.include_router(process.router, prefix="/api", tags=["process"])

import os
from fastapi.staticfiles import StaticFiles
frontend_build_dir = os.path.join(os.path.dirname(__file__), "../../frontend/out")
if os.path.exists(frontend_build_dir):
    app.mount("/", StaticFiles(directory=frontend_build_dir, html=True), name="frontend")
