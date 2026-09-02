"""
Rule-Based Recommendation Engine for Glam IQ.

Deterministic, pure Python functions implementing color harmony theory,
metal tone pairing, and skin tone compatibility.
"""

from typing import Dict, Any, List, Optional


# ── Color Palette Classifiers ──────────────────────────────────────────

COLOR_FAMILIES = {
    "warm": {
        "red", "crimson", "scarlet", "burgundy", "maroon", "wine",
        "orange", "coral", "peach", "terracotta", "rust",
        "yellow", "mustard", "gold", "amber", "copper", "brown", "tan",
    },
    "cool": {
        "blue", "navy", "royal blue", "sky blue", "cobalt", "cyan", "indigo",
        "teal", "turquoise", "aqua",
        "purple", "violet", "lavender", "lilac", "plum", "magenta",
        "green", "emerald", "forest green", "olive", "sage", "mint",
    },
    "neutral": {
        "black", "white", "ivory", "cream", "beige", "champagne",
        "gray", "grey", "charcoal", "silver", "nude", "taupe",
    },
    "pastel": {
        "pastel pink", "blush", "baby pink", "baby blue", "powder blue",
        "mint green", "soft lilac", "peach pastel", "butter yellow",
    },
}


def classify_color_family(color_input: Optional[str]) -> str:
    """
    Classify a freeform color string (e.g. 'Royal Blue, Gold') into a primary family:
    'warm', 'cool', 'neutral', or 'pastel'. Defaults to 'warm' if unknown.
    """
    if not color_input:
        return "neutral"

    color_lower = color_input.lower()
    
    # Check exact keywords in color string
    for family, colors in COLOR_FAMILIES.items():
        for c in colors:
            if c in color_lower:
                return family

    return "warm"  # Default fallback


# ── Metal & Makeup Harmony Rules ──────────────────────────────────────

HARMONY_RULES = {
    "warm": {
        "jewelry_metal": "Gold & Warm Copper",
        "jewelry_tone_keyword": "gold",
        "makeup_palette": "Warm Terracotta, Coral & Peach Glow",
        "makeup_shades": ["coral", "terracotta", "warm nude", "berry", "copper"],
        "color_harmony": "Warm Harmonious & Radiant",
        "rule_reason": "Warm-toned outfits pair exceptionally with luminous gold and warm copper jewelry to bring out radiant undertones.",
    },
    "cool": {
        "jewelry_metal": "Silver, White Gold & Platinum",
        "jewelry_tone_keyword": "silver",
        "makeup_palette": "Cool Berry, Rose & Mauve Tones",
        "makeup_shades": ["berry", "mauve", "cool pink", "plum", "wine"],
        "color_harmony": "Cool Contrast & Crisp Elegance",
        "rule_reason": "Cool-toned colors are elevated by silver and platinum jewelry, creating crisp, refined contrast with cool berry makeup accents.",
    },
    "neutral": {
        "jewelry_metal": "Statement Gold or Polished Silver",
        "jewelry_tone_keyword": "gold",
        "makeup_palette": "Classic Bold Red or Soft Nude Glam",
        "makeup_shades": ["red", "nude", "crimson", "bold red", "glossy nude"],
        "color_harmony": "Monochromatic Sophistication",
        "rule_reason": "Neutral palettes provide a versatile canvas, welcoming high-contrast statement jewelry and iconic bold lip shades.",
    },
    "pastel": {
        "jewelry_metal": "Rose Gold & Pearl Accents",
        "jewelry_tone_keyword": "rose gold",
        "makeup_palette": "Dewy Blush Pink & Soft Champagne Glow",
        "makeup_shades": ["blush pink", "champagne", "soft peach", "rose"],
        "color_harmony": "Soft Romantic & Luminous",
        "rule_reason": "Delicate pastel hues balance beautifully with gentle rose gold and iridescent pearls for an ethereal, romantic aesthetic.",
    },
}

OCCASION_RULES = {
    "wedding": {
        "jewelry_style": "Opulent statement necklaces, chandelier earrings, and heritage cuffs",
        "makeup_finish": "Full-glam bridal/festive finish with defined eyes and long-wear velvety lip color",
        "vibe": "Grand & Regal",
    },
    "party": {
        "jewelry_style": "Contemporary drop earrings, stacked rings, and shimmering choker pieces",
        "makeup_finish": "Luminous highlighter, soft smoky eyes, and glossy high-impact lips",
        "vibe": "Chic & Dazzling",
    },
    "casual": {
        "jewelry_style": "Minimalist geometric studs, delicate pendant chains, and subtle huggies",
        "makeup_finish": "Fresh 'no-makeup' makeup glow with tinted balm and sun-kissed cheeks",
        "vibe": "Effortless & Clean",
    },
    "formal": {
        "jewelry_style": "Refined solitaire studs, tennis bracelets, and structured elegant pieces",
        "makeup_finish": "Matte balanced look with neutral eyeshadow and sophisticated satin lipstick",
        "vibe": "Authoritative & Polished",
    },
    "office": {
        "jewelry_style": "Understated small hoops, sleek chain, and minimal classic ring",
        "makeup_finish": "Clean professional matte finish with soft nude-rose tones",
        "vibe": "Professional & Smart",
    },
    "date night": {
        "jewelry_style": "Alluring dangle earrings, dainty layered necklaces, and delicate sparkle",
        "makeup_finish": "Flirty flutter lashes, romantic blush, and velvety satin berry lip",
        "vibe": "Intimate & Romantic",
    },
    "festival": {
        "jewelry_style": "Bohemian oxidized silver/gold pieces, layered jhumkas, and ethnic accents",
        "makeup_finish": "Vibrant festive eye accents, winged liner, and rich festive lipstick",
        "vibe": "Vibrant & Celebratory",
    },
}

SKIN_TONE_MODIFIERS = {
    "fair": {
        "lip_tweak": "soft rosy pinks, cool berries, and delicate peaches",
        "highlight": "pearl and champagne shimmer",
        "advice": "Fair complexion glows with soft contrast, avoiding overly heavy dark tones.",
    },
    "medium": {
        "lip_tweak": "warm terracottas, rich caramel nudes, and fiery corals",
        "highlight": "warm golden bronze and rose shimmer",
        "advice": "Medium and olive undertones flourish with golden accents and rich warm pigments.",
    },
    "dark": {
        "lip_tweak": "deep plums, dramatic burgundy, bold chocolate, and vivid ruby reds",
        "highlight": "rich molten copper and deep bronze luminescence",
        "advice": "Rich deep complexions radiate with high-pigment bold hues and luminous metallic contrasts.",
    },
}


# ── Engine Core Function ───────────────────────────────────────────────

def generate_style_advice(
    color_palette: Optional[str],
    style_type: Optional[str],
    occasion_name: Optional[str],
    skin_tone: Optional[str],
    preferences: Optional[Dict[str, Any]] = None,
    user_name: Optional[str] = None,
    gender: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Generate styling recommendation plan and human-readable explanation,
    personalized with the user's explicit styling DNA and preferences.
    """
    prefs = preferences or {}
    metal_pref = prefs.get("metal_preference", "").lower()
    style_vibe = prefs.get("style_preference", "").lower()
    favorite_colors = prefs.get("favorite_colors", "")

    color_family = classify_color_family(color_palette)
    harmony = HARMONY_RULES.get(color_family, HARMONY_RULES["warm"]).copy()
    
    # 1. Adapt metal keyword based on user preference if explicitly specified
    metal_keyword = harmony["jewelry_tone_keyword"]
    jewelry_metal = harmony["jewelry_metal"]
    if metal_pref == "silver":
        metal_keyword = "silver"
        jewelry_metal = "Sterling Silver, Platinum & White Gold"
    elif metal_pref == "gold":
        metal_keyword = "gold"
        jewelry_metal = "22K Kundan Gold, Antique Polki & Warm Copper"
    elif metal_pref == "both":
        jewelry_metal = "Dual-Tone Kundan & Champagne Gold with Silver Accents"

    # 2. Match occasion
    occ_key = "casual"
    if occasion_name:
        for k in OCCASION_RULES.keys():
            if k in occasion_name.lower():
                occ_key = k
                break
    occ_style = OCCASION_RULES.get(occ_key, OCCASION_RULES["casual"]).copy()

    # 3. Adapt occasion style if user has a specific style vibe preference
    if style_vibe == "minimalist":
        occ_style["jewelry_style"] = "Delicate geometric studs, sleek chains, and whisper-thin bangles"
        occ_style["vibe"] = "Minimalist & Effortless"
    elif style_vibe == "statement":
        occ_style["jewelry_style"] = "Opulent oversized chandelier earrings, multi-strand kundan choker, and ornate cuffs"
        occ_style["vibe"] = "Dramatic & High-Impact Glamour"
    elif style_vibe == "classic":
        occ_style["jewelry_style"] = "Heirloom polki necklace, heritage jhumkas, and timeless pearl malas"
        occ_style["vibe"] = "Classic Regal Tradition"
    elif style_vibe == "modern":
        occ_style["jewelry_style"] = "Contemporary ear cuffs, sculptural collars, and stacked modern rings"
        occ_style["vibe"] = "Modern High-Fashion Edge"

    # 4. Skin tone info
    skin_info = None
    if skin_tone and skin_tone.lower() in SKIN_TONE_MODIFIERS:
        skin_info = SKIN_TONE_MODIFIERS[skin_tone.lower()]

    # Construct jewelry and makeup suggestions
    jewelry_suggestion = f"{jewelry_metal} — {occ_style['jewelry_style']} ({occ_style['vibe']})"
    makeup_suggestion = f"{harmony['makeup_palette']} with {occ_style['makeup_finish']}"

    # 5. Build bespoke articulated explanation
    reasons = []
    salutation = f"For {user_name.split()[0]}, " if user_name else "For this ensemble, "
    
    if metal_pref in ("silver", "gold", "both"):
        reasons.append(f"{salutation}honoring your preference for {metal_pref} tones, {harmony['rule_reason'].lower()}")
    else:
        reasons.append(f"{salutation}{harmony['rule_reason']}")

    reasons.append(
        f"For a {occasion_name or 'festive'} occasion, choosing {occ_style['jewelry_style'].lower()} creates a balanced, {occ_style['vibe'].lower()} aesthetic."
    )
    
    if skin_info:
        reasons.append(
            f"Tailored to your {skin_tone} complexion, we highlighted {skin_info['lip_tweak']} and {skin_info['highlight']}."
        )

    if favorite_colors:
        reasons.append(f"Subtle accents harmonizing with your favored shades ({favorite_colors}) elevate the entire look.")

    explanation = " ".join(reasons)

    return {
        "color_family": color_family,
        "color_harmony": harmony["color_harmony"],
        "jewelry_metal_keyword": metal_keyword,
        "jewelry_suggestion": jewelry_suggestion,
        "makeup_suggestion": makeup_suggestion,
        "target_makeup_shades": harmony["makeup_shades"],
        "explanation": explanation,
    }
