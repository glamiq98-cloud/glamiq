"""Pydantic schemas for the Virtual Stylist Chatbot."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class ChatQueryRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)


class ChatMessageResponse(BaseModel):
    chat_id: int
    user_id: int
    user_message: str
    bot_response: str
    timestamp: datetime

    model_config = {"from_attributes": True}


class ChatHistoryResponse(BaseModel):
    messages: List[ChatMessageResponse]
    total: int
