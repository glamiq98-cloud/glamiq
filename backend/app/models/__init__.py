"""Re-export all models so Alembic and the app can import from one place."""

from app.models.user import User
from app.models.admin import Admin
from app.models.occasion import Occasion
from app.models.outfit import Outfit
from app.models.fashion_item import FashionItem
from app.models.recommendation import Recommendation, RecommendationItem
from app.models.chat import ChatHistory

__all__ = [
    "User",
    "Admin",
    "Occasion",
    "Outfit",
    "FashionItem",
    "Recommendation",
    "RecommendationItem",
    "ChatHistory",
]
