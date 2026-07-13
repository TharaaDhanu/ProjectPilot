"""
services/notification_service.py
--------------------------------
Business logic for managing system notifications.
"""

from extensions import db
from models.notification import Notification


class NotificationService:
    @staticmethod
    def create_notification(user_id: int, message: str, notification_type: str) -> Notification:
        """Create a new notification for a specific user."""
        notification = Notification(
            user_id=user_id,
            message=message,
            type=notification_type,
            read=False
        )
        db.session.add(notification)
        db.session.commit()
        return notification

    @staticmethod
    def get_user_notifications(user_id: int, limit: int = 20) -> list[Notification]:
        """Fetch notifications for a user, ordered by newest first."""
        return Notification.query.filter_by(user_id=user_id)\
            .order_by(Notification.created_at.desc())\
            .limit(limit).all()

    @staticmethod
    def mark_all_as_read(user_id: int) -> None:
        """Mark all unread notifications for a user as read."""
        Notification.query.filter_by(user_id=user_id, read=False).update({"read": True})
        db.session.commit()

    @staticmethod
    def mark_as_read(notification_id: int, user_id: int) -> bool:
        """Mark a single notification as read."""
        notif = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
        if notif:
            notif.read = True
            db.session.commit()
            return True
        return False
