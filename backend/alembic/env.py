"""
Alembic environment configuration for async SQLAlchemy.
Reads the DATABASE_URL from app.config and uses the shared Base metadata.
"""

import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Alembic Config object
config = context.config

# Set up logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ── Import all models so their tables register on Base.metadata ──
from app.database import Base
from app.models import (  # noqa: F401
    User, Admin, Occasion, Outfit, FashionItem,
    Recommendation, RecommendationItem, ChatHistory,
)

target_metadata = Base.metadata

# ── Read database URL from our settings ──
from app.config import settings

config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# ── Only track Glam IQ tables (shared DB has other projects) ──
GLAMIQ_TABLES = {
    "users", "admins", "occasions", "outfits", "fashion_items",
    "recommendations", "recommendation_items", "chat_history",
}


def include_object(object, name, type_, reflected, compare_to):
    """Only include Glam IQ tables in autogenerate — skip everything else."""
    if type_ == "table":
        return name in GLAMIQ_TABLES
    # Include columns/indexes/constraints belonging to tracked tables
    if hasattr(object, "table") and hasattr(object.table, "name"):
        return object.table.name in GLAMIQ_TABLES
    return True


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode — generates SQL without connecting."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_object=include_object,
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        include_object=include_object,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations in 'online' mode — async engine."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    """Entry point for online migrations — wraps async in event loop."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
