"""
services/notification_service.py
-------------------------------
Business logic for managing system notifications.
Supports full CRUD, filtering, search, pagination, and priority.
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any

from extensions import db
from models.notification import Notification
from models.project import Project
from models.task import Task

VALID_TYPES = {
    "project_created", "project_updated", "project_completed",
    "task_assigned", "task_updated", "task_completed",
    "employee_added", "employee_removed",
    "meeting_scheduled", "meeting_reminder",
    "deadline_reminder", "calendar_event", "system_alert"
}

VALID_PRIORITIES = {"low", "normal", "high", "critical"}
VALID_SORTS = {
    "newest": Notification.created_at.desc(),
    "oldest": Notification.created_at.asc(),
}


class NotificationServiceError(Exception):
    def __init__(self, message: str, http_status: int = 400) -> None:
        super().__init__(message)
        self.message = message
        self.http_status = http_status


class NotificationService:
    @staticmethod
    def create_notification(
        user_id: int,
        message: str,
        notification_type: str,
        title: Optional[str] = None,
        priority: str = "normal",
        related_project_id: Optional[int] = None,
        related_task_id: Optional[int] = None,
    ) -> Notification:
        """Create a new notification with full fields."""
        if notification_type and notification_type not in VALID_TYPES:
            raise NotificationServiceError(f"Invalid notification type: {notification_type}", 422)
        if priority not in VALID_PRIORITIES:
            raise NotificationServiceError(f"Invalid priority: {priority}", 422)

        notification = Notification(
            user_id=user_id,
            title=title or "",
            message=message,
            type=notification_type or "system_alert",
            priority=priority,
            is_read=False,
            related_project_id=related_project_id,
            related_task_id=related_task_id,
        )
        db.session.add(notification)
        db.session.commit()
        db.session.refresh(notification)
        return notification

    @staticmethod
    def get_user_notifications(
        user_id: int,
        limit: int = 20,
        offset: int = 0,
        unread_only: bool = False,
        read_only: bool = False,
        priority: Optional[str] = None,
        notification_type: Optional[str] = None,
        search: Optional[str] = None,
        sort: str = "newest",
        date_filter: Optional[str] = None,  # "today", "this_week"
    ) -> Dict[str, Any]:
        """Fetch notifications with advanced filtering, search, and pagination."""
        query = Notification.query.filter_by(user_id=user_id)

        if unread_only:
            query = query.filter(Notification.is_read == False)
        if read_only:
            query = query.filter(Notification.is_read == True)
        if priority and priority in VALID_PRIORITIES:
            query = query.filter(Notification.priority == priority)
        if notification_type and notification_type in VALID_TYPES:
            query = query.filter(Notification.type == notification_type)

        # Date filters
        now = datetime.now(timezone.utc)
        if date_filter == "today":
            start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
            query = query.filter(Notification.created_at >= start_of_day)
        elif date_filter == "this_week":
            start_of_week = now.replace(hour=0, minute=0, second=0, microsecond=0)
            start_of_week = start_of_week.replace(day=start_of_week.day - start_of_week.weekday())
            query = query.filter(Notification.created_at >= start_of_week)

        # Search in title, message, project, task
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.outerjoin(Project, Notification.related_project_id == Project.id) \
                         .outerjoin(Task, Notification.related_task_id == Task.id) \
                         .filter(
                db.or_(
                    Notification.title.ilike(term),
                    Notification.message.ilike(term),
                    Project.title.ilike(term),
                    Task.title.ilike(term),
                )
            )

        # Sorting
        order_col = VALID_SORTS.get(sort, Notification.created_at.desc())
        query = query.order_by(order_col)

        # Count total before pagination
        total = query.count()

        # Paginate
        notifications = query.offset(offset).limit(limit).all()

        return {
            "notifications": [n.to_dict() for n in notifications],
            "total": total,
            "limit": limit,
            "offset": offset,
        }

    @staticmethod
    def get_unread_count(user_id: int) -> int:
        """Get count of unread notifications for badge."""
        return Notification.query.filter_by(user_id=user_id, is_read=False).count()

    @staticmethod
    def get_summary(user_id: int) -> Dict[str, Any]:
        """Get summary statistics for the notifications page."""
        total = Notification.query.filter_by(user_id=user_id).count()
        unread = Notification.query.filter_by(user_id=user_id, is_read=False).count()

        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

        high_priority = Notification.query.filter_by(
            user_id=user_id, priority="high", is_read=False
        ).count()

        critical_priority = Notification.query.filter_by(
            user_id=user_id, priority="critical", is_read=False
        ).count()

        todays_count = Notification.query.filter(
            Notification.user_id == user_id,
            Notification.created_at >= today_start
        ).count()

        return {
            "total": total,
            "unread": unread,
            "high_priority": high_priority + critical_priority,
            "todays_count": todays_count,
        }

    @staticmethod
    def mark_as_read(notification_id: int, user_id: int) -> bool:
        """Mark a single notification as read."""
        notif = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
        if notif:
            notif.is_read = True
            db.session.commit()
            return True
        return False

    @staticmethod
    def mark_all_as_read(user_id: int) -> int:
        """Mark all unread notifications as read. Returns count updated."""
        count = Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
        db.session.commit()
        return count

    @staticmethod
    def delete_notification(notification_id: int, user_id: int) -> bool:
        """Delete a single notification."""
        notif = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
        if notif:
            db.session.delete(notif)
            db.session.commit()
            return True
        return False

    @staticmethod
    def get_recent_activities(user_id: int, limit: int = 10) -> list:
        """Get recent notifications for the activity timeline."""
        notifications = Notification.query.filter_by(user_id=user_id) \
            .order_by(Notification.created_at.desc()) \
            .limit(limit).all()
        return [n.to_dict() for n in notifications]