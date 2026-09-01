"""
Seed script for fashion_items catalog.
Populates the database with approved jewelry and makeup items across various color tones and occasions.
"""

import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session_factory, engine
from app.models.fashion_item import FashionItem

SAMPLE_ITEMS = [
    # ── Jewelry: Gold / Warm Tones ─────────────────────────────────────
    {
        "item_name": "Lustrous 18K Gold Layered Herringbone Necklace",
        "category": "jewelry",
        "color": "Gold",
        "price": 145.00,
        "image_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80",
        "status": "approved",
    },
    {
        "item_name": "Celestial Sunburst Gold Chandelier Earrings",
        "category": "jewelry",
        "color": "Gold",
        "price": 88.00,
        "image_url": "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=400&q=80",
        "status": "approved",
    },
    {
        "item_name": "Royal Kundan & Polki Heritage Choker",
        "category": "jewelry",
        "color": "Gold",
        "price": 320.00,
        "image_url": "https://images.unsplash.com/photo-1611591475155-4284ec28d351?auto=format&fit=crop&w=400&q=80",
        "status": "approved",
    },
    {
        "item_name": "Hammered Gold Statement Bangle Set",
        "category": "jewelry",
        "color": "Gold",
        "price": 95.00,
        "image_url": "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=400&q=80",
        "status": "approved",
    },
    {
        "item_name": "Minimalist Solid Gold Huggie Hoops",
        "category": "jewelry",
        "color": "Gold",
        "price": 60.00,
        "image_url": "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=400&q=80",
        "status": "approved",
    },

    # ── Jewelry: Silver / Cool Tones ────────────────────────────────────
    {
        "item_name": "Sterling Silver Cascading Tennis Necklace",
        "category": "jewelry",
        "color": "Silver",
        "price": 180.00,
        "image_url": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80",
        "status": "approved",
    },
    {
        "item_name": "Midnight Sapphire & Platinum Drop Earrings",
        "category": "jewelry",
        "color": "Silver",
        "price": 135.00,
        "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80",
        "status": "approved",
    },
    {
        "item_name": "Oxidized Silver Vintage Bohemian Cuff",
        "category": "jewelry",
        "color": "Silver",
        "price": 75.00,
        "image_url": "https://images.unsplash.com/photo-1611591475155-4284ec28d351?auto=format&fit=crop&w=400&q=80",
        "status": "approved",
    },
    {
        "item_name": "Emerald Solitaire Pendant in White Gold",
        "category": "jewelry",
        "color": "Silver",
        "price": 210.00,
        "image_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80",
        "status": "approved",
    },

    # ── Jewelry: Rose Gold & Pearls (Pastel / Romantic) ─────────────────
    {
        "item_name": "Baroque Freshwater Pearl Drop Earrings",
        "category": "jewelry",
        "color": "Pearl White",
        "price": 110.00,
        "image_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80",
        "status": "approved",
    },
    {
        "item_name": "Rose Gold Dainty Diamond Station Bracelet",
        "category": "jewelry",
        "color": "Rose Gold",
        "price": 125.00,
        "image_url": "https://images.unsplash.com/photo-1611591475155-4284ec28d351?auto=format&fit=crop&w=400&q=80",
        "status": "approved",
    },

    # ── Makeup: Warm / Terracotta / Coral ──────────────────────────────
    {
        "item_name": "Velvet Matte Lipstick in Spiced Terracotta",
        "category": "makeup",
        "color": "Terracotta",
        "price": 34.00,
        "image_url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80",
        "status": "approved",
    },
    {
        "item_name": "Golden Hour Warm Eyeshadow Palette (12 Shades)",
        "category": "makeup",
        "color": "Copper & Gold",
        "price": 54.00,
        "image_url": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=400&q=80",
        "status": "approved",
    },
    {
        "item_name": "Sunset Coral Silk Liquid Blush",
        "category": "makeup",
        "color": "Coral",
        "price": 28.00,
        "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80",
        "status": "approved",
    },
    {
        "item_name": "Sun-Drenched Molten Bronze Highlighter",
        "category": "makeup",
        "color": "Bronze",
        "price": 38.00,
        "image_url": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80",
        "status": "approved",
    },

    # ── Makeup: Cool / Berry / Mauve / Plum ────────────────────────────
    {
        "item_name": "Luxe Cream Lip Color in Deep Wine Berry",
        "category": "makeup",
        "color": "Berry",
        "price": 36.00,
        "image_url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80",
        "status": "approved",
    },
    {
        "item_name": "Smoky Plum & Amethyst Eyeshadow Quad",
        "category": "makeup",
        "color": "Plum",
        "price": 42.00,
        "image_url": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=400&q=80",
        "status": "approved",
    },
    {
        "item_name": "Cool Rose Petal Soft Matte Blush",
        "category": "makeup",
        "color": "Mauve",
        "price": 29.00,
        "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80",
        "status": "approved",
    },
    {
        "item_name": "Starlight Pearl Glow Liquid Luminizer",
        "category": "makeup",
        "color": "Champagne",
        "price": 32.00,
        "image_url": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80",
        "status": "approved",
    },

    # ── Makeup: Classic Bold Red & Nudes ──────────────────────────────
    {
        "item_name": "Iconic Crimson Red Longwear Lip Stain",
        "category": "makeup",
        "color": "Red",
        "price": 35.00,
        "image_url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80",
        "status": "approved",
    },
    {
        "item_name": "Pillow Soft Nude Hydrating Lip Oil",
        "category": "makeup",
        "color": "Nude",
        "price": 26.00,
        "image_url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80",
        "status": "approved",
    },
]


async def seed():
    async with async_session_factory() as session:
        # Check existing count
        res = await session.execute(text("SELECT count(*) FROM fashion_items"))
        count = res.scalar() or 0
        
        if count >= len(SAMPLE_ITEMS):
            print(f"[OK] fashion_items already populated with {count} items.")
            return

        print(f"Seeding {len(SAMPLE_ITEMS)} curated jewelry and makeup items...")
        for item_data in SAMPLE_ITEMS:
            item = FashionItem(**item_data)
            session.add(item)
        
        await session.commit()
        print(f"[SUCCESS] Seeded {len(SAMPLE_ITEMS)} fashion items into catalog!")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
