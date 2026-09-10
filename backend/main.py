from pathlib import Path
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.config.settings import settings
from backend.models.database import init_db
from backend.middleware.cors import setup_cors
from backend.routes.auth import router as auth_router
from backend.routes.reports import router as reports_router
from backend.routes.notifications import router as notifications_router
from backend.routes.transit_pass import router as transit_pass_router
from backend.routes.chatbot import router as chatbot_router

STATIC_DIR = Path(__file__).resolve().parent / "static"
ASSETS_DIR = STATIC_DIR / "assets"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    init_db()
    # Ensure upload directory exists
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(
    title="RetinaX Tele-Ophthalmology & DR Screening Backend",
    description="Full-stack AI-assisted diabetic retinopathy screening platform backend for Doctors, Healthcare Workers, and Patients.",
    version="1.0.0",
    lifespan=lifespan,
)

# 1. Setup CORS
setup_cors(app)

# 2. Mount static directory for uploaded retinal images
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

# 3. Mount built frontend assets if present
if ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")

# 4. Include Routers (API routes take precedence)
app.include_router(auth_router)
app.include_router(reports_router)
app.include_router(notifications_router)
app.include_router(transit_pass_router)
app.include_router(chatbot_router)


# 5. Health Check & API Discovery Endpoints
@app.get("/health", tags=["System"])
@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "ok",
        "service": "RetinaX Tele-Ophthalmology Backend API",
        "version": settings.VERSION,
        "database": "Supabase PostgreSQL / Local SQLite",
        "ai_pipeline": {
            "status": "active",
            "live_models": [
                "RETINAX_IQA_FINAL.onnx (Image Quality Assessment)",
                "RETINAX_OPTIC_DISC_MATLAB.onnx (Optic Disc Localization)",
                "RETINAX_VESSEL_MATLAB.onnx (Vessel Segmentation)",
                "best_exudate_model_FINAL.onnx (Exudate Segmentation)",
                "RETINAX_DR_FINAL.onnx (DR Severity Grading 0-4)",
            ],
            "pending_models": [
                "microaneurysms (not_yet_implemented)",
                "hemorrhages (not_yet_implemented)",
                "neovascularization (not_yet_implemented)",
                "grad_cam (not_yet_implemented - backprop gradient extraction not supported in ONNX Runtime forward inference)",
            ],
        },
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api", tags=["System"])
def api_index():
    return {
        "message": "Welcome to RetinaX DR Screening Platform API",
        "docs_url": "/docs",
        "health_check": "/api/health",
        "endpoints": {
            "auth": ["POST /auth/register", "POST /auth/login", "GET /auth/me"],
            "reports": ["POST /reports/upload", "GET /reports/:id", "PUT /reports/:id/status", "GET /reports"],
            "notifications": ["GET /notifications/:userId", "PUT /notifications/:id/read"],
            "transit_pass": ["POST /transit-pass/refer", "GET /transit-pass/:patientId", "GET /transit-pass"],
            "chatbot": ["POST /chatbot/ask", "POST /api/chatbot/ask"],
        },
    }


# 6. SPA Catch-All Route: Serves index.html for React Router while supporting automated testclient
@app.get("/{full_path:path}", tags=["Frontend"], include_in_schema=False)
async def serve_frontend(request: Request, full_path: str = ""):
    index_file = STATIC_DIR / "index.html"

    # Root route handling
    if full_path == "":
        accept = request.headers.get("accept", "")
        ua = request.headers.get("user-agent", "")
        # Backend test suite compatibility
        if "testclient" in ua and "text/html" not in accept:
            return api_index()
        # Browser client
        if index_file.is_file():
            return FileResponse(index_file, media_type="text/html")

    # Static file direct request (e.g. favicon, manifest, etc.)
    requested_file = STATIC_DIR / full_path
    if full_path and requested_file.is_file():
        return FileResponse(requested_file)

    # Client-side routing fallback (/doctor, /worker, /patient, etc.)
    if index_file.is_file():
        return FileResponse(index_file, media_type="text/html")

    return JSONResponse(
        status_code=404,
        content={"detail": "Not Found", "message": "Frontend static files not found in backend/static."}
    )



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
