"""
Processing Result model for MongoDB
"""

from datetime import datetime
from bson import ObjectId
from database import get_db
from services.cloudinary_service import CloudinaryService


class ProcessingResult:
    """Model for storing ML processing results"""

    def __init__(self, user_id, job_id, original_filename, status="processing", _id=None):
        self._id = _id
        self.user_id = user_id
        self.job_id = job_id
        self.original_filename = original_filename
        self.status = status  # processing, completed, failed
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.error_message = None  # For storing error details

        # Processing results
        self.processing_info = {}
        self.analysis_results = {}
        self.analysis_report_json = {}

        # Cloudinary URLs
        self.cloudinary_urls = {
            "original_image": None,
            "dem_geotiff": None,
            "visualization": None,
            "analysis_plot": None,
            "slope_analysis": None,
            "aspect_analysis": None,
            "hillshade": None,
            "contour_lines": None,
            "quality_report": None,
            "processing_log": None
        }

    @staticmethod
    def create_result(user_id, job_id, original_filename):
        """Create a new processing result"""
        db = get_db()

        result_data = {
            "user_id": user_id,
            "job_id": job_id,
            "original_filename": original_filename,
            "status": "processing",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "error_message": None,
            "processing_info": {},
            "analysis_results": {},
            "analysis_report_json": {},
            "cloudinary_urls": {
                "original_image": None,
                "dem_geotiff": None,
                "visualization": None,
                "analysis_plot": None,
                "slope_analysis": None,
                "aspect_analysis": None,
                "hillshade": None,
                "contour_lines": None,
                "quality_report": None,
                "processing_log": None
            }
        }

        result = db.processing_results.insert_one(result_data)
        return ProcessingResult.find_by_id(result.inserted_id)

    @staticmethod
    def find_by_id(result_id):
        """Find result by ID"""
        db = get_db()
        if isinstance(result_id, str):
            result_id = ObjectId(result_id)

        result_data = db.processing_results.find_one({"_id": result_id})
        if result_data:
            result = ProcessingResult(
                user_id=result_data["user_id"],
                job_id=result_data["job_id"],
                original_filename=result_data["original_filename"],
                status=result_data["status"],
                _id=result_data["_id"]
            )
            result.processing_info = result_data.get("processing_info", {})
            result.analysis_results = result_data.get("analysis_results", {})
            result.analysis_report_json = result_data.get(
                "analysis_report_json", {})
            result.cloudinary_urls = result_data.get("cloudinary_urls", {})
            result.error_message = result_data.get("error_message")
            result.created_at = result_data.get("created_at")
            result.updated_at = result_data.get("updated_at")
            return result
        return None

    @staticmethod
    def find_by_job_id(job_id):
        """Find result by job ID"""
        db = get_db()
        result_data = db.processing_results.find_one({"job_id": job_id})
        if result_data:
            result = ProcessingResult(
                user_id=result_data["user_id"],
                job_id=result_data["job_id"],
                original_filename=result_data["original_filename"],
                status=result_data["status"],
                _id=result_data["_id"]
            )
            result.processing_info = result_data.get("processing_info", {})
            result.analysis_results = result_data.get("analysis_results", {})
            result.analysis_report_json = result_data.get(
                "analysis_report_json", {})
            result.cloudinary_urls = result_data.get("cloudinary_urls", {})
            result.error_message = result_data.get("error_message")
            result.created_at = result_data.get("created_at")
            result.updated_at = result_data.get("updated_at")
            return result
        return None

    @staticmethod
    def find_by_user_id(user_id):
        """Find all results by user ID"""
        db = get_db()
        results = []
        for result_data in db.processing_results.find({"user_id": user_id}).sort("created_at", -1):
            result = ProcessingResult(
                user_id=result_data["user_id"],
                job_id=result_data["job_id"],
                original_filename=result_data["original_filename"],
                status=result_data["status"],
                _id=result_data["_id"]
            )
            result.processing_info = result_data.get("processing_info", {})
            result.analysis_results = result_data.get("analysis_results", {})
            result.analysis_report_json = result_data.get(
                "analysis_report_json", {})
            result.cloudinary_urls = result_data.get("cloudinary_urls", {})
            result.created_at = result_data.get("created_at")
            result.updated_at = result_data.get("updated_at")
            results.append(result)
        return results

    @staticmethod
    def delete_all_by_user(user_id):
        """Delete all results for a user"""
        db = get_db()
        results = ProcessingResult.find_by_user_id(user_id)

        # Delete from Cloudinary
        cloudinary_service = CloudinaryService()
        for result in results:
            cloudinary_service.delete_all_files(result.cloudinary_urls)

        # Delete from database
        db.processing_results.delete_many({"user_id": user_id})
        return True

    def update_status(self, status, processing_info=None, analysis_results=None):
        """Update processing status and results"""
        db = get_db()
        update_data = {
            "status": status,
            "updated_at": datetime.utcnow()
        }

        if processing_info:
            update_data["processing_info"] = processing_info
            self.processing_info = processing_info

        if analysis_results:
            update_data["analysis_results"] = analysis_results
            self.analysis_results = analysis_results

        self.status = status
        self.updated_at = update_data["updated_at"]

        db.processing_results.update_one(
            {"_id": self._id},
            {"$set": update_data}
        )

    def update_cloudinary_urls(self, cloudinary_urls):
        """Update Cloudinary URLs"""
        db = get_db()
        self.cloudinary_urls = cloudinary_urls
        db.processing_results.update_one(
            {"_id": self._id},
            {"$set": {
                "cloudinary_urls": cloudinary_urls,
                "updated_at": datetime.utcnow()
            }}
        )

    def update_analysis_report_json(self, analysis_report_json):
        """Update analysis report JSON data"""
        db = get_db()
        self.analysis_report_json = analysis_report_json
        db.processing_results.update_one(
            {"_id": self._id},
            {"$set": {
                "analysis_report_json": analysis_report_json,
                "updated_at": datetime.utcnow()
            }}
        )

    def delete_result(self):
        """Delete this result and associated cloud files"""
        db = get_db()

        # Delete from Cloudinary
        cloudinary_service = CloudinaryService()
        cloudinary_service.delete_all_files(self.cloudinary_urls)

        # Delete from database
        db.processing_results.delete_one({"_id": self._id})
        return True

    def to_dict(self):
        """Convert result to dictionary"""
        return {
            "_id": str(self._id),
            "user_id": self.user_id,
            "job_id": self.job_id,
            "original_filename": self.original_filename,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "processing_info": self.processing_info,
            "analysis_results": self.analysis_results,
            "analysis_report_json": self.analysis_report_json,
            "cloudinary_urls": self.cloudinary_urls
        }
