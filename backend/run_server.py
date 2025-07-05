"""
Luna Photoclinometry Server - Main Entry Point
Structured Flask application with proper organization
"""

import os
from backend import create_app
from backend.config import config
from backend.utils.helpers import ensure_directory


def setup_directories():
    """Ensure required directories exist"""
    directories = ['uploads', 'server_results', 'data']
    for directory in directories:
        ensure_directory(directory)


def main():
    """Main entry point"""
    # Setup directories
    setup_directories()

    # Create app
    config_name = os.environ.get('FLASK_ENV', 'development')
    app = create_app()
    app.config.from_object(config[config_name])

    # Set additional config
    app.config['ALLOWED_EXTENSIONS'] = {
        '.png', '.jpg', '.jpeg', '.tif', '.tiff'}

    print("\n" + "="*60)
    print("🌙 LUNA PHOTOCLINOMETRY SERVER")
    print("="*60)
    print("🚀 High-Resolution Lunar DEM Generation API")
    print("📡 Structured Flask Application")
    print("🔗 CORS Enabled for Frontend Integration")
    print("🏠 Landing Page: http://localhost:5000/")
    print("📚 Swagger Documentation: http://localhost:5000/docs")
    print("🔧 Health Check: http://localhost:5000/health")
    print("⚡ API Base: http://localhost:5000/api/")
    print("="*60 + "\n")

    # Run the app
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True
    )


if __name__ == '__main__':
    main()
