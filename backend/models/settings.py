"""
models/settings.py
------------------
SQLAlchemy models for the Settings module.

Models
------
- Role
- Permission
- UserPreferences
- SecuritySettings
- NotificationPreference
- LoginHistory
"""

from datetime import datetime, timezone
from extensions import db


# ---------------------------------------------------------------------------
# Role & Permission (many-to-many)
# ---------------------------------------------------------------------------
role_permissions = db.Table(
    "role_permissions",
    db.Column("role_id", db.Integer, db.ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    db.Column("permission_id", db.Integer, db.ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
)


class Role(db.Model):
    __tablename__ = "roles"

    id: int = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name: str = db.Column(db.String(50), unique=True, nullable=False)
    description: str = db.Column(db.String(255), nullable=True)
    is_system: bool = db.Column(db.Boolean, nullable=False, default=False)
    created_at: datetime = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: datetime = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    permissions = db.relationship("Permission", secondary=role_permissions, backref=db.backref("roles", lazy="select"))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "is_system": self.is_system,
            "permissions": [p.to_dict() for p in self.permissions],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Permission(db.Model):
    __tablename__ = "permissions"

    id: int = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name: str = db.Column(db.String(100), unique=True, nullable=False)
    module: str = db.Column(db.String(50), nullable=False)
    action: str = db.Column(db.String(50), nullable=False)
    description: str = db.Column(db.String(255), nullable=True)
    created_at: datetime = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "module": self.module,
            "action": self.action,
            "description": self.description,
        }


# ---------------------------------------------------------------------------
# UserPreferences
# ---------------------------------------------------------------------------
class UserPreferences(db.Model):
    __tablename__ = "user_preferences"

    id: int = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id: int = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    # Appearance
    theme: str = db.Column(db.String(20), nullable=False, default="dark")
    accent_color: str = db.Column(db.String(20), nullable=False, default="#8b5cf6")
    sidebar_style: str = db.Column(db.String(20), nullable=False, default="expanded")
    compact_mode: bool = db.Column(db.Boolean, nullable=False, default=False)
    animations_enabled: bool = db.Column(db.Boolean, nullable=False, default=True)
    font_size: str = db.Column(db.String(20), nullable=False, default="medium")

    # General
    timezone: str = db.Column(db.String(50), nullable=False, default="UTC")
    language: str = db.Column(db.String(10), nullable=False, default="en")
    currency: str = db.Column(db.String(10), nullable=False, default="USD")
    date_format: str = db.Column(db.String(20), nullable=False, default="MM/DD/YYYY")
    time_format: str = db.Column(db.String(10), nullable=False, default="12h")
    week_start: str = db.Column(db.String(10), nullable=False, default="monday")

    created_at: datetime = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: datetime = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = db.relationship("User", backref=db.backref("preferences", uselist=False, cascade="all, delete-orphan"))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "theme": self.theme,
            "accent_color": self.accent_color,
            "sidebar_style": self.sidebar_style,
            "compact_mode": self.compact_mode,
            "animations_enabled": self.animations_enabled,
            "font_size": self.font_size,
            "timezone": self.timezone,
            "language": self.language,
            "currency": self.currency,
            "date_format": self.date_format,
            "time_format": self.time_format,
            "week_start": self.week_start,
        }


# ---------------------------------------------------------------------------
# SecuritySettings
# ---------------------------------------------------------------------------
class SecuritySettings(db.Model):
    __tablename__ = "security_settings"

    id: int = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id: int = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    two_factor_enabled: bool = db.Column(db.Boolean, nullable=False, default=False)
    two_factor_secret: str = db.Column(db.String(255), nullable=True)
    login_notifications: bool = db.Column(db.Boolean, nullable=False, default=True)
    session_timeout_minutes: int = db.Column(db.Integer, nullable=False, default=60)
    created_at: datetime = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: datetime = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = db.relationship("User", backref=db.backref("security_settings", uselist=False, cascade="all, delete-orphan"))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "two_factor_enabled": self.two_factor_enabled,
            "login_notifications": self.login_notifications,
            "session_timeout_minutes": self.session_timeout_minutes,
        }


# ---------------------------------------------------------------------------
# NotificationPreference
# ---------------------------------------------------------------------------
class NotificationPreference(db.Model):
    __tablename__ = "notification_preferences"

    id: int = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id: int = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    email_enabled: bool = db.Column(db.Boolean, nullable=False, default=True)
    browser_enabled: bool = db.Column(db.Boolean, nullable=False, default=True)
    desktop_enabled: bool = db.Column(db.Boolean, nullable=False, default=False)
    task_reminders: bool = db.Column(db.Boolean, nullable=False, default=True)
    meeting_reminders: bool = db.Column(db.Boolean, nullable=False, default=True)
    deadline_reminders: bool = db.Column(db.Boolean, nullable=False, default=True)
    project_updates: bool = db.Column(db.Boolean, nullable=False, default=True)
    mention_alerts: bool = db.Column(db.Boolean, nullable=False, default=True)
    push_notifications: bool = db.Column(db.Boolean, nullable=False, default=False)
    muted: bool = db.Column(db.Boolean, nullable=False, default=False)
    created_at: datetime = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: datetime = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = db.relationship("User", backref=db.backref("notification_preferences", uselist=False, cascade="all, delete-orphan"))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "email_enabled": self.email_enabled,
            "browser_enabled": self.browser_enabled,
            "desktop_enabled": self.desktop_enabled,
            "task_reminders": self.task_reminders,
            "meeting_reminders": self.meeting_reminders,
            "deadline_reminders": self.deadline_reminders,
            "project_updates": self.project_updates,
            "mention_alerts": self.mention_alerts,
            "push_notifications": self.push_notifications,
            "muted": self.muted,
        }


# ---------------------------------------------------------------------------
# LoginHistory
# ---------------------------------------------------------------------------
class LoginHistory(db.Model):
    __tablename__ = "login_history"

    id: int = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id: int = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ip_address: str = db.Column(db.String(45), nullable=True)
    user_agent: str = db.Column(db.String(255), nullable=True)
    location: str = db.Column(db.String(100), nullable=True)
    device: str = db.Column(db.String(100), nullable=True)
    browser: str = db.Column(db.String(100), nullable=True)
    os: str = db.Column(db.String(100), nullable=True)
    login_at: datetime = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    logged_out_at: datetime = db.Column(db.DateTime(timezone=True), nullable=True)
    is_active: bool = db.Column(db.Boolean, nullable=False, default=True)

    user = db.relationship("User", backref=db.backref("login_history", lazy="select"))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "location": self.location,
            "device": self.device,
            "browser": self.browser,
            "os": self.os,
            "login_at": self.login_at.isoformat() if self.login_at else None,
            "logged_out_at": self.logged_out_at.isoformat() if self.logged_out_at else None,
            "is_active": self.is_active,
        }