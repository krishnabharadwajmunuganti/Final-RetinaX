from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.models.database import get_db
from backend.models.user import User
from backend.middleware.auth_middleware import get_current_user, require_roles
from backend.controllers.transit_pass_controller import (
    create_referral_transit_pass,
    get_transit_passes_for_patient,
    list_all_transit_passes,
)

router = APIRouter(prefix="/transit-pass", tags=["Transit Pass & Referrals"])


class ReferPatientRequest(BaseModel):
    patient_id: str
    referral_reason: str
    target_hospital: Optional[str] = "District Eye Hospital & Vitreoretinal Unit"
    urgency: Optional[str] = "Routine"  # 'Routine', 'Standard', 'Urgent'


@router.post("/refer", status_code=201)
def refer_patient(
    req: ReferPatientRequest,
    current_user: User = Depends(require_roles(["doctor"])),
    db: Session = Depends(get_db),
):
    """
    Doctor-only endpoint: Issue a formal hospital referral transit pass for a patient.
    Automatically generates real-time notifications for the patient and health workers.
    """
    return create_referral_transit_pass(
        db=db,
        current_doctor=current_user,
        patient_id=req.patient_id,
        referral_reason=req.referral_reason,
        target_hospital=req.target_hospital,
        urgency=req.urgency,
    )


@router.get("/{patientId}", response_model=List[dict])
def get_patient_transit_passes(
    patientId: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    View all transit passes issued for a specific patient.
    Strict Patient Isolation: Patients can only view passes issued to themselves.
    Doctors and health workers can view any patient's transit pass.
    """
    return get_transit_passes_for_patient(
        db=db,
        current_user=current_user,
        patient_id=patientId,
    )


@router.get("", response_model=List[dict])
def get_all_transit_passes(
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_roles(["doctor", "health_worker"])),
    db: Session = Depends(get_db),
):
    """
    Staff-only endpoint: List all active transit passes across all patients.
    """
    return list_all_transit_passes(db=db, current_user=current_user, limit=limit)
