from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config.settings import settings


def setup_cors(app: FastAPI) -> None:
    """
    Sets up CORS middleware supporting explicit origins (localhost, custom domains)
    and regex patterns for Vercel/Netlify/Render deployments while maintaining
    strict compliance with allow_credentials=True.
    """
    # Standard local development origins
    default_local_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
    ]

    # Clean origins from settings
    clean_origins = [
        origin.rstrip("/")
        for origin in settings.CORS_ORIGINS
        if origin and origin != "*"
    ]

    # Combine ensuring local development always works
    for local_origin in default_local_origins:
        if local_origin not in clean_origins:
            clean_origins.append(local_origin)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=clean_origins,
        allow_origin_regex=r"^https://.*(\.vercel\.app|\.netlify\.app|\.onrender\.com)$",
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["Content-Range", "X-Total-Count"],
    )

