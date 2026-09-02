"""Pydantic schemas for profile management."""

from pydantic import BaseModel, EmailStr, Field


class ProfileUpdateRequest(BaseModel):
    """Fields a user can update on their profile."""
    full_name: str | None = Field(None, min_length=1, max_length=100)
    gender: str | None = None
    skin_tone: str | None = None
    preferences: dict | None = None


class ProfileImageResponse(BaseModel):
    """Returned after a profile image upload."""
    profile_image_url: str
    skin_tone: str | None = None
    message: str = "Profile image updated"
