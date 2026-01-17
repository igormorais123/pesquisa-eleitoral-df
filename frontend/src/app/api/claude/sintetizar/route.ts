import { NextRequest, NextResponse } from 'next/server';
import { chamarClaudeComRetry } from '@/lib/claude/client';
import {
  gerarPromptSintese,
  parsearRespostaSinteseIA,
  type ResultadoSinteseIA,
} from '@/lib/extrator-inteligente';

export const runtime = 'nodejs';
export const maxDuration = 120; // 2 minutos

interface RequestBody {
  relatorio: string;
  metadados?: {
    titulo?: string;
    dataGeracao?: string;
    totalEntrevistas?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { relatorio, metadados } = body;

    if (!relatorio || relatorio.length < 100) {
      return NextResponse.json(
        { erro: 'Relatório muito curto ou não fornecido' },
        { status: 400 }
      );
    }

    const inicio = Date.now();

    // Gerar prompt
    const prompt = gerarPromptSintese(relatorio, metadados);

    // Usar Sonnet para síntese (economia)
    const { conteudo, tokensInput, tokensOutput, custoReais } = await chamarClaudeComRetry(
      [{ role: 'user', content: prompt }],
      'sonnet',
      4000,
      2
    );

    // Parsear resposta
    const resultado = parsearRespostaSinteseIA(conteudo);

    if (!resultado) {
      return NextResponse.json(
        { erro: 'Não foi possível sintetizar o relatório' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      resultado,
      metadados: {
        modelo: 'sonnet',
        custoReais,
        tokens: { input: tokensInput, output: tokensOutput },
        tempoProcessamentoMs: Date.now() - inicio,
      },
    });
  } catch (error) {
    console.error('Erro na síntese:', error);
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : 'Erro ao sintetizar relatório' },
      { status: 500 }
    );
  }
}
