# SelenoVision - Streamlit Edition

A Streamlit implementation of the Luna Photoclinometry system for generating high-quality Digital Elevation Models (DEMs) from lunar imagery.

## Overview

This project is a standalone Streamlit adaptation of the Luna Photoclinometry system, which uses advanced Shape-from-Shading (SFS) algorithms to reconstruct 3D lunar surface topography from single images. The application preserves the core ML algorithm and processing pipeline of the original system but implements it in a streamlined, local-only Streamlit interface without any database or cloud dependencies.

## Features

- **Single Entry Point**: Complete pipeline in one unified Streamlit application
- **Multi-format Image Support**: Handles PNG, JPG, JPEG, TIFF formats
- **Optimized SFS Algorithm**: Vectorized computations with adaptive regularization and bilateral filtering
- **Comprehensive Output Generation**: GeoTIFF DEMs, OBJ 3D models, 2D/3D visualizations
- **Quality Analysis**: Automated DEM quality assessment with scoring and detailed metrics
- **Interactive 3D Visualization**: Real-time exploration of generated 3D surface models
- **Downloadable Results**: Export all generated outputs for further analysis or use

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/selenovision.git
   cd selenovision
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r app/requirements.txt
   ```

   Note: For GeoTIFF support, you'll need to install rasterio, which requires GDAL:
   - **macOS**: `brew install gdal` then `pip install rasterio`
   - **Ubuntu**: `sudo apt-get install libgdal-dev` then `pip install rasterio`
   - **Windows**: Download and install the appropriate wheel from [Christoph Gohlke's website](https://www.lfd.uci.edu/~gohlke/pythonlibs/#gdal)

   The app will work without rasterio, but the GeoTIFF export functionality will be limited.

## Usage

1. Run the Streamlit application:
   ```bash
   cd app
   streamlit run streamlit_app.py
   ```

2. Open your web browser and navigate to the URL displayed in the terminal (usually http://localhost:8501)

3. Upload a lunar image or use the provided sample image

4. Configure processing parameters (optional)

5. Click "Generate 3D Model" to start the processing

6. View and download the results

## Directory Structure

```
app/
├── __init__.py
├── streamlit_app.py  # Main Streamlit application
├── config.py         # Configuration settings
├── requirements.txt  # Dependencies
├── components/       # UI components
│   ├── __init__.py
│   ├── header.py
│   ├── upload.py
│   ├── processing.py
│   ├── results.py
│   └── footer.py
├── utils/            # Processing utilities
│   ├── __init__.py
│   └── processing.py
└── assets/           # Static assets
    └── sample_lunar.jpg
```

## Core Algorithm

The application uses the same Shape-from-Shading algorithm as the original system:

1. **Image Loading & Preprocessing**: Normalizes the image and prepares it for processing
2. **Illumination Vector Computation**: Calculates the light direction based on sun azimuth and elevation
3. **SFS Optimization**: Iteratively optimizes the surface heights to match the observed image intensities
4. **Post-processing & Analysis**: Scales the DEM to physical units and generates various visualizations and metrics

## Data Management

All data is processed locally with no external dependencies:
- Uploaded images are stored temporarily in the `uploads` directory
- Processing results are saved in the `results` directory with subdirectories for outputs and analysis
- No database or cloud storage is used - everything remains on the local filesystem

## License

This project is licensed under the terms of the license found in the original SelenoVision repository.
