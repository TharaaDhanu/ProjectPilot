"""
services/task_service.py
-------------------------
Stateless service layer handling Task CRUD operations, filtering, sorting,
and automatic Project progress updates and Notifications.
"""

from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import case, or_

from extensions import db
from models.task import Task
from models.project import Project
from models.user import User
from services.notification_service import NotificationService


class TaskServiceError(Exception):
    """Custom exception raised by TaskService for business logic violations."""
    pass


class TaskService:
    @staticmethod
    def update_project_progress(project_id: int) -> None:
        """
        Recalculate project progress as the average progress of all tasks
        in the project (excluding Archived/Cancelled status tasks if preferred,
        but standard is average of all tasks).
        """
        project = Project.query.get(project_id)
        if not project:
            return

        tasks = Task.query.filter_by(project_id=project_id).all()
        if not tasks:
            # If there are no tasks, keep progress at 0 or leave as is
            project.progress = 0
        else:
            total_progress = sum(t.progress for t in tasks)
            project.progress = int(total_progress / len(tasks))

        db.session.commit()

    @staticmethod
    def create_task(creator_id: int, data: Dict[str, Any]) -> Task:
        """Create a new task, update project progress, and trigger notifications."""
        title = data.get("title")
        project_id = data.get("project_id")

        if not title or not title.strip():
            raise TaskServiceError("Task title is required.")
        if not project_id:
            raise TaskServiceError("Project ID is required.")

        # Verify project exists
        project = Project.query.get(project_id)
        if not project:
            raise TaskServiceError("Project not found.")

        task = Task(
            title=title.strip(),
            description=data.get("description"),
            status=data.get("status", "To Do"),
            priority=data.get("priority", "Medium"),
            progress=int(data.get("progress", 0)),
            start_date=data.get("start_date"),
            end_date=data.get("end_date"),
            project_id=project_id,
            assigned_to=data.get("assigned_to"),
            created_by=creator_id,
            checklist=data.get("checklist", []),
            subtasks=data.get("subtasks", []),
            labels=data.get("labels", []),
            comments=data.get("comments", []),
            attachments=data.get("attachments", []),
            estimated_hours=float(data.get("estimated_hours", 0.0)),
            actual_hours=float(data.get("actual_hours", 0.0)),
            is_favorite=bool(data.get("is_favorite", False)),
            timer_running=bool(data.get("timer_running", False)),
            timer_elapsed=int(data.get("timer_elapsed", 0)),
        )

        if data.get("timer_started_at"):
            task.timer_started_at = datetime.fromisoformat(data["timer_started_at"])

        db.session.add(task)
        db.session.commit()

        # Serialise task NOW while the session is healthy. The side-effect
        # operations below may leave the session in a state where lazy-loaded
        # relationships (e.g. `project.title`, `assignee.name`) would fail.
        # Capturing the dict up front guarantees the success response is
        # correct even if those operations have issues.
        task_data = task.to_dict()

        # --- Non-critical side effects (wrapped in try/except so they never
        #     break the successful creation response) -----------------------
        try:
            TaskService.update_project_progress(project_id)
        except Exception:
            pass

        try:
            if task.assigned_to and task.assigned_to != creator_id:
                NotificationService.create_notification(
                    user_id=task.assigned_to,
                    title="Task Assigned",
                    message=f"You have been assigned a new task: '{task.title}' under project '{project.title}'.",
                    notification_type="task_assigned"
                )
        except Exception:
            pass

        return task_data

    @staticmethod
    def get_task_by_id(task_id: int) -> Optional[Task]:
        """Fetch a single task by ID."""
        return db.session.get(Task, task_id)

    @staticmethod
    def update_task(task_id: int, user_id: int, data: Dict[str, Any]) -> Task:
        """Update task properties, handle timer toggling, and update project progress."""
        task = Task.query.get(task_id)
        if not task:
            raise TaskServiceError("Task not found.")

        old_project_id = task.project_id
        old_assignee = task.assigned_to
        old_progress = task.progress
        old_status = task.status

        # Handle updating simple fields if provided in data dict
        if "title" in data:
            if not data["title"] or not data["title"].strip():
                raise TaskServiceError("Task title cannot be empty.")
            task.title = data["title"].strip()

        if "description" in data:
            task.description = data["description"]
        if "status" in data:
            task.status = data["status"]
        if "priority" in data:
            task.priority = data["priority"]
        if "progress" in data:
            task.progress = int(data["progress"])
        if "start_date" in data:
            task.start_date = data["start_date"]
        if "end_date" in data:
            task.end_date = data["end_date"]
        if "project_id" in data:
            # Verify new project exists
            new_project = Project.query.get(data["project_id"])
            if not new_project:
                raise TaskServiceError("Target project not found.")
            task.project_id = data["project_id"]
        if "assigned_to" in data:
            task.assigned_to = data["assigned_to"]
        if "checklist" in data:
            task.checklist = data["checklist"]
        if "subtasks" in data:
            task.subtasks = data["subtasks"]
        if "labels" in data:
            task.labels = data["labels"]
        if "comments" in data:
            task.comments = data["comments"]
        if "attachments" in data:
            task.attachments = data["attachments"]
        if "estimated_hours" in data:
            task.estimated_hours = float(data["estimated_hours"])
        if "actual_hours" in data:
            task.actual_hours = float(data["actual_hours"])
        if "is_favorite" in data:
            task.is_favorite = bool(data["is_favorite"])

        # Timer Handling
        if "timer_running" in data:
            running = bool(data["timer_running"])
            if running and not task.timer_running:
                # Started timer
                task.timer_running = True
                task.timer_started_at = datetime.now(timezone.utc)
            elif not running and task.timer_running:
                # Paused/Stopped timer
                task.timer_running = False
                if task.timer_started_at:
                    delta = (datetime.now(timezone.utc) - task.timer_started_at.replace(tzinfo=timezone.utc)).total_seconds()
                    task.timer_elapsed += int(delta)
                    task.timer_started_at = None
                    # Update actual hours dynamically (3600 seconds = 1 hour)
                    task.actual_hours = round(task.timer_elapsed / 3600.0, 2)

        if "timer_elapsed" in data:
            task.timer_elapsed = int(data["timer_elapsed"])
            task.actual_hours = round(task.timer_elapsed / 3600.0, 2)

        db.session.commit()

        # Serialise task NOW while the session is healthy (see create_task 
        # for the rationale regarding side-effects that may break the session).
        task_data = task.to_dict()

        # --- Non-critical side effects (wrapped in try/except so they never
        #     break the successful update response) -------------------------
        try:
            if task.project_id != old_project_id:
                TaskService.update_project_progress(old_project_id)
                TaskService.update_project_progress(task.project_id)
            elif task.progress != old_progress:
                TaskService.update_project_progress(task.project_id)
        except Exception:
            pass

        try:
            project_title = task.project.title if task.project else "Unknown"

            # Notification: Assigned user changed
            if task.assigned_to and task.assigned_to != old_assignee and task.assigned_to != user_id:
                NotificationService.create_notification(
                    user_id=task.assigned_to,
                    title="Task Assigned",
                    message=f"You have been assigned to task: '{task.title}' under project '{project_title}'.",
                    notification_type="task_assigned"
                )

            # Notification: Task completed
            if task.status == "Completed" and old_status != "Completed":
                if task.created_by != user_id:
                    NotificationService.create_notification(
                        user_id=task.created_by,
                        title="Task Completed",
                        message=f"Task '{task.title}' was marked as Completed.",
                        notification_type="task_completed"
                    )
        except Exception:
            pass

        return task_data

    @staticmethod
    def delete_task(task_id: int, user_id: int) -> None:
        """Delete a task, update associated project's progress, and notify creators/assignees."""
        task = Task.query.get(task_id)
        if not task:
            raise TaskServiceError("Task not found.")

        project_id = task.project_id
        task_title = task.title
        assigned_to = task.assigned_to

        db.session.delete(task)
        db.session.commit()

        # --- Non-critical side effects (wrapped in try/except so they never
        #     break the successful response) ---------------------------------
        try:
            TaskService.update_project_progress(project_id)
        except Exception:
            pass

        try:
            if assigned_to and assigned_to != user_id:
                NotificationService.create_notification(
                    user_id=assigned_to,
                    title="Task Deleted",
                    message=f"Task '{task_title}' assigned to you has been deleted.",
                    notification_type="task_deleted"
                )
        except Exception:
            pass

    @staticmethod
    def get_statistics(user_id: int) -> Dict[str, Any]:
        """Generate high-level task metrics (Total, Completed, Pending, In Progress)."""
        # We query tasks where the user is either the creator or assignee
        tasks = Task.query.filter(or_(Task.created_by == user_id, Task.assigned_to == user_id)).all()

        total = len(tasks)
        completed = sum(1 for t in tasks if t.status == "Completed")
        in_progress = sum(1 for t in tasks if t.status == "In Progress")
        pending = sum(1 for t in tasks if t.status not in ["Completed", "Cancelled", "Archived"])

        # Priority Breakdown
        priorities = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
        statuses = {"To Do": 0, "In Progress": 0, "In Review": 0, "Blocked": 0, "Completed": 0, "Cancelled": 0, "Archived": 0}

        for t in tasks:
            if t.priority in priorities:
                priorities[t.priority] += 1
            if t.status in statuses:
                statuses[t.status] += 1

        completion_rate = round((completed / total) * 100, 1) if total > 0 else 0.0

        return {
            "total_tasks": total,
            "completed_tasks": completed,
            "in_progress_tasks": in_progress,
            "pending_tasks": pending,
            "completion_rate": completion_rate,
            "priorities": priorities,
            "statuses": statuses
        }

    @staticmethod
    def get_all_tasks(
        user_id: int,
        filters: Dict[str, Any] = None,
        sort: str = "newest",
        search: str = ""
    ) -> List[Task]:
        """Fetch tasks with advanced filters, searching, and sorting."""
        # Standard filter: Tasks creator or assignee
        query = Task.query.filter(or_(Task.created_by == user_id, Task.assigned_to == user_id))

        if filters:
            if filters.get("project_id"):
                query = query.filter(Task.project_id == filters["project_id"])
            if filters.get("assigned_to"):
                query = query.filter(Task.assigned_to == filters["assigned_to"])
            if filters.get("status"):
                query = query.filter(Task.status == filters["status"])
            if filters.get("priority"):
                query = query.filter(Task.priority == filters["priority"])
            if filters.get("start_date"):
                query = query.filter(Task.start_date >= filters["start_date"])
            if filters.get("end_date"):
                query = query.filter(Task.end_date <= filters["end_date"])
            if filters.get("is_favorite") is not None:
                query = query.filter(Task.is_favorite == bool(filters["is_favorite"]))

        if search and search.strip():
            term = f"%{search.strip()}%"
            # Join project/assignee to search by title or user name
            query = query.outerjoin(Project).outerjoin(User, Task.assigned_to == User.id).filter(
                or_(
                    Task.title.like(term),
                    Task.description.like(term),
                    Project.title.like(term),
                    User.name.like(term)
                )
            )

        # Sorting logic
        if sort == "newest":
            query = query.order_by(Task.created_at.desc())
        elif sort == "oldest":
            query = query.order_by(Task.created_at.asc())
        elif sort == "name_asc":
            query = query.order_by(Task.title.asc())
        elif sort == "name_desc":
            query = query.order_by(Task.title.desc())
        elif sort == "priority":
            # Critical -> High -> Medium -> Low
            priority_order = case(
                (Task.priority == "Critical", 1),
                (Task.priority == "High", 2),
                (Task.priority == "Medium", 3),
                (Task.priority == "Low", 4),
                else_=5
            )
            query = query.order_by(priority_order)
        elif sort == "progress":
            query = query.order_by(Task.progress.desc())
        elif sort == "start_date":
            query = query.order_by(Task.start_date.asc())
        elif sort == "end_date":
            query = query.order_by(Task.end_date.asc())

        return query.all()