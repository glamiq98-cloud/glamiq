"""
Virtual Stylist Chatbot Service.

Provides NVIDIA NIM and OpenAI LLM integration with live user styling context injection
(skin tone, latest outfit, occasion, color preferences) and graceful fallback.
"""

import json
from typing import List, Optional
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.config import settings
from app.models.user import User
from app.models.outfit import Outfit
from app.models.occasion import Occasion
from app.models.chat import ChatHistory


SYSTEM_PROMPT_TEMPLATE = """You are Glam IQ's expert virtual fashion stylist and personal shopper.
Your goal is to give chic, practical, concise, and personalized styling advice for outfits, jewelry, makeup, and color coordination.
If asked questions unrelated to fashion, styling, jewelry, makeup, or beauty, politely redirect to fashion topics.

Current User Styling Profile:
- Name: {user_name}
- Skin Tone: {skin_tone}
- Metal Preference: {metal_pref}
- Style Vibe: {style_vibe}
- Recent Outfit: {recent_outfit}
- Outfit Occasion: {recent_occasion}
- Dominant Color Palette: {color_palette}

Use this context to provide specific, grounded answers (e.g. referencing their metal preference, skin tone, or current outfit colors). Keep answers under 3-4 paragraphs.
"""


def _generate_fallback_response(user_msg: str, skin_tone: str, outfit_color: str, occ: str) -> str:
    """Intelligent rule-based fallback when AI APIs are unreachable or offline."""
    msg_lower = user_msg.lower()
    
    if "gold" in msg_lower or "silver" in msg_lower or "metal" in msg_lower or "jewelry" in msg_lower:
        if "warm" in outfit_color.lower() or "red" in outfit_color.lower() or "gold" in outfit_color.lower():
            return "For warm tones like red, coral, or warm neutrals, luminous gold or warm rose gold jewelry creates a radiant harmony. A statement necklace or layered herringbone chains will elevate your look beautifully."
        else:
            return "Silver and platinum jewelry add crisp elegance to cool and neutral palettes like navy, royal blue, black, or emerald. Pair delicate drop earrings or a tennis necklace for effortless sophistication."
            
    if "lip" in msg_lower or "makeup" in msg_lower or "shade" in msg_lower or "blush" in msg_lower:
        if skin_tone == "fair":
            return "With a fair complexion, soft cool berries, rosy pinks, and delicate champagne highlighters provide gorgeous definition without overpowering your natural undertones."
        elif skin_tone == "dark":
            return "Deep rich skin tones radiate with bold plums, dramatic burgundy, rich molten copper, and warm chocolate hues for high-contrast glam."
        else:
            return "For medium and olive skin tones, warm terracottas, spiced caramel nudes, and golden bronze highlighters enhance your natural warmth and radiance perfectly."

    if "shoe" in msg_lower or "bag" in msg_lower or "accessory" in msg_lower:
        return f"For a {occ or 'chic'} event, choose classic pointed-toe heels or metallic strappy sandals paired with a sleek structured clutch in a complementary neutral or metallic shade."

    return f"To style your look beautifully for a {occ or 'special'} event, balance your {outfit_color or 'ensemble'} with harmonious jewelry and a glowing makeup finish. Let me know if you'd like advice on jewelry metals, lip shades, or styling rules!"


async def handle_chat_query(
    user: User,
    user_message: str,
    db: AsyncSession,
) -> str:
    """
    Process user query with NVIDIA API / OpenAI, inject live styling context,
    and record the conversation.
    """
    # 1. Gather live styling context
    recent_outfit_desc = "None uploaded yet"
    recent_occasion_desc = "General"
    color_palette = "Not specified"

    outfit_res = await db.execute(
        select(Outfit)
        .where(Outfit.user_id == user.user_id)
        .order_by(desc(Outfit.uploaded_at))
        .limit(1)
    )
    latest_outfit = outfit_res.scalar_one_or_none()
    if latest_outfit:
        recent_outfit_desc = f"{latest_outfit.style_type or 'outfit'} in {latest_outfit.color_palette or 'selected color'}"
        color_palette = latest_outfit.color_palette or "custom"
        if latest_outfit.occasion_id:
            occ_res = await db.execute(
                select(Occasion).where(Occasion.occasion_id == latest_outfit.occasion_id)
            )
            occ = occ_res.scalar_one_or_none()
            if occ:
                recent_occasion_desc = occ.occasion_name

    prefs = user.preferences or {}
    metal_pref = prefs.get("metal_preference", "gold & silver")
    style_vibe = prefs.get("style_preference", "modern")
    skin_tone = user.skin_tone or "medium"

    # 2. Build system prompt with live context
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        user_name=user.full_name,
        skin_tone=skin_tone,
        metal_pref=metal_pref,
        style_vibe=style_vibe,
        recent_outfit=recent_outfit_desc,
        recent_occasion=recent_occasion_desc,
        color_palette=color_palette,
    )

    # 3. Retrieve recent chat history (last 6 messages)
    history_res = await db.execute(
        select(ChatHistory)
        .where(ChatHistory.user_id == user.user_id)
        .order_by(desc(ChatHistory.timestamp))
        .limit(6)
    )
    past_chats = list(reversed(history_res.scalars().all()))

    messages = [{"role": "system", "content": system_prompt}]
    for c in past_chats:
        if c.user_message:
            messages.append({"role": "user", "content": c.user_message})
        if c.bot_response:
            messages.append({"role": "assistant", "content": c.bot_response})
    messages.append({
        "role": "user",
        "content": user_message
    })

    bot_reply = None

    # 4. Try NVIDIA NIM API first (if key configured)
    if settings.NVIDIA_API_KEY and settings.NVIDIA_API_KEY.startswith("nvapi-"):
        try:
            nvidia_headers = {
                "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
                "Accept": "text/event-stream",
                "Content-Type": "application/json",
            }
            nvidia_payload = {
                "model": settings.NVIDIA_MODEL,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": f"{system_prompt}\n\nUser Question: {user_message}"
                            }
                        ]
                    }
                ],
                "max_tokens": 4096,
                "temperature": 1.0,
                "stream": True,
            }
            async with httpx.AsyncClient(timeout=25.0) as http_client:
                async with http_client.stream(
                    "POST",
                    settings.NVIDIA_API_URL,
                    headers=nvidia_headers,
                    json=nvidia_payload,
                ) as response:
                    if response.status_code == 200:
                        accumulated = ""
                        async for line in response.aiter_lines():
                            if line and line.startswith("data: "):
                                data_str = line[6:].strip()
                                if data_str == "[DONE]":
                                    break
                                try:
                                    chunk = json.loads(data_str)
                                    delta = chunk["choices"][0].get("delta", {})
                                    content = delta.get("content", "")
                                    if content:
                                        accumulated += content
                                except Exception:
                                    pass
                        if accumulated.strip():
                            bot_reply = accumulated.strip()
                    else:
                        print(f"[NVIDIA API Error] Status {response.status_code}")
        except Exception as e:
            print(f"[NVIDIA API Exception] {e}")

    # 5. Try OpenAI if NVIDIA wasn't used or failed
    if not bot_reply and settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("sk-your-key"):
        try:
            async with httpx.AsyncClient(timeout=15.0) as http_client:
                response = await http_client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "gpt-4o-mini",
                        "messages": messages,
                        "temperature": 0.7,
                        "max_tokens": 400,
                    },
                )
                if response.status_code == 200:
                    data = response.json()
                    bot_reply = data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"[OpenAI Exception] {e}")

    # 6. Fallback if both are unreachable
    if not bot_reply:
        bot_reply = _generate_fallback_response(
            user_msg=user_message,
            skin_tone=skin_tone,
            outfit_color=color_palette,
            occ=recent_occasion_desc,
        )

    # 7. Persist interaction in chat_history
    record = ChatHistory(
        user_id=user.user_id,
        user_message=user_message,
        bot_response=bot_reply,
    )
    db.add(record)
    await db.flush()

    return bot_reply
