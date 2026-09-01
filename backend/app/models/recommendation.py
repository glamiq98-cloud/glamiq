"""Recommendation + RecommendationItem models — mirrors the `recommendations` and `recommendation_items` tables."""

from datetime import datetime, timezone
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# Many-to-many association table
recommendation_items = Table(
    "recommendation_items",
    Base.metadata,
    Column("rec_id", Integer, ForeignKey("recommendations.rec_id"), primary_key=True),
    Column("item_id", Integer, ForeignKey("fashion_items.item_id"), primary_key=True),
)


class Recommendation(Base):
    __tablename__ = "recommendations"

    rec_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    outfit_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("outfits.outfit_id"), nullable=False
    )
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.user_id"), nullable=False
    )
    jewelry_suggestion: Mapped[str | None] = mapped_column(String(255), nullable=True)
    makeup_suggestion: Mapped[str | None] = mapped_column(String(255), nullable=True)
    color_harmony: Mapped[str | None] = mapped_column(String(255), nullable=True)
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user = relationship("User", back_populates="recommendations")
    outfit = relationship("Outfit", back_populates="recommendations")
    items = relationship("FashionItem", secondary=recommendation_items, lazy="selectin")


# Alias for import convenience
RecommendationItem = recommendation_items
