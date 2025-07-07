"""
Luna processing service - handles the actual image processing
"""

import os
import json
import shutil
from typing import Dict, Any
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

from models.job import ProcessingJob, JobStatus, job_storage
from models.processing_result import ProcessingResult
from services.cloudinary_service import CloudinaryService
from utils.helpers import get_job_directory, create_results_zip, ensure_directory

# Import Luna processing functions
from processor import (
    load_and_validate_image, optimize_surface_sfs, scale_dem_to_physical,
    create_geotiff, create_obj_file, create_visualizations, analyze_dem_quality,
    save_analysis_results, create_analysis_visualization, compute_illumination_vector,
    CONFIG
)

# Thread pool for background processing
processing_executor = ThreadPoolExecutor(max_workers=3)


class LunaProcessor:
    """Luna image processing service with cloud integration"""

    @staticmethod
    def submit_processing_job(job: ProcessingJob, user_id: str = None) -> None:
        """Submit job for background processing"""
        future = processing_executor.submit(
            LunaProcessor._process_image, job, user_id)
        # Store future reference for potential cancellation
        if hasattr(job, 'future'):
            job.future = future

    @staticmethod
    def _process_image(job: ProcessingJob, user_id: str = None) -> Dict[str, Any]:
        """Process lunar image with comprehensive result generation and cloud storage"""
        try:
            # Use existing processing result if available, otherwise create new one
            processing_result_id = getattr(job, 'result_id', None)
            if user_id and not processing_result_id:
                processing_result_id = ProcessingResult.create_result(
                    user_id=user_id,
                    job_id=job.job_id,
                    filename=job.original_filename
                )

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

            # Save analysis results (excluding analysis_report.txt)
            save_analysis_results(
                analysis_results, test_results, processing_info, analysis_dir, skip_report=True)

            # Create analysis visualizations
            create_analysis_visualization(
                dem_scaled, image, analysis_results, analysis_dir)

            job.update_status(JobStatus.PROCESSING, 95,
                              "Uploading to cloud storage...")

            # Create ZIP file with all results
            zip_path = create_results_zip(job.job_id, 'server_results')

            # Upload to Cloudinary if user is authenticated
            cloudinary_urls = {}
            if processing_result_id:
                cloudinary_service = CloudinaryService()

                # Prepare files for upload with expected structure
                files_to_upload = {
                    "original_image": job.image_path,
                    "geotiff": geotiff_path,
                    "main_visualization": None,
                    "analysis_plot": None,
                    "comprehensive_analysis": None,  # Add this new field
                    "slope_analysis": None,
                    "aspect_analysis": None,
                    "hillshade": None,
                    "contour_lines": None,
                    "quality_report": None,
                    "processing_log": None
                }

                # Map specific visualization files
                viz_mapping = {
                    "main_visualization": "ultra_clear_dem.png",
                    "slope_analysis": "lunar_surface_analysis.png",
                    "aspect_analysis": "high_contrast_dem.png",
                    "hillshade": "publication_quality_dem.png",
                    "contour_lines": "lunar_terrain_3d.png",
                    "analysis_plot": "comprehensive_analysis.png",  # Keep existing mapping
                    "comprehensive_analysis": "comprehensive_analysis.png"  # Add dedicated mapping
                }

                for key, filename in viz_mapping.items():
                    file_path = os.path.join(output_dir, filename)
                    if os.path.exists(file_path):
                        files_to_upload[key] = file_path

                # Analysis files (quality report only)
                analysis_mapping = {
                    "quality_report": os.path.join(analysis_dir, "analysis_summary.png"),
                    "comprehensive_analysis": os.path.join(analysis_dir, "comprehensive_analysis.png")  # Add from analysis dir too
                }

                for key, file_path in analysis_mapping.items():
                    if os.path.exists(file_path):
                        files_to_upload[key] = file_path

                # Upload files to Cloudinary
                cloudinary_urls = cloudinary_service.upload_luna_analysis_files(
                    job.job_id, files_to_upload)

                # Update processing result in database
                if processing_result_id:
                    ProcessingResult.update_status(
                        processing_result_id,
                        status="completed",
                        processing_info=processing_info,
                        analysis_results=analysis_results,
                        cloudinary_urls=cloudinary_urls
                    )

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
                        "detailed_analysis.json"
                    ]
                },
                "download_zip": f"luna_results_{job.job_id}.zip",
                "cloudinary_urls": cloudinary_urls,
                "completed_at": datetime.now().isoformat()
            }

            # Update job with final results
            job.results = results
            job.update_status(JobStatus.COMPLETED, 100,
                              "Processing completed successfully!")

            # Clean up temporary files after a delay to allow downloads
            # (In production, you might want to implement a cleanup job)

            return results

        except Exception as e:
            error_msg = f"Processing failed: {str(e)}"
            job.set_error(error_msg)

            # Update processing result if exists
            if processing_result_id:
                ProcessingResult.update_status(processing_result_id, "failed")

            raise e

    @staticmethod
    def cleanup_temporary_files(job_id: str):
        """Clean up temporary files for a job"""
        try:
            job_dir = get_job_directory(job_id, 'server_results')
            if os.path.exists(job_dir):
                shutil.rmtree(job_dir)
            return True
        except Exception as e:
            print(f"Error cleaning up temporary files: {e}")
            return False
