"""
routes/notification_routes.py
------------------------------
Flask Blueprint for Notification endpoints.
"""

from flask import Blueprint
from flask_jwt_extended import jwt_required

from controllers.notification_controller import list_notifications, mark_read, mark_all_read

notification_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")

notification_bp.route("", methods=["GET"])(jwt_required()(list_notifications))
notification_bp.route("/read-all", methods=["POST"])(jwt_required()(mark_all_read))
notification_bp.route("/<int:notification_id>/read", methods=["PATCH"])(jwt_required()(mark_read))
