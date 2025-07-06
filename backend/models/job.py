"""
Job models and data structures for Luna processing
"""

import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum


class JobStatus(Enum):
    """Job status enumeration"""
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class ProcessingJob:
    """Processing job data model"""
    job_id: str
    status: JobStatus
    progress: float
    message: str
    created_at: datetime
    updated_at: datetime
    image_path: str
    original_filename: str
    error_message: Optional[str] = None
    results: Optional[Dict[str, Any]] = None

    @classmethod
    def create_new(cls, image_path: str, original_filename: str) -> 'ProcessingJob':
        """Create a new processing job"""
        now = datetime.now()
        return cls(
            job_id=str(uuid.uuid4()),
            status=JobStatus.QUEUED,
            progress=0.0,
            message="Job queued for processing",
            created_at=now,
            updated_at=now,
            image_path=image_path,
            original_filename=original_filename
        )

    def update_status(self, status: JobStatus, progress: float = None, message: str = None):
        """Update job status"""
        self.status = status
        if progress is not None:
            self.progress = progress
        if message is not None:
            self.message = message
        self.updated_at = datetime.now()

    def set_error(self, error_message: str):
        """Set job as failed with error message"""
        self.status = JobStatus.FAILED
        self.error_message = error_message
        self.message = f"Processing failed: {error_message}"
        self.updated_at = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        data = asdict(self)
        data['status'] = self.status.value
        data['created_at'] = self.created_at.isoformat()
        data['updated_at'] = self.updated_at.isoformat()
        return data


# Global job storage (use Redis/DB in production)
job_storage: Dict[str, ProcessingJob] = {}
