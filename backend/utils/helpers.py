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
