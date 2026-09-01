"""
Recommendations router — generate styling suggestions and retrieve history.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.recommendation import Recommendation
from app.schemas.recommendation import (
    RecommendationResponse,
    RecommendationHistoryResponse,
)
from app.services.recommendation_service import (
    generate_and_save_recommendation,
    get_user_recommendations,
)

router = APIRouter(tags=["Recommendations"])


@router.get(
    "/api/style-suggestions/{outfit_id}",
    response_model=RecommendationResponse,
    summary="Generate & fetch styling recommendations for an outfit",
)
async def get_style_suggestions(
    outfit_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Triggers the rule-based recommendation engine for the specified outfit,
    matches appropriate jewelry and makeup items, and returns the full styling breakdown.
    """
    try:
        rec = await generate_and_save_recommendation(
            outfit_id=outfit_id,
            user=current_user,
            db=db,
        )
        return rec
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recommendation generation failed: {str(e)}",
        )


@router.get(
    "/api/recommendations/history",
    response_model=RecommendationHistoryResponse,
    summary="Retrieve user's recommendation history",
)
async def get_recommendation_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch all styling recommendations previously generated for the logged in user."""
    recs = await get_user_recommendations(user_id=current_user.user_id, db=db)
    return RecommendationHistoryResponse(
        recommendations=recs,
        total=len(recs),
    )


@router.get(
    "/api/recommendations/{rec_id}",
    response_model=RecommendationResponse,
    summary="Fetch a specific recommendation by ID",
)
async def get_recommendation_by_id(
    rec_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch a single past recommendation result."""
    result = await db.execute(
        select(Recommendation).where(
            Recommendation.rec_id == rec_id,
            Recommendation.user_id == current_user.user_id,
        )
    )
    rec = result.scalar_one_or_none()
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found",
        )
    return rec
