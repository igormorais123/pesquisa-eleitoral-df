"""
Rotas de API para Chat de Inteligência Eleitoral

Endpoint proxy para a API Anthropic com a persona Dra. Helena Strategos.
Todas as interações são salvas no banco de dados para análise.

Autor: Professor Igor
"""

import logging
import os
import time
import uuid
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException, Request
from anthropic import Anthropic

from app.esquemas.chat_inteligencia import (
    ChatRequest,
    ChatResponse,
    ChatHistoricoResponse,
    ChatHistoricoItem,
    ChatAnalyticsResponse,
)
from app.modelos.interacao_chat import InteracaoChat
from app.db.session import SessionLocal

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================
# PERSONA: DRA. HELENA STRATEGOS
# ============================================

PERSONA_SYSTEM_PROMPT = """Você é a Dra. Helena Strategos, cientista política com PhD em Comportamento
Eleitoral pela UnB, mestrado em Análise de Dados Políticos por Harvard, e
15 anos de experiência assessorando campanhas vitoriosas no Brasil.

Ao iniciar uma conversa (primeira mensagem), apresente-se brevemente:
"Sou Helena Strategos, sua analista de inteligência eleitoral. Minha
especialidade é transformar dados em vantagem competitiva. Como posso
ajudar a campanha hoje?"

Seu estilo:
- OBJETIVA: vá direto ao ponto, sem rodeios
- PROFUNDA: vá além do óbvio, faça inferências que outros não fariam
- GENIAL: conecte dados aparentemente desconexos
- PRÁTICA: sempre termine com ação recomendada
- NÃO CLICHÊ: evite frases genéricas de consultoria

Ao analisar:
1. Cite números específicos dos dados quando disponíveis
2. Faça correlações temporais (evento X → impacto Y em Z dias)
3. Compare com benchmarks históricos quando possível
4. Aponte riscos que ninguém mencionou
5. Dê a recomendação que um estrategista de R$50k/mês daria

Você tem acesso aos dados completos da pesquisa embutidos no contexto.
Use-os para fundamentar cada afirmação.

IMPORTANTE: Responda sempre em português brasileiro."""

# Contexto da pesquisa INTEIA (será incorporado nas mensagens)
CONTEXTO_PESQUISA = """
DADOS DA PESQUISA INTEIA - CELINA LEÃO (GOVERNADORA DO DF)

PERÍODO: Janeiro 2024 - Janeiro 2026
FONTES: Institutos Paraná Pesquisa, Real Time Big Data, Datafolha, 100% Cidades

PRINCIPAIS DESCOBERTAS:

1. EVOLUÇÃO TEMPORAL:
- Jan/2024: Celina começou com ~15% de intenção de voto
- Dez/2025: Atingiu ~28%, liderança em algumas pesquisas
- Crescimento consistente de +13 pontos percentuais
- Maior salto: após assumir interinamente o governo (Mar-Abr/2025)

2. ANÁLISE POR INSTITUTO:
- Paraná Pesquisas: tendência a subestimar Celina em 2-3 pontos
- Real Time Big Data: mais volátil, captura oscilações rápidas
- Datafolha: mais conservador, valores medianos
- 100% Cidades: favorável à candidata

3. CORRELAÇÃO MÍDIA × VOTOS:
- Cobertura positiva na mídia precede alta de 2-4 pontos em 15-30 dias
- Menções neutras têm impacto mínimo
- Eventos do governo têm maior impacto que declarações políticas

4. EVENTOS CHAVE E IMPACTO:
- Posse como governadora interina: +5 pontos em 45 dias
- Entrega de obras do BRT: +2 pontos
- Polêmicas do Ibaneis: benefício indireto de +3 pontos
- Posicionamento sobre segurança: +2 pontos em regiões periféricas

5. PERFIL DO ELEITOR:
- Maior aprovação: mulheres 35-55 anos, classe C
- Regiões fortes: Ceilândia, Taguatinga, Samambaia
- Fraqueza: Plano Piloto, classe A, homens jovens
- Eleitores indecisos: ~20% do total

6. CONCORRENTES:
- Damares Alves: principal adversária, eleitorado evangélico
- Flávia Arruda: disputa voto feminino de centro-direita
- Leandro Grass: esquerda, sem penetração nas periferias

7. RISCOS IDENTIFICADOS:
- Dependência da imagem de Ibaneis (positiva ou negativa)
- Vulnerabilidade em pautas de saúde
- Baixo conhecimento em algumas regiões
- Necessidade de diferenciação ideológica

8. OPORTUNIDADES:
- Consolidar imagem de gestora eficiente
- Ampliar presença em mídia digital
- Eventos de entrega de obras
- Agenda feminina e de proteção social
"""

# Modelo padrão
MODELO_PADRAO = "claude-opus-4-5-20251101"

# Preços do Claude Opus 4.5 (USD por 1M tokens)
PRECO_INPUT_1M = 15.0  # $15 por 1M tokens de entrada
PRECO_OUTPUT_1M = 75.0  # $75 por 1M tokens de saída


def obter_api_key() -> str:
    """Obtém a API key do ambiente, tentando CLAUDE_API_KEY primeiro, depois CLAUDE_API_KEY2."""
    key = os.environ.get("CLAUDE_API_KEY") or os.environ.get("CLAUDE_API_KEY2")
    if not key:
        raise HTTPException(
            status_code=500,
            detail="API key do Claude não configurada no servidor"
        )
    return key


def calcular_custo(tokens_entrada: int, tokens_saida: int) -> float:
    """Calcula custo estimado em USD baseado nos tokens usados."""
    custo_entrada = (tokens_entrada / 1_000_000) * PRECO_INPUT_1M
    custo_saida = (tokens_saida / 1_000_000) * PRECO_OUTPUT_1M
    return round(custo_entrada + custo_saida, 6)


async def salvar_interacao(
    sessao_id: str,
    pergunta: str,
    resposta: str,
    modelo: str,
    tokens_entrada: int,
    tokens_saida: int,
    custo: float,
    tempo_ms: int,
    ip: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> None:
    """Salva a interação no banco de dados."""
    try:
        async with SessionLocal() as db:
            interacao = InteracaoChat(
                sessao_id=sessao_id,
                pergunta=pergunta,
                resposta=resposta,
                modelo_usado=modelo,
                tokens_entrada=tokens_entrada,
                tokens_saida=tokens_saida,
                tokens_total=tokens_entrada + tokens_saida,
                custo_estimado=custo,
                tempo_resposta_ms=tempo_ms,
                ip_origem=ip,
                user_agent=user_agent,
            )
            db.add(interacao)
            await db.commit()
            logger.info(f"Interação salva: sessao={sessao_id[:8]}, tokens={tokens_entrada + tokens_saida}")
    except Exception as e:
        logger.error(f"Erro ao salvar interação: {e}")
        # Não propaga o erro para não afetar a resposta ao usuário


# ============================================
# ENDPOINTS
# ============================================


@router.post("/", response_model=ChatResponse, summary="Enviar mensagem para Dra. Helena")
async def chat(request: ChatRequest, req: Request) -> ChatResponse:
    """
    Envia uma mensagem para a Dra. Helena Strategos, especialista em inteligência eleitoral.

    **Como funciona:**
    1. Recebe a pergunta do usuário
    2. Envia para o Claude Opus 4.5 com a persona da Dra. Helena
    3. Salva a interação no banco de dados
    4. Retorna a resposta

    **Contexto incluído:**
    A Dra. Helena tem acesso aos dados da pesquisa INTEIA sobre Celina Leão,
    incluindo evolução temporal, análise por instituto, correlações e riscos.

    **Sessão:**
    Use o mesmo `sessao_id` para manter o contexto da conversa.
    Se não fornecer, uma nova sessão será criada.
    """
    inicio = time.time()

    # Obter ou criar sessão
    sessao_id = request.sessao_id or str(uuid.uuid4())

    # Obter API key
    api_key = obter_api_key()

    # Preparar cliente Anthropic
    client = Anthropic(api_key=api_key)

    # Preparar mensagens com contexto
    mensagens = [
        {
            "role": "user",
            "content": f"""CONTEXTO DA PESQUISA:
{CONTEXTO_PESQUISA}

PERGUNTA DO USUÁRIO:
{request.pergunta}"""
        }
    ]

    try:
        # Chamar API do Claude
        response = client.messages.create(
            model=MODELO_PADRAO,
            max_tokens=4096,
            system=PERSONA_SYSTEM_PROMPT,
            messages=mensagens,
        )

        # Extrair resposta
        resposta_texto = response.content[0].text
        tokens_entrada = response.usage.input_tokens
        tokens_saida = response.usage.output_tokens

        # Calcular métricas
        tempo_ms = int((time.time() - inicio) * 1000)
        custo = calcular_custo(tokens_entrada, tokens_saida)

        # Obter IP e User-Agent
        ip = req.client.host if req.client else None
        user_agent = req.headers.get("user-agent")

        # Salvar interação (assíncrono, não bloqueia resposta)
        await salvar_interacao(
            sessao_id=sessao_id,
            pergunta=request.pergunta,
            resposta=resposta_texto,
            modelo=MODELO_PADRAO,
            tokens_entrada=tokens_entrada,
            tokens_saida=tokens_saida,
            custo=custo,
            tempo_ms=tempo_ms,
            ip=ip,
            user_agent=user_agent,
        )

        return ChatResponse(
            resposta=resposta_texto,
            sessao_id=sessao_id,
            tokens_usados=tokens_entrada + tokens_saida,
        )

    except Exception as e:
        logger.error(f"Erro na API Claude: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar sua pergunta: {str(e)}"
        )


@router.get("/historico/{sessao_id}", response_model=ChatHistoricoResponse, summary="Histórico da sessão")
async def historico_sessao(sessao_id: str) -> ChatHistoricoResponse:
    """
    Retorna o histórico de interações de uma sessão específica.

    Útil para:
    - Revisar conversas anteriores
    - Continuar uma análise interrompida
    - Exportar análises feitas pela Dra. Helena
    """
    try:
        async with SessionLocal() as db:
            from sqlalchemy import select

            stmt = select(InteracaoChat).where(
                InteracaoChat.sessao_id == sessao_id
            ).order_by(InteracaoChat.criado_em)

            result = await db.execute(stmt)
            interacoes = result.scalars().all()

            if not interacoes:
                raise HTTPException(
                    status_code=404,
                    detail="Sessão não encontrada"
                )

            items = [
                ChatHistoricoItem(
                    id=i.id,
                    pergunta=i.pergunta,
                    resposta=i.resposta,
                    criado_em=i.criado_em,
                    tokens_total=i.tokens_total,
                    custo_estimado=i.custo_estimado,
                )
                for i in interacoes
            ]

            return ChatHistoricoResponse(
                sessao_id=sessao_id,
                interacoes=items,
                total_interacoes=len(items),
                tokens_total=sum(i.tokens_total for i in items),
                custo_total=sum(i.custo_estimado for i in items),
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar histórico: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erro ao buscar histórico"
        )


@router.get("/analytics", response_model=ChatAnalyticsResponse, summary="Analytics de uso")
async def analytics() -> ChatAnalyticsResponse:
    """
    Retorna métricas de uso do chat de inteligência.

    Inclui:
    - Total de interações e sessões
    - Tokens e custos totais
    - Médias de uso
    - Distribuição temporal
    """
    try:
        async with SessionLocal() as db:
            from sqlalchemy import select, func
            from datetime import datetime, timedelta

            # Total de interações
            total_stmt = select(func.count(InteracaoChat.id))
            total_result = await db.execute(total_stmt)
            total_interacoes = total_result.scalar() or 0

            # Total de sessões únicas
            sessoes_stmt = select(func.count(func.distinct(InteracaoChat.sessao_id)))
            sessoes_result = await db.execute(sessoes_stmt)
            total_sessoes = sessoes_result.scalar() or 0

            # Totais de tokens e custo
            totais_stmt = select(
                func.sum(InteracaoChat.tokens_total),
                func.sum(InteracaoChat.custo_estimado),
                func.avg(InteracaoChat.tempo_resposta_ms),
            )
            totais_result = await db.execute(totais_stmt)
            row = totais_result.first()

            tokens_total = row[0] or 0
            custo_total = row[1] or 0.0
            media_tempo = row[2] or 0.0

            # Calcular médias
            media_tokens = tokens_total / total_interacoes if total_interacoes > 0 else 0.0

            # Interações por período
            agora = datetime.utcnow()

            # Hoje
            hoje_stmt = select(func.count(InteracaoChat.id)).where(
                InteracaoChat.criado_em >= agora.replace(hour=0, minute=0, second=0)
            )
            hoje_result = await db.execute(hoje_stmt)
            interacoes_hoje = hoje_result.scalar() or 0

            # Última semana
            semana_stmt = select(func.count(InteracaoChat.id)).where(
                InteracaoChat.criado_em >= agora - timedelta(days=7)
            )
            semana_result = await db.execute(semana_stmt)
            interacoes_semana = semana_result.scalar() or 0

            # Último mês
            mes_stmt = select(func.count(InteracaoChat.id)).where(
                InteracaoChat.criado_em >= agora - timedelta(days=30)
            )
            mes_result = await db.execute(mes_stmt)
            interacoes_mes = mes_result.scalar() or 0

            return ChatAnalyticsResponse(
                total_interacoes=total_interacoes,
                total_sessoes=total_sessoes,
                tokens_total=tokens_total,
                custo_total=float(custo_total),
                media_tokens_por_interacao=float(media_tokens),
                media_tempo_resposta_ms=float(media_tempo),
                interacoes_hoje=interacoes_hoje,
                interacoes_semana=interacoes_semana,
                interacoes_mes=interacoes_mes,
            )

    except Exception as e:
        logger.error(f"Erro ao calcular analytics: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erro ao calcular analytics"
        )
