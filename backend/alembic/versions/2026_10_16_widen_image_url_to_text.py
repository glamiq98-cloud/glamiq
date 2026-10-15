"""Widen fashion_items.image_url to Text for permanent image storage.

Uploaded product images are now stored as compressed base64 data URLs
directly in the database (Render's free-tier filesystem is ephemeral —
files saved to backend/uploads/ are wiped on every restart, which made
uploaded images go black). A VARCHAR(255) cannot hold a data URL, so
this widens the column to Text.

Revision ID: 2026_10_16_image_url_text
Revises: c3f8a1b2d4e5
"""

from alembic import op
import sqlalchemy as sa

revision = "2026_10_16_image_url_text"
down_revision = "c3f8a1b2d4e5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "fashion_items",
        "image_url",
        existing_type=sa.String(length=255),
        type_=sa.Text(),
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "fashion_items",
        "image_url",
        existing_type=sa.Text(),
        type_=sa.String(length=255),
        existing_nullable=True,
    )
