#!/usr/bin/env python3
"""Enriquece perfis do TJDFT com biografias institucionais.

No TJDFT, diversas biografias estao publicadas como PDF em:
  /institucional/gestao-do-conhecimento/gestao-da-memoria/biografias/

Este script:
- baixa o sitemap de arquivos do TJDFT
- identifica URLs de biografias
- faz match por slug do nome
- baixa o PDF e extrai texto (pypdf)
- grava em `dados_publicos.biografia_tjdft_*`

Uso:
  .venv-juris/bin/python scripts/judiciario/enriquecer_tjdft_biografias.py
"""

from __future__ import annotations

import gzip
import io
import json
import re
import time
import unicodedata
from pathlib import Path
from typing import Any

import requests
from pypdf import PdfReader


BASE_DIR = Path("perfis agentes sinteticos judiciário - STF, STJ, TJDF, TRF1")


def _load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _write_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=True, indent=2) + "\n", encoding="utf-8")


def _slugify_ascii(s: str) -> str:
    s = s.strip().lower()
    s = unicodedata.normalize("NFKD", s)
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s


def _fetch(url: str) -> bytes:
    r = requests.get(url, timeout=90, verify=False, headers={"User-Agent": "Mozilla/5.0"})
    r.raise_for_status()
    return r.content


def _listar_urls_biografias() -> list[str]:
    # sitemap-files contem PDFs e outros arquivos.
    idx = _fetch("https://www.tjdft.jus.br/sitemap-files.xml.gz")
    xml = gzip.decompress(idx).decode("utf-8", "replace")
    urls = re.findall(r"<loc>([^<]+)</loc>", xml)

    bio_urls = []
    for u in urls:
        if "/biografias/" not in u:
            continue
        # tanto html quanto pdf (mas aqui geralmente e PDF)
        bio_urls.append(u)
    return bio_urls


def _extrair_texto_pdf(pdf_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(pdf_bytes))
    parts: list[str] = []
    for page in reader.pages:
        try:
            t = page.extract_text() or ""
        except Exception:
            t = ""
        if t:
            parts.append(t)
    text = "\n".join(parts)
    # normaliza espacos
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def main() -> int:
    tjdft_dir = BASE_DIR / "TJDFT"
    paths = sorted(tjdft_dir.glob("*.json"))

    bio_urls = _listar_urls_biografias()
    # Indexa por conteudo do path para facilitar match.
    bio_urls_lc = [(u, u.lower()) for u in bio_urls]

    updated = 0
    skipped = 0

    for path in paths:
        perfil = _load_json(path)
        dp = perfil.get("dados_publicos") or {}
        if dp.get("biografia_tjdft_texto"):
            skipped += 1
            continue

        nome = perfil.get("nome") or ""
        nome = re.sub(r"^Desa?\.\s*", "", nome).strip()
        slug = _slugify_ascii(nome)
        if not slug:
            skipped += 1
            continue

        # match simples: slug dentro da URL
        match = None
        for u, ulc in bio_urls_lc:
            if slug in ulc:
                match = u
                break
        # fallback: tenta sem sufixos comuns
        if not match:
            parts = slug.split("-")
            for k in range(min(3, len(parts)), len(parts) + 1):
                needle = "-".join(parts[:k])
                for u, ulc in bio_urls_lc:
                    if needle in ulc:
                        match = u
                        break
                if match:
                    break

        if not match:
            skipped += 1
            continue

        try:
            content = _fetch(match)
        except Exception:
            skipped += 1
            continue

        # Detecta PDF pelo header.
        if content[:4] != b"%PDF":
            # Se nao for PDF, guarda apenas URL como fonte.
            dp["biografia_tjdft_url"] = match
            perfil["dados_publicos"] = dp
            _write_json(path, perfil)
            updated += 1
            continue

        texto = _extrair_texto_pdf(content)
        if not texto:
            skipped += 1
            continue

        dp["biografia_tjdft_url"] = match
        dp["biografia_tjdft_texto"] = texto
        dp["biografia_tjdft_resumo"] = (texto[:900] + "...") if len(texto) > 900 else texto

        perfil["dados_publicos"] = dp
        _write_json(path, perfil)
        updated += 1

        time.sleep(0.1)

    print(f"TJDFT: biografias atualizadas={updated} puladas={skipped} (total perfis={len(paths)})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
