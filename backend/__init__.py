"""
Luna Photoclinometry Flask Application Factory
Main application initialization and configuration
"""

from flask import Flask
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix


def create_app():
    """Application factory pattern"""
    app = Flask(__name__)

    # Configuration
    app.config['SECRET_KEY'] = 'luna-photoclinometry-secret-key'
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['RESULTS_FOLDER'] = 'server_results'

    # Middleware
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1,
                            x_proto=1, x_host=1, x_prefix=1)

    # CORS
    CORS(app)

    # Register blueprints
    from routes.main import main_bp
    from routes.api import api_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix='/api')

    return app
