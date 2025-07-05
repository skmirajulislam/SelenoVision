# 🌙 Luna Photoclinometry Server - Structured Flask Application

## 📁 Project Structure

```
luna/
├── run_server.py                    # Main entry point
├── requirements_server.txt          # Server dependencies
├── luna_unified.py                  # Core processing system
├── uploads/                         # File upload directory
├── server_results/                  # Processing results
└── app/                            # Flask application package
    ├── __init__.py                 # App factory
    ├── config.py                   # Configuration settings
    ├── controllers/                # Business logic controllers
    │   └── api_controllers.py      # API endpoint controllers
    ├── models/                     # Data models
    │   └── job.py                  # Job processing models
    ├── routes/                     # URL routing
    │   ├── main.py                 # Main routes (docs, health)
    │   └── api.py                  # API routes (/api/*)
    ├── services/                   # Business services
    │   └── luna_processor.py       # Luna processing service
    ├── utils/                      # Utility functions
    │   └── helpers.py              # Helper functions
    ├── templates/                  # HTML templates
    │   └── swagger_ui.html         # Swagger documentation
    └── static/                     # Static assets
        ├── css/
        │   └── custom.css          # Custom styling
        └── js/                     # Future JavaScript files
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements_server.txt
```

### 2. Run Server
```bash
python run_server.py
```

### 3. Access Documentation
- **Swagger UI**: http://localhost:5000/
- **Health Check**: http://localhost:5000/health
- **API Base**: http://localhost:5000/api/

## 🔗 API Endpoints

### Upload & Processing
- `POST /api/upload/process` - Upload lunar image and start processing
- `GET /api/status/{job_id}` - Get processing status

### Results & Downloads
- `GET /api/results/{job_id}/summary` - Get results summary
- `GET /api/results/{job_id}/download` - Download ZIP package
- `GET /api/results/{job_id}/files/{filename}` - Download individual file

### Analysis
- `GET /api/analysis/{job_id}/quality` - Get quality analysis

### System
- `GET /health` - Server health check
- `GET /about` - System information

## 🛠️ Architecture

### MVC Pattern
- **Models**: Data structures and job management (`app/models/`)
- **Views**: Templates and API responses (`app/templates/`, controllers)
- **Controllers**: Business logic and request handling (`app/controllers/`)

### Service Layer
- **LunaProcessor**: Handles image processing workflow
- **Job Management**: Asynchronous job tracking and status updates

### Utilities
- **File Handling**: Upload validation, directory management
- **Result Packaging**: ZIP creation and file serving

## 🔧 Configuration

Server settings in `app/config.py`:
- File upload limits (50MB default)
- Processing timeouts
- Concurrent job limits
- API documentation settings

## 📊 Features

### Asynchronous Processing
- Background job execution
- Real-time status updates
- Progress tracking (0-100%)
- Error handling and recovery

### Professional Documentation
- Interactive Swagger UI
- Complete API specification
- Example requests and responses
- Space-themed modern design

### File Management
- Secure file uploads
- Format validation (PNG, JPG, TIF)
- Organized result storage
- ZIP packaging for downloads

### Quality Analysis
- Comprehensive DEM metrics
- Surface analysis reports
- Processing statistics
- Mission-critical assessments

## 🌍 Frontend Integration

The server is ready for frontend integration with:
- **CORS enabled** for cross-origin requests
- **RESTful API** with consistent JSON responses
- **Real-time updates** via status polling
- **Comprehensive error handling** with meaningful messages

Use the detailed frontend prompt in `frontend_prompt_for_lovable.md` to generate a modern React application that integrates seamlessly with this backend.

## 🚀 Production Deployment

For production deployment:
1. Use a WSGI server like Gunicorn
2. Configure environment variables
3. Set up proper database for job storage
4. Implement Redis for caching
5. Configure reverse proxy (nginx)

```bash
# Production example
gunicorn -w 4 -b 0.0.0.0:5000 run_server:app
```

---

**The Luna server is now properly structured, scalable, and ready for production use!** 🌙✨
