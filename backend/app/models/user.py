"""User model — mirrors the `users` table."""

from datetime import datetime, timezone
from sqlalchemy import Integer, String, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    skin_tone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    profile_image_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    preferences: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    token_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False, server_default="1")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships (lazy-loaded by default)
    outfits = relationship("Outfit", back_populates="user", lazy="selectin")
    recommendations = relationship("Recommendation", back_populates="user", lazy="selectin")
    chat_history = relationship("ChatHistory", back_populates="user", lazy="selectin")
