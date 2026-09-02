"""
Chatbot router — Virtual Stylist AI assistant.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, desc

from typing import Optional
from app.dependencies import get_db, get_current_user, get_optional_user
from app.models.user import User
from app.models.chat import ChatHistory
from app.schemas.chat import (
    ChatQueryRequest,
    ChatMessageResponse,
    ChatHistoryResponse,
)
from app.services.chatbot_service import handle_chat_query

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])


@router.post("/query", summary="Send message to Virtual Stylist")
async def send_chat_query(
    body: ChatQueryRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Send a styling question to the AI Virtual Stylist.
    Automatically injects user's current wardrobe and skin tone context if logged in.
    """
    reply = await handle_chat_query(
        user=current_user,
        user_message=body.message,
        db=db,
    )
    return {"bot_response": reply}


@router.get("/history", response_model=ChatHistoryResponse, summary="Get chat history")
async def get_chat_history(
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch past conversational turns between the user and virtual stylist."""
    if current_user is None:
        return ChatHistoryResponse(messages=[], total=0)

    result = await db.execute(
        select(ChatHistory)
        .where(ChatHistory.user_id == current_user.user_id)
        .order_by(ChatHistory.timestamp.asc())
    )
    chats = list(result.scalars().all())
    return ChatHistoryResponse(
        messages=chats,
        total=len(chats),
    )


@router.delete("/history", summary="Clear chat history")
async def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Reset and clear conversation history for the current user."""
    await db.execute(
        delete(ChatHistory).where(ChatHistory.user_id == current_user.user_id)
    )
    return {"message": "Chat history cleared"}
