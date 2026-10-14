"""Create dependency-free PWA raster icons from the site's brand mark."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parents[1] / "assets"
OUT.mkdir(parents=True, exist_ok=True)
for size in (192, 512):
    image = Image.new("RGB", (size, size), "#234b8e")
    draw = ImageDraw.Draw(image)
    font = ImageFont.load_default(size=round(size * 0.44))
    draw.text((size / 2, size * 0.49), "IG", font=font, fill="white", anchor="mm", stroke_width=0)
    draw.line((size * 0.19, size * 0.72, size * 0.81, size * 0.72), fill="#75a7ff", width=round(size * 0.024), joint="curve")
    r = size * 0.031
    x, y = size * 0.77, size * 0.79
    draw.ellipse((x-r, y-r, x+r, y+r), fill="#75a7ff")
    image.save(OUT / f"icon-{size}.png", optimize=True)
