"""
Luna Photoclinometry Flask Application Factory
Main application initialization and configuration
"""

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from werkzeug.middleware.proxy_fix import ProxyFix
from dotenv import load_dotenv
import os

load_dotenv()


def create_app():
    """Application factory pattern"""
    app = Flask(__name__)

    # Configuration
    app.config['SECRET_KEY'] = os.getenv(
        'SECRET_KEY', 'luna-photoclinometry-secret-key')
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['RESULTS_FOLDER'] = 'server_results'

    # JWT Configuration
    app.config['JWT_SECRET_KEY'] = os.getenv(
        'JWT_SECRET_KEY', 'luna-jwt-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # Never expire for now

    # Initialize extensions
    jwt = JWTManager(app)

    # Initialize MongoDB
    from database import init_db
    init_db(app)

    # Middleware
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1,
                            x_proto=1, x_host=1, x_prefix=1)

    # CORS
    CORS(app, origins=[
        os.getenv('FRONTEND_URL', 'http://localhost:3000'),
        'http://localhost:8080',
        'http://localhost:8081',
        'http://localhost:3000',
        'http://localhost:5173'
    ])

    # Register blueprints
    try:
        from routes.main import main_bp
        app.register_blueprint(main_bp)
    except ImportError:
        pass

    try:
        from routes.api import api_bp
        app.register_blueprint(api_bp, url_prefix='/api')
    except ImportError:
        pass

    # Auth routes
    from routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api')

    # Upload controller
    from controllers.upload_controller import upload_bp
    app.register_blueprint(upload_bp, url_prefix='/api')

    return app
