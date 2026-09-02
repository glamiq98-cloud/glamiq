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
    """Intelligent, diverse rule-based fallback when AI APIs are unreachable or offline."""
    msg_lower = user_msg.lower()

    # 1. Men's Styling & Menswear
    if any(k in msg_lower for k in ["male", "men", "man", "groom", "boy", "guy", "sherwani", "kurta", "waistcoat", "prince coat"]):
        if any(k in msg_lower for k in ["wedding", "barat", "walima", "nikkah"]):
            return (
                "For a Pakistani wedding, gentlemen look distinguished in a tailored raw silk or velvet Sherwani in ivory, deep black, or midnight blue, paired with a matching churidar or straight trousers. "
                "For a modern regal statement, add an embroidered shawl and classic velvet khussa shoes. A semi-formal option is an embroidered kurta with a structured jacquard waistcoat."
            )
        elif "mehndi" in msg_lower or "mayun" in msg_lower:
            return (
                "For Mehndi and Mayun events, vibrant kurtas in mustard yellow, olive green, burnt orange, or ivory paired with an embellished waistcoat make the perfect celebratory statement."
            )
        return (
            "For men's eastern styling, structured kurtas in textured raw silk, cotton-silk, or linen paired with a tailored waistcoat or prince coat are versatile and elegant. "
            "Pair with leather Peshawari chappals or velvet loafers to complete the look."
        )

    # 2. Bridal & Wedding Looks
    if any(k in msg_lower for k in ["bridal", "bride", "lehenga", "barat", "walima", "nikkah"]):
        if "walima" in msg_lower:
            return (
                "For a Walima ceremony, modern Pakistani brides favor opulent pastel maxis, peshwas, or soft metallic lehengas (champagne, blush, sage, or ice blue) "
                "paired with sparkling diamond, zircon, or white gold polki jewellery and a soft luminous dewy glam finish."
            )
        return (
            "For bridal glamour, traditional deep crimson, ruby, or jewel-toned velvet and raw silk lehengas heavily embellished with antique zardozi and kora dabka are timeless. "
            "Coordinate with handcrafted 22K Kundan Matha Patti, chokers, and a bold velvet matte lip color."
        )

    # 3. Mehndi & Festive Celebrations
    if any(k in msg_lower for k in ["mehndi", "mayun", "haldi", "festival", "eid"]):
        return (
            "For festive occasions and Mehndi nights, embrace joyful color-blocking like mustard with emerald, or hot pink with turquoise. "
            "Style with traditional gota jewellery or antique brass jhumkas, a radiant warm bronzer, and a playful coral or peach lip."
        )

    # 4. Jewelry & Metal Guidance
    if any(k in msg_lower for k in ["gold", "silver", "metal", "jewelry", "kundan", "polki", "choker", "earring", "chandbali"]):
        if any(k in msg_lower for k in ["warm", "red", "gold", "yellow", "orange", "mustard", "rust"]):
            return (
                "Warm-toned outfits pair gorgeously with 22K yellow gold, heritage Kundan, and antique copper finishes. "
                "A Kundan choker with pearl droppings or heavy filigree chandbalis will accentuate warm tones seamlessly."
            )
        elif any(k in msg_lower for k in ["cool", "blue", "navy", "silver", "grey", "white", "black"]):
            return (
                "Cool and deep jewel tones (navy, sapphire, black, emerald) achieve a striking, high-fashion contrast with rhodium-plated sterling silver, white gold, and platinum diamond tennis pieces."
            )
        else:
            return (
                "If your outfit has mixed metallic embroidery (tilla work with both silver and gold threads), you can effortlessly mix metals! "
                "Try polki pieces set in champagne gold with pearl accents for the most harmonious balance."
            )

    # 5. Makeup & Lip Shade Recommendations
    if any(k in msg_lower for k in ["lip", "makeup", "shade", "blush", "foundation", "eyeshadow", "highlighter"]):
        if skin_tone.lower() == "fair":
            return (
                "With a fair skin tone, soft berry stains, petal roses, and warm peaches enhance your features naturally. "
                "For eye makeup, soft champagne shimmer and subtle winged liner pair beautifully without overwhelming your complexion."
            )
        elif skin_tone.lower() == "dark":
            return (
                "Dusky and deep complexions radiate when paired with rich plums, spiced berries, chocolate nudes, and fiery ruby reds. "
                "Accentuate with molten bronze highlighters and metallic copper eyeshadow for sensational glow."
            )
        else:
            return (
                "For wheatish and medium skin tones (typical in South Asia), warm terracottas, spiced caramel nudes, and brick reds look mesmerizing. "
                "Golden hour palettes with bronze shimmer and warm peach blush bring out your natural golden undertones."
            )

    # 6. Shoes, Bags & Accessories
    if any(k in msg_lower for k in ["shoe", "bag", "heel", "clutch", "purse", "khussa", "accessory"]):
        return (
            f"For an elegant {occ or 'formal'} ensemble, choose pointed metallic pumps, embellished strappy heels, or artisan-crafted Tilla khussas. "
            "Pair with a sleek box clutch or traditional potli bag featuring matching embroidery."
        )

    # 7. Fabrics & Texture Styling
    if any(k in msg_lower for k in ["velvet", "silk", "organza", "chiffon", "fabric"]):
        return (
            "Rich textures like micro-velvet and pure raw silk have a natural sheen that catches the light; pair them with subtle matte makeup and statement heirloom jewelry. "
            "For airy sheer fabrics like organza and net, lighter pearl clusters and delicate layered necklaces preserve an ethereal vibe."
        )

    # 8. Conversational & General Greetings
    if any(k in msg_lower for k in ["hi", "hello", "hey", "salam", "assalam", "good morning", "good evening"]):
        return (
            f"Salam and welcome to GlamIQ! I am your AI Virtual Stylist. How can I help curate your look today? "
            f"Feel free to ask for Pakistani bridal advice, color matching, jewelry pairing, or makeup recommendations."
        )

    # 9. Dynamic Contextual Default
    return (
        f"For your {occ or 'upcoming'} look, balancing your {outfit_color or 'attire'} with the right accessories creates effortless poise. "
        "Would you like recommendations on specific jewelry pieces (Kundan vs. Polki), complementary lip and eye shades, or footwear styling?"
    )


async def handle_chat_query(
    user: Optional[User],
    user_message: str,
    db: AsyncSession,
) -> str:
    """
    Process user query with NVIDIA API / OpenAI, inject live styling context,
    and record the conversation.
    """
    # 1. Gather live styling context
    user_name = user.full_name if user else "Fashion Lover"
    skin_tone = (user.skin_tone if user else None) or "medium"
    recent_outfit_desc = "None uploaded yet"
    recent_occasion_desc = "General"
    color_palette = "Not specified"

    if user:
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

    prefs = (user.preferences if user else {}) or {}
    metal_pref = prefs.get("metal_preference", "gold & silver")
    style_vibe = prefs.get("style_preference", "modern")

    # 2. Build system prompt with live context
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        user_name=user_name,
        skin_tone=skin_tone,
        metal_pref=metal_pref,
        style_vibe=style_vibe,
        recent_outfit=recent_outfit_desc,
        recent_occasion=recent_occasion_desc,
        color_palette=color_palette,
    )

    # 3. Retrieve recent chat history (last 6 messages)
    past_chats = []
    if user:
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
                "Content-Type": "application/json",
            }
            nvidia_payload = {
                "model": settings.NVIDIA_MODEL,
                "messages": messages,
                "max_tokens": 800,
                "temperature": 0.7,
            }
            async with httpx.AsyncClient(timeout=15.0) as http_client:
                response = await http_client.post(
                    settings.NVIDIA_API_URL,
                    headers=nvidia_headers,
                    json=nvidia_payload,
                )
                if response.status_code == 200:
                    data = response.json()
                    bot_reply = data["choices"][0]["message"]["content"].strip()
                else:
                    print(f"[NVIDIA API Error] Status {response.status_code}: {response.text[:200]}")
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

    # 7. Persist interaction in chat_history (if authenticated)
    if user:
        record = ChatHistory(
            user_id=user.user_id,
            user_message=user_message,
            bot_response=bot_reply,
        )
        db.add(record)
        await db.flush()

    return bot_reply
