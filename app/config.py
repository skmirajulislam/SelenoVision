"""
Configuration settings for the SelenoVision Streamlit app
Exactly aligned with backend configuration for consistent results
"""

import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent

# Directory paths
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
RESULTS_DIR = os.path.join(BASE_DIR, "results")
OUTPUT_DIR = os.path.join(RESULTS_DIR, "output")
ANALYSIS_DIR = os.path.join(RESULTS_DIR, "analysis")

# Processing configuration - Exactly matched with backend processor.py CONFIG
CONFIG = {
    # --- File Paths ---
    "data_dir": "data",
    "results_dir": RESULTS_DIR,
    "output_dir": OUTPUT_DIR,
    "analysis_dir": ANALYSIS_DIR,

    # --- Illumination Geometry (Critical for SFS) ---
    "sun_azimuth_deg": 101.554510,
    "sun_elevation_deg": 34.802249,

    # --- Optimized SFS Algorithm Parameters ---
    "initial_surface": "flat",
    "max_iterations": 200,  # Increased for better convergence and feature capture
    "convergence_threshold": 5e-8,  # Tighter convergence for maximum accuracy
    "regularization_lambda": 0.03,  # Reduced for better feature preservation
    "adaptive_regularization": True,
    "use_bilateral_filter": True,
    "bilateral_sigma_color": 0.03,  # Reduced for better edge preservation
    "bilateral_sigma_spatial": 2.0,  # Reduced for finer details
    "smoothing_factor": 0.2,  # Optimized to preserve maximum features
    "gradient_threshold": 0.003,  # Lower threshold for better feature detection

    # --- Enhanced Feature Preservation Parameters ---
    "adaptive_normalization": True,  # Enable robust normalization
    "feature_enhancement": True,  # Enable feature enhancement
    "histogram_bins": "auto",  # Auto-calculate optimal bins
    "outlier_removal": False,  # Keep outliers for lunar features
    "robust_scaling": True,  # Use robust statistical scaling

    # --- Output and Analysis Parameters ---
    "create_obj": True,
    "create_geotiff": True,
    "create_visualizations": True,
    "perform_analysis": True,
    "save_intermediate_results": True,
    "verbose": True,

    # --- Supported Image Formats ---
    "supported_formats": [".png", ".jpg", ".jpeg", ".tif", ".tiff"],
    # Priority order for auto-detection
    "format_priority": [".png", ".jpg", ".jpeg"],

    # --- DEM Scaling Parameters ---
    "dem_scale_factor": 1000.0,  # Scale factor for height values
    "pixel_size_meters": 100.0,  # Pixel resolution in meters
    "dem_min_height": -2000.0,   # Minimum DEM height in meters
    "dem_max_height": 2000.0,    # Maximum DEM height in meters

    # --- Enhanced DEM Processing ---
    "preserve_extremes": True,   # Preserve extreme elevation values
    "dem_smoothing": True,       # Apply light smoothing for more natural terrain
    "dem_feature_enhancement": True,  # Enhance small terrain details
    "dem_detail_factor": 1.3,    # Strength of detail enhancement (>1.0)

    # --- Enhanced OBJ Output ---
    "obj_height_exaggeration": 0.2,  # Height exaggeration for better visualization
    "obj_detail_enhancement": True,  # Enhance small details in 3D model
    "obj_downsampling": "auto",      # Automatically downsample large models

    # --- Enhanced GeoTIFF Output ---
    "geotiff_compression": "lzw",    # LZW compression for smaller files
    "geotiff_add_overviews": True,   # Add overview pyramids for faster display
    "geotiff_bitdepth": 32,          # 32-bit float for maximum precision
}

# Create directories if they don't exist


def create_directories():
    """Create necessary directories if they don't exist"""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(ANALYSIS_DIR, exist_ok=True)
