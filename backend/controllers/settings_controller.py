"""
controllers/settings_controller.py
------------------------------------
HTTP-layer handlers for Settings endpoints.
"""

from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required

from services.settings_service import SettingsService, SettingsServiceError
from utils.response import success_response, error_response


# ------------------------------------------------------------------
# Profile
# ------------------------------------------------------------------
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    from models.user import User
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found.", 404)
    return success_response(data=user.to_dict(), message="Profile fetched.")


@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    try:
        user = SettingsService.update_profile(user_id, data)
        return success_response(data=user.to_dict(), message="Profile updated.")
    except SettingsServiceError as exc:
        return error_response(exc.message, exc.http_status)


@jwt_required()
def delete_account():
    user_id = int(get_jwt_identity())
    try:
        SettingsService.delete_account(user_id)
        return success_response(message="Account deleted.")
    except SettingsServiceError as exc:
        return error_response(exc.message, exc.http_status)


# ------------------------------------------------------------------
# Preferences
# ------------------------------------------------------------------
@jwt_required()
def get_preferences():
    user_id = int(get_jwt_identity())
    prefs = SettingsService.get_user_preferences(user_id)
    return success_response(data=prefs.to_dict(), message="Preferences fetched.")


@jwt_required()
def update_preferences():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    prefs = SettingsService.update_user_preferences(user_id, data)
    return success_response(data=prefs.to_dict(), message="Preferences updated.")


# ------------------------------------------------------------------
# Security
# ------------------------------------------------------------------
@jwt_required()
def get_security():
    user_id = int(get_jwt_identity())
    settings = SettingsService.get_security_settings(user_id)
    return success_response(data=settings.to_dict(), message="Security settings fetched.")


@jwt_required()
def update_security():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    settings = SettingsService.update_security_settings(user_id, data)
    return success_response(data=settings.to_dict(), message="Security settings updated.")


@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    old_password = data.get("old_password", "")
    new_password = data.get("new_password", "")
    if not old_password or not new_password:
        return error_response("Old and new passwords are required.", 422)
    try:
        SettingsService.change_password(user_id, old_password, new_password)
        return success_response(message="Password changed successfully.")
    except SettingsServiceError as exc:
        return error_response(exc.message, exc.http_status)


@jwt_required()
def get_login_history():
    user_id = int(get_jwt_identity())
    limit = request.args.get("limit", 20, type=int)
    entries = SettingsService.get_login_history(user_id, limit)
    return success_response(data=[e.to_dict() for e in entries], message="Login history fetched.")


@jwt_required()
def logout_all_sessions():
    user_id = int(get_jwt_identity())
    SettingsService.logout_all_sessions(user_id)
    return success_response(message="All other sessions logged out.")


# ------------------------------------------------------------------
# Notification Preferences
# ------------------------------------------------------------------
@jwt_required()
def get_notification_preferences():
    user_id = int(get_jwt_identity())
    prefs = SettingsService.get_notification_preferences(user_id)
    return success_response(data=prefs.to_dict(), message="Notification preferences fetched.")


@jwt_required()
def update_notification_preferences():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    prefs = SettingsService.update_notification_preferences(user_id, data)
    return success_response(data=prefs.to_dict(), message="Notification preferences updated.")


# ------------------------------------------------------------------
# Roles & Permissions
# ------------------------------------------------------------------
@jwt_required()
def list_roles():
    roles = SettingsService.get_all_roles()
    return success_response(data=[r.to_dict() for r in roles], message="Roles fetched.")


@jwt_required()
def create_role():
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    description = data.get("description")
    is_system = data.get("is_system", False)
    if not name:
        return error_response("Role name is required.", 422)
    try:
        role = SettingsService.create_role(name, description, is_system)
        return success_response(data=role.to_dict(), message="Role created.", status_code=201)
    except SettingsServiceError as exc:
        return error_response(exc.message, exc.http_status)


@jwt_required()
def update_role(role_id: int):
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip() if data.get("name") else None
    description = data.get("description")
    try:
        role = SettingsService.update_role(role_id, name, description)
        return success_response(data=role.to_dict(), message="Role updated.")
    except SettingsServiceError as exc:
        return error_response(exc.message, exc.http_status)


@jwt_required()
def delete_role(role_id: int):
    try:
        SettingsService.delete_role(role_id)
        return success_response(message="Role deleted.")
    except SettingsServiceError as exc:
        return error_response(exc.message, exc.http_status)


@jwt_required()
def list_permissions():
    perms = SettingsService.get_all_permissions()
    return success_response(data=[p.to_dict() for p in perms], message="Permissions fetched.")


@jwt_required()
def create_permission():
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    module = data.get("module", "").strip()
    action = data.get("action", "").strip()
    description = data.get("description")
    if not name or not module or not action:
        return error_response("Name, module, and action are required.", 422)
    try:
        perm = SettingsService.create_permission(name, module, action, description)
        return success_response(data=perm.to_dict(), message="Permission created.", status_code=201)
    except SettingsServiceError as exc:
        return error_response(exc.message, exc.http_status)


@jwt_required()
def assign_permission():
    data = request.get_json(silent=True) or {}
    role_id = data.get("role_id")
    permission_id = data.get("permission_id")
    if not role_id or not permission_id:
        return error_response("role_id and permission_id are required.", 422)
    try:
        role = SettingsService.assign_permission_to_role(role_id, permission_id)
        return success_response(data=role.to_dict(), message="Permission assigned.")
    except SettingsServiceError as exc:
        return error_response(exc.message, exc.http_status)


@jwt_required()
def remove_permission():
    data = request.get_json(silent=True) or {}
    role_id = data.get("role_id")
    permission_id = data.get("permission_id")
    if not role_id or not permission_id:
        return error_response("role_id and permission_id are required.", 422)
    try:
        role = SettingsService.remove_permission_from_role(role_id, permission_id)
        return success_response(data=role.to_dict(), message="Permission removed.")
    except SettingsServiceError as exc:
        return error_response(exc.message, exc.http_status)


# ------------------------------------------------------------------
# System / About
# ------------------------------------------------------------------
@jwt_required()
def get_system_info():
    info = SettingsService.get_system_info()
    return success_response(data=info, message="System info fetched.")