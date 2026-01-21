"""
Auditoria Completa de Todos os Campos
Comparacao com dados oficiais de referencia
"""

import json
from collections import Counter

# ============================================================================
# DADOS DE REFERENCIA OFICIAIS
# ============================================================================

REFERENCIAS = {
    "genero": {
        "fonte": "IBGE/PDAD 2021",
        "metas": {"feminino": 52.0, "masculino": 48.0},
        "tolerancia": 3,
    },
    "religiao": {
        "fonte": "Datafolha 2024 / IBGE Censo 2022",
        "metas": {
            "catolica": 46.0,      # Caiu de 50% para 46%
            "evangelica": 26.0,   # Subiu para 26%
            "sem_religiao": 14.0,
            "espirita": 4.0,
            "umbanda_candomble": 2.0,
            "outras": 8.0,
        },
        "tolerancia": 5,
    },
    "orientacao_politica": {
        "fonte": "Datafolha Dez/2024",
        "metas": {
            "direita": 26.0,         # Direita caiu
            "centro_direita": 12.0,
            "centro": 24.0,          # Centro cresceu
            "centro_esquerda": 14.0,
            "esquerda": 24.0,        # Esquerda cresceu
        },
        "tolerancia": 5,
    },
    "interesse_politico": {
        "fonte": "Datafolha 2024",
        "metas": {
            "alto": 25.0,
            "medio": 40.0,
            "baixo": 35.0,
        },
        "tolerancia": 5,
    },
    "posicao_bolsonaro": {
        "fonte": "Datafolha Jan/2025",
        "metas": {
            "apoiador_forte": 20.0,    # Nucleo duro ~20%
            "apoiador_moderado": 12.0,
            "neutro": 15.0,
            "critico_moderado": 18.0,
            "critico_forte": 35.0,     # Rejeicao alta
        },
        "tolerancia": 5,
    },
    "estado_civil": {
        "fonte": "IBGE PNAD 2023",
        "metas": {
            "solteiro(a)": 45.0,
            "casado(a)": 30.0,
            "uniao_estavel": 12.0,
            "divorciado(a)": 8.0,
            "viuvo(a)": 5.0,
        },
        "tolerancia": 5,
    },
    "ocupacao_vinculo": {
        "fonte": "PNAD/PDAD 2023 (normalizado para 100%)",
        "metas": {
            "clt": 31.5,              # Era 35%, normalizado
            "autonomo": 22.5,         # Era 25%, normalizado
            "informal": 13.5,         # Era 15%, normalizado
            "servidor_publico": 7.2,  # Era 8%, normalizado
            "desempregado": 7.2,      # Era 8%, normalizado
            "aposentado": 10.8,       # Era 12%, normalizado
            "estudante": 4.5,         # Era 5%, normalizado
            "empresario": 2.8,        # Era 3%, normalizado
        },
        "tolerancia": 5,
    },
    "meio_transporte": {
        "fonte": "PDAD 2021",
        "metas": {
            "onibus": 30.0,
            "carro": 35.0,
            "motocicleta": 10.0,
            "a_pe": 10.0,
            "metro": 5.0,
            "bicicleta": 3.0,
            "nao_se_aplica": 7.0,
        },
        "tolerancia": 5,
    },
    "escolaridade": {
        "fonte": "PDAD 2021/2024",
        "metas": {
            "fundamental_ou_sem_instrucao": 25.0,  # Inclui fundamental incompleto
            "medio_completo_ou_sup_incompleto": 45.0,
            "superior_completo_ou_pos": 30.0,      # DF tem escolaridade alta
        },
        "tolerancia": 5,
    },
    "cor_raca": {
        "fonte": "PDAD 2024",
        "metas": {
            "branca": 40.0,   # DF tem ~40% brancos (acima da media BR)
            "parda": 45.0,
            "preta": 15.0,
        },
        "tolerancia": 5,
    },
    "tolerancia_nuance": {
        "fonte": "Estimativa baseada em pesquisas de polarizacao",
        "metas": {
            "baixa": 40.0,   # Brasil muito polarizado
            "media": 35.0,
            "alta": 25.0,
        },
        "tolerancia": 5,
    },
    "cluster_socioeconomico": {
        "fonte": "PDAD 2021 - Grupos de Renda",
        "metas": {
            "G1_alta": 12.0,
            "G2_media_alta": 25.0,
            "G3_media_baixa": 45.0,
            "G4_baixa": 18.0,
        },
        "tolerancia": 5,
    },
    "faixa_etaria": {
        "fonte": "IBGE/PDAD - Piramide Etaria DF",
        "metas": {
            "16-17": 3.0,
            "18-24": 12.0,
            "25-34": 22.0,
            "35-44": 20.0,
            "45-54": 18.0,
            "55-64": 14.0,
            "65+": 11.0,
        },
        "tolerancia": 5,
    },
}


def analisar_campo(eleitores, campo, referencia):
    """Analisa um campo e compara com referencia"""
    n = len(eleitores)
    valores = [e.get(campo) for e in eleitores]
    dist = Counter(valores)

    metas = referencia['metas']
    tolerancia = referencia['tolerancia']

    problemas = []
    for categoria, meta in metas.items():
        atual = dist.get(categoria, 0) / n * 100
        diff = atual - meta

        if abs(diff) > tolerancia:
            status = "CRITICO" if abs(diff) > tolerancia * 2 else "ALERTA"
            problemas.append({
                'categoria': categoria,
                'atual': atual,
                'meta': meta,
                'diff': diff,
                'status': status,
            })

    return dist, problemas


def main():
    with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
        eleitores = json.load(f)

    n = len(eleitores)

    print("=" * 80)
    print("AUDITORIA COMPLETA - COMPARACAO COM DADOS OFICIAIS")
    print("=" * 80)
    print(f"Total de eleitores: {n}")
    print()

    campos_criticos = []
    campos_alerta = []
    campos_ok = []

    for campo, ref in REFERENCIAS.items():
        dist, problemas = analisar_campo(eleitores, campo, ref)

        tem_critico = any(p['status'] == 'CRITICO' for p in problemas)
        tem_alerta = any(p['status'] == 'ALERTA' for p in problemas)

        print("-" * 80)
        print(f"CAMPO: {campo}")
        print(f"Fonte: {ref['fonte']}")
        print()

        # Mostrar distribuicao atual vs meta
        print(f"{'Categoria':<30} {'Atual':>8} {'Meta':>8} {'Diff':>8} {'Status':>10}")
        print("-" * 70)

        for categoria, meta in ref['metas'].items():
            atual = dist.get(categoria, 0) / n * 100
            diff = atual - meta

            if abs(diff) > ref['tolerancia'] * 2:
                status = "[CRITICO]"
            elif abs(diff) > ref['tolerancia']:
                status = "[ALERTA]"
            else:
                status = "[OK]"

            print(f"{categoria:<30} {atual:>7.1f}% {meta:>7.1f}% {diff:>+7.1f}% {status:>10}")

        if tem_critico:
            campos_criticos.append(campo)
        elif tem_alerta:
            campos_alerta.append(campo)
        else:
            campos_ok.append(campo)

        print()

    # Resumo
    print("=" * 80)
    print("RESUMO DA AUDITORIA")
    print("=" * 80)
    print(f"Campos OK: {len(campos_ok)}")
    print(f"Campos com ALERTA: {len(campos_alerta)}")
    print(f"Campos CRITICOS: {len(campos_criticos)}")
    print()

    if campos_criticos:
        print("CAMPOS QUE PRECISAM CORRECAO URGENTE:")
        for c in campos_criticos:
            print(f"  - {c}")

    if campos_alerta:
        print("\nCAMPOS COM DESVIO MODERADO:")
        for c in campos_alerta:
            print(f"  - {c}")


if __name__ == "__main__":
    main()
