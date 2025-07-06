"""
Authentication routes for Luna Photoclinometry Server
Handle user registration, login, and account management
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User
from models.processing_result import ProcessingResult

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        print(f"Registration attempt: {data}")

        if not data or not data.get('email') or not data.get('username') or not data.get('password'):
            return jsonify({
                'error': 'Email, username, and password are required'
            }), 400

        email = data.get('email').lower().strip()
        username = data.get('username').strip()
        password = data.get('password')

        # Validate input
        if len(password) < 6:
            return jsonify({
                'error': 'Password must be at least 6 characters long'
            }), 400

        if '@' not in email:
            return jsonify({
                'error': 'Please provide a valid email address'
            }), 400

        print(f"Creating user: email={email}, username={username}")

        # Create user
        user = User.create_user(email, username, password)

        if not user:
            print(
                f"User creation failed for: email={email}, username={username}")
            return jsonify({
                'error': 'User with this email or username already exists'
            }), 409

        print(f"User created successfully: {user._id}")

        # Create JWT token
        access_token = create_access_token(identity=str(user._id))

        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'access_token': access_token
        }), 201

    except Exception as e:
        print(f"Registration error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Registration failed. Please try again.'
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()

        if not data or not data.get('email') or not data.get('password'):
            return jsonify({
                'error': 'Email and password are required'
            }), 400

        email = data.get('email').lower().strip()
        password = data.get('password')

        # Authenticate user
        user = User.authenticate(email, password)

        if not user:
            return jsonify({
                'error': 'Invalid email or password'
            }), 401

        # Create JWT token
        access_token = create_access_token(identity=str(user._id))

        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token
        }), 200

    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({
            'error': 'Login failed. Please try again.'
        }), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)

        if not user:
            return jsonify({
                'error': 'User not found'
            }), 404

        return jsonify({
            'user': user.to_dict()
        }), 200

    except Exception as e:
        print(f"Get user error: {e}")
        return jsonify({
            'error': 'Failed to get user information'
        }), 500


@auth_bp.route('/delete-account', methods=['DELETE'])
@jwt_required()
def delete_account():
    """Delete user account and all associated data"""
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)

        if not user:
            return jsonify({
                'error': 'User not found'
            }), 404

        # Delete user and all associated data
        user.delete_user()

        return jsonify({
            'message': 'Account deleted successfully'
        }), 200

    except Exception as e:
        print(f"Delete account error: {e}")
        return jsonify({
            'error': 'Failed to delete account'
        }), 500


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get detailed user profile with statistics"""
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Get user statistics
        from database import get_db
        db = get_db()

        total_results = db.processing_results.count_documents(
            {"user_id": user_id})
        completed_results = db.processing_results.count_documents({
            "user_id": user_id,
            "status": "completed"
        })

        return jsonify({
            'user': user.to_dict(),
            'statistics': {
                'total_processed': total_results,
                'completed_processing': completed_results,
                'success_rate': (completed_results / total_results * 100) if total_results > 0 else 0
            }
        }), 200

    except Exception as e:
        print(f"Get profile error: {e}")
        return jsonify({'error': 'Failed to get profile information'}), 500


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile information"""
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Update allowed fields
        updated = False
        from database import get_db
        db = get_db()

        update_data = {}

        if 'username' in data and data['username'].strip():
            # Check if username is already taken by another user
            existing_user = db.users.find_one({
                "username": data['username'].strip(),
                "_id": {"$ne": user._id}
            })
            if existing_user:
                return jsonify({'error': 'Username already taken'}), 409
            update_data['username'] = data['username'].strip()
            updated = True

        if 'email' in data and data['email'].strip():
            # Check if email is already taken by another user
            email = data['email'].lower().strip()
            if '@' not in email:
                return jsonify({'error': 'Invalid email format'}), 400

            existing_user = db.users.find_one({
                "email": email,
                "_id": {"$ne": user._id}
            })
            if existing_user:
                return jsonify({'error': 'Email already taken'}), 409
            update_data['email'] = email
            updated = True

        if updated:
            from datetime import datetime
            update_data['updated_at'] = datetime.utcnow()
            db.users.update_one({"_id": user._id}, {"$set": update_data})

        # Return updated user
        updated_user = User.find_by_id(user_id)
        if not updated_user:
            return jsonify({'error': 'Failed to retrieve updated user'}), 500

        return jsonify({
            'message': 'Profile updated successfully',
            'user': updated_user.to_dict()
        }), 200

    except Exception as e:
        print(f"Update profile error: {e}")
        return jsonify({'error': 'Failed to update profile'}), 500


@auth_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    """Get dashboard data including recent results and statistics"""
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        from database import get_db
        db = get_db()

        # Get recent processing results
        recent_results = list(db.processing_results.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(10))

        # Convert ObjectId to string for JSON serialization
        for result in recent_results:
            result["_id"] = str(result["_id"])
            if "created_at" in result:
                result["created_at"] = result["created_at"].isoformat()
            if "updated_at" in result:
                result["updated_at"] = result["updated_at"].isoformat()

        # Get statistics
        total_results = db.processing_results.count_documents(
            {"user_id": user_id})
        completed_results = db.processing_results.count_documents({
            "user_id": user_id,
            "status": "completed"
        })
        processing_results = db.processing_results.count_documents({
            "user_id": user_id,
            "status": "processing"
        })
        failed_results = db.processing_results.count_documents({
            "user_id": user_id,
            "status": "failed"
        })

        return jsonify({
            'user': user.to_dict(),
            'recent_results': recent_results,
            'statistics': {
                'total_processed': total_results,
                'completed': completed_results,
                'processing': processing_results,
                'failed': failed_results,
                'success_rate': (completed_results / total_results * 100) if total_results > 0 else 0
            }
        }), 200

    except Exception as e:
        print(f"Get dashboard error: {e}")
        return jsonify({'error': 'Failed to get dashboard data'}), 500


@auth_bp.route('/results', methods=['GET'])
@jwt_required()
def get_user_results():
    """Get all user's processing results with pagination"""
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        status_filter = request.args.get('status')

        from database import get_db
        db = get_db()

        # Build query
        query = {"user_id": user_id}
        if status_filter and status_filter in ['completed', 'processing', 'failed', 'pending']:
            query["status"] = status_filter

        # Get total count
        total_count = db.processing_results.count_documents(query)

        # Get paginated results
        skip = (page - 1) * limit
        results = list(db.processing_results.find(query)
                       .sort("created_at", -1)
                       .skip(skip)
                       .limit(limit))

        # Convert ObjectId to string for JSON serialization
        for result in results:
            result["_id"] = str(result["_id"])
            if "created_at" in result:
                result["created_at"] = result["created_at"].isoformat()
            if "updated_at" in result:
                result["updated_at"] = result["updated_at"].isoformat()

        return jsonify({
            'results': results,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_count,
                'pages': (total_count + limit - 1) // limit
            }
        }), 200

    except Exception as e:
        print(f"Get results error: {e}")
        return jsonify({'error': 'Failed to get results'}), 500


@auth_bp.route('/results/<result_id>', methods=['DELETE'])
@jwt_required()
def delete_result(result_id):
    """Delete a specific processing result"""
    try:
        user_id = get_jwt_identity()

        from database import get_db
        from bson import ObjectId
        db = get_db()

        # Check if result exists and belongs to user
        result = db.processing_results.find_one({
            "_id": ObjectId(result_id),
            "user_id": user_id
        })

        if not result:
            return jsonify({'error': 'Result not found'}), 404

        # Delete from database
        db.processing_results.delete_one({"_id": ObjectId(result_id)})

        # TODO: Delete associated files from Cloudinary if needed

        return jsonify({'message': 'Result deleted successfully'}), 200

    except Exception as e:
        print(f"Delete result error: {e}")
        return jsonify({'error': 'Failed to delete result'}), 500


@auth_bp.route('/debug/users', methods=['GET'])
def list_users():
    """Debug: List all users"""
    try:
        from database import get_db
        db = get_db()
        users = list(db.users.find({}, {"password_hash": 0}))
        for user in users:
            user["_id"] = str(user["_id"])
        return jsonify({"users": users}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/debug/clear', methods=['POST'])
def clear_test_users():
    """Debug: Clear test users"""
    try:
        from database import get_db
        db = get_db()
        result = db.users.delete_many({})
        return jsonify({"message": f"Deleted {result.deleted_count} users"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
