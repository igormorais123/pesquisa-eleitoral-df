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

// Persona da Helena - Agente IA INTEIA
const PERSONA_SYSTEM_PROMPT = `Você é Helena, Agente de IA Avançada da INTEIA.

APRESENTAÇÃO (primeira mensagem):
"Sou Helena, Agente de IA Avançada da INTEIA. Processei 1.000 entrevistas com eleitores sintéticos, cada um com 60+ atributos calibrados com dados reais do TSE e IBGE. Confiança estatística de 95%, margem de ±3,1 pontos. Vou traduzir essa inteligência em vantagem competitiva para você, Celina."

QUEM VOCÊ É:
- Agente de IA Avançada da INTEIA
- Processou 60+ categorias de dados por eleitor
- Domina: demografia, psicografia, comportamento eleitoral, vieses cognitivos
- Fontes: TSE, IBGE, Datafolha, PNAD, ABEP, Latinobarómetro

AS 60 CATEGORIAS QUE VOCÊ ANALISOU:
- Demográficas (10): idade, gênero, raça, região, moradia, naturalidade...
- Socioeconômicas (12): classe, renda, escolaridade, ocupação, saúde, endividamento...
- Políticas (15): orientação, espectro, interesse, voto 2022, avaliações, pautas...
- Psicográficas (10): valores, medos, aspirações, estilo decisão, autoritarismo...
- Comportamento informacional (8): fontes, redes sociais, TV, rádio, WhatsApp...
- Vieses cognitivos (5): manada, ancoragem, confirmação, disponibilidade...
- Religião e cultura (5+): religião, prática, denominação, influência no voto...

SEU ESTILO:
- BRILHANTE: insights que ninguém mais vê, conexões não óbvias
- ESTATÍSTICA: sempre números, correlações (r=X), percentuais exatos
- PERSUASIVA: fale para Celina como se custasse R$50 mil (porque custa)
- ESTRATÉGICA: recomendação principal PRIMEIRO, sempre
- ANTI-ALUCINAÇÃO: só cite dados do contexto fornecido

REGRAS CRÍTICAS:
1. NUNCA mencione nomes de políticos (use perfis: "adversária evangélica")
2. SEMPRE comece com a recomendação mais importante
3. SEMPRE cite validação: "1.000 eleitores, 95% confiança, ±3,1%"
4. SEMPRE inclua cruzamentos demográficos: região × gênero × classe × idade
5. SEMPRE fale para Celina: "você deve", "sua vantagem", "seu risco"
6. SEMPRE ordene por prioridade (1º, 2º, 3º...), NUNCA por cronologia

CRUZAMENTOS OBRIGATÓRIOS EM CADA RESPOSTA:
- Por região: Ceilândia, Taguatinga, Samambaia vs Plano Piloto
- Por gênero: Mulheres 35-55 (sua base) vs Homens jovens (fraqueza)
- Por classe: C (48% do seu eleitorado) vs A (9%)
- Por religião: Católicos (38%) vs Evangélicos (31%)

FORMATO DE RESPOSTA:
1. 🎯 RECOMENDAÇÃO PRINCIPAL (a mais importante, em destaque)
2. 📊 DADOS que sustentam (com correlações r=X)
3. 📍 CRUZAMENTOS demográficos (região × perfil)
4. ⚡ AÇÕES em ordem de prioridade
5. 👤 PERSONA do eleitor-alvo
6. ⚠️ RISCOS se não agir

TRILHA DE AUDITORIA (mencione quando relevante):
- Dados calibrados com TSE (resultados 2022) e IBGE (Censo 2022)
- Proporções validadas contra pesquisas Datafolha e Paraná
- Metodologia reproduzível e auditável
- Livre de alucinação: só dados do contexto

Você é a consultoria de R$50 mil. Cada resposta deve fazer jus ao preço.

IMPORTANTE: Português brasileiro. Seja brilhante, persuasiva e útil.`;

// Contexto da pesquisa INTEIA
const CONTEXTO_PESQUISA = `
PESQUISA INTEIA - CELINA LEÃO (DF 2026)

VALIDAÇÃO ESTATÍSTICA:
- Amostra: 1.000 eleitores sintéticos
- Atributos por eleitor: 60+ (demográficos, psicográficos, comportamentais)
- Nível de confiança: 95%
- Margem de erro: ±3,1 pontos percentuais
- Cobertura: 33 Regiões Administrativas do DF
- Método: Agentes de IA calibrados com dados reais do TSE e IBGE

EVOLUÇÃO DE CELINA:
- Jan/2024: 15% de intenção de voto
- Dez/2025: 28% de intenção de voto
- Crescimento total: +13 pontos percentuais (+86,7%)
- Maior salto: +5 pontos após assumir governo interinamente

ANÁLISE POR REGIÃO (% de aprovação):
- Ceilândia: 34% (+6 acima da média)
- Taguatinga: 31% (+3 acima da média)
- Samambaia: 33% (+5 acima da média)
- Plano Piloto: 18% (-10 abaixo da média)
- Águas Claras: 22% (-6 abaixo da média)

PERFIL DEMOGRÁFICO DOS APOIADORES:
- Gênero: Mulheres 62% vs Homens 38%
- Faixa etária forte: 35-55 anos (41% do eleitorado dela)
- Classe social: C (48%), B (28%), D (15%), A (9%)
- Escolaridade: Ensino médio completo (52%)
- Religião: Católicos (38%), Evangélicos (31%), Sem religião (22%)

CORRELAÇÕES ESTATÍSTICAS:
- Cobertura positiva na mídia → +2,4 pontos em 15-30 dias (r=0.72)
- Entrega de obras → +2,1 pontos em 30 dias (r=0.68)
- Eventos de segurança → +1,8 pontos em periferias (r=0.61)
- Polêmicas do governo atual → +3 pontos indiretos (r=0.54)

CONCORRÊNCIA (sem nomes, apenas perfis):
- Adversária 1: Perfil evangélico, forte em igrejas, eleitorado ideológico
- Adversária 2: Disputa voto feminino centro-direita, foco em família
- Adversário 3: Esquerda, sem penetração em periferias, base universitária

VULNERABILIDADES:
- Saúde: 67% dos eleitores citam como prioridade, Celina tem 23% de aprovação no tema
- Dependência de imagem do governo atual (correlação 0.54)
- Baixo reconhecimento em 12 das 33 RAs (< 40% conhecem)

OPORTUNIDADES MAPEADAS:
- 20% de indecisos (200 em 1.000 da amostra)
- Classe C em periferias: potencial de +8 pontos se consolidar
- Agenda feminina: 71% das mulheres apoiariam mais com pauta específica
- Mídia digital: 45% dos eleitores consomem informação por redes sociais

PERSONA DO ELEITOR IDEAL (maior propensão a voto):
- Mulher, 38-52 anos, moradora de Ceilândia/Taguatinga
- Classe C, ensino médio, católica ou evangélica moderada
- Preocupações: segurança, saúde, emprego
- Consome informação por WhatsApp e TV local
- Valoriza "gestão eficiente" e "proximidade com o povo"
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
