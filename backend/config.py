"""
Configuration settings for Luna Photoclinometry Server
"""

import os
from datetime import timedelta


class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get(
        'SECRET_KEY') or 'luna-photoclinometry-secret-key'

    # File upload settings
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB
    UPLOAD_FOLDER = 'uploads'
    RESULTS_FOLDER = 'server_results'
    ALLOWED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.tif', '.tiff'}

    # Processing settings
    MAX_CONCURRENT_JOBS = 3
    JOB_TIMEOUT = 3600  # 1 hour

    # API settings
    API_TITLE = 'Luna Photoclinometry API'
    API_VERSION = '1.0'
    API_DESCRIPTION = 'REST API for generating high-resolution lunar Digital Elevation Models'


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
