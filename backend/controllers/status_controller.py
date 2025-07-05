"""
Status controller for job monitoring and tracking
"""

from flask import jsonify
from datetime import datetime

from app.models.job import JobStatus, job_storage


class StatusController:
    """Handle job status queries and monitoring"""

    @staticmethod
    def get_job_status(job_id: str):
        """Get job processing status"""
        if job_id not in job_storage:
            return jsonify({"error": "Job not found"}), 404

        job = job_storage[job_id]

        # Check if job has a future and it's done
        if hasattr(job, 'future') and job.future and job.future.done():
            try:
                if job.status not in [JobStatus.COMPLETED, JobStatus.FAILED]:
                    # Future completed, check result
                    job.future.result()  # This will raise exception if failed
            except Exception as e:
                job.set_error(str(e))

        return jsonify({
            "job_id": job_id,
            "status": job.status.value,
            "progress": job.progress,
            "message": job.message,
            "created_at": job.created_at.isoformat(),
            "updated_at": job.updated_at.isoformat(),
            "error_message": job.error_message,
            "original_filename": job.original_filename
        })

    @staticmethod
    def get_detailed_status(job_id: str):
        """Get detailed job status with processing steps"""
        if job_id not in job_storage:
            return jsonify({"error": "Job not found"}), 404

        job = job_storage[job_id]

        # Calculate elapsed time
        elapsed_seconds = (datetime.now() - job.created_at).total_seconds()

        # Estimate remaining time based on progress
        estimated_remaining = 0
        if job.progress > 0:
            total_estimated = elapsed_seconds / (job.progress / 100)
            estimated_remaining = max(0, total_estimated - elapsed_seconds)

        processing_steps = [
            {"step": "Upload", "progress": min(100, max(0, job.progress))},
            {"step": "Validation", "progress": min(
                100, max(0, job.progress - 10))},
            {"step": "Shape-from-Shading",
                "progress": min(100, max(0, job.progress - 30))},
            {"step": "DEM Generation", "progress": min(
                100, max(0, job.progress - 50))},
            {"step": "Visualization", "progress": min(
                100, max(0, job.progress - 70))},
            {"step": "Analysis", "progress": min(
                100, max(0, job.progress - 80))},
            {"step": "Packaging", "progress": min(
                100, max(0, job.progress - 95))}
        ]

        return jsonify({
            "job_id": job_id,
            "status": job.status.value,
            "progress": job.progress,
            "message": job.message,
            "created_at": job.created_at.isoformat(),
            "updated_at": job.updated_at.isoformat(),
            "elapsed_time_seconds": elapsed_seconds,
            "estimated_remaining_seconds": estimated_remaining,
            "processing_steps": processing_steps,
            "error_message": job.error_message
        })

    @staticmethod
    def get_all_jobs():
        """Get all job statuses (admin endpoint)"""
        jobs_summary = []
        for job_id, job in job_storage.items():
            jobs_summary.append({
                "job_id": job_id,
                "status": job.status.value,
                "progress": job.progress,
                "created_at": job.created_at.isoformat(),
                "original_filename": job.original_filename
            })

        # Sort by creation time (newest first)
        jobs_summary.sort(key=lambda x: x["created_at"], reverse=True)

        return jsonify({
            "total_jobs": len(jobs_summary),
            "active_jobs": len([j for j in jobs_summary if j["status"] in ["queued", "processing"]]),
            "completed_jobs": len([j for j in jobs_summary if j["status"] == "completed"]),
            "failed_jobs": len([j for j in jobs_summary if j["status"] == "failed"]),
            "jobs": jobs_summary
        })

    @staticmethod
    def cancel_job(job_id: str):
        """Cancel a processing job"""
        if job_id not in job_storage:
            return jsonify({"error": "Job not found"}), 404

        job = job_storage[job_id]

        if job.status in [JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED]:
            return jsonify({"error": f"Cannot cancel job in {job.status.value} state"}), 400

        # Cancel the future if it exists
        if hasattr(job, 'future') and job.future:
            job.future.cancel()

        job.status = JobStatus.CANCELLED
        job.message = "Job cancelled by user request"
        job.updated_at = datetime.now()

        return jsonify({
            "job_id": job_id,
            "status": job.status.value,
            "message": "Job cancelled successfully"
        })
