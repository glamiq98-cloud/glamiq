"""
Recommendation database service.

Executes rule-based advice generation and queries the database for matching
approved fashion_items (jewelry and makeup), saving the recommendations and
associated items.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, desc

from app.models.user import User
from app.models.outfit import Outfit
from app.models.occasion import Occasion
from app.models.fashion_item import FashionItem
from app.models.recommendation import Recommendation
from app.services.recommendation_engine import generate_style_advice


async def generate_and_save_recommendation(
    outfit_id: int,
    user: User,
    db: AsyncSession,
) -> Recommendation:
    """
    Generate styling recommendation for an outfit, match available fashion items,
    and persist into the DB.
    """
    # 1. Fetch outfit and joined occasion
    result = await db.execute(
        select(Outfit).where(Outfit.outfit_id == outfit_id, Outfit.user_id == user.user_id)
    )
    outfit = result.scalar_one_or_none()
    if not outfit:
        raise ValueError("Outfit not found or does not belong to current user")

    occasion_name = None
    if outfit.occasion_id:
        occ_res = await db.execute(
            select(Occasion).where(Occasion.occasion_id == outfit.occasion_id)
        )
        occ = occ_res.scalar_one_or_none()
        if occ:
            occasion_name = occ.occasion_name

    # 1.5 Auto-detect color via AI Vision if not set
    if not outfit.color_palette or outfit.color_palette.lower() in ("general", "none", ""):
        if outfit.image_url:
            from pathlib import Path
            from app.services.ai_vision_service import analyze_outfit_image_ai
            root_dir = Path(__file__).resolve().parent.parent.parent
            local_img_path = root_dir / outfit.image_url.lstrip("/")
            if local_img_path.exists():
                vision = await analyze_outfit_image_ai(local_img_path)
                outfit.color_palette = vision.get("color_palette", "Mustard Yellow & Warm Gold")
                await db.flush()

    # 2. Run personalized rule-based engine
    advice = generate_style_advice(
        color_palette=outfit.color_palette,
        style_type=outfit.style_type,
        occasion_name=occasion_name,
        skin_tone=user.skin_tone,
        preferences=user.preferences,
        user_name=user.full_name,
        gender=user.gender,
    )

    # 3. Query matching fashion items from catalog with personalized weighting
    metal_keyword = advice["jewelry_metal_keyword"]
    target_makeup_shades = advice["target_makeup_shades"]
    prefs = user.preferences or {}
    metal_pref = prefs.get("metal_preference", "").lower()

    # Match jewelry items (category='jewelry', approved)
    jewelry_query = select(FashionItem).where(
        FashionItem.category == "jewelry",
        FashionItem.status == "approved",
    )
    if metal_pref == "silver":
        jewelry_query = jewelry_query.where(
            or_(
                FashionItem.color.ilike("%silver%"),
                FashionItem.color.ilike("%platinum%"),
                FashionItem.item_name.ilike("%silver%"),
                FashionItem.item_name.ilike("%platinum%"),
            )
        )
    elif metal_pref == "gold":
        jewelry_query = jewelry_query.where(
            or_(
                FashionItem.color.ilike("%gold%"),
                FashionItem.color.ilike("%kundan%"),
                FashionItem.item_name.ilike("%kundan%"),
                FashionItem.item_name.ilike("%gold%"),
            )
        )
    elif metal_keyword:
        jewelry_query = jewelry_query.where(
            or_(
                FashionItem.color.ilike(f"%{metal_keyword}%"),
                FashionItem.item_name.ilike(f"%{metal_keyword}%"),
            )
        )
    
    jewelry_res = await db.execute(jewelry_query.limit(4))
    matched_jewelry = list(jewelry_res.scalars().all())

    # If no specific metal found, fallback to any approved jewelry
    if not matched_jewelry:
        fb_jew = await db.execute(
            select(FashionItem).where(
                FashionItem.category == "jewelry",
                FashionItem.status == "approved",
            ).limit(4)
        )
        matched_jewelry = list(fb_jew.scalars().all())

    # Match makeup items (category='makeup', approved)
    makeup_query = select(FashionItem).where(
        FashionItem.category == "makeup",
        FashionItem.status == "approved",
    )
    makeup_filters = [
        or_(
            FashionItem.color.ilike(f"%{shade}%"),
            FashionItem.item_name.ilike(f"%{shade}%"),
        )
        for shade in target_makeup_shades
    ]
    if makeup_filters:
        makeup_query = makeup_query.where(or_(*makeup_filters))

    makeup_res = await db.execute(makeup_query.limit(4))
    matched_makeup = list(makeup_res.scalars().all())

    # Fallback to general approved makeup if no exact shade matches
    if not matched_makeup:
        fb_mk = await db.execute(
            select(FashionItem).where(
                FashionItem.category == "makeup",
                FashionItem.status == "approved",
            ).limit(4)
        )
        matched_makeup = list(fb_mk.scalars().all())

    # Combine items
    all_matched_items = matched_jewelry + matched_makeup

    # 4. Create recommendation record
    rec = Recommendation(
        outfit_id=outfit.outfit_id,
        user_id=user.user_id,
        jewelry_suggestion=advice["jewelry_suggestion"],
        makeup_suggestion=advice["makeup_suggestion"],
        color_harmony=advice["color_harmony"],
        explanation=advice["explanation"],
        items=all_matched_items,
    )
    db.add(rec)
    await db.flush()
    await db.refresh(rec)

    return rec


async def get_user_recommendations(user_id: int, db: AsyncSession) -> List[Recommendation]:
    """Fetch all past recommendations for a user in reverse chronological order."""
    result = await db.execute(
        select(Recommendation)
        .where(Recommendation.user_id == user_id)
        .order_by(desc(Recommendation.generated_at))
    )
    return list(result.scalars().all())
