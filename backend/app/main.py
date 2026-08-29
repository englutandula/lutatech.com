import os
import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

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
    allow_origins=["*"],
    allow_origin_regex=r"https?://.*",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(requirements.router, prefix="/api", tags=["requirements"])
app.include_router(process.router, prefix="/api", tags=["process"])

# Mount static build of Next.js frontend if available
frontend_build_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/out"))
if os.path.exists(frontend_build_dir):
    @app.middleware("http")
    async def spa_fallback_middleware(request: Request, call_next):
        response = await call_next(request)
        if response.status_code == 404 and not request.url.path.startswith("/api"):
            clean_path = request.url.path.strip("/")
            candidate_html = os.path.join(frontend_build_dir, f"{clean_path}.html")
            candidate_dir_index = os.path.join(frontend_build_dir, clean_path, "index.html")
            if clean_path and os.path.exists(candidate_html):
                return FileResponse(candidate_html)
            elif clean_path and os.path.exists(candidate_dir_index):
                return FileResponse(candidate_dir_index)
            index_path = os.path.join(frontend_build_dir, "index.html")
            if os.path.exists(index_path):
                return FileResponse(index_path)
        return response

    app.mount("/", StaticFiles(directory=frontend_build_dir, html=True), name="frontend")
