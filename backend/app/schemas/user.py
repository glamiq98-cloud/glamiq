"""Pydantic schemas for user profile request/response validation."""

from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserProfileResponse(BaseModel):
    user_id: int
    full_name: str
    email: EmailStr
    gender: str | None = None
    skin_tone: str | None = None
    profile_image_url: str | None = None
    preferences: dict | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserProfileUpdate(BaseModel):
    full_name: str | None = None
    gender: str | None = None
    preferences: dict | None = None
