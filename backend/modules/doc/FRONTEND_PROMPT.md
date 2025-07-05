# 🌙 Luna Photoclinometry Frontend Development Prompt

## 🎯 Project Overview

Build a **modern, responsive React frontend** for the Luna Photoclinometry API - a high-resolution lunar Digital Elevation Model (DEM) generation system that uses Shape-from-Shading algorithms to process single lunar images.

## 🚀 Backend API Information

### **Base URL**: `http://localhost:5000`

### **Core API Endpoints**:
```
POST   /api/upload/process           - Upload lunar image for processing
GET    /api/status/{job_id}          - Check processing status
GET    /api/results/{job_id}/summary - Get processing results
GET    /api/results/{job_id}/download - Download ZIP with all results
GET    /api/results/{job_id}/files/{filename} - Download specific file
GET    /api/analysis/{job_id}/quality - Get quality analysis
GET    /api/health                   - API health check
GET    /health                       - Server health check
```

### **Documentation**: `http://localhost:5000/docs` (Swagger UI)

## 🎨 UI/UX Requirements

### **Design Theme**: 
- **Space/Lunar themed** with dark backgrounds
- **Colors**: Deep blues (#0a0a0f, #1a1a2e, #16213e), gradients (#667eea to #764ba2)
- **Modern glassmorphism** effects with backdrop blur
- **Professional scientific interface** suitable for space research

### **Key Pages/Sections**:

#### 1. **Landing Page**
- Hero section with gradient background
- "Luna Photoclinometry API" title with rocket emoji 🚀
- Subtitle: "High-Resolution Lunar DEM Generation System"
- Feature cards showcasing:
  - 🌙 **Lunar Surface Analysis** - Generate high-resolution DEMs from single lunar images
  - ⚡ **Asynchronous Processing** - Background processing with real-time status updates
  - 📊 **Comprehensive Analysis** - Quality metrics and mission-critical terrain assessment
  - 📁 **Multi-Format Output** - GeoTIFF DEMs, 3D models, visualizations, and reports

#### 2. **Upload/Processing Page**
- **Drag & drop file upload** (PNG, JPG, TIF files, max 50MB)
- **Supported missions**: Chandrayaan TMC/TMC-2/OHRC, NASA LRO, JAXA Selene
- **Real-time progress tracking** with percentage and status messages
- **Preview of uploaded image**
- **Processing pipeline visualization**

#### 3. **Results Dashboard**
- **Job status overview** with cards for each processing job
- **Progress indicators** for active jobs
- **Results preview** for completed jobs
- **Download options**:
  - Individual files (GeoTIFF, OBJ model, visualizations)
  - Complete ZIP archive
  - Analysis reports

#### 4. **Analysis Viewer**
- **Interactive DEM visualization**
- **Quality metrics display**
- **Before/after comparison** (original image vs generated DEM)
- **3D model preview** if possible
- **Analysis charts and graphs**

## 📊 Data Flow & Integration

### **Upload Workflow**:
```
1. User selects lunar image file
2. Frontend validates file (type, size)
3. POST /api/upload/process → Returns job_id
4. Start polling GET /api/status/{job_id}
5. Show real-time progress updates
6. On completion, redirect to results
```

### **Status Response Structure**:
```json
{
  "job_id": "uuid-string",
  "status": "queued|processing|completed|failed",
  "progress": 0-100,
  "message": "Current processing step",
  "created_at": "ISO datetime",
  "updated_at": "ISO datetime",
  "error_message": null
}
```

### **Results Response Structure**:
```json
{
  "job_id": "uuid",
  "analysis_results": {
    "quality_metrics": {...},
    "surface_statistics": {...},
    "terrain_assessment": {...}
  },
  "processing_info": {
    "iterations": 150,
    "converged": true,
    "processing_time": "5.2 minutes"
  },
  "output_files": {
    "geotiff": "lunar_dem.tif",
    "obj_model": "lunar_surface.obj",
    "visualizations": ["ultra_clear_dem.png", ...],
    "analysis": ["analysis_report.txt", ...]
  }
}
```

## 🛠 Technical Requirements

### **Framework**: React 18+ with TypeScript
### **State Management**: React Context or Zustand
### **Styling**: Tailwind CSS or Styled Components
### **HTTP Client**: Axios or Fetch API
### **File Upload**: React Dropzone
### **Charts**: Chart.js or Recharts
### **Icons**: React Icons or Lucide React

### **Key Features to Implement**:

#### 1. **File Upload Component**
- Drag & drop interface
- File validation (type, size)
- Progress bar during upload
- Error handling and user feedback

#### 2. **Real-time Status Polling**
- WebSocket or polling mechanism
- Progress visualization
- Status message updates
- Error handling for failed jobs

#### 3. **Results Management**
- Job history persistence (localStorage)
- Download management
- File preview capabilities
- Results sharing/export

#### 4. **Responsive Design**
- Mobile-first approach
- Desktop optimization
- Touch-friendly interactions
- Cross-browser compatibility

## 🎯 User Experience Goals

### **Primary Use Cases**:
1. **Space Researchers** uploading Chandrayaan/LRO images for analysis
2. **Mission Planners** analyzing lunar terrain for landing site selection
3. **Scientists** generating DEMs for geological studies

### **Performance Requirements**:
- **Fast initial load** (< 3 seconds)
- **Responsive interactions** (< 100ms)
- **Efficient file handling** for large images
- **Smooth animations** and transitions

### **Accessibility**:
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## 📱 Component Structure Suggestion

```
src/
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorBoundary.tsx
│   ├── upload/
│   │   ├── FileUpload.tsx
│   │   ├── UploadProgress.tsx
│   │   └── FileValidator.tsx
│   ├── results/
│   │   ├── JobCard.tsx
│   │   ├── ResultsViewer.tsx
│   │   ├── DownloadManager.tsx
│   │   └── AnalysisCharts.tsx
│   └── features/
│       ├── FeatureCard.tsx
│       └── StatusIndicator.tsx
├── pages/
│   ├── Home.tsx
│   ├── Upload.tsx
│   ├── Dashboard.tsx
│   └── Results.tsx
├── services/
│   ├── api.ts
│   ├── fileUpload.ts
│   └── polling.ts
├── hooks/
│   ├── useFileUpload.ts
│   ├── useJobStatus.ts
│   └── usePolling.ts
└── types/
    ├── api.ts
    └── job.ts
```

## 🌟 Advanced Features (Nice to Have)

1. **Real-time WebSocket updates** instead of polling
2. **3D DEM visualization** using Three.js
3. **Image comparison sliders** (before/after)
4. **Batch processing** for multiple images
5. **User authentication** and job history
6. **Export to different formats** (PDF reports, etc.)
7. **Integration with mapping libraries** for geographical context

## 🚀 Getting Started

1. **Set up React project** with TypeScript and Tailwind CSS
2. **Implement the landing page** with the space theme
3. **Create the file upload component** with validation
4. **Build the status polling system**
5. **Develop the results dashboard**
6. **Add responsive design and animations**
7. **Test with the Luna backend API**

## 📋 Testing the Backend

The Luna Photoclinometry backend is running at `http://localhost:5000` with:
- ✅ **Landing page**: `http://localhost:5000/`
- ✅ **API documentation**: `http://localhost:5000/docs`
- ✅ **Health check**: `http://localhost:5000/health`
- ✅ **All endpoints working** and tested

## 🎨 Design Inspiration

Base the design on the current backend landing page which features:
- **Gradient backgrounds** (deep space blues to purples)
- **Feature cards** with glassmorphism effects
- **Modern typography** (Inter font family)
- **Space iconography** (🚀, 🌙, ⚡, 📊, 📁)
- **Professional scientific aesthetics**

This frontend should provide an intuitive, beautiful interface for lunar surface analysis that matches the sophisticated backend processing capabilities!
