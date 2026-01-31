#!/usr/bin/env python3
"""Enriquece perfis com resumo da Wikipedia (pt).

Uso:
  .venv-juris/bin/python scripts/judiciario/enriquecer_wikipedia_resumo.py

O script busca o endpoint oficial do MediaWiki REST:
  https://pt.wikipedia.org/api/rest_v1/page/summary/<titulo>

E grava em `dados_publicos.wikipedia_resumo`.
"""

from __future__ import annotations

import json
import time
import urllib.parse
from pathlib import Path
from typing import Any

import requests


BASE_DIR = Path("perfis agentes sinteticos judiciário - STF, STJ, TJDF, TRF1")


def _load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _write_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=True, indent=2) + "\n", encoding="utf-8")


def _wiki_title_from_url(url: str) -> str | None:
    # Aceita URLs no formato https://pt.wikipedia.org/wiki/<Titulo>
    marker = "/wiki/"
    if marker not in url:
        return None
    title = url.split(marker, 1)[1]
    if not title:
        return None
    # Evita enriquecer a propria lista, quando nao ha pagina individual.
    if title.startswith("Lista_de_ministros"):
        return None
    return title


def _fetch_summary(title: str) -> dict[str, Any] | None:
    # O endpoint espera titulo URL-encoded.
    enc = urllib.parse.quote(title, safe="")
    url = f"https://pt.wikipedia.org/api/rest_v1/page/summary/{enc}"
    r = requests.get(
        url,
        headers={"User-Agent": "pesquisa-eleitoral-df/1.0 (perfil-sintetico; contato: repo)"},
        timeout=60,
    )
    if r.status_code != 200:
        return None
    data = r.json()
    return {
        "titulo": data.get("title"),
        "descricao": data.get("description"),
        "extrato": data.get("extract"),
        "url": (data.get("content_urls") or {}).get("desktop") or {},
    }


def main() -> int:
    if not BASE_DIR.exists():
        raise SystemExit(f"Diretorio nao encontrado: {BASE_DIR}")

    json_paths = [
        p
        for org in ["STF", "STJ", "TJDFT", "TRF1"]
        for p in (BASE_DIR / org).glob("*.json")
    ]

    updated = 0
    for path in sorted(json_paths):
        perfil = _load_json(path)
        fontes = perfil.get("fontes") or []
        wiki_urls = [f.get("url") for f in fontes if f.get("tipo") == "wikipedia" and f.get("url")]
        if not wiki_urls:
            continue

        title = _wiki_title_from_url(wiki_urls[0])
        if not title:
            continue

        summary = _fetch_summary(title)
        if not summary:
            continue

        dados_publicos = perfil.get("dados_publicos") or {}
        dados_publicos["wikipedia_resumo"] = summary
        perfil["dados_publicos"] = dados_publicos
        _write_json(path, perfil)
        updated += 1

        # Gentileza com o endpoint.
        time.sleep(0.2)

    print(f"Perfis enriquecidos com resumo Wikipedia: {updated}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
