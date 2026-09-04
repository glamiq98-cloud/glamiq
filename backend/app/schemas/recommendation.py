"""Pydantic schemas for Recommendations."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class FashionItemResponse(BaseModel):
    item_id: int
    item_name: str
    category: str
    color: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    status: str
    description: Optional[str] = None
    style_type: Optional[str] = None
    occasion: Optional[str] = None

    model_config = {"from_attributes": True}


class RecommendationResponse(BaseModel):
    rec_id: int
    outfit_id: int
    user_id: int
    jewelry_suggestion: Optional[str] = None
    makeup_suggestion: Optional[str] = None
    color_harmony: Optional[str] = None
    explanation: Optional[str] = None
    generated_at: datetime
    items: List[FashionItemResponse] = []

    model_config = {"from_attributes": True}


class RecommendationHistoryResponse(BaseModel):
    recommendations: List[RecommendationResponse]
    total: int
