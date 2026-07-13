"""
services/project_service.py
----------------------------
Business logic for the Project module.

All methods are pure Python — no Flask request/response objects.
Database interaction is via SQLAlchemy session.
"""

from datetime import date
from typing import Optional

from extensions import db
from models.project import Project

VALID_STATUSES  = {"Planning", "Pending", "In Progress", "On Hold",
                   "Completed", "Cancelled", "Archived"}
VALID_PRIORITIES = {"Low", "Medium", "High", "Critical"}
VALID_SORTS = {
    "newest":     Project.created_at.desc(),
    "oldest":     Project.created_at.asc(),
    "name_asc":   Project.title.asc(),
    "name_desc":  Project.title.desc(),
    "priority":   Project.priority.desc(),
    "progress":   Project.progress.desc(),
    "start_date": Project.start_date.asc(),
    "end_date":   Project.end_date.asc(),
}


class ProjectServiceError(Exception):
    """Domain-level error raised by ProjectService methods."""

    def __init__(self, message: str, http_status: int = 400) -> None:
        super().__init__(message)
        self.message = message
        self.http_status = http_status


class ProjectService:
    """Stateless service — all methods are class-level."""

    # ------------------------------------------------------------------
    # List / paginate
    # ------------------------------------------------------------------
    @staticmethod
    def get_all(
        user_id:  int,
        status:   Optional[str] = None,
        priority: Optional[str] = None,
        search:   Optional[str] = None,
        sort:     str = "newest",
        page:     int = 1,
        per_page: int = 20,
    ) -> dict:
        """
        Return a paginated list of projects visible to user_id.
        Supports optional status/priority filters, text search, and sorting.
        """
        query = Project.query.filter_by(created_by=user_id)

        if status and status in VALID_STATUSES:
            query = query.filter(Project.status == status)

        if priority and priority in VALID_PRIORITIES:
            query = query.filter(Project.priority == priority)

        if search:
            term = f"%{search}%"
            query = query.filter(
                db.or_(
                    Project.title.ilike(term),
                    Project.description.ilike(term),
                )
            )

        order_col = VALID_SORTS.get(sort, Project.created_at.desc())
        query = query.order_by(order_col)

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            "projects": [p.to_dict() for p in pagination.items],
            "total":    pagination.total,
            "page":     pagination.page,
            "pages":    pagination.pages,
            "per_page": pagination.per_page,
        }

    # ------------------------------------------------------------------
    # Single fetch
    # ------------------------------------------------------------------
    @staticmethod
    def get_by_id(project_id: int, user_id: int) -> Optional[Project]:
        """Return project if it belongs to user_id, else None."""
        return Project.query.filter_by(id=project_id, created_by=user_id).first()

    # ------------------------------------------------------------------
    # Create
    # ------------------------------------------------------------------
    @staticmethod
    def create(user_id: int, data: dict) -> Project:
        """Validate and persist a new Project."""
        title = (data.get("title") or "").strip()
        if not title:
            raise ProjectServiceError("Title is required.", 422)
        if len(title) > 200:
            raise ProjectServiceError("Title must be 200 characters or fewer.", 422)

        status   = data.get("status", "Planning")
        priority = data.get("priority", "Medium")

        if status not in VALID_STATUSES:
            raise ProjectServiceError(f"Invalid status: {status}", 422)
        if priority not in VALID_PRIORITIES:
            raise ProjectServiceError(f"Invalid priority: {priority}", 422)

        progress = int(data.get("progress", 0))
        if not (0 <= progress <= 100):
            raise ProjectServiceError("Progress must be between 0 and 100.", 422)

        start_date = ProjectService._parse_date(data.get("start_date"))
        end_date   = ProjectService._parse_date(data.get("end_date"))

        if start_date and end_date and end_date < start_date:
            raise ProjectServiceError("End date cannot be before start date.", 422)

        project = Project(
            title=title,
            description=(data.get("description") or "").strip() or None,
            status=status,
            priority=priority,
            progress=progress,
            start_date=start_date,
            end_date=end_date,
            created_by=user_id,
        )
        db.session.add(project)
        db.session.commit()
        db.session.refresh(project)
        return project

    # ------------------------------------------------------------------
    # Update
    # ------------------------------------------------------------------
    @staticmethod
    def update(project_id: int, user_id: int, data: dict) -> Project:
        """Update an existing project. Only fields provided are changed."""
        project = ProjectService.get_by_id(project_id, user_id)
        if not project:
            raise ProjectServiceError("Project not found.", 404)

        if "title" in data:
            title = (data["title"] or "").strip()
            if not title:
                raise ProjectServiceError("Title is required.", 422)
            project.title = title

        if "description" in data:
            project.description = (data["description"] or "").strip() or None

        if "status" in data:
            if data["status"] not in VALID_STATUSES:
                raise ProjectServiceError(f"Invalid status: {data['status']}", 422)
            project.status = data["status"]

        if "priority" in data:
            if data["priority"] not in VALID_PRIORITIES:
                raise ProjectServiceError(f"Invalid priority: {data['priority']}", 422)
            project.priority = data["priority"]

        if "progress" in data:
            progress = int(data["progress"])
            if not (0 <= progress <= 100):
                raise ProjectServiceError("Progress must be between 0 and 100.", 422)
            project.progress = progress

        if "start_date" in data:
            project.start_date = ProjectService._parse_date(data["start_date"])

        if "end_date" in data:
            project.end_date = ProjectService._parse_date(data["end_date"])

        if project.start_date and project.end_date and project.end_date < project.start_date:
            raise ProjectServiceError("End date cannot be before start date.", 422)

        db.session.commit()
        db.session.refresh(project)
        return project

    # ------------------------------------------------------------------
    # Delete
    # ------------------------------------------------------------------
    @staticmethod
    def delete(project_id: int, user_id: int) -> None:
        """Permanently delete a project."""
        project = ProjectService.get_by_id(project_id, user_id)
        if not project:
            raise ProjectServiceError("Project not found.", 404)
        db.session.delete(project)
        db.session.commit()

    # ------------------------------------------------------------------
    # Archive / Restore
    # ------------------------------------------------------------------
    @staticmethod
    def archive(project_id: int, user_id: int) -> Project:
        """Set status to Archived."""
        project = ProjectService.get_by_id(project_id, user_id)
        if not project:
            raise ProjectServiceError("Project not found.", 404)
        project.status = "Archived"
        db.session.commit()
        db.session.refresh(project)
        return project

    @staticmethod
    def restore(project_id: int, user_id: int) -> Project:
        """Restore an archived project back to Planning."""
        project = ProjectService.get_by_id(project_id, user_id)
        if not project:
            raise ProjectServiceError("Project not found.", 404)
        if project.status != "Archived":
            raise ProjectServiceError("Project is not archived.", 400)
        project.status = "Planning"
        db.session.commit()
        db.session.refresh(project)
        return project

    # ------------------------------------------------------------------
    # Statistics
    # ------------------------------------------------------------------
    @staticmethod
    def get_statistics(user_id: int) -> dict:
        """Return aggregate counts and completion rate for user's projects."""
        all_projects = Project.query.filter_by(created_by=user_id).all()
        total = len(all_projects)
        counts = {
            "total":      total,
            "planning":   sum(1 for p in all_projects if p.status == "Planning"),
            "pending":    sum(1 for p in all_projects if p.status == "Pending"),
            "active":     sum(1 for p in all_projects if p.status == "In Progress"),
            "on_hold":    sum(1 for p in all_projects if p.status == "On Hold"),
            "completed":  sum(1 for p in all_projects if p.status == "Completed"),
            "cancelled":  sum(1 for p in all_projects if p.status == "Cancelled"),
            "archived":   sum(1 for p in all_projects if p.status == "Archived"),
            "completion_rate": round(
                (sum(1 for p in all_projects if p.status == "Completed") / total * 100)
                if total > 0 else 0,
                1,
            ),
            "avg_progress": round(
                sum(p.progress for p in all_projects) / total
                if total > 0 else 0,
                1,
            ),
        }
        return counts

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    @staticmethod
    def _parse_date(value) -> Optional[date]:
        """Parse ISO date string YYYY-MM-DD → date, or return None."""
        if not value:
            return None
        if isinstance(value, date):
            return value
        try:
            return date.fromisoformat(str(value))
        except (ValueError, TypeError):
            return None
