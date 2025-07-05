"""
Analysis controller for quality analysis and metrics
"""

import os
import json
from flask import current_app, jsonify

from app.models.job import JobStatus, job_storage
from app.utils.helpers import get_job_directory


class AnalysisController:
    """Handle quality analysis and metrics"""

    @staticmethod
    def get_quality_analysis(job_id: str):
        """Get detailed quality analysis"""
        if job_id not in job_storage:
            return jsonify({"error": "Job not found"}), 404

        job = job_storage[job_id]

        if job.status != JobStatus.COMPLETED:
            return jsonify({"error": "Job not completed yet"}), 400

        if not job.results:
            return jsonify({"error": "Analysis not available"}), 404

        return jsonify({
            "job_id": job_id,
            "quality_analysis": job.results["analysis_results"],
            "processing_info": job.results["processing_info"]
        })

    @staticmethod
    def get_surface_metrics(job_id: str):
        """Get surface analysis metrics"""
        if job_id not in job_storage:
            return jsonify({"error": "Job not found"}), 404

        job = job_storage[job_id]

        if job.status != JobStatus.COMPLETED:
            return jsonify({"error": "Job not completed yet"}), 400

        if not job.results:
            return jsonify({"error": "Analysis not available"}), 404

        analysis = job.results["analysis_results"]

        return jsonify({
            "job_id": job_id,
            "surface_metrics": {
                "elevation_stats": analysis.get("basic_stats", {}),
                "slope_analysis": analysis.get("gradient_stats", {}),
                "roughness_metrics": analysis.get("roughness_stats", {}),
                "mission_metrics": analysis.get("mission_metrics", {}),
                "quality_score": analysis.get("quality_score", 0)
            },
            "terrain_classification": {
                "crater_features": analysis.get("mission_metrics", {}).get("crater_candidates", 0),
                "ridge_features": analysis.get("mission_metrics", {}).get("ridge_features", 0),
                "flat_terrain_percent": analysis.get("mission_metrics", {}).get("flat_terrain_percent", 0),
                "landing_sites": analysis.get("mission_metrics", {}).get("suitable_landing_sites", 0)
            }
        })

    @staticmethod
    def get_analysis_report(job_id: str):
        """Get formatted analysis report"""
        if job_id not in job_storage:
            return jsonify({"error": "Job not found"}), 404

        job = job_storage[job_id]

        if job.status != JobStatus.COMPLETED:
            return jsonify({"error": "Job not completed yet"}), 400

        # Try to read the analysis report file
        job_dir = get_job_directory(
            job_id, current_app.config['RESULTS_FOLDER'])
        analysis_dir = os.path.join(job_dir, "analysis")

        report_file = os.path.join(analysis_dir, "analysis_report.txt")
        json_file = os.path.join(analysis_dir, "detailed_analysis.json")

        response_data = {"job_id": job_id}

        # Read text report
        if os.path.exists(report_file):
            try:
                with open(report_file, 'r', encoding='utf-8') as f:
                    response_data["text_report"] = f.read()
            except Exception as e:
                response_data["text_report_error"] = str(e)

        # Read JSON analysis
        if os.path.exists(json_file):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    response_data["detailed_analysis"] = json.load(f)
            except Exception as e:
                response_data["json_analysis_error"] = str(e)

        if "text_report" not in response_data and "detailed_analysis" not in response_data:
            return jsonify({"error": "Analysis report files not found"}), 404

        return jsonify(response_data)

    @staticmethod
    def compare_with_reference(job_id: str):
        """Compare results with reference data (placeholder for future feature)"""
        if job_id not in job_storage:
            return jsonify({"error": "Job not found"}), 404

        job = job_storage[job_id]

        if job.status != JobStatus.COMPLETED:
            return jsonify({"error": "Job not completed yet"}), 400

        # This is a placeholder for future reference comparison functionality
        return jsonify({
            "job_id": job_id,
            "comparison_status": "not_implemented",
            "message": "Reference comparison feature coming soon",
            "available_comparisons": [
                "Mission-standard DEM comparison",
                "Historical lunar data correlation",
                "Multi-mission cross-validation"
            ]
        })
