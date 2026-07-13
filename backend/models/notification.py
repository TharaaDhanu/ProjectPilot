"""
models/notification.py
----------------------
SQLAlchemy Notification model for ProjectPilot.
"""

from datetime import datetime, timezone
from extensions import db


class Notification(db.Model):
    __tablename__ = "notifications"

    id: int = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id: int = db.Column(
        db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    message: str = db.Column(db.Text, nullable=False)
    type: str = db.Column(db.String(50), nullable=False) # e.g. "task_created", "task_assigned"
    read: bool = db.Column(db.Boolean, nullable=False, default=False, index=True)

    created_at: datetime = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    user = db.relationship("User", backref=db.backref("notifications", cascade="all, delete-orphan"))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "message": self.message,
            "type": self.type,
            "read": self.read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
