"""
routes/notification_routes.py
------------------------------
Flask Blueprint for Notification endpoints.
Full CRUD with filtering, search, pagination, and summary.

NOTE: Every Flask endpoint name must be unique. When multiple route()
decorators use the same view function, Flask auto-generates the same
endpoint name (blueprint.function_name) for each, causing AssertionError.
To avoid this, we combine HTTP methods on a single route() call wherever
possible, and use explicit 'endpoint' parameter when we genuinely need
the same function under different URL patterns.
"""

from flask import Blueprint
from flask_jwt_extended import jwt_required

from controllers.notification_controller import (
    list_notifications,
    list_unread_notifications,
    create_notification,
    get_unread_count,
    get_summary,
    get_recent_activities,
    mark_read,
    mark_all_read,
    delete_notification,
)

notification_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")

# ── GET endpoints ──────────────────────────────────────────────────────────────
notification_bp.route("", methods=["GET"])(jwt_required()(list_notifications))
notification_bp.route("/unread", methods=["GET"])(jwt_required()(list_unread_notifications))
notification_bp.route("/unread-count", methods=["GET"])(jwt_required()(get_unread_count))
notification_bp.route("/summary", methods=["GET"])(jwt_required()(get_summary))
notification_bp.route("/activities", methods=["GET"])(jwt_required()(get_recent_activities))

# ── POST endpoints ─────────────────────────────────────────────────────────────
notification_bp.route("", methods=["POST"])(jwt_required()(create_notification))

# ── Primary Mark-as-read routes ────────────────────────────────────────────────
# PUT + PATCH on the same URL pattern — single route, no duplicate endpoint.
notification_bp.route("/read/<int:notification_id>", methods=["PUT", "PATCH"])(
    jwt_required()(mark_read)
)

# PUT + POST on /read-all — single route, no duplicate endpoint.
notification_bp.route("/read-all", methods=["PUT", "POST"])(
    jwt_required()(mark_all_read)
)

# ── Backward-compatible routes (older frontend uses /<id>/read instead of /read/<id>) ──
# These share the same view function but differ in URL pattern, so they need
# explicit 'endpoint' names to avoid AssertionError.
notification_bp.route(
    "/<int:notification_id>/read", methods=["PATCH", "PUT"],
    endpoint="mark_read_by_id"
)(jwt_required()(mark_read))

# ── DELETE endpoint ────────────────────────────────────────────────────────────
notification_bp.route("/<int:notification_id>", methods=["DELETE"])(
    jwt_required()(delete_notification)
)