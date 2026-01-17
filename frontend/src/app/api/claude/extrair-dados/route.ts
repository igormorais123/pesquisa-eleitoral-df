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
  contexto: {
    tipoPesquisa: string;
    objetivo: string;
  };
  usarIA?: boolean; // default true
}

export async function POST(request: NextRequest) {
  const inicio = Date.now();

  try {
    const body: RequestBody = await request.json();
    const { respostas, contexto, usarIA = true } = body;

    if (!respostas || respostas.length === 0) {
      return NextResponse.json(
        { erro: 'Nenhuma resposta fornecida para análise' },
        { status: 400 }
      );
    }

    let resultado: ResultadoExtracaoIA;

    if (usarIA) {
      // Gerar prompt de extração
      const prompt = gerarPromptExtracao(respostas, contexto);

      // Chamar Claude (usar Sonnet para economia, Opus para precisão)
      const modelo = respostas.length > 100 ? 'sonnet' : 'opus';

      const { conteudo, tokensInput, tokensOutput, custoReais } = await chamarClaudeComRetry(
        [{ role: 'user', content: prompt }],
        modelo,
        4000,
        2
      );

      // Parsear resposta
      const resultadoIA = parsearRespostaExtracaoIA(conteudo);

      if (!resultadoIA) {
        // Fallback para cálculo local
        console.warn('Falha no parse da IA, usando cálculo local');
        const local = calcularIndicadoresLocalmente(respostas);
        resultado = {
          indicadores: local.indicadores || [],
          categorias: local.categorias || [],
          insights: local.insights || [],
          resumoExecutivo: {
            conclusaoPrincipal: 'Análise realizada com método simplificado',
            pontoChave1: `${respostas.length} respostas analisadas`,
            pontoChave2: 'Recomenda-se análise manual complementar',
            pontoChave3: 'Dados parciais disponíveis',
          },
          dadosGraficos: local.dadosGraficos || {
            distribuicaoSentimento: [],
            topTemas: [],
            indicadoresChave: [],
          },
          totalRespostasAnalisadas: respostas.length,
          confiancaGeral: 0.4,
          tempoProcessamentoMs: Date.now() - inicio,
        };
      } else {
        resultado = {
          ...resultadoIA,
          tempoProcessamentoMs: Date.now() - inicio,
        };
      }

      return NextResponse.json({
        sucesso: true,
        resultado,
        metadados: {
          modelo,
          tokensInput,
          tokensOutput,
          custoReais,
          metodo: 'ia',
        },
      });
    } else {
      // Cálculo local sem IA
      const local = calcularIndicadoresLocalmente(respostas);
      resultado = {
        indicadores: local.indicadores || [],
        categorias: local.categorias || [],
        insights: local.insights || [],
        resumoExecutivo: {
          conclusaoPrincipal: 'Análise realizada localmente sem IA',
          pontoChave1: `${respostas.length} respostas processadas`,
          pontoChave2: 'Análise por palavras-chave',
          pontoChave3: 'Para análise mais profunda, habilite IA',
        },
        dadosGraficos: local.dadosGraficos || {
          distribuicaoSentimento: [],
          topTemas: [],
          indicadoresChave: [],
        },
        totalRespostasAnalisadas: respostas.length,
        confiancaGeral: local.confiancaGeral || 0.5,
        tempoProcessamentoMs: Date.now() - inicio,
      };

      return NextResponse.json({
        sucesso: true,
        resultado,
        metadados: {
          metodo: 'local',
        },
      });
    }
  } catch (error) {
    console.error('Erro na extração de dados:', error);
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : 'Erro ao extrair dados' },
      { status: 500 }
    );
  }
}
