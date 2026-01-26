/**
 * API Route: Chat Inteligencia - Dra. Helena Strategos
 *
 * Endpoint proxy para a API Anthropic com persona especializada em
 * inteligência eleitoral. Persiste interações no Vercel Postgres.
 *
 * POST /api/chat-inteligencia
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Configurações
const MODELO_PADRAO = 'claude-opus-4-5-20251101';
const MAX_TOKENS = 4096;

// Preços do Claude Opus 4.5 (USD por 1M tokens)
const PRECO_INPUT_1M = 15.0;
const PRECO_OUTPUT_1M = 75.0;

// Persona da Helena - Analista INTEIA
const PERSONA_SYSTEM_PROMPT = `Você é Helena, analista de inteligência eleitoral da INTEIA.

Ao iniciar uma conversa, apresente-se:
"Sou Helena, analista da INTEIA. Vou te ajudar a transformar esses dados em ações práticas para a campanha da Celina."

SEU ESTILO:
- ESTATÍSTICA: sempre cite números, percentuais, variações
- DIRETA: vá ao ponto, sem enrolação
- APLICADA: foque em ações práticas para Celina Leão
- ORDENADA: liste por prioridade/importância, sem dividir por dias ou cronogramas
- PROFUNDA: faça inferências que outros não fariam

REGRAS DE FORMATO:
- NÃO use cronogramas tipo "Dias 1-30", "Semana 1", etc.
- ORDENE por importância ou prioridade (1º, 2º, 3º...)
- SEMPRE inclua estatísticas: "+X pontos", "Y%", "de Z para W"
- Cite os dados da pesquisa INTEIA para embasar
- Foque na aplicação prática para a candidata Celina

AO ANALISAR:
1. Comece com o dado estatístico mais relevante
2. Faça correlações com números (evento X → +Y pontos)
3. Compare variações percentuais entre períodos
4. Liste ações em ordem de prioridade (não cronológica)
5. Termine com a recomendação mais importante

Você tem acesso aos dados completos da pesquisa INTEIA sobre Celina Leão.
Use estatísticas para fundamentar cada afirmação.

IMPORTANTE: Responda sempre em português brasileiro.`;

// Contexto da pesquisa INTEIA
const CONTEXTO_PESQUISA = `
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
`;

interface ChatRequest {
  pergunta: string;
  sessao_id?: string;
}

interface ChatResponse {
  resposta: string;
  sessao_id: string;
  tokens_usados?: number;
}

function calcularCusto(tokensEntrada: number, tokensSaida: number): number {
  const custoEntrada = (tokensEntrada / 1_000_000) * PRECO_INPUT_1M;
  const custoSaida = (tokensSaida / 1_000_000) * PRECO_OUTPUT_1M;
  return Number((custoEntrada + custoSaida).toFixed(6));
}

function gerarSessaoId(): string {
  return crypto.randomUUID();
}

// Headers CORS para permitir requisições do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handler para preflight requests (OPTIONS)
export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse | { error: string }>> {
  const inicio = Date.now();

  try {
    // Verificar API key
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key do Claude não configurada no servidor' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Parse do body
    const body: ChatRequest = await request.json();
    const { pergunta, sessao_id } = body;

    if (!pergunta || pergunta.trim().length === 0) {
      return NextResponse.json(
        { error: 'Pergunta é obrigatória' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Gerar ou usar sessão existente
    const sessaoId = sessao_id || gerarSessaoId();

    // Criar cliente Anthropic
    const client = new Anthropic({ apiKey });

    // Preparar mensagem com contexto
    const mensagemUsuario = `CONTEXTO DA PESQUISA:
${CONTEXTO_PESQUISA}

PERGUNTA DO USUÁRIO:
${pergunta}`;

    // Chamar API do Claude
    const response = await client.messages.create({
      model: MODELO_PADRAO,
      max_tokens: MAX_TOKENS,
      system: PERSONA_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: mensagemUsuario,
        },
      ],
    });

    // Extrair resposta
    const respostaTexto = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    const tokensEntrada = response.usage.input_tokens;
    const tokensSaida = response.usage.output_tokens;
    const tokensTotal = tokensEntrada + tokensSaida;
    const tempoMs = Date.now() - inicio;
    const custo = calcularCusto(tokensEntrada, tokensSaida);

    // Log para analytics (em produção, salvar no banco)
    console.log(JSON.stringify({
      type: 'chat_inteligencia',
      sessao_id: sessaoId,
      tokens_entrada: tokensEntrada,
      tokens_saida: tokensSaida,
      tokens_total: tokensTotal,
      custo_usd: custo,
      tempo_ms: tempoMs,
      timestamp: new Date().toISOString(),
    }));

    // TODO: Persistir no Vercel Postgres quando configurado
    // await sql`INSERT INTO interacoes_chat ...`

    return NextResponse.json({
      resposta: respostaTexto,
      sessao_id: sessaoId,
      tokens_usados: tokensTotal,
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Erro no chat-inteligencia:', error);

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

    return NextResponse.json(
      { error: `Erro ao processar sua pergunta: ${errorMessage}` },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Configuração para Vercel Edge (opcional, mais rápido)
// export const runtime = 'edge';

// Configuração padrão (Node.js runtime)
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 segundos para respostas longas do Opus
