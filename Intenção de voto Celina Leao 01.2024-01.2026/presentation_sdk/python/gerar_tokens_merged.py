from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "presentation_sdk" / "tokens" / "anthropic_dark_merged.json"


def main() -> int:
    base = ROOT / "outputs" / "youtube_slides"
    styles: list[Path] = []
    for d in sorted(base.glob("*")):
        if not d.is_dir():
            continue
        p_screen = d / "style_screen.json"
        p_plain = d / "style.json"
        if p_screen.exists():
            styles.append(p_screen)
        elif p_plain.exists():
            styles.append(p_plain)
    if not styles:
        raise SystemExit("Nenhum style.json encontrado em outputs/youtube_slides")

    colors = Counter()
    for p in styles:
        data = json.loads(p.read_text(encoding="utf-8"))
        pal = (data.get("cores") or {}).get("palette") or []
        for c in pal:
            colors[c.lower()] += 1

    top = [c for c, _ in colors.most_common(16)]

    merged = {
        "name": "anthropic_dark_merged",
        "source": "Merge automatico de outputs/youtube_slides/*/style.json",
        "colors": {
            "bg": top[0] if top else "#080404",
            "text": top[2] if len(top) > 2 else "#f3f3eb",
            "muted": top[3] if len(top) > 3 else "#d4cac6",
            "accents": top[6:12] if len(top) >= 12 else top[4:],
            "palette": top,
        },
        "typography": {
            "font_family": "Inter",
            "font_family_fallback": ["Helvetica Neue", "Arial", "sans-serif"],
        },
        "charts": {
            "grid_alpha": 0.12,
            "axis_alpha": 0.35,
            "line_width": 2.4,
            "marker_size": 5,
            "title_size": 16,
            "label_size": 12,
        },
    }

    OUT.write_text(json.dumps(merged, indent=2, ensure_ascii=True), encoding="utf-8")
    print(str(OUT))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
