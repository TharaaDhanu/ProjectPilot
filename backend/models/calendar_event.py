"""
models/calendar_event.py
------------------------
SQLAlchemy model for manually created calendar events.
"""

from datetime import datetime, timezone
from extensions import db


class CalendarEvent(db.Model):
    __tablename__ = "calendar_events"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    # Event Types: "Project", "Task", "Meeting", "Deadline", "Milestone", "Leave", "Birthday", "Work Anniversary", "Holiday", "Reminder", "Personal"
    event_type = db.Column(db.String(50), nullable=False, default="Meeting")
    
    color = db.Column(db.String(50), nullable=True)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=True)
    
    start_time = db.Column(db.Time, nullable=True)
    end_time = db.Column(db.Time, nullable=True)
    
    location = db.Column(db.String(200), nullable=True)

    # Linked entities
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    task_id = db.Column(db.Integer, db.ForeignKey("tasks.id", ondelete="CASCADE"), nullable=True)
    employee_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=True)

    priority = db.Column(db.String(50), nullable=True, default="Medium")  # "Low", "Medium", "High", "Critical"
    status = db.Column(db.String(50), nullable=True, default="Confirmed")  # "Confirmed", "Pending", "Cancelled"

    is_all_day = db.Column(db.Boolean, nullable=False, default=False)
    repeat_type = db.Column(db.String(50), nullable=False, default="None")  # "None", "Daily", "Weekly", "Monthly", "Yearly"

    notes = db.Column(db.Text, nullable=True)

    created_by = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    project = db.relationship("Project", backref=db.backref("calendar_events", cascade="all, delete-orphan"))
    task = db.relationship("Task", backref=db.backref("calendar_events", cascade="all, delete-orphan"))
    employee = db.relationship("User", foreign_keys=[employee_id], backref="employee_events")
    creator = db.relationship("User", foreign_keys=[created_by], backref="created_events")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "event_type": self.event_type,
            "color": self.color,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "start_time": self.start_time.strftime("%H:%M:%S") if self.start_time else None,
            "end_time": self.end_time.strftime("%H:%M:%S") if self.end_time else None,
            "location": self.location,
            "project_id": self.project_id,
            "project_title": self.project.title if self.project else None,
            "task_id": self.task_id,
            "task_title": self.task.title if self.task else None,
            "employee_id": self.employee_id,
            "employee_name": self.employee.name if self.employee else None,
            "priority": self.priority,
            "status": self.status,
            "is_all_day": self.is_all_day,
            "repeat_type": self.repeat_type,
            "notes": self.notes,
            "created_by": self.created_by,
            "creator_name": self.creator.name if self.creator else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
