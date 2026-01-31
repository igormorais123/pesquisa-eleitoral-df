# -*- coding: utf-8 -*-
"""Valida consistencia minima dos perfis CLDF (legado + overrides).

Uso:
  python3 scripts/parlamentares/validar_cldf_overrides.py

Saida:
- Lista deputados sem override
- Lista campos recomendados ausentes (GDF alinhamento, incentivos)
- Avisos heurísticos de possiveis inversoes (ex.: PT/PSOL/PSB marcado como base_aliada)

Obs: heuristica nao e "verdade"; serve para encontrar onde revisar.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
LEGADO = ROOT / "agentes" / "banco-deputados-distritais-df.json"
OVERRIDES = ROOT / "data" / "parlamentares" / "cldf" / "overrides.json"


PARTIDOS_OPOSICAO_PROVAVEL = {"PT", "PSOL", "PSB"}


def main() -> int:
    with open(LEGADO, "r", encoding="utf-8") as f:
        deps = json.load(f)

    overrides = {}
    if OVERRIDES.exists():
        with open(OVERRIDES, "r", encoding="utf-8") as f:
            overrides = (json.load(f) or {}).get("overrides") or {}

    faltando_override = []
    faltando_gdf = []
    faltando_incentivos = []
    suspeitos = []

    for d in deps:
        nome = d.get("nome_parlamentar")
        partido = (d.get("partido") or "").strip().upper()
        rel = (d.get("relacao_governo_distrital") or d.get("relacao_governo_atual") or "").strip()

        o = overrides.get(nome)
        if o is None:
            faltando_override.append(nome)
            o = {}

        rel_gdf = None
        if isinstance(o, dict):
            relacoes = o.get("relacoes_governo")
            if isinstance(relacoes, dict):
                gdf = relacoes.get("gdf")
                if isinstance(gdf, dict):
                    rel_gdf = gdf.get("posicao")

        if rel_gdf is None:
            faltando_gdf.append(nome)

        incentivos = o.get("incentivos_politicos") if isinstance(o, dict) else None
        if not isinstance(incentivos, dict):
            faltando_incentivos.append(nome)

        if partido in PARTIDOS_OPOSICAO_PROVAVEL and rel in ("base_aliada", "independente") and rel_gdf is None:
            suspeitos.append(f"{nome} ({partido}) relacao_governo='{rel}'")

    print("=== VALIDACAO CLDF (overrides) ===")
    print(f"Total deputados (legado): {len(deps)}")
    print(f"Entradas overrides: {len(overrides)}")
    print()

    if faltando_override:
        print("Faltando override (entrada inexistente):")
        for n in faltando_override:
            print(f"- {n}")
        print()

    if faltando_gdf:
        print("Faltando relacoes_governo.gdf.posicao (recomendado preencher):")
        for n in faltando_gdf:
            print(f"- {n}")
        print()

    if faltando_incentivos:
        print("Faltando incentivos_politicos (recomendado preencher):")
        for n in faltando_incentivos:
            print(f"- {n}")
        print()

    if suspeitos:
        print("Possiveis inversoes (heuristica; revisar manualmente):")
        for s in suspeitos:
            print(f"- {s}")
        print()

    print("OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
