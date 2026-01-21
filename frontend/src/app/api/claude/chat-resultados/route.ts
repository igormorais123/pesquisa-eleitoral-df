import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const maxDuration = 120; // 2 minutos para respostas de chat

// Custos Opus 4.5 (USD por 1M tokens)
const CUSTOS_OPUS = { input: 15.0, output: 75.0 };
const TAXA_USD_BRL = 6.0;

interface MensagemHistorico {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  mensagem: string;
  contexto: string;
  historicoMensagens: MensagemHistorico[];
}

const SYSTEM_PROMPT = `Você é um CONSULTOR POLÍTICO SÊNIOR especializado em análise de pesquisas eleitorais do Distrito Federal, Brasil.

SEU PERFIL:
- 25+ anos de experiência em campanhas eleitorais no DF
- PhD em Ciência Política pela UnB
- Especialista em comportamento eleitoral, psicologia política e marketing eleitoral
- Profundo conhecedor das regiões administrativas do DF
- Linguagem direta, prática e sem academicismos vazios

SUA FUNÇÃO:
Você tem acesso COMPLETO aos resultados de uma pesquisa eleitoral, incluindo:
- Todas as respostas dos eleitores entrevistados
- Estatísticas agregadas (sentimentos, palavras frequentes, métricas)
- Análise por pergunta
- Relatório de Inteligência Política com insights estratégicos
- Análise SWOT, perfis psicográficos, voto silencioso, pontos de ruptura
- Recomendações estratégicas e alertas de inteligência

COMO RESPONDER:
1. Seja DIRETO e OBJETIVO - o usuário quer respostas práticas
2. Cite dados específicos da pesquisa quando relevante
3. Use números e percentuais quando disponíveis
4. Forneça insights ACIONÁVEIS, não apenas observações
5. Se a pergunta não puder ser respondida com os dados disponíveis, diga isso claramente
6. Mantenha respostas concisas mas completas
7. Use formatação markdown para organizar a resposta quando apropriado
8. Responda SEMPRE em português brasileiro

IMPORTANTE:
- Você tem acesso a TODAS as respostas individuais dos eleitores
- Você pode fazer análises cruzadas e identificar padrões
- Você conhece o contexto político do DF e pode contextualizar os resultados
- Seja honesto sobre limitações dos dados quando existirem`;

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { mensagem, contexto, historicoMensagens } = body;

    if (!mensagem?.trim()) {
      return NextResponse.json(
        { erro: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }

    if (!contexto?.trim()) {
      return NextResponse.json(
        { erro: 'Contexto da pesquisa é obrigatório' },
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

    // Preparar mensagens para a API
    const mensagensAPI: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Adicionar contexto como primeira mensagem do usuário
    mensagensAPI.push({
      role: 'user',
      content: `Aqui está o contexto completo da pesquisa eleitoral que você deve analisar:\n\n${contexto}\n\n---\n\nAgora você está preparado para responder perguntas sobre esta pesquisa. Responda "Entendido" para confirmar.`,
    });

    mensagensAPI.push({
      role: 'assistant',
      content: 'Entendido. Analisei todos os dados da pesquisa eleitoral, incluindo as respostas individuais dos eleitores, estatísticas agregadas, análise de sentimentos, e o relatório de inteligência política. Estou pronto para responder suas perguntas sobre os resultados.',
    });

    // Adicionar histórico de mensagens
    if (historicoMensagens && historicoMensagens.length > 0) {
      for (const msg of historicoMensagens) {
        mensagensAPI.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Adicionar mensagem atual do usuário
    mensagensAPI.push({
      role: 'user',
      content: mensagem,
    });

    // Chamar Claude Opus 4.5
    const resposta = await cliente.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: mensagensAPI,
    });

    // Extrair tokens e calcular custo
    const tokensInput = resposta.usage.input_tokens;
    const tokensOutput = resposta.usage.output_tokens;
    const tokensTotal = tokensInput + tokensOutput;

    const custoUSD =
      (tokensInput / 1_000_000) * CUSTOS_OPUS.input +
      (tokensOutput / 1_000_000) * CUSTOS_OPUS.output;
    const custoReais = custoUSD * TAXA_USD_BRL;

    // Extrair texto da resposta
    let textoResposta = '';
    for (const block of resposta.content) {
      if (block.type === 'text') {
        textoResposta = block.text;
        break;
      }
    }

    return NextResponse.json({
      sucesso: true,
      resposta: textoResposta,
      tokensUsados: tokensTotal,
      tokensInput,
      tokensOutput,
      custo: custoReais,
    });
  } catch (error) {
    console.error('Erro no chat com resultados:', error);
    return NextResponse.json(
      {
        erro: error instanceof Error ? error.message : 'Erro ao processar mensagem',
        detalhes: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
