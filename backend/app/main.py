import os
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import health, process, requirements
from app.config import settings

app = FastAPI(title=settings.app_name, version=settings.version)

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
