"""
Profile router — view, update, and upload profile image.
"""

import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserProfileResponse
from app.schemas.profile import ProfileUpdateRequest, ProfileImageResponse
from app.services.skin_tone_service import estimate_skin_tone

router = APIRouter(prefix="/api/profile", tags=["Profile"])

# Upload settings
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads" / "profiles"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.get("", response_model=UserProfileResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Fetch the current user's profile."""
    return current_user


@router.put("", response_model=UserProfileResponse)
async def update_profile(
    body: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update profile fields (name, gender, preferences)."""
    update_data = body.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    for field, value in update_data.items():
        setattr(current_user, field, value)

    await db.flush()
    await db.refresh(current_user)
    return current_user


@router.post("/image", response_model=ProfileImageResponse)
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload or replace profile image.
    Automatically estimates skin tone from the uploaded photo.
    """
    # Validate file type
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{ext}' not allowed. Use: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read and validate size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)}MB",
        )

    # Delete old profile image if it exists
    if current_user.profile_image_url:
        old_path = Path(__file__).resolve().parent.parent.parent / current_user.profile_image_url.lstrip("/")
        if old_path.exists():
            old_path.unlink(missing_ok=True)

    # Save new file with a unique name
    filename = f"{current_user.user_id}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = UPLOAD_DIR / filename
    file_path.write_bytes(contents)

    # Update user record
    relative_url = f"/uploads/profiles/{filename}"
    current_user.profile_image_url = relative_url

    # Estimate skin tone from the uploaded image
    skin_tone = estimate_skin_tone(str(file_path))
    if skin_tone:
        current_user.skin_tone = skin_tone

    await db.flush()
    await db.refresh(current_user)

    return ProfileImageResponse(
        profile_image_url=relative_url,
        skin_tone=current_user.skin_tone,
        message="Profile image updated" + (
            f" — skin tone detected as '{skin_tone}'" if skin_tone else ""
        ),
    )
