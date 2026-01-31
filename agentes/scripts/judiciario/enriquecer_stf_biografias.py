#!/usr/bin/env python3
"""Enriquece perfis do STF com biografias oficiais do portal do tribunal.

O STF disponibiliza curriculos dos ministros em:
  https://portal.stf.jus.br/textos/verTexto.asp?servico=bibliotecaConsultaProdutoBiografiaMinis

Uso:
  python scripts/judiciario/enriquecer_stf_biografias.py
"""

from __future__ import annotations

import json
import re
import time
import unicodedata
from pathlib import Path
from typing import Any

import requests
from bs4 import BeautifulSoup


BASE_DIR = Path("perfis agentes sinteticos judiciário - STF, STJ, TJDF, TRF1")

# Mapeamento direto: slug do arquivo -> URL da biografia no portal STF
STF_BIOS = {
    "stf-alexandre-de-moraes": "https://portal.stf.jus.br/textos/verTexto.asp?servico=bibliotecaConsultaProdutoBiografiaMinis&pagina=AlexandreMoraes",
    "stf-andre-mendonca": "https://portal.stf.jus.br/textos/verTexto.asp?servico=bibliotecaConsultaProdutoBiografiaMinis&pagina=AndreMendonca",
    "stf-carmen-lucia": "https://portal.stf.jus.br/textos/verTexto.asp?servico=bibliotecaConsultaProdutoBiografiaMinis&pagina=CarmenLucia",
    "stf-cristiano-zanin": "https://portal.stf.jus.br/textos/verTexto.asp?servico=bibliotecaConsultaProdutoBiografiaMinis&pagina=CristianoZanin",
    "stf-dias-toffoli": "https://portal.stf.jus.br/textos/verTexto.asp?servico=bibliotecaConsultaProdutoBiografiaMinis&pagina=DiasToffoli",
    "stf-edson-fachin": "https://portal.stf.jus.br/textos/verTexto.asp?servico=bibliotecaConsultaProdutoBiografiaMinis&pagina=EdsonFachin",
    "stf-flavio-dino": "https://portal.stf.jus.br/textos/verTexto.asp?servico=bibliotecaConsultaProdutoBiografiaMinis&pagina=FlavioDino",
    "stf-gilmar-mendes": "https://portal.stf.jus.br/textos/verTexto.asp?servico=bibliotecaConsultaProdutoBiografiaMinis&pagina=GilmarMendes",
    "stf-luis-roberto-barroso": "https://portal.stf.jus.br/textos/verTexto.asp?servico=bibliotecaConsultaProdutoBiografiaMinis&pagina=LuisRobertoBarroso",
    "stf-luiz-fux": "https://portal.stf.jus.br/textos/verTexto.asp?servico=bibliotecaConsultaProdutoBiografiaMinis&pagina=LuizFux",
    "stf-nunes-marques": "https://portal.stf.jus.br/textos/verTexto.asp?servico=bibliotecaConsultaProdutoBiografiaMinis&pagina=NunesMarques",
}


def _load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _write_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _fetch_html(url: str) -> str:
    r = requests.get(url, timeout=90, verify=False, headers={"User-Agent": "Mozilla/5.0"})
    r.raise_for_status()
    return r.text


def _extrair_biografia_stf(html: str) -> dict[str, Any]:
    """Extrai biografia estruturada da pagina do STF."""
    soup = BeautifulSoup(html, "html.parser")

    # O conteudo principal esta em div#divTexto ou div.jud-text ou article
    main = (
        soup.find("div", {"id": "divTexto"})
        or soup.find("div", {"class": "jud-text"})
        or soup.find("article")
        or soup.find("div", {"id": "corpo"})
        or soup
    )

    texto_completo = main.get_text(separator="\n", strip=True)
    texto_completo = re.sub(r"\n{3,}", "\n\n", texto_completo)

    # Tenta extrair secoes
    formacao = []
    carreira = []
    obras = []

    secao_atual = "biografia"
    for line in texto_completo.split("\n"):
        line_lower = line.strip().lower()
        if any(kw in line_lower for kw in ["formação acadêmica", "formacao academica", "títulos acadêmicos"]):
            secao_atual = "formacao"
            continue
        elif any(kw in line_lower for kw in ["carreira", "atividades profissionais", "atividade profissional"]):
            secao_atual = "carreira"
            continue
        elif any(kw in line_lower for kw in ["obras publicadas", "publicações", "livros"]):
            secao_atual = "obras"
            continue
        elif any(kw in line_lower for kw in ["condecorações", "homenagens", "honrarias"]):
            secao_atual = "outros"
            continue

        stripped = line.strip()
        if not stripped or len(stripped) < 3:
            continue

        if secao_atual == "formacao":
            formacao.append(stripped)
        elif secao_atual == "carreira":
            carreira.append(stripped)
        elif secao_atual == "obras":
            obras.append(stripped)

    return {
        "texto_completo": texto_completo,
        "formacao_academica": formacao,
        "carreira": carreira,
        "obras_publicadas": obras,
    }


def main() -> int:
    stf_dir = BASE_DIR / "STF"
    paths = sorted(stf_dir.glob("*.json"))
    print(f"STF: {len(paths)} perfis encontrados")

    updated = 0
    skipped = 0
    not_found = 0

    for path in paths:
        perfil = _load_json(path)
        dp = perfil.get("dados_publicos") or {}

        if dp.get("biografia_stf_texto"):
            skipped += 1
            continue

        slug = path.stem  # ex: stf-alexandre-de-moraes
        url = STF_BIOS.get(slug)

        if not url:
            print(f"  SEM URL MAPEADA: {slug}")
            not_found += 1
            continue

        nome = perfil.get("nome", slug)
        print(f"  Buscando: {nome} -> {url}")

        try:
            html = _fetch_html(url)
        except Exception as e:
            print(f"    ERRO: {e}")
            not_found += 1
            continue

        bio = _extrair_biografia_stf(html)
        texto = bio["texto_completo"]

        if not texto or len(texto) < 50:
            print(f"    SEM CONTEUDO ({len(texto)} chars)")
            not_found += 1
            continue

        dp["biografia_stf_url"] = url
        dp["biografia_stf_texto"] = texto
        dp["biografia_stf_resumo"] = (texto[:900] + "...") if len(texto) > 900 else texto

        # Atualizar campos top-level
        if not perfil.get("biografia") or len(str(perfil.get("biografia", ""))) < 30:
            perfil["biografia"] = dp["biografia_stf_resumo"]
        if bio["formacao_academica"]:
            perfil["formacao_academica"] = bio["formacao_academica"]
        if bio["carreira"]:
            perfil["carreira"] = bio["carreira"]
        if bio["obras_publicadas"]:
            perfil["obras_publicadas"] = bio["obras_publicadas"]

        perfil["dados_publicos"] = dp
        _write_json(path, perfil)
        updated += 1
        print(f"    OK: {nome} ({len(texto)} chars)")

        time.sleep(0.5)

    print(f"\nSTF: biografias atualizadas={updated} puladas={skipped} nao_encontradas={not_found} (total perfis={len(paths)})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
