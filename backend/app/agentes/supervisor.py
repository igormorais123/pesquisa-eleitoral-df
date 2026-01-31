"""
Supervisor do Oráculo Eleitoral — Sistema Multi-Agente LangGraph

Cria e coordena 8 agentes especializados em inteligência eleitoral.
Usa LangGraph Supervisor para roteamento automático baseado em intenção.

Agentes:
1. oraculo_dados — Consulta dados eleitorais
2. simulador — Simulações e cenários
3. estrategista — Análise estratégica (Opus)
4. memoria_viva — Busca em histórico
5. radar_social — Monitoramento de redes/notícias
6. criador_conteudo — Geração de material
7. central_cabos — Gestão de campo
8. pesquisador — Pesquisa profunda
"""

import logging
from typing import Optional

from app.core.config import configuracoes

logger = logging.getLogger(__name__)

# =============================================
# Imports dos prompts
# =============================================
from app.agentes.prompts.supervisor import PROMPT_SUPERVISOR
from app.agentes.prompts.oraculo import PROMPT_ORACULO_DADOS
from app.agentes.prompts.simulador import PROMPT_SIMULADOR
from app.agentes.prompts.estrategista import PROMPT_ESTRATEGISTA
from app.agentes.prompts.memoria import PROMPT_MEMORIA
from app.agentes.prompts.radar import PROMPT_RADAR
from app.agentes.prompts.conteudo import PROMPT_CONTEUDO
from app.agentes.prompts.cabos import PROMPT_CABOS
from app.agentes.prompts.pesquisador import PROMPT_PESQUISADOR

# =============================================
# Imports das ferramentas
# =============================================
from app.agentes.ferramentas.dados_eleitorais import (
    consultar_eleitores,
    consultar_candidatos,
    estatisticas_demograficas,
    historico_eleicoes,
)
from app.agentes.ferramentas.simulacao import (
    simular_cenario,
    simulacao_monte_carlo,
    projetar_resultado,
)
from app.agentes.ferramentas.estrategia import (
    analisar_cenario_politico,
    sugerir_acoes,
    avaliar_adversario,
)
from app.agentes.ferramentas.memoria import (
    buscar_historico,
    resumir_contexto,
    lembrar_decisao,
)
from app.agentes.ferramentas.analise_social import (
    buscar_noticias,
    analisar_sentimento,
    monitorar_candidato,
    trending_topics,
)
from app.agentes.ferramentas.conteudo import (
    gerar_post_rede_social,
    gerar_texto_whatsapp,
    gerar_slogan,
    gerar_roteiro_video,
)
from app.agentes.ferramentas.cabos import (
    listar_cabos,
    preparar_mensagem_cabos,
    relatorio_campo,
)
from app.agentes.ferramentas.pesquisa_web import (
    pesquisa_profunda,
    dossie_candidato,
    dados_tse,
    legislacao_relevante,
)
from app.agentes.ferramentas.relatorio import (
    gerar_relatorio_resumo,
    preparar_dados_pdf,
)


def criar_grafo_supervisor():
    """
    Cria o grafo supervisor LangGraph com todos os 8 agentes.

    Retorna o grafo compilado pronto para invocação.
    """
    try:
        from langchain_anthropic import ChatAnthropic
        from langgraph.prebuilt import create_react_agent
        from langgraph_supervisor import create_supervisor
    except ImportError as e:
        logger.error(f"Dependências de agentes não instaladas: {e}")
        return None

    # Modelos IA
    opus = ChatAnthropic(
        model="claude-opus-4-5-20251101",
        api_key=configuracoes.CLAUDE_API_KEY,
        max_tokens=4096,
    )
    sonnet = ChatAnthropic(
        model="claude-sonnet-4-5-20250929",
        api_key=configuracoes.CLAUDE_API_KEY,
        max_tokens=4096,
    )

    # =============================================
    # Criar agentes especializados
    # =============================================

    # 1. Oráculo de Dados (Sonnet — alto volume de consultas)
    oraculo_dados = create_react_agent(
        model=sonnet,
        tools=[
            consultar_eleitores,
            consultar_candidatos,
            estatisticas_demograficas,
            historico_eleicoes,
        ],
        name="oraculo_dados",
        prompt=PROMPT_ORACULO_DADOS,
    )

    # 2. Simulador Eleitoral (Sonnet — cálculos numéricos)
    simulador = create_react_agent(
        model=sonnet,
        tools=[
            simular_cenario,
            simulacao_monte_carlo,
            projetar_resultado,
        ],
        name="simulador",
        prompt=PROMPT_SIMULADOR,
    )

    # 3. Estrategista (Opus — raciocínio profundo)
    estrategista = create_react_agent(
        model=opus,
        tools=[
            analisar_cenario_politico,
            sugerir_acoes,
            avaliar_adversario,
        ],
        name="estrategista",
        prompt=PROMPT_ESTRATEGISTA,
    )

    # 4. Memória Viva (Sonnet — busca em histórico)
    memoria_viva = create_react_agent(
        model=sonnet,
        tools=[
            buscar_historico,
            resumir_contexto,
            lembrar_decisao,
        ],
        name="memoria_viva",
        prompt=PROMPT_MEMORIA,
    )

    # 5. Radar Social (Sonnet — monitoramento)
    radar_social = create_react_agent(
        model=sonnet,
        tools=[
            buscar_noticias,
            analisar_sentimento,
            monitorar_candidato,
            trending_topics,
        ],
        name="radar_social",
        prompt=PROMPT_RADAR,
    )

    # 6. Criador de Conteúdo (Sonnet — geração rápida)
    criador_conteudo = create_react_agent(
        model=sonnet,
        tools=[
            gerar_post_rede_social,
            gerar_texto_whatsapp,
            gerar_slogan,
            gerar_roteiro_video,
        ],
        name="criador_conteudo",
        prompt=PROMPT_CONTEUDO,
    )

    # 7. Central de Cabos (Sonnet — operações de campo)
    central_cabos = create_react_agent(
        model=sonnet,
        tools=[
            listar_cabos,
            preparar_mensagem_cabos,
            relatorio_campo,
        ],
        name="central_cabos",
        prompt=PROMPT_CABOS,
    )

    # 8. Pesquisador Profundo (Sonnet — busca e compilação)
    pesquisador = create_react_agent(
        model=sonnet,
        tools=[
            pesquisa_profunda,
            dossie_candidato,
            dados_tse,
            legislacao_relevante,
            gerar_relatorio_resumo,
            preparar_dados_pdf,
        ],
        name="pesquisador",
        prompt=PROMPT_PESQUISADOR,
    )

    # =============================================
    # Criar Supervisor (Opus — decisões de roteamento)
    # =============================================

    supervisor = create_supervisor(
        agents=[
            oraculo_dados,
            simulador,
            estrategista,
            memoria_viva,
            radar_social,
            criador_conteudo,
            central_cabos,
            pesquisador,
        ],
        model=opus,
        prompt=PROMPT_SUPERVISOR,
        output_mode="last_message",
    )

    # Compilar grafo (sem checkpointer por enquanto — adicionado via config)
    grafo = supervisor.compile()

    logger.info("Grafo supervisor LangGraph criado com 8 agentes")
    return grafo


# =============================================
# Grafo singleton (lazy initialization)
# =============================================

_grafo_supervisor = None


def obter_grafo():
    """Retorna o grafo supervisor (singleton com lazy init)"""
    global _grafo_supervisor
    if _grafo_supervisor is None:
        _grafo_supervisor = criar_grafo_supervisor()
    return _grafo_supervisor


async def invocar_supervisor(
    mensagem: str,
    telefone: str = "",
    conversa_id: Optional[int] = None,
) -> dict:
    """
    Invoca o supervisor com uma mensagem do usuário.

    Args:
        mensagem: Texto da mensagem do usuário
        telefone: Telefone do remetente (para contexto)
        conversa_id: ID da conversa (para checkpointer)

    Returns:
        {
            "resposta": str,
            "agente": str,
            "tokens_entrada": int,
            "tokens_saida": int,
            "custo": float,
        }
    """
    grafo = obter_grafo()

    if grafo is None:
        return {
            "resposta": "Sistema de agentes indisponível. Tente novamente mais tarde.",
            "agente": "erro",
            "tokens_entrada": 0,
            "tokens_saida": 0,
            "custo": 0.0,
        }

    try:
        # Config com thread_id para checkpointing
        config = {}
        if conversa_id:
            config = {"configurable": {"thread_id": str(conversa_id)}}

        # Invocar o grafo
        resultado = await grafo.ainvoke(
            {"messages": [{"role": "user", "content": mensagem}]},
            config=config,
        )

        # Extrair resposta do resultado
        messages = resultado.get("messages", [])
        resposta = ""
        agente_usado = "supervisor"

        if messages:
            ultima_msg = messages[-1]
            if hasattr(ultima_msg, "content"):
                resposta = ultima_msg.content
            elif isinstance(ultima_msg, dict):
                resposta = ultima_msg.get("content", "")

            # Tentar identificar qual agente respondeu
            if hasattr(ultima_msg, "name") and ultima_msg.name:
                agente_usado = ultima_msg.name

        # Estimar tokens e custo
        tokens_est = len(mensagem.split()) * 2  # estimativa entrada
        tokens_saida_est = len(resposta.split()) * 2  # estimativa saída

        # Custo estimado (Opus input: $15/M, output: $75/M)
        custo_usd = (tokens_est * 15 + tokens_saida_est * 75) / 1_000_000
        custo_brl = custo_usd * 6.0  # câmbio aproximado

        return {
            "resposta": resposta or "Não foi possível gerar uma resposta.",
            "agente": agente_usado,
            "tokens_entrada": tokens_est,
            "tokens_saida": tokens_saida_est,
            "custo": custo_brl,
        }

    except Exception as e:
        logger.error(f"Erro ao invocar supervisor: {e}", exc_info=True)
        return {
            "resposta": "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
            "agente": "erro",
            "tokens_entrada": 0,
            "tokens_saida": 0,
            "custo": 0.0,
        }
