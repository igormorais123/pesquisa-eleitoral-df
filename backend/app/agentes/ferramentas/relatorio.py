"""
Ferramentas de geração de relatórios eleitorais.

Gera relatórios resumidos e prepara dados estruturados para
exportação em PDF e outros formatos.
"""

import json
from datetime import datetime, timedelta
from langchain_core.tools import tool


@tool
def gerar_relatorio_resumo(dados: str) -> str:
    """Gera um relatório resumido formatado a partir de dados eleitorais.

    Recebe dados brutos (texto ou JSON) e produz um relatório estruturado
    com análise, destaques, métricas-chave e recomendações, pronto para
    apresentação ou compartilhamento.

    Args:
        dados: Dados para compor o relatório. Pode ser texto descritivo
            ou string JSON com dados estruturados.
            Exemplos:
            - "Pesquisa mostra candidato A com 35%, candidato B com 28%..."
            - '{"candidatos": [{"nome": "A", "intencao": 35}], "data": "2026-01-30"}'

    Returns:
        String JSON com relatório estruturado contendo sumário executivo,
        análise dos dados, métricas-chave, gráficos sugeridos e
        recomendações de ação.
    """
    agora = datetime.now()

    # Tentar parsear dados como JSON
    dados_json = None
    if dados.strip().startswith("{") or dados.strip().startswith("["):
        try:
            dados_json = json.loads(dados)
        except json.JSONDecodeError:
            pass

    # Estrutura do relatório
    relatorio = {
        "cabecalho": {
            "titulo": "Relatório Eleitoral - Oráculo Eleitoral",
            "subtitulo": "Análise Consolidada",
            "data_geracao": agora.strftime("%d/%m/%Y %H:%M"),
            "periodo_referencia": (
                f"{(agora - timedelta(days=7)).strftime('%d/%m/%Y')} "
                f"a {agora.strftime('%d/%m/%Y')}"
            ),
            "classificacao": "Confidencial - Uso Interno da Campanha",
        },
        "sumario_executivo": {
            "descricao": (
                "Resumo executivo dos principais indicadores e movimentações "
                "do período, baseado nos dados fornecidos."
            ),
            "dados_analisados": (
                dados_json if dados_json
                else {"texto_recebido": dados[:500]}
            ),
            "destaques": [
                "[Destaque 1 - principal achado dos dados]",
                "[Destaque 2 - tendência identificada]",
                "[Destaque 3 - ponto de atenção]",
            ],
        },
        "metricas_chave": {
            "kpis": [
                {
                    "indicador": "Intenção de Voto",
                    "valor": "[Extrair dos dados]",
                    "tendencia": "[Calcular tendência]",
                    "meta": "[Definir meta]",
                },
                {
                    "indicador": "Taxa de Rejeição",
                    "valor": "[Extrair dos dados]",
                    "tendencia": "[Calcular tendência]",
                    "meta": "[Definir meta]",
                },
                {
                    "indicador": "Conhecimento Espontâneo",
                    "valor": "[Extrair dos dados]",
                    "tendencia": "[Calcular tendência]",
                    "meta": "[Definir meta]",
                },
                {
                    "indicador": "Engajamento Digital",
                    "valor": "[Extrair dos dados]",
                    "tendencia": "[Calcular tendência]",
                    "meta": "[Definir meta]",
                },
            ],
        },
        "analise_detalhada": {
            "cenario_politico": (
                "[Análise do cenário político com base nos dados fornecidos]"
            ),
            "intencao_voto": {
                "descricao": "[Análise da intenção de voto]",
                "comparativo_anterior": "[Comparação com período anterior]",
            },
            "segmentacao": {
                "por_regiao": "[Análise por região administrativa]",
                "por_perfil": "[Análise por perfil demográfico]",
            },
            "comunicacao": {
                "redes_sociais": "[Desempenho em redes sociais]",
                "campo": "[Operações de campo]",
            },
        },
        "graficos_sugeridos": [
            {
                "tipo": "barras_horizontais",
                "titulo": "Intenção de Voto por Candidato",
                "dados": "Percentual por candidato",
            },
            {
                "tipo": "pizza",
                "titulo": "Distribuição do Eleitorado por Região",
                "dados": "Eleitores por região administrativa",
            },
            {
                "tipo": "linha_temporal",
                "titulo": "Evolução da Intenção de Voto",
                "dados": "Série temporal de pesquisas",
            },
            {
                "tipo": "mapa_calor",
                "titulo": "Mapa de Calor por Região do DF",
                "dados": "Intenção de voto por região",
            },
        ],
        "recomendacoes": [
            {
                "prioridade": "Alta",
                "acao": "[Recomendação 1 baseada nos dados]",
                "responsavel": "[Área responsável]",
                "prazo": "[Prazo sugerido]",
            },
            {
                "prioridade": "Média",
                "acao": "[Recomendação 2 baseada nos dados]",
                "responsavel": "[Área responsável]",
                "prazo": "[Prazo sugerido]",
            },
            {
                "prioridade": "Baixa",
                "acao": "[Recomendação 3 baseada nos dados]",
                "responsavel": "[Área responsável]",
                "prazo": "[Prazo sugerido]",
            },
        ],
        "proximos_passos": [
            "Agendar reunião de alinhamento estratégico",
            "Atualizar dados com próxima pesquisa",
            "Implementar ações prioritárias imediatamente",
            "Revisar relatório na próxima semana",
        ],
        "rodape": {
            "elaborado_por": "Oráculo Eleitoral - Sistema de Inteligência",
            "contato": "Equipe de dados e estratégia",
            "aviso_legal": (
                "Este relatório é confidencial e destinado exclusivamente "
                "ao uso interno da campanha. A reprodução ou distribuição "
                "não autorizada é proibida."
            ),
        },
    }

    return json.dumps(relatorio, ensure_ascii=False, indent=2)


@tool
def preparar_dados_pdf(tipo: str = "semanal") -> str:
    """Prepara dados estruturados para geração de relatório em PDF.

    Organiza e formata dados eleitorais em uma estrutura otimizada
    para renderização em PDF, incluindo seções, tabelas, gráficos
    e formatação adequada para impressão.

    Args:
        tipo: Tipo de relatório PDF a ser preparado. Opções:
            "semanal" (padrão) - resumo da semana,
            "mensal" - consolidação mensal,
            "pesquisa" - resultados de pesquisa eleitoral,
            "campo" - relatório de operações de campo,
            "executivo" - resumo executivo para liderança.

    Returns:
        String JSON com dados estruturados prontos para template PDF,
        incluindo seções, tabelas, configurações de layout e metadados.
    """
    agora = datetime.now()

    tipos_config = {
        "semanal": {
            "titulo": "Relatório Semanal de Campanha",
            "periodo": (
                f"{(agora - timedelta(days=7)).strftime('%d/%m/%Y')} "
                f"a {agora.strftime('%d/%m/%Y')}"
            ),
            "secoes": [
                "Sumário Executivo",
                "Intenção de Voto",
                "Análise de Regiões",
                "Operações de Campo",
                "Comunicação Digital",
                "Próximos Passos",
            ],
        },
        "mensal": {
            "titulo": "Relatório Mensal Consolidado",
            "periodo": (
                f"{(agora - timedelta(days=30)).strftime('%d/%m/%Y')} "
                f"a {agora.strftime('%d/%m/%Y')}"
            ),
            "secoes": [
                "Sumário Executivo",
                "Evolução da Intenção de Voto",
                "Análise Comparativa",
                "Desempenho por Região",
                "Análise de Adversários",
                "Comunicação e Mídias",
                "Operações de Campo",
                "Financeiro Resumido",
                "Planejamento Próximo Mês",
            ],
        },
        "pesquisa": {
            "titulo": "Relatório de Pesquisa Eleitoral",
            "periodo": agora.strftime("%d/%m/%Y"),
            "secoes": [
                "Ficha Técnica da Pesquisa",
                "Intenção de Voto Estimulada",
                "Intenção de Voto Espontânea",
                "Rejeição",
                "Avaliação do Governo Atual",
                "Análise por Segmento",
                "Análise por Região",
                "Cruzamentos Relevantes",
                "Conclusões e Recomendações",
            ],
        },
        "campo": {
            "titulo": "Relatório de Operações de Campo",
            "periodo": (
                f"{(agora - timedelta(days=7)).strftime('%d/%m/%Y')} "
                f"a {agora.strftime('%d/%m/%Y')}"
            ),
            "secoes": [
                "Resumo de Atividades",
                "Cobertura por Região",
                "Desempenho dos Cabos Eleitorais",
                "Contatos Realizados",
                "Demandas Coletadas",
                "Alertas e Ocorrências",
                "Planejamento Próxima Semana",
            ],
        },
        "executivo": {
            "titulo": "Resumo Executivo para Liderança",
            "periodo": agora.strftime("%d/%m/%Y"),
            "secoes": [
                "Cenário Atual em 1 Página",
                "KPIs Principais",
                "Pontos de Atenção",
                "Decisões Necessárias",
            ],
        },
    }

    config = tipos_config.get(tipo, tipos_config["semanal"])

    resultado = {
        "metadados_pdf": {
            "tipo_relatorio": tipo,
            "titulo": config["titulo"],
            "periodo": config["periodo"],
            "data_geracao": agora.strftime("%d/%m/%Y %H:%M"),
            "autor": "Oráculo Eleitoral - Sistema de Inteligência",
            "classificacao": "CONFIDENCIAL",
            "versao": "1.0",
        },
        "layout": {
            "formato": "A4",
            "orientacao": "retrato",
            "margens_cm": {
                "topo": 2.5,
                "base": 2.5,
                "esquerda": 2.0,
                "direita": 2.0,
            },
            "fonte_principal": "Helvetica",
            "fonte_titulos": "Helvetica-Bold",
            "cores": {
                "primaria": "#1a365d",
                "secundaria": "#2d5aa0",
                "acento": "#e53e3e",
                "texto": "#2d3748",
                "fundo_cabecalho": "#edf2f7",
            },
        },
        "estrutura_secoes": config["secoes"],
        "dados_secoes": {
            secao: {
                "titulo": secao,
                "conteudo": (
                    f"[Dados para seção '{secao}' devem ser preenchidos]"
                ),
                "tabelas": [],
                "graficos": [],
            }
            for secao in config["secoes"]
        },
        "tabelas_modelo": [
            {
                "id": "intencao_voto",
                "titulo": "Intenção de Voto por Candidato",
                "colunas": ["Candidato", "Partido", "%", "Variação"],
                "dados": "[Preencher com dados reais]",
            },
            {
                "id": "regioes",
                "titulo": "Desempenho por Região Administrativa",
                "colunas": ["Região", "Eleitores", "Intenção %", "Variação"],
                "dados": "[Preencher com dados reais]",
            },
        ],
        "elementos_visuais": [
            {
                "tipo": "logo_campanha",
                "posicao": "cabecalho_direita",
                "arquivo": "[Caminho do logo]",
            },
            {
                "tipo": "marca_dagua",
                "texto": "CONFIDENCIAL",
                "opacidade": 0.1,
            },
        ],
        "rodape_paginas": {
            "esquerda": config["titulo"],
            "centro": "Página {pagina} de {total}",
            "direita": agora.strftime("%d/%m/%Y"),
        },
        "instrucoes_geracao": (
            "Utilize estes dados estruturados com um gerador de PDF "
            "(ReportLab, WeasyPrint ou similar) para criar o documento "
            "final. Os campos marcados com colchetes devem ser preenchidos "
            "com dados reais antes da geração."
        ),
    }

    return json.dumps(resultado, ensure_ascii=False, indent=2)
