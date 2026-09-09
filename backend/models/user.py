import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from backend.models.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(128), nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    role = Column(String(32), nullable=False)  # 'patient', 'doctor', 'health_worker'
    phone = Column(String(32), nullable=True)
    hospital_or_area = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    reports_as_patient = relationship(
        "Report",
        back_populates="patient",
        foreign_keys="Report.patient_id",
        cascade="all, delete-orphan",
    )
    reports_as_doctor = relationship(
        "Report",
        back_populates="doctor",
        foreign_keys="Report.doctor_id",
    )
    notifications = relationship(
        "Notification",
        back_populates="user",
        foreign_keys="Notification.user_id",
        cascade="all, delete-orphan",
    )
    transit_passes_as_patient = relationship(
        "TransitPass",
        back_populates="patient",
        foreign_keys="TransitPass.patient_id",
        cascade="all, delete-orphan",
    )
    transit_passes_as_doctor = relationship(
        "TransitPass",
        back_populates="doctor",
        foreign_keys="TransitPass.doctor_id",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "phone": self.phone,
            "hospital_or_area": self.hospital_or_area,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
