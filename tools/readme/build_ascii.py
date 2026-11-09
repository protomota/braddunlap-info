"""Build the README's ASCII portrait. Requires Pillow; no network calls."""

from html import escape
from itertools import groupby
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageOps

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "docs"
RAMP = " .,:;irsXA253hMHGS#9B&@"


def portrait() -> list[str]:
    photo = Image.open(ROOT / "public/img/brad.jpg").convert("L")
    mask = Image.new("L", photo.size)
    ImageDraw.Draw(mask).polygon(
        [(174, 118), (193, 78), (236, 47), (295, 33), (358, 45),
         (401, 78), (420, 133), (434, 199), (440, 273), (432, 339),
         (468, 364), (540, 401), (640, 447), (640, 640), (0, 640),
         (0, 485), (84, 452), (166, 408), (218, 379), (193, 333),
         (180, 271), (173, 208)], fill=255,
    )
    photo = ImageEnhance.Contrast(ImageOps.autocontrast(photo)).enhance(1.15)
    photo = Image.composite(photo, Image.new("L", photo.size), mask)
    photo = photo.crop((18, 16, 622, 632)).resize((96, 56), Image.Resampling.LANCZOS)
    return ["".join(RAMP[min(len(RAMP) - 1, int((photo.getpixel((x, y)) / 255) ** .85 * (len(RAMP) - 1)))]
                    for x in range(photo.width)).rstrip() for y in range(photo.height)]


def main() -> None:
    OUTPUT.mkdir(exist_ok=True)
    lines = portrait()
    profile = [
        ("brad@protomota", "accent"),
        ("------------------------------", "muted"),
        ("Name       Brad Dunlap", "text"),
        ("Work       AI, product & engineering", "text"),
        ("Experience 20+ years building software", "text"),
        ("Lab        Protomota", "text"),
        ("", "text"),
        ("// BUILD", "accent"),
        ("Languages  Swift, TypeScript, Python", "text"),
        ("Apps       SwiftUI, React, Next.js", "text"),
        ("Graphics   Metal, Three.js, Unity", "text"),
        ("AI         Agents, automation, MCP", "text"),
        ("Robotics   ROS 2, Isaac Sim, Jetson", "text"),
        ("Workshop   CAD, 3D printing", "text"),
        ("", "text"),
        ("// INDEPENDENT WORK", "accent"),
        ("Jotley           Private AI notes", "text"),
        ("PulseCanvas      Music + visuals", "text"),
        ("AI Resource Pro  Learn by building", "text"),
        ("", "text"),
        ("// FIND ME", "accent"),
        ("Web        braddunlap.info", "text"),
        ("Lab        protomota.com", "text"),
        ("GitHub     github.com/protomota", "text"),
    ]
    colors = {"accent": "#ff973f", "muted": "#46505e", "text": "#cbd3df"}
    svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="670" viewBox="0 0 1200 670" role="img" aria-labelledby="title description">',
           '<title id="title">Brad Dunlap — ASCII portrait and developer profile</title>',
           '<desc id="description">An ASCII portrait made from Brad’s photograph. AI, product and engineering. Swift, TypeScript, Python, apps, agents and robotics. Founder of Protomota.</desc>',
           '<rect x="1" y="1" width="1198" height="668" rx="16" fill="#0d1117" stroke="#30363d"/>',
           '<path d="M1 48H1199" stroke="#30363d"/>',
           '<g fill="#46505e"><circle cx="25" cy="25" r="5"/><circle cx="43" cy="25" r="5"/><circle cx="61" cy="25" r="5"/></g>',
           '<text x="85" y="30" fill="#8b949e" font-family="monospace" font-size="13">protomota / braddunlap-info / README.md</text>',
           '<g font-family="Menlo,Consolas,monospace" font-size="9" fill="#cbd3df" xml:space="preserve">']
    for index, line in enumerate(lines):
        if line:
            spans = []
            for character, group in groupby(line):
                shade = round(40 + 215 * (RAMP.index(character) / (len(RAMP) - 1)) ** 1.4)
                content = escape("".join(group)).replace(" ", "&#160;")
                spans.append(f'<tspan fill="rgb({shade},{shade},{shade})">{content}</tspan>')
            text = "".join(spans)
            svg.append(f'<text x="26" y="{82 + index * 9.8:.1f}" textLength="{len(line) * 5.4:.1f}" lengthAdjust="spacingAndGlyphs">{text}</text>')
    svg += ['</g>', '<path d="M576 84V602" stroke="#232b36"/>', '<g font-family="Menlo,Consolas,monospace" font-size="16">']
    for index, (line, tone) in enumerate(profile):
        text = escape(line).replace(" ", "&#160;")
        svg.append(f'<text x="614" y="{100 + index * 21}" fill="{colors[tone]}">{text}</text>')
    svg += ['</g>', '<text x="28" y="645" fill="#6e7681" font-family="monospace" font-size="12">$ building apps, agents and robots_</text>', '</svg>']
    (OUTPUT / "readme-profile.svg").write_text("\n".join(svg) + "\n")
    (OUTPUT / "portrait.txt").write_text("\n".join(lines) + "\n")


if __name__ == "__main__":
    main()
