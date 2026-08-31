import os
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import health, process, requirements, auth, jobs
from app.config import settings
from app.database import engine
import app.models.db_models as db_models  # noqa: F401 — registers all models

from contextlib import asynccontextmanager
from app.core.background_removal import remove_background
from app.core.face_detection import get_primary_face
from PIL import Image


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all DB tables if they don't exist
    db_models.Base.metadata.create_all(bind=engine)

    # Pre-warm AI models so first user request is fast
    try:
        dummy = Image.new("RGB", (160, 160), (200, 200, 200))
        get_primary_face(dummy)
        remove_background(dummy)
    except Exception as e:
        print(f"Pre-warm notice: {e}")
    yield


app = FastAPI(title=settings.app_name, version=settings.version, lifespan=lifespan)

# 1. Security Headers Middleware (OWASP recommended defense-in-depth)
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(self), microphone=(), geolocation=()"
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    return response

# 2. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if settings.cors_origins != ["*"] else ["*"],
    allow_origin_regex=r"https?://.*" if settings.cors_origins == ["*"] else None,
    allow_credentials=True if settings.cors_origins != ["*"] else False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(requirements.router, prefix="/api", tags=["requirements"])
app.include_router(process.router, prefix="/api", tags=["process"])
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(jobs.router, prefix="/api", tags=["jobs"])

# Mount static build of Next.js frontend if available
frontend_build_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/out"))
if os.path.exists(frontend_build_dir):
    next_static_dir = os.path.join(frontend_build_dir, "_next")
    if os.path.exists(next_static_dir):
        app.mount("/_next", StaticFiles(directory=next_static_dir), name="next_static")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(request: Request, full_path: str = ""):
        if full_path.startswith("api"):
            return Response(status_code=404)

        clean = full_path.strip("/")
        
        # 1. Exact static file (e.g. icon.png, logo.png, robots.txt)
        if clean:
            file_path = os.path.join(frontend_build_dir, clean)
            if os.path.isfile(file_path):
                return FileResponse(file_path)

        # 2. Directory index (e.g. tools/passport -> tools/passport/index.html)
        dir_index = os.path.join(frontend_build_dir, clean, "index.html")
        if os.path.isfile(dir_index):
            return FileResponse(dir_index)

        # 3. HTML file match (e.g. tools/passport.html)
        html_file = os.path.join(frontend_build_dir, f"{clean}.html")
        if os.path.isfile(html_file):
            return FileResponse(html_file)

        # 4. SPA root fallback
        root_index = os.path.join(frontend_build_dir, "index.html")
        if os.path.isfile(root_index):
            return FileResponse(root_index)

        return Response(status_code=404)
