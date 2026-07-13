"""
models/task.py
--------------
SQLAlchemy Task model for ProjectPilot.
"""

from datetime import datetime, timezone
from extensions import db


class Task(db.Model):
    __tablename__ = "tasks"

    id: int = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title: str = db.Column(db.String(200), nullable=False, index=True)
    description: str = db.Column(db.Text, nullable=True)

    status: str = db.Column(
        db.Enum(
            "To Do", "In Progress", "In Review", "Blocked",
            "Completed", "Cancelled", "Archived",
            name="task_status"
        ),
        nullable=False,
        default="To Do",
        index=True
    )

    priority: str = db.Column(
        db.Enum("Low", "Medium", "High", "Critical", name="task_priority"),
        nullable=False,
        default="Medium",
        index=True
    )

    progress: int = db.Column(db.Integer, nullable=False, default=0)

    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)

    project_id: int = db.Column(
        db.Integer, db.ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False, index=True
    )

    assigned_to: int = db.Column(
        db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True, index=True
    )

    created_by: int = db.Column(
        db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True
    )

    # Task Features stored as JSON arrays/objects
    checklist = db.Column(db.JSON, nullable=True)      # e.g., [{"id": 1, "text": "Item", "completed": false}]
    subtasks = db.Column(db.JSON, nullable=True)       # e.g., [{"id": 1, "title": "Subtask", "completed": false}]
    labels = db.Column(db.JSON, nullable=True)         # e.g., ["bug", "frontend"]
    comments = db.Column(db.JSON, nullable=True)       # e.g., [{"id": 1, "user_name": "Jeff", "text": "msg", "created_at": "..."}]
    attachments = db.Column(db.JSON, nullable=True)    # e.g., [{"name": "file.png", "url": "...", "size": 1024, "created_at": "..."}]

    # Timing and Metrics
    estimated_hours: float = db.Column(db.Float, nullable=False, default=0.0)
    actual_hours: float = db.Column(db.Float, nullable=False, default=0.0)
    is_favorite: bool = db.Column(db.Boolean, nullable=False, default=False, index=True)

    # Task Timer State
    timer_running: bool = db.Column(db.Boolean, nullable=False, default=False)
    timer_started_at = db.Column(db.DateTime(timezone=True), nullable=True)
    timer_elapsed: int = db.Column(db.Integer, nullable=False, default=0) # in seconds

    created_at: datetime = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at: datetime = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    project = db.relationship("Project", backref=db.backref("tasks", cascade="all, delete-orphan"))
    assignee = db.relationship("User", foreign_keys=[assigned_to], backref="assigned_tasks")
    creator = db.relationship("User", foreign_keys=[created_by], backref="created_tasks")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
            "progress": self.progress,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "project_id": self.project_id,
            "project_title": self.project.title if self.project else None,
            "assigned_to": self.assigned_to,
            "assigned_name": self.assignee.name if self.assignee else None,
            "assigned_email": self.assignee.email if self.assignee else None,
            "created_by": self.created_by,
            "creator_name": self.creator.name if self.creator else None,
            "checklist": self.checklist or [],
            "subtasks": self.subtasks or [],
            "labels": self.labels or [],
            "comments": self.comments or [],
            "attachments": self.attachments or [],
            "estimated_hours": self.estimated_hours,
            "actual_hours": self.actual_hours,
            "is_favorite": self.is_favorite,
            "timer_running": self.timer_running,
            "timer_started_at": self.timer_started_at.isoformat() if self.timer_started_at else None,
            "timer_elapsed": self.timer_elapsed,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
