"""
Authentication service — password hashing and JWT token management.
Uses passlib[bcrypt] for passwords, python-jose for JWTs.
"""

from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt, JWTError
from fastapi import HTTPException, status

from app.config import settings

# ── Password hashing ────────────────────────────────────────

def hash_password(plain_password: str) -> str:
    """Hash a plaintext password with bcrypt."""
    # Bcrypt max password length is 72 bytes
    pwd_bytes = plain_password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False


# ── JWT token creation / validation ─────────────────────────

def create_access_token(user_id: int) -> str:
    """Create a short-lived access token (default 30 min)."""
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "type": "access",
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: int, token_version: int = 1) -> str:
    """Create a long-lived refresh token (default 7 days)."""
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "type": "refresh",
        "version": token_version,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str, expected_type: str = "access") -> dict:
    """
    Decode and validate a JWT token.
    Returns the payload dict or raises HTTPException(401).
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        token_type = payload.get("type")
        user_id = payload.get("sub")
        if user_id is None or token_type != expected_type:
            raise credentials_exception
        return payload
    except JWTError:
        raise credentials_exception
