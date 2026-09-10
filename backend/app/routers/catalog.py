"""
Public Catalog router — Serve approved fashion items and AI Styles analysis.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import httpx

from app.dependencies import get_db
from app.models.fashion_item import FashionItem
from app.schemas.recommendation import FashionItemResponse
from app.config import settings

router = APIRouter(prefix="/api/catalog", tags=["Catalog"])


@router.get("/items", response_model=List[FashionItemResponse], summary="List approved fashion items")
async def list_public_catalog_items(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """List approved fashion items with optional filtering by category."""
    query = select(FashionItem).where(FashionItem.status == "approved").order_by(desc(FashionItem.item_id))
    
    if category:
        query = query.where(FashionItem.category == category)

    result = await db.execute(query)
    return list(result.scalars().all())


# ── AI Styles Analysis ────────────────────────────────────────────────

AI_STYLES_PROMPT = """You are GlamIQ's expert fashion stylist AI. Analyze the following dress from our catalog and provide personalized styling recommendations.

Dress Details:
- Name: {item_name}
- Color: {color}
- Category: {category}
- Style Type: {style_type}
- Occasion: {occasion}
- Description: {description}

Provide your response STRICTLY in the following JSON format (no markdown, no code fences, just raw JSON):
{{
  "jewelry_suggestion": "2-3 sentences recommending specific jewelry pieces (type, metal, stones) that pair well with this dress",
  "makeup_suggestion": "2-3 sentences recommending lip color, eye makeup, and blush/highlighter that complement this dress and its color",
  "occasion_tips": "2-3 sentences about how to style this dress for the occasion, including shoes, bag, and hair",
  "color_harmony": "A short 3-5 word color harmony label (e.g. 'Warm Gold & Crimson Harmony')",
  "explanation": "A 3-4 sentence complete stylist analysis tying together the dress color, jewelry, makeup, and occasion into a cohesive look"
}}
"""


def _generate_ai_styles_fallback(item: FashionItem) -> dict:
    """Rule-based fallback when AI APIs are unreachable."""
    color = (item.color or "").lower()
    occasion = (item.occasion or "formal").lower()
    style = (item.style_type or "formal").lower()

    # Jewelry suggestion based on dress color
    if any(w in color for w in ["red", "crimson", "maroon", "ruby"]):
        jewelry = "Pair with 22K antique gold Kundan choker set and heavy filigree chandbali earrings. The warm gold tones create a regal complement to the rich red fabric. Add a gold matha patti for bridal occasions."
        makeup = "Opt for a classic bold crimson or ruby red velvet matte lip. Use warm champagne shimmer on lids with a dramatic winged liner. Finish with a warm peach blush and molten gold highlighter."
        harmony = "Warm Gold & Crimson Harmony"
    elif any(w in color for w in ["green", "emerald", "olive", "sage"]):
        jewelry = "Style with rose gold or antique gold polki jewelry — layered necklaces with green peridot accents pair beautifully. Kundan jhumkas with emerald drops elevate the look."
        makeup = "A warm terracotta or spiced nude lip complements emerald tones perfectly. Use bronze and copper eyeshadow with subtle gold shimmer. Bronze highlighter and warm peach blush create harmony."
        harmony = "Emerald & Antique Gold Pairing"
    elif any(w in color for w in ["blue", "navy", "sapphire", "royal"]):
        jewelry = "Sterling silver or platinum-finished jewelry with sapphire or zircon accents creates stunning contrast. A silver tennis necklace or diamond-cut layered chains work beautifully."
        makeup = "Choose a deep berry or plum lip for dramatic impact against navy. Smoky silver and charcoal eyeshadow with a silver inner corner highlight. Cool-toned pink blush and icy highlighter complete the look."
        harmony = "Cool Silver & Sapphire Contrast"
    elif any(w in color for w in ["pink", "blush", "rose", "pastel"]):
        jewelry = "Delicate rose gold pieces with pearl accents pair ethereally with blush tones. A dainty layered necklace with small diamond-cut pendants adds subtle sparkle."
        makeup = "A soft rose or mauve lip creates seamless harmony. Use champagne and soft pink shimmer on lids. Dewy luminous skin with a pink-toned highlighter and soft peachy blush."
        harmony = "Rose Gold & Blush Elegance"
    elif any(w in color for w in ["black", "midnight", "onyx", "dark"]):
        jewelry = "Both gold and silver metals work with black — for maximum impact, try a statement gold Kundan set or dramatic platinum chandelier earrings. Mix metals if the outfit has mixed embroidery."
        makeup = "A bold red or deep wine lip creates classic glamour against black. Smoky eye with black and bronze gradients, or a clean cat-eye with metallic liner. Bronzed sculpted cheeks with champagne highlight."
        harmony = "Noir & Mixed Metal Glamour"
    elif any(w in color for w in ["yellow", "mustard", "gold", "amber"]):
        jewelry = "Antique gold Kundan sets with ruby or emerald drops complement warm yellow tones magnificently. Heavy traditional chokers and heritage jhumkas complete the regal look."
        makeup = "A warm terracotta or burnt orange lip pairs gorgeously with mustard. Use warm gold and copper eyeshadow with a soft brown crease. Warm peach blush and golden highlighter for luminous skin."
        harmony = "Warm Gold & Amber Radiance"
    else:
        jewelry = "Choose jewelry that echoes the metallic tones in the dress embroidery — gold for warm fabrics, silver for cool tones. Layered pieces add dimension without overwhelming the outfit."
        makeup = "Select lip and eye shades from the same color family as the dress for tonal harmony. Warm nudes and berries are versatile safe choices. Match your highlighter warmth to your jewelry metal."
        harmony = "Balanced Tonal Harmony"

    # Occasion tips
    if "wedding" in occasion or "bridal" in occasion:
        tips = f"For a wedding event, complete the look with embellished pointed pumps or artisan khussa juttis. Carry a structured box clutch or traditional potli with matching embroidery. An elegant updo with face-framing tendrils showcases your jewelry."
    elif "party" in occasion or "festive" in occasion or "festival" in occasion:
        tips = f"For festive celebrations, pair with strappy metallic heels and a statement clutch. Hair can be a sleek blowout or soft waves. Add a signature fragrance and you're celebration-ready."
    elif "casual" in occasion or "date" in occasion:
        tips = f"Keep it effortlessly chic with minimal jewelry and a sleek crossbody or mini bag. Pointed flats or kitten heels maintain comfort with style. Loose natural waves or a low ponytail keep the look relaxed yet polished."
    else:
        tips = f"For a {occasion or 'formal'} event, choose pointed metallic pumps or embellished strappy heels. A sleek clutch or structured handbag in a complementary tone ties the look together. Consider a classic updo or soft Hollywood waves."

    explanation = (
        f"This {item.item_name} in {item.color or 'its signature shade'} creates a striking canvas for coordinated styling. "
        f"The {style} silhouette calls for {"statement heritage pieces" if style == "formal" else "delicately layered minimalist accessories"} that enhance without competing. "
        f"By aligning the jewelry metal temperature and makeup undertones with the dress color, "
        f"every element of this look works in tonal harmony for a polished, magazine-worthy finish."
    )

    return {
        "jewelry_suggestion": jewelry,
        "makeup_suggestion": makeup,
        "occasion_tips": tips,
        "color_harmony": harmony,
        "explanation": explanation,
        "item_name": item.item_name,
        "item_id": item.item_id,
    }


@router.get("/ai-styles/{item_id}", summary="Get AI styling recommendations for a catalog dress")
async def get_ai_styles(
    item_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Analyze a catalog fashion item and generate text-based styling recommendations
    using NVIDIA NIM / OpenAI, with intelligent fallback.
    """
    result = await db.execute(select(FashionItem).where(FashionItem.item_id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fashion item not found")

    # Build AI prompt
    prompt = AI_STYLES_PROMPT.format(
        item_name=item.item_name,
        color=item.color or "Not specified",
        category=item.category,
        style_type=item.style_type or "formal",
        occasion=item.occasion or "General",
        description=item.description or "No description available",
    )

    messages = [
        {"role": "system", "content": "You are a JSON-only fashion styling API. Return ONLY valid JSON, no markdown."},
        {"role": "user", "content": prompt},
    ]

    ai_response = None

    # 1. Try NVIDIA NIM API
    if settings.NVIDIA_API_KEY and settings.NVIDIA_API_KEY.startswith("nvapi-"):
        try:
            async with httpx.AsyncClient(timeout=20.0) as http_client:
                response = await http_client.post(
                    settings.NVIDIA_API_URL,
                    headers={
                        "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.NVIDIA_MODEL,
                        "messages": messages,
                        "max_tokens": 800,
                        "temperature": 0.7,
                    },
                )
                if response.status_code == 200:
                    data = response.json()
                    raw = data["choices"][0]["message"]["content"].strip()
                    import json
                    import re
                    # Robust JSON extraction
                    json_match = re.search(r'\{.*\}', raw, re.DOTALL)
                    if json_match:
                        raw = json_match.group(0)
                    ai_response = json.loads(raw)
                else:
                    print(f"[AI Styles NVIDIA Error] Status {response.status_code}")
        except Exception as e:
            print(f"[AI Styles NVIDIA Exception] {e}")

    # 2. Try OpenAI
    if not ai_response and settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("sk-your-key"):
        try:
            async with httpx.AsyncClient(timeout=20.0) as http_client:
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
                        "max_tokens": 800,
                    },
                )
                if response.status_code == 200:
                    data = response.json()
                    raw = data["choices"][0]["message"]["content"].strip()
                    import json
                    import re
                    json_match = re.search(r'\{.*\}', raw, re.DOTALL)
                    if json_match:
                        raw = json_match.group(0)
                    ai_response = json.loads(raw)
        except Exception as e:
            print(f"[AI Styles OpenAI Exception] {e}")

    # 3. Fallback to rule-based engine
    if not ai_response:
        ai_response = _generate_ai_styles_fallback(item)

    # Ensure all required fields
    ai_response.setdefault("item_name", item.item_name)
    ai_response.setdefault("item_id", item.item_id)
    ai_response.setdefault("jewelry_suggestion", "Elegant jewelry that complements this outfit.")
    ai_response.setdefault("makeup_suggestion", "A harmonious makeup palette to enhance your look.")
    ai_response.setdefault("occasion_tips", "Style with confidence for your next event.")
    ai_response.setdefault("color_harmony", "Balanced Harmony")
    ai_response.setdefault("explanation", "A beautifully coordinated look from dress to accessories.")

    return ai_response
