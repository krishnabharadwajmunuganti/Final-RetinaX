from typing import Optional, List
from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from backend.models.database import get_db
from backend.models.user import User
from backend.controllers.auth_controller import (
    register_user,
    login_user,
    get_registered_patients,
)
from backend.middleware.auth_middleware import get_current_user, require_roles

router = APIRouter(prefix="/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # 'patient', 'doctor', 'health_worker'
    phone: Optional[str] = None
    hospital_or_area: Optional[str] = None
    custom_id: Optional[str] = None


class LoginRequest(BaseModel):
    email: str  # Accepts either email address or user ID (e.g. DOC-9041, WRK-3082, RX-104582)
    password: str


@router.post("/register", status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user (patient, doctor, or health_worker).
    Returns JWT token and user profile.
    """
    return register_user(
        db=db,
        name=req.name,
        email=req.email,
        password=req.password,
        role=req.role,
        phone=req.phone,
        hospital_or_area=req.hospital_or_area,
        custom_id=req.custom_id,
    )


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user using email or ID, and password.
    Returns JWT token and user profile.
    """
    return login_user(db=db, email=req.email, password=req.password)


@router.get("/me")
def get_authenticated_profile(current_user: User = Depends(get_current_user)):
    """
    Returns profile information of currently authenticated user.
    """
    return {"user": current_user.to_dict()}


@router.get("/patients", response_model=List[dict])
def list_patients(
    current_user: User = Depends(require_roles(["doctor", "health_worker"])),
    db: Session = Depends(get_db),
):
    """
    List all registered patients. Accessible by Doctor and Healthcare Worker staff.
    """
    return get_registered_patients(db=db)

