# -*- coding: utf-8 -*-
"""
Validador de Alinhamento Governo - Data Quality

Verifica incoerencias nos dados de alinhamento politico dos parlamentares.
Detecta:
- Deputado de partido governista marcado como oposicao
- Deputado de partido opositor marcado como base_aliada
- Campos obrigatorios ausentes
- Inconsistencias entre relacao_governo_federal e posicao_lula

Autor: INTEIA - Inteligencia Estrategica
"""

import json
import sys
import io
from pathlib import Path
from typing import Any, Dict, List

# Fix encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Caminhos dos JSONs de parlamentares
BASE_DIR = Path(__file__).parent.parent.parent / "agentes"
ARQUIVOS = {
    "deputados_distritais": BASE_DIR / "banco-deputados-distritais-df.json",
    "deputados_federais_df": BASE_DIR / "banco-deputados-federais-df.json",
    "deputados_federais": BASE_DIR / "banco-deputados-federais.json",
    "senadores": BASE_DIR / "banco-senadores.json",
    "senadores_df": BASE_DIR / "banco-senadores-df.json",
}

# Coalizoes conhecidas
COALIZAO_LULA = {"PT", "PSOL", "PSB", "REDE", "PDT", "PCdoB", "PV", "SOLIDARIEDADE"}
OPOSICAO_LULA = {"PL", "NOVO", "PP"}  # PP e ambiguo mas geralmente governa
COALIZAO_IBANEIS = {"MDB", "PP", "PSD", "REPUBLICANOS", "UNIAO", "AVANTE", "PRD"}
OPOSICAO_IBANEIS = {"PT", "PSOL", "PSB", "REDE", "PDT", "PL"}


def carregar_json(caminho: Path) -> List[Dict[str, Any]]:
    """Carrega JSON de parlamentares."""
    if not caminho.exists():
        return []
    with open(caminho, 'r', encoding='utf-8') as f:
        return json.load(f)


def validar_parlamentar(dep: Dict[str, Any], contexto: str) -> List[str]:
    """Valida um parlamentar e retorna lista de problemas encontrados."""
    problemas = []
    nome = dep.get("nome_parlamentar", dep.get("nome", "?"))
    partido = dep.get("partido", "?")
    casa = dep.get("casa_legislativa", "")

    # 1. Verificar campos obrigatorios para CLDF
    if casa == "cldf":
        if "relacao_governo_distrital" not in dep:
            problemas.append(
                f"[AUSENTE] {nome} ({partido}) - campo 'relacao_governo_distrital' ausente (CLDF)"
            )
        if "relacao_governo_federal" not in dep:
            problemas.append(
                f"[AUSENTE] {nome} ({partido}) - campo 'relacao_governo_federal' ausente (CLDF)"
            )
        if "dependencia_emendas" not in dep:
            problemas.append(
                f"[AUSENTE] {nome} ({partido}) - campo 'dependencia_emendas' ausente (CLDF)"
            )

        # 2. Verificar coerencia governo distrital (Ibaneis/MDB)
        rel_gdf = dep.get("relacao_governo_distrital", "")
        if partido in COALIZAO_IBANEIS and "oposicao" in rel_gdf:
            problemas.append(
                f"[INVERSAO] {nome} ({partido}) - partido da coalizao Ibaneis mas "
                f"relacao_governo_distrital='{rel_gdf}'"
            )
        if partido in OPOSICAO_IBANEIS and rel_gdf == "base_aliada":
            problemas.append(
                f"[INVERSAO] {nome} ({partido}) - partido de oposicao a Ibaneis mas "
                f"relacao_governo_distrital='{rel_gdf}'"
            )

    # 3. Verificar campo legado sem campos explícitos
    if casa == "cldf" and "relacao_governo_atual" in dep:
        if "relacao_governo_distrital" not in dep:
            problemas.append(
                f"[LEGADO] {nome} ({partido}) - campo 'relacao_governo_atual' presente sem "
                f"'relacao_governo_distrital'. Migrar para campos explícitos."
            )
        else:
            # Verificar que o alias está correto
            if dep.get("relacao_governo_atual") != dep.get("relacao_governo_distrital"):
                problemas.append(
                    f"[ALIAS] {nome} ({partido}) - relacao_governo_atual='{dep.get('relacao_governo_atual')}' "
                    f"difere de relacao_governo_distrital='{dep.get('relacao_governo_distrital')}'"
                )

    # 4. Verificar coerencia governo federal (Lula/PT) - todos os parlamentares
    rel_fed = dep.get("relacao_governo_federal", dep.get("relacao_governo_atual", ""))
    if partido in COALIZAO_LULA and "oposicao" in rel_fed:
        problemas.append(
            f"[INVERSAO] {nome} ({partido}) - partido da base Lula mas "
            f"relacao_governo_federal='{rel_fed}'"
        )
    if partido in OPOSICAO_LULA and rel_fed == "base_aliada":
        problemas.append(
            f"[INVERSAO] {nome} ({partido}) - partido de oposicao a Lula mas "
            f"relacao_governo_federal='{rel_fed}'"
        )

    # 5. Coerencia posicao_lula vs relacao_governo_federal
    posicao_lula = dep.get("posicao_lula", "")
    if rel_fed:
        if "apoiador_forte" in posicao_lula and "oposicao" in rel_fed:
            problemas.append(
                f"[INCONSISTENCIA] {nome} ({partido}) - posicao_lula='{posicao_lula}' "
                f"mas relacao_governo_federal='{rel_fed}'"
            )
        if "opositor_forte" in posicao_lula and rel_fed == "base_aliada":
            problemas.append(
                f"[INCONSISTENCIA] {nome} ({partido}) - posicao_lula='{posicao_lula}' "
                f"mas relacao_governo_federal='{rel_fed}'"
            )

    return problemas


def main():
    print("=" * 70)
    print("  INTEIA - Validador de Alinhamento Governo")
    print("  Data Quality Check - Parlamentares")
    print("=" * 70)
    print()

    total_problemas = 0
    total_parlamentares = 0

    for nome_arquivo, caminho in ARQUIVOS.items():
        if not caminho.exists():
            print(f"[SKIP] {nome_arquivo}: arquivo nao encontrado ({caminho})")
            continue

        parlamentares = carregar_json(caminho)
        print(f"\n{'='*50}")
        print(f"  {nome_arquivo} ({len(parlamentares)} parlamentares)")
        print(f"{'='*50}")

        problemas_arquivo = []
        for dep in parlamentares:
            problemas = validar_parlamentar(dep, nome_arquivo)
            problemas_arquivo.extend(problemas)

        total_parlamentares += len(parlamentares)

        if problemas_arquivo:
            for p in problemas_arquivo:
                print(f"  {p}")
            total_problemas += len(problemas_arquivo)
        else:
            print(f"  [OK] Nenhum problema encontrado")

    print(f"\n{'='*70}")
    print(f"  RESUMO")
    print(f"{'='*70}")
    print(f"  Parlamentares analisados: {total_parlamentares}")
    print(f"  Problemas encontrados:    {total_problemas}")

    if total_problemas == 0:
        print(f"\n  *** TODOS OS DADOS ESTAO COERENTES ***")
    else:
        print(f"\n  *** {total_problemas} PROBLEMAS PRECISAM SER CORRIGIDOS ***")

    print(f"{'='*70}")
    return 1 if total_problemas > 0 else 0


if __name__ == "__main__":
    sys.exit(main())
