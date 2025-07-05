"""
Main routes for Luna Photoclinometry Server
Handles documentation and root endpoints
"""

from flask import Blueprint, render_template, jsonify
from datetime import datetime

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def landing_page():
    """Landing page with overview and documentation link"""
    return render_template('index.html')


@main_bp.route('/docs')
def api_documentation():
    """Swagger API documentation"""
    return render_template('swagger_ui.html')


@main_bp.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Luna Photoclinometry API",
        "version": "1.0",
        "timestamp": datetime.now().isoformat()
    })


@main_bp.route('/about')
def about():
    """About Luna system"""
    return jsonify({
        "name": "Luna Photoclinometry System",
        "description": "High-Resolution Lunar DEM Generation from Single Images",
        "version": "1.0",
        "author": "Luna Photoclinometry Team",
        "capabilities": [
            "Shape-from-Shading photoclinometry",
            "Digital Elevation Model generation",
            "Lunar surface analysis",
            "Mission-critical terrain assessment",
            "Multi-format image compatibility"
        ],
        "supported_formats": [".png", ".jpg", ".jpeg", ".tif", ".tiff"],
        "max_file_size": "50MB"
    })
