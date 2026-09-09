from typing import Optional, List
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.models.database import get_db
from backend.models.user import User
from backend.middleware.auth_middleware import get_current_user, require_roles
from backend.controllers.reports_controller import (
    upload_and_process_report,
    get_report_by_id,
    update_report_status,
    list_reports,
)

router = APIRouter(prefix="/reports", tags=["Reports & Screening"])


class UpdateReportStatusRequest(BaseModel):
    status: str  # 'reviewed', 'accepted', 'pending'
    doctor_notes: Optional[str] = None


@router.post("/upload", status_code=201)
def upload_report(
    image: UploadFile = File(..., description="Retinal fundus image (JPEG, PNG, WebP, TIFF; max 10MB)"),
    patient_id: str = Form(..., description="Target patient ID (e.g. RX-104582)"),
    laterality: Optional[str] = Form("Right Eye (OD)", description="Laterality: 'Right Eye (OD)', 'Left Eye (OS)', or 'Both Eyes'"),
    simulated_severity: Optional[str] = Form(None, description="Optional STUB test override: 'none', 'mild', 'moderate', 'severe', 'proliferative'"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload a retinal fundus image, validate format/size, execute AI inference STUB,
    and persist diagnostic report with status 'pending'.
    Strict Patient Isolation: Patients can only upload for their own ID.
    """
    return upload_and_process_report(
        db=db,
        current_user=current_user,
        file=image,
        patient_id=patient_id,
        laterality=laterality,
        simulated_severity=simulated_severity,
    )


@router.get("/{id}")
def get_report(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get a single retinal screening report by ID.
    Strict Patient Isolation: Patients can only view their own reports.
    """
    return get_report_by_id(db=db, current_user=current_user, report_id=id)


@router.put("/{id}/status")
def update_status(
    id: str,
    req: UpdateReportStatusRequest,
    current_user: User = Depends(require_roles(["doctor", "health_worker"])),
    db: Session = Depends(get_db),
):
    """
    Review workflow: Update report status (e.g., 'reviewed', 'accepted')
    and add clinical doctor notes. Authorized for doctors and health workers only.
    """
    return update_report_status(
        db=db,
        current_user=current_user,
        report_id=id,
        new_status=req.status,
        doctor_notes=req.doctor_notes,
    )


@router.get("", response_model=List[dict])
def get_reports_list(
    patient_id: Optional[str] = Query(None, description="Filter by patient ID"),
    status: Optional[str] = Query(None, description="Filter by status ('pending', 'reviewed', 'accepted')"),
    severity: Optional[str] = Query(None, description="Filter by severity ('none', 'mild', 'moderate', 'severe', 'proliferative')"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List screening reports.
    Strict Patient Isolation: Patients only see their own reports.
    """
    return list_reports(
        db=db,
        current_user=current_user,
        patient_id=patient_id,
        status_filter=status,
        severity_filter=severity,
        limit=limit,
        offset=offset,
    )
