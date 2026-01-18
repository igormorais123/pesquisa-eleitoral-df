import { NextRequest, NextResponse } from 'next/server';
import {
  chamarClaudeComRetry,
  LIMITE_CUSTO_SESSAO,
} from '@/lib/claude/client';
import { gerarPromptGestorPODC } from '@/lib/claude/prompts-gestor';
import type { Gestor, Pergunta } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutos

interface RequestBody {
  gestor: Gestor;
  pergunta: Pergunta;
  custoAcumulado?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { gestor, pergunta, custoAcumulado = 0 } = body;

    // Verificar limite de custo
    if (custoAcumulado >= LIMITE_CUSTO_SESSAO) {
      return NextResponse.json(
        { erro: 'Limite de custo da sessao atingido (R$ 100)' },
        { status: 429 }
      );
    }

    // Gerar prompt para gestor PODC
    const prompt = gerarPromptGestorPODC(gestor, pergunta);

    // Usar Sonnet para respostas mais rapidas e economicas
    const modelo = 'sonnet' as const;

    // Chamar Claude
    const { conteudo, tokensInput, tokensOutput, custoReais } = await chamarClaudeComRetry(
      [{ role: 'user', content: prompt }],
      modelo,
      2000,
      3
    );

    // Parsear resposta JSON
    let respostaParseada: Record<string, unknown> = {};
    try {
      const jsonMatch = conteudo.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        respostaParseada = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Erro ao parsear resposta:', parseError);
    }

    // Extrair texto da resposta
    let textoResposta = conteudo;
    if (respostaParseada.resposta && typeof respostaParseada.resposta === 'object') {
      const resp = respostaParseada.resposta as Record<string, unknown>;
      textoResposta = (resp.texto as string) || conteudo;
    }

    // Extrair resposta estruturada
    const respostaEstruturada = respostaParseada.resposta_estruturada as {
      escala?: number;
      opcao?: string;
    } | undefined;

    // Extrair reflexao PODC
    const podcReflexao = respostaParseada.podc_reflexao as {
      funcao_mais_relevante?: string;
      distribuicao_ideal?: {
        planejar: number;
        organizar: number;
        dirigir: number;
        controlar: number;
      };
      justificativa_distribuicao?: string;
    } | undefined;

    // Montar resposta completa
    const resposta = {
      gestor_id: gestor.id,
      gestor_nome: gestor.nome,
      setor: gestor.setor,
      nivel_hierarquico: gestor.nivel_hierarquico,
      modelo_usado: modelo,
      tokens_input: tokensInput,
      tokens_output: tokensOutput,
      resposta_texto: textoResposta,
      resposta_estruturada: respostaEstruturada,
      podc_reflexao: podcReflexao,
      contexto_gestor: respostaParseada.contexto_gestor,
      raciocinio: respostaParseada.raciocinio,
    };

    return NextResponse.json({
      sucesso: true,
      resposta,
      custoReais,
      tokensInput,
      tokensOutput,
    });
  } catch (error) {
    console.error('Erro na pesquisa PODC:', error);
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : 'Erro ao processar pesquisa PODC' },
      { status: 500 }
    );
  }
}
