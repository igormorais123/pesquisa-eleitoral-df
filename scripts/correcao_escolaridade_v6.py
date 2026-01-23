#!/usr/bin/env python3
"""
Correcao Escolaridade - Versao 6
Aumentar escolaridade superior de 16% para 37%
"""

import json
import random

ARQUIVO = "agentes/banco-eleitores-df.json"
ARQUIVO_FRONTEND = "frontend/src/data/eleitores-df-1000.json"


def carregar():
    with open(ARQUIVO, "r", encoding="utf-8") as f:
        return json.load(f)


def salvar(eleitores):
    with open(ARQUIVO, "w", encoding="utf-8") as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)
    with open(ARQUIVO_FRONTEND, "w", encoding="utf-8") as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)


def main():
    print("=" * 60)
    print("CORRECAO ESCOLARIDADE - VERSAO 6")
    print("=" * 60)

    eleitores = carregar()
    total = len(eleitores)

    # Contar atuais por escolaridade
    dist_esc = {}
    for e in eleitores:
        esc = e.get("escolaridade", "")
        dist_esc[esc] = dist_esc.get(esc, 0) + 1

    print("\nDistribuicao atual:")
    for esc, qtd in sorted(dist_esc.items()):
        print(f"  {esc}: {qtd} ({100 * qtd / total:.1f}%)")

    # Calcular superior (incluindo variantes)
    superior_keys = [
        k
        for k in dist_esc.keys()
        if "superior" in k.lower() and ("pos" in k.lower() or "completo" in k.lower())
    ]
    atual_superior = sum(dist_esc.get(k, 0) for k in superior_keys)

    meta_superior = int(0.37 * total)  # 37%
    meta_medio = int(0.438 * total)  # 43.8%
    meta_fundamental = int(0.192 * total)  # 19.2%

    falta_superior = meta_superior - atual_superior

    print(f"\nAtual superior: {atual_superior} ({100 * atual_superior / total:.1f}%)")
    print(f"Meta superior: {meta_superior} (37%)")
    print(f"Falta: {falta_superior}")

    # Selecionar candidatos para mudar para superior
    # Criterios:
    # - idade >= 23 (minimo para ter superior)
    # - escolaridade atual = medio
    # - ocupacao compativel

    candidatos = []
    for e in eleitores:
        idade = e.get("idade", 0)
        esc = e.get("escolaridade", "")
        ocup = e.get("ocupacao_vinculo", "")

        if idade >= 23 and "medio" in esc.lower():
            # Priorizar por ocupacao
            if ocup in ["servidor_publico", "empresario"]:
                candidatos.append((e, 3))  # Alta prioridade
            elif ocup in ["clt", "autonomo"]:
                candidatos.append((e, 2))  # Media prioridade
            elif ocup in ["desempregado"]:
                candidatos.append((e, 1))  # Baixa prioridade

    # Ordenar por prioridade (decrescente)
    candidatos.sort(key=lambda x: -x[1])

    print(f"\nCandidatos elegiveis: {len(candidatos)}")

    # Profissoes por ocupacao
    profissoes = {
        "servidor_publico": [
            "Analista do GDF",
            "Tecnico Judiciario",
            "Professor(a) SEEDF",
            "Auditor Fiscal",
            "Contador(a) GDF",
        ],
        "empresario": ["Empresario(a)", "Empreendedor(a)", "Diretor(a) Comercial"],
        "clt": [
            "Analista",
            "Coordenador(a)",
            "Gerente",
            "Engenheiro(a)",
            "Contador(a)",
            "Administrador(a)",
        ],
        "autonomo": [
            "Advogado(a)",
            "Consultor(a)",
            "Arquiteto(a)",
            "Psicologo(a)",
            "Engenheiro(a) Civil",
        ],
        "desempregado": [
            "Desempregado(a) - Administrador(a)",
            "Desempregado(a) - Contador(a)",
        ],
    }

    correcoes = 0
    for e, prioridade in candidatos[:falta_superior]:
        e["escolaridade"] = "superior_completo_ou_pos"

        # Ajustar profissao
        ocup = e.get("ocupacao_vinculo", "clt")
        if ocup in profissoes:
            e["profissao"] = random.choice(profissoes[ocup])

        # Ajustar cluster se necessario (superior geralmente nao eh classe baixa)
        cluster = e.get("cluster_socioeconomico", "")
        renda = e.get("renda_salarios_minimos", "")

        if cluster == "G4_baixa":
            # 50% sobe para media-baixa, 50% fica (realidade brasileira)
            if random.random() < 0.5:
                e["cluster_socioeconomico"] = "G3_media_baixa"

        if renda == "ate_1":
            # Superior raramente ganha 1 SM
            if random.random() < 0.7:
                e["renda_salarios_minimos"] = random.choice(
                    ["mais_de_1_ate_2", "mais_de_2_ate_5"]
                )

        correcoes += 1

    print(f"\nCorrecoes realizadas: {correcoes}")

    # Verificar nova distribuicao
    dist_esc = {}
    for e in eleitores:
        esc = e.get("escolaridade", "")
        dist_esc[esc] = dist_esc.get(esc, 0) + 1

    print("\nNova distribuicao:")
    for esc, qtd in sorted(dist_esc.items()):
        print(f"  {esc}: {qtd} ({100 * qtd / total:.1f}%)")

    # Salvar
    print("\nSalvando...")
    salvar(eleitores)

    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
