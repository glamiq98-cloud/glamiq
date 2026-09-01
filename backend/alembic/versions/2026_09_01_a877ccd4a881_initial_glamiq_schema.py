"""initial_glamiq_schema

Revision ID: a877ccd4a881
Revises: 
Create Date: 2026-09-01 10:21:57.107670

Creates all Glam IQ tables. The existing `users` table (from a different
project) is dropped and recreated with the Glam IQ schema.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a877ccd4a881'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Independent tables (no FKs) ──────────────────────────────────
    op.create_table('users',
        sa.Column('user_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('full_name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=150), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('gender', sa.String(length=20), nullable=True),
        sa.Column('skin_tone', sa.String(length=20), nullable=True),
        sa.Column('profile_image_url', sa.String(length=255), nullable=True),
        sa.Column('preferences', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('user_id'),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    op.create_table('admins',
        sa.Column('admin_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=150), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('admin_id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username'),
    )

    op.create_table('fashion_items',
        sa.Column('item_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('item_name', sa.String(length=100), nullable=False),
        sa.Column('category', sa.String(length=20), nullable=False),
        sa.Column('color', sa.String(length=50), nullable=True),
        sa.Column('price', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('image_url', sa.String(length=255), nullable=True),
        sa.Column('status', sa.String(length=20), server_default='pending', nullable=False),
        sa.CheckConstraint("category IN ('jewelry', 'makeup', 'dress')", name='ck_fashion_items_category'),
        sa.CheckConstraint("status IN ('pending', 'approved', 'rejected')", name='ck_fashion_items_status'),
        sa.PrimaryKeyConstraint('item_id'),
    )

    op.create_table('occasions',
        sa.Column('occasion_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('occasion_name', sa.String(length=50), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('occasion_id'),
    )

    # ── Tables with FK to users ──────────────────────────────────────
    op.create_table('outfits',
        sa.Column('outfit_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('image_url', sa.String(length=255), nullable=True),
        sa.Column('occasion_id', sa.Integer(), nullable=True),
        sa.Column('color_palette', sa.String(length=100), nullable=True),
        sa.Column('style_type', sa.String(length=50), nullable=True),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id']),
        sa.ForeignKeyConstraint(['occasion_id'], ['occasions.occasion_id']),
        sa.PrimaryKeyConstraint('outfit_id'),
    )

    op.create_table('chat_history',
        sa.Column('chat_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('user_message', sa.Text(), nullable=True),
        sa.Column('bot_response', sa.Text(), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id']),
        sa.PrimaryKeyConstraint('chat_id'),
    )

    # ── Tables with FK to outfits + users ────────────────────────────
    op.create_table('recommendations',
        sa.Column('rec_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('outfit_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('jewelry_suggestion', sa.String(length=255), nullable=True),
        sa.Column('makeup_suggestion', sa.String(length=255), nullable=True),
        sa.Column('color_harmony', sa.String(length=255), nullable=True),
        sa.Column('explanation', sa.Text(), nullable=True),
        sa.Column('generated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['outfit_id'], ['outfits.outfit_id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id']),
        sa.PrimaryKeyConstraint('rec_id'),
    )

    # ── Many-to-many junction ────────────────────────────────────────
    op.create_table('recommendation_items',
        sa.Column('rec_id', sa.Integer(), nullable=False),
        sa.Column('item_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['rec_id'], ['recommendations.rec_id']),
        sa.ForeignKeyConstraint(['item_id'], ['fashion_items.item_id']),
        sa.PrimaryKeyConstraint('rec_id', 'item_id'),
    )

    # ── Seed occasions ───────────────────────────────────────────────
    op.execute("""
        INSERT INTO occasions (occasion_name, description) VALUES
        ('Wedding', 'Weddings, bridal events, and formal celebrations'),
        ('Party', 'Birthday parties, social gatherings, and nightlife'),
        ('Casual', 'Everyday casual outings and relaxed settings'),
        ('Formal', 'Business meetings, corporate events, and galas'),
        ('Office', 'Professional workplace attire'),
        ('Date Night', 'Romantic dinners and date outings'),
        ('Festival', 'Cultural festivals, concerts, and outdoor events')
    """)


def downgrade() -> None:
    op.drop_table('recommendation_items')
    op.drop_table('recommendations')
    op.drop_table('chat_history')
    op.drop_table('outfits')
    op.drop_table('occasions')
    op.drop_table('fashion_items')
    op.drop_table('admins')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
