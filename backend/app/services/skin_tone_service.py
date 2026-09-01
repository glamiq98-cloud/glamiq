"""
Skin tone estimation service.

Uses Pillow & NumPy to analyze facial/central regions of profile photos,
calculates average brightness and undertone in RGB/HSV space,
and maps to: 'fair', 'medium', or 'dark'.

This is an approximation for styling recommendations.
"""

from pathlib import Path
from PIL import Image
import numpy as np


# Brightness & luminance thresholds (0-255 scale)
# Standard perceptual luminance: 0.299*R + 0.587*G + 0.114*B
_FAIR_LUMINANCE = 165
_MEDIUM_LUMINANCE = 110


def estimate_skin_tone(image_path: str | Path) -> str | None:
    """
    Analyze the uploaded profile image and return skin tone category ('fair', 'medium', 'dark').
    """
    try:
        path = Path(image_path)
        if not path.exists():
            return None

        with Image.open(path) as img:
            # Convert image to RGB
            img_rgb = img.convert("RGB")
            w, h = img_rgb.size
            if w == 0 or h == 0:
                return None

            # Sample central 50% box (standard face portrait crop)
            crop_box = (
                int(w * 0.25),
                int(h * 0.20),
                int(w * 0.75),
                int(h * 0.70),
            )
            cropped = img_rgb.crop(crop_box)
            # Resize to smaller thumbnail for fast average calculation
            thumbnail = cropped.resize((50, 50))
            np_arr = np.array(thumbnail, dtype=np.float32)

            # Perceptual luminance calculation across pixels
            r = np_arr[:, :, 0]
            g = np_arr[:, :, 1]
            b = np_arr[:, :, 2]

            # Filter out near-black (hair/dark background < 30) or near-white (background > 245)
            mask = (r > 30) & (r < 245) & (g > 30) & (g < 245) & (b > 30) & (b < 245)
            
            if np.any(mask):
                lum = 0.299 * r[mask] + 0.587 * g[mask] + 0.114 * b[mask]
                avg_lum = float(np.mean(lum))
            else:
                lum = 0.299 * r + 0.587 * g + 0.114 * b
                avg_lum = float(np.mean(lum))

            if avg_lum >= _FAIR_LUMINANCE:
                return "fair"
            elif avg_lum >= _MEDIUM_LUMINANCE:
                return "medium"
            else:
                return "dark"

    except Exception as e:
        print(f"[SkinToneService] Estimation failed: {e}")
        return "medium"  # Safe default
