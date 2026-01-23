#!/usr/bin/env python3
"""
Analise Final do Banco de Eleitores
Verifica o estado atual apos todas as correcoes
"""

import json

ARQUIVO = "agentes/banco-eleitores-df.json"

# Referencias oficiais
REFERENCIAS = {
    "faixa_etaria": {
        "16-24": 14.5,
        "25-34": 20.0,
        "35-44": 20.5,
        "45-54": 18.0,
        "55-64": 12.0,
        "65+": 15.0,
    },
    "genero": {"feminino": 52.2, "masculino": 47.8},
    "cor_raca": {
        "parda": 45.0,
        "branca": 40.6,
        "preta": 13.5,
        "amarela": 0.5,
        "indigena": 0.4,
    },
    "cluster_socioeconomico": {
        "G1_alta": 18.1,
        "G2_media_alta": 20.8,
        "G3_media_baixa": 32.9,
        "G4_baixa": 28.2,
    },
    "escolaridade": {
        "superior_completo_ou_pos": 37.0,
        "medio_completo_ou_sup_incompleto": 43.8,
        "fundamental_ou_sem_instrucao": 19.2,
    },
    "ocupacao_vinculo": {
        "clt": 37.5,
        "servidor_publico": 8.5,
        "autonomo": 25.0,
        "empresario": 4.2,
        "informal": 13.8,
        "desempregado": 6.6,
        "aposentado": 10.5,
        "estudante": 5.0,
    },
    "renda_salarios_minimos": {
        "ate_1": 28.5,
        "mais_de_1_ate_2": 25.8,
        "mais_de_2_ate_5": 24.2,
        "mais_de_5_ate_10": 12.5,
        "mais_de_10_ate_20": 6.0,
        "mais_de_20": 3.0,
    },
    "religiao": {
        "catolica": 49.7,
        "evangelica": 29.2,
        "sem_religiao": 11.3,
        "espirita": 3.3,
        "umbanda_candomble": 0.9,
        "outras": 5.6,
    },
    "estado_civil": {
        "solteiro(a)": 40.0,
        "casado(a)": 28.5,
        "uniao_estavel": 20.0,
        "divorciado(a)": 6.5,
        "viuvo(a)": 5.0,
    },
    "orientacao_politica": {
        # Normalizado para 100% (original soma 73%, 27% "não sabe")
        # Proporcional: 15/73=20.5, 7/73=9.6, 11/73=15.1, 11/73=15.1, 29/73=39.7
        "esquerda": 20.5,
        "centro_esquerda": 9.6,
        "centro": 15.1,
        "centro_direita": 15.1,
        "direita": 39.7,
    },
    "posicao_bolsonaro": {
        "critico_forte": 34.0,
        "critico_moderado": 20.0,
        "neutro": 20.0,
        "apoiador_moderado": 11.0,
        "apoiador_forte": 15.0,
    },
    "interesse_politico": {"baixo": 45.0, "medio": 35.0, "alto": 20.0},
    "tolerancia_nuance": {"baixa": 35.0, "media": 40.0, "alta": 25.0},
}


def calcular_faixa_etaria(idade):
    if idade < 25:
        return "16-24"
    elif idade < 35:
        return "25-34"
    elif idade < 45:
        return "35-44"
    elif idade < 55:
        return "45-54"
    elif idade < 65:
        return "55-64"
    else:
        return "65+"


def analisar_variavel(eleitores, campo, ref, total):
    """Analisa uma variavel e retorna metricas"""
    dist = {}
    for e in eleitores:
        if campo == "faixa_etaria":
            valor = calcular_faixa_etaria(e.get("idade", 30))
        else:
            valor = e.get(campo, "desconhecido")
        dist[valor] = dist.get(valor, 0) + 1

    desvios = []
    for cat, ref_pct in ref.items():
        atual = dist.get(cat, 0)
        atual_pct = 100 * atual / total
        desvio = abs(atual_pct - ref_pct)
        desvios.append(desvio)

    desvio_medio = sum(desvios) / len(desvios) if desvios else 0
    desvio_max = max(desvios) if desvios else 0

    # Status baseado no desvio maximo
    if desvio_max <= 3:
        status = "OTIMO"
    elif desvio_max <= 7:
        status = "BOM"
    elif desvio_max <= 12:
        status = "ATENCAO"
    else:
        status = "CRITICO"

    return {
        "distribuicao": dist,
        "desvio_medio": desvio_medio,
        "desvio_max": desvio_max,
        "status": status,
    }


def verificar_inconsistencias(eleitores):
    """Verifica inconsistencias internas"""
    inconsistencias = {
        "idade_escolaridade": 0,
        "idade_ocupacao": 0,
        "orientacao_bolsonaro": 0,
        "voto_facultativo": 0,
        "ocupacao_profissao": 0,
    }

    for e in eleitores:
        idade = e.get("idade", 30)
        escolaridade = e.get("escolaridade", "")
        ocupacao = e.get("ocupacao_vinculo", "")
        orientacao = e.get("orientacao_politica", "")
        posicao = e.get("posicao_bolsonaro", "")
        voto_fac = e.get("voto_facultativo", False)
        profissao = e.get("profissao", "").lower()

        # Idade < 22 com superior
        if idade < 22 and "superior" in escolaridade:
            inconsistencias["idade_escolaridade"] += 1

        # Aposentado < 50
        if ocupacao == "aposentado" and idade < 50:
            inconsistencias["idade_ocupacao"] += 1

        # Esquerda + apoiador forte
        if orientacao == "esquerda" and posicao == "apoiador_forte":
            inconsistencias["orientacao_bolsonaro"] += 1

        # Voto facultativo errado
        if (idade < 18 or idade >= 70) and not voto_fac:
            inconsistencias["voto_facultativo"] += 1
        if 18 <= idade < 70 and voto_fac:
            inconsistencias["voto_facultativo"] += 1

        # Estudante com profissao de adulto
        if ocupacao == "estudante":
            prof_invalidas = [
                "medico",
                "advogado",
                "engenheiro",
                "juiz",
                "servidor publico",
            ]
            for prof in prof_invalidas:
                if prof in profissao:
                    inconsistencias["ocupacao_profissao"] += 1
                    break

    return inconsistencias


def main():
    print("=" * 70)
    print("ANALISE FINAL DO BANCO DE ELEITORES")
    print("=" * 70)

    with open(ARQUIVO, "r", encoding="utf-8") as f:
        eleitores = json.load(f)

    total = len(eleitores)
    print(f"\nTotal de eleitores: {total}")

    # Analisar cada variavel
    resultados = {}

    print("\n" + "-" * 70)
    print("ANALISE POR VARIAVEL")
    print("-" * 70)

    variaveis_ordem = [
        ("faixa_etaria", "Faixa Etaria"),
        ("genero", "Genero"),
        ("cor_raca", "Cor/Raca"),
        ("cluster_socioeconomico", "Classe Social"),
        ("escolaridade", "Escolaridade"),
        ("ocupacao_vinculo", "Ocupacao"),
        ("renda_salarios_minimos", "Renda"),
        ("religiao", "Religiao"),
        ("estado_civil", "Estado Civil"),
        ("orientacao_politica", "Orientacao Politica"),
        ("posicao_bolsonaro", "Posicao Bolsonaro"),
        ("interesse_politico", "Interesse Politico"),
        ("tolerancia_nuance", "Tolerancia Nuance"),
    ]

    contagem_status = {"OTIMO": 0, "BOM": 0, "ATENCAO": 0, "CRITICO": 0}

    for campo, nome in variaveis_ordem:
        if campo in REFERENCIAS:
            result = analisar_variavel(eleitores, campo, REFERENCIAS[campo], total)
            resultados[campo] = result
            contagem_status[result["status"]] += 1

            # Simbolo de status
            simbolo = {
                "OTIMO": "[OK]",
                "BOM": "[++]",
                "ATENCAO": "[!!]",
                "CRITICO": "[XX]",
            }[result["status"]]

            print(f"\n{simbolo} {nome}")
            print(
                f"    Desvio medio: {result['desvio_medio']:.1f}% | Desvio max: {result['desvio_max']:.1f}% | Status: {result['status']}"
            )

            # Mostrar categorias com maior desvio
            for cat, ref_pct in REFERENCIAS[campo].items():
                atual = result["distribuicao"].get(cat, 0)
                atual_pct = 100 * atual / total
                desvio = atual_pct - ref_pct
                if abs(desvio) > 5:
                    print(
                        f"    -> {cat}: {atual_pct:.1f}% (ref: {ref_pct:.1f}%) [{desvio:+.1f}%]"
                    )

    # Resumo
    print("\n" + "=" * 70)
    print("RESUMO")
    print("=" * 70)

    print(f"\nDistribuicao de status:")
    print(f"  OTIMO (desvio <= 3%):  {contagem_status['OTIMO']} variaveis")
    print(f"  BOM (desvio 3-7%):     {contagem_status['BOM']} variaveis")
    print(f"  ATENCAO (desvio 7-12%): {contagem_status['ATENCAO']} variaveis")
    print(f"  CRITICO (desvio > 12%): {contagem_status['CRITICO']} variaveis")

    # Calcular indice de conformidade
    total_vars = sum(contagem_status.values())
    pontos = (
        contagem_status["OTIMO"] * 4
        + contagem_status["BOM"] * 3
        + contagem_status["ATENCAO"] * 2
        + contagem_status["CRITICO"] * 1
    )
    max_pontos = total_vars * 4
    indice = 100 * pontos / max_pontos

    print(f"\n  INDICE DE CONFORMIDADE: {indice:.0f}%")

    # Verificar inconsistencias
    print("\n" + "=" * 70)
    print("VERIFICACAO DE INCONSISTENCIAS INTERNAS")
    print("=" * 70)

    incons = verificar_inconsistencias(eleitores)
    total_incons = sum(incons.values())

    print(f"\n  Idade vs Escolaridade: {incons['idade_escolaridade']} casos")
    print(f"  Idade vs Ocupacao: {incons['idade_ocupacao']} casos")
    print(f"  Orientacao vs Bolsonaro: {incons['orientacao_bolsonaro']} casos")
    print(f"  Voto Facultativo: {incons['voto_facultativo']} casos")
    print(f"  Ocupacao vs Profissao: {incons['ocupacao_profissao']} casos")
    print(f"\n  TOTAL DE INCONSISTENCIAS: {total_incons}")

    if total_incons == 0:
        print("  [OK] Nenhuma inconsistencia encontrada!")

    print("\n" + "=" * 70)


if __name__ == "__main__":
    main()
