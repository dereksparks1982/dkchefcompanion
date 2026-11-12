#!/usr/bin/env python3
"""Ensure all desktop icon pixels derive from the approved English DK artwork."""
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets" / "dk-seedbank-green-96.webp"
OTHER = ROOT / "assets" / "dk-seedbank-red-96.webp"
ICONS = ROOT / "desktop" / "build" / "icons"

assert SOURCE.is_file(), "Missing approved English logo"
assert OTHER.is_file(), "Missing approved Russian logo"
with Image.open(SOURCE) as img:
    base = img.convert("RGBA")
    assert min(base.size) >= 32, f"Unexpected approved icon dimensions: {base.size}"
    for size in (64, 128, 256, 512):
        icon_path = ICONS / f"{size}x{size}.png"
        with Image.open(icon_path) as png:
            converted = png.convert("RGBA")
            expected = base.resize((size, size), Image.Resampling.LANCZOS)
            assert converted.size == expected.size
            assert ImageChops.difference(converted, expected).getbbox() is None, (
                f"{icon_path.name} differs from approved DK green artwork"
            )
print("All four Linux icon sizes exactly match the approved green DK artwork.")
