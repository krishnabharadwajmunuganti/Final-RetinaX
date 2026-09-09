"""
RetinaX Database Seeding Script
================================
Populates the database with real test credentials for all three portals:
- Doctor:        doctor@retinax.org / DoctorPass123!   (ID: DOC-9041)
- Health Worker: worker@retinax.org / WorkerPass123!   (ID: WRK-3082)
- Patient:       patient@retinax.org / PatientPass123! (ID: RX-104582)

Plus sample clinical report, notifications, and transit pass for immediate testing.
"""

from datetime import datetime
from backend.models.database import SessionLocal, init_db
from backend.models.user import User
from backend.models.report import Report
from backend.models.notification import Notification
from backend.models.transit_pass import TransitPass
from backend.middleware.auth_middleware import hash_password
from backend.ai_model.inference import get_mock_ai_report
from backend.config.settings import settings

# Minimal valid JPEG binary image (64x64 solid black) to serve as a valid test retinal scan
MINIMAL_VALID_JPEG = bytes([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
    0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
    0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
    0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x20,
    0x00, 0x20, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00,
    0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
    0x09, 0x0A, 0x0B, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F,
    0x00, 0xBF, 0xFF, 0xD9
])


def seed_database():
    print("-> Initializing tables...")
    init_db()
    db = SessionLocal()

    # Create uploads directory and sample scan
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    sample_scan_path = settings.UPLOAD_DIR / "sample_retina.jpg"
    with open(sample_scan_path, "wb") as f:
        f.write(MINIMAL_VALID_JPEG)
    print(f"-> Created sample retinal image at {sample_scan_path}")

    try:
        # 1. Seed Doctor
        doc_email = "doctor@retinax.org"
        doctor = db.query(User).filter(User.email == doc_email).first()
        if not doctor:
            doctor = User(
                id="DOC-9041",
                name="Dr. Alistair Vance",
                email=doc_email,
                password_hash=hash_password("DoctorPass123!"),
                role="doctor",
                phone="+1 (555) 432-8901",
                hospital_or_area="St. Jude Eye Institute Vitreoretinal Unit",
            )
            db.add(doctor)
            print(f"   [+] Seeded Doctor: {doc_email} (ID: DOC-9041)")
        else:
            print(f"   [*] Doctor already exists: {doc_email}")

        # 2. Seed Healthcare Worker
        worker_email = "worker@retinax.org"
        worker = db.query(User).filter(User.email == worker_email).first()
        if not worker:
            worker = User(
                id="WRK-3082",
                name="Sunita Sharma",
                email=worker_email,
                password_hash=hash_password("WorkerPass123!"),
                role="health_worker",
                phone="+1 (555) 789-2345",
                hospital_or_area="East Valley Primary Health Center",
            )
            db.add(worker)
            print(f"   [+] Seeded Health Worker: {worker_email} (ID: WRK-3082)")
        else:
            print(f"   [*] Health Worker already exists: {worker_email}")

        # 3. Seed Patient
        patient_email = "patient@retinax.org"
        patient = db.query(User).filter(User.email == patient_email).first()
        if not patient:
            patient = User(
                id="RX-104582",
                name="Eleanor Vance",
                email=patient_email,
                password_hash=hash_password("PatientPass123!"),
                role="patient",
                phone="+1 (555) 234-5678",
                hospital_or_area="East Valley District",
            )
            db.add(patient)
            print(f"   [+] Seeded Patient: {patient_email} (ID: RX-104582)")
        else:
            print(f"   [*] Patient already exists: {patient_email}")

        db.commit()

        # 4. Seed Sample Screening Report
        sample_report_id = "REP-104582"
        existing_report = db.query(Report).filter(Report.id == sample_report_id).first()
        if not existing_report:
            ai_diag = get_mock_ai_report("moderate")
            report = Report(
                id=sample_report_id,
                patient_id=patient.id,
                image_url="/uploads/sample_retina.jpg",
                laterality="Right Eye (OD)",
                severity="moderate",
                status="pending",
                doctor_id=None,
            )
            report.ai_diagnosis = ai_diag
            db.add(report)
            print(f"   [+] Seeded Sample Report: {sample_report_id}")
        else:
            print(f"   [*] Report already exists: {sample_report_id}")

        # 5. Seed Sample Transit Pass
        sample_pass_id = "PASS-2026-0042"
        existing_pass = db.query(TransitPass).filter(TransitPass.id == sample_pass_id).first()
        if not existing_pass:
            transit_pass = TransitPass(
                id=sample_pass_id,
                patient_id=patient.id,
                doctor_id=doctor.id,
                status="issued",
                referral_reason="Moderate NPDR with hard lipid exudates near macula requiring optical coherence tomography (OCT) and specialist review.",
                target_hospital="St. Jude Eye Institute Vitreoretinal Unit",
                urgency="Standard",
            )
            db.add(transit_pass)
            print(f"   [+] Seeded Sample Transit Pass: {sample_pass_id}")
        else:
            print(f"   [*] Transit Pass already exists: {sample_pass_id}")

        # 6. Seed Sample Notifications
        notifs_count = db.query(Notification).count()
        if notifs_count == 0:
            doc_notif = Notification(
                user_id=doctor.id,
                message="High Priority Screening Uploaded: Moderate NPDR with exudates detected for Eleanor Vance (RX-104582) awaiting clinical grading.",
                type="high_risk",
                related_report_id=sample_report_id,
            )
            pat_notif = Notification(
                user_id=patient.id,
                message="Your retinal screening report is pending review by Dr. Alistair Vance.",
                type="review_needed",
                related_report_id=sample_report_id,
            )
            worker_notif = Notification(
                user_id=worker.id,
                message="New Transit Pass issued for Eleanor Vance (RX-104582) to St. Jude Eye Institute. Please assist with community transport.",
                type="referral_update",
            )
            db.add_all([doc_notif, pat_notif, worker_notif])
            print("   [+] Seeded Initial Notifications for Doctor, Patient, and Worker")

        db.commit()
        print("\n Seeding completed successfully!")
        print("-" * 50)
        print("Ready test accounts:")
        print("1. Doctor:        doctor@retinax.org  / DoctorPass123!")
        print("2. Health Worker: worker@retinax.org  / WorkerPass123!")
        print("3. Patient:       patient@retinax.org / PatientPass123!")
        print("-" * 50)

    except Exception as e:
        db.rollback()
        print(f"❌ Seeding error: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
