"""
Utility functions for Luna server
"""

import os
import zipfile
from typing import Set
from werkzeug.utils import secure_filename


def allowed_file(filename: str, allowed_extensions: Set[str]) -> bool:
    """Check if file extension is allowed"""
    return any(filename.lower().endswith(ext) for ext in allowed_extensions)


def get_file_extension(filename: str) -> str:
    """Get file extension"""
    return os.path.splitext(filename)[1].lower()


def ensure_directory(path: str):
    """Ensure directory exists"""
    os.makedirs(path, exist_ok=True)


def get_job_directory(job_id: str, results_folder: str) -> str:
    """Get job-specific directory"""
    return os.path.join(results_folder, job_id)


def create_results_zip(job_id: str, results_folder: str) -> str:
    """Create ZIP file with all results"""
    job_dir = get_job_directory(job_id, results_folder)
    zip_path = os.path.join(job_dir, f"luna_results_{job_id}.zip")

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add all files from output and analysis directories
        for root, dirs, files in os.walk(job_dir):
            for file in files:
                if file.endswith('.zip'):
                    continue  # Skip the zip file itself
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, job_dir)
                zipf.write(file_path, arcname)

    return zip_path


def cleanup_directory(directory: str):
    """Clean up entire directory contents"""
    import shutil
    if os.path.exists(directory):
        try:
            shutil.rmtree(directory)
            os.makedirs(directory, exist_ok=True)
        except Exception as e:
            print(f"Error cleaning up directory {directory}: {e}")


def cleanup_user_files(user_id: str):
    """Clean up files for a specific user from server directories"""
    from database import get_db

    try:
        # Get user's processing results
        db = get_db()
        user_results = list(db.processing_results.find({'user_id': user_id}))

        # Clean up server_results directory for this user
        results_folder = 'server_results'
        if os.path.exists(results_folder):
            for result in user_results:
                job_id = result.get('job_id')
                if job_id:
                    job_dir = os.path.join(results_folder, job_id)
                    if os.path.exists(job_dir):
                        try:
                            import shutil
                            shutil.rmtree(job_dir)
                        except Exception as e:
                            print(
                                f"Error cleaning up job directory {job_dir}: {e}")

    except Exception as e:
        print(f"Error during user file cleanup: {e}")


def cleanup_old_files(directory: str, max_age_hours: int = 24):
    """Clean up old files (for maintenance)"""
    import time
    current_time = time.time()
    max_age_seconds = max_age_hours * 3600

    for root, dirs, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            if os.path.isfile(file_path):
                file_age = current_time - os.path.getmtime(file_path)
                if file_age > max_age_seconds:
                    try:
                        os.remove(file_path)
                    except OSError:
                        pass  # Ignore errors during cleanup
