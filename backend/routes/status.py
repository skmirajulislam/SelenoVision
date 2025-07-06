"""
Status routes for Luna Photoclinometry Server
Handle job status monitoring and tracking
"""

from flask import Blueprint
from controllers.status_controller import StatusController

status_bp = Blueprint('status', __name__)


@status_bp.route('/<job_id>', methods=['GET'])
def get_job_status(job_id):
    """Get job processing status"""
    return StatusController.get_job_status(job_id)


@status_bp.route('/processing-status/<job_id>', methods=['GET'])
def get_processing_status(job_id):
    """Get processing status for frontend polling"""
    return StatusController.get_job_status(job_id)


@status_bp.route('/<job_id>/detailed', methods=['GET'])
def get_detailed_status(job_id):
    """Get detailed job status with processing steps"""
    return StatusController.get_detailed_status(job_id)


@status_bp.route('/all', methods=['GET'])
def get_all_jobs():
    """Get all job statuses (admin endpoint)"""
    return StatusController.get_all_jobs()


@status_bp.route('/<job_id>/cancel', methods=['POST'])
def cancel_job(job_id):
    """Cancel a processing job"""
    return StatusController.cancel_job(job_id)
