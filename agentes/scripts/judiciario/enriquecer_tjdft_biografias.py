#!/usr/bin/env python3
"""Enriquece perfis do TJDFT com biografias institucionais.

No TJDFT, diversas biografias estao publicadas como PDF em:
  /institucional/gestao-do-conhecimento/gestao-da-memoria/biografias/

Este script:
- baixa o sitemap de arquivos do TJDFT
- identifica URLs de biografias
- faz match fuzzy por nome (suporta CamelCase, numeros, slugs)
- baixa o PDF e extrai texto (pypdf)
- grava em `dados_publicos.biografia_tjdft_*`

Uso:
  python scripts/judiciario/enriquecer_tjdft_biografias.py
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
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _strip_accents(s: str) -> str:
    s = unicodedata.normalize("NFKD", s)
    return "".join(ch for ch in s if not unicodedata.combining(ch))


def _normalize(s: str) -> str:
    """Remove acentos, numeros, pontuacao -> apenas letras minusculas."""
    s = _strip_accents(s.strip().lower())
    # Expande CamelCase: RobertoFreitas -> roberto freitas
    s = re.sub(r"([a-z])([A-Z])", r"\1 \2", s)
    s = re.sub(r"[^a-z]+", "", s.lower())
    return s


def _slugify_ascii(s: str) -> str:
    s = s.strip().lower()
    s = _strip_accents(s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s


def _fetch(url: str) -> bytes:
    r = requests.get(url, timeout=90, verify=False, headers={"User-Agent": "Mozilla/5.0"})
    r.raise_for_status()
    return r.content


def _listar_urls_biografias() -> list[str]:
    idx = _fetch("https://www.tjdft.jus.br/sitemap-files.xml.gz")
    xml = gzip.decompress(idx).decode("utf-8", "replace")
    urls = re.findall(r"<loc>([^<]+)</loc>", xml)
    return [u for u in urls if "/biografias/" in u]


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
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _extrair_texto_html(html_bytes: bytes) -> str:
    try:
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html_bytes, "html.parser")
        for tag in soup(["script", "style", "nav", "header", "footer"]):
            tag.decompose()
        main = soup.find("div", {"id": "content-core"}) or soup.find("article") or soup.find("main") or soup
        text = main.get_text(separator="\n", strip=True)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()
    except Exception:
        return ""


def _find_best_match(nome: str, bio_index: list[tuple[str, str]]) -> str | None:
    """Encontra melhor URL de biografia para o nome dado."""
    nome_clean = re.sub(r"^Desa?\.\s*", "", nome).strip()
    nome_norm = _normalize(nome_clean)
    nome_parts = [_normalize(p) for p in nome_clean.split() if len(p) > 2]

    if not nome_parts:
        return None

    best_url = None
    best_score = 0.0

    for url, url_norm in bio_index:
        found = sum(1 for part in nome_parts if part in url_norm and len(part) > 2)
        score = found / len(nome_parts)

        # Penalizar se sobrenome principal nao bate
        sobrenome = nome_parts[-1] if nome_parts else ""
        if sobrenome and sobrenome not in url_norm:
            score *= 0.5

        if score > best_score and score >= 0.55:
            best_score = score
            best_url = url

    return best_url


def main() -> int:
    tjdft_dir = BASE_DIR / "TJDFT"
    paths = sorted(tjdft_dir.glob("*.json"))

    print("Baixando sitemap TJDFT...")
    bio_urls = _listar_urls_biografias()
    print(f"  {len(bio_urls)} URLs de biografias encontradas")

    # Indexa URLs normalizadas
    bio_index: list[tuple[str, str]] = []
    for u in bio_urls:
        filename = u.split("/")[-1].replace(".pdf", "").replace(".html", "")
        norm = _normalize(filename)
        bio_index.append((u, norm))

    updated = 0
    skipped = 0
    no_match = 0

    for path in paths:
        perfil = _load_json(path)
        dp = perfil.get("dados_publicos") or {}
        if dp.get("biografia_tjdft_texto"):
            skipped += 1
            continue

        nome = perfil.get("nome") or ""
        match_url = _find_best_match(nome, bio_index)

        if not match_url:
            no_match += 1
            print(f"  SEM MATCH: {nome}")
            continue

        try:
            content = _fetch(match_url)
        except Exception as e:
            print(f"  ERRO FETCH: {nome} -> {e}")
            no_match += 1
            continue

        texto = ""
        if content[:4] == b"%PDF":
            texto = _extrair_texto_pdf(content)
        else:
            texto = _extrair_texto_html(content)

        if not texto:
            dp["biografia_tjdft_url"] = match_url
            perfil["dados_publicos"] = dp
            _write_json(path, perfil)
            updated += 1
            print(f"  URL SALVA (sem texto): {nome}")
            continue

        dp["biografia_tjdft_url"] = match_url
        dp["biografia_tjdft_texto"] = texto
        dp["biografia_tjdft_resumo"] = (texto[:900] + "...") if len(texto) > 900 else texto

        # Atualizar campo biografia top-level
        if not perfil.get("biografia") or len(str(perfil.get("biografia", ""))) < 30:
            perfil["biografia"] = dp["biografia_tjdft_resumo"]

        perfil["dados_publicos"] = dp
        _write_json(path, perfil)
        updated += 1
        print(f"  OK: {nome} ({len(texto)} chars)")

        time.sleep(0.3)

    print(f"\nTJDFT: atualizados={updated} pulados={skipped} sem_match={no_match} (total={len(paths)})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
