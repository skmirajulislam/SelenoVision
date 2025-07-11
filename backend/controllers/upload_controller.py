"""
Upload controller for Luna photoclinometry operations
"""

import os
from flask import Blueprint, current_app, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from werkzeug.utils import secure_filename

from models.job import ProcessingJob, JobStatus, job_storage
from services.luna_processor import LunaProcessor
from utils.helpers import allowed_file, ensure_directory, cleanup_directory, cleanup_user_files

upload_bp = Blueprint('upload', __name__)


@upload_bp.route('/upload', methods=['POST'])
@jwt_required(optional=True)
def upload_and_process():
    """Upload lunar image and start processing"""
    try:
        # Get current user if authenticated
        user_id = None
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
        except Exception as e:
            pass  # Continue without authentication

        # Check if image file is present
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file = request.files['image']

        if file.filename == '':
            return jsonify({"error": "No image file selected"}), 400

        if not allowed_file(file.filename, current_app.config['ALLOWED_EXTENSIONS']):
            return jsonify({
                "error": f"Unsupported file type. Allowed: {', '.join(current_app.config['ALLOWED_EXTENSIONS'])}"
            }), 400

        # Cleanup previous uploads and results (server-side only, not from Cloudinary)
        if user_id:
            cleanup_user_files(user_id)

        # Cleanup old uploads directory completely
        cleanup_directory(current_app.config['UPLOAD_FOLDER'])

        # Cleanup old server_results directory completely
        cleanup_directory(current_app.config['RESULTS_FOLDER'])

        # Ensure directories exist
        ensure_directory(current_app.config['UPLOAD_FOLDER'])
        ensure_directory(current_app.config['RESULTS_FOLDER'])

        # Create new job
        job = ProcessingJob.create_new("", file.filename)

        # Save uploaded file
        filename = secure_filename(file.filename)
        file_path = os.path.join(
            current_app.config['UPLOAD_FOLDER'], f"{job.job_id}_{filename}")
        file.save(file_path)
        job.image_path = file_path

        # Store job
        job_storage[job.job_id] = job

        # Create database record for authenticated users
        if user_id:
            from models.processing_result import ProcessingResult
            result_id = ProcessingResult.create_result(
                user_id, job.job_id, file.filename)
            job.result_id = result_id

        # Submit for processing with user ID
        LunaProcessor.submit_processing_job(job, user_id)

        return jsonify({
            "job_id": job.job_id,
            "status": job.status.value,
            "message": "Image uploaded successfully. Processing started.",
            "filename": job.original_filename,
            "file_size": os.path.getsize(file_path) if os.path.exists(file_path) else 0,
            "user_authenticated": user_id is not None
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    @staticmethod
    def get_supported_formats():
        """Get supported file formats and limits"""
        return jsonify({
            "supported_formats": list(current_app.config['ALLOWED_EXTENSIONS']),
            "max_file_size_mb": current_app.config['MAX_CONTENT_LENGTH'] / (1024 * 1024),
            "compatible_missions": [
                "Chandrayaan TMC/TMC-2/OHRC",
                "NASA LRO NAC/WAC",
                "JAXA Selene TC"
            ],
            "recommended_formats": [".png", ".tiff", ".jpg"],
            "processing_capabilities": [
                "Shape-from-Shading photoclinometry",
                "Digital Elevation Model generation",
                "Surface quality analysis",
                "Multi-format visualization"
            ]
        })

    @staticmethod
    def validate_file():
        """Validate file before upload"""
        try:
            if 'image' not in request.files:
                return jsonify({"valid": False, "error": "No file provided"}), 400

            file = request.files['image']
            if file.filename == '':
                return jsonify({"valid": False, "error": "No file selected"}), 400

            # Check file extension
            if not allowed_file(file.filename, current_app.config['ALLOWED_EXTENSIONS']):
                return jsonify({
                    "valid": False,
                    "error": f"Unsupported format. Allowed: {', '.join(current_app.config['ALLOWED_EXTENSIONS'])}"
                }), 400

            # Check file size (approximate)
            file.seek(0, 2)  # Seek to end
            file_size = file.tell()
            file.seek(0)  # Reset to beginning

            if file_size > current_app.config['MAX_CONTENT_LENGTH']:
                return jsonify({
                    "valid": False,
                    "error": f"File too large. Max size: {current_app.config['MAX_CONTENT_LENGTH'] / (1024*1024):.0f}MB"
                }), 400

            return jsonify({
                "valid": True,
                "filename": file.filename,
                "file_size_mb": file_size / (1024 * 1024),
                "format": os.path.splitext(file.filename)[1].lower(),
                "message": "File validation successful"
            })

        except Exception as e:
            return jsonify({"valid": False, "error": str(e)}), 500
