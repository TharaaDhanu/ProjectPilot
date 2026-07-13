from app import create_app
from models.user import User

app = create_app()

with app.app_context():
    users = User.query.all()

    if not users:
        print("No users found.")
    else:
        print("\nRegistered Users:\n")
        for user in users:
            print(f"ID      : {user.id}")
            print(f"Name    : {user.name}")
            print(f"Email   : {user.email}")
            print(f"Role    : {user.role}")
            print("-" * 40)