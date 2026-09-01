"""Unit tests for the rule-based recommendation engine."""

from app.services.recommendation_engine import (
    classify_color_family,
    generate_style_advice,
)


def test_color_classification():
    assert classify_color_family("Red dress") == "warm"
    assert classify_color_family("Navy Blue silk") == "cool"
    assert classify_color_family("Charcoal Black suit") == "neutral"
    assert classify_color_family("Blush Pink chiffon") == "pastel"
    assert classify_color_family(None) == "neutral"


def test_red_formal_recommendation():
    advice = generate_style_advice(
        color_palette="Red",
        style_type="formal",
        occasion_name="Formal",
        skin_tone="medium",
    )
    assert advice["color_family"] == "warm"
    assert "Gold" in advice["jewelry_suggestion"]
    assert "medium" in advice["explanation"].lower()
    assert "warm-toned" in advice["explanation"].lower()


def test_blue_casual_recommendation():
    advice = generate_style_advice(
        color_palette="Royal Blue",
        style_type="casual",
        occasion_name="Casual",
        skin_tone="fair",
    )
    assert advice["color_family"] == "cool"
    assert "Silver" in advice["jewelry_suggestion"]
    assert "fair" in advice["explanation"].lower()


def test_skin_tone_variations():
    fair_advice = generate_style_advice("Emerald Green", "western", "Party", "fair")
    dark_advice = generate_style_advice("Emerald Green", "western", "Party", "dark")
    
    assert "fair" in fair_advice["explanation"].lower()
    assert "dark" in dark_advice["explanation"].lower()
