#!/usr/bin/env python3
"""
Test script for Chandrayaan-2 TMC data processing
This script demonstrates processing real Chandrayaan mission data
"""

import os
import time
from sfs_photoclinometry import io_handler, core, visualization

# Configuration for Chandrayaan-2 TMC data
CHANDRAYAAN_CONFIG = {
    # --- Chandrayaan-2 TMC Image ---
    "image_path": "data/ch2_tmc_ndn_20250217T0120183473_b_bot_d18.png",
    "output_dir": "output_chandrayaan",

    # --- Estimated illumination (would need real metadata) ---
    "sun_azimuth_deg": 95.0,      # Estimated
    "sun_elevation_deg": 45.0,    # Estimated

    # --- Optimized parameters for Chandrayaan data ---
    "initial_surface": "flat",
    "regularization_lambda": 1e-3,  # Lower for higher resolution
    "max_iterations": 120,           # More iterations for better quality

    # --- Chandrayaan-2 TMC specifications ---
    "spacecraft_altitude_km": 100.0,    # Typical TMC altitude
    "focal_length_mm": 178.0,           # TMC focal length
    "detector_pixel_width_um": 5.5,     # TMC pixel size

    # --- Example coordinates (would need real metadata) ---
    "refined_corner_coords": {
        "upper_left":    {"lat": -10.0, "lon": 80.0},
        "upper_right":   {"lat": -10.0, "lon": 81.0},
        "lower_left":    {"lat": -11.0, "lon": 80.0},
        "lower_right":   {"lat": -11.0, "lon": 81.0},
    },
    "projection": "Selenographic",
}


def process_chandrayaan_data():
    """Process Chandrayaan-2 TMC data with optimized parameters."""

    print("=== Chandrayaan-2 TMC Data Processing ===")
    print("Luna Photoclinometry - Chandrayaan Edition")

    # Check if Chandrayaan data exists
    if not os.path.exists(CHANDRAYAAN_CONFIG["image_path"]):
        print(
            f"Chandrayaan data not found at: {CHANDRAYAAN_CONFIG['image_path']}")
        print("Available files in data directory:")
        try:
            for f in os.listdir("data"):
                print(f"  - {f}")
        except:
            print("  No data directory found!")
        return

    start_time = time.time()

    # Create output directory
    os.makedirs(CHANDRAYAAN_CONFIG["output_dir"], exist_ok=True)
    print(
        f"Output directory: {os.path.abspath(CHANDRAYAAN_CONFIG['output_dir'])}")

    # Load and process image
    print(f"\n--- Loading Chandrayaan-2 TMC Image ---")
    try:
        image = io_handler.load_image(CHANDRAYAAN_CONFIG["image_path"])
        print(f"Loaded TMC image: {image.shape}")
    except Exception as e:
        print(f"Error loading image: {e}")
        return

    # Run photoclinometry
    print(f"\n--- Running Photoclinometry ---")
    print(f"TMC-specific parameters:")
    print(f"  Altitude: {CHANDRAYAAN_CONFIG['spacecraft_altitude_km']} km")
    print(f"  Focal length: {CHANDRAYAAN_CONFIG['focal_length_mm']} mm")
    print(f"  Pixel size: {CHANDRAYAAN_CONFIG['detector_pixel_width_um']} μm")

    try:
        relative_dem = core.run_sfs_optimization(image, CHANDRAYAAN_CONFIG)
        scaled_dem = core.scale_dem_to_meters(
            relative_dem, image.shape, CHANDRAYAAN_CONFIG)
        print("TMC data processing completed successfully!")
    except Exception as e:
        print(f"Error during processing: {e}")
        return

    # Save results
    print(f"\n--- Saving TMC Results ---")
    output_basename = os.path.join(
        CHANDRAYAAN_CONFIG["output_dir"], "chandrayaan_dem")

    try:
        # GeoTIFF
        io_handler.save_dem_as_geotiff(f"{output_basename}.tif", scaled_dem,
                                       image.shape, CHANDRAYAAN_CONFIG)

        # OBJ (downsample if large)
        downsample = 2 if image.size > 200000 else 1
        io_handler.save_dem_as_obj(
            f"{output_basename}.obj", scaled_dem, downsample)

        # Visualizations
        vis_2d = os.path.join(
            CHANDRAYAAN_CONFIG["output_dir"], "chandrayaan_2d.png")
        visualization.plot_depth_map(
            scaled_dem, vis_2d, "Chandrayaan-2 TMC DEM")

        vis_3d = os.path.join(
            CHANDRAYAAN_CONFIG["output_dir"], "chandrayaan_3d.png")
        visualization.plot_3d_surface(
            scaled_dem, vis_3d, "Chandrayaan-2 TMC 3D Surface")

    except Exception as e:
        print(f"Error saving results: {e}")
        return

    # Final report
    end_time = time.time()
    print(f"\n=== Chandrayaan-2 Processing Complete ===")
    print(f"Processing time: {end_time - start_time:.1f} seconds")
    print(f"TMC DEM Statistics:")
    print(f"  Resolution: {scaled_dem.shape}")
    print(
        f"  Height range: [{scaled_dem.min():.2f}, {scaled_dem.max():.2f}] m")
    print(f"  Relief: {scaled_dem.max() - scaled_dem.min():.2f} m")
    print(
        f"  Pixel scale: ~{CHANDRAYAAN_CONFIG['detector_pixel_width_um'] * CHANDRAYAAN_CONFIG['spacecraft_altitude_km'] * 1000 / CHANDRAYAAN_CONFIG['focal_length_mm']:.2f} m/pixel")
    print(
        f"\nResults saved to: {os.path.abspath(CHANDRAYAAN_CONFIG['output_dir'])}")


def compare_datasets():
    """Compare results from different datasets."""
    print("\n=== Dataset Comparison ===")

    datasets = [
        ("Standard Test", "output/reconstructed_dem.tif"),
        ("Chandrayaan-2 TMC", "output_chandrayaan/chandrayaan_dem.tif")
    ]

    for name, path in datasets:
        if os.path.exists(path):
            try:
                import rasterio
                with rasterio.open(path) as src:
                    dem = src.read(1)
                    print(f"{name}:")
                    print(f"  Size: {dem.shape}")
                    print(f"  Range: [{dem.min():.2f}, {dem.max():.2f}] m")
                    print(f"  Relief: {dem.max() - dem.min():.2f} m")
                    print(f"  Std Dev: {dem.std():.2f} m")
            except Exception as e:
                print(f"{name}: Error reading - {e}")
        else:
            print(f"{name}: File not found")


if __name__ == "__main__":
    # Process Chandrayaan data
    process_chandrayaan_data()

    # Compare with other datasets
    compare_datasets()

    print("\n" + "=" * 60)
    print("Chandrayaan-2 TMC processing complete!")
    print("Note: This example uses estimated illumination parameters.")
    print("For real science applications, use actual metadata from PDS.")
