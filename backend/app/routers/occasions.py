"""
Occasions router — list available occasions.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies import get_db
from app.models.occasion import Occasion
from app.schemas.occasion import OccasionResponse

router = APIRouter(prefix="/api/occasions", tags=["Occasions"])


@router.get("", response_model=list[OccasionResponse])
async def list_occasions(db: AsyncSession = Depends(get_db)):
    """List all available occasions (public endpoint)."""
    result = await db.execute(select(Occasion).order_by(Occasion.occasion_id))
    return result.scalars().all()
