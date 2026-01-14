import { NextRequest, NextResponse } from 'next/server';
import { chamarClaudeComRetry } from '@/lib/claude/client';
import type { RespostaEleitor, Insight } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 120;

interface RequestBody {
  pergunta: string;
  respostas: RespostaEleitor[];
  distribuicao: Record<string, number>;
  sentimentos: Record<string, number>;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { pergunta, respostas, distribuicao, sentimentos } = body;

    const prompt = `
Você é um analista político sênior analisando resultados de pesquisa eleitoral.

DADOS DA PESQUISA:
- Pergunta: ${pergunta}
- Total de respondentes: ${respostas.length}
- Distribuição de respostas: ${JSON.stringify(distribuicao)}
- Sentimentos predominantes: ${JSON.stringify(sentimentos)}

RESPOSTAS INDIVIDUAIS (amostra):
${respostas.slice(0, 50).map(r => `- ${r.eleitor_nome}: ${r.respostas.map(resp => typeof resp.resposta === 'string' ? resp.resposta.substring(0, 200) : resp.resposta).join(', ')}`).join('\n')}

ANALISE E IDENTIFIQUE:

1. DESCOBERTAS CRÍTICAS
   - Padrões inesperados nos dados
   - Grupos com comportamento atípico
   - Contradições entre perfil e resposta

2. VOTOS SILENCIOSOS
   - Quem concorda com economia mas rejeita costumes?
   - Quem vota mas não defende publicamente?

3. PONTOS DE RUPTURA
   - Qual evento faria cada grupo mudar de lado?
   - Quais são as "linhas vermelhas" por perfil?

4. OPORTUNIDADES ESTRATÉGICAS
   - Grupos persuadíveis identificados
   - Temas que mobilizam vs que afastam
   - Vulnerabilidades de cada posição

FORMATO: Retorne APENAS JSON válido:
{
  "insights": [
    {
      "tipo": "destaque",
      "titulo": "...",
      "descricao": "...",
      "relevancia": 85
    }
  ],
  "voto_silencioso": {
    "identificados": ["..."],
    "percentual_estimado": 15,
    "perfil_tipico": "..."
  },
  "pontos_ruptura": [
    {
      "grupo": "...",
      "evento_gatilho": "...",
      "probabilidade_mudanca": 30
    }
  ],
  "conclusoes": ["..."],
  "implicacoes_politicas": ["..."]
}`;

    const { conteudo, tokensInput, tokensOutput, custoReais } = await chamarClaudeComRetry(
      [{ role: 'user', content: prompt }],
      'opus', // Insights usam Opus para análise mais profunda
      4000,
      3
    );

    // Parsear resposta
    let resultado;
    try {
      const jsonMatch = conteudo.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        resultado = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON não encontrado');
      }
    } catch (parseError) {
      // Retornar insights genéricos em caso de erro
      resultado = {
        insights: [
          {
            tipo: 'destaque',
            titulo: 'Análise em processamento',
            descricao: 'Os dados foram coletados e estão sendo analisados.',
            relevancia: 50,
          },
        ],
        voto_silencioso: null,
        pontos_ruptura: [],
        conclusoes: ['Análise automática não pôde ser completada.'],
        implicacoes_politicas: [],
      };
    }

    return NextResponse.json({
      sucesso: true,
      ...resultado,
      custoReais,
      tokensUsados: { input: tokensInput, output: tokensOutput },
    });
  } catch (error) {
    console.error('Erro ao gerar insights:', error);
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : 'Erro ao gerar insights' },
      { status: 500 }
    );
  }
}
