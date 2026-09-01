"""Occasion model — mirrors the `occasions` table."""

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Occasion(Base):
    __tablename__ = "occasions"

    occasion_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    occasion_name: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationships
    outfits = relationship("Outfit", back_populates="occasion", lazy="selectin")
