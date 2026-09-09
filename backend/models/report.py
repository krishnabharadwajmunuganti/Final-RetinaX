import uuid
import json
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.models.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(64), primary_key=True, default=lambda: f"REP-{uuid.uuid4().hex[:8].upper()}")
    patient_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String(512), nullable=False)
    laterality = Column(String(32), default="Right Eye (OD)")
    ai_diagnosis_json = Column(Text, nullable=False)  # Serialized JSON object containing clinical breakdown
    severity = Column(String(32), nullable=False, default="none")  # 'none', 'mild', 'moderate', 'severe', 'proliferative'
    status = Column(String(32), nullable=False, default="pending")  # 'pending', 'reviewed', 'accepted'
    doctor_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    doctor_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    patient = relationship("User", foreign_keys=[patient_id], back_populates="reports_as_patient")
    doctor = relationship("User", foreign_keys=[doctor_id], back_populates="reports_as_doctor")
    notifications = relationship("Notification", back_populates="report", cascade="all, delete-orphan")

    @property
    def ai_diagnosis(self):
        try:
            return json.loads(self.ai_diagnosis_json) if self.ai_diagnosis_json else {}
        except Exception:
            return {"raw": self.ai_diagnosis_json}

    @ai_diagnosis.setter
    def ai_diagnosis(self, value):
        if isinstance(value, str):
            self.ai_diagnosis_json = value
        else:
            self.ai_diagnosis_json = json.dumps(value)

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "patient_name": self.patient.name if self.patient else None,
            "image_url": self.image_url,
            "laterality": self.laterality,
            "ai_diagnosis": self.ai_diagnosis,
            "severity": self.severity,
            "status": self.status,
            "doctor_id": self.doctor_id,
            "doctor_name": self.doctor.name if self.doctor else None,
            "doctor_notes": self.doctor_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
