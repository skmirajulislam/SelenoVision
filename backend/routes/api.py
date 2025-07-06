"""
API routes for Luna Photoclinometry Server
RESTful endpoints for image processing
"""

from flask import Blueprint, jsonify
from routes.status import status_bp
from routes.results import results_bp
from routes.analysis import analysis_bp

api_bp = Blueprint('api', __name__)

# Register sub-blueprints
api_bp.register_blueprint(status_bp, url_prefix='/status')
api_bp.register_blueprint(results_bp, url_prefix='/results')
api_bp.register_blueprint(analysis_bp, url_prefix='/analysis')


@api_bp.route('/')
def api_info():
    """API information endpoint"""
    return jsonify({
        "service": "Luna Photoclinometry API",
        "version": "1.0",
        "description": "High-Resolution Lunar DEM Generation from Single Images",
        "endpoints": {
            "status": "/api/status/",
            "results": "/api/results/",
            "analysis": "/api/analysis/",
            "upload": "/api/upload/"
        },
        "documentation": "/docs",
        "health": "/health"
    })


@api_bp.route('/health')
def api_health():
    """API health check"""
    from datetime import datetime
    from models.job import job_storage

    return jsonify({
        "status": "healthy",
        "service": "Luna Photoclinometry API",
        "version": "1.0",
        "timestamp": datetime.now().isoformat(),
        "active_jobs": len(job_storage),
        "endpoints_available": [
            "POST /api/upload/process",
            "GET /api/status/<job_id>",
            "GET /api/results/<job_id>/summary",
            "GET /api/results/<job_id>/download",
            "GET /api/analysis/<job_id>/quality"
        ]
    })
