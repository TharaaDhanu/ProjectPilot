"""
controllers/notification_controller.py
--------------------------------------
HTTP controller for handling notification endpoints.
"""

from flask import request
from flask_jwt_extended import get_jwt_identity

from services.notification_service import NotificationService
from utils.response import success_response, error_response


def list_notifications() -> tuple:
    """GET /api/notifications"""
    try:
        user_id = int(get_jwt_identity())
        limit = request.args.get("limit", 20, type=int)
        notifications = NotificationService.get_user_notifications(user_id, limit)
        return success_response(
            data=[n.to_dict() for n in notifications],
            message="Notifications fetched successfully."
        )
    except Exception as e:
        return error_response(f"Failed to fetch notifications: {str(e)}", 500)


def mark_read(notification_id: int) -> tuple:
    """PATCH /api/notifications/<notification_id>/read"""
    try:
        user_id = int(get_jwt_identity())
        success = NotificationService.mark_as_read(notification_id, user_id)
        if not success:
            return error_response("Notification not found.", 404)
        return success_response(message="Notification marked as read.")
    except Exception as e:
        return error_response(f"Failed to update notification: {str(e)}", 500)


def mark_all_read() -> tuple:
    """POST /api/notifications/read-all"""
    try:
        user_id = int(get_jwt_identity())
        NotificationService.mark_all_as_read(user_id)
        return success_response(message="All notifications marked as read.")
    except Exception as e:
        return error_response(f"Failed to mark all as read: {str(e)}", 500)
