"""Add missing fashion_items columns (description, style_type, occasion).

The FashionItem ORM model declares description / style_type / occasion,
but the initial schema migration never created them, which broke
seed_fashion_items.py. This migration brings the table in line with the model.

Revision ID: c3f8a1b2d4e5
Revises: ae0161628216
"""

from alembic import op
import sqlalchemy as sa

revision = "c3f8a1b2d4e5"
down_revision = "ae0161628216"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("fashion_items", sa.Column("description", sa.String(length=500), nullable=True))
    op.add_column("fashion_items", sa.Column("style_type", sa.String(length=50), nullable=True))
    op.add_column("fashion_items", sa.Column("occasion", sa.String(length=50), nullable=True))


def downgrade() -> None:
    op.drop_column("fashion_items", "occasion")
    op.drop_column("fashion_items", "style_type")
    op.drop_column("fashion_items", "description")
