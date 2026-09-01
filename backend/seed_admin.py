"""
Seed default admin account.
Credentials:
  Username: admin
  Email: admin@glamiq.com
  Password: admin12345
"""

import asyncio
from sqlalchemy import select
from app.database import async_session_factory, engine
from app.models.admin import Admin
from app.services.auth_service import hash_password


async def seed_admin():
    async with async_session_factory() as session:
        result = await session.execute(
            select(Admin).where(Admin.username == "admin")
        )
        existing = result.scalar_one_or_none()

        if existing:
            print("[OK] Admin account 'admin' already exists.")
            return

        admin = Admin(
            username="admin",
            email="admin@glamiq.com",
            password_hash=hash_password("admin12345"),
        )
        session.add(admin)
        await session.commit()
        print("[SUCCESS] Created default admin account: admin / admin12345")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_admin())
