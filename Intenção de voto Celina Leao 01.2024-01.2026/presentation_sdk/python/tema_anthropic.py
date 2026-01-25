from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class Tokens:
    colors: dict[str, Any]
    charts: dict[str, Any]
    typography: dict[str, Any]


def carregar_tokens(path: str | Path) -> Tokens:
    p = Path(path)
    data = json.loads(p.read_text(encoding="utf-8"))
    return Tokens(
        colors=data.get("colors", {}),
        charts=data.get("charts", {}),
        typography=data.get("typography", {}),
    )


def tokens_padrao() -> Tokens:
    here = Path(__file__).resolve().parents[1]
    merged = here / "tokens" / "anthropic_dark_merged.json"
    if merged.exists():
        return carregar_tokens(merged)
    return carregar_tokens(here / "tokens" / "anthropic_dark.json")


def aplicar_tema_matplotlib(tokens: Tokens | None = None) -> None:
    """Aplica um tema consistente no Matplotlib.

    - fundo escuro
    - eixos/minimos
    - grade sutil
    - ciclo de cores alinhado a paleta
    """

    import matplotlib as mpl
    from cycler import cycler

    t = tokens or tokens_padrao()
    c = t.colors
    ch = t.charts

    bg = c.get("bg", "#0b0d10")
    fg = c.get("text", "#e9eef7")
    muted = c.get("muted", "#9aa7b7")
    stroke = c.get("stroke", "#2a2f3a")
    accents = c.get("accents", ["#738395", "#838f85", "#6d6d62"]) or ["#738395"]

    grid_alpha = float(ch.get("grid_alpha", 0.12))
    axis_alpha = float(ch.get("axis_alpha", 0.35))

    mpl.rcParams.update(
        {
            "figure.facecolor": bg,
            "axes.facecolor": bg,
            "savefig.facecolor": bg,
            "text.color": fg,
            "axes.labelcolor": fg,
            "xtick.color": muted,
            "ytick.color": muted,
            "axes.edgecolor": stroke,
            "axes.grid": True,
            "grid.color": fg,
            "grid.alpha": grid_alpha,
            "grid.linestyle": "-",
            "grid.linewidth": 0.8,
            "axes.spines.top": False,
            "axes.spines.right": False,
            "axes.titleweight": "semibold",
            "axes.titlepad": 10,
            "axes.titlesize": int(ch.get("title_size", 16)),
            "axes.labelsize": int(ch.get("label_size", 12)),
            "legend.frameon": False,
            "legend.labelcolor": fg,
            "legend.fontsize": 11,
            "axes.prop_cycle": cycler(color=accents),
        }
    )

    # Eixos mais discretos
    mpl.rcParams["axes.linewidth"] = 0.9
    mpl.rcParams["xtick.major.width"] = 0.8
    mpl.rcParams["ytick.major.width"] = 0.8
    mpl.rcParams["xtick.major.size"] = 3.5
    mpl.rcParams["ytick.major.size"] = 3.5
    mpl.rcParams["axes.axisbelow"] = True

    # Ajusta alfa do contorno dos eixos
    try:
        import matplotlib.colors as mcolors

        rgba = mcolors.to_rgba(stroke)
        mpl.rcParams["axes.edgecolor"] = (rgba[0], rgba[1], rgba[2], axis_alpha)
    except Exception:
        pass


def aplicar_tema_seaborn(tokens: Tokens | None = None) -> None:
    import seaborn as sns

    t = tokens or tokens_padrao()
    c = t.colors
    bg = c.get("bg", "#0b0d10")
    sns.set_theme(
        style="darkgrid",
        rc={
            "axes.facecolor": bg,
            "figure.facecolor": bg,
        },
    )
