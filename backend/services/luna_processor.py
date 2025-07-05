"""
Luna processing service - handles the actual image processing
"""

import os
import shutil
from typing import Dict, Any
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

from app.models.job import ProcessingJob, JobStatus, job_storage
from app.utils.helpers import get_job_directory, create_results_zip, ensure_directory

# Import Luna processing functions
from luna.backend.luna_unified import (
    load_and_validate_image, optimize_surface_sfs, scale_dem_to_physical,
    create_geotiff, create_obj_file, create_visualizations, analyze_dem_quality,
    save_analysis_results, create_analysis_visualization, compute_illumination_vector,
    CONFIG
)

# Thread pool for background processing
processing_executor = ThreadPoolExecutor(max_workers=3)


class LunaProcessor:
    """Luna image processing service"""

    @staticmethod
    def submit_processing_job(job: ProcessingJob) -> None:
        """Submit job for background processing"""
        future = processing_executor.submit(LunaProcessor._process_image, job)
        # Store future reference for potential cancellation
        job.future = future

    @staticmethod
    def _process_image(job: ProcessingJob) -> Dict[str, Any]:
        """Process lunar image with comprehensive result generation"""
        try:
            # Update job status
            job.update_status(JobStatus.PROCESSING, 10,
                              "Loading and validating image...")

            # Load and validate image
            image, image_info = load_and_validate_image(job.image_path)

            job.update_status(JobStatus.PROCESSING, 20,
                              "Computing illumination vector...")

            # Compute illumination vector
            light_vector = compute_illumination_vector(
                CONFIG["sun_azimuth_deg"],
                CONFIG["sun_elevation_deg"]
            )

            job.update_status(JobStatus.PROCESSING, 30,
                              "Running Shape-from-Shading optimization...")

            # Run SFS optimization
            surface, history = optimize_surface_sfs(
                image, light_vector, CONFIG)

            job.update_status(JobStatus.PROCESSING, 50,
                              "Scaling DEM to physical units...")

            # Scale DEM to physical units
            dem_scaled = scale_dem_to_physical(surface, CONFIG)

            # Create job-specific output directories
            job_dir = get_job_directory(job.job_id, 'server_results')
            output_dir = os.path.join(job_dir, "output")
            analysis_dir = os.path.join(job_dir, "analysis")
            ensure_directory(output_dir)
            ensure_directory(analysis_dir)

            job.update_status(JobStatus.PROCESSING, 60, "Creating outputs...")

            # Create outputs
            geotiff_path = os.path.join(output_dir, "lunar_dem.tif")
            create_geotiff(dem_scaled, geotiff_path, CONFIG)

            obj_path = os.path.join(output_dir, "lunar_surface.obj")
            create_obj_file(dem_scaled, obj_path, CONFIG)

            job.update_status(JobStatus.PROCESSING, 70,
                              "Creating visualizations...")

            # Create visualizations
            create_visualizations(
                image, surface, dem_scaled, history, output_dir)

            job.update_status(JobStatus.PROCESSING, 80,
                              "Analyzing DEM quality...")

            # Analyze DEM quality
            analysis_results = analyze_dem_quality(dem_scaled, image)

            processing_info = {
                'image_file': job.original_filename,
                'iterations': history['iterations'],
                'converged': history['iterations'] < CONFIG["max_iterations"],
                'job_id': job.job_id,
                'processed_at': datetime.now().isoformat()
            }

            # Create test results for compatibility
            test_results = {
                'total_images': 1,
                'successful_loads': 1,
                'failed_loads': 0,
                'formats_tested': {
                    os.path.splitext(job.original_filename)[1].lower(): {
                        'files': 1,
                        'successful': 1,
                        'failed': 0,
                        'errors': []
                    }
                },
                'errors': []
            }

            job.update_status(JobStatus.PROCESSING, 90,
                              "Saving analysis results...")

            # Save analysis results
            save_analysis_results(
                analysis_results, test_results, processing_info, analysis_dir)

            # Create analysis visualizations
            create_analysis_visualization(
                dem_scaled, image, analysis_results, analysis_dir)

            job.update_status(JobStatus.PROCESSING, 95,
                              "Creating results package...")

            # Create ZIP file with all results
            zip_path = create_results_zip(job.job_id, 'server_results')

            # Prepare final results
            results = {
                "job_id": job.job_id,
                "status": "completed",
                "processing_info": processing_info,
                "analysis_results": analysis_results,
                "test_results": test_results,
                "output_files": {
                    "geotiff": "lunar_dem.tif",
                    "obj_model": "lunar_surface.obj",
                    "visualizations": [
                        "lunar_surface_analysis.png",
                        "ultra_clear_dem.png",
                        "high_contrast_dem.png",
                        "publication_quality_dem.png",
                        "lunar_terrain_3d.png",
                        "sfs_convergence_analysis.png"
                    ],
                    "analysis": [
                        "comprehensive_analysis.png",
                        "analysis_summary.png",
                        "analysis_report.txt",
                        "detailed_analysis.json"
                    ]
                },
                "download_zip": f"luna_results_{job.job_id}.zip",
                "completed_at": datetime.now().isoformat()
            }

            # Update job with final results
            job.results = results
            job.update_status(JobStatus.COMPLETED, 100,
                              "Processing completed successfully!")

            return results

        except Exception as e:
            error_msg = f"Processing failed: {str(e)}"
            job.set_error(error_msg)
            raise e
