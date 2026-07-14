"""
controllers/notification_controller.py
--------------------------------------
HTTP controller for handling notification endpoints.
Full CRUD with filtering, search, pagination, and summary.
"""

from flask import request
from flask_jwt_extended import get_jwt_identity

from services.notification_service import NotificationService, NotificationServiceError
from utils.response import success_response, error_response


def list_notifications() -> tuple:
    """GET /api/notifications"""
    try:
        user_id = int(get_jwt_identity())
        limit = request.args.get("limit", 20, type=int)
        offset = request.args.get("offset", 0, type=int)
        unread_only = request.args.get("unread_only", "").lower() == "true"
        read_only = request.args.get("read_only", "").lower() == "true"
        priority = request.args.get("priority")
        notification_type = request.args.get("type")
        search = request.args.get("search")
        sort = request.args.get("sort", "newest")
        date_filter = request.args.get("date_filter")

        result = NotificationService.get_user_notifications(
            user_id=user_id,
            limit=limit,
            offset=offset,
            unread_only=unread_only,
            read_only=read_only,
            priority=priority,
            notification_type=notification_type,
            search=search,
            sort=sort,
            date_filter=date_filter,
        )
        return success_response(
            data=result,
            message="Notifications fetched successfully."
        )
    except Exception as e:
        return error_response(f"Failed to fetch notifications: {str(e)}", 500)


def list_unread_notifications() -> tuple:
    """GET /api/notifications/unread"""
    try:
        user_id = int(get_jwt_identity())
        limit = request.args.get("limit", 20, type=int)
        result = NotificationService.get_user_notifications(
            user_id=user_id, limit=limit, unread_only=True
        )
        return success_response(
            data=result,
            message="Unread notifications fetched successfully."
        )
    except Exception as e:
        return error_response(f"Failed to fetch unread notifications: {str(e)}", 500)


def create_notification() -> tuple:
    """POST /api/notifications"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json(silent=True) or {}
        notification = NotificationService.create_notification(
            user_id=data.get("user_id", user_id),
            title=data.get("title"),
            message=data.get("message", ""),
            notification_type=data.get("type", "system_alert"),
            priority=data.get("priority", "normal"),
            related_project_id=data.get("related_project_id"),
            related_task_id=data.get("related_task_id"),
        )
        return success_response(
            data=notification.to_dict(),
            message="Notification created successfully.",
            status_code=201,
        )
    except NotificationServiceError as e:
        return error_response(e.message, e.http_status)
    except Exception as e:
        return error_response(f"Failed to create notification: {str(e)}", 500)


def get_unread_count() -> tuple:
    """GET /api/notifications/unread-count"""
    try:
        user_id = int(get_jwt_identity())
        count = NotificationService.get_unread_count(user_id)
        return success_response(data={"count": count}, message="Unread count fetched.")
    except Exception as e:
        return error_response(f"Failed to fetch unread count: {str(e)}", 500)


def get_summary() -> tuple:
    """GET /api/notifications/summary"""
    try:
        user_id = int(get_jwt_identity())
        summary = NotificationService.get_summary(user_id)
        return success_response(data=summary, message="Summary fetched.")
    except Exception as e:
        return error_response(f"Failed to fetch summary: {str(e)}", 500)


def get_recent_activities() -> tuple:
    """GET /api/notifications/activities"""
    try:
        user_id = int(get_jwt_identity())
        limit = request.args.get("limit", 10, type=int)
        activities = NotificationService.get_recent_activities(user_id, limit)
        return success_response(data=activities, message="Activities fetched.")
    except Exception as e:
        return error_response(f"Failed to fetch activities: {str(e)}", 500)


def mark_read(notification_id: int) -> tuple:
    """PUT /api/notifications/read/<id>"""
    try:
        user_id = int(get_jwt_identity())
        success = NotificationService.mark_as_read(notification_id, user_id)
        if not success:
            return error_response("Notification not found.", 404)
        return success_response(message="Notification marked as read.")
    except Exception as e:
        return error_response(f"Failed to update notification: {str(e)}", 500)


def mark_all_read() -> tuple:
    """PUT /api/notifications/read-all"""
    try:
        user_id = int(get_jwt_identity())
        count = NotificationService.mark_all_as_read(user_id)
        return success_response(
            data={"marked_count": count},
            message="All notifications marked as read."
        )
    except Exception as e:
        return error_response(f"Failed to mark all as read: {str(e)}", 500)


def delete_notification(notification_id: int) -> tuple:
    """DELETE /api/notifications/<id>"""
    try:
        user_id = int(get_jwt_identity())
        success = NotificationService.delete_notification(notification_id, user_id)
        if not success:
            return error_response("Notification not found.", 404)
        return success_response(message="Notification deleted successfully.")
    except Exception as e:
        return error_response(f"Failed to delete notification: {str(e)}", 500)