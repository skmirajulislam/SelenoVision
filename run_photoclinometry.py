import os
import time
from sfs_photoclinometry import io_handler, core, visualization

# --- OPTIMIZED USER INPUTS ---
SFS_INPUTS = {
    # --- File Paths ---
    "image_path": "data/moon1.png",
    "output_dir": "output",

    # --- Illumination Geometry (Critical for SFS) ---
    "sun_azimuth_deg": 101.554510,
    "sun_elevation_deg": 34.802249,

    # --- Optimized SFS Algorithm Parameters ---
    "initial_surface": "flat",
    "regularization_lambda": 2e-3,  # Reduced for better detail preservation
    "max_iterations": 100,           # Reduced for faster convergence

    # --- Georeferencing & Scaling ---
    "spacecraft_altitude_km": 95.85,
    "focal_length_mm": 140.0,
    "detector_pixel_width_um": 7.0,
    "refined_corner_coords": {
        "upper_left":    {"lat": -0.180085, "lon": 257.530303},
        "upper_right":   {"lat": -0.201906, "lon": 256.909083},
        "lower_left":    {"lat": 29.781694, "lon": 257.122178},
        "lower_right":   {"lat": 29.758136, "lon": 256.403670},
    },
    "projection": "Selenographic",
}


def main():
    """Enhanced main function with better error handling and progress reporting."""
    print("=== OPTIMIZED Shape-from-Shading (Photoclinometry) Process ===")
    print(f"Luna Photoclinometry v2.0 - Optimized Edition")
    start_time = time.time()

    # Validate inputs
    if not os.path.exists(SFS_INPUTS["image_path"]):
        print(f"ERROR: Input image not found at {SFS_INPUTS['image_path']}")
        print("Available files in data directory:")
        try:
            data_files = os.listdir("data")
            for f in data_files:
                print(f"  - {f}")
        except:
            print("  No data directory found!")
        return

    # Create output directory
    os.makedirs(SFS_INPUTS["output_dir"], exist_ok=True)
    print(f"Output directory: {os.path.abspath(SFS_INPUTS['output_dir'])}")

    # Load and validate image
    print(f"\n--- Loading Image ---")
    try:
        image = io_handler.load_image(SFS_INPUTS["image_path"])
        print(f"Successfully loaded image: {image.shape}")
    except Exception as e:
        print(f"ERROR loading image: {e}")
        return

    # Run SFS optimization
    print(f"\n--- Running SFS Optimization ---")
    print(f"Parameters:")
    print(f"  Regularization: {SFS_INPUTS['regularization_lambda']:.2e}")
    print(f"  Max iterations: {SFS_INPUTS['max_iterations']}")
    print(f"  Sun elevation: {SFS_INPUTS['sun_elevation_deg']:.1f}°")
    print(f"  Sun azimuth: {SFS_INPUTS['sun_azimuth_deg']:.1f}°")

    try:
        relative_dem = core.run_sfs_optimization(image, SFS_INPUTS)
        print("SFS optimization completed successfully!")
    except Exception as e:
        print(f"ERROR during SFS optimization: {e}")
        return

    # Scale DEM to physical units
    print(f"\n--- Scaling DEM ---")
    try:
        scaled_dem = core.scale_dem_to_meters(
            relative_dem, image.shape, SFS_INPUTS)
        print("DEM scaling completed successfully!")
    except Exception as e:
        print(f"ERROR during DEM scaling: {e}")
        return

    # Save outputs
    output_basename = os.path.join(
        SFS_INPUTS["output_dir"], "reconstructed_dem")
    print(f"\n--- Saving Outputs ---")

    try:
        # Save GeoTIFF
        geotiff_path = f"{output_basename}.tif"
        io_handler.save_dem_as_geotiff(
            geotiff_path, scaled_dem, image.shape, SFS_INPUTS)

        # Save OBJ (with downsampling for large DEMs)
        obj_path = f"{output_basename}.obj"
        downsample_factor = 1 if image.size < 100000 else 2
        io_handler.save_dem_as_obj(obj_path, scaled_dem, downsample_factor)

        # Create visualizations
        vis_path_2d = os.path.join(
            SFS_INPUTS["output_dir"], "depth_map_visualization.png")
        visualization.plot_depth_map(
            scaled_dem, vis_path_2d, "Optimized Lunar DEM")

        vis_path_3d = os.path.join(
            SFS_INPUTS["output_dir"], "surface_3d_visualization.png")
        visualization.plot_3d_surface(
            scaled_dem, vis_path_3d, "Optimized Lunar 3D Surface")

    except Exception as e:
        print(f"ERROR saving outputs: {e}")
        return

    # Final statistics
    print(f"\n=== Process Completed Successfully ===")
    end_time = time.time()
    execution_time = end_time - start_time

    print(
        f"Execution time: {execution_time:.1f} seconds ({execution_time/60:.1f} minutes)")
    print(f"DEM Statistics:")
    print(
        f"  Resolution: {scaled_dem.shape[0]} x {scaled_dem.shape[1]} pixels")
    print(
        f"  Height range: [{scaled_dem.min():.2f}, {scaled_dem.max():.2f}] meters")
    print(f"  Relief: {scaled_dem.max() - scaled_dem.min():.2f} meters")
    print(f"  Mean height: {scaled_dem.mean():.2f} meters")
    print(f"  Standard deviation: {scaled_dem.std():.2f} meters")

    print(
        f"\nOutput files saved to: {os.path.abspath(SFS_INPUTS['output_dir'])}")
    print("=" * 60)


if __name__ == "__main__":
    main()
