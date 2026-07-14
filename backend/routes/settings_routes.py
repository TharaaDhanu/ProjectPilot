"""
routes/settings_routes.py
--------------------------
Flask Blueprint for Settings endpoints.
"""

from flask import Blueprint
from flask_jwt_extended import jwt_required

from controllers.settings_controller import (
    # Profile
    get_profile,
    update_profile,
    delete_account,
    # Preferences
    get_preferences,
    update_preferences,
    # Security
    get_security,
    update_security,
    change_password,
    get_login_history,
    logout_all_sessions,
    # Notification Preferences
    get_notification_preferences,
    update_notification_preferences,
    # Roles & Permissions
    list_roles,
    create_role,
    update_role,
    delete_role,
    list_permissions,
    create_permission,
    assign_permission,
    remove_permission,
    # System
    get_system_info,
)

settings_bp = Blueprint("settings", __name__, url_prefix="/api/settings")

# ── Profile ───────────────────────────────────────────────────────────────────
settings_bp.route("/profile", methods=["GET"])(jwt_required()(get_profile))
settings_bp.route("/profile", methods=["PUT"])(jwt_required()(update_profile))
settings_bp.route("/profile", methods=["DELETE"])(jwt_required()(delete_account))

# ── Preferences ───────────────────────────────────────────────────────────────
settings_bp.route("/preferences", methods=["GET"])(jwt_required()(get_preferences))
settings_bp.route("/preferences", methods=["PUT"])(jwt_required()(update_preferences))

# ── Security ──────────────────────────────────────────────────────────────────
settings_bp.route("/security", methods=["GET"])(jwt_required()(get_security))
settings_bp.route("/security", methods=["PUT"])(jwt_required()(update_security))
settings_bp.route("/security/change-password", methods=["POST"])(jwt_required()(change_password))
settings_bp.route("/security/login-history", methods=["GET"])(jwt_required()(get_login_history))
settings_bp.route("/security/logout-all", methods=["POST"])(jwt_required()(logout_all_sessions))

# ── Notification Preferences ──────────────────────────────────────────────────
settings_bp.route("/notification-preferences", methods=["GET"])(jwt_required()(get_notification_preferences))
settings_bp.route("/notification-preferences", methods=["PUT"])(jwt_required()(update_notification_preferences))

# ── Roles & Permissions ───────────────────────────────────────────────────────
settings_bp.route("/roles", methods=["GET"])(jwt_required()(list_roles))
settings_bp.route("/roles", methods=["POST"])(jwt_required()(create_role))
settings_bp.route("/roles/<int:role_id>", methods=["PUT"])(jwt_required()(update_role))
settings_bp.route("/roles/<int:role_id>", methods=["DELETE"])(jwt_required()(delete_role))

settings_bp.route("/permissions", methods=["GET"])(jwt_required()(list_permissions))
settings_bp.route("/permissions", methods=["POST"])(jwt_required()(create_permission))
settings_bp.route("/permissions/assign", methods=["POST"])(jwt_required()(assign_permission))
settings_bp.route("/permissions/remove", methods=["POST"])(jwt_required()(remove_permission))

# ── System / About ────────────────────────────────────────────────────────────
settings_bp.route("/system", methods=["GET"])(jwt_required()(get_system_info))