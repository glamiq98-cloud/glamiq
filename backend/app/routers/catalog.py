"""
Public Catalog router — Serve approved fashion items for users.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.dependencies import get_db
from app.models.fashion_item import FashionItem
from app.schemas.recommendation import FashionItemResponse

router = APIRouter(prefix="/api/catalog", tags=["Catalog"])


@router.get("/items", response_model=List[FashionItemResponse], summary="List approved fashion items")
async def list_public_catalog_items(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """List approved fashion items with optional filtering by category."""
    query = select(FashionItem).where(FashionItem.status == "approved").order_by(desc(FashionItem.item_id))
    
    if category:
        query = query.where(FashionItem.category == category)

    result = await db.execute(query)
    return list(result.scalars().all())
