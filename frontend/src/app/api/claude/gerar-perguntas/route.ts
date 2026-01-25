import { NextRequest, NextResponse } from 'next/server';
import { chamarClaudeComRetry } from '@/lib/claude/client';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface RequestBody {
  tema: string;
  quantidade: number;
  tiposPerguntas: string[];
  contexto?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { tema, quantidade, tiposPerguntas, contexto } = body;

    if (!tema || !quantidade || !tiposPerguntas || tiposPerguntas.length === 0) {
      return NextResponse.json(
        { erro: 'Tema, quantidade e tipos de perguntas são obrigatórios' },
        { status: 400 }
      );
    }

    const tiposDescricao = tiposPerguntas.map(t => {
      switch (t) {
        case 'multipla_escolha': return 'múltipla escolha (com 4-5 opções)';
        case 'escala': return 'escala de 1 a 10';
        case 'sim_nao': return 'sim/não';
        case 'aberta': return 'resposta aberta (texto livre)';
        default: return t;
      }
    }).join(', ');

    const prompt = `
Você é um especialista em pesquisas eleitorais e de opinião pública no Brasil.

TAREFA: Gerar ${quantidade} perguntas de pesquisa sobre o tema "${tema}".

CONTEXTO: ${contexto || 'Pesquisa de opinião no Distrito Federal'}

TIPOS DE PERGUNTAS PERMITIDOS: ${tiposDescricao}

REGRAS:
1. Perguntas devem ser claras, objetivas e imparciais
2. Evitar viés político ou indução de resposta
3. Usar linguagem acessível para todos os públicos
4. Variar entre os tipos de perguntas solicitados
5. Perguntas devem ser relevantes para o contexto brasileiro/DF

FORMATO DE SAÍDA - Retorne APENAS um JSON válido com a seguinte estrutura:
{
  "perguntas": [
    {
      "texto": "Texto da pergunta",
      "tipo": "multipla_escolha | escala | sim_nao | aberta",
      "opcoes": ["Opção 1", "Opção 2", ...] // apenas para multipla_escolha
    }
  ]
}

IMPORTANTE:
- Para perguntas de múltipla escolha, inclua entre 4-5 opções incluindo "Não sei/Prefiro não responder"
- Para perguntas de escala, não inclua opções (será 1-10 automaticamente)
- Para perguntas sim/não, não inclua opções (será Sim/Não automaticamente)
- Para perguntas abertas, não inclua opções

Gere exatamente ${quantidade} perguntas sobre "${tema}".`;

    const { conteudo, tokensInput, tokensOutput, custoReais } = await chamarClaudeComRetry(
      [{ role: 'user', content: prompt }],
      'sonnet', // Usar Sonnet para geração de perguntas (mais rápido e econômico)
      3000,
      3
    );

    // Parsear resposta
    let resultado;
    try {
      const jsonMatch = conteudo.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        resultado = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON não encontrado na resposta');
      }
    } catch (parseError) {
      console.error('Erro ao parsear JSON:', parseError, 'Conteúdo:', conteudo);
      return NextResponse.json(
        { erro: 'Erro ao processar resposta da IA. Tente novamente.' },
        { status: 500 }
      );
    }

    // Validar e formatar perguntas
    const perguntasFormatadas = resultado.perguntas.map((p: any, index: number) => {
      let tipo = p.tipo;

      // Normalizar tipo
      if (tipo === 'multipla' || tipo === 'multipla_escolha' || tipo === 'multiple_choice') {
        tipo = 'multipla_escolha';
      } else if (tipo === 'scale' || tipo === 'escala') {
        tipo = 'escala';
      } else if (tipo === 'yes_no' || tipo === 'sim_nao' || tipo === 'boolean') {
        tipo = 'sim_nao';
      } else if (tipo === 'open' || tipo === 'aberta' || tipo === 'text') {
        tipo = 'aberta';
      }

      return {
        id: `ia-${Date.now()}-${index}`,
        texto: p.texto,
        tipo,
        opcoes: tipo === 'multipla_escolha' ? (p.opcoes || []) : [],
        escala_min: tipo === 'escala' ? 1 : undefined,
        escala_max: tipo === 'escala' ? 10 : undefined,
      };
    });

    return NextResponse.json({
      sucesso: true,
      perguntas: perguntasFormatadas,
      custoReais,
      tokensUsados: { input: tokensInput, output: tokensOutput },
    });
  } catch (error) {
    console.error('Erro ao gerar perguntas:', error);
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : 'Erro ao gerar perguntas' },
      { status: 500 }
    );
  }
}
