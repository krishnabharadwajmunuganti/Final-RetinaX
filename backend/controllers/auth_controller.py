from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.models.user import User
from backend.middleware.auth_middleware import (
    hash_password,
    verify_password,
    create_access_token,
)

VALID_ROLES = {"patient", "doctor", "health_worker"}

ROLE_MAP = {
    "doctor": "doctor",
    "healthcare worker": "health_worker",
    "healthcare_worker": "health_worker",
    "health worker": "health_worker",
    "health_worker": "health_worker",
    "patient": "patient",
}


def normalize_role(role_raw: str) -> str:
    cleaned = role_raw.strip().lower()
    if cleaned in ROLE_MAP:
        return ROLE_MAP[cleaned]
    if cleaned in VALID_ROLES:
        return cleaned
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Invalid role '{role_raw}'. Must be one of: patient, doctor, health_worker",
    )


def register_user(
    db: Session,
    name: str,
    email: str,
    password: str,
    role: str,
    phone: Optional[str] = None,
    hospital_or_area: Optional[str] = None,
    custom_id: Optional[str] = None,
) -> dict:
    # Validate role
    canonical_role = normalize_role(role)

    # Validate email
    clean_email = email.strip().lower()
    if not clean_email or "@" not in clean_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid email address is required.",
        )

    # Check existing
    existing = db.query(User).filter(User.email == clean_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists.",
        )

    # Validate password length
    if len(password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long.",
        )

    pwd_hash = hash_password(password)

    new_user = User(
        name=name.strip(),
        email=clean_email,
        password_hash=pwd_hash,
        role=canonical_role,
        phone=phone.strip() if phone else None,
        hospital_or_area=hospital_or_area.strip() if hospital_or_area else None,
    )
    if custom_id:
        new_user.id = custom_id.strip()

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate token
    token = create_access_token(
        data={
            "sub": new_user.id,
            "email": new_user.email,
            "role": new_user.role,
            "name": new_user.name,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user.to_dict(),
    }


def login_user(db: Session, email: str, password: str) -> dict:
    identifier = email.strip()
    user = db.query(User).filter(
        (User.email == identifier.lower()) | (User.id == identifier)
    ).first()

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/ID or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(
        data={
            "sub": user.id,
            "email": user.email,
            "role": user.role,
            "name": user.name,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user.to_dict(),
    }


def get_registered_patients(db: Session) -> list:
    patients = db.query(User).filter(User.role == "patient").order_by(User.created_at.desc()).all()
    return [p.to_dict() for p in patients]
