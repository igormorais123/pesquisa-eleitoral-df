#!/usr/bin/env python3
"""
Correcao Final - Versao 5
Corrige:
1. Escolaridade (poucos com superior)
2. Posicao Bolsonaro (poucos criticos fortes)
3. Voto facultativo
4. Ocupacao aposentados jovens
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
    print("CORRECAO FINAL - VERSAO 5")
    print("=" * 60)

    eleitores = carregar()
    total = len(eleitores)

    correcoes = {
        "escolaridade": 0,
        "posicao_bolsonaro": 0,
        "voto_facultativo": 0,
        "ocupacao_idade": 0,
    }

    # 1. Corrigir voto facultativo
    print("\n1. Corrigindo voto facultativo...")
    for e in eleitores:
        idade = e.get("idade", 30)
        voto_fac = e.get("voto_facultativo", False)

        # Menores de 18 ou 70+ devem ter voto facultativo
        if (idade < 18 or idade >= 70) and not voto_fac:
            e["voto_facultativo"] = True
            correcoes["voto_facultativo"] += 1

        # Entre 18 e 69 deve ter voto obrigatorio
        if 18 <= idade < 70 and voto_fac:
            e["voto_facultativo"] = False
            correcoes["voto_facultativo"] += 1

    # 2. Corrigir aposentados muito jovens
    print("2. Corrigindo aposentados jovens...")
    for e in eleitores:
        idade = e.get("idade", 30)
        ocupacao = e.get("ocupacao_vinculo", "")

        if ocupacao == "aposentado" and idade < 50:
            # Mudar para autonomo ou informal
            e["ocupacao_vinculo"] = random.choice(["autonomo", "informal"])
            e["profissao"] = random.choice(
                ["Autonomo(a)", "Prestador(a) de Servicos", "Diarista"]
            )
            correcoes["ocupacao_idade"] += 1

    # 3. Corrigir escolaridade (aumentar superior)
    print("3. Corrigindo escolaridade...")

    # Contar atuais
    dist_esc = {}
    for e in eleitores:
        esc = e.get("escolaridade", "")
        dist_esc[esc] = dist_esc.get(esc, 0) + 1

    atual_superior = dist_esc.get("superior_completo_ou_pos", 0) + dist_esc.get(
        "superior_ou_pos", 0
    )
    meta_superior = int(0.37 * total)  # 37%
    falta_superior = meta_superior - atual_superior

    print(f"   Atual superior: {atual_superior} ({100 * atual_superior / total:.1f}%)")
    print(f"   Meta: {meta_superior} ({37}%)")
    print(f"   Falta: {falta_superior}")

    # Selecionar eleitores para mudar para superior
    # Priorizar: idade >= 25, ocupacao clt/servidor/empresario/autonomo, cluster G1 ou G2
    candidatos = [
        e
        for e in eleitores
        if e.get("idade", 0) >= 25
        and e.get("escolaridade") in ["medio_completo_ou_sup_incompleto"]
        and e.get("ocupacao_vinculo")
        in ["clt", "servidor_publico", "empresario", "autonomo"]
    ]

    random.shuffle(candidatos)

    for e in candidatos[:falta_superior]:
        e["escolaridade"] = "superior_completo_ou_pos"
        # Ajustar profissao se necessario
        ocupacao = e.get("ocupacao_vinculo", "")
        if ocupacao == "servidor_publico":
            e["profissao"] = random.choice(
                [
                    "Analista Administrativo",
                    "Tecnico Judiciario",
                    "Professor(a) da SEEDF",
                    "Contador(a) do GDF",
                ]
            )
        elif ocupacao == "clt":
            e["profissao"] = random.choice(
                [
                    "Analista",
                    "Coordenador(a)",
                    "Engenheiro(a)",
                    "Administrador(a)",
                    "Contador(a)",
                ]
            )
        elif ocupacao == "empresario":
            e["profissao"] = random.choice(
                ["Empresario(a)", "Empreendedor(a)", "Comerciante"]
            )
        elif ocupacao == "autonomo":
            e["profissao"] = random.choice(
                ["Consultor(a)", "Advogado(a)", "Arquiteto(a)", "Designer"]
            )

        # Ajustar cluster e renda para ser coerente
        if e.get("cluster_socioeconomico") == "G4_baixa":
            e["cluster_socioeconomico"] = random.choice(
                ["G2_media_alta", "G3_media_baixa"]
            )
        if e.get("renda_salarios_minimos") == "ate_1":
            e["renda_salarios_minimos"] = random.choice(
                ["mais_de_2_ate_5", "mais_de_5_ate_10"]
            )

        correcoes["escolaridade"] += 1

    # 4. Corrigir posicao Bolsonaro (aumentar criticos fortes)
    print("4. Corrigindo posicao Bolsonaro...")

    dist_bol = {}
    for e in eleitores:
        pos = e.get("posicao_bolsonaro", "")
        dist_bol[pos] = dist_bol.get(pos, 0) + 1

    atual_critico_forte = dist_bol.get("critico_forte", 0)
    meta_critico_forte = int(0.34 * total)  # 34%
    falta_critico_forte = meta_critico_forte - atual_critico_forte

    print(
        f"   Atual critico_forte: {atual_critico_forte} ({100 * atual_critico_forte / total:.1f}%)"
    )
    print(f"   Meta: {meta_critico_forte} ({34}%)")
    print(f"   Falta: {falta_critico_forte}")

    # Mudar apoiadores moderados e neutros de esquerda/centro-esquerda para criticos fortes
    candidatos = [
        e
        for e in eleitores
        if e.get("orientacao_politica") in ["esquerda", "centro_esquerda"]
        and e.get("posicao_bolsonaro")
        in ["neutro", "critico_moderado", "apoiador_moderado"]
    ]

    random.shuffle(candidatos)

    for e in candidatos[:falta_critico_forte]:
        e["posicao_bolsonaro"] = "critico_forte"
        correcoes["posicao_bolsonaro"] += 1

    # Se ainda faltar, pegar do centro tambem
    falta_restante = falta_critico_forte - len(
        [e for e in candidatos[:falta_critico_forte]]
    )
    if falta_restante > 0:
        candidatos_centro = [
            e
            for e in eleitores
            if e.get("orientacao_politica") == "centro"
            and e.get("posicao_bolsonaro") in ["neutro", "apoiador_moderado"]
        ]
        random.shuffle(candidatos_centro)

        for e in candidatos_centro[:falta_restante]:
            e["posicao_bolsonaro"] = "critico_forte"
            correcoes["posicao_bolsonaro"] += 1

    # Salvar
    print("\nSalvando correcoes...")
    salvar(eleitores)

    # Relatorio
    print("\n" + "=" * 60)
    print("RELATORIO DE CORRECOES")
    print("=" * 60)
    print(f"  Voto facultativo: {correcoes['voto_facultativo']} correcoes")
    print(f"  Ocupacao/Idade: {correcoes['ocupacao_idade']} correcoes")
    print(f"  Escolaridade: {correcoes['escolaridade']} correcoes")
    print(f"  Posicao Bolsonaro: {correcoes['posicao_bolsonaro']} correcoes")
    print(f"\n  TOTAL: {sum(correcoes.values())} correcoes")
    print("=" * 60)


if __name__ == "__main__":
    main()
