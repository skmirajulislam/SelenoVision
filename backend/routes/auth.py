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

        # Create user
        user = User.create_user(email, username, password)

        if not user:
            return jsonify({
                'error': 'User with this email or username already exists'
            }), 409

        # Create JWT token
        access_token = create_access_token(identity=str(user._id))

        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'access_token': access_token
        }), 201

    except Exception as e:
        print(f"Registration error: {e}")
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


@auth_bp.route('/results', methods=['GET'])
@jwt_required()
def get_user_results():
    """Get all processing results for the current user"""
    try:
        user_id = get_jwt_identity()
        results = ProcessingResult.find_by_user_id(user_id)

        return jsonify({
            'results': [result.to_dict() for result in results]
        }), 200

    except Exception as e:
        print(f"Get results error: {e}")
        return jsonify({
            'error': 'Failed to get results'
        }), 500


@auth_bp.route('/results/<result_id>', methods=['DELETE'])
@jwt_required()
def delete_result(result_id):
    """Delete a specific processing result"""
    try:
        user_id = get_jwt_identity()
        result = ProcessingResult.find_by_id(result_id)

        if not result:
            return jsonify({
                'error': 'Result not found'
            }), 404

        if result.user_id != user_id:
            return jsonify({
                'error': 'Access denied'
            }), 403

        # Delete result and cloud files
        result.delete_result()

        return jsonify({
            'message': 'Result deleted successfully'
        }), 200

    except Exception as e:
        print(f"Delete result error: {e}")
        return jsonify({
            'error': 'Failed to delete result'
        }), 500


@auth_bp.route('/processing-status/<job_id>', methods=['GET'])
@jwt_required()
def get_processing_status(job_id):
    """Get processing status for a specific job"""
    try:
        user_id = get_jwt_identity()
        result = ProcessingResult.find_by_job_id(job_id)

        if not result:
            return jsonify({
                'error': 'Job not found'
            }), 404

        if result.user_id != user_id:
            return jsonify({
                'error': 'Access denied'
            }), 403

        # Calculate progress based on status
        progress = 0
        if result.status == 'processing':
            progress = 50  # Middle progress for processing
        elif result.status == 'completed':
            progress = 100
        elif result.status == 'failed':
            progress = 0

        return jsonify({
            'status': result.status,
            'progress': progress,
            'error': result.error_message,
            'job_id': result.job_id
        }), 200

    except Exception as e:
        print(f"Get processing status error: {e}")
        return jsonify({
            'error': 'Failed to get processing status'
        }), 500
