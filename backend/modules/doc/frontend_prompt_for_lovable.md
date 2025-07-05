# 🚀 Luna Photoclinometry Frontend - AI Prompt for Lovable.ai

## Project Overview
Create a modern, responsive web application for the **Luna Photoclinometry System** - a cutting-edge lunar surface analysis platform that generates high-resolution Digital Elevation Models (DEMs) from single lunar images using advanced photoclinometry techniques.

## 🎯 Core Requirements

### **Theme & Design**
- **Space Research Theme**: Deep space aesthetic with cosmic colors, starfield backgrounds, and lunar surface imagery
- **Metallic Background**: Dark metallic textures with gradient overlays (deep blues, purples, silvers)
- **Modern UI**: Clean, futuristic interface with glass-morphism effects and subtle animations
- **Responsive Design**: Mobile-first approach, optimized for all screen sizes
- **Professional Feel**: Scientific/research-oriented design suitable for space agencies and researchers

### **Authentication System**
- **Sign-in/Sign-up Pages**: Modern forms with validation
- **MongoDB Backend Integration**: User accounts, session management, and profile storage
- **Protected Routes**: Require authentication to access processing features
- **User Dashboard**: Personal processing history and saved results

### **Technology Stack**
- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS with custom space theme
- **State Management**: Context API or Redux Toolkit
- **Authentication**: JWT tokens with MongoDB backend
- **API Integration**: Axios for Luna server communication
- **UI Components**: Headless UI or Radix UI with custom styling
- **File Upload**: React Dropzone with progress indicators
- **Charts/Visualizations**: Chart.js or Recharts for analysis display

## 🛠️ Required Features & Components

### **1. Navigation & Layout**
```typescript
// Modern navbar with space theme
- Logo: "Luna Photoclinometry" with moon icon
- Navigation: Home, Dashboard, Documentation, About
- User menu: Profile, Settings, Logout
- Responsive hamburger menu for mobile
- Glass-morphism effect with backdrop blur
```

### **2. Authentication Pages**
```typescript
// Sign-in Page
- Email/password login form
- "Remember me" checkbox
- Forgot password link
- Sign-up redirect link
- Social login options (optional)

// Sign-up Page  
- Full name, email, password, confirm password
- Terms & conditions checkbox
- Account verification flow
- Automatic login after successful registration
```

### **3. Main Dashboard**
```typescript
// Dashboard layout with sections:
- Welcome banner with user name
- Quick stats: Total images processed, successful analyses
- Recent processing jobs table
- "New Analysis" CTA button
- Processing history with pagination
```

### **4. Image Upload & Processing Interface**
```typescript
// Upload Component
- Drag & drop zone with preview
- File validation (PNG, JPG, TIF - max 50MB)
- Upload progress bar
- Image preview with metadata display
- Processing configuration options
- Submit button with loading state

// Supported formats notice:
"Supports lunar imagery from Chandrayaan, LRO, Selene missions"
```

### **5. Real-time Processing Status**
```typescript
// Job Status Component
- Progress bar with percentage
- Status messages (queued, processing, completed, failed)
- Real-time updates via polling
- Processing stages display:
  * "Loading and validating image..."
  * "Computing illumination vector..."
  * "Running Shape-from-Shading optimization..."
  * "Scaling DEM to physical units..."
  * "Creating outputs..."
  * "Creating visualizations..."
  * "Analyzing DEM quality..."
  * "Processing completed successfully!"
- Estimated time remaining
- Cancel processing option
```

### **6. Results Display Interface**
```typescript
// Results Dashboard
- Interactive image gallery with zoom
- Generated files download section:
  * Ultra-clear DEM visualization
  * High-contrast terrain map
  * Publication-quality DEM
  * 3D lunar terrain view
  * GeoTIFF DEM file
  * OBJ 3D model
  * Analysis reports (JSON, TXT)
  * Complete results ZIP

// Analysis Panel
- Quality metrics display
- Surface statistics table
- Processing information
- Convergence analysis chart
- Interactive visualization toggles
```

### **7. File Management**
```typescript
// Downloads Interface
- Individual file download buttons
- Bulk download (ZIP) option
- File preview capabilities
- Share results functionality
- Export to cloud storage options
```

## 🔌 Backend API Integration

### **Luna Server Endpoints** (http://localhost:5000)
```javascript
// API endpoints to integrate:
POST /api/upload/process        // Upload and start processing
GET  /api/status/{job_id}       // Get processing status
GET  /api/results/{job_id}/summary    // Get results summary
GET  /api/results/{job_id}/download   // Download ZIP
GET  /api/results/{job_id}/files/{filename}  // Individual files
GET  /api/analysis/{job_id}/quality   // Quality analysis
GET  /health                    // Server health check
```

### **API Integration Examples**
```typescript
// File upload with progress tracking
const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await axios.post('/api/upload/process', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progress) => setUploadProgress(progress)
  });
  
  return response.data.job_id;
};

// Status polling
const pollJobStatus = async (jobId: string) => {
  const response = await axios.get(`/api/status/${jobId}`);
  return response.data;
};

// Results retrieval
const getResults = async (jobId: string) => {
  const response = await axios.get(`/api/results/${jobId}/summary`);
  return response.data;
};
```

## 🎨 Visual Design Specifications

### **Color Palette**
```css
/* Primary Colors */
--primary-bg: #0a0a0f;          /* Deep space black */
--secondary-bg: #1a1a2e;        /* Dark blue */
--accent-blue: #16213e;         /* Cosmic blue */
--accent-purple: #533483;       /* Nebula purple */
--metallic: #2c3e50;            /* Metallic base */
--gold: #f39c12;                /* Solar gold */

/* Text Colors */
--text-primary: #ffffff;        /* Pure white */
--text-secondary: #b8b8b8;      /* Light gray */
--text-accent: #64b5f6;         /* Bright blue */

/* Status Colors */
--success: #4caf50;             /* Success green */
--warning: #ff9800;             /* Warning orange */
--error: #f44336;               /* Error red */
--processing: #2196f3;          /* Processing blue */
```

### **Typography**
```css
/* Font Stack */
font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;

/* Headings */
h1: 2.5rem, font-weight: 700, letter-spacing: -0.025em
h2: 2rem, font-weight: 600
h3: 1.5rem, font-weight: 600
body: 1rem, font-weight: 400, line-height: 1.6
```

### **Components Styling**
```css
/* Glass-morphism Cards */
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

/* Metallic Buttons */
.metallic-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

/* Upload Zone */
.upload-zone {
  border: 2px dashed #64b5f6;
  background: radial-gradient(circle, rgba(100, 181, 246, 0.1), transparent);
}
```

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: < 768px (single column layout)
- **Tablet**: 768px - 1024px (adapted grid)
- **Desktop**: > 1024px (full grid layout)

### **Mobile Optimizations**
- Touch-friendly interface elements (min 44px tap targets)
- Swipe gestures for image gallery
- Collapsible sections for better space usage
- Optimized file upload for mobile cameras
- Pull-to-refresh on status pages

## 🔐 Security & Performance

### **Security Features**
- Input validation and sanitization
- CSRF protection
- Secure file upload validation
- JWT token management
- Rate limiting on API calls

### **Performance Optimizations**
- Image lazy loading
- Component code splitting
- API response caching
- Progressive image loading
- Optimized bundle size

## 📄 Page Structure & Routes

```typescript
// Route structure
/                           // Landing page
/signin                     // Authentication
/signup                     // Registration  
/dashboard                  // Main dashboard (protected)
/upload                     // Image upload (protected)
/processing/:jobId          // Processing status (protected)
/results/:jobId             // Results display (protected)
/profile                    // User profile (protected)
/documentation              // API documentation
/about                      // About Luna system
```

## 🚀 Key User Flows

### **1. New User Registration**
1. Visit landing page → See Luna capabilities
2. Click "Get Started" → Sign-up form
3. Complete registration → Email verification
4. Auto-login → Welcome dashboard

### **2. Image Processing**
1. Dashboard → Click "New Analysis"
2. Upload lunar image → Validate format
3. Configure settings → Start processing
4. Real-time status → View progress
5. Processing complete → View results
6. Download outputs → Save to profile

### **3. Results Management**
1. Dashboard history → Select previous job
2. View results → Interactive gallery
3. Download files → Individual or ZIP
4. Share results → Generate public links

## 💡 Special Features

### **Interactive Elements**
- **Image Comparison Slider**: Before/after DEM visualization
- **3D Model Viewer**: Rotate and examine lunar terrain
- **Zoom & Pan**: High-resolution image exploration
- **Processing Animation**: Visual feedback during computation
- **Toast Notifications**: Status updates and confirmations

### **Educational Content**
- **Tooltips**: Explain photoclinometry concepts
- **Help Center**: Processing guidelines and tips
- **Sample Gallery**: Example inputs and outputs
- **Technical Documentation**: API and method details

## 🎯 Success Metrics

### **User Experience Goals**
- **Load Time**: < 3 seconds initial load
- **Upload Speed**: Support up to 50MB files
- **Mobile Performance**: 60 FPS animations
- **Accessibility**: WCAG 2.1 AA compliance
- **Browser Support**: Chrome, Firefox, Safari, Edge

### **Technical Requirements**
- **API Integration**: Seamless backend communication
- **Error Handling**: Graceful failure management
- **State Management**: Persistent user sessions
- **Real-time Updates**: Live processing status
- **File Management**: Efficient upload/download

---

## 📋 Implementation Checklist

### **Phase 1: Core Setup**
- [ ] Project initialization with TypeScript + React
- [ ] Tailwind CSS configuration with space theme
- [ ] Authentication system with MongoDB
- [ ] Basic routing and protected routes
- [ ] Responsive navigation component

### **Phase 2: Main Features**
- [ ] Image upload with drag & drop
- [ ] API integration for processing
- [ ] Real-time status polling
- [ ] Results display interface
- [ ] File download management

### **Phase 3: Polish & Optimization**
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Error handling & validation
- [ ] Accessibility features
- [ ] Testing & debugging

---

**Build a modern, professional lunar analysis platform that scientists and researchers would be proud to use. Focus on user experience, visual appeal, and seamless integration with the Luna backend API.**
