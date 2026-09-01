"""
Admin router — Auth, User Management, Product Catalog Moderation, and Usage Analytics.
"""

from datetime import datetime, timezone
import uuid
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_, delete

from app.dependencies import get_db
from app.models.admin import Admin
from app.models.user import User
from app.models.outfit import Outfit
from app.models.fashion_item import FashionItem
from app.models.recommendation import Recommendation
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
async def list_users(db: AsyncSession = Depends(get_db)):
    """List registered users alongside their wardrobe counts and profile details."""
    result = await db.execute(select(User).order_by(desc(User.created_at)))
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
    db: AsyncSession = Depends(get_db),
):
    """List fashion items with optional filtering by category and status."""
    query = select(FashionItem).order_by(desc(FashionItem.item_id))
    if category:
        query = query.where(FashionItem.category == category)
    if status_filter:
        query = query.where(FashionItem.status == status_filter)

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

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum size is 10MB",
        )

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
    )
    db.add(item)
    await db.flush()
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

    await db.flush()
    await db.refresh(item)
    return item


@router.delete("/products/{item_id}", summary="Delete product")
async def delete_product(item_id: int, db: AsyncSession = Depends(get_db)):
    """Permanently remove an item from the catalog."""
    result = await db.execute(select(FashionItem).where(FashionItem.item_id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    await db.delete(item)
    return {"message": f"Product '{item.item_name}' deleted successfully"}


# ── Analytics & System Logs ────────────────────────────────────────────

@router.get("/logs", response_model=AdminStatsResponse, summary="Get system usage analytics")
async def get_system_logs(db: AsyncSession = Depends(get_db)):
    """Fetch aggregated platform analytics, total counts, and recent activity logs."""
    total_users = (await db.execute(select(func.count()).select_from(User))).scalar() or 0
    total_outfits = (await db.execute(select(func.count()).select_from(Outfit))).scalar() or 0
    total_recs = (await db.execute(select(func.count()).select_from(Recommendation))).scalar() or 0
    total_items = (await db.execute(select(func.count()).select_from(FashionItem))).scalar() or 0
    total_chats = (await db.execute(select(func.count()).select_from(ChatHistory))).scalar() or 0

    # Recent recommendations for activity feed
    recent_recs_res = await db.execute(
        select(Recommendation).order_by(desc(Recommendation.generated_at)).limit(8)
    )
    recent_recs = recent_recs_res.scalars().all()

    activity = [
        {
            "id": r.rec_id,
            "type": "recommendation",
            "title": f"Look styled: {r.color_harmony}",
            "detail": r.jewelry_suggestion,
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
        recent_activity=activity,
    )
