"""
Ferramentas de simulação eleitoral.

Oferece simulações de cenários eleitorais, projeções de resultados
e análise Monte Carlo para modelagem de incertezas.
"""

import json
from langchain_core.tools import tool


@tool
def simular_cenario(
    candidato: str,
    variacao_pct: float = 0.0,
    regioes: str = "",
) -> str:
    """Simula um cenário eleitoral hipotético para um candidato.

    Aplica variações percentuais na intenção de voto de um candidato,
    opcionalmente focando em regiões administrativas específicas do DF,
    e calcula o impacto projetado no resultado final.

    Args:
        candidato: Nome do candidato para simular o cenário.
        variacao_pct: Variação percentual a aplicar na intenção de voto.
            Valores positivos aumentam, negativos diminuem.
            Exemplo: 5.0 significa +5 pontos percentuais.
        regioes: Regiões administrativas para aplicar a variação, separadas
            por vírgula. Deixe vazio para aplicar em todo o DF.
            Exemplo: "Ceilândia,Taguatinga,Samambaia"

    Returns:
        String JSON com o cenário simulado incluindo intenção de voto base,
        intenção ajustada, impacto por região e projeção de resultado.
    """
    import numpy as np

    # Base de intenção de voto simulada (dados de referência)
    base_intencoes = {
        "Candidato A": 35.0,
        "Candidato B": 28.0,
        "Candidato C": 15.0,
        "Indecisos": 22.0,
    }

    # Regiões do DF com peso eleitoral relativo
    pesos_regioes = {
        "Ceilândia": 0.15,
        "Taguatinga": 0.12,
        "Samambaia": 0.09,
        "Plano Piloto": 0.08,
        "Águas Claras": 0.07,
        "Gama": 0.06,
        "Santa Maria": 0.05,
        "Recanto das Emas": 0.05,
        "Sobradinho": 0.04,
        "Planaltina": 0.06,
        "Brazlândia": 0.03,
        "São Sebastião": 0.04,
        "Outras": 0.16,
    }

    # Identificar candidato ou usar o nome fornecido
    candidato_upper = candidato.strip()
    intencao_base = base_intencoes.get(candidato_upper, 25.0)

    # Parsear regiões alvo
    regioes_alvo = []
    if regioes.strip():
        regioes_alvo = [r.strip() for r in regioes.split(",")]

    # Calcular variação ponderada
    if regioes_alvo:
        peso_total_alvo = sum(
            pesos_regioes.get(r, 0.03) for r in regioes_alvo
        )
        # Variação é proporcional ao peso eleitoral das regiões selecionadas
        variacao_efetiva = variacao_pct * peso_total_alvo
    else:
        variacao_efetiva = variacao_pct

    intencao_ajustada = intencao_base + variacao_efetiva

    # Simular margem de erro com distribuição normal
    np.random.seed(42)
    margem_erro = np.std(
        np.random.normal(intencao_ajustada, 2.5, size=500)
    )

    # Impacto por região
    impacto_regioes = {}
    for regiao, peso in pesos_regioes.items():
        if regioes_alvo and regiao not in regioes_alvo:
            impacto_regioes[regiao] = {
                "variacao_aplicada": 0.0,
                "peso_eleitoral": peso,
            }
        else:
            impacto_regioes[regiao] = {
                "variacao_aplicada": round(variacao_pct, 2),
                "peso_eleitoral": peso,
            }

    # Projeção de resultado
    prob_vitoria_1turno = max(
        0, min(100, (intencao_ajustada - 50) * 5 + 50)
    )
    prob_2turno = max(0, min(100, intencao_ajustada * 2))

    resultado = {
        "candidato": candidato_upper,
        "cenario_simulado": {
            "intencao_base_pct": round(intencao_base, 2),
            "variacao_aplicada_pct": round(variacao_pct, 2),
            "variacao_efetiva_pct": round(variacao_efetiva, 2),
            "intencao_ajustada_pct": round(intencao_ajustada, 2),
            "margem_erro_pct": round(margem_erro, 2),
        },
        "regioes_alvo": regioes_alvo if regioes_alvo else "Todas",
        "impacto_por_regiao": impacto_regioes,
        "projecao": {
            "probabilidade_vitoria_1turno_pct": round(prob_vitoria_1turno, 1),
            "probabilidade_ir_2turno_pct": round(prob_2turno, 1),
            "cenario": (
                "favorável" if intencao_ajustada > 40
                else "competitivo" if intencao_ajustada > 25
                else "desafiador"
            ),
        },
        "observacao": (
            "Simulação baseada em dados de referência. "
            "Resultados são estimativas e não previsões definitivas."
        ),
    }

    return json.dumps(resultado, ensure_ascii=False, indent=2)


@tool
def simulacao_monte_carlo(
    candidato: str,
    n_simulacoes: int = 1000,
) -> str:
    """Executa simulação Monte Carlo para modelar incertezas eleitorais.

    Roda múltiplas simulações com variações aleatórias nos parâmetros
    eleitorais para gerar distribuição de probabilidade dos resultados
    possíveis para um candidato.

    Args:
        candidato: Nome do candidato para a simulação Monte Carlo.
        n_simulacoes: Número de simulações a executar (padrão: 1000).
            Valores maiores produzem resultados mais precisos mas
            demoram mais. Recomendado: 500 a 5000.

    Returns:
        String JSON com resultados estatísticos da simulação incluindo
        média, mediana, desvio padrão, intervalos de confiança e
        probabilidades de vitória em cada turno.
    """
    import numpy as np

    # Limitar número de simulações por segurança
    n_simulacoes = max(100, min(n_simulacoes, 10000))

    # Parâmetros base (em produção viriam do banco de dados)
    intencao_base = 30.0
    desvio_pesquisa = 3.5
    taxa_transferencia_indecisos = 0.35
    pct_indecisos = 20.0

    np.random.seed(None)  # Seed aleatória para variação real

    resultados_simulados = []
    vitorias_1turno = 0
    vitorias_2turno = 0

    for _ in range(n_simulacoes):
        # Variação na intenção de voto (distribuição normal)
        intencao = np.random.normal(intencao_base, desvio_pesquisa)

        # Transferência de indecisos (distribuição beta)
        transferencia = np.random.beta(2, 3) * pct_indecisos

        # Efeito do dia da eleição (variação uniforme)
        efeito_dia = np.random.uniform(-2.0, 2.0)

        # Resultado final da simulação
        resultado_final = intencao + (transferencia * taxa_transferencia_indecisos) + efeito_dia
        resultado_final = max(0, min(100, resultado_final))

        resultados_simulados.append(resultado_final)

        if resultado_final > 50:
            vitorias_1turno += 1
        elif resultado_final > 30:
            vitorias_2turno += 1

    resultados = np.array(resultados_simulados)

    # Intervalos de confiança
    ic_90 = (float(np.percentile(resultados, 5)), float(np.percentile(resultados, 95)))
    ic_95 = (float(np.percentile(resultados, 2.5)), float(np.percentile(resultados, 97.5)))

    # Percentis detalhados
    percentis = {
        "p10": round(float(np.percentile(resultados, 10)), 2),
        "p25": round(float(np.percentile(resultados, 25)), 2),
        "p50_mediana": round(float(np.percentile(resultados, 50)), 2),
        "p75": round(float(np.percentile(resultados, 75)), 2),
        "p90": round(float(np.percentile(resultados, 90)), 2),
    }

    resultado = {
        "candidato": candidato,
        "n_simulacoes": n_simulacoes,
        "estatisticas": {
            "media_pct": round(float(np.mean(resultados)), 2),
            "mediana_pct": round(float(np.median(resultados)), 2),
            "desvio_padrao": round(float(np.std(resultados)), 2),
            "minimo_pct": round(float(np.min(resultados)), 2),
            "maximo_pct": round(float(np.max(resultados)), 2),
        },
        "intervalos_confianca": {
            "ic_90_pct": [round(ic_90[0], 2), round(ic_90[1], 2)],
            "ic_95_pct": [round(ic_95[0], 2), round(ic_95[1], 2)],
        },
        "percentis": percentis,
        "probabilidades": {
            "vitoria_1turno_pct": round(
                (vitorias_1turno / n_simulacoes) * 100, 1
            ),
            "ir_para_2turno_pct": round(
                (vitorias_2turno / n_simulacoes) * 100, 1
            ),
            "eliminacao_1turno_pct": round(
                ((n_simulacoes - vitorias_1turno - vitorias_2turno) / n_simulacoes) * 100,
                1,
            ),
        },
        "parametros_utilizados": {
            "intencao_base_pct": intencao_base,
            "desvio_pesquisa": desvio_pesquisa,
            "pct_indecisos": pct_indecisos,
            "taxa_transferencia_indecisos": taxa_transferencia_indecisos,
        },
        "observacao": (
            "Simulação Monte Carlo com variações estocásticas nos parâmetros. "
            "Os resultados representam a distribuição de cenários possíveis, "
            "não uma previsão pontual."
        ),
    }

    return json.dumps(resultado, ensure_ascii=False, indent=2)


@tool
def projetar_resultado(dados_atuais: str = "") -> str:
    """Projeta resultado eleitoral com base nos dados atuais de pesquisa.

    Utiliza os dados mais recentes de intenção de voto, rejeição,
    potencial de crescimento e tendências para projetar o resultado
    provável da eleição.

    Args:
        dados_atuais: String JSON opcional com dados atualizados de pesquisa.
            Se vazio, utiliza os últimos dados disponíveis no sistema.
            Formato esperado: {"candidatos": [{"nome": "...", "intencao": 30.0}]}

    Returns:
        String JSON com projeção de resultado incluindo ranking de candidatos,
        cenário mais provável, probabilidade de segundo turno e análise
        de tendência.
    """
    import numpy as np

    # Tentar parsear dados fornecidos ou usar dados padrão
    dados = None
    if dados_atuais.strip():
        try:
            dados = json.loads(dados_atuais)
        except json.JSONDecodeError:
            pass

    # Dados padrão caso não sejam fornecidos
    if dados is None or "candidatos" not in dados:
        candidatos = [
            {
                "nome": "Candidato A",
                "intencao": 35.0,
                "rejeicao": 25.0,
                "tendencia": "estável",
            },
            {
                "nome": "Candidato B",
                "intencao": 28.0,
                "rejeicao": 30.0,
                "tendencia": "crescimento",
            },
            {
                "nome": "Candidato C",
                "intencao": 15.0,
                "rejeicao": 15.0,
                "tendencia": "queda",
            },
        ]
        pct_indecisos = 22.0
    else:
        candidatos = dados["candidatos"]
        pct_indecisos = dados.get("indecisos", 20.0)

    # Ajustar projeções com base na tendência
    ajuste_tendencia = {
        "crescimento": 3.0,
        "estável": 0.0,
        "queda": -2.0,
        "forte_crescimento": 5.0,
        "forte_queda": -4.0,
    }

    projecoes = []
    for c in candidatos:
        intencao = c.get("intencao", 0)
        tendencia = c.get("tendencia", "estável")
        rejeicao = c.get("rejeicao", 20)

        ajuste = ajuste_tendencia.get(tendencia, 0)

        # Potencial de absorção de indecisos (inversamente proporcional à rejeição)
        potencial_indecisos = (100 - rejeicao) / 100 * pct_indecisos * 0.3

        projecao_final = intencao + ajuste + potencial_indecisos

        projecoes.append({
            "nome": c.get("nome", "N/I"),
            "intencao_atual_pct": round(intencao, 1),
            "tendencia": tendencia,
            "ajuste_tendencia_pct": round(ajuste, 1),
            "potencial_indecisos_pct": round(potencial_indecisos, 1),
            "projecao_final_pct": round(projecao_final, 1),
            "rejeicao_pct": round(rejeicao, 1),
        })

    # Ordenar por projeção final
    projecoes.sort(key=lambda x: x["projecao_final_pct"], reverse=True)

    # Análise de cenário
    lider = projecoes[0] if projecoes else None
    segundo = projecoes[1] if len(projecoes) > 1 else None

    cenario = "indefinido"
    if lider:
        if lider["projecao_final_pct"] > 50:
            cenario = "vitória no primeiro turno"
        elif segundo and (
            lider["projecao_final_pct"] - segundo["projecao_final_pct"]
        ) > 10:
            cenario = "vantagem confortável, provável segundo turno"
        elif segundo and (
            lider["projecao_final_pct"] - segundo["projecao_final_pct"]
        ) < 5:
            cenario = "disputa acirrada, segundo turno provável"
        else:
            cenario = "cenário competitivo"

    resultado = {
        "data_projecao": "baseada nos dados mais recentes",
        "projecoes_candidatos": projecoes,
        "cenario_mais_provavel": cenario,
        "pct_indecisos_restante": round(pct_indecisos, 1),
        "analise": {
            "lider": lider["nome"] if lider else "N/I",
            "diferenca_para_segundo_pct": round(
                (lider["projecao_final_pct"] - segundo["projecao_final_pct"])
                if lider and segundo
                else 0,
                1,
            ),
            "probabilidade_2turno_pct": (
                85.0 if cenario.startswith("disputa")
                else 60.0 if "segundo turno" in cenario
                else 20.0 if "primeiro turno" in cenario
                else 50.0
            ),
        },
        "observacao": (
            "Projeção baseada em tendências e modelagem de transferência "
            "de votos de indecisos. Sujeita a alterações conforme novos dados."
        ),
    }

    return json.dumps(resultado, ensure_ascii=False, indent=2)
