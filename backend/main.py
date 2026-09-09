from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from backend.config.settings import settings
from backend.models.database import init_db
from backend.middleware.cors import setup_cors
from backend.routes.auth import router as auth_router
from backend.routes.reports import router as reports_router
from backend.routes.notifications import router as notifications_router
from backend.routes.transit_pass import router as transit_pass_router


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

# 1. Setup CORS with strict explicit origins (NO wildcard * for credentials compliance)
setup_cors(app)

# 2. Mount static directory for uploaded retinal images
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

# 3. Include Routers
app.include_router(auth_router)
app.include_router(reports_router)
app.include_router(notifications_router)
app.include_router(transit_pass_router)


# 4. Health Check Endpoints
@app.get("/health", tags=["System"])
@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "ok",
        "service": "RetinaX Tele-Ophthalmology Backend API",
        "version": settings.VERSION,
        "database": "Supabase PostgreSQL / Local SQLite",
        "ai_model": "DR Clinical Diagnostic Engine (Active Stub)",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/", tags=["System"])
def root():
    return {
        "message": "Welcome to RetinaX DR Screening Platform API",
        "docs_url": "/docs",
        "health_check": "/api/health",
        "endpoints": {
            "auth": ["POST /auth/register", "POST /auth/login", "GET /auth/me"],
            "reports": ["POST /reports/upload", "GET /reports/:id", "PUT /reports/:id/status", "GET /reports"],
            "notifications": ["GET /notifications/:userId", "PUT /notifications/:id/read"],
            "transit_pass": ["POST /transit-pass/refer", "GET /transit-pass/:patientId", "GET /transit-pass"],
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
