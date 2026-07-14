"""
models/notification.py
---------------------
SQLAlchemy Notification model for ProjectPilot.
Enhanced with title, priority, and related entity fields.
"""

from datetime import datetime, timezone
from extensions import db


class Notification(db.Model):
    __tablename__ = "notifications"

    id: int = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title: str = db.Column(db.String(200), nullable=True, default="")
    message: str = db.Column(db.Text, nullable=False)
    type: str = db.Column(db.String(50), nullable=False, index=True)
    priority: str = db.Column(db.String(20), nullable=False, default="normal", index=True)
    is_read: bool = db.Column(db.Boolean, nullable=False, default=False, index=True)
    created_at: datetime = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )
    user_id: int = db.Column(
        db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    related_project_id: int = db.Column(
        db.Integer, db.ForeignKey("projects.id", ondelete="SET NULL"),
        nullable=True, index=True
    )
    related_task_id: int = db.Column(
        db.Integer, db.ForeignKey("tasks.id", ondelete="SET NULL"),
        nullable=True, index=True
    )

    # Relationships
    user = db.relationship("User", backref=db.backref("notifications", cascade="all, delete-orphan"))
    related_project = db.relationship("Project", backref="notifications", foreign_keys=[related_project_id])
    related_task = db.relationship("Task", backref="notifications", foreign_keys=[related_task_id])

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title or "",
            "message": self.message,
            "type": self.type,
            "priority": self.priority,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "user_id": self.user_id,
            "related_project_id": self.related_project_id,
            "related_project_title": self.related_project.title if self.related_project else None,
            "related_task_id": self.related_task_id,
            "related_task_title": self.related_task.title if self.related_task else None,
        }