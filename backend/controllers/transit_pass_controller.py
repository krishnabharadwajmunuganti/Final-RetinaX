from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.models.transit_pass import TransitPass
from backend.models.user import User
from backend.models.notification import Notification
from backend.middleware.auth_middleware import verify_patient_isolation


def create_referral_transit_pass(
    db: Session,
    current_doctor: User,
    patient_id: str,
    referral_reason: str,
    target_hospital: Optional[str] = None,
    urgency: Optional[str] = "Routine",
) -> dict:
    """
    Doctor-only creation of hospital transit pass / referral.
    """
    if current_doctor.role != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only registered doctors are authorized to issue hospital transit passes.",
        )

    # Check target patient exists
    patient = db.query(User).filter(User.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target patient '{patient_id}' not found.",
        )

    clean_reason = referral_reason.strip()
    if not clean_reason:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A referral reason is required.",
        )

    hospital = target_hospital.strip() if target_hospital else "District Eye Hospital & Vitreoretinal Unit"
    urgency_val = urgency.strip().capitalize() if urgency else "Routine"
    if urgency_val not in ["Routine", "Standard", "Urgent"]:
        urgency_val = "Routine"

    new_pass = TransitPass(
        patient_id=patient_id,
        doctor_id=current_doctor.id,
        status="issued",
        referral_reason=clean_reason,
        target_hospital=hospital,
        urgency=urgency_val,
    )
    db.add(new_pass)
    db.commit()
    db.refresh(new_pass)

    # 1. Notify the patient
    patient_notif = Notification(
        user_id=patient_id,
        message=f"Hospital Transit Pass #{new_pass.id} issued by Dr. {current_doctor.name} for referral to {hospital}. Urgency: {urgency_val}.",
        type="referral_update",
    )
    db.add(patient_notif)

    # 2. Notify healthcare workers to coordinate transit
    workers = db.query(User).filter(User.role == "health_worker").all()
    for worker in workers:
        worker_notif = Notification(
            user_id=worker.id,
            message=f"New Transit Pass #{new_pass.id} for {patient.name} ({patient.id}). Please assist with hospital coordination.",
            type="referral_update",
        )
        db.add(worker_notif)

    db.commit()
    return new_pass.to_dict()


def get_transit_passes_for_patient(
    db: Session,
    current_user: User,
    patient_id: str,
) -> List[dict]:
    """
    Patient can only view their own transit pass (enforced by verify_patient_isolation).
    Doctors and healthcare workers can view passes for any patient.
    """
    verify_patient_isolation(current_user, patient_id)

    passes = (
        db.query(TransitPass)
        .filter(TransitPass.patient_id == patient_id)
        .order_by(TransitPass.created_at.desc())
        .all()
    )
    return [p.to_dict() for p in passes]


def list_all_transit_passes(
    db: Session,
    current_user: User,
    limit: int = 50,
) -> List[dict]:
    """Staff-only listing of all active transit passes in the system."""
    if current_user.role == "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Patients cannot view the global transit pass registry.",
        )

    passes = db.query(TransitPass).order_by(TransitPass.created_at.desc()).limit(limit).all()
    return [p.to_dict() for p in passes]
