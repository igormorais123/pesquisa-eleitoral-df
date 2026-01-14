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

    // Parsear resposta JSON
    let respostaParseada: Partial<RespostaAgente>;
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = conteudo.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        respostaParseada = JSON.parse(jsonMatch[0]);
      } else {
        // Se não encontrar JSON, criar estrutura básica
        respostaParseada = {
          resposta_texto: conteudo,
          chain_of_thought: {
            etapa1_atencao: { prestou_atencao: true, motivo: 'Processado automaticamente' },
            etapa2_vies: { confirma_crencas: false, ameaca_valores: false, medos_ativados: [] },
            etapa3_emocional: { sentimento: 'indiferenca', intensidade: 5 },
            etapa4_decisao: { muda_voto: false, aumenta_cinismo: false },
          },
        };
      }
    } catch (parseError) {
      console.error('Erro ao parsear resposta:', parseError);
      respostaParseada = {
        resposta_texto: conteudo,
        chain_of_thought: {
          etapa1_atencao: { prestou_atencao: true, motivo: 'Erro no parse' },
          etapa2_vies: { confirma_crencas: false, ameaca_valores: false, medos_ativados: [] },
          etapa3_emocional: { sentimento: 'indiferenca', intensidade: 5 },
          etapa4_decisao: { muda_voto: false, aumenta_cinismo: false },
        },
      };
    }

    // Montar resposta completa
    const resposta: RespostaAgente = {
      agente_id: eleitor.id,
      modelo_usado: modelo,
      tokens_input: tokensInput,
      tokens_output: tokensOutput,
      chain_of_thought: respostaParseada.chain_of_thought || {
        etapa1_atencao: { prestou_atencao: true, motivo: '' },
        etapa2_vies: { confirma_crencas: false, ameaca_valores: false, medos_ativados: [] },
        etapa3_emocional: { sentimento: 'indiferenca', intensidade: 5 },
        etapa4_decisao: { muda_voto: false, aumenta_cinismo: false },
      },
      resposta_texto: respostaParseada.resposta_texto || conteudo,
      resposta_estruturada: respostaParseada.resposta_estruturada,
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
