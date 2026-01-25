from __future__ import annotations

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import matplotlib.pyplot as plt
import numpy as np

from presentation_sdk.python.tema_anthropic import aplicar_tema_matplotlib


def main() -> int:
    aplicar_tema_matplotlib()

    x = np.arange(1, 13)
    y1 = np.array([12, 14, 13, 16, 19, 18, 22, 23, 25, 27, 29, 31])
    y2 = np.array([10, 11, 12, 12, 13, 14, 15, 15, 16, 17, 18, 18])

    fig, ax = plt.subplots(figsize=(11, 6))
    ax.plot(x, y1, linewidth=2.6, marker="o")
    ax.plot(x, y2, linewidth=2.6, marker="o")

    ax.set_title("Exemplo: tendencia mensal")
    ax.set_xlabel("Mes")
    ax.set_ylabel("Valor")
    ax.set_xticks(x)
    ax.legend(["Serie A", "Serie B"], loc="upper left")

    out_dir = ROOT / "outputs" / "exemplos_sdk"
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / "exemplo_matplotlib.png"
    fig.tight_layout()
    fig.savefig(out, dpi=200)
    print(str(out))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
