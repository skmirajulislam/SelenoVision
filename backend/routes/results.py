"""
Results routes for Luna Photoclinometry Server
Handle results retrieval and file downloads
"""

from flask import Blueprint
from controllers.results_controller import ResultsController

results_bp = Blueprint('results', __name__)


@results_bp.route('/', methods=['GET'])
def get_user_results():
    """Get all processing results for the current user"""
    return ResultsController.get_user_results()


@results_bp.route('/<result_id>', methods=['DELETE'])
def delete_user_result(result_id):
    """Delete a specific processing result"""
    return ResultsController.delete_user_result(result_id)


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


@results_bp.route('/dashboard', methods=['GET'])
def get_dashboard_data():
    """Get dashboard data with statistics and recent results"""
    return ResultsController.get_dashboard_data()
