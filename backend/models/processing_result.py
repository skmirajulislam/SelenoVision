"""
Processing Result model for MongoDB
"""

from database import get_db
from services.cloudinary_service import CloudinaryService
from bson import ObjectId
from datetime import datetime
from typing import Dict, Any, Optional


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
    def create_result(user_id: str, job_id: str, filename: str) -> Optional[str]:
        """Create a new processing result record"""
        try:
            db = get_db()
            result = {
                'user_id': user_id,
                'job_id': job_id,
                'filename': filename,
                'original_filename': filename,
                'status': 'queued',
                'progress': 0,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat(),
                'cloudinary_urls': {
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
                },
                'analysis': {},
                'processing_info': {},
                'analysis_results': {},
                'analysis_report_json': {},
                'error_message': None
            }

            insert_result = db.processing_results.insert_one(result)
            return str(insert_result.inserted_id)
        except Exception as e:
            print(f"Error creating processing result: {e}")
            return None

    @staticmethod
    def update_result(result_id: str, updates: Dict[str, Any]) -> bool:
        """Update processing result"""
        try:
            db = get_db()
            updates['updated_at'] = datetime.utcnow().isoformat()
            db.processing_results.update_one(
                {'_id': ObjectId(result_id)},
                {'$set': updates}
            )
            return True
        except Exception as e:
            print(f"Error updating processing result: {e}")
            return False

    @staticmethod
    def find_by_id(result_id: str) -> Optional[Dict[str, Any]]:
        """Find processing result by ID"""
        try:
            db = get_db()
            if isinstance(result_id, str):
                object_id = ObjectId(result_id)
                result = db.processing_results.find_one({'_id': object_id})
            if result:
                result['_id'] = str(result['_id'])
            return result
        except Exception as e:
            print(f"Error finding processing result: {e}")
            return None

    @staticmethod
    def find_by_job_id(job_id: str) -> Optional[Dict[str, Any]]:
        """Find processing result by job ID"""
        try:
            db = get_db()
            result = db.processing_results.find_one({'job_id': job_id})
            if result:
                result['_id'] = str(result['_id'])
            return result
        except Exception as e:
            print(f"Error finding processing result: {e}")
            return None

    @staticmethod
    def find_by_user_id(user_id: str, limit: int = 10) -> list:
        """Find processing results by user ID"""
        try:
            db = get_db()
            results = list(db.processing_results.find(
                {'user_id': user_id}
            ).sort('created_at', -1).limit(limit))

            for result in results:
                result['_id'] = str(result['_id'])

            return results
        except Exception as e:
            print(f"Error finding user processing results: {e}")
            return []

    @staticmethod
    def delete_result(result_id: str) -> bool:
        """Delete processing result and associated cloud files"""
        try:
            db = get_db()
            
            # Get the result first to access cloudinary URLs
            result = db.processing_results.find_one({'_id': ObjectId(result_id)})
            if result:
                # Delete from Cloudinary
                try:
                    cloudinary_service = CloudinaryService()
                    cloudinary_urls = result.get('cloudinary_urls', {})
                    if cloudinary_urls:
                        # Delete the entire folder for this job
                        job_id = result.get('job_id')
                        if job_id:
                            cloudinary_service.delete_folder(f"luna_results/luna_job_{job_id}")
                except Exception as e:
                    print(f"Error deleting Cloudinary files: {e}")
                
                # Delete from database
                db.processing_results.delete_one({'_id': ObjectId(result_id)})
                return True
            return False
        except Exception as e:
            print(f"Error deleting processing result: {e}")
            return False

    @staticmethod
    def delete_all_by_user(user_id: str) -> bool:
        """Delete all results for a user"""
        try:
            db = get_db()
            results = ProcessingResult.find_by_user_id(user_id, limit=1000)  # Get all results

            # Delete from Cloudinary
            try:
                cloudinary_service = CloudinaryService()
                for result in results:
                    cloudinary_urls = result.get('cloudinary_urls', {})
                    if cloudinary_urls:
                        job_id = result.get('job_id')
                        if job_id:
                            cloudinary_service.delete_folder(f"luna_results/luna_job_{job_id}")
            except Exception as e:
                print(f"Error deleting Cloudinary files: {e}")

            # Delete from database
            db.processing_results.delete_many({"user_id": user_id})
            return True
        except Exception as e:
            print(f"Error deleting user results: {e}")
            return False

    @staticmethod
    def get_user_statistics(user_id: str) -> Dict[str, int]:
        """Get user processing statistics"""
        try:
            db = get_db()
            pipeline = [
                {'$match': {'user_id': user_id}},
                {'$group': {
                    '_id': '$status',
                    'count': {'$sum': 1}
                }}
            ]

            results = list(db.processing_results.aggregate(pipeline))
            stats = {
                'total_results': 0,
                'completed_results': 0,
                'processing_results': 0,
                'failed_results': 0
            }

            for result in results:
                status = result['_id']
                count = result['count']
                stats['total_results'] += count

                if status == 'completed':
                    stats['completed_results'] = count
                elif status == 'processing':
                    stats['processing_results'] = count
                elif status == 'failed':
                    stats['failed_results'] = count

            return stats
        except Exception as e:
            print(f"Error getting user statistics: {e}")
            return {
                'total_results': 0,
                'completed_results': 0,
                'processing_results': 0,
                'failed_results': 0
            }

    def update_status(self, status, processing_info=None, analysis_results=None):
        """Update processing status and results"""
        try:
            db = get_db()
            update_data = {
                "status": status,
                "updated_at": datetime.utcnow().isoformat()
            }

            if processing_info:
                update_data["processing_info"] = processing_info
                self.processing_info = processing_info

            if analysis_results:
                update_data["analysis_results"] = analysis_results
                self.analysis_results = analysis_results

            self.status = status

            db.processing_results.update_one(
                {"_id": self._id},
                {"$set": update_data}
            )
            return True
        except Exception as e:
            print(f"Error updating status: {e}")
            return False

    def update_cloudinary_urls(self, cloudinary_urls):
        """Update Cloudinary URLs"""
        try:
            db = get_db()
            self.cloudinary_urls = cloudinary_urls
            db.processing_results.update_one(
                {"_id": self._id},
                {"$set": {
                    "cloudinary_urls": cloudinary_urls,
                    "updated_at": datetime.utcnow().isoformat()
                }}
            )
            return True
        except Exception as e:
            print(f"Error updating cloudinary URLs: {e}")
            return False

    def update_analysis_report_json(self, analysis_report_json):
        """Update analysis report JSON data"""
        try:
            db = get_db()
            self.analysis_report_json = analysis_report_json
            db.processing_results.update_one(
                {"_id": self._id},
                {"$set": {
                    "analysis_report_json": analysis_report_json,
                    "updated_at": datetime.utcnow().isoformat()
                }}
            )
            return True
        except Exception as e:
            print(f"Error updating analysis report: {e}")
            return False

    def to_dict(self):
        """Convert result to dictionary"""
        return {
            "_id": str(self._id) if self._id else None,
            "user_id": self.user_id,
            "job_id": self.job_id,
            "original_filename": self.original_filename,
            "status": self.status,
            "created_at": self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at,
            "updated_at": self.updated_at.isoformat() if isinstance(self.updated_at, datetime) else self.updated_at,
            "processing_info": self.processing_info,
            "analysis_results": self.analysis_results,
            "analysis_report_json": self.analysis_report_json,
            "cloudinary_urls": self.cloudinary_urls,
            "error_message": self.error_message
        }
