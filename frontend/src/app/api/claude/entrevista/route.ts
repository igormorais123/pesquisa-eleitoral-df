import { NextRequest, NextResponse } from 'next/server';
import { chamarClaudeComRetry, selecionarModeloPergunta, LIMITE_CUSTO_SESSAO, type RespostaAgente } from '@/lib/claude/client';
import { gerarPromptCognitivo } from '@/lib/claude/prompts';
import type { Eleitor, Pergunta } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutos

interface RequestBody {
  eleitor: Eleitor;
  pergunta: Pergunta;
  custoAcumulado?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { eleitor, pergunta, custoAcumulado = 0 } = body;

    // Verificar limite de custo
    if (custoAcumulado >= LIMITE_CUSTO_SESSAO) {
      return NextResponse.json(
        { erro: 'Limite de custo da sessão atingido (R$ 100)' },
        { status: 429 }
      );
    }

    // Determinar modelo ideal
    const eleitorComplexo = Boolean(
      eleitor.conflito_identitario && eleitor.tolerancia_nuance === 'alta'
    );
    const modelo = selecionarModeloPergunta(pergunta.tipo, eleitorComplexo);

    // Gerar prompt cognitivo
    const prompt = gerarPromptCognitivo(eleitor, pergunta);

    // Chamar Claude
    const { conteudo, tokensInput, tokensOutput, custoReais } = await chamarClaudeComRetry(
      [{ role: 'user', content: prompt }],
      modelo,
      2000,
      3
    );

    // Parsear resposta JSON (novo formato robusto)
    let respostaParseada: Record<string, unknown>;
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = conteudo.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        respostaParseada = JSON.parse(jsonMatch[0]);
      } else {
        respostaParseada = {};
      }
    } catch (parseError) {
      console.error('Erro ao parsear resposta:', parseError);
      respostaParseada = {};
    }

    // Extrair texto da resposta (novo formato ou legado)
    let textoResposta = conteudo;
    if (respostaParseada.resposta && typeof respostaParseada.resposta === 'object') {
      // Novo formato: { resposta: { texto: "..." } }
      textoResposta = (respostaParseada.resposta as Record<string, unknown>).texto as string || conteudo;
    } else if (respostaParseada.resposta_texto) {
      // Formato legado: { resposta_texto: "..." }
      textoResposta = respostaParseada.resposta_texto as string;
    } else if (respostaParseada.decisao && typeof respostaParseada.decisao === 'object') {
      // Formato legado alternativo: { decisao: { resposta_final: "..." } }
      textoResposta = (respostaParseada.decisao as Record<string, unknown>).resposta_final as string || conteudo;
    }

    // Converter novo formato para estrutura de chain_of_thought (compatibilidade)
    const raciocinio = respostaParseada.raciocinio as Record<string, unknown> | undefined;
    const meta = respostaParseada.meta as Record<string, unknown> | undefined;

    const chainOfThought = respostaParseada.chain_of_thought || {
      etapa1_atencao: raciocinio?.atencao || { prestou_atencao: true, motivo: '' },
      etapa2_vies: raciocinio?.processamento || { confirma_crencas: false, ameaca_valores: false, medos_ativados: [] },
      etapa3_emocional: raciocinio?.emocional || { sentimento: 'indiferenca', intensidade: 5 },
      etapa4_decisao: meta || { muda_voto: false, aumenta_cinismo: false },
    };

    // Montar resposta completa
    const resposta: RespostaAgente = {
      agente_id: eleitor.id,
      modelo_usado: modelo,
      tokens_input: tokensInput,
      tokens_output: tokensOutput,
      chain_of_thought: chainOfThought as RespostaAgente['chain_of_thought'],
      resposta_texto: textoResposta,
      resposta_estruturada: respostaParseada.resposta_estruturada as RespostaAgente['resposta_estruturada'],
      // Novos campos do formato robusto
      raciocinio: raciocinio as RespostaAgente['raciocinio'],
      resposta_completa: respostaParseada.resposta as RespostaAgente['resposta_completa'],
      meta: meta as RespostaAgente['meta'],
    };

    return NextResponse.json({
      sucesso: true,
      resposta,
      custoReais,
      tokensInput,
      tokensOutput,
    });
  } catch (error) {
    console.error('Erro na entrevista:', error);
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : 'Erro ao processar entrevista' },
      { status: 500 }
    );
  }
}
