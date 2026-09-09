from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config.settings import settings


def setup_cors(app: FastAPI) -> None:
    """
    Sets up CORS middleware with strict explicit origins.
    Wildcard '*' is strictly avoided to ensure compliance with credentials/cookies.
    """
    # Filter out any stray wildcards
    clean_origins = [origin for origin in settings.CORS_ORIGINS if origin != "*"]

    # Fallback to local frontend ports if empty
    if not clean_origins:
        clean_origins = [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
            "http://localhost:8000",
        ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=clean_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["Content-Range", "X-Total-Count"],
    )
