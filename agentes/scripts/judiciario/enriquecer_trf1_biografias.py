#!/usr/bin/env python3
"""Enriquece perfis do TRF1 com biografia da pagina individual.

O site do TRF1 costuma estar sob WAF/JavaScript; por isso, este script usa um proxy
de leitura (r.jina.ai) para obter o conteudo em texto/markdown.

Campos gravados:
- dados_publicos.telefone (se encontrado)
- dados_publicos.email (se encontrado)
- dados_publicos.biografia_trf1_texto
- dados_publicos.biografia_trf1_secoes (quando houver "### <titulo>")

Uso:
  .venv-juris/bin/python scripts/judiciario/enriquecer_trf1_biografias.py
"""

from __future__ import annotations

import json
import re
import time
from pathlib import Path
from typing import Any

import requests


BASE_DIR = Path("perfis agentes sinteticos judiciário - STF, STJ, TJDF, TRF1")


def _load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _write_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=True, indent=2) + "\n", encoding="utf-8")


def _fetch_markdown(url: str) -> str:
    # r.jina.ai bloqueia alguns User-Agents; funciona melhor sem UA.
    backoff_s = 2.0
    last_text = ""
    for attempt in range(1, 7):
        try:
            r = requests.get(f"https://r.jina.ai/{url}", timeout=60, verify=False)
            # 429/503 podem acontecer; trata como transitório.
            if r.status_code in (429, 503):
                time.sleep(backoff_s)
                backoff_s *= 1.8
                continue
            r.raise_for_status()
            last_text = r.text
        except requests.RequestException:
            time.sleep(backoff_s)
            backoff_s *= 1.8
            continue

        # O proxy as vezes devolve isso quando nao consegue completar o challenge.
        if "Max challenge attempts exceeded" not in last_text:
            return last_text

        time.sleep(backoff_s)
        backoff_s *= 1.8

    return last_text


def _split_sections(md: str) -> dict[str, str]:
    """Divide por headings '### Titulo'."""
    sections: dict[str, str] = {}
    current = None
    buf: list[str] = []

    for line in md.splitlines():
        m = re.match(r"^###\s+(.+?)\s*$", line)
        if m:
            if current and buf:
                sections[current] = "\n".join(buf).strip()
            current = m.group(1).strip()
            buf = []
            continue
        if current is not None:
            buf.append(line)

    if current and buf:
        sections[current] = "\n".join(buf).strip()
    return sections


def _extract_bio(md: str) -> dict[str, Any] | None:
    gab = None
    tel = None
    email = None

    m_gab = re.search(r"^Gabinete:\s*(.+)\s*$", md, flags=re.M)
    if m_gab:
        gab = m_gab.group(1).strip()

    m_tel = re.search(r"^Telefone:\s*(.+)\s*$", md, flags=re.M)
    if m_tel:
        tel = m_tel.group(1).strip()

    m_email = re.search(r"^E-mail:\s*(.+)\s*$", md, flags=re.M | re.I)
    if m_email:
        email = m_email.group(1).strip()

    # Comeca apos a primeira imagem/logo do card da pessoa (logo depois de Gabinete)
    start = None
    if m_gab:
        idx = m_gab.end()
        m_img = re.search(r"\n!\[Image[^\n]*\]\([^\n]*\)\n\n", md[idx:])
        if m_img:
            start = idx + m_img.end()

    if start is None:
        return None

    # Termina antes do rodape. Prioriza marcadores comuns.
    end_markers = [
        "\n\n**Edif",
        "\n\n**Acompanhe o TRF",
        "\n\nAcompanhe o TRF",
        "\n\n© TRF1",
        "\n* * *\n",
    ]
    end = None
    for mk in end_markers:
        p = md.find(mk, start)
        if p != -1:
            end = p if end is None else min(end, p)

    bio = md[start:end].strip() if end else md[start:].strip()
    # Remove excesso de espacos no inicio/fim.
    bio = bio.strip()
    if not bio:
        return None

    return {
        "gabinete": gab,
        "telefone": tel,
        "email": email,
        "texto": bio,
        "secoes": _split_sections(bio),
    }


def main() -> int:
    trf1_dir = BASE_DIR / "TRF1"
    paths = sorted(trf1_dir.glob("*.json"))
    updated = 0
    skipped = 0

    for path in paths:
        perfil = _load_json(path)
        dados_publicos = perfil.get("dados_publicos") or {}
        url = dados_publicos.get("pagina_trf1")
        if not url:
            skipped += 1
            continue

        # Evita refazer trabalho se ja houver biografia.
        if dados_publicos.get("biografia_trf1_texto"):
            skipped += 1
            continue

        try:
            md = _fetch_markdown(url)
        except Exception:
            skipped += 1
            continue

        extracted = _extract_bio(md)
        if not extracted:
            skipped += 1
            continue

        # Atualiza campos.
        dados_publicos["gabinete_texto"] = dados_publicos.get("gabinete_texto") or extracted.get("gabinete")
        if extracted.get("telefone"):
            dados_publicos["telefone"] = extracted.get("telefone")
        if extracted.get("email"):
            dados_publicos["email"] = extracted.get("email")
        dados_publicos["biografia_trf1_texto"] = extracted.get("texto")
        if extracted.get("secoes"):
            dados_publicos["biografia_trf1_secoes"] = extracted.get("secoes")

        perfil["dados_publicos"] = dados_publicos
        _write_json(path, perfil)
        updated += 1

        time.sleep(0.05)

    print(f"TRF1: atualizados={updated} pulados={skipped}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
