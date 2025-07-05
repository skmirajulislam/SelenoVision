"""
Upload routes for Luna Photoclinometry Server
Handle image upload and processing initiation
"""

from flask import Blueprint
from app.controllers.upload_controller import UploadController

upload_bp = Blueprint('upload', __name__)


@upload_bp.route('/process', methods=['POST'])
def upload_and_process():
    """Upload lunar image and start processing"""
    return UploadController.upload_and_process()


@upload_bp.route('/formats', methods=['GET'])
def get_supported_formats():
    """Get supported file formats and limits"""
    return UploadController.get_supported_formats()


@upload_bp.route('/validate', methods=['POST'])
def validate_file():
    """Validate file before upload"""
    return UploadController.validate_file()
