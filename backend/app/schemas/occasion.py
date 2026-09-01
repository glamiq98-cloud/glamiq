"""Pydantic schemas for occasions."""

from pydantic import BaseModel


class OccasionResponse(BaseModel):
    """Single occasion returned to the client."""
    occasion_id: int
    occasion_name: str
    description: str | None = None

    model_config = {"from_attributes": True}
