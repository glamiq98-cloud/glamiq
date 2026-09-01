"""Pydantic schemas for outfit management."""

from datetime import datetime
from pydantic import BaseModel, Field


class OutfitCreateRequest(BaseModel):
    """Metadata sent alongside an outfit image upload."""
    occasion_id: int | None = None
    color_palette: str | None = Field(None, max_length=100)
    style_type: str | None = Field(
        None,
        pattern=r"^(casual|formal|western|eastern)$",
        description="One of: casual, formal, western, eastern",
    )


class OutfitResponse(BaseModel):
    """Single outfit returned to the client."""
    outfit_id: int
    user_id: int
    image_url: str | None = None
    occasion_id: int | None = None
    occasion_name: str | None = None
    color_palette: str | None = None
    style_type: str | None = None
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class OutfitListResponse(BaseModel):
    """Paginated list of outfits."""
    outfits: list[OutfitResponse]
    total: int
