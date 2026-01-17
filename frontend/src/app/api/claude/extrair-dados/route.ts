import { NextRequest, NextResponse } from 'next/server';
import { chamarClaudeComRetry } from '@/lib/claude/client';
import {
  gerarPromptExtracao,
  parsearRespostaExtracaoIA,
  calcularIndicadoresLocalmente,
  type ResultadoExtracaoIA,
} from '@/lib/extrator-inteligente';

export const runtime = 'nodejs';
export const maxDuration = 120; // 2 minutos

interface RespostaInput {
  texto: string;
  pergunta: string;
  eleitor?: {
    regiao?: string;
    orientacao?: string;
    cluster?: string;
  };
}

interface RequestBody {
  respostas: RespostaInput[];
  contexto?: {
    tipoPesquisa?: string;
    objetivo?: string;
  };
  usarIA?: boolean; // default true
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { respostas, contexto, usarIA = true } = body;

    if (!respostas || respostas.length === 0) {
      return NextResponse.json(
        { erro: 'Nenhuma resposta fornecida para análise' },
        { status: 400 }
      );
    }

    const inicio = Date.now();

    let resultado: ResultadoExtracaoIA;
    let metadados: { metodo: string; modelo?: string; custo?: number; tokens?: { input: number; output: number } };

    if (usarIA && respostas.length > 0) {
      try {
        // Gerar prompt
        const prompt = gerarPromptExtracao(respostas, contexto);

        // Chamar Claude (usar Sonnet para economia)
        const { conteudo, tokensInput, tokensOutput, custoReais } = await chamarClaudeComRetry(
          [{ role: 'user', content: prompt }],
          'sonnet',
          4000,
          2
        );

        // Parsear resposta
        const resultadoIA = parsearRespostaExtracaoIA(conteudo);

        if (resultadoIA) {
          resultado = {
            ...resultadoIA,
            totalRespostasAnalisadas: respostas.length,
            tempoProcessamentoMs: Date.now() - inicio,
          };
          metadados = {
            metodo: 'ia',
            modelo: 'sonnet',
            custo: custoReais,
            tokens: { input: tokensInput, output: tokensOutput },
          };
        } else {
          // Fallback para análise local se parsing falhar
          resultado = calcularIndicadoresLocalmente(respostas);
          resultado.tempoProcessamentoMs = Date.now() - inicio;
          metadados = { metodo: 'local_fallback' };
        }
      } catch (error) {
        console.error('Erro na análise com IA, usando fallback local:', error);
        resultado = calcularIndicadoresLocalmente(respostas);
        resultado.tempoProcessamentoMs = Date.now() - inicio;
        metadados = { metodo: 'local_error_fallback' };
      }
    } else {
      // Análise local (sem IA)
      resultado = calcularIndicadoresLocalmente(respostas);
      resultado.tempoProcessamentoMs = Date.now() - inicio;
      metadados = { metodo: 'local' };
    }

    return NextResponse.json({
      sucesso: true,
      resultado,
      metadados,
    });
  } catch (error) {
    console.error('Erro na extração de dados:', error);
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : 'Erro ao extrair dados' },
      { status: 500 }
    );
  }
}
