"""
Analysis routes for Luna Photoclinometry Server
Handle quality analysis and metrics
"""

from flask import Blueprint
from app.controllers.analysis_controller import AnalysisController

analysis_bp = Blueprint('analysis', __name__)


@analysis_bp.route('/<job_id>/quality', methods=['GET'])
def get_quality_analysis(job_id):
    """Get detailed quality analysis"""
    return AnalysisController.get_quality_analysis(job_id)


@analysis_bp.route('/<job_id>/metrics', methods=['GET'])
def get_surface_metrics(job_id):
    """Get surface analysis metrics"""
    return AnalysisController.get_surface_metrics(job_id)


@analysis_bp.route('/<job_id>/report', methods=['GET'])
def get_analysis_report(job_id):
    """Get formatted analysis report"""
    return AnalysisController.get_analysis_report(job_id)


@analysis_bp.route('/<job_id>/compare', methods=['GET'])
def compare_with_reference(job_id):
    """Compare results with reference data"""
    return AnalysisController.compare_with_reference(job_id)
