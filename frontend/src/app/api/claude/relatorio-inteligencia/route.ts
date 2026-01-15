import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { RespostaEleitor } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutos para análise profunda

// Custos Opus 4.5 (USD por 1M tokens)
const CUSTOS_OPUS = { input: 15.0, output: 75.0 };
const TAXA_USD_BRL = 6.0;

interface RequestBody {
  sessaoId: string;
  titulo: string;
  perguntas: Array<{ id: string; texto: string; tipo: string }>;
  respostas: RespostaEleitor[];
  estatisticas: {
    totalRespostas: number;
    custoTotal: number;
    sentimentos: Record<string, number>;
  };
}

interface RelatorioInteligencia {
  sumarioExecutivo: {
    titulo: string;
    dataCriacao: string;
    totalEntrevistados: number;
    conclusaoPrincipal: string;
    nivelAlerta: 'baixo' | 'moderado' | 'alto' | 'critico';
  };
  analiseEstrategica: {
    panoramaGeral: string;
    fortalezas: string[];
    vulnerabilidades: string[];
    oportunidades: string[];
    ameacas: string[];
  };
  perfisPsicograficos: Array<{
    segmento: string;
    percentual: number;
    caracteristicas: string[];
    gatilhosEmocionais: string[];
    mensagensEficazes: string[];
    errosEvitar: string[];
  }>;
  votoSilencioso: {
    estimativaPercentual: number;
    perfilTipico: string;
    indicadoresIdentificacao: string[];
    estrategiasConversao: string[];
    riscos: string[];
  };
  pontosRuptura: Array<{
    grupo: string;
    eventoGatilho: string;
    probabilidadeMudanca: number;
    direcaoMudanca: string;
    sinaisAlerta: string[];
  }>;
  recomendacoesEstrategicas: {
    curtoPrazo: string[];
    medioPrazo: string[];
    mensagensChave: string[];
    temasEvitar: string[];
    canaisRecomendados: string[];
  };
  alertasInteligencia: Array<{
    tipo: 'oportunidade' | 'risco' | 'tendencia' | 'urgente';
    titulo: string;
    descricao: string;
    acaoRecomendada: string;
    prioridade: number;
  }>;
  conclusaoAnalitica: string;
  thinkingProcess?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { sessaoId, titulo, perguntas, respostas, estatisticas } = body;

    if (!respostas || respostas.length === 0) {
      return NextResponse.json(
        { erro: 'Nenhuma resposta para analisar' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { erro: 'ANTHROPIC_API_KEY não configurada' },
        { status: 500 }
      );
    }

    const cliente = new Anthropic({ apiKey });

    // Preparar dados das respostas para análise
    const respostasFormatadas = respostas.map((r) => ({
      eleitor: r.eleitor_nome,
      respostas: r.respostas.map((resp) => ({
        pergunta: perguntas.find((p) => p.id === resp.pergunta_id)?.texto || resp.pergunta_id,
        resposta: typeof resp.resposta === 'string'
          ? resp.resposta.substring(0, 500)
          : String(resp.resposta),
      })),
    }));

    const promptAnalise = `
Você é um CIENTISTA POLÍTICO SÊNIOR com 25+ anos de experiência especializado no DISTRITO FEDERAL brasileiro.

SEU PERFIL PROFISSIONAL:
- PhD em Ciência Política pela UnB com foco em comportamento eleitoral
- Especialização em Psicologia Política e Marketing Eleitoral
- Consultor de campanhas eleitorais bem-sucedidas no DF desde 1998
- Profundo conhecedor das regiões administrativas, dinâmicas sociais e culturais do DF
- Especialista em análise de dados qualitativos e quantitativos eleitorais
- Conhecimento avançado em psicologia de massas e persuasão

SUA MISSÃO:
Analisar os resultados desta pesquisa eleitoral e produzir um RELATÓRIO DE INTELIGÊNCIA POLÍTICA ESTRATÉGICA de alta qualidade, com linguagem CLARA, SINCERA e PRÁTICA. Sem academicismos vazios - insights acionáveis.

════════════════════════════════════════════════════════════════════════════════
DADOS DA PESQUISA: "${titulo}"
════════════════════════════════════════════════════════════════════════════════

MÉTRICAS GERAIS:
- Total de entrevistados: ${estatisticas.totalRespostas}
- Custo da pesquisa: R$ ${estatisticas.custoTotal.toFixed(2)}
- Distribuição de sentimentos: ${JSON.stringify(estatisticas.sentimentos)}

PERGUNTAS REALIZADAS:
${perguntas.map((p, i) => `${i + 1}. [${p.tipo.toUpperCase()}] ${p.texto}`).join('\n')}

RESPOSTAS COLETADAS (${respostas.length} entrevistados):
${respostasFormatadas.map((r) => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ELEITOR: ${r.eleitor}
${r.respostas.map((resp) => `➤ ${resp.pergunta}\n   "${resp.resposta}"`).join('\n\n')}
`).join('\n')}

════════════════════════════════════════════════════════════════════════════════
INSTRUÇÕES PARA O RELATÓRIO:
════════════════════════════════════════════════════════════════════════════════

Analise PROFUNDAMENTE os dados e produza um relatório com:

1. SUMÁRIO EXECUTIVO
   - Conclusão principal em 1-2 frases impactantes
   - Nível de alerta geral (baixo/moderado/alto/crítico)

2. ANÁLISE ESTRATÉGICA (SWOT ELEITORAL)
   - Panorama geral da situação
   - Fortalezas identificadas
   - Vulnerabilidades críticas
   - Oportunidades de ação
   - Ameaças no horizonte

3. PERFIS PSICOGRÁFICOS
   - Segmente os eleitores por comportamento/atitude (não apenas demografia)
   - Para cada segmento: características, gatilhos emocionais, mensagens eficazes, erros a evitar

4. ANÁLISE DO VOTO SILENCIOSO
   - Estimativa percentual de eleitores que votam diferente do que declaram
   - Perfil típico desse eleitor no DF
   - Como identificá-los
   - Estratégias de conversão
   - Riscos de assumir esse voto

5. PONTOS DE RUPTURA
   - Eventos que fariam grupos mudarem de posição
   - Probabilidade e direção da mudança
   - Sinais de alerta a monitorar

6. RECOMENDAÇÕES ESTRATÉGICAS
   - Ações de curto prazo (próximas semanas)
   - Ações de médio prazo (próximos meses)
   - Mensagens-chave recomendadas
   - Temas a EVITAR
   - Canais de comunicação recomendados

7. ALERTAS DE INTELIGÊNCIA
   - Oportunidades urgentes
   - Riscos iminentes
   - Tendências emergentes

8. CONCLUSÃO ANALÍTICA
   - Síntese final com visão estratégica

FORMATO DE SAÍDA:
Retorne APENAS um JSON válido com a estrutura abaixo. Seja DIRETO, PRÁTICO e ACIONÁVEL.
Evite jargões acadêmicos. Use linguagem de consultor político experiente que fala a verdade.

{
  "sumarioExecutivo": {
    "titulo": "string",
    "dataCriacao": "string (ISO)",
    "totalEntrevistados": number,
    "conclusaoPrincipal": "string (1-2 frases impactantes)",
    "nivelAlerta": "baixo|moderado|alto|critico"
  },
  "analiseEstrategica": {
    "panoramaGeral": "string (parágrafo)",
    "fortalezas": ["string"],
    "vulnerabilidades": ["string"],
    "oportunidades": ["string"],
    "ameacas": ["string"]
  },
  "perfisPsicograficos": [
    {
      "segmento": "string (nome do perfil)",
      "percentual": number,
      "caracteristicas": ["string"],
      "gatilhosEmocionais": ["string"],
      "mensagensEficazes": ["string"],
      "errosEvitar": ["string"]
    }
  ],
  "votoSilencioso": {
    "estimativaPercentual": number,
    "perfilTipico": "string",
    "indicadoresIdentificacao": ["string"],
    "estrategiasConversao": ["string"],
    "riscos": ["string"]
  },
  "pontosRuptura": [
    {
      "grupo": "string",
      "eventoGatilho": "string",
      "probabilidadeMudanca": number (0-100),
      "direcaoMudanca": "string",
      "sinaisAlerta": ["string"]
    }
  ],
  "recomendacoesEstrategicas": {
    "curtoPrazo": ["string"],
    "medioPrazo": ["string"],
    "mensagensChave": ["string"],
    "temasEvitar": ["string"],
    "canaisRecomendados": ["string"]
  },
  "alertasInteligencia": [
    {
      "tipo": "oportunidade|risco|tendencia|urgente",
      "titulo": "string",
      "descricao": "string",
      "acaoRecomendada": "string",
      "prioridade": number (1-10)
    }
  ],
  "conclusaoAnalitica": "string (parágrafo final)"
}`;

    // Chamar Claude Opus 4.5 com Extended Thinking
    const resposta = await cliente.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 16000,
      thinking: {
        type: 'enabled',
        budget_tokens: 10000, // Permite até 10k tokens de pensamento
      },
      messages: [
        {
          role: 'user',
          content: promptAnalise,
        },
      ],
    });

    // Extrair tokens
    const tokensInput = resposta.usage.input_tokens;
    const tokensOutput = resposta.usage.output_tokens;

    // Calcular custo em reais
    const custoUSD =
      (tokensInput / 1_000_000) * CUSTOS_OPUS.input +
      (tokensOutput / 1_000_000) * CUSTOS_OPUS.output;
    const custoReais = custoUSD * TAXA_USD_BRL;

    // Extrair conteúdo e thinking
    let conteudo = '';
    let thinking = '';

    for (const block of resposta.content) {
      if (block.type === 'thinking') {
        thinking = block.thinking;
      } else if (block.type === 'text') {
        conteudo = block.text;
      }
    }

    // Parsear JSON do relatório
    let relatorio: RelatorioInteligencia;
    try {
      const jsonMatch = conteudo.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        relatorio = JSON.parse(jsonMatch[0]);
        // Adicionar processo de thinking ao relatório
        if (thinking) {
          relatorio.thinkingProcess = thinking;
        }
      } else {
        throw new Error('JSON não encontrado na resposta');
      }
    } catch (parseError) {
      console.error('Erro ao parsear JSON:', parseError);
      // Retornar relatório de erro estruturado
      relatorio = {
        sumarioExecutivo: {
          titulo: titulo,
          dataCriacao: new Date().toISOString(),
          totalEntrevistados: estatisticas.totalRespostas,
          conclusaoPrincipal: 'Análise em processamento. Os dados foram coletados e requerem processamento adicional.',
          nivelAlerta: 'moderado',
        },
        analiseEstrategica: {
          panoramaGeral: conteudo || 'Análise não pôde ser completada automaticamente.',
          fortalezas: [],
          vulnerabilidades: [],
          oportunidades: [],
          ameacas: [],
        },
        perfisPsicograficos: [],
        votoSilencioso: {
          estimativaPercentual: 0,
          perfilTipico: 'Dados insuficientes para análise',
          indicadoresIdentificacao: [],
          estrategiasConversao: [],
          riscos: [],
        },
        pontosRuptura: [],
        recomendacoesEstrategicas: {
          curtoPrazo: ['Revisar dados coletados manualmente'],
          medioPrazo: [],
          mensagensChave: [],
          temasEvitar: [],
          canaisRecomendados: [],
        },
        alertasInteligencia: [
          {
            tipo: 'risco',
            titulo: 'Análise incompleta',
            descricao: 'O processamento automático não foi concluído',
            acaoRecomendada: 'Executar nova análise ou revisar manualmente',
            prioridade: 8,
          },
        ],
        conclusaoAnalitica: 'Análise requer revisão manual.',
        thinkingProcess: thinking,
      };
    }

    return NextResponse.json({
      sucesso: true,
      relatorio,
      metadados: {
        sessaoId,
        modelo: 'claude-opus-4-5-20251101',
        tokensInput,
        tokensOutput,
        custoReais,
        tempoProcessamento: new Date().toISOString(),
        usouExtendedThinking: true,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de inteligência:', error);
    return NextResponse.json(
      {
        erro: error instanceof Error ? error.message : 'Erro ao gerar relatório',
        detalhes: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
