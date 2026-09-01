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
) -> Dict[str, Any]:
    """
    Generate styling recommendation plan and human-readable explanation.
    """
    color_family = classify_color_family(color_palette)
    harmony = HARMONY_RULES.get(color_family, HARMONY_RULES["warm"])
    
    # Match occasion
    occ_key = "casual"
    if occasion_name:
        for k in OCCASION_RULES.keys():
            if k in occasion_name.lower():
                occ_key = k
                break
    occ_style = OCCASION_RULES.get(occ_key, OCCASION_RULES["casual"])

    # Skin tone info
    skin_info = None
    if skin_tone and skin_tone.lower() in SKIN_TONE_MODIFIERS:
        skin_info = SKIN_TONE_MODIFIERS[skin_tone.lower()]

    # Construct jewelry and makeup suggestions
    jewelry_suggestion = f"{harmony['jewelry_metal']} — {occ_style['jewelry_style']} ({occ_style['vibe']})"
    makeup_suggestion = f"{harmony['makeup_palette']} with {occ_style['makeup_finish']}"

    # Build concise, articulated explanation
    reasons = []
    reasons.append(harmony["rule_reason"])
    reasons.append(f"For a {occasion_name or 'special'} occasion, {occ_style['jewelry_style'].lower()} brings the desired {occ_style['vibe'].lower()} presence.")
    
    if skin_info:
        reasons.append(f"Complementing your {skin_tone} skin tone, we selected {skin_info['lip_tweak']} with {skin_info['highlight']}. {skin_info['advice']}")

    explanation = " ".join(reasons)

    return {
        "color_family": color_family,
        "color_harmony": harmony["color_harmony"],
        "jewelry_metal_keyword": harmony["jewelry_tone_keyword"],
        "jewelry_suggestion": jewelry_suggestion,
        "makeup_suggestion": makeup_suggestion,
        "target_makeup_shades": harmony["makeup_shades"],
        "explanation": explanation,
    }
