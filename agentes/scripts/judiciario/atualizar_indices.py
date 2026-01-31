#!/usr/bin/env python3
"""Regera indices (CSV/JSON) a partir dos perfis existentes."""

from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any


BASE_DIR = Path("perfis agentes sinteticos judiciário - STF, STJ, TJDF, TRF1")


def _load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> int:
    indice: list[dict[str, str]] = []
    for orgao in ["STF", "STJ", "TJDFT", "TRF1"]:
        for p in sorted((BASE_DIR / orgao).glob("*.json")):
            d = _load_json(p)
            fontes = d.get("fontes") or []
            fonte_principal = fontes[0].get("url") if fontes else ""
            indice.append(
                {
                    "id": d.get("id", ""),
                    "nome": d.get("nome", ""),
                    "orgao": d.get("orgao", orgao),
                    "cargo": d.get("cargo", ""),
                    "situacao": d.get("situacao", ""),
                    "fonte_principal": fonte_principal or "",
                }
            )

    meta_dir = BASE_DIR / "meta"
    meta_dir.mkdir(parents=True, exist_ok=True)

    (meta_dir / "indice_magistrados.json").write_text(
        json.dumps(indice, ensure_ascii=True, indent=2) + "\n", encoding="utf-8"
    )

    with (meta_dir / "indice_magistrados.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(
            f, fieldnames=["id", "nome", "orgao", "cargo", "situacao", "fonte_principal"]
        )
        w.writeheader()
        for row in indice:
            w.writerow(row)

    print(f"Indice atualizado: {len(indice)} registros")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
