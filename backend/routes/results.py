"""
Results routes for Luna Photoclinometry Server
Handle results retrieval and file downloads
"""

from flask import Blueprint
from app.controllers.results_controller import ResultsController

results_bp = Blueprint('results', __name__)


@results_bp.route('/<job_id>/summary', methods=['GET'])
def get_results_summary(job_id):
    """Get comprehensive processing results"""
    return ResultsController.get_results_summary(job_id)


@results_bp.route('/<job_id>/download', methods=['GET'])
def download_results(job_id):
    """Download complete results as ZIP file"""
    return ResultsController.download_results(job_id)


@results_bp.route('/<job_id>/files/<filename>', methods=['GET'])
def get_individual_file(job_id, filename):
    """Get individual result file"""
    return ResultsController.get_individual_file(job_id, filename)


@results_bp.route('/<job_id>/files', methods=['GET'])
def list_result_files(job_id):
    """List all available result files"""
    return ResultsController.list_result_files(job_id)


@results_bp.route('/<job_id>/preview/<filename>', methods=['GET'])
def preview_file(job_id, filename):
    """Preview file (for images)"""
    return ResultsController.preview_file(job_id, filename)
