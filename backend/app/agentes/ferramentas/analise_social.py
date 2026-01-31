"""
Ferramentas de análise de mídias sociais e monitoramento.

Fornece busca de notícias, análise de sentimento, monitoramento
de candidatos e identificação de trending topics.
Nota: Algumas ferramentas retornam dados simulados (placeholders)
até integração com APIs reais.
"""

import json
from datetime import datetime, timedelta
from langchain_core.tools import tool


@tool
def buscar_noticias(query: str) -> str:
    """Busca notícias recentes relacionadas a um tema político ou eleitoral.

    Pesquisa em fontes de notícias por matérias, reportagens e publicações
    relevantes para o contexto eleitoral do DF.

    NOTA: Atualmente retorna dados simulados. Será integrado com APIs de
    notícias (Google News, NewsAPI) em versão futura.

    Args:
        query: Termo de busca para pesquisar notícias. Pode ser nome de
            candidato, tema político, partido ou evento.
            Exemplos: "eleições DF 2026", "debate governador", "saúde pública DF".

    Returns:
        String JSON com lista de notícias encontradas incluindo título,
        fonte, data de publicação, resumo e relevância.
    """
    # Dados simulados - em produção será integrado com APIs de notícias
    agora = datetime.now()

    noticias_simuladas = [
        {
            "titulo": f"Pesquisa eleitoral aponta cenário competitivo no DF - '{query}'",
            "fonte": "Correio Braziliense",
            "data_publicacao": (agora - timedelta(hours=3)).isoformat(),
            "resumo": (
                f"Nova pesquisa de intenção de voto sobre '{query}' "
                "mostra disputa acirrada entre os principais candidatos ao "
                "governo do Distrito Federal nas próximas eleições."
            ),
            "url": "https://exemplo.com/noticia-1",
            "relevancia": "alta",
        },
        {
            "titulo": f"Candidatos debatem propostas sobre '{query}' para o DF",
            "fonte": "Metrópoles",
            "data_publicacao": (agora - timedelta(hours=12)).isoformat(),
            "resumo": (
                f"Em evento recente, candidatos apresentaram propostas "
                f"relacionadas a '{query}' para o Distrito Federal, "
                "com destaque para temas de infraestrutura e serviços públicos."
            ),
            "url": "https://exemplo.com/noticia-2",
            "relevancia": "média",
        },
        {
            "titulo": f"Análise: O impacto de '{query}' na corrida eleitoral do DF",
            "fonte": "Poder360",
            "data_publicacao": (agora - timedelta(days=1)).isoformat(),
            "resumo": (
                f"Colunista analisa como o tema '{query}' pode influenciar "
                "o voto dos eleitores do Distrito Federal e quais candidatos "
                "se beneficiam do cenário atual."
            ),
            "url": "https://exemplo.com/noticia-3",
            "relevancia": "média",
        },
        {
            "titulo": f"Redes sociais repercutem '{query}' entre eleitores do DF",
            "fonte": "UOL",
            "data_publicacao": (agora - timedelta(days=2)).isoformat(),
            "resumo": (
                f"O assunto '{query}' ganhou destaque nas redes sociais "
                "com milhares de menções de eleitores do Distrito Federal "
                "debatendo o tema e seus desdobramentos eleitorais."
            ),
            "url": "https://exemplo.com/noticia-4",
            "relevancia": "baixa",
        },
    ]

    resultado = {
        "query": query,
        "total_resultados": len(noticias_simuladas),
        "noticias": noticias_simuladas,
        "aviso": (
            "DADOS SIMULADOS - Integração com APIs de notícias reais "
            "pendente. Os resultados acima são exemplos de formato."
        ),
    }

    return json.dumps(resultado, ensure_ascii=False, indent=2)


@tool
def analisar_sentimento(textos: str) -> str:
    """Analisa o sentimento de textos relacionados ao contexto eleitoral.

    Avalia o tom (positivo, negativo, neutro) de textos coletados de
    redes sociais, notícias ou mensagens, fornecendo uma visão geral
    do sentimento público sobre um tema.

    Args:
        textos: Textos para análise de sentimento, separados por '|||'.
            Podem ser comentários de redes sociais, trechos de notícias
            ou mensagens coletadas.
            Exemplo: "Ótima proposta do candidato|||Não concordo com essa medida"

    Returns:
        String JSON com análise de sentimento para cada texto e resumo
        geral, incluindo distribuição percentual positivo/negativo/neutro.
    """
    # Separar textos
    lista_textos = [t.strip() for t in textos.split("|||") if t.strip()]

    if not lista_textos:
        return json.dumps(
            {"erro": "Nenhum texto fornecido para análise."},
            ensure_ascii=False,
        )

    # Análise de sentimento simplificada baseada em palavras-chave
    # Em produção, usar modelo de NLP (ex: transformers, TextBlob)
    palavras_positivas = {
        "bom", "ótimo", "excelente", "aprovado", "apoio", "concordo",
        "parabéns", "melhor", "positivo", "sucesso", "vitória",
        "esperança", "confiança", "progresso", "avanço", "feliz",
        "proposta", "solução", "inovação", "qualidade",
    }
    palavras_negativas = {
        "ruim", "péssimo", "horrível", "reprovado", "contra", "discordo",
        "vergonha", "pior", "negativo", "fracasso", "derrota",
        "medo", "desconfiança", "retrocesso", "problema", "triste",
        "corrupção", "mentira", "escândalo", "decepção",
    }

    analises = []
    contagem = {"positivo": 0, "negativo": 0, "neutro": 0}

    for texto in lista_textos:
        palavras = texto.lower().split()

        score_pos = sum(1 for p in palavras if p in palavras_positivas)
        score_neg = sum(1 for p in palavras if p in palavras_negativas)

        if score_pos > score_neg:
            sentimento = "positivo"
            confianca = min(0.9, 0.5 + (score_pos - score_neg) * 0.1)
        elif score_neg > score_pos:
            sentimento = "negativo"
            confianca = min(0.9, 0.5 + (score_neg - score_pos) * 0.1)
        else:
            sentimento = "neutro"
            confianca = 0.5

        contagem[sentimento] += 1

        analises.append({
            "texto": texto[:100] + "..." if len(texto) > 100 else texto,
            "sentimento": sentimento,
            "confianca": round(confianca, 2),
            "palavras_chave_positivas": [
                p for p in palavras if p in palavras_positivas
            ],
            "palavras_chave_negativas": [
                p for p in palavras if p in palavras_negativas
            ],
        })

    total = len(lista_textos)
    resultado = {
        "total_textos_analisados": total,
        "resumo_sentimento": {
            "positivo_pct": round((contagem["positivo"] / total) * 100, 1),
            "negativo_pct": round((contagem["negativo"] / total) * 100, 1),
            "neutro_pct": round((contagem["neutro"] / total) * 100, 1),
        },
        "contagem": contagem,
        "analises_individuais": analises,
        "observacao": (
            "Análise de sentimento baseada em palavras-chave (heurística). "
            "Para maior precisão, será integrado com modelo de NLP "
            "em versão futura."
        ),
    }

    return json.dumps(resultado, ensure_ascii=False, indent=2)


@tool
def monitorar_candidato(nome: str) -> str:
    """Monitora menções e repercussão de um candidato nas mídias e redes sociais.

    Coleta e analisa menções a um candidato em redes sociais, portais de
    notícias e outros canais digitais, fornecendo visão geral de presença
    digital e sentimento público.

    NOTA: Atualmente retorna dados simulados. Será integrado com APIs de
    monitoramento em versão futura.

    Args:
        nome: Nome do candidato a ser monitorado. Pode ser nome completo
            ou nome de urna.
            Exemplo: "João Silva" ou "João do Povo".

    Returns:
        String JSON com relatório de monitoramento incluindo volume de
        menções, sentimento geral, principais canais, temas associados
        e evolução temporal.
    """
    agora = datetime.now()

    # Dados simulados de monitoramento
    resultado = {
        "candidato": nome,
        "periodo_monitoramento": {
            "inicio": (agora - timedelta(days=7)).isoformat(),
            "fim": agora.isoformat(),
        },
        "metricas_gerais": {
            "total_mencoes": 4_523,
            "mencoes_por_dia_media": 646,
            "variacao_semana_anterior_pct": 12.5,
            "alcance_estimado": 850_000,
        },
        "sentimento": {
            "positivo_pct": 38.5,
            "negativo_pct": 22.0,
            "neutro_pct": 39.5,
            "tendencia": "melhora gradual",
        },
        "canais_principais": [
            {
                "canal": "Twitter/X",
                "mencoes": 1_850,
                "sentimento_predominante": "neutro",
            },
            {
                "canal": "Instagram",
                "mencoes": 1_200,
                "sentimento_predominante": "positivo",
            },
            {
                "canal": "Facebook",
                "mencoes": 780,
                "sentimento_predominante": "misto",
            },
            {
                "canal": "Portais de notícia",
                "mencoes": 450,
                "sentimento_predominante": "neutro",
            },
            {
                "canal": "WhatsApp (estimado)",
                "mencoes": 243,
                "sentimento_predominante": "positivo",
            },
        ],
        "temas_mais_associados": [
            {"tema": "saúde", "frequencia": 320},
            {"tema": "educação", "frequencia": 285},
            {"tema": "segurança", "frequencia": 210},
            {"tema": "transporte", "frequencia": 180},
            {"tema": "emprego", "frequencia": 150},
        ],
        "evolucao_diaria": [
            {"dia": (agora - timedelta(days=i)).strftime("%Y-%m-%d"),
             "mencoes": 500 + (i * 50) + ((-1) ** i * 30)}
            for i in range(7, 0, -1)
        ],
        "alertas": [
            {
                "tipo": "pico_mencoes",
                "descricao": "Volume acima da média detectado nas últimas 24h",
                "severidade": "info",
            },
        ],
        "aviso": (
            "DADOS SIMULADOS - Integração com APIs de monitoramento social "
            "pendente. Os dados acima são exemplos de formato."
        ),
    }

    return json.dumps(resultado, ensure_ascii=False, indent=2)


@tool
def trending_topics(regiao: str = "DF") -> str:
    """Identifica tópicos em alta relacionados à política e eleições.

    Lista os assuntos mais discutidos e compartilhados nas redes sociais
    e mídia, com foco no contexto político e eleitoral da região.

    NOTA: Atualmente retorna dados simulados. Será integrado com APIs
    de tendências em versão futura.

    Args:
        regiao: Região para filtrar trending topics. Padrão: "DF".
            Pode ser uma região administrativa específica ou "Brasil"
            para tendências nacionais.

    Returns:
        String JSON com lista de tópicos em alta, incluindo ranking,
        volume de menções, variação e relevância eleitoral.
    """
    agora = datetime.now()

    # Dados simulados de trending topics
    topicos = [
        {
            "posicao": 1,
            "topico": "Eleições DF 2026",
            "mencoes": 15_200,
            "variacao_24h_pct": 45.0,
            "relevancia_eleitoral": "alta",
            "hashtags": ["#EleiçõesDF", "#DF2026"],
        },
        {
            "posicao": 2,
            "topico": "Debate candidatos governador",
            "mencoes": 8_700,
            "variacao_24h_pct": 120.0,
            "relevancia_eleitoral": "alta",
            "hashtags": ["#DebateDF", "#GovernadorDF"],
        },
        {
            "posicao": 3,
            "topico": "Transporte público DF",
            "mencoes": 6_300,
            "variacao_24h_pct": 25.0,
            "relevancia_eleitoral": "média",
            "hashtags": ["#TransporteDF", "#BRT"],
        },
        {
            "posicao": 4,
            "topico": "Saúde pública Distrito Federal",
            "mencoes": 5_100,
            "variacao_24h_pct": 15.0,
            "relevancia_eleitoral": "média",
            "hashtags": ["#SaúdeDF", "#HospitaisDF"],
        },
        {
            "posicao": 5,
            "topico": "Segurança Ceilândia",
            "mencoes": 4_800,
            "variacao_24h_pct": 60.0,
            "relevancia_eleitoral": "alta",
            "hashtags": ["#SegurançaDF", "#Ceilândia"],
        },
        {
            "posicao": 6,
            "topico": "Pesquisa eleitoral",
            "mencoes": 3_900,
            "variacao_24h_pct": 35.0,
            "relevancia_eleitoral": "alta",
            "hashtags": ["#PesquisaEleitoral", "#IntençãoDeVoto"],
        },
        {
            "posicao": 7,
            "topico": "Educação pública DF",
            "mencoes": 3_200,
            "variacao_24h_pct": 10.0,
            "relevancia_eleitoral": "média",
            "hashtags": ["#EducaçãoDF"],
        },
        {
            "posicao": 8,
            "topico": "Emprego e renda DF",
            "mencoes": 2_800,
            "variacao_24h_pct": 8.0,
            "relevancia_eleitoral": "média",
            "hashtags": ["#EmpregoDF", "#Renda"],
        },
        {
            "posicao": 9,
            "topico": "Moradia popular",
            "mencoes": 2_100,
            "variacao_24h_pct": 20.0,
            "relevancia_eleitoral": "baixa",
            "hashtags": ["#MoradiaDF", "#HabitaçãoPopular"],
        },
        {
            "posicao": 10,
            "topico": "Meio ambiente Brasília",
            "mencoes": 1_500,
            "variacao_24h_pct": 5.0,
            "relevancia_eleitoral": "baixa",
            "hashtags": ["#MeioAmbienteDF", "#Cerrado"],
        },
    ]

    resultado = {
        "regiao": regiao,
        "data_consulta": agora.isoformat(),
        "total_topicos": len(topicos),
        "topicos": topicos,
        "insights": {
            "tema_dominante": "Eleições e debate político",
            "sentimento_geral": "Engajamento crescente com temas eleitorais",
            "oportunidade": (
                "Temas de segurança e transporte com alta variação - "
                "janela para posicionamento."
            ),
        },
        "aviso": (
            "DADOS SIMULADOS - Integração com APIs de tendências "
            "(Twitter/X API, Google Trends) pendente."
        ),
    }

    return json.dumps(resultado, ensure_ascii=False, indent=2)
