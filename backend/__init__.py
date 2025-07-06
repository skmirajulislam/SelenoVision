from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from werkzeug.middleware.proxy_fix import ProxyFix
from dotenv import load_dotenv
from database import init_db  # don't call get_db here
import os

load_dotenv()

def create_app():
    app = Flask(__name__)

    # Basic config
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default-secret')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default-jwt')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['RESULTS_FOLDER'] = 'server_results'

    # Init extensions
    JWTManager(app)
    init_db(app)  # ✅ Initialize MongoDB here (do NOT call get_db)

    # Proxy & CORS
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1)
    CORS(app, origins=[os.getenv("FRONTEND_URL", "http://localhost:8080")])


    # Blueprints
    from routes.main import main_bp
    from routes.api import api_bp

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


    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/auth")

    # Upload controller
    from controllers.upload_controller import upload_bp
    app.register_blueprint(upload_bp, url_prefix='/api')


    return app
