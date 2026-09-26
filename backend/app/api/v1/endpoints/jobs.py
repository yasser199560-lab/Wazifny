import logging
from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile

from app.db.mongodb import get_database
from app.schemas.job import JobCreate, JobDraft, JobOut, JobSearchResponse, RecommendedJobsResponse
from app.services.matching_service import get_recommended_jobs, mark_applied_jobs, search_jobs
from app.services.job_image_service import (
    JobImageError,
    analyze_job_image,
    validate_job_image,
)
from app.utils.deps import get_optional_current_user, require_role

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/draft", response_model=JobDraft)
async def get_job_draft(current_user: dict = Depends(require_role("employer"))) -> dict:
    draft = await get_database().job_drafts.find_one({"employer_id": current_user["id"]})
    return JobDraft(**(draft or {})).model_dump()


@router.put("/draft", response_model=JobDraft)
async def save_job_draft(
    payload: JobDraft, current_user: dict = Depends(require_role("employer"))
) -> dict:
    draft = {**payload.model_dump(), "employer_id": current_user["id"], "updated_at": datetime.now(timezone.utc)}
    await get_database().job_drafts.update_one(
        {"employer_id": current_user["id"]}, {"$set": draft}, upsert=True
    )
    return payload.model_dump()


@router.delete("/draft", status_code=204)
async def delete_job_draft(current_user: dict = Depends(require_role("employer"))) -> None:
    await get_database().job_drafts.delete_one({"employer_id": current_user["id"]})


@router.post("/analyze-image")
async def analyze_job_post_image(
    file: UploadFile = File(...),
    _current_user: dict = Depends(require_role("employer")),
) -> dict:
    content = await file.read(3 * 1024 * 1024 + 1)
    await file.close()
    try:
        mime_type = validate_job_image(content, file.content_type)
    except JobImageError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    fields = await analyze_job_image(content, mime_type)
    if fields is None:
        raise HTTPException(
            status_code=503,
            detail="Image analysis is unavailable right now. You can still complete the form manually.",
        )
    return {"fields": fields.model_dump(), "provider": "gemini"}


def _serialize(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return doc


@router.get("", response_model=JobSearchResponse)
async def list_jobs(
    q: str | None = Query(None, description="Free-text search — AI-ranked when present"),
    category: str | None = None,
    location: str | None = None,
    job_type: str | None = None,
    limit: int = Query(30, ge=1, le=60),
    current_user: dict | None = Depends(get_optional_current_user),
) -> dict:
    """GET /jobs — public job search.

    With no `q`, this is a plain filtered/sorted listing (what a guest sees
    on the Find Jobs page). With `q`, results are ranked by an AI relevance
    pass over the matching jobs already in MongoDB (Gemini primary, Groq
    fallback, plain keyword match if both are down) — it never invents
    listings, only reorders/filters real ones.
    """
    db = get_database()
    result = await search_jobs(db, q=q, category=category, location=location, job_type=job_type, limit=limit)
    if current_user and current_user.get("role") == "talent":
        await mark_applied_jobs(db, current_user["id"], result["jobs"])
    return result


@router.get("/recommended", response_model=RecommendedJobsResponse)
async def recommended_jobs(current_user: dict = Depends(require_role("talent"))) -> dict:
    """GET /jobs/recommended — talent-only, AI-personalized picks.

    Reads whatever the talent has told us about themselves so far (skills /
    preferred categories, set via PATCH /talents/me/preferences — full CV
    upload & parsing is a later phase). If nothing's been set yet, this
    returns `personalized: false` and just the general job list, rather than
    pretending to have a personalized match.
    """
    db = get_database()
    return await get_recommended_jobs(db, talent_user_id=current_user["id"])


@router.get("/mine", response_model=list[JobOut])
async def my_jobs(current_user: dict = Depends(require_role("employer"))) -> list[dict]:
    """GET /jobs/mine — the current employer's own postings, each carrying
    its live applicant count (powers Manage Jobs)."""
    db = get_database()
    cursor = db.jobs.find({"employer_id": current_user["id"]}).sort("posted_at", -1)
    jobs = []
    async for job in cursor:
        out = _serialize(job)
        out["applicants_count"] = await db.applications.count_documents({"job_id": out["id"]})
        jobs.append(out)
    return jobs


@router.get("/mine/{job_id}", response_model=JobOut)
async def my_job(job_id: str, current_user: dict = Depends(require_role("employer"))) -> dict:
    """Return one of the current employer's postings, including pending ones."""
    db = get_database()
    try:
        job = await db.jobs.find_one({"_id": ObjectId(job_id), "employer_id": current_user["id"]})
    except InvalidId:
        job = None
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    out = _serialize(job)
    out["applicants_count"] = await db.applications.count_documents({"job_id": job_id})
    return out


@router.post("", response_model=JobOut, status_code=201)
async def create_job(
    payload: JobCreate, current_user: dict = Depends(require_role("employer"))
) -> dict:
    """POST /jobs — create a job posting (employer only)."""
    db = get_database()

    employer_profile = await db.employer_profiles.find_one({"user_id": current_user["id"]})
    company_name = employer_profile.get("company_name") if employer_profile else None
    company_logo_url = employer_profile.get("logo_url") if employer_profile else None

    job_doc = {
        **payload.model_dump(mode="json"),
        "employer_id": current_user["id"],
        "company_name": company_name,
        "company_logo_url": company_logo_url,
        "source": "wazifny",
        # New listings stay private until an administrator approves them.
        "status": "pending",
        "posted_at": datetime.now(timezone.utc),
    }
    result = await db.jobs.insert_one(job_doc)
    try:
        await db.job_drafts.delete_one({"employer_id": current_user["id"]})
    except Exception:
        logger.exception("Published job %s but could not clear employer draft", result.inserted_id)
    return _serialize({**job_doc, "_id": result.inserted_id})


@router.get("/{job_id}", response_model=JobOut)
async def get_job(
    job_id: str, current_user: dict | None = Depends(get_optional_current_user)
) -> dict:
    """GET /jobs/{job_id} — job detail."""
    db = get_database()
    try:
        doc = await db.jobs.find_one({"_id": ObjectId(job_id)})
    except InvalidId:
        raise HTTPException(status_code=404, detail="Job not found")
    if not doc:
        raise HTTPException(status_code=404, detail="Job not found")
    is_owner = current_user and current_user.get("role") == "employer" and doc.get("employer_id") == current_user.get("id")
    is_admin = current_user and current_user.get("role") == "admin"
    if doc.get("status") != "active" and not (is_owner or is_admin):
        raise HTTPException(status_code=404, detail="Job not found")
    result = _serialize(doc)
    if current_user and current_user.get("role") == "talent":
        await mark_applied_jobs(db, current_user["id"], [result])
    return result


@router.post("/{job_id}/save", status_code=201)
async def save_job(job_id: str, current_user: dict = Depends(require_role("talent"))) -> dict:
    """POST /jobs/{job_id}/save — bookmark a job (talent only)."""
    db = get_database()
    try:
        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    except InvalidId:
        raise HTTPException(status_code=404, detail="Job not found")
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    await db.saved_jobs.update_one(
        {"talent_id": current_user["id"], "job_id": job_id},
        {
            "$setOnInsert": {
                "talent_id": current_user["id"],
                "job_id": job_id,
                "saved_at": datetime.now(timezone.utc),
            }
        },
        upsert=True,
    )
    return {"saved": True}


@router.delete("/{job_id}/save", status_code=204)
async def unsave_job(job_id: str, current_user: dict = Depends(require_role("talent"))) -> None:
    """DELETE /jobs/{job_id}/save — remove a bookmark."""
    db = get_database()
    await db.saved_jobs.delete_one({"talent_id": current_user["id"], "job_id": job_id})


@router.put("/{job_id}", response_model=JobOut)
async def update_job(
    job_id: str, payload: JobCreate, current_user: dict = Depends(require_role("employer"))
) -> dict:
    """PUT /jobs/{job_id} — update a job posting (employer only, must own it)."""
    db = get_database()
    try:
        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    except InvalidId:
        raise HTTPException(status_code=404, detail="Job not found")
    if not job or job.get("employer_id") != current_user["id"]:
        raise HTTPException(status_code=404, detail="Job not found")

    await db.jobs.update_one({"_id": job["_id"]}, {"$set": payload.model_dump(mode="json")})
    updated = await db.jobs.find_one({"_id": job["_id"]})
    return _serialize(updated)


@router.delete("/{job_id}", status_code=204)
async def close_job(job_id: str, current_user: dict = Depends(require_role("employer"))) -> None:
    """DELETE /jobs/{job_id} — close a job posting (employer only, must own
    it). Soft-delete: marks status "closed" rather than removing the
    document, so existing applications/matches stay intact."""
    db = get_database()
    try:
        job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    except InvalidId:
        raise HTTPException(status_code=404, detail="Job not found")
    if not job or job.get("employer_id") != current_user["id"]:
        raise HTTPException(status_code=404, detail="Job not found")
    await db.jobs.update_one({"_id": job["_id"]}, {"$set": {"status": "closed"}})
