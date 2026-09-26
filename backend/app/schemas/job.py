"""Pydantic request/response models for job posting, search, and filters."""

from datetime import date, datetime
from typing import Literal

from pydantic import AnyHttpUrl, BaseModel, Field, field_validator, model_validator


class JobCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=120)
    category: str = Field(..., min_length=1, max_length=80)
    location: str = Field(..., min_length=1, max_length=160)
    salary: str | None = Field(None, max_length=80)
    job_type: Literal["full_time", "part_time", "internship", "remote", "contract"] = "full_time"
    application_method: Literal["in_platform", "external"] = "in_platform"
    external_url: AnyHttpUrl | None = Field(None, max_length=2048)
    description: str = Field("", max_length=12000)
    company_description: str = Field("", max_length=5000)
    employment_level: str = Field("", max_length=80)
    work_arrangement: str = Field("", max_length=80)
    working_hours: str = Field("", max_length=120)
    responsibilities: list[str] = Field(default_factory=list, max_length=40)
    requirements: list[str] = Field(default_factory=list, max_length=40)
    nice_to_have: list[str] = Field(default_factory=list, max_length=40)
    benefits: list[str] = Field(default_factory=list, max_length=40)
    application_instructions: str = Field("", max_length=4000)
    application_deadline: str | None = Field(None, max_length=10)

    @field_validator("responsibilities", "requirements", "nice_to_have", "benefits")
    @classmethod
    def validate_bullet_items(cls, items: list[str]) -> list[str]:
        cleaned = [item.strip() for item in items]
        if any(not item or len(item) > 500 for item in cleaned):
            raise ValueError("Each list item must contain 1 to 500 characters")
        return cleaned

    @field_validator("application_deadline")
    @classmethod
    def validate_application_deadline(cls, value: str | None) -> str | None:
        if value is not None:
            date.fromisoformat(value)
        return value

    @model_validator(mode="after")
    def validate_application_method(self):
        if self.application_method == "external" and not self.external_url:
            raise ValueError("An external application URL is required")
        return self


class JobDraft(BaseModel):
    title: str = Field("", max_length=120)
    category: str = Field("", max_length=80)
    location: str = Field("", max_length=160)
    salary_min: str = Field("", max_length=20)
    salary_max: str = Field("", max_length=20)
    job_type: Literal["full_time", "part_time", "internship", "remote", "contract"] = "full_time"
    description: str = Field("", max_length=12000)
    company_description: str = Field("", max_length=5000)
    employment_level: str = Field("", max_length=80)
    work_arrangement: str = Field("", max_length=80)
    working_hours: str = Field("", max_length=120)
    responsibilities: str = Field("", max_length=8000)
    requirements: str = Field("", max_length=8000)
    nice_to_have: str = Field("", max_length=8000)
    benefits: str = Field("", max_length=8000)
    application_method: Literal["in_platform", "external"] = "in_platform"
    external_url: str = Field("", max_length=2048)
    application_instructions: str = Field("", max_length=4000)
    application_deadline: str = Field("", max_length=10)


class JobOut(BaseModel):
    id: str
    employer_id: str
    title: str
    category: str
    location: str
    salary: str | None = None
    job_type: str
    application_method: str
    external_url: str | None = None
    description: str = ""
    company_description: str = ""
    employment_level: str = ""
    work_arrangement: str = ""
    working_hours: str = ""
    responsibilities: list[str] = Field(default_factory=list)
    requirements: list[str] = Field(default_factory=list)
    nice_to_have: list[str] = Field(default_factory=list)
    benefits: list[str] = Field(default_factory=list)
    application_instructions: str = ""
    application_deadline: str | None = None
    status: str = "active"
    posted_at: datetime | None = None
    company_name: str | None = None
    company_logo_url: str | None = None
    source: str = "wazifny"
    match_reason: str | None = None
    match_score: int | None = None
    applicants_count: int | None = None
    has_applied: bool = False


class JobSearchResponse(BaseModel):
    jobs: list[JobOut]
    ai_ranked: bool = False
    ai_provider: str | None = None


class RecommendedJobsResponse(BaseModel):
    personalized: bool
    ai_ranked: bool = False
    ai_provider: str | None = None
    recommended: list[JobOut]
    other: list[JobOut]


class AiMatchesResponse(BaseModel):
    personalized: bool
    ai_ranked: bool = False
    matches: list[JobOut]
