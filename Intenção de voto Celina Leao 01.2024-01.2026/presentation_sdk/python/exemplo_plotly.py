from __future__ import annotations

from pathlib import Path
import sys
import os
import shutil

import plotly.graph_objects as go

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from presentation_sdk.python.tema_anthropic import tokens_padrao


def main() -> int:
    # Kaleido (plotly) usa choreographer e pode tentar um Chrome baixado (x86_64).
    # Em ambientes arm64/WSL, force o Chromium do sistema.
    if "BROWSER_PATH" not in os.environ:
        os.environ["BROWSER_PATH"] = shutil.which("chromium") or shutil.which("chromium-browser") or ""

    t = tokens_padrao()
    c = t.colors
    ch = t.charts

    bg = c.get("bg", "#080404")
    fg = c.get("text", "#f3f3eb")
    muted = c.get("muted", "#d4cac6")
    accents = c.get("accents", ["#738395", "#838f85", "#6d6d62"])

    fig = go.Figure()
    fig.add_trace(go.Scatter(x=[1, 2, 3, 4, 5], y=[12, 16, 18, 22, 27], mode="lines+markers", name="Serie A", line={"width": ch.get("line_width", 2.4), "color": accents[0]}))
    fig.add_trace(go.Scatter(x=[1, 2, 3, 4, 5], y=[10, 11, 12, 14, 15], mode="lines+markers", name="Serie B", line={"width": ch.get("line_width", 2.4), "color": accents[1]}))

    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor=bg,
        plot_bgcolor=bg,
        font={"family": t.typography.get("font_family", "Inter"), "color": fg, "size": ch.get("label_size", 12)},
        title={"text": "Exemplo: tendencia (Plotly)", "x": 0.02, "xanchor": "left"},
        margin={"l": 60, "r": 30, "t": 60, "b": 50},
        legend={"x": 0.02, "y": 0.98, "bgcolor": "rgba(0,0,0,0)"},
    )

    fig.update_xaxes(showgrid=True, gridcolor=f"rgba(243,243,235,{ch.get('grid_alpha', 0.12)})", zeroline=False, linecolor=f"rgba(243,243,235,{ch.get('axis_alpha', 0.35)})", tickfont={"color": muted})
    fig.update_yaxes(showgrid=True, gridcolor=f"rgba(243,243,235,{ch.get('grid_alpha', 0.12)})", zeroline=False, linecolor=f"rgba(243,243,235,{ch.get('axis_alpha', 0.35)})", tickfont={"color": muted})

    out_dir = ROOT / "outputs" / "exemplos_sdk"
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / "exemplo_plotly.png"
    fig.write_image(str(out), scale=2)
    print(str(out))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
