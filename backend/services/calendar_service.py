"""
services/calendar_service.py
----------------------------
Business logic for managing calendar events, statistics, and timeline reports.
Combines persistent database CalendarEvents with virtual events derived from
Projects, Tasks, and User records (birthdays, work anniversaries).
"""

from datetime import datetime, date, time, timezone, timedelta
from typing import Optional, List, Dict, Any

from extensions import db
from models.calendar_event import CalendarEvent
from models.project import Project
from models.task import Task
from models.user import User
from services.notification_service import NotificationService


class CalendarServiceError(Exception):
    """Domain-level error raised by CalendarService methods."""
    def __init__(self, message: str, http_status: int = 400) -> None:
        super().__init__(message)
        self.message = message
        self.http_status = http_status


class CalendarService:

    @staticmethod
    def get_all(user_id: int, filters: dict) -> List[dict]:
        """
        Fetch all events within an optional date window, combining manual
        CalendarEvents with virtual events from Projects, Tasks, Birthdays, and Anniversaries.
        """
        # Parse filter parameters
        project_id = filters.get("project_id")
        task_id = filters.get("task_id")
        employee_id = filters.get("employee_id")
        priority = filters.get("priority")
        status = filters.get("status")
        event_type = filters.get("event_type")
        search = filters.get("search", "").strip()

        # ─── 1. Query Manual Calendar Events ───
        query = CalendarEvent.query
        if project_id:
            query = query.filter(CalendarEvent.project_id == project_id)
        if task_id:
            query = query.filter(CalendarEvent.task_id == task_id)
        if employee_id:
            query = query.filter(CalendarEvent.employee_id == employee_id)
        if priority:
            query = query.filter(CalendarEvent.priority == priority)
        if status:
            query = query.filter(CalendarEvent.status == status)
        if event_type:
            query = query.filter(CalendarEvent.event_type == event_type)
        if search:
            query = query.filter(
                db.or_(
                    CalendarEvent.title.ilike(f"%{search}%"),
                    CalendarEvent.description.ilike(f"%{search}%"),
                    CalendarEvent.location.ilike(f"%{search}%")
                )
            )

        events_list = [e.to_dict() for e in query.all()]

        # ─── 2. Query Project Timeline Events ───
        # Only fetch project events if no event_type filter is present or if it filters specifically for "Project"
        if not event_type or event_type == "Project":
            p_query = Project.query
            if project_id:
                p_query = p_query.filter(Project.id == project_id)
            if search:
                p_query = p_query.filter(Project.title.ilike(f"%{search}%"))

            for project in p_query.all():
                # Project Start Event
                if project.start_date:
                    events_list.append({
                        "id": f"project-start-{project.id}",
                        "title": f"[Start] {project.title}",
                        "description": project.description,
                        "event_type": "Project",
                        "color": "#3b82f6", # Blue
                        "start_date": project.start_date.isoformat(),
                        "end_date": project.start_date.isoformat(),
                        "project_id": project.id,
                        "project_title": project.title,
                        "priority": project.priority,
                        "status": project.status,
                        "is_virtual": True
                    })
                # Project End Event
                if project.end_date:
                    events_list.append({
                        "id": f"project-end-{project.id}",
                        "title": f"[End] {project.title}",
                        "description": project.description,
                        "event_type": "Project",
                        "color": "#7c3aed", # Violet/Purple
                        "start_date": project.end_date.isoformat(),
                        "end_date": project.end_date.isoformat(),
                        "project_id": project.id,
                        "project_title": project.title,
                        "priority": project.priority,
                        "status": project.status,
                        "is_virtual": True
                    })

        # ─── 3. Query Task Timeline Events ───
        # Tasks appear on the calendar spanning start_date to end_date
        if not event_type or event_type == "Task":
            t_query = Task.query
            if project_id:
                t_query = t_query.filter(Task.project_id == project_id)
            if task_id:
                t_query = t_query.filter(Task.id == task_id)
            if employee_id:
                t_query = t_query.filter(Task.assigned_to == employee_id)
            if priority:
                t_query = t_query.filter(Task.priority == priority)
            if status:
                t_query = t_query.filter(Task.status == status)
            if search:
                t_query = t_query.filter(Task.title.ilike(f"%{search}%"))

            today_val = date.today()
            for task in t_query.all():
                # Color code tasks based on status and deadlines
                if task.status == "Completed":
                    task_color = "#22c55e" # Green
                elif task.status != "Completed" and task.end_date and task.end_date < today_val:
                    task_color = "#ef4444" # Red (Overdue)
                elif task.status == "In Progress":
                    task_color = "#3b82f6" # Blue
                else:
                    task_color = "#eab308" # Yellow/Amber

                start_d = task.start_date or task.end_date or today_val
                end_d = task.end_date or start_d

                events_list.append({
                    "id": f"task-{task.id}",
                    "title": task.title,
                    "description": task.description,
                    "event_type": "Task",
                    "color": task_color,
                    "start_date": start_d.isoformat(),
                    "end_date": end_d.isoformat(),
                    "project_id": task.project_id,
                    "project_title": task.project.title if task.project else None,
                    "task_id": task.id,
                    "task_title": task.title,
                    "employee_id": task.assigned_to,
                    "employee_name": task.assignee.name if task.assignee else None,
                    "priority": task.priority,
                    "status": task.status,
                    "is_virtual": True
                })

        # ─── 4. Query Team Celebrations (Birthdays & Anniversaries) ───
        if not event_type or event_type in ["Birthday", "Work Anniversary"]:
            u_query = User.query
            if employee_id:
                u_query = u_query.filter(User.id == employee_id)
            if search:
                u_query = u_query.filter(User.name.ilike(f"%{search}%"))

            for user in u_query.all():
                # Birthdays
                if user.birthday and (not event_type or event_type == "Birthday"):
                    # Render birthday for the filter year, or default to current year
                    events_list.append({
                        "id": f"birthday-{user.id}",
                        "title": f"🎂 Birthday: {user.name}",
                        "event_type": "Birthday",
                        "color": "#ec4899", # Pink
                        # Represent as a floating annual date: month and day
                        "start_date": user.birthday.isoformat(), 
                        "employee_id": user.id,
                        "employee_name": user.name,
                        "is_virtual": True
                    })

                # Anniversaries
                if user.joining_date and (not event_type or event_type == "Work Anniversary"):
                    events_list.append({
                        "id": f"anniversary-{user.id}",
                        "title": f"🎗 Work Anniversary: {user.name}",
                        "event_type": "Work Anniversary",
                        "color": "#f59e0b", # Orange
                        "start_date": user.joining_date.isoformat(),
                        "employee_id": user.id,
                        "employee_name": user.name,
                        "is_virtual": True
                    })

        return events_list

    @staticmethod
    def get_by_id(event_id: int, user_id: int) -> Optional[dict]:
        """Fetch a single manual calendar event by its DB primary key."""
        event = CalendarEvent.query.get(event_id)
        if not event:
            return None
        return event.to_dict()

    @staticmethod
    def create(user_id: int, data: dict) -> dict:
        """Create a manual CalendarEvent and trigger system notifications."""
        title = (data.get("title") or "").strip()
        if not title:
            raise CalendarServiceError("Title is required.", 422)

        start_date_str = data.get("start_date")
        if not start_date_str:
            raise CalendarServiceError("Start date is required.", 422)
        
        start_date = CalendarService._parse_date(start_date_str)
        if not start_date:
            raise CalendarServiceError("Invalid start date format. Use YYYY-MM-DD.", 422)

        end_date = CalendarService._parse_date(data.get("end_date")) or start_date
        if end_date < start_date:
            raise CalendarServiceError("End date cannot be before start date.", 422)

        # Parse times
        start_time = CalendarService._parse_time(data.get("start_time"))
        end_time = CalendarService._parse_time(data.get("end_time"))

        event_type = data.get("event_type", "Meeting")
        color = data.get("color") or "#3b82f6" # default Blue

        event = CalendarEvent(
            title=title,
            description=(data.get("description") or "").strip() or None,
            event_type=event_type,
            color=color,
            start_date=start_date,
            end_date=end_date,
            start_time=start_time,
            end_time=end_time,
            location=(data.get("location") or "").strip() or None,
            project_id=data.get("project_id"),
            task_id=data.get("task_id"),
            employee_id=data.get("employee_id"),
            priority=data.get("priority", "Medium"),
            status=data.get("status", "Confirmed"),
            is_all_day=bool(data.get("is_all_day", False)),
            repeat_type=data.get("repeat_type", "None"),
            notes=(data.get("notes") or "").strip() or None,
            created_by=user_id
        )

        db.session.add(event)
        db.session.commit()
        db.session.refresh(event)

        # ─── Trigger Notifications on creation ───
        try:
            # Invoking notification creation for relevant type
            # Find the notification recipient (assigned employee, or fall back to creator)
            recipient_id = event.employee_id or user_id
            
            if event_type == "Meeting":
                msg = f"Meeting Scheduled: '{title}' on {event.start_date.strftime('%b %d, %Y')}."
                if event.start_time:
                    msg += f" at {event.start_time.strftime('%I:%M %p')}"
                NotificationService.create_notification(recipient_id, msg, "meeting_reminder")
                
            elif event_type == "Milestone":
                msg = f"Milestone set: '{title}' on {event.start_date.strftime('%b %d, %Y')}."
                NotificationService.create_notification(recipient_id, msg, "milestone_reminder")
                
            elif event_type == "Leave":
                emp_name = event.employee.name if event.employee else "Employee"
                msg = f"Leave scheduled for {emp_name} from {event.start_date} to {event.end_date}."
                # Notify both the employee and the manager/creator
                NotificationService.create_notification(recipient_id, msg, "leave_reminder")
                if user_id != recipient_id:
                    NotificationService.create_notification(user_id, msg, "leave_reminder")
                    
            elif event_type == "Deadline":
                msg = f"Upcoming Deadline: '{title}' is set for {event.start_date.strftime('%b %d, %Y')}."
                NotificationService.create_notification(recipient_id, msg, "deadline_reminder")
                
            elif event_type == "Birthday":
                emp_name = event.employee.name if event.employee else "Employee"
                msg = f"Birthday Reminder: {emp_name}'s birthday is on {event.start_date.strftime('%b %d')}."
                # Broadcast or send to creator/manager
                NotificationService.create_notification(user_id, msg, "birthday_reminder")
        except Exception as e:
            # Suppress notification failure so API request doesn't crash
            pass

        return event.to_dict()

    @staticmethod
    def update(event_id: int, user_id: int, data: dict) -> dict:
        """Update a manual CalendarEvent's properties."""
        event = CalendarEvent.query.get(event_id)
        if not event:
            raise CalendarServiceError("Calendar event not found.", 404)

        if "title" in data:
            title = (data["title"] or "").strip()
            if not title:
                raise CalendarServiceError("Title is required.", 422)
            event.title = title

        if "description" in data:
            event.description = (data["description"] or "").strip() or None

        if "start_date" in data:
            start_date = CalendarService._parse_date(data["start_date"])
            if not start_date:
                raise CalendarServiceError("Invalid start date.", 422)
            event.start_date = start_date

        if "end_date" in data:
            event.end_date = CalendarService._parse_date(data["end_date"])

        if event.start_date and event.end_date and event.end_date < event.start_date:
            raise CalendarServiceError("End date cannot be before start date.", 422)

        if "start_time" in data:
            event.start_time = CalendarService._parse_time(data["start_time"])

        if "end_time" in data:
            event.end_time = CalendarService._parse_time(data["end_time"])

        if "event_type" in data:
            event.event_type = data["event_type"]

        if "color" in data:
            event.color = data["color"]

        if "location" in data:
            event.location = (data["location"] or "").strip() or None

        if "project_id" in data:
            event.project_id = data["project_id"]

        if "task_id" in data:
            event.task_id = data["task_id"]

        if "employee_id" in data:
            event.employee_id = data["employee_id"]

        if "priority" in data:
            event.priority = data["priority"]

        if "status" in data:
            event.status = data["status"]

        if "is_all_day" in data:
            event.is_all_day = bool(data["is_all_day"])

        if "repeat_type" in data:
            event.repeat_type = data["repeat_type"]

        if "notes" in data:
            event.notes = (data["notes"] or "").strip() or None

        event.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        db.session.refresh(event)

        # Trigger updated notifications
        try:
            recipient_id = event.employee_id or user_id
            if event.event_type == "Meeting":
                msg = f"Meeting Updated: '{event.title}' rescheduled to {event.start_date.strftime('%b %d, %Y')}."
                NotificationService.create_notification(recipient_id, msg, "meeting_reminder")
        except Exception:
            pass

        return event.to_dict()

    @staticmethod
    def delete(event_id: int, user_id: int) -> None:
        """Permanently delete a manual CalendarEvent."""
        event = CalendarEvent.query.get(event_id)
        if not event:
            raise CalendarServiceError("Calendar event not found.", 404)
        db.session.delete(event)
        db.session.commit()

    @staticmethod
    def get_upcoming(user_id: int, limit: int = 8) -> List[dict]:
        """Fetch all upcoming events (manual and virtual) in the next 30 days."""
        today_val = date.today()
        end_val = today_val + timedelta(days=30)
        
        all_events = CalendarService.get_all(user_id, {})
        upcoming = []
        
        for e in all_events:
            event_d_str = e.get("start_date")
            if not event_d_str:
                continue
            
            try:
                event_d = date.fromisoformat(event_d_str)
            except ValueError:
                continue
                
            # If recurring yearly event (birthday/anniversary), shift it to this year
            if e.get("event_type") in ["Birthday", "Work Anniversary"]:
                event_d = date(today_val.year, event_d.month, event_d.day)
                # If already passed this year, shift to next year
                if event_d < today_val:
                    event_d = date(today_val.year + 1, event_d.month, event_d.day)
                e["start_date"] = event_d.isoformat()
                e["end_date"] = event_d.isoformat()

            if today_val <= event_d <= end_val:
                upcoming.append(e)

        # Sort by start_date ascending
        upcoming.sort(key=lambda x: x["start_date"])
        return upcoming[:limit]

    @staticmethod
    def get_today(user_id: int) -> List[dict]:
        """Fetch all schedule events (meetings, tasks, leaves) for today."""
        today_str = date.today().isoformat()
        all_events = CalendarService.get_all(user_id, {})
        
        today_events = []
        today_val = date.today()
        for e in all_events:
            # Handle standard start/end date ranges
            start_str = e.get("start_date")
            end_str = e.get("end_date") or start_str
            
            if not start_str:
                continue
                
            if e.get("event_type") in ["Birthday", "Work Anniversary"]:
                # Match month and day
                try:
                    event_d = date.fromisoformat(start_str)
                    if event_d.month == today_val.month and event_d.day == today_val.day:
                        today_events.append(e)
                except ValueError:
                    pass
                continue

            try:
                start_d = date.fromisoformat(start_str)
                end_d = date.fromisoformat(end_str)
                if start_d <= today_val <= end_d:
                    today_events.append(e)
            except ValueError:
                pass

        return today_events

    @staticmethod
    def get_statistics(user_id: int) -> dict:
        """Calculate high-level scheduler analytics (meetings, leaves, deadlines, department breakdowns)."""
        all_events = CalendarService.get_all(user_id, {})
        total = len(all_events)
        
        meetings_count = sum(1 for e in all_events if e.get("event_type") == "Meeting")
        leaves_count = sum(1 for e in all_events if e.get("event_type") == "Leave")
        tasks_count = sum(1 for e in all_events if e.get("event_type") == "Task")
        milestones_count = sum(1 for e in all_events if e.get("event_type") == "Milestone")
        deadlines_count = sum(1 for e in all_events if e.get("event_type") == "Deadline")

        # Breakdown by department (linked via employee)
        dept_breakdown = {}
        for e in all_events:
            emp_id = e.get("employee_id")
            if emp_id:
                emp = User.query.get(emp_id)
                dept = emp.department if emp else None
                if dept:
                    dept_breakdown[dept] = dept_breakdown.get(dept, 0) + 1
                    
        # Calculate monthly counts
        monthly_distribution = {}
        for e in all_events:
            start_str = e.get("start_date")
            if start_str:
                try:
                    event_d = date.fromisoformat(start_str)
                    month_key = event_d.strftime("%Y-%m")
                    monthly_distribution[month_key] = monthly_distribution.get(month_key, 0) + 1
                except ValueError:
                    pass

        return {
            "total": total,
            "meetings": meetings_count,
            "leaves": leaves_count,
            "tasks": tasks_count,
            "milestones": milestones_count,
            "deadlines": deadlines_count,
            "department_breakdown": dept_breakdown,
            "monthly_distribution": monthly_distribution
        }

    @staticmethod
    def get_dashboard_data(user_id: int) -> dict:
        """
        Aggregate all data required by the Enterprise Scheduler right sidebar
        and the Dashboard/Reports integrations in a single call:
        today's schedule, upcoming deadlines, upcoming meetings, upcoming tasks,
        recent activity, birthdays, employees on leave, and quick statistics.
        """
        today_val = date.today()
        all_events = CalendarService.get_all(user_id, {})

        def _in_range(e):
            start_str = e.get("start_date")
            end_str = e.get("end_date") or start_str
            if not start_str:
                return False
            try:
                start_d = date.fromisoformat(start_str)
                end_d = date.fromisoformat(end_str)
                return start_d <= today_val <= end_d
            except ValueError:
                return False

        # Today's schedule (sorted by time)
        today_schedule = [e for e in all_events if _in_range(e)]
        today_schedule.sort(key=lambda x: (x.get("start_time") or "99:99:99"))

        # Upcoming deadlines (manual Deadline events + tasks not completed)
        upcoming_deadlines = []
        for e in all_events:
            if e.get("event_type") == "Deadline":
                try:
                    d = date.fromisoformat(e.get("start_date"))
                    if today_val <= d:
                        upcoming_deadlines.append(e)
                except (ValueError, TypeError):
                    pass
        # Add non-completed tasks with end_date as deadlines
        for e in all_events:
            if e.get("event_type") == "Task" and e.get("status") not in ("Completed", "Cancelled", "Archived"):
                try:
                    d = date.fromisoformat(e.get("end_date") or e.get("start_date"))
                    if today_val <= d:
                        upcoming_deadlines.append(e)
                except (ValueError, TypeError):
                    pass
        upcoming_deadlines.sort(key=lambda x: x.get("start_date") or x.get("end_date") or "")
        upcoming_deadlines = upcoming_deadlines[:6]

        # Upcoming meetings
        upcoming_meetings = [
            e for e in all_events
            if e.get("event_type") == "Meeting" and e.get("start_date") and e.get("start_date") >= today_val.isoformat()
        ]
        upcoming_meetings.sort(key=lambda x: x.get("start_date"))
        upcoming_meetings = upcoming_meetings[:6]

        # Upcoming tasks (virtual task events)
        upcoming_tasks = [e for e in all_events if e.get("event_type") == "Task"]
        upcoming_tasks.sort(key=lambda x: x.get("end_date") or x.get("start_date") or "")
        upcoming_tasks = upcoming_tasks[:6]

        # Birthdays (this year)
        birthdays = []
        for e in all_events:
            if e.get("event_type") == "Birthday" and e.get("start_date"):
                try:
                    bd = date.fromisoformat(e["start_date"])
                    bday = date(today_val.year, bd.month, bd.day)
                    if bday >= today_val:
                        birthdays.append({**e, "start_date": bday.isoformat()})
                except ValueError:
                    pass
        birthdays.sort(key=lambda x: x.get("start_date"))

        # Employees on leave (from User table)
        on_leave = [
            {
                "id": u.id,
                "name": u.name,
                "role": u.role,
                "designation": u.designation,
                "department": u.department,
                "avatar": u.avatar,
                "status": u.status,
            }
            for u in User.query.filter(User.status == "On Leave").all()
        ]

        # Recent activity (latest manual events)
        manual_events = [e for e in all_events if not e.get("is_virtual")]
        manual_events.sort(key=lambda x: x.get("created_at") or "", reverse=True)
        recent_activity = manual_events[:6]

        # Quick statistics
        stats = CalendarService.get_statistics(user_id)

        return {
            "today_schedule": today_schedule,
            "upcoming_deadlines": upcoming_deadlines,
            "upcoming_meetings": upcoming_meetings,
            "upcoming_tasks": upcoming_tasks,
            "birthdays": birthdays,
            "employees_on_leave": on_leave,
            "recent_activity": recent_activity,
            "quick_stats": stats,
        }

    # ─── Internal Parsing Helpers ───
    @staticmethod
    def _parse_date(value) -> Optional[date]:
        if not value:
            return None
        if isinstance(value, date):
            return value
        try:
            # Slice ISO timestamp if datetime is passed
            if "T" in str(value):
                value = str(value).split("T")[0]
            return date.fromisoformat(str(value))
        except (ValueError, TypeError):
            return None

    @staticmethod
    def _parse_time(value) -> Optional[time]:
        if not value:
            return None
        if isinstance(value, time):
            return value
        try:
            # Expect HH:MM:SS or HH:MM format
            parts = str(value).split(":")
            h = int(parts[0])
            m = int(parts[1])
            s = int(parts[2]) if len(parts) > 2 else 0
            return time(h, m, s)
        except (ValueError, TypeError, IndexError):
            return None
