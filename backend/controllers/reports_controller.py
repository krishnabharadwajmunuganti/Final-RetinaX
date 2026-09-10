import os
import uuid
from pathlib import Path
from typing import Optional, List
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from backend.config.settings import settings
from backend.models.report import Report
from backend.models.user import User
from backend.models.notification import Notification
from backend.ai_model.inference import run_dr_inference
from backend.middleware.auth_middleware import verify_patient_isolation

# Known image magic headers
MAGIC_HEADERS = {
    b"\xff\xd8\xff": "jpeg",
    b"\x89PNG\r\n\x1a\n": "png",
    b"RIFF": "webp",  # WebP files start with RIFF
    b"II*\x00": "tiff",  # Little-endian TIFF
    b"MM\x00*": "tiff",  # Big-endian TIFF
}


def validate_image_file(file: UploadFile, content: bytes) -> None:
    """
    Validates uploaded file against MIME type, extension, size limit,
    and magic number bytes.
    """
    # 1. Size Validation
    file_size = len(content)
    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )
    if file_size > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB. Received: {round(file_size / (1024*1024), 2)}MB.",
        )

    # 2. Extension Validation
    ext = Path(file.filename or "").suffix.lower()
    if ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension '{ext}'. Allowed extensions: {list(settings.ALLOWED_IMAGE_EXTENSIONS)}",
        )

    # 3. MIME type Validation
    content_type = (file.content_type or "").lower()
    if content_type not in settings.ALLOWED_IMAGE_MIMES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid content type '{content_type}'. Must be a supported image MIME type.",
        )

    # 4. Magic bytes verification (header check)
    is_valid_magic = False
    for magic in MAGIC_HEADERS:
        if content.startswith(magic):
            is_valid_magic = True
            break
        # Special check for WebP: starts with RIFF and bytes 8..12 are WEBP
        if content.startswith(b"RIFF") and len(content) >= 12 and content[8:12] == b"WEBP":
            is_valid_magic = True
            break

    if not is_valid_magic:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File content does not match a recognized valid retinal image format.",
        )


def upload_and_process_report(
    db: Session,
    current_user: User,
    file: UploadFile,
    patient_id: str,
    laterality: Optional[str] = "Right Eye (OD)",
    simulated_severity: Optional[str] = None,
) -> dict:
    """
    1. Validates image file type and size.
    2. Enforces patient identity isolation (patient can only upload for themselves).
    3. Saves image to local storage.
    4. Runs AI diagnostic STUB inference.
    5. Saves report record and dispatches notifications.
    """
    # Verify patient target
    target_patient = db.query(User).filter(User.id == patient_id).first()
    if not target_patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target patient '{patient_id}' does not exist.",
        )

    # Privacy verification: patient can only upload for self
    verify_patient_isolation(current_user, patient_id)

    # Read and validate image content
    try:
        content = file.file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error reading upload stream: {str(e)}",
        )

    validate_image_file(file, content)

    # Save to disk
    ext = Path(file.filename or "retina.jpg").suffix.lower()
    unique_filename = f"scan_{uuid.uuid4().hex[:12]}{ext}"
    destination_path = settings.UPLOAD_DIR / unique_filename

    try:
        with open(destination_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to persist image to disk: {str(e)}",
        )

    # Image URL
    image_url = f"/uploads/{unique_filename}"

    # Execute AI model STUB inference
    try:
        ai_result = run_dr_inference(str(destination_path), simulated_severity=simulated_severity)
    except Exception as e:
        # Cleanup uploaded file on AI failure
        if destination_path.exists():
            destination_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI diagnostic inference failed: {str(e)}",
        )

    is_rejected = ai_result.get("status") == "rejected_poor_quality"
    severity = ai_result.get("severity", "none")
    report_status = "rejected_poor_quality" if is_rejected else "pending"

    # Create Report DB record
    new_report = Report(
        patient_id=patient_id,
        image_url=image_url,
        laterality=laterality or "Right Eye (OD)",
        severity=severity,
        status=report_status,
    )
    new_report.ai_diagnosis = ai_result

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    # Generate Notifications
    if is_rejected:
        # Quality recapture notification
        feedback_msg = ai_result.get("iqa", {}).get("feedback", "Image recapture required.")
        patient_notif = Notification(
            user_id=patient_id,
            message=f"Retinal scan ({laterality}) rejected due to poor image quality: {feedback_msg}",
            type="recapture_needed",
            related_report_id=new_report.id,
        )
        db.add(patient_notif)
    else:
        # 1. Notification for the patient
        patient_notif = Notification(
            user_id=patient_id,
            message=f"New retinal scan uploaded ({laterality}). Preliminary AI assessment: {ai_result.get('drClassification', {}).get('grade', 'Analyzed')}. Queued for doctor review.",
            type="review_needed",
            related_report_id=new_report.id,
        )
        db.add(patient_notif)

        # 2. If high risk, notify all doctors
        if severity in ["moderate", "severe", "proliferative"]:
            doctors = db.query(User).filter(User.role == "doctor").all()
            for doc in doctors:
                doc_notif = Notification(
                    user_id=doc.id,
                    message=f"URGENT: {ai_result.get('drClassification', {}).get('grade', 'High Risk')} detected for patient {target_patient.name} ({target_patient.id}). Review required.",
                    type="high_risk",
                    related_report_id=new_report.id,
                )
                db.add(doc_notif)

    db.commit()
    return new_report.to_dict()


def get_report_by_id(db: Session, current_user: User, report_id: str) -> dict:
    """
    Retrieve single report.
    CRITICAL ISOLATION:
    - If current_user is a 'patient', they can ONLY access their own report.
    - If doctor or health_worker, access is permitted.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID '{report_id}' was not found.",
        )

    # Enforce strict patient ID check
    verify_patient_isolation(current_user, report.patient_id)

    return report.to_dict()


def update_report_status(
    db: Session,
    current_user: User,
    report_id: str,
    new_status: str,
    doctor_notes: Optional[str] = None,
) -> dict:
    """
    Review workflow for Doctor / Health Worker.
    Updates report status and records doctor notes.
    """
    valid_statuses = {"pending", "reviewed", "accepted"}
    cleaned_status = new_status.strip().lower()
    if cleaned_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{new_status}'. Allowed values: {list(valid_statuses)}",
        )

    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID '{report_id}' was not found.",
        )

    report.status = cleaned_status
    if doctor_notes:
        report.doctor_notes = doctor_notes.strip()

    if current_user.role == "doctor":
        report.doctor_id = current_user.id

    db.commit()
    db.refresh(report)

    # Notify patient of clinical review outcome
    status_label = "reviewed" if cleaned_status == "reviewed" else "accepted and certified"
    patient_notif = Notification(
        user_id=report.patient_id,
        message=f"Your retinal screening report #{report.id} was {status_label} by {current_user.name}.",
        type="assessment_done",
        related_report_id=report.id,
    )
    db.add(patient_notif)
    db.commit()

    return report.to_dict()


def list_reports(
    db: Session,
    current_user: User,
    patient_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    severity_filter: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> List[dict]:
    """
    Lists reports.
    If current_user is a 'patient', MUST strictly force patient_id = current_user.id.
    """
    query = db.query(Report)

    if current_user.role == "patient":
        # Force strict patient isolation
        query = query.filter(Report.patient_id == current_user.id)
    else:
        if patient_id:
            query = query.filter(Report.patient_id == patient_id)

    if status_filter:
        query = query.filter(Report.status == status_filter.strip().lower())

    if severity_filter:
        query = query.filter(Report.severity == severity_filter.strip().lower())

    reports = query.order_by(Report.created_at.desc()).offset(offset).limit(limit).all()
    return [r.to_dict() for r in reports]
