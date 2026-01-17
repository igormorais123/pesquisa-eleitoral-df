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
  metadados: {
    titulo: string;
    dataGeracao: string;
    totalEntrevistas: number;
  };
}

export async function POST(request: NextRequest) {
  const inicio = Date.now();

  try {
    const body: RequestBody = await request.json();
    const { relatorio, metadados } = body;

    if (!relatorio || relatorio.trim().length < 100) {
      return NextResponse.json(
        { erro: 'Relatório muito curto ou vazio' },
        { status: 400 }
      );
    }

    // Gerar prompt de síntese
    const prompt = gerarPromptSintese(relatorio, metadados);

    // Usar Opus para síntese (precisa de capacidade analítica superior)
    const { conteudo, tokensInput, tokensOutput, custoReais } = await chamarClaudeComRetry(
      [{ role: 'user', content: prompt }],
      'opus',
      4000,
      2
    );

    // Parsear resposta
    const resultadoIA = parsearRespostaSinteseIA(conteudo);

    if (!resultadoIA) {
      // Criar resultado mínimo se parse falhar
      const resultadoMinimo: ResultadoSinteseIA = {
        scorecardExecutivo: {
          notaGeral: 5,
          tendencia: 'estavel',
          nivelAlerta: 'amarelo',
          mensagemChave: 'Análise requer revisão manual',
        },
        kpis: [],
        alertas: [{
          tipo: 'atencao',
          titulo: 'Síntese Parcial',
          descricao: 'Não foi possível extrair todos os indicadores automaticamente',
        }],
        matrizRisco: [],
        comparativos: [],
        conclusoes: {
          principal: 'Relatório processado com limitações',
          secundarias: [],
          recomendacoes: ['Revisar dados originais', 'Executar análise manual'],
          proximosPassos: ['Verificar qualidade dos dados de entrada'],
        },
        metricasDerivadas: [],
      };

      return NextResponse.json({
        sucesso: true,
        resultado: resultadoMinimo,
        metadados: {
          modelo: 'opus',
          tokensInput,
          tokensOutput,
          custoReais,
          parseCompleto: false,
          tempoProcessamentoMs: Date.now() - inicio,
        },
      });
    }

    return NextResponse.json({
      sucesso: true,
      resultado: resultadoIA,
      metadados: {
        modelo: 'opus',
        tokensInput,
        tokensOutput,
        custoReais,
        parseCompleto: true,
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
