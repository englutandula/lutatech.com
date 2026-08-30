from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.api.deps import require_auth
from app.models.db_models import User, ToolJob

router = APIRouter(prefix="/jobs", tags=["jobs"])


class JobResponse(BaseModel):
    id: int
    tool_type: str
    status: str
    country_code: Optional[str]
    result_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("", response_model=List[JobResponse])
def list_jobs(
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db),
    limit: int = 50,
    offset: int = 0,
):
    """Get the authenticated user's tool job history."""
    jobs = (
        db.query(ToolJob)
        .filter(ToolJob.user_id == current_user.id)
        .order_by(ToolJob.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return jobs


@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    """Delete a single job from history."""
    job = db.query(ToolJob).filter(ToolJob.id == job_id, ToolJob.user_id == current_user.id).first()
    if job:
        db.delete(job)
        db.commit()
    return {"success": True}


@router.delete("")
def clear_jobs(
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    """Clear all jobs for the authenticated user."""
    db.query(ToolJob).filter(ToolJob.user_id == current_user.id).delete()
    db.commit()
    return {"success": True}
