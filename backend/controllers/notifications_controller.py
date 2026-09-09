from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.models.notification import Notification
from backend.models.user import User
from backend.middleware.auth_middleware import verify_patient_isolation


def get_user_notifications(
    db: Session,
    current_user: User,
    user_id: str,
    unread_only: bool = False,
    limit: int = 50,
) -> List[dict]:
    """
    Fetches notifications for a user.
    Enforces privacy:
    - A patient can ONLY fetch their own notifications (user_id == current_user.id).
    - Doctors & health workers can fetch their own or inspect clinical alerts.
    """
    verify_patient_isolation(current_user, user_id)

    query = db.query(Notification).filter(Notification.user_id == user_id)
    if unread_only:
        query = query.filter(Notification.is_read == False)

    notifs = query.order_by(Notification.created_at.desc()).limit(limit).all()
    return [n.to_dict() for n in notifs]


def mark_notification_read(
    db: Session,
    current_user: User,
    notification_id: str,
) -> dict:
    """Marks a notification as read. Ensures the notification belongs to the current user."""
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification '{notification_id}' not found.",
        )

    # Only recipient or staff can mark read
    if notif.user_id != current_user.id and current_user.role not in ["doctor", "health_worker"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify notifications belonging to another user.",
        )

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif.to_dict()
