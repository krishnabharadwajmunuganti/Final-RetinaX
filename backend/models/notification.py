import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.models.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(64), primary_key=True, default=lambda: f"NOTIF-{uuid.uuid4().hex[:8].upper()}")
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    message = Column(String(512), nullable=False)
    type = Column(String(64), nullable=False, default="review_needed")
    is_read = Column(Boolean, default=False, nullable=False)
    related_report_id = Column(String(64), ForeignKey("reports.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="notifications")
    report = relationship("Report", back_populates="notifications")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "message": self.message,
            "type": self.type,
            "is_read": self.is_read,
            "related_report_id": self.related_report_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
