# Luna: Optimized Lunar Photoclinometry System

An advanced implementation of Shape-from-Shading (SFS) photoclinometry for generating high-resolution Digital Elevation Models (DEMs) from lunar surface images.

## 🌙 Overview

This project implements photoclinometry (Shape-from-Shading) techniques to reconstruct 3D topography from mono lunar images. It's specifically designed for hackathons and research projects focusing on lunar DEM generation.

## ✨ Features

### Core Capabilities
- **Shape-from-Shading Implementation**: Advanced SFS algorithm using L-BFGS-B optimization
- **Mono Image Processing**: Extracts 3D information from single lunar images
- **High-Resolution DEM Generation**: Creates detailed elevation models
- **Multi-Format Output**: GeoTIFF, OBJ, and visualization formats

### Optimizations
- **Smart Initialization**: Uses image intensity for better starting conditions
- **Adaptive Regularization**: Automatically adjusts based on image characteristics
- **Numerical Stability**: Robust gradient computation and error handling
- **Performance Improvements**: Vectorized operations and efficient algorithms

### Data Compatibility
- ✅ Chandrayaan missions (TMC, TMC-2, IIRS, OHRC)
- ✅ NASA missions (LRO NAC/WAC, M3)
- ✅ JAXA mission (Selene)
- ✅ Standard image formats (PNG, JPG, TIFF)

## 🚀 Quick Start

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Place your lunar image in the `data/` directory

3. Run the photoclinometry process:
```bash
python run_photoclinometry.py
```

### Input Requirements

- **Lunar surface image** (grayscale or color)
- **Solar illumination parameters**:
  - Sun azimuth angle (degrees)
  - Sun elevation angle (degrees)
- **Spacecraft metadata**:
  - Altitude, focal length, pixel size
  - Corner coordinates for georeferencing

## 📊 Expected Outputs

### Generated Files
- `reconstructed_dem.tif` - Georeferenced DEM (GeoTIFF)
- `reconstructed_dem.obj` - 3D model (Wavefront OBJ)
- `depth_map_visualization.png` - 2D colorized height map
- `surface_3d_visualization.png` - 3D surface visualization

### Quality Metrics
- Height range and relief statistics
- Mean and standard deviation values
- Processing time and convergence information

## ⚙️ Configuration

Edit `run_photoclinometry.py` to modify:

```python
SFS_INPUTS = {
    "image_path": "data/your_image.png",
    "sun_azimuth_deg": 101.55,      # Solar azimuth
    "sun_elevation_deg": 34.80,     # Solar elevation
    "regularization_lambda": 2e-3,  # Smoothing parameter
    "max_iterations": 100,          # Optimization steps
    # ... spacecraft and georeferencing parameters
}
```

## 🧮 Algorithm Details

### Shape-from-Shading Process
1. **Image Preprocessing**: Normalization and noise reduction
2. **Light Vector Calculation**: From solar illumination geometry
3. **Surface Normal Estimation**: Using Lambertian reflectance model
4. **Height Optimization**: L-BFGS-B minimization with regularization
5. **Physical Scaling**: Convert to absolute elevation values
6. **Georeferencing**: Apply coordinate system transformation

### Key Improvements
- **Enhanced Gradient Computation**: More stable numerical derivatives
- **Adaptive Parameters**: Automatically tune based on image characteristics
- **Better Initialization**: Use image content for starting height estimates
- **Robust Error Handling**: Comprehensive validation and recovery

## 📈 Performance

- **Typical Processing Time**: 10-60 seconds (depending on image size)
- **Memory Usage**: ~2-4x image size in RAM
- **Accuracy**: Suitable for research and competition evaluation
- **Scalability**: Handles images from 512x512 to 4096x4096+ pixels

## 🎯 Hackathon Compliance

This implementation directly addresses the hackathon requirements:

- ✅ **Photoclinometry technique** for DEM generation
- ✅ **Mono lunar image processing** capability
- ✅ **High-resolution output** in standard formats
- ✅ **Solar parameter integration** for accurate reconstruction
- ✅ **Evaluation metrics** and comparison capabilities

## 📁 Project Structure

```
luna/
├── run_photoclinometry.py          # Main execution script
├── requirements.txt                 # Python dependencies
├── sfs_photoclinometry/            # Core algorithm package
│   ├── core.py                     # SFS optimization engine
│   ├── utils.py                    # Mathematical utilities
│   ├── io_handler.py               # File I/O operations
│   └── visualization.py            # Plotting and visualization
├── data/                           # Input images
└── output/                         # Generated results
```

## 🔬 Technical Specifications

- **Language**: Python 3.8+
- **Key Libraries**: NumPy, SciPy, Matplotlib, Rasterio
- **Algorithm**: L-BFGS-B constrained optimization
- **Reflectance Model**: Lambertian with numerical enhancements
- **Output Formats**: GeoTIFF (GDAL), OBJ, PNG visualizations

## 📝 License

MIT License - See LICENSE file for details.

## 🏆 Competition Notes

This implementation is optimized for lunar photoclinometry competitions and research:
- Fast convergence for time-limited environments
- Robust parameter defaults for various lunar terrains
- Comprehensive output for evaluation metrics
- Professional code quality and documentation
