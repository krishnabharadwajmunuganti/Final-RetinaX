from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.models.database import get_db
from backend.models.user import User
from backend.middleware.auth_middleware import get_current_user
from backend.controllers.notifications_controller import (
    get_user_notifications,
    mark_notification_read,
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/{userId}", response_model=List[dict])
def list_notifications(
    userId: str,
    unread_only: bool = Query(False, description="Filter only unread notifications"),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get notifications for a specific user.
    Strict Patient Isolation: Patients can only retrieve notifications addressed to them.
    """
    return get_user_notifications(
        db=db,
        current_user=current_user,
        user_id=userId,
        unread_only=unread_only,
        limit=limit,
    )


@router.put("/{id}/read")
def mark_as_read(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mark a notification as read.
    """
    return mark_notification_read(db=db, current_user=current_user, notification_id=id)
