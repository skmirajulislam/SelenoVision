"""
User model for MongoDB
"""

from datetime import datetime
from bson import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
try:
    from database import get_db
except ImportError:
    # Fallback import
    import sys
    import os
    sys.path.append(os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))))
    from database import get_db


class User:
    """User model for authentication and data management"""

    def __init__(self, email, username, password_hash=None, _id=None):
        self._id = _id
        self.email = email
        self.username = username
        self.password_hash = password_hash
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    @staticmethod
    def create_user(email, username, password):
        """Create a new user"""
        try:
            db = get_db()

            # Check if user already exists
            existing_user = db.users.find_one(
                {"$or": [{"email": email}, {"username": username}]})
            if existing_user:
                print(
                    f"User already exists: email={email}, username={username}")
                return None

            password_hash = generate_password_hash(password)
            user_data = {
                "email": email,
                "username": username,
                "password_hash": password_hash,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }

            result = db.users.insert_one(user_data)
            print(f"User created successfully: {result.inserted_id}")
            return User.find_by_id(result.inserted_id)
        except Exception as e:
            print(f"Error creating user: {e}")
            return None

    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        try:
            db = get_db()
            user_data = db.users.find_one({"email": email})
            if user_data:
                return User(
                    email=user_data["email"],
                    username=user_data["username"],
                    password_hash=user_data["password_hash"],
                    _id=user_data["_id"]
                )
            return None
        except Exception as e:
            print(f"Error finding user by email: {e}")
            return None

    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        try:
            db = get_db()
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)

            user_data = db.users.find_one({"_id": user_id})
            if user_data:
                return User(
                    email=user_data["email"],
                    username=user_data["username"],
                    password_hash=user_data["password_hash"],
                    _id=user_data["_id"]
                )
            return None
        except Exception as e:
            print(f"Error finding user by ID: {e}")
            return None

    @staticmethod
    def authenticate(email, password):
        """Authenticate user with email and password"""
        try:
            user = User.find_by_email(email)
            if user and user.password_hash and check_password_hash(user.password_hash, password):
                return user
            return None
        except Exception as e:
            print(f"Error authenticating user: {e}")
            return None

    def delete_user(self):
        """Delete user and all associated data"""
        db = get_db()

        # Delete all processing results for this user
        from models.processing_result import ProcessingResult
        ProcessingResult.delete_all_by_user(str(self._id))

        # Delete user
        db.users.delete_one({"_id": self._id})
        return True

    def to_dict(self):
        """Convert user to dictionary"""
        return {
            "_id": str(self._id),
            "email": self.email,
            "username": self.username,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
