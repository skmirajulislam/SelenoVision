import numpy as np
import rasterio
from rasterio.transform import from_gcps
from rasterio.control import GroundControlPoint
import imageio.v2 as imageio  # Use imageio.v2 to avoid deprecation warnings

import numpy as np
import rasterio
from rasterio.transform import from_gcps
from rasterio.control import GroundControlPoint
import imageio.v2 as imageio
import os
import warnings


def load_image(image_path: str) -> np.ndarray:
    """
    Enhanced image loading with better error handling and preprocessing.
    - Converts to grayscale if it's a color image
    - Normalizes to [0, 1] range
    - Applies basic noise reduction
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")

    try:
        # Load image using imageio
        img_raw = imageio.imread(image_path)
        print(f"Loaded image: {img_raw.shape}, dtype: {img_raw.dtype}")

    except Exception as e:
        raise ValueError(f"Failed to load image {image_path}: {e}")

    # Convert to grayscale if needed
    if img_raw.ndim == 3:
        if img_raw.shape[2] >= 3:
            # Use standard luminosity formula for grayscale conversion
            rgb_weights = np.array([0.299, 0.587, 0.114])
            image_gray = np.dot(img_raw[..., :3], rgb_weights)
            print("Converted RGB to grayscale")
        else:
            image_gray = img_raw[..., 0]
    else:
        # Image is already grayscale
        image_gray = img_raw

    # Ensure float32 for calculations
    image = image_gray.astype(np.float32)

    # Normalize to [0, 1] range
    min_val, max_val = np.min(image), np.max(image)
    if max_val > min_val:
        image = (image - min_val) / (max_val - min_val)
        print(
            f"Normalized image: [{min_val:.1f}, {max_val:.1f}] -> [0.0, 1.0]")
    else:
        image = np.zeros_like(image)
        print("Warning: Image has constant intensity")

    # Basic statistics
    print(
        f"Final image stats: mean={np.mean(image):.3f}, std={np.std(image):.3f}")

    return image


def save_dem_as_geotiff(save_path: str, dem: np.ndarray, shape: tuple, config: dict):
    """
    Enhanced GeoTIFF saving with better error handling and validation.
    """
    try:
        height, width = shape
        corners = config["refined_corner_coords"]

        # Validate corner coordinates
        for corner_name, coords in corners.items():
            if not (-90 <= coords["lat"] <= 90):
                print(
                    f"Warning: Invalid latitude for {corner_name}: {coords['lat']}")
            if not (-180 <= coords["lon"] <= 360):
                print(
                    f"Warning: Invalid longitude for {corner_name}: {coords['lon']}")

        # Create ground control points
        gcps = [
            GroundControlPoint(row=0, col=0,
                               x=corners["upper_left"]["lon"],
                               y=corners["upper_left"]["lat"]),
            GroundControlPoint(row=0, col=width-1,
                               x=corners["upper_right"]["lon"],
                               y=corners["upper_right"]["lat"]),
            GroundControlPoint(row=height-1, col=0,
                               x=corners["lower_left"]["lon"],
                               y=corners["lower_left"]["lat"]),
            GroundControlPoint(row=height-1, col=width-1,
                               x=corners["lower_right"]["lon"],
                               y=corners["lower_right"]["lat"]),
        ]

        # Create transform from GCPs
        transform = from_gcps(gcps)
        crs = "EPSG:4326"  # WGS84 geographic coordinate system

        # Create profile for the output file
        profile = {
            'driver': 'GTiff',
            'height': dem.shape[0],
            'width': dem.shape[1],
            'count': 1,
            'dtype': dem.dtype,
            'crs': crs,
            'transform': transform,
            'nodata': -9999.0,
            'compress': 'lzw',  # Add compression
            'tiled': True,      # Better for large files
        }

        # Ensure output directory exists
        os.makedirs(os.path.dirname(save_path), exist_ok=True)

        # Save the GeoTIFF
        with rasterio.open(save_path, 'w', **profile) as dst:
            dst.write(dem, 1)

        print(f"Successfully saved GeoTIFF: {save_path}")
        print(f"  DEM range: [{dem.min():.2f}, {dem.max():.2f}] meters")

    except Exception as e:
        print(f"Error saving GeoTIFF: {e}")
        raise


def save_dem_as_obj(save_path: str, dem: np.ndarray, downsample_factor: int = 1):
    """
    Enhanced OBJ saving with optional downsampling for large DEMs.
    """
    try:
        height, width = dem.shape

        # Downsample if requested (useful for large DEMs)
        if downsample_factor > 1:
            dem_ds = dem[::downsample_factor, ::downsample_factor]
            height_ds, width_ds = dem_ds.shape
            print(
                f"Downsampled DEM for OBJ: {height}x{width} -> {height_ds}x{width_ds}")
        else:
            dem_ds = dem
            height_ds, width_ds = height, width

        # Ensure output directory exists
        os.makedirs(os.path.dirname(save_path), exist_ok=True)

        with open(save_path, 'w') as f:
            f.write("# 3D Model generated by Optimized Python SFS Photoclinometry\n")
            f.write(f"# Original DEM size: {height}x{width}\n")
            f.write(f"# Model size: {height_ds}x{width_ds}\n")
            f.write(
                f"# Height range: [{dem.min():.2f}, {dem.max():.2f}] meters\n")

            # Write vertices (v x y z)
            vertex_count = 0
            for i in range(height_ds):
                for j in range(width_ds):
                    # Use original coordinate system but with downsampled data
                    x = j * downsample_factor
                    y = (height - 1 - i * downsample_factor)
                    z = dem_ds[i, j]
                    f.write(f"v {x} {y} {z}\n")
                    vertex_count += 1

            # Write faces (f v1 v2 v3 v4) - quads
            face_count = 0
            for i in range(height_ds - 1):
                for j in range(width_ds - 1):
                    # Calculate vertex indices (1-based for OBJ format)
                    v1 = i * width_ds + j + 1
                    v2 = v1 + 1
                    v3 = (i + 1) * width_ds + j + 2
                    v4 = v3 - 1
                    f.write(f"f {v1} {v2} {v3} {v4}\n")
                    face_count += 1

        print(f"Successfully saved OBJ: {save_path}")
        print(f"  Vertices: {vertex_count}, Faces: {face_count}")

    except Exception as e:
        print(f"Error saving OBJ: {e}")
        raise
