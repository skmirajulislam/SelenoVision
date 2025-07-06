"""
Cloudinary service for file uploads and management
"""

import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from dotenv import load_dotenv
from PIL import Image
import tempfile

load_dotenv()


class CloudinaryService:
    """Service for managing files on Cloudinary"""

    def __init__(self):
        # Configure Cloudinary
        cloudinary.config(
            cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
            api_key=os.getenv('CLOUDINARY_API_KEY'),
            api_secret=os.getenv('CLOUDINARY_API_SECRET')
        )
        self.folder_prefix = "luna_results"

    def compress_image_if_needed(self, file_path: str, max_size_mb: int = 8) -> str:
        """Compress image if it exceeds size limit"""
        file_size_mb = os.path.getsize(file_path) / (1024 * 1024)

        if file_size_mb <= max_size_mb:
            return file_path

        # Create temporary compressed file
        temp_dir = tempfile.mkdtemp()
        compressed_path = os.path.join(
            temp_dir, f"compressed_{os.path.basename(file_path)}")

        try:
            with Image.open(file_path) as img:
                # Calculate compression ratio
                ratio = max_size_mb / file_size_mb
                quality = max(20, min(95, int(85 * ratio)))

                # Save compressed version
                img.save(compressed_path, optimize=True, quality=quality)
                return compressed_path
        except Exception as e:
            print(f"Error compressing image: {e}")
            return file_path

    def upload_file_with_compression(self, file_path: str, folder: str, resource_type: str = "auto") -> str:
        """Upload file to Cloudinary with compression if needed"""
        try:
            # Compress large images
            if resource_type == "image" or file_path.lower().endswith(('.png', '.jpg', '.jpeg')):
                compressed_path = self.compress_image_if_needed(file_path)
                upload_path = compressed_path
            else:
                upload_path = file_path

            result = cloudinary.uploader.upload(
                upload_path,
                folder=folder,
                resource_type=resource_type,
                overwrite=True,
                invalidate=True
            )

            # Clean up temporary compressed file
            if upload_path != file_path and os.path.exists(upload_path):
                os.remove(upload_path)

            return result['secure_url']
        except Exception as e:
            print(f"Error uploading file to Cloudinary: {e}")
            return ""

    def upload_processing_results(self, job_id: str, files_dict: dict) -> dict:
        """Upload all processing result files with proper structure"""
        cloudinary_urls = {}
        base_folder = f"luna_results/luna_job_{job_id}"

        # Define file mappings with compression settings
        file_mappings = {
            'original_image': {'resource_type': 'image', 'compress': True},
            'dem_geotiff': {'resource_type': 'raw', 'compress': False},
            'obj_model': {'resource_type': 'raw', 'compress': False},
            'visualization': {'resource_type': 'image', 'compress': True},
            'aspect_analysis': {'resource_type': 'image', 'compress': True},
            'slope_analysis': {'resource_type': 'image', 'compress': True},
            'contour_lines': {'resource_type': 'image', 'compress': True},
            'quality_report': {'resource_type': 'image', 'compress': True},
            'processing_log': {'resource_type': 'raw', 'compress': False}
        }

        for key, file_path in files_dict.items():
            if file_path and os.path.exists(file_path):
                mapping = file_mappings.get(
                    key, {'resource_type': 'auto', 'compress': False})
                folder = f"{base_folder}/{key}"

                # Upload with appropriate settings
                url = self.upload_file_with_compression(
                    file_path,
                    folder,
                    mapping['resource_type']
                )

                if url:
                    cloudinary_urls[key] = url
                    print(f"✅ Uploaded {key}: {url}")
                else:
                    print(f"❌ Failed to upload {key}")

        return cloudinary_urls

    def upload_file(self, file_path, public_id=None, folder=None):
        """Upload a file to Cloudinary"""
        try:
            if folder:
                full_folder = f"{self.folder_prefix}/{folder}"
            else:
                full_folder = self.folder_prefix

            result = cloudinary.uploader.upload(
                file_path,
                public_id=public_id,
                folder=full_folder,
                resource_type="auto"
            )
            return result
        except Exception as e:
            print(f"Error uploading file to Cloudinary: {e}")
            return None

    def upload_analysis_files(self, job_id, files_dict):
        """Upload all analysis files for a job"""
        results = {
            "geotiff": None,
            "obj_model": None,
            "visualizations": [],
            "analysis_files": [],
            "zip_archive": None
        }

        job_folder = f"job_{job_id}"

        try:
            # Upload GeoTIFF
            if files_dict.get("geotiff"):
                result = self.upload_file(
                    files_dict["geotiff"],
                    public_id=f"{job_id}_dem",
                    folder=f"{job_folder}/geotiff"
                )
                if result:
                    results["geotiff"] = result["secure_url"]

            # Upload OBJ model
            if files_dict.get("obj_model"):
                result = self.upload_file(
                    files_dict["obj_model"],
                    public_id=f"{job_id}_model",
                    folder=f"{job_folder}/models"
                )
                if result:
                    results["obj_model"] = result["secure_url"]

            # Upload visualizations
            if files_dict.get("visualizations"):
                for i, viz_file in enumerate(files_dict["visualizations"]):
                    result = self.upload_file(
                        viz_file,
                        public_id=f"{job_id}_viz_{i}",
                        folder=f"{job_folder}/visualizations"
                    )
                    if result:
                        results["visualizations"].append(result["secure_url"])

            # Upload analysis files
            if files_dict.get("analysis_files"):
                for i, analysis_file in enumerate(files_dict["analysis_files"]):
                    result = self.upload_file(
                        analysis_file,
                        public_id=f"{job_id}_analysis_{i}",
                        folder=f"{job_folder}/analysis"
                    )
                    if result:
                        results["analysis_files"].append(result["secure_url"])

            # Upload ZIP archive
            if files_dict.get("zip_archive"):
                result = self.upload_file(
                    files_dict["zip_archive"],
                    public_id=f"{job_id}_complete",
                    folder=f"{job_folder}/archives"
                )
                if result:
                    results["zip_archive"] = result["secure_url"]

            return results
        except Exception as e:
            print(f"Error uploading analysis files: {e}")
            return results

    def upload_luna_analysis_files(self, job_id: str, files_dict: dict) -> dict:
        """
        Upload Luna analysis files to Cloudinary with the expected structure

        Args:
            job_id (str): Unique job identifier
            files_dict (dict): Dictionary containing file paths for upload

        Returns:
            dict: Dictionary with cloudinary URLs for each file type
        """
        results = {
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

        job_folder = f"luna_job_{job_id}"

        try:
            # Map file types to specific uploads
            file_mapping = {
                "original_image": files_dict.get("original_image"),
                "dem_geotiff": files_dict.get("geotiff"),
                "visualization": files_dict.get("main_visualization"),
                "analysis_plot": files_dict.get("analysis_plot"),
                "slope_analysis": files_dict.get("slope_analysis"),
                "aspect_analysis": files_dict.get("aspect_analysis"),
                "hillshade": files_dict.get("hillshade"),
                "contour_lines": files_dict.get("contour_lines"),
                "quality_report": files_dict.get("quality_report"),
                "processing_log": files_dict.get("processing_log")
            }

            for file_type, file_path in file_mapping.items():
                if file_path and os.path.exists(file_path):
                    result = self.upload_file(
                        file_path,
                        public_id=f"{job_id}_{file_type}",
                        folder=f"{job_folder}/{file_type}"
                    )
                    if result:
                        results[file_type] = result["secure_url"]
                        print(
                            f"✅ Uploaded {file_type}: {result['secure_url']}")

            return results

        except Exception as e:
            print(f"❌ Error uploading Luna analysis files: {e}")
            return results

    def delete_file(self, public_id):
        """Delete a file from Cloudinary"""
        try:
            result = cloudinary.uploader.destroy(public_id)
            return result.get("result") == "ok"
        except Exception as e:
            print(f"Error deleting file from Cloudinary: {e}")
            return False

    def delete_folder(self, folder_path):
        """Delete a folder and all its contents"""
        try:
            # Get all resources in the folder
            resources = cloudinary.api.resources(
                type="upload",
                prefix=f"{self.folder_prefix}/{folder_path}",
                max_results=500
            )

            # Delete all resources
            for resource in resources.get("resources", []):
                self.delete_file(resource["public_id"])

            return True
        except Exception as e:
            print(f"Error deleting folder from Cloudinary: {e}")
            return False

    def delete_all_files(self, cloudinary_urls):
        """Delete all files from Cloudinary URLs"""
        try:
            # Extract public IDs from URLs and delete
            urls_to_delete = []

            if cloudinary_urls.get("geotiff"):
                urls_to_delete.append(cloudinary_urls["geotiff"])

            if cloudinary_urls.get("obj_model"):
                urls_to_delete.append(cloudinary_urls["obj_model"])

            if cloudinary_urls.get("visualizations"):
                urls_to_delete.extend(cloudinary_urls["visualizations"])

            if cloudinary_urls.get("analysis_files"):
                urls_to_delete.extend(cloudinary_urls["analysis_files"])

            if cloudinary_urls.get("zip_archive"):
                urls_to_delete.append(cloudinary_urls["zip_archive"])

            # Extract public IDs and delete
            for url in urls_to_delete:
                if url:
                    # Extract public ID from URL
                    public_id = self._extract_public_id(url)
                    if public_id:
                        self.delete_file(public_id)

            return True
        except Exception as e:
            print(f"Error deleting files from Cloudinary: {e}")
            return False

    def _extract_public_id(self, url):
        """Extract public ID from Cloudinary URL"""
        try:
            # Extract public ID from URL
            # URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.extension
            parts = url.split('/')
            if len(parts) >= 7:
                # Get the part after version number
                version_index = -1
                for i, part in enumerate(parts):
                    if part.startswith('v') and part[1:].isdigit():
                        version_index = i
                        break

                if version_index >= 0 and version_index + 1 < len(parts):
                    public_id_with_ext = '/'.join(parts[version_index + 1:])
                    # Remove file extension
                    public_id = public_id_with_ext.rsplit('.', 1)[0]
                    return public_id

            return None
        except Exception as e:
            print(f"Error extracting public ID: {e}")
            return None
