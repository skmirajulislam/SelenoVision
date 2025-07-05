"""
Upload controller for Luna photoclinometry operations
"""

import os
from flask import current_app, request, jsonify
from werkzeug.utils import secure_filename

from app.models.job import ProcessingJob, JobStatus, job_storage
from app.services.luna_processor import LunaProcessor
from app.utils.helpers import allowed_file, ensure_directory


class UploadController:
    """Handle image upload and processing initiation"""

    @staticmethod
    def upload_and_process():
        """Upload lunar image and start processing"""
        try:
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

            # Ensure upload directory exists
            ensure_directory(current_app.config['UPLOAD_FOLDER'])

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

            # Submit for processing
            LunaProcessor.submit_processing_job(job)

            return jsonify({
                "job_id": job.job_id,
                "status": job.status.value,
                "message": "Image uploaded successfully. Processing started.",
                "filename": job.original_filename,
                "file_size": os.path.getsize(file_path) if os.path.exists(file_path) else 0
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
