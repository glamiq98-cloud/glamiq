"""
Admin router — Auth, User Management, Product Catalog Moderation, and Usage Analytics.
"""

from datetime import datetime, timezone, timedelta, date
import uuid
import os
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_, delete, cast, Date

from app.dependencies import get_db
from app.models.admin import Admin
from app.models.user import User
from app.models.outfit import Outfit
from app.models.occasion import Occasion
from app.models.fashion_item import FashionItem
from app.models.recommendation import Recommendation, recommendation_items
from app.models.chat import ChatHistory
from app.services.auth_service import hash_password, verify_password, create_access_token
from app.schemas.admin import (
    AdminLoginRequest,
    AdminTokenResponse,
    AdminUserItem,
    AdminProductCreateRequest,
    AdminProductUpdateRequest,
    AdminStatsResponse,
)
from app.schemas.recommendation import FashionItemResponse

router = APIRouter(prefix="/api/admin", tags=["Admin Panel"])

# Product uploads directory
PRODUCT_UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads" / "products"
PRODUCT_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


# ── Admin Auth ─────────────────────────────────────────────────────────

@router.post("/auth/login", response_model=AdminTokenResponse, summary="Admin Login")
async def admin_login(body: AdminLoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate administrator using username or email and password."""
    result = await db.execute(
        select(Admin).where(
            or_(
                Admin.username == body.username_or_email,
                Admin.email == body.username_or_email,
            )
        )
    )
    admin = result.scalar_one_or_none()

    if not admin or not verify_password(body.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials",
        )

    # Update last login
    admin.last_login = datetime.now(timezone.utc)
    await db.flush()

    token = create_access_token(admin.admin_id)
    return AdminTokenResponse(
        access_token=token,
        admin_id=admin.admin_id,
        username=admin.username,
    )


# ── Users Management ───────────────────────────────────────────────────

@router.get("/users", response_model=List[AdminUserItem], summary="List all users")
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """List registered users alongside their wardrobe counts and profile details."""
    result = await db.execute(select(User).order_by(desc(User.created_at)).offset(skip).limit(limit))
    users = list(result.scalars().all())

    user_items = []
    for u in users:
        # Count outfits
        outfit_count_res = await db.execute(
            select(func.count()).select_from(Outfit).where(Outfit.user_id == u.user_id)
        )
        rec_count_res = await db.execute(
            select(func.count()).select_from(Recommendation).where(Recommendation.user_id == u.user_id)
        )
        
        user_items.append(
            AdminUserItem(
                user_id=u.user_id,
                full_name=u.full_name,
                email=u.email,
                gender=u.gender,
                skin_tone=u.skin_tone,
                created_at=u.created_at,
                outfits_count=outfit_count_res.scalar() or 0,
                recommendations_count=rec_count_res.scalar() or 0,
            )
        )

    return user_items


# ── Products / Fashion Items Management ────────────────────────────────

@router.get("/products", response_model=List[FashionItemResponse], summary="List all fashion items")
async def list_products(
    category: Optional[str] = None,
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    """List fashion items with optional filtering by category and status."""
    query = select(FashionItem).order_by(desc(FashionItem.item_id))
    if category:
        query = query.where(FashionItem.category == category)
    if status_filter:
        query = query.where(FashionItem.status == status_filter)

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


@router.post("/products/upload-image", summary="Upload product image file")
async def upload_product_image(file: UploadFile = File(...)):
    """Upload a product photo and return the relative static URL."""
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{ext}' not allowed. Use: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    if getattr(file, "size", None) is not None:
        if file.size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File too large. Maximum size is 10MB",
            )
    else:
        file.file.seek(0, 2)
        if file.file.tell() > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File too large. Maximum size is 10MB",
            )
        await file.seek(0)
        
    contents = await file.read()

    filename = f"prod_{uuid.uuid4().hex[:10]}{ext}"
    file_path = PRODUCT_UPLOAD_DIR / filename
    file_path.write_bytes(contents)

    return {"image_url": f"/uploads/products/{filename}"}


@router.post("/products", response_model=FashionItemResponse, status_code=status.HTTP_201_CREATED, summary="Add new product")
async def create_product(body: AdminProductCreateRequest, db: AsyncSession = Depends(get_db)):
    """Add a new fashion item to the catalog."""
    item = FashionItem(
        item_name=body.item_name,
        category=body.category,
        color=body.color,
        price=body.price,
        image_url=body.image_url,
        status=body.status,
        description=body.description,
        style_type=body.style_type,
        occasion=body.occasion,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.put("/products/{item_id}", response_model=FashionItemResponse, summary="Edit or moderate product")
async def update_product(
    item_id: int,
    body: AdminProductUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update item details or approve/reject pending fashion items."""
    result = await db.execute(select(FashionItem).where(FashionItem.item_id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(item, field, val)

    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/products/{item_id}", summary="Delete product")
async def delete_product(item_id: int, db: AsyncSession = Depends(get_db)):
    """Permanently remove an item from the catalog."""
    result = await db.execute(select(FashionItem).where(FashionItem.item_id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    # Clear references in many-to-many table first
    await db.execute(delete(recommendation_items).where(recommendation_items.c.item_id == item_id))
    
    await db.delete(item)
    await db.commit()
    
    # Clean up physical image file
    if item.image_url:
        file_path = PRODUCT_UPLOAD_DIR.parent.parent / item.image_url.lstrip("/")
        try:
            if file_path.exists():
                os.remove(file_path)
        except Exception as e:
            print(f"Failed to delete file {file_path}: {e}")
    
    return {"message": f"Product '{item.item_name}' deleted successfully"}


# ── Analytics & System Logs ────────────────────────────────────────────

@router.get("/logs", response_model=AdminStatsResponse, summary="Get system usage analytics")
async def get_system_logs(
    days: Optional[int] = 14,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Fetch aggregated platform analytics, filtered time-series metrics, occasion breakdown, and logs."""
    total_users = (await db.execute(select(func.count()).select_from(User))).scalar() or 0
    total_outfits = (await db.execute(select(func.count()).select_from(Outfit))).scalar() or 0
    total_recs = (await db.execute(select(func.count()).select_from(Recommendation))).scalar() or 0
    total_items = (await db.execute(select(func.count()).select_from(FashionItem))).scalar() or 0
    total_chats = (await db.execute(select(func.count()).select_from(ChatHistory))).scalar() or 0

    # 1. Resolve date boundaries
    today = datetime.now(timezone.utc).date()
    s_date = None
    e_date = today

    if start_date and end_date:
        try:
            s_date = date.fromisoformat(start_date)
            e_date = date.fromisoformat(end_date)
            if s_date > e_date:
                s_date, e_date = e_date, s_date
        except (ValueError, TypeError):
            s_date = None
            e_date = today

    if not s_date:
        if days == 0:
            # All-time window: find earliest user or fallback to 90 days ago
            earliest_dt = (await db.execute(select(func.min(User.created_at)))).scalar()
            s_date = earliest_dt.date() if earliest_dt else (today - timedelta(days=30))
            if (e_date - s_date).days < 6:
                s_date = e_date - timedelta(days=6)
        else:
            num_days = max(days or 14, 1)
            s_date = today - timedelta(days=num_days - 1)

    start_dt = datetime.combine(s_date, datetime.min.time(), tzinfo=timezone.utc)
    end_dt = datetime.combine(e_date, datetime.max.time(), tzinfo=timezone.utc)

    # Period-specific totals
    period_users = (
        await db.execute(
            select(func.count())
            .select_from(User)
            .where(User.created_at >= start_dt, User.created_at <= end_dt)
        )
    ).scalar() or 0

    period_outfits = (
        await db.execute(
            select(func.count())
            .select_from(Outfit)
            .where(Outfit.uploaded_at >= start_dt, Outfit.uploaded_at <= end_dt)
        )
    ).scalar() or 0

    period_recs = (
        await db.execute(
            select(func.count())
            .select_from(Recommendation)
            .where(Recommendation.generated_at >= start_dt, Recommendation.generated_at <= end_dt)
        )
    ).scalar() or 0

    # 2. Continuous time series spanning s_date to e_date
    user_ts_res = await db.execute(
        select(cast(User.created_at, Date).label("d"), func.count(User.user_id))
        .where(User.created_at >= start_dt, User.created_at <= end_dt)
        .group_by("d")
    )
    user_ts_map = {row[0]: row[1] for row in user_ts_res.all()}

    outfit_ts_res = await db.execute(
        select(cast(Outfit.uploaded_at, Date).label("d"), func.count(Outfit.outfit_id))
        .where(Outfit.uploaded_at >= start_dt, Outfit.uploaded_at <= end_dt)
        .group_by("d")
    )
    outfit_ts_map = {row[0]: row[1] for row in outfit_ts_res.all()}

    rec_ts_res = await db.execute(
        select(cast(Recommendation.generated_at, Date).label("d"), func.count(Recommendation.rec_id))
        .where(Recommendation.generated_at >= start_dt, Recommendation.generated_at <= end_dt)
        .group_by("d")
    )
    rec_ts_map = {row[0]: row[1] for row in rec_ts_res.all()}

    total_days = (e_date - s_date).days + 1
    time_series = []
    for i in range(total_days):
        curr = s_date + timedelta(days=i)
        time_series.append({
            "date": curr.strftime("%b %d"),
            "iso_date": curr.isoformat(),
            "users": user_ts_map.get(curr, 0),
            "outfits": outfit_ts_map.get(curr, 0),
            "recommendations": rec_ts_map.get(curr, 0),
        })

    # 3. Occasions distribution (filtered by period)
    occ_res = await db.execute(select(Occasion).order_by(Occasion.occasion_id))
    all_occasions = occ_res.scalars().all()

    occ_counts_res = await db.execute(
        select(Outfit.occasion_id, func.count(Outfit.outfit_id))
        .where(
            Outfit.occasion_id.isnot(None),
            Outfit.uploaded_at >= start_dt,
            Outfit.uploaded_at <= end_dt,
        )
        .group_by(Outfit.occasion_id)
    )
    occ_counts_map = {row[0]: row[1] for row in occ_counts_res.all()}

    # If no outfits in this period, fallback to all-time so honeycomb is never completely empty
    if not occ_counts_map:
        occ_counts_res_all = await db.execute(
            select(Outfit.occasion_id, func.count(Outfit.outfit_id))
            .where(Outfit.occasion_id.isnot(None))
            .group_by(Outfit.occasion_id)
        )
        occ_counts_map = {row[0]: row[1] for row in occ_counts_res_all.all()}

    total_tagged = sum(occ_counts_map.values()) or 1
    occasions_data = []
    for occ in all_occasions:
        cnt = occ_counts_map.get(occ.occasion_id, 0)
        pct = round((cnt / total_tagged) * 100, 1)
        occasions_data.append({
            "occasion_id": occ.occasion_id,
            "occasion_name": occ.occasion_name,
            "description": occ.description or "",
            "count": cnt,
            "percentage": pct,
        })
    occasions_data.sort(key=lambda x: x["count"], reverse=True)

    # 4. Product categories & status breakdown (Catalog health)
    cat_res = await db.execute(
        select(FashionItem.category, FashionItem.status, func.count(FashionItem.item_id))
        .group_by(FashionItem.category, FashionItem.status)
    )
    categories_map = {
        "jewelry": {"category": "jewelry", "count": 0, "approved": 0, "pending": 0, "rejected": 0},
        "makeup": {"category": "makeup", "count": 0, "approved": 0, "pending": 0, "rejected": 0},
        "dress": {"category": "dress", "count": 0, "approved": 0, "pending": 0, "rejected": 0},
    }
    for cat, st, cnt in cat_res.all():
        if cat in categories_map:
            categories_map[cat]["count"] += cnt
            if st in categories_map[cat]:
                categories_map[cat][st] += cnt
    categories_data = list(categories_map.values())

    # 5. Top 5 AI Recommended Items (filtered by period)
    top_items_res = await db.execute(
        select(
            FashionItem.item_id,
            FashionItem.item_name,
            FashionItem.category,
            FashionItem.image_url,
            FashionItem.price,
            func.count(recommendation_items.c.rec_id).label("rec_count"),
        )
        .join(recommendation_items, FashionItem.item_id == recommendation_items.c.item_id)
        .join(Recommendation, Recommendation.rec_id == recommendation_items.c.rec_id)
        .where(Recommendation.generated_at >= start_dt, Recommendation.generated_at <= end_dt)
        .group_by(FashionItem.item_id)
        .order_by(desc("rec_count"))
        .limit(5)
    )
    top_items_rows = top_items_res.all()

    # Fallback to all-time top items if none generated in selected slice
    if not top_items_rows:
        top_items_fallback = await db.execute(
            select(
                FashionItem.item_id,
                FashionItem.item_name,
                FashionItem.category,
                FashionItem.image_url,
                FashionItem.price,
                func.count(recommendation_items.c.rec_id).label("rec_count"),
            )
            .join(recommendation_items, FashionItem.item_id == recommendation_items.c.item_id)
            .group_by(FashionItem.item_id)
            .order_by(desc("rec_count"))
            .limit(5)
        )
        top_items_rows = top_items_fallback.all()

    top_recommended = [
        {
            "item_id": row[0],
            "item_name": row[1],
            "category": row[2],
            "image_url": row[3],
            "price": float(row[4]) if row[4] is not None else None,
            "recommendation_count": row[5],
        }
        for row in top_items_rows
    ]

    # 6. Color Palettes
    palettes_res = await db.execute(
        select(FashionItem.color, func.count(FashionItem.item_id))
        .where(FashionItem.color.isnot(None), FashionItem.color != "")
        .group_by(FashionItem.color)
        .order_by(desc(func.count(FashionItem.item_id)))
        .limit(6)
    )
    color_palettes = [{"color": row[0], "count": row[1]} for row in palettes_res.all()]

    # 7. Recent recommendations for activity feed (filtered or fallback)
    recent_recs_res = await db.execute(
        select(Recommendation)
        .where(Recommendation.generated_at >= start_dt, Recommendation.generated_at <= end_dt)
        .order_by(desc(Recommendation.generated_at))
        .limit(8)
    )
    recent_recs = recent_recs_res.scalars().all()
    if not recent_recs:
        recent_recs_res_fallback = await db.execute(
            select(Recommendation).order_by(desc(Recommendation.generated_at)).limit(8)
        )
        recent_recs = recent_recs_res_fallback.scalars().all()

    activity = [
        {
            "id": r.rec_id,
            "type": "recommendation",
            "title": f"Look styled: {r.color_harmony or 'Harmonized'}",
            "detail": r.jewelry_suggestion or r.explanation or "AI recommendation generated",
            "timestamp": r.generated_at.isoformat(),
        }
        for r in recent_recs
    ]

    return AdminStatsResponse(
        total_users=total_users,
        total_outfits=total_outfits,
        total_recommendations=total_recs,
        total_fashion_items=total_items,
        total_chat_messages=total_chats,
        period_users=period_users,
        period_outfits=period_outfits,
        period_recommendations=period_recs,
        filter_days=days,
        filter_start=s_date.isoformat(),
        filter_end=e_date.isoformat(),
        recent_activity=activity,
        time_series=time_series,
        occasions=occasions_data,
        categories=categories_data,
        top_recommended=top_recommended,
        color_palettes=color_palettes,
    )
