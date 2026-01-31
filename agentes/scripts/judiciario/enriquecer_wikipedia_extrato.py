#!/usr/bin/env python3
"""Enriquece perfis com extrato completo (texto) da Wikipedia.

Diferente do resumo (REST /page/summary), este usa MediaWiki API (action=query)
para obter o conteudo em texto plano.

Campos gravados:
- dados_publicos.wikipedia_extrato (texto)

Uso:
  .venv-juris/bin/python scripts/judiciario/enriquecer_wikipedia_extrato.py
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
    marker = "/wiki/"
    if marker not in url:
        return None
    title = url.split(marker, 1)[1]
    if not title:
        return None
    if title.startswith("Lista_de_ministros"):
        return None
    return title


def _fetch_extract(title: str) -> str | None:
    api = "https://pt.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "prop": "extracts",
        "explaintext": "1",
        "exsectionformat": "plain",
        "redirects": "1",
        "format": "json",
        "titles": title,
    }
    url = api + "?" + urllib.parse.urlencode(params)
    r = requests.get(url, timeout=60, headers={"User-Agent": "pesquisa-eleitoral-df/1.0"})
    if r.status_code != 200:
        return None
    data = r.json()
    pages = (((data.get("query") or {}).get("pages")) or {})
    if not pages:
        return None
    page = next(iter(pages.values()))
    extract = page.get("extract")
    if not extract:
        return None
    return extract.strip()


def main() -> int:
    json_paths = [
        p
        for org in ["STF", "STJ", "TJDFT", "TRF1"]
        for p in (BASE_DIR / org).glob("*.json")
    ]

    updated = 0
    for path in sorted(json_paths):
        perfil = _load_json(path)
        dp = perfil.get("dados_publicos") or {}
        if dp.get("wikipedia_extrato"):
            continue

        fontes = perfil.get("fontes") or []
        wiki_urls = [f.get("url") for f in fontes if f.get("tipo") == "wikipedia" and f.get("url")]
        if not wiki_urls:
            continue

        title = _wiki_title_from_url(wiki_urls[0])
        if not title:
            continue

        extract = _fetch_extract(title)
        if not extract:
            continue

        dp["wikipedia_extrato"] = extract
        dp["wikipedia_extrato_resumo"] = (extract[:1200] + "...") if len(extract) > 1200 else extract
        perfil["dados_publicos"] = dp
        _write_json(path, perfil)
        updated += 1
        time.sleep(0.2)

    print(f"Wikipedia extrato: atualizados={updated}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
