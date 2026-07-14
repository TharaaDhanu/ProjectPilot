"""
services/settings_service.py
-----------------------------
Business logic for the Settings module.
"""

from datetime import datetime, timezone
from extensions import db
from models.settings import Role, Permission, UserPreferences, SecuritySettings, NotificationPreference, LoginHistory
from models.user import User


class SettingsServiceError(Exception):
    def __init__(self, message: str, http_status: int = 400):
        super().__init__(message)
        self.message = message
        self.http_status = http_status


class SettingsService:
    # ------------------------------------------------------------------
    # Roles
    # ------------------------------------------------------------------
    @staticmethod
    def get_all_roles():
        return Role.query.all()

    @staticmethod
    def get_role_by_id(role_id: int):
        return Role.query.get(role_id)

    @staticmethod
    def create_role(name: str, description: str = None, is_system: bool = False):
        if Role.query.filter_by(name=name).first():
            raise SettingsServiceError(f"Role '{name}' already exists.", 409)
        role = Role(name=name, description=description, is_system=is_system)
        db.session.add(role)
        db.session.commit()
        return role

    @staticmethod
    def update_role(role_id: int, name: str = None, description: str = None):
        role = Role.query.get(role_id)
        if not role:
            raise SettingsServiceError("Role not found.", 404)
        if name and name != role.name:
            if Role.query.filter_by(name=name).first():
                raise SettingsServiceError(f"Role '{name}' already exists.", 409)
            role.name = name
        if description is not None:
            role.description = description
        db.session.commit()
        return role

    @staticmethod
    def delete_role(role_id: int):
        role = Role.query.get(role_id)
        if not role:
            raise SettingsServiceError("Role not found.", 404)
        if role.is_system:
            raise SettingsServiceError("Cannot delete system role.", 403)
        db.session.delete(role)
        db.session.commit()
        return True

    # ------------------------------------------------------------------
    # Permissions
    # ------------------------------------------------------------------
    @staticmethod
    def get_all_permissions():
        return Permission.query.all()

    @staticmethod
    def create_permission(name: str, module: str, action: str, description: str = None):
        if Permission.query.filter_by(name=name).first():
            raise SettingsServiceError(f"Permission '{name}' already exists.", 409)
        perm = Permission(name=name, module=module, action=action, description=description)
        db.session.add(perm)
        db.session.commit()
        return perm

    @staticmethod
    def assign_permission_to_role(role_id: int, permission_id: int):
        role = Role.query.get(role_id)
        perm = Permission.query.get(permission_id)
        if not role or not perm:
            raise SettingsServiceError("Role or Permission not found.", 404)
        if perm in role.permissions:
            raise SettingsServiceError("Permission already assigned to role.", 409)
        role.permissions.append(perm)
        db.session.commit()
        return role

    @staticmethod
    def remove_permission_from_role(role_id: int, permission_id: int):
        role = Role.query.get(role_id)
        perm = Permission.query.get(permission_id)
        if not role or not perm:
            raise SettingsServiceError("Role or Permission not found.", 404)
        if perm not in role.permissions:
            raise SettingsServiceError("Permission not assigned to role.", 404)
        role.permissions.remove(perm)
        db.session.commit()
        return role

    # ------------------------------------------------------------------
    # User Preferences
    # ------------------------------------------------------------------
    @staticmethod
    def get_user_preferences(user_id: int):
        prefs = UserPreferences.query.filter_by(user_id=user_id).first()
        if not prefs:
            prefs = UserPreferences(user_id=user_id)
            db.session.add(prefs)
            db.session.commit()
        return prefs

    @staticmethod
    def update_user_preferences(user_id: int, data: dict):
        prefs = SettingsService.get_user_preferences(user_id)
        allowed_fields = {
            "theme", "accent_color", "sidebar_style", "compact_mode",
            "animations_enabled", "font_size", "timezone", "language",
            "currency", "date_format", "time_format", "week_start",
        }
        for key, value in data.items():
            if key in allowed_fields and hasattr(prefs, key):
                setattr(prefs, key, value)
        db.session.commit()
        return prefs

    # ------------------------------------------------------------------
    # Security Settings
    # ------------------------------------------------------------------
    @staticmethod
    def get_security_settings(user_id: int):
        settings = SecuritySettings.query.filter_by(user_id=user_id).first()
        if not settings:
            settings = SecuritySettings(user_id=user_id)
            db.session.add(settings)
            db.session.commit()
        return settings

    @staticmethod
    def update_security_settings(user_id: int, data: dict):
        settings = SettingsService.get_security_settings(user_id)
        allowed_fields = {"two_factor_enabled", "login_notifications", "session_timeout_minutes"}
        for key, value in data.items():
            if key in allowed_fields and hasattr(settings, key):
                setattr(settings, key, value)
        db.session.commit()
        return settings

    @staticmethod
    def change_password(user_id: int, old_password: str, new_password: str):
        user = User.query.get(user_id)
        if not user:
            raise SettingsServiceError("User not found.", 404)
        if not user.check_password(old_password):
            raise SettingsServiceError("Current password is incorrect.", 401)
        if len(new_password) < 8:
            raise SettingsServiceError("New password must be at least 8 characters.", 422)
        user.set_password(new_password)
        db.session.commit()
        return True

    # ------------------------------------------------------------------
    # Notification Preferences
    # ------------------------------------------------------------------
    @staticmethod
    def get_notification_preferences(user_id: int):
        prefs = NotificationPreference.query.filter_by(user_id=user_id).first()
        if not prefs:
            prefs = NotificationPreference(user_id=user_id)
            db.session.add(prefs)
            db.session.commit()
        return prefs

    @staticmethod
    def update_notification_preferences(user_id: int, data: dict):
        prefs = SettingsService.get_notification_preferences(user_id)
        allowed_fields = {
            "email_enabled", "browser_enabled", "desktop_enabled",
            "task_reminders", "meeting_reminders", "deadline_reminders",
            "project_updates", "mention_alerts", "push_notifications", "muted",
        }
        for key, value in data.items():
            if key in allowed_fields and hasattr(prefs, key):
                setattr(prefs, key, value)
        db.session.commit()
        return prefs

    # ------------------------------------------------------------------
    # Login History
    # ------------------------------------------------------------------
    @staticmethod
    def get_login_history(user_id: int, limit: int = 20):
        return LoginHistory.query.filter_by(user_id=user_id).order_by(LoginHistory.login_at.desc()).limit(limit).all()

    @staticmethod
    def create_login_entry(user_id: int, ip_address: str = None, user_agent: str = None):
        entry = LoginHistory(user_id=user_id, ip_address=ip_address, user_agent=user_agent)
        db.session.add(entry)
        db.session.commit()
        return entry

    @staticmethod
    def logout_all_sessions(user_id: int):
        LoginHistory.query.filter_by(user_id=user_id, is_active=True).update({"is_active": False, "logged_out_at": datetime.now(timezone.utc)})
        db.session.commit()
        return True

    # ------------------------------------------------------------------
    # Profile
    # ------------------------------------------------------------------
    @staticmethod
    def update_profile(user_id: int, data: dict):
        user = User.query.get(user_id)
        if not user:
            raise SettingsServiceError("User not found.", 404)
        allowed_fields = {"name", "email", "phone", "department", "designation", "bio", "avatar"}
        for key, value in data.items():
            if key in allowed_fields and hasattr(user, key):
                setattr(user, key, value)
        db.session.commit()
        return user

    @staticmethod
    def delete_account(user_id: int):
        user = User.query.get(user_id)
        if not user:
            raise SettingsServiceError("User not found.", 404)
        db.session.delete(user)
        db.session.commit()
        return True

    # ------------------------------------------------------------------
    # System / About
    # ------------------------------------------------------------------
    @staticmethod
    def get_system_info():
        return {
            "version": "1.0.0",
            "environment": "production",
            "database": "MySQL (Aiven)",
            "storage_used": "2.4 GB",
            "health": "healthy",
        }