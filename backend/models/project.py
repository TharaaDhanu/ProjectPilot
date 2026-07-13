"""
models/project.py
-----------------
SQLAlchemy Project model for ProjectPilot.

Columns
-------
id            : Primary key.
title         : Project name (max 200 chars, required).
description   : Optional long text description.
status        : Enum — Planning | Pending | In Progress | On Hold |
                Completed | Cancelled | Archived
priority      : Enum — Low | Medium | High | Critical
progress      : Integer 0–100 (percentage complete).
start_date    : Optional date the project begins.
end_date      : Optional deadline date.
created_by    : FK → users.id (owner).
created_at    : UTC timestamp, immutable after creation.
updated_at    : UTC timestamp, refreshed on every UPDATE.
"""

from datetime import datetime, timezone
from extensions import db


class Project(db.Model):
    __tablename__ = "projects"

    # ------------------------------------------------------------------
    # Columns
    # ------------------------------------------------------------------
    id: int = db.Column(db.Integer, primary_key=True, autoincrement=True)

    title: str = db.Column(db.String(200), nullable=False, index=True)

    description: str = db.Column(db.Text, nullable=True)

    status: str = db.Column(
        db.Enum(
            "Planning", "Pending", "In Progress", "On Hold",
            "Completed", "Cancelled", "Archived",
            name="project_status",
        ),
        nullable=False,
        default="Planning",
        index=True,
    )

    priority: str = db.Column(
        db.Enum("Low", "Medium", "High", "Critical", name="project_priority"),
        nullable=False,
        default="Medium",
        index=True,
    )

    progress: int = db.Column(db.Integer, nullable=False, default=0)

    start_date = db.Column(db.Date, nullable=True)
    end_date   = db.Column(db.Date, nullable=True)

    # Foreign key to the User who created this project
    created_by: int = db.Column(
        db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True, index=True,
    )

    created_at: datetime = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: datetime = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ------------------------------------------------------------------
    # Relationships
    # ------------------------------------------------------------------
    creator = db.relationship("User", backref="projects", foreign_keys=[created_by])

    # ------------------------------------------------------------------
    # Serialisation
    # ------------------------------------------------------------------
    def to_dict(self) -> dict:
        """Return a JSON-safe representation of this project."""
        return {
            "id":          self.id,
            "title":       self.title,
            "description": self.description,
            "status":      self.status,
            "priority":    self.priority,
            "progress":    self.progress,
            "start_date":  self.start_date.isoformat() if self.start_date else None,
            "end_date":    self.end_date.isoformat()   if self.end_date   else None,
            "created_by":  self.created_by,
            "creator_name": self.creator.name if self.creator else None,
            "created_at":  self.created_at.isoformat() if self.created_at else None,
            "updated_at":  self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self) -> str:
        return f"<Project id={self.id} title={self.title!r} status={self.status!r}>"
