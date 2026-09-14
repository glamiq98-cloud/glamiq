"""Pydantic schemas for the Admin Panel."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class AdminLoginRequest(BaseModel):
    username_or_email: str
    password: str


class AdminTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin_id: int
    username: str


class AdminUserItem(BaseModel):
    user_id: int
    full_name: str
    email: EmailStr
    gender: Optional[str] = None
    skin_tone: Optional[str] = None
    created_at: datetime
    outfits_count: int = 0
    recommendations_count: int = 0

    model_config = {"from_attributes": True}


class AdminProductCreateRequest(BaseModel):
    item_name: str = Field(..., min_length=2, max_length=100)
    category: str = Field(..., pattern=r"^(jewelry|makeup|dress)$")
    color: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    status: str = Field("approved", pattern=r"^(pending|approved|rejected)$")
    description: Optional[str] = None
    style_type: Optional[str] = None
    occasion: Optional[str] = None


class AdminProductUpdateRequest(BaseModel):
    item_name: Optional[str] = None
    category: Optional[str] = None
    color: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None
    style_type: Optional[str] = None
    occasion: Optional[str] = None


class AdminStatsResponse(BaseModel):
    total_users: int
    total_outfits: int
    total_recommendations: int
    total_fashion_items: int
    total_chat_messages: int
    recent_activity: List[dict] = []
    time_series: List[dict] = []
    occasions: List[dict] = []
    categories: List[dict] = []
    top_recommended: List[dict] = []
    color_palettes: List[dict] = []
