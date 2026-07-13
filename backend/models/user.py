"""
models/user.py
--------------
SQLAlchemy User model.

Columns
-------
id              : Primary key, auto-incremented integer.
name            : Full display name (max 100 chars).
email           : Unique login identifier (max 150 chars).
password_hash   : bcrypt hash — the raw password is NEVER stored.
created_at      : UTC timestamp set once at row creation.
updated_at      : UTC timestamp refreshed on every UPDATE.

Helper methods
--------------
set_password(raw)      : Hash raw password and store in password_hash.
check_password(raw)    : Verify raw password against stored hash.
to_dict()              : Safe serialisable dict (no hash exposed).
"""

from datetime import datetime, timezone, date
from extensions import db, bcrypt

# Many-to-many relationship mapping table for project members
project_members = db.Table(
    "project_members",
    db.Column("project_id", db.Integer, db.ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    db.Column("user_id", db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
)


class User(db.Model):
    __tablename__ = "users"

    # ------------------------------------------------------------------
    # Columns
    # ------------------------------------------------------------------
    id: int = db.Column(db.Integer, primary_key=True, autoincrement=True)

    name: str = db.Column(db.String(100), nullable=False)

    email: str = db.Column(
        db.String(150), unique=True, nullable=False, index=True
    )

    password_hash: str = db.Column(db.String(255), nullable=False)

    role: str = db.Column(db.String(50), nullable=False, default="Employee")
    designation: str = db.Column(db.String(100), nullable=True)
    department: str = db.Column(db.String(100), nullable=True)
    employee_id: str = db.Column(db.String(50), unique=True, nullable=True)
    phone: str = db.Column(db.String(30), nullable=True)
    avatar: str = db.Column(db.String(255), nullable=True)
    joining_date = db.Column(db.Date, nullable=True)
    birthday = db.Column(db.Date, nullable=True)
    status: str = db.Column(db.String(50), nullable=False, default="Active")
    bio: str = db.Column(db.Text, nullable=True)

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

    # Many-to-many relationship to Project
    assigned_projects = db.relationship(
        "Project",
        secondary=project_members,
        backref=db.backref("members", lazy="select")
    )

    # ------------------------------------------------------------------
    # Password helpers
    # ------------------------------------------------------------------
    def set_password(self, raw_password: str) -> None:
        """Hash raw_password with bcrypt and store the result."""
        self.password_hash = bcrypt.generate_password_hash(raw_password).decode(
            "utf-8"
        )

    def check_password(self, raw_password: str) -> bool:
        """Return True if raw_password matches the stored hash."""
        return bcrypt.check_password_hash(self.password_hash, raw_password)

    # ------------------------------------------------------------------
    # Serialisation
    # ------------------------------------------------------------------
    def to_dict(self) -> dict:
        """Return a JSON-safe dict — password_hash is intentionally omitted."""
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "designation": self.designation,
            "department": self.department,
            "employee_id": self.employee_id,
            "phone": self.phone,
            "avatar": self.avatar,
            "joining_date": self.joining_date.isoformat() if self.joining_date else None,
            "birthday": self.birthday.isoformat() if self.birthday else None,
            "status": self.status,
            "bio": self.bio,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r}>"
