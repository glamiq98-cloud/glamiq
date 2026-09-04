"""
Glam IQ — FastAPI application entry point.
Mounts all routers, configures CORS, and serves the API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.routers import auth as auth_router
from app.routers import profile as profile_router
from app.routers import outfits as outfits_router
from app.routers import occasions as occasions_router
from app.routers import recommendations as recommendations_router
from app.routers import chatbot as chatbot_router
from app.routers import admin as admin_router
from app.routers import catalog as catalog_router

app = FastAPI(
    title="Glam IQ API",
    description="AI-Powered Outfit, Jewelry & Makeup Recommendation Platform",
    version="1.0.0",
)

# ── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,       # Required for httpOnly cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files for uploads ─────────────────────────────────
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ── Routers ──────────────────────────────────────────────────
app.include_router(auth_router.router)
app.include_router(profile_router.router)
app.include_router(outfits_router.router)
app.include_router(occasions_router.router)
app.include_router(recommendations_router.router)
app.include_router(chatbot_router.router)
app.include_router(admin_router.router)
app.include_router(catalog_router.router)


@app.get("/", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "app": "Glam IQ API", "version": "1.0.0"}
