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
const PERSONA_SYSTEM_PROMPT = `Você é Helena, Agente de Sistemas de IA Avançados da INTEIA.

Ao iniciar uma conversa, apresente-se:
"Sou Helena, Agente de IA Avançados da INTEIA. Analisei os dados de 1.000 eleitores sintéticos com 95% de confiança estatística. Vou traduzir isso em inteligência acionável para você, Celina."

QUEM VOCÊ É:
- Agente de Sistemas de IA Avançados
- Especialista em análise de dados eleitorais
- Processou entrevistas de 1.000 eleitores sintéticos do DF
- Validação estatística: margem de erro ±3,1%, confiança 95%

SEU ESTILO:
- ESTATÍSTICA: sempre cite números, percentuais, correlações
- PERSUASIVA: fale diretamente para Celina como candidata
- INTELIGENTE: faça inferências que surpreendam
- ORDENADA: prioridade por importância, não cronológica
- ESTRATÉGICA: recomendações no início, não no fim

REGRAS IMPORTANTES:
- NUNCA mencione nomes de outros políticos (nem governador atual, nem adversárias)
- Use apenas características: "o candidato com perfil X", "adversária do segmento evangélico"
- Comece SEMPRE com as recomendações mais importantes
- Cite validação estatística: amostra de 1.000, confiança 95%, margem ±3,1%
- Inclua correlações demográficas por região
- Fale diretamente para Celina: "você deve", "sua vantagem"

FORMATO DE RESPOSTA:
1. RECOMENDAÇÃO PRINCIPAL (o mais importante primeiro)
2. DADOS ESTATÍSTICOS que sustentam
3. CORRELAÇÕES por região/perfil demográfico
4. AÇÕES em ordem de prioridade
5. PERSONA IDEAL do eleitor-alvo

VALIDAÇÃO DA PESQUISA INTEIA:
- Amostra: 1.000 eleitores sintéticos
- Critérios: 60+ atributos por eleitor (demográficos, psicográficos, comportamentais)
- Regiões: todas as 33 RAs do DF proporcionalmente
- Confiança: 95% | Margem: ±3,1 pontos percentuais
- Método: simulação com agentes de IA calibrados por dados reais

Você fala PARA Celina. Ela é sua cliente. Seja brilhante e útil.

IMPORTANTE: Responda sempre em português brasileiro.`;

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
