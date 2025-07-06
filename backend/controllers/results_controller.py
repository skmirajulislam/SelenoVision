"""
Results controller for handling results retrieval and downloads
"""

import os
from flask import current_app, jsonify, send_file, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from PIL import Image
import mimetypes

from models.job import JobStatus, job_storage
from models.processing_result import ProcessingResult
from utils.helpers import get_job_directory


class ResultsController:
    """Handle results retrieval and downloads"""

    @staticmethod
    def get_results_summary(job_id: str):
        """Get comprehensive processing results"""
        if job_id not in job_storage:
            return jsonify({"error": "Job not found"}), 404

        job = job_storage[job_id]

        if job.status != JobStatus.COMPLETED:
            return jsonify({"error": "Job not completed yet"}), 400

        if not job.results:
            return jsonify({"error": "Results not available"}), 404

        return jsonify(job.results)

    @staticmethod
    def download_results(job_id: str):
        """Download complete results as ZIP file"""
        if job_id not in job_storage:
            return jsonify({"error": "Job not found"}), 404

        job = job_storage[job_id]

        if job.status != JobStatus.COMPLETED:
            return jsonify({"error": "Job not completed yet"}), 400

        zip_path = os.path.join(
            get_job_directory(job_id, current_app.config['RESULTS_FOLDER']),
            f"luna_results_{job_id}.zip"
        )

        if not os.path.exists(zip_path):
            return jsonify({"error": "Results file not found"}), 404

        return send_file(zip_path, as_attachment=True, download_name=f"luna_results_{job_id}.zip")

    @staticmethod
    def get_individual_file(job_id: str, filename: str):
        """Get individual result file"""
        if job_id not in job_storage:
            return jsonify({"error": "Job not found"}), 404

        job = job_storage[job_id]

        if job.status != JobStatus.COMPLETED:
            return jsonify({"error": "Job not completed yet"}), 400

        job_dir = get_job_directory(
            job_id, current_app.config['RESULTS_FOLDER'])

        # Search for file in job directory
        for root, dirs, files in os.walk(job_dir):
            if filename in files:
                file_path = os.path.join(root, filename)
                return send_file(file_path, as_attachment=True, download_name=filename)

        return jsonify({"error": "File not found"}), 404

    @staticmethod
    def list_result_files(job_id: str):
        """List all available result files"""
        if job_id not in job_storage:
            return jsonify({"error": "Job not found"}), 404

        job = job_storage[job_id]

        if job.status != JobStatus.COMPLETED:
            return jsonify({"error": "Job not completed yet"}), 400

        job_dir = get_job_directory(
            job_id, current_app.config['RESULTS_FOLDER'])

        if not os.path.exists(job_dir):
            return jsonify({"error": "Results directory not found"}), 404

        files_info = []
        for root, dirs, files in os.walk(job_dir):
            for file in files:
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, job_dir)
                file_size = os.path.getsize(file_path)

                # Get file type
                mime_type, _ = mimetypes.guess_type(file_path)
                file_type = "unknown"
                if mime_type:
                    if mime_type.startswith('image/'):
                        file_type = "image"
                    elif mime_type.startswith('application/'):
                        file_type = "data"
                    elif mime_type.startswith('text/'):
                        file_type = "text"

                files_info.append({
                    "filename": file,
                    "path": relative_path,
                    "size_bytes": file_size,
                    "size_mb": round(file_size / (1024 * 1024), 2),
                    "type": file_type,
                    "mime_type": mime_type
                })

        return jsonify({
            "job_id": job_id,
            "total_files": len(files_info),
            "files": files_info
        })

    @staticmethod
    def preview_file(job_id: str, filename: str):
        """Preview file (for images)"""
        if job_id not in job_storage:
            return jsonify({"error": "Job not found"}), 404

        job = job_storage[job_id]

        if job.status != JobStatus.COMPLETED:
            return jsonify({"error": "Job not completed yet"}), 400

        job_dir = get_job_directory(
            job_id, current_app.config['RESULTS_FOLDER'])

        # Search for file in job directory
        for root, dirs, files in os.walk(job_dir):
            if filename in files:
                file_path = os.path.join(root, filename)

                # Check if it's an image
                try:
                    with Image.open(file_path) as img:
                        return send_file(file_path, mimetype='image/png')
                except Exception:
                    return jsonify({"error": "File is not a valid image"}), 400

        return jsonify({"error": "File not found"}), 404

    @staticmethod
    @jwt_required()
    def get_user_results():
        """Get all processing results for the current user"""
        try:
            current_user_id = get_jwt_identity()
            print(f"Debug: current_user_id = {current_user_id}")

            if not current_user_id:
                return jsonify({
                    "success": False,
                    "error": "Authentication required"
                }), 401

            results = ProcessingResult.find_by_user_id(
                current_user_id, limit=100)

            print(
                f"Debug: Found {len(results)} results for user {current_user_id}")

            return jsonify({
                "success": True,
                "results": results,
                "total": len(results)
            })
        except Exception as e:
            print(f"Debug: Error in get_user_results: {e}")
            return jsonify({
                "success": False,
                "error": "Failed to retrieve results",
                "details": str(e)
            }), 500

    @staticmethod
    @jwt_required()
    def delete_user_result(result_id: str):
        """Delete a specific processing result"""
        try:
            current_user_id = get_jwt_identity()

            # First verify the result belongs to the current user
            result = ProcessingResult.find_by_id(result_id)
            if not result or result.get('user_id') != current_user_id:
                return jsonify({
                    "success": False,
                    "error": "Result not found or access denied"
                }), 404

            # Delete the result
            success = ProcessingResult.delete_result(result_id)

            if success:
                return jsonify({
                    "success": True,
                    "message": "Result deleted successfully"
                })
            else:
                return jsonify({
                    "success": False,
                    "error": "Failed to delete result"
                }), 500
        except Exception as e:
            return jsonify({
                "success": False,
                "error": "Failed to delete result",
                "details": str(e)
            }), 500
