import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.models.database import Base


class TransitPass(Base):
    __tablename__ = "transit_passes"

    id = Column(String(64), primary_key=True, default=lambda: f"PASS-{uuid.uuid4().hex[:8].upper()}")
    patient_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(32), default="issued", nullable=False)  # 'issued', 'appointment_booked', 'visit_completed', 'closed'
    referral_reason = Column(Text, nullable=False)
    target_hospital = Column(String(256), nullable=False, default="District Eye Hospital & Vitreoretinal Unit")
    urgency = Column(String(32), nullable=False, default="Routine")  # 'Routine', 'Standard', 'Urgent'
    issued_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    patient = relationship("User", foreign_keys=[patient_id], back_populates="transit_passes_as_patient")
    doctor = relationship("User", foreign_keys=[doctor_id], back_populates="transit_passes_as_doctor")

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "patient_name": self.patient.name if self.patient else None,
            "doctor_id": self.doctor_id,
            "doctor_name": self.doctor.name if self.doctor else None,
            "status": self.status,
            "referral_reason": self.referral_reason,
            "target_hospital": self.target_hospital,
            "urgency": self.urgency,
            "issued_date": self.issued_date.isoformat() if self.issued_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
