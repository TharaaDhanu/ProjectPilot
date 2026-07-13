"""
services/team_service.py
-------------------------
Business logic for the Team Management module.

All methods are pure Python — no Flask request/response objects.
Database interaction is via SQLAlchemy session.
"""

from datetime import datetime, timezone
from typing import Optional

from extensions import db, bcrypt
from models.user import User
from models.project import Project
from models.task import Task
from services.notification_service import NotificationService

VALID_ROLES = {
    "Super Admin", "Admin", "Project Manager", "Team Lead",
    "Senior Developer", "Developer", "Designer", "QA Engineer",
    "Intern", "Employee"
}

VALID_STATUSES = {"Active", "Busy", "On Leave", "Offline"}

VALID_DEPARTMENTS = {
    "Engineering", "Design", "Product", "QA", "Marketing",
    "Sales", "HR", "Finance", "Operations", "Management"
}

VALID_SORTS = {
    "newest":       User.created_at.desc(),
    "oldest":       User.created_at.asc(),
    "name_asc":     User.name.asc(),
    "name_desc":    User.name.desc(),
    "role":         User.role.asc(),
    "department":   User.department.asc(),
    "joining_date": User.joining_date.asc(),
}


class TeamServiceError(Exception):
    """Domain-level error raised by TeamService methods."""

    def __init__(self, message: str, http_status: int = 400) -> None:
        super().__init__(message)
        self.message = message
        self.http_status = http_status


class TeamService:
    """Stateless service — all methods are class-level."""

    # ------------------------------------------------------------------
    # List / search / filter
    # ------------------------------------------------------------------
    @staticmethod
    def get_all(
        search:     Optional[str] = None,
        role:       Optional[str] = None,
        department: Optional[str] = None,
        status:     Optional[str] = None,
        sort:       str = "name_asc",
    ) -> list:
        query = User.query

        if search:
            term = f"%{search}%"
            query = query.filter(
                db.or_(
                    User.name.ilike(term),
                    User.email.ilike(term),
                    User.employee_id.ilike(term),
                    User.designation.ilike(term),
                    User.department.ilike(term),
                )
            )

        if role and role in VALID_ROLES:
            query = query.filter(User.role == role)

        if department and department in VALID_DEPARTMENTS:
            query = query.filter(User.department == department)

        if status and status in VALID_STATUSES:
            query = query.filter(User.status == status)

        order_col = VALID_SORTS.get(sort, User.name.asc())
        query = query.order_by(order_col)

        users = query.all()
        return [TeamService._user_to_dict(u) for u in users]

    # ------------------------------------------------------------------
    # Single fetch
    # ------------------------------------------------------------------
    @staticmethod
    def get_by_id(user_id: int) -> Optional[dict]:
        user = User.query.get(user_id)
        if not user:
            return None
        return TeamService._user_to_dict(user, detailed=True)

    # ------------------------------------------------------------------
    # Create
    # ------------------------------------------------------------------
    @staticmethod
    def create(data: dict, actor_id: int) -> dict:
        """Validate and persist a new team member."""
        name = (data.get("name") or "").strip()
        if not name:
            raise TeamServiceError("Name is required.", 422)

        email = (data.get("email") or "").strip().lower()
        if not email:
            raise TeamServiceError("Email is required.", 422)

        if User.query.filter_by(email=email).first():
            raise TeamServiceError("Email is already registered.", 409)

        role = data.get("role", "Employee")
        if role not in VALID_ROLES:
            raise TeamServiceError(f"Invalid role: {role}", 422)

        status = data.get("status", "Active")
        if status not in VALID_STATUSES:
            raise TeamServiceError(f"Invalid status: {status}", 422)

        # Generate employee_id if not provided
        employee_id = (data.get("employee_id") or "").strip() or None
        if employee_id and User.query.filter_by(employee_id=employee_id).first():
            raise TeamServiceError("Employee ID already exists.", 409)
        if not employee_id:
            count = User.query.count()
            employee_id = f"EMP{count + 1:04d}"
            while User.query.filter_by(employee_id=employee_id).first():
                count += 1
                employee_id = f"EMP{count + 1:04d}"

        joining_date = TeamService._parse_date(data.get("joining_date"))
        birthday = TeamService._parse_date(data.get("birthday"))

        # Temporary password (in real world send via email)
        raw_pw = data.get("password") or "TempPass@123"
        pw_hash = bcrypt.generate_password_hash(raw_pw).decode("utf-8")

        user = User(
            name=name,
            email=email,
            password_hash=pw_hash,
            role=role,
            designation=(data.get("designation") or "").strip() or None,
            department=(data.get("department") or "").strip() or None,
            employee_id=employee_id,
            phone=(data.get("phone") or "").strip() or None,
            avatar=(data.get("avatar") or "").strip() or None,
            joining_date=joining_date,
            birthday=birthday,
            status=status,
            bio=(data.get("bio") or "").strip() or None,
        )
        db.session.add(user)
        db.session.flush()  # get user.id

        # Assign projects if provided
        project_ids = data.get("project_ids", [])
        if project_ids:
            projects = Project.query.filter(Project.id.in_(project_ids)).all()
            user.assigned_projects = projects

        db.session.commit()
        db.session.refresh(user)

        # Notification
        try:
            NotificationService.create_notification(
                user_id=actor_id,
                message=f"New team member '{name}' ({role}) was added to the team.",
                notification_type="team_member_added",
            )
        except Exception:
            pass

        return TeamService._user_to_dict(user, detailed=True)

    # ------------------------------------------------------------------
    # Update
    # ------------------------------------------------------------------
    @staticmethod
    def update(user_id: int, data: dict, actor_id: int) -> dict:
        user = User.query.get(user_id)
        if not user:
            raise TeamServiceError("Employee not found.", 404)

        old_role = user.role
        changes = []

        if "name" in data:
            user.name = (data["name"] or "").strip()

        if "email" in data:
            new_email = (data["email"] or "").strip().lower()
            existing = User.query.filter_by(email=new_email).first()
            if existing and existing.id != user_id:
                raise TeamServiceError("Email already taken.", 409)
            user.email = new_email

        if "role" in data:
            role = data["role"]
            if role not in VALID_ROLES:
                raise TeamServiceError(f"Invalid role: {role}", 422)
            if role != old_role:
                changes.append(f"role changed from '{old_role}' to '{role}'")
            user.role = role

        if "status" in data:
            status = data["status"]
            if status not in VALID_STATUSES:
                raise TeamServiceError(f"Invalid status: {status}", 422)
            user.status = status

        if "designation" in data:
            user.designation = (data["designation"] or "").strip() or None

        if "department" in data:
            user.department = (data["department"] or "").strip() or None

        if "phone" in data:
            user.phone = (data["phone"] or "").strip() or None

        if "avatar" in data:
            user.avatar = (data["avatar"] or "").strip() or None

        if "joining_date" in data:
            user.joining_date = TeamService._parse_date(data["joining_date"])

        if "birthday" in data:
            user.birthday = TeamService._parse_date(data["birthday"])

        if "bio" in data:
            user.bio = (data["bio"] or "").strip() or None

        if "employee_id" in data:
            eid = (data["employee_id"] or "").strip() or None
            if eid:
                existing = User.query.filter_by(employee_id=eid).first()
                if existing and existing.id != user_id:
                    raise TeamServiceError("Employee ID already taken.", 409)
            user.employee_id = eid

        # Update project assignments
        if "project_ids" in data:
            project_ids = data["project_ids"] or []
            projects = Project.query.filter(Project.id.in_(project_ids)).all()
            user.assigned_projects = projects
            changes.append(f"project assignments updated")

        user.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        db.session.refresh(user)

        # Notifications
        try:
            msg = f"Employee '{user.name}' profile was updated."
            if changes:
                msg = f"Employee '{user.name}': {'; '.join(changes)}."
            NotificationService.create_notification(
                user_id=actor_id,
                message=msg,
                notification_type="team_member_updated",
            )
        except Exception:
            pass

        return TeamService._user_to_dict(user, detailed=True)

    # ------------------------------------------------------------------
    # Delete
    # ------------------------------------------------------------------
    @staticmethod
    def delete(user_id: int, actor_id: int) -> None:
        user = User.query.get(user_id)
        if not user:
            raise TeamServiceError("Employee not found.", 404)
        if user_id == actor_id:
            raise TeamServiceError("Cannot delete your own account.", 400)
        name = user.name
        db.session.delete(user)
        db.session.commit()

        try:
            NotificationService.create_notification(
                user_id=actor_id,
                message=f"Team member '{name}' was removed from the system.",
                notification_type="team_member_deleted",
            )
        except Exception:
            pass

    # ------------------------------------------------------------------
    # Statistics
    # ------------------------------------------------------------------
    @staticmethod
    def get_statistics() -> dict:
        all_users = User.query.all()
        total = len(all_users)

        by_status = {
            "active":   sum(1 for u in all_users if u.status == "Active"),
            "busy":     sum(1 for u in all_users if u.status == "Busy"),
            "on_leave": sum(1 for u in all_users if u.status == "On Leave"),
            "offline":  sum(1 for u in all_users if u.status == "Offline"),
        }

        by_role = {}
        for u in all_users:
            by_role[u.role] = by_role.get(u.role, 0) + 1

        by_department = {}
        for u in all_users:
            dept = u.department or "Unassigned"
            by_department[dept] = by_department.get(dept, 0) + 1

        return {
            "total": total,
            "by_status": by_status,
            "by_role": by_role,
            "by_department": by_department,
        }

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    @staticmethod
    def _user_to_dict(user: User, detailed: bool = False) -> dict:
        data = user.to_dict()
        # Include assigned project names
        try:
            data["assigned_projects"] = [
                {"id": p.id, "title": p.title, "status": p.status}
                for p in user.assigned_projects
            ]
        except Exception:
            data["assigned_projects"] = []

        if detailed:
            # Include tasks assigned to this user
            try:
                tasks = Task.query.filter_by(assigned_to=user.id).all()
                data["assigned_tasks"] = [
                    {
                        "id": t.id,
                        "title": t.title,
                        "status": t.status,
                        "priority": t.priority,
                        "project_id": t.project_id,
                    }
                    for t in tasks
                ]
            except Exception:
                data["assigned_tasks"] = []

        return data

    @staticmethod
    def _parse_date(value):
        if not value:
            return None
        from datetime import date
        if isinstance(value, date):
            return value
        try:
            return date.fromisoformat(str(value))
        except (ValueError, TypeError):
            return None
