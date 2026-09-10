"""
Outfit router — upload, list, and retrieve outfits.
"""

import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.outfit import Outfit
from app.models.occasion import Occasion
from app.schemas.outfit import OutfitResponse, OutfitListResponse
from app.services.ai_vision_service import analyze_outfit_image_ai

router = APIRouter(prefix="/api/outfits", tags=["Outfits"])

# Upload settings
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads" / "outfits"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def _outfit_to_response(outfit: Outfit) -> OutfitResponse:
    """Convert an Outfit ORM object to a response schema, including occasion name."""
    return OutfitResponse(
        outfit_id=outfit.outfit_id,
        user_id=outfit.user_id,
        image_url=outfit.image_url,
        occasion_id=outfit.occasion_id,
        occasion_name=outfit.occasion.occasion_name if outfit.occasion else None,
        color_palette=outfit.color_palette,
        style_type=outfit.style_type,
        uploaded_at=outfit.uploaded_at,
    )


@router.post("", response_model=OutfitResponse, status_code=status.HTTP_201_CREATED)
async def upload_outfit(
    file: UploadFile = File(...),
    occasion_id: int | None = Form(None),
    color_palette: str | None = Form(None),
    style_type: str | None = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload a new outfit image with optional metadata.
    """
    # Validate style_type if provided
    valid_styles = {"casual", "formal", "western", "eastern"}
    if style_type and style_type.lower() not in valid_styles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid style_type. Must be one of: {', '.join(valid_styles)}",
        )

    # Validate file type
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{ext}' not allowed. Use: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read and validate size efficiently
    if getattr(file, "size", None) is not None:
        if file.size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)}MB",
            )
    else:
        file.file.seek(0, 2)
        if file.file.tell() > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)}MB",
            )
        await file.seek(0)
        
    contents = await file.read()

    # Validate occasion exists if provided
    if occasion_id is not None:
        result = await db.execute(
            select(Occasion).where(Occasion.occasion_id == occasion_id)
        )
        if result.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Occasion not found",
            )

    # Save file
    filename = f"{current_user.user_id}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = UPLOAD_DIR / filename
    file_path.write_bytes(contents)

    # If color palette not provided, auto-detect using AI Vision
    detected_color = color_palette
    if not detected_color or detected_color.strip() == "":
        try:
            vision_result = await analyze_outfit_image_ai(file_path)
            detected_color = vision_result.get("color_palette", "Mustard Yellow & Warm Gold")
        except Exception as e:
            print(f"AI Vision error: {e}")
            detected_color = "Mustard Yellow & Warm Gold"

    # Create outfit record
    outfit = Outfit(
        user_id=current_user.user_id,
        image_url=f"/uploads/outfits/{filename}",
        occasion_id=occasion_id,
        color_palette=detected_color,
        style_type=style_type.lower() if style_type else "casual",
    )
    db.add(outfit)
    await db.flush()
    await db.refresh(outfit)

    # Eagerly load the occasion relationship for the response
    if outfit.occasion_id:
        result = await db.execute(
            select(Occasion).where(Occasion.occasion_id == outfit.occasion_id)
        )
        occasion = result.scalar_one_or_none()
    else:
        occasion = None

    return OutfitResponse(
        outfit_id=outfit.outfit_id,
        user_id=outfit.user_id,
        image_url=outfit.image_url,
        occasion_id=outfit.occasion_id,
        occasion_name=occasion.occasion_name if occasion else None,
        color_palette=outfit.color_palette,
        style_type=outfit.style_type,
        uploaded_at=outfit.uploaded_at,
    )


@router.get("", response_model=OutfitListResponse)
async def list_outfits(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all outfits for the current user."""
    result = await db.execute(
        select(Outfit)
        .where(Outfit.user_id == current_user.user_id)
        .order_by(Outfit.uploaded_at.desc())
        .offset(skip)
        .limit(limit)
    )
    outfits = result.scalars().all()

    count_result = await db.execute(
        select(func.count()).select_from(Outfit).where(Outfit.user_id == current_user.user_id)
    )
    total = count_result.scalar() or 0

    return OutfitListResponse(
        outfits=[_outfit_to_response(o) for o in outfits],
        total=total,
    )


@router.get("/{outfit_id}", response_model=OutfitResponse)
async def get_outfit(
    outfit_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch a single outfit by ID (must belong to the current user)."""
    result = await db.execute(
        select(Outfit).where(
            Outfit.outfit_id == outfit_id,
            Outfit.user_id == current_user.user_id,
        )
    )
    outfit = result.scalar_one_or_none()

    if outfit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outfit not found",
        )

    return _outfit_to_response(outfit)


@router.delete("/{outfit_id}", summary="Delete an outfit")
async def delete_outfit(
    outfit_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an outfit, its recommendations, and the uploaded image file."""
    result = await db.execute(
        select(Outfit).where(
            Outfit.outfit_id == outfit_id,
            Outfit.user_id == current_user.user_id,
        )
    )
    outfit = result.scalar_one_or_none()

    if not outfit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outfit not found",
        )

    # Delete related recommendations to satisfy foreign key constraints
    from app.models.recommendation import Recommendation, recommendation_items
    from sqlalchemy import delete
    
    recs_res = await db.execute(select(Recommendation).where(Recommendation.outfit_id == outfit_id))
    recs = recs_res.scalars().all()
    for rec in recs:
        await db.execute(delete(recommendation_items).where(recommendation_items.c.rec_id == rec.rec_id))
        await db.delete(rec)

    # Delete outfit from DB
    await db.delete(outfit)
    await db.commit()

    # Delete physical image file
    if outfit.image_url:
        file_path = UPLOAD_DIR / Path(outfit.image_url).name
        try:
            if file_path.exists():
                os.remove(file_path)
        except Exception as e:
            print(f"Failed to delete file {file_path}: {e}")

    return {"message": "Outfit deleted successfully"}
