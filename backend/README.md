# Luna Photoclinometry - Unified Processing System

Advanced Shape-from-Shading (SfS) pipeline for lunar surface reconstruction using photoclinometry techniques.

## 🌙 Overview

This project implements a comprehensive photoclinometry system for reconstructing 3D lunar surface topography from single images. The system uses advanced Shape-from-Shading algorithms with optimized numerical methods to generate high-quality Digital Elevation Models (DEMs) from lunar imagery.

**Version 3.0 - Final Unified Edition**: All functionality has been consolidated into a single entry-point script for maximum simplicity and ease of use.

## ✨ Features

### Core Capabilities
- **Single Entry Point**: Complete pipeline in one unified script (`luna_unified.py`)
- **Multi-format Image Support**: Handles PNG, JPG, JPEG, TIFF formats with automatic detection and prioritization
- **Optimized SfS Algorithm**: Vectorized computations with adaptive regularization and bilateral filtering
- **Comprehensive Output Generation**: GeoTIFF DEMs, OBJ 3D models, 2D/3D visualizations
- **Quality Analysis**: Automated DEM quality assessment with scoring and detailed metrics
- **Automatic Cleanup**: Cleans and recreates output directories on each run
- **Robust Error Handling**: Graceful handling of various image formats and edge cases
- **Git LFS Support**: Efficient handling of large output files

### Algorithm Optimizations
- **Smart Initialization**: Uses image intensity for better starting conditions
- **Adaptive Regularization**: Automatically adjusts based on image characteristics
- **Bilateral Filtering**: Edge-preserving smoothing for better surface reconstruction
- **Vectorized Operations**: Efficient numerical computations for faster processing
- **Convergence Monitoring**: Real-time tracking of algorithm progress

### Data Compatibility
- ✅ Chandrayaan missions (TMC, TMC-2, IIRS, OHRC)
- ✅ NASA missions (LRO NAC/WAC, M3)
- ✅ JAXA mission (Selene)
- ✅ Standard image formats (PNG, JPG, JPEG, TIFF)
- ✅ Automatic format detection and prioritization

## 🚀 Quick Start

### Installation

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Add Images**: Place lunar images in the `data/` directory
   - Supported formats: PNG, JPG, JPEG, TIFF
   - The system will automatically detect and select the best image for processing
   - Multiple images are tested for compatibility

3. **Run Processing**:
   ```bash
   python luna_unified.py
   ```

4. **View Results**: 
   - Output files in `output/` directory (GeoTIFF, OBJ, visualizations)
   - Analysis results in `analysis/` directory (quality reports, detailed metrics)

### What Happens When You Run

1. **Setup & Cleanup**: Automatically cleans previous outputs
2. **Image Detection**: Scans for all supported image formats
3. **Format Testing**: Tests compatibility of all found images
4. **Best Image Selection**: Automatically selects optimal image for processing
5. **SfS Processing**: Runs optimized Shape-from-Shading algorithm
6. **Output Generation**: Creates GeoTIFF, OBJ, and visualization files
7. **Quality Analysis**: Performs comprehensive DEM quality assessment
8. **Summary Report**: Displays processing results and file locations

## 📊 Generated Outputs

### Output Directory (`output/`)
- **`lunar_dem.tif`** - Georeferenced Digital Elevation Model (GeoTIFF)
- **`lunar_surface.obj`** - 3D model for visualization (Wavefront OBJ)
- **`processing_results.png`** - Input vs output comparison visualization
- **`3d_surface.png`** - 3D surface visualization
- **`optimization_history.png`** - Algorithm convergence plots

### Analysis Directory (`analysis/`)
- **`analysis_report.txt`** - Human-readable quality report
- **`detailed_analysis.json`** - Detailed metrics and statistics

### Quality Metrics
- **Height Statistics**: Min, max, mean, standard deviation
- **Gradient Analysis**: Slope distribution and terrain roughness
- **Correlation Analysis**: Surface-to-image correlation
- **Quality Score**: Overall DEM quality rating (0-100)

## ⚙️ Configuration

The system uses intelligent defaults but can be customized by editing the `CONFIG` dictionary in `luna_unified.py`:

```python
CONFIG = {
    # Illumination geometry (critical for SFS)
    "sun_azimuth_deg": 101.554510,
    "sun_elevation_deg": 34.802249,
    
    # Algorithm parameters
    "max_iterations": 100,
    "convergence_threshold": 1e-6,
    "regularization_lambda": 0.1,
    
    # Physical scaling
    "dem_scale_factor": 1000.0,
    "pixel_size_meters": 100.0,
    
    # Output options
    "create_geotiff": True,
    "create_obj": True,
    "create_visualizations": True,
    "perform_analysis": True,
}
```

## 🧮 Algorithm Details

### Shape-from-Shading Process
1. **Multi-format Detection**: Automatically finds and tests all supported image formats
2. **Image Preprocessing**: Normalization, grayscale conversion, and validation
3. **Light Vector Calculation**: From solar illumination geometry
4. **Surface Reconstruction**: Advanced SFS with adaptive regularization
5. **Bilateral Filtering**: Edge-preserving smoothing for better surface quality
6. **Physical Scaling**: Convert to absolute elevation values (meters)
7. **Output Generation**: Create GeoTIFF, OBJ, and visualization files
8. **Quality Assessment**: Comprehensive DEM analysis and scoring

### Key Improvements in Version 3.0
- **Unified Processing**: All functionality in single script
- **Multi-format Support**: Automatic detection and prioritization
- **Enhanced Robustness**: Better error handling and edge cases
- **Comprehensive Analysis**: Detailed quality metrics and scoring
- **Automatic Cleanup**: Fresh outputs on each run
- **Real-time Monitoring**: Progress tracking with tqdm

## 📈 Performance

- **Typical Processing Time**: 30-300 seconds (depending on image size)
- **Memory Usage**: ~2-4x image size in RAM
- **Supported Resolutions**: 512x512 to 16,000x16,000+ pixels
- **Quality Score**: Automated 0-100 rating system
- **Output Size**: GeoTIFF (~50-100MB), OBJ (~500MB-2GB)

## 🎯 Hackathon Compliance

This implementation directly addresses hackathon requirements:

- ✅ **Photoclinometry technique** for DEM generation
- ✅ **Mono lunar image processing** capability
- ✅ **High-resolution output** in standard formats
- ✅ **Solar parameter integration** for accurate reconstruction
- ✅ **Evaluation metrics** and comparison capabilities
- ✅ **Single entry point** for easy execution
- ✅ **Comprehensive output** for evaluation

## 📁 Project Structure

```
luna/
├── data/                           # Input images (your lunar imagery)
├── output/                         # Generated outputs (auto-cleaned each run)
│   ├── lunar_dem.tif              # GeoTIFF Digital Elevation Model
│   ├── lunar_surface.obj          # 3D OBJ model for visualization
│   ├── processing_results.png     # Input vs output comparison
│   ├── 3d_surface.png            # 3D surface visualization
│   └── optimization_history.png   # Algorithm convergence plots
├── analysis/                       # Analysis results (auto-cleaned each run)
│   ├── analysis_report.txt        # Human-readable quality report
│   └── detailed_analysis.json     # Detailed metrics and statistics
├── modules/                        # Supporting modules (legacy, not used)
├── luna_unified.py                # Main entry point - SINGLE FILE SYSTEM
├── requirements.txt               # Python dependencies
├── README.md                      # This file
├── .gitignore                     # Git ignore rules
└── .gitattributes                 # Git LFS configuration
```

## 🔬 Technical Specifications

- **Language**: Python 3.8+
- **Key Libraries**: NumPy, SciPy, Matplotlib, Rasterio, imageio, tqdm
- **Algorithm**: Advanced SFS with L-BFGS-B optimization
- **Reflectance Model**: Lambertian with bilateral filtering
- **Output Formats**: GeoTIFF (GDAL), OBJ, PNG visualizations
- **Quality Assessment**: Statistical analysis with scoring system

## 🏆 Competition Notes

This implementation is optimized for lunar photoclinometry competitions:
- **Fast convergence** for time-limited environments
- **Robust parameter defaults** for various lunar terrains
- **Comprehensive output** for evaluation metrics
- **Professional code quality** and documentation
- **Single-file execution** for easy deployment
- **Automatic quality assessment** for objective evaluation

## 📝 Usage Examples

### Basic Usage
```bash
# Place images in data/ directory
python luna_unified.py
```

### Processing Multiple Images
The system automatically detects and tests all supported images, selecting the best one for processing.

### Viewing Results
- Open `output/3d_surface.png` for 3D visualization
- Load `output/lunar_dem.tif` in QGIS or similar GIS software
- Import `output/lunar_surface.obj` in Blender or MeshLab
- Read `analysis/analysis_report.txt` for quality assessment

## 🔧 Troubleshooting

### Common Issues
- **No images found**: Ensure supported formats are in `data/` directory
- **Memory errors**: Reduce image size or increase system RAM
- **Processing hangs**: Check for corrupted images or insufficient disk space
- **Poor quality results**: Verify illumination parameters match image conditions

### File Size Considerations
- Large images (>4000x4000) may produce very large OBJ files (>1GB)
- Use Git LFS for version control of large output files
- Consider image downsampling for faster processing during development

## 📄 License

MIT License - See LICENSE file for details.

---

**Version 3.0 - Final Unified Edition**: Complete photoclinometry pipeline in a single, easy-to-use script.
