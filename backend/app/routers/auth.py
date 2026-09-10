"""
Auth router — register, login, refresh, logout.
Refresh tokens are stored in httpOnly cookies for security.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, MessageResponse
from app.schemas.user import UserProfileResponse
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Cookie settings for refresh token
REFRESH_COOKIE_KEY = "refresh_token"
REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60  # 7 days in seconds


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    """Set the refresh token as an httpOnly, secure, SameSite cookie."""
    response.set_cookie(
        key=REFRESH_COOKIE_KEY,
        value=refresh_token,
        httponly=True,
        secure=False,        # Set to True in production (requires HTTPS)
        samesite="lax",
        max_age=REFRESH_COOKIE_MAX_AGE,
        path="/",
    )


@router.post("/register", response_model=UserProfileResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """
    Create a new user account.
    Returns the user profile (no token — redirect to login).
    """
    # Check if email already exists
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        full_name=body.full_name,
        email=body.email,
        password_hash=hash_password(body.password),
        gender=body.gender,
    )
    db.add(user)
    await db.flush()          # Populate user_id before returning
    await db.refresh(user)    # Reload all fields

    return user


@router.post("/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate user, return access token in JSON body
    and refresh token as an httpOnly cookie.
    """
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(user.user_id)
    refresh_token = create_refresh_token(user.user_id, token_version=user.token_version)

    _set_refresh_cookie(response, refresh_token)

    return TokenResponse(access_token=access_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    """
    Read the refresh token from the httpOnly cookie,
    validate it, and issue a new access token.
    """
    refresh_token = request.cookies.get(REFRESH_COOKIE_KEY)
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token found",
        )

    payload = decode_token(refresh_token, expected_type="refresh")
    user_id = int(payload["sub"])

    # Verify user still exists
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    # Validate token_version to ensure it hasn't been revoked
    token_version = payload.get("version")
    if token_version != user.token_version:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
        )

    # Issue new tokens (rotate refresh token too)
    new_access_token = create_access_token(user.user_id)
    new_refresh_token = create_refresh_token(user.user_id, token_version=user.token_version)
    _set_refresh_cookie(response, new_refresh_token)

    return TokenResponse(access_token=new_access_token)


@router.post("/logout", response_model=MessageResponse)
async def logout(
    request: Request, 
    response: Response, 
    db: AsyncSession = Depends(get_db)
):
    """Clear the refresh token cookie and invalidate all active sessions for user."""
    # Attempt to extract user to invalidate token_version
    refresh_token = request.cookies.get(REFRESH_COOKIE_KEY)
    if refresh_token:
        try:
            payload = decode_token(refresh_token, expected_type="refresh")
            user_id = int(payload["sub"])
            result = await db.execute(select(User).where(User.user_id == user_id))
            user = result.scalar_one_or_none()
            if user:
                # Increment token_version to invalidate all existing refresh tokens
                user.token_version += 1
                await db.commit()
        except Exception:
            pass # Even if token invalid, proceed with clearing cookie

    response.delete_cookie(
        key=REFRESH_COOKIE_KEY,
        path="/",
        httponly=True,
        samesite="lax",
    )
    return MessageResponse(message="Logged out successfully")
