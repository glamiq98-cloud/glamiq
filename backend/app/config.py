"""
Application settings loaded from environment variables (.env file).
Uses pydantic-settings for validation and type coercion.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # ── Database ──────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/glamiq"
    DATABASE_SCHEMA: str = "glamiq"

    # ── JWT ───────────────────────────────────────────────────
    JWT_SECRET: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── CORS ──────────────────────────────────────────────────
    CORS_ORIGINS: str = "http://localhost:5173"

    # ── AI Providers (NVIDIA NIM / OpenAI) ───────────────────
    OPENAI_API_KEY: str = ""
    NVIDIA_API_KEY: str = "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"
    NVIDIA_API_URL: str = "https://integrate.api.nvidia.com/v1/chat/completions"
    NVIDIA_MODEL: str = "moonshotai/kimi-k3"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()
