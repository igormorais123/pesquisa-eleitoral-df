# -*- coding: utf-8 -*-
"""Embutir imagens PNG como base64 no HTML.

Lê relatorio/relatorio-final.html e substitui:
  src="../graficos/ARQUIVO.png"
por:
  src="data:image/png;base64,..."

O objetivo é deixar o relatório 100% standalone (um único HTML).
"""

from __future__ import annotations

import base64
import os
import re


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML_PATH = os.path.join(BASE_DIR, "relatorio", "relatorio-final.html")
GRAFICOS_DIR = os.path.join(BASE_DIR, "graficos")


IMG_RE = re.compile(r'src="\.\./graficos/([^"]+\.png)"')


def main() -> None:
    with open(HTML_PATH, "r", encoding="utf-8") as f:
        html = f.read()

    nomes = IMG_RE.findall(html)
    if not nomes:
        raise SystemExit("Nenhuma imagem ../graficos/*.png encontrada no HTML")

    unicos: list[str] = sorted(set(nomes))
    substituicoes: dict[str, str] = {}

    for nome in unicos:
        img_path = os.path.join(GRAFICOS_DIR, nome)
        if not os.path.exists(img_path):
            raise SystemExit(f"Imagem não encontrada: {img_path}")

        with open(img_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("ascii")
        substituicoes[nome] = f"data:image/png;base64,{b64}"

    def repl(match: re.Match[str]) -> str:
        nome = match.group(1)
        return f'src="{substituicoes[nome]}"'

    novo = IMG_RE.sub(repl, html)

    with open(HTML_PATH, "w", encoding="utf-8") as f:
        f.write(novo)

    print(f"✓ Embutidas {len(unicos)} imagens no HTML")


if __name__ == "__main__":
    main()
