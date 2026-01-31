#!/usr/bin/env python3
"""Gera dossies em Markdown a partir dos perfis JSON.

Saida:
  perfis agentes sinteticos judiciário - STF, STJ, TJDF, TRF1/dossies/<ORGAO>/<id>.md

Uso:
  .venv-juris/bin/python scripts/judiciario/gerar_dossies_markdown.py
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


BASE_DIR = Path("perfis agentes sinteticos judiciário - STF, STJ, TJDF, TRF1")


def _load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _md_escape(s: str) -> str:
    return s.replace("\r\n", "\n").replace("\r", "\n")


def _render_kv(obj: dict[str, Any]) -> str:
    lines: list[str] = []
    for k in sorted(obj.keys()):
        v = obj[k]
        if v is None:
            continue
        if isinstance(v, (dict, list)):
            continue
        lines.append(f"- {k}: {v}")
    return "\n".join(lines)


def _render_fontes(fontes: list[dict[str, Any]]) -> str:
    out: list[str] = []
    for f in fontes:
        url = f.get("url")
        tipo = f.get("tipo")
        obs = f.get("observacao")
        if not url:
            continue
        if obs:
            out.append(f"- ({tipo}) {url} - {obs}")
        else:
            out.append(f"- ({tipo}) {url}")
    return "\n".join(out)


def main() -> int:
    dossies_dir = BASE_DIR / "dossies"
    dossies_dir.mkdir(parents=True, exist_ok=True)

    indice_lines = ["# Indice de Dossies", ""]

    total = 0
    for orgao in ["STF", "STJ", "TJDFT", "TRF1"]:
        org_dir = BASE_DIR / orgao
        out_org_dir = dossies_dir / orgao
        out_org_dir.mkdir(parents=True, exist_ok=True)
        indice_lines.append(f"## {orgao}")

        for path in sorted(org_dir.glob("*.json")):
            perfil = _load_json(path)
            _id = perfil.get("id")
            nome = perfil.get("nome")
            cargo = perfil.get("cargo")
            situacao = perfil.get("situacao")
            fontes = perfil.get("fontes") or []
            dp = perfil.get("dados_publicos") or {}

            out_path = out_org_dir / f"{_id}.md"
            rel = f"dossies/{orgao}/{_id}.md"
            indice_lines.append(f"- [{nome}]({rel})")

            parts: list[str] = []
            parts.append(f"# {nome}")
            parts.append("")
            parts.append(f"- id: `{_id}`")
            parts.append(f"- orgao: {orgao}")
            parts.append(f"- cargo: {cargo}")
            parts.append(f"- situacao: {situacao}")
            parts.append("")

            parts.append("## Fontes")
            parts.append(_render_fontes(fontes) or "- (sem fontes)")
            parts.append("")

            parts.append("## Dados Publicos (campos)")
            kv = _render_kv(dp)
            parts.append(kv or "- (sem campos simples)")
            parts.append("")

            # Biografias/Texto
            if dp.get("biografia_trf1_texto"):
                parts.append("## Biografia (TRF1)")
                parts.append(_md_escape(dp["biografia_trf1_texto"]))
                parts.append("")
            if dp.get("biografia_tjdft_texto"):
                parts.append("## Biografia (TJDFT)")
                parts.append(_md_escape(dp["biografia_tjdft_texto"]))
                parts.append("")
            if dp.get("wikipedia_extrato"):
                parts.append("## Wikipedia (texto)")
                parts.append(_md_escape(dp["wikipedia_extrato"]))
                parts.append("")
            elif dp.get("wikipedia_resumo"):
                parts.append("## Wikipedia (resumo)")
                wr = dp["wikipedia_resumo"]
                parts.append(f"- titulo: {wr.get('titulo')}")
                parts.append(f"- descricao: {wr.get('descricao')}")
                parts.append("")
                parts.append(_md_escape(wr.get("extrato") or ""))
                parts.append("")

            out_path.write_text("\n".join(parts).strip() + "\n", encoding="utf-8")
            total += 1

        indice_lines.append("")

    (dossies_dir / "INDICE.md").write_text("\n".join(indice_lines).strip() + "\n", encoding="utf-8")
    print(f"Dossies gerados: {total}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
