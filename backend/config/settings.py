import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root or backend folder
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = Path(__file__).resolve().parent.parent

# Load .env
if (BACKEND_DIR / ".env").exists():
    load_dotenv(BACKEND_DIR / ".env")
elif (ROOT_DIR / ".env").exists():
    load_dotenv(ROOT_DIR / ".env")
else:
    load_dotenv()


class Settings:
    PROJECT_NAME: str = "RetinaX Tele-Ophthalmology & DR Screening Backend"
    VERSION: str = "1.0.0"

    # Database: Supports Supabase PostgreSQL URL or local SQLite fallback
    # Example Supabase format: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./retinax.db")

    # JWT Authentication
    JWT_SECRET: str = os.getenv("JWT_SECRET", "retinax-super-secure-jwt-secret-key-sih-2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours

    # Image Storage & Upload Settings
    UPLOAD_DIR: Path = Path(os.getenv("UPLOAD_DIR", str(BACKEND_DIR / "uploads")))
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
    MAX_FILE_SIZE_BYTES: int = MAX_FILE_SIZE_MB * 1024 * 1024
    ALLOWED_IMAGE_EXTENSIONS: set = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"}
    ALLOWED_IMAGE_MIMES: set = {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/tiff",
        "image/x-png",
        "image/pjpeg",
    }
    STORAGE_TYPE: str = os.getenv("STORAGE_TYPE", "local")  # local or cloudinary

    # Server Base URL for serving uploaded image URLs
    BASE_URL: str = os.getenv("BASE_URL", "http://localhost:8000")

    # CORS configuration - strict explicit list, NO WILDCARDS to support allow_credentials=True
    _raw_origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000,http://localhost:8000",
    )
    CORS_ORIGINS: list = [origin.strip() for origin in _raw_origins.split(",") if origin.strip() and origin.strip() != "*"]


settings = Settings()
# Ensure upload directory exists
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
