"""FashionItem model — mirrors the `fashion_items` table."""

from sqlalchemy import Integer, String, Numeric, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class FashionItem(Base):
    __tablename__ = "fashion_items"

    item_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    item_name: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(String(20), nullable=False)
    color: Mapped[str | None] = mapped_column(String(50), nullable=True)
    price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    style_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    occasion: Mapped[str | None] = mapped_column(String(50), nullable=True)

    __table_args__ = (
        CheckConstraint(
            "category IN ('jewelry', 'makeup', 'dress')",
            name="ck_fashion_items_category",
        ),
        CheckConstraint(
            "status IN ('pending', 'approved', 'rejected')",
            name="ck_fashion_items_status",
        ),
    )
