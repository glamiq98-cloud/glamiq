"""Outfit model — mirrors the `outfits` table."""

from datetime import datetime, timezone
from sqlalchemy import Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Outfit(Base):
    __tablename__ = "outfits"

    outfit_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id"), nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    occasion_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("occasions.occasion_id"), nullable=True
    )
    color_palette: Mapped[str | None] = mapped_column(String(100), nullable=True)
    style_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user = relationship("User", back_populates="outfits", lazy="selectin")
    occasion = relationship("Occasion", back_populates="outfits", lazy="selectin")
    recommendations = relationship("Recommendation", back_populates="outfit", lazy="selectin")
