/**
 * API Route: /api/v1/mensagens/gerar
 *
 * Gera mensagens de persuasão otimizadas usando IA.
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

// Força rota dinâmica
export const dynamic = 'force-dynamic';

const ELEITORES_FILE = path.join(process.cwd(), 'public', 'data', 'banco-eleitores-df.json');

interface Eleitor {
  id: string;
  nome: string;
  idade: number;
  genero: string;
  regiao_administrativa: string;
  cluster_socioeconomico: string;
  orientacao_politica: string;
  religiao: string;
  valores: string[];
  preocupacoes: string[];
  medos: string[];
  susceptibilidade_desinformacao: string;
  escolaridade: string;
  profissao: string;
  renda_salarios_minimos: string;
}

interface Filtros {
  regiao_administrativa?: string[];
  cluster_socioeconomico?: string[];
  orientacao_politica?: string[];
  religiao?: string[];
}

interface MensagemGerada {
  gatilho: string;
  texto_curto: string;
  texto_longo: string;
  headline: string;
  palavras_gatilho: string[];
  tom: string;
  canal_ideal: string;
  perfil_mais_receptivo: string;
  risco_backfire_estimado: number;
  eficacia_estimada: number;
  justificativa: string;
}

function calcularSusceptibilidade(nivel: string): number {
  const mapa: Record<string, number> = {
    'muito_alta': 9,
    'alta': 7,
    'media': 5,
    'baixa': 3,
    'muito_baixa': 1,
  };
  return mapa[nivel] || 5;
}

function contarFrequencias(items: string[]): Array<{ item: string; frequencia: number; percentual: number }> {
  const contagem: Record<string, number> = {};
  items.forEach(item => {
    contagem[item] = (contagem[item] || 0) + 1;
  });

  const total = items.length;
  return Object.entries(contagem)
    .map(([item, frequencia]) => ({
      item,
      frequencia,
      percentual: total > 0 ? Math.round((frequencia / total) * 100) : 0,
    }))
    .sort((a, b) => b.frequencia - a.frequencia);
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const {
      objetivo,
      gatilhos = ['medo', 'esperanca', 'economico', 'tribal', 'identitario'],
      restricoes = [],
      num_variacoes = 5,
      filtros = {},
    } = body;

    if (!objetivo || objetivo.trim().length < 10) {
      return NextResponse.json(
        { detail: 'O objetivo deve ter pelo menos 10 caracteres' },
        { status: 400 }
      );
    }

    // Carregar eleitores
    const fileContent = await fs.readFile(ELEITORES_FILE, 'utf-8');
    let eleitores: Eleitor[] = JSON.parse(fileContent);

    // Aplicar filtros
    if (filtros.regiao_administrativa?.length) {
      eleitores = eleitores.filter((e: Eleitor) =>
        filtros.regiao_administrativa.includes(e.regiao_administrativa)
      );
    }

    if (filtros.cluster_socioeconomico?.length) {
      eleitores = eleitores.filter((e: Eleitor) =>
        filtros.cluster_socioeconomico.includes(e.cluster_socioeconomico)
      );
    }

    if (filtros.orientacao_politica?.length) {
      eleitores = eleitores.filter((e: Eleitor) =>
        filtros.orientacao_politica.includes(e.orientacao_politica)
      );
    }

    if (filtros.religiao?.length) {
      eleitores = eleitores.filter((e: Eleitor) =>
        filtros.religiao.includes(e.religiao)
      );
    }

    const total = eleitores.length;

    if (total === 0) {
      return NextResponse.json(
        { detail: 'Nenhum eleitor encontrado com os filtros aplicados' },
        { status: 400 }
      );
    }

    // Calcular perfil agregado
    const idadeMedia = eleitores.reduce((sum, e) => sum + e.idade, 0) / total;
    const susceptibilidadeMedia = eleitores.reduce((sum, e) =>
      sum + calcularSusceptibilidade(e.susceptibilidade_desinformacao), 0
    ) / total;

    const todosMedos = eleitores.flatMap(e => e.medos || []);
    const todosValores = eleitores.flatMap(e => e.valores || []);
    const todasPreocupacoes = eleitores.flatMap(e => e.preocupacoes || []);
    const todasRegioes = eleitores.map(e => e.regiao_administrativa);
    const todosClusters = eleitores.map(e => e.cluster_socioeconomico);
    const todasReligioes = eleitores.map(e => e.religiao);

    const perfilAgregado = {
      total,
      medos: contarFrequencias(todosMedos).slice(0, 10),
      valores: contarFrequencias(todosValores).slice(0, 10),
      preocupacoes: contarFrequencias(todasPreocupacoes).slice(0, 10),
      regioes: contarFrequencias(todasRegioes).slice(0, 10),
      clusters: contarFrequencias(todosClusters),
      religioes: contarFrequencias(todasReligioes),
      idade_media: idadeMedia,
      susceptibilidade_media: susceptibilidadeMedia,
    };

    // Preparar prompt para Claude
    const prompt = `Você é um especialista em comunicação política e marketing eleitoral.

OBJETIVO DA CAMPANHA:
${objetivo}

PERFIL DO PÚBLICO-ALVO (${total} eleitores):
- Idade média: ${idadeMedia.toFixed(1)} anos
- Susceptibilidade à persuasão: ${susceptibilidadeMedia.toFixed(1)}/10

TOP MEDOS:
${perfilAgregado.medos.slice(0, 5).map(m => `- ${m.item} (${m.percentual}%)`).join('\n')}

TOP VALORES:
${perfilAgregado.valores.slice(0, 5).map(v => `- ${v.item} (${v.percentual}%)`).join('\n')}

TOP PREOCUPAÇÕES:
${perfilAgregado.preocupacoes.slice(0, 5).map(p => `- ${p.item} (${p.percentual}%)`).join('\n')}

REGIÕES ADMINISTRATIVAS:
${perfilAgregado.regioes.slice(0, 5).map(r => `- ${r.item} (${r.percentual}%)`).join('\n')}

GATILHOS PSICOLÓGICOS A USAR:
${gatilhos.map((g: string) => `- ${g}`).join('\n')}

${restricoes.length > 0 ? `RESTRIÇÕES:
${restricoes.map((r: string) => `- ${r}`).join('\n')}` : ''}

TAREFA:
Crie ${gatilhos.length} mensagens de persuasão, uma para cada gatilho psicológico solicitado.
Cada mensagem deve ser otimizada para o perfil específico do público-alvo.

RESPONDA EXATAMENTE NO SEGUINTE FORMATO JSON (array de objetos):
[
  {
    "gatilho": "nome_do_gatilho",
    "headline": "Título impactante (máx 60 caracteres)",
    "texto_curto": "Mensagem curta para WhatsApp/Twitter (máx 280 caracteres)",
    "texto_longo": "Texto expandido para panfletos ou discursos (2-3 parágrafos)",
    "palavras_gatilho": ["palavra1", "palavra2", "palavra3"],
    "tom": "urgente|esperançoso|indignado|empático|autoritário",
    "canal_ideal": "WhatsApp|Facebook|Instagram|Panfleto|Discurso|Rádio",
    "perfil_mais_receptivo": "Descrição do perfil mais receptivo a esta mensagem",
    "risco_backfire_estimado": 0.0 a 1.0,
    "eficacia_estimada": 0.0 a 1.0,
    "justificativa": "Por que esta mensagem funciona para este público"
  }
]

Responda APENAS com o JSON, sem texto adicional.`;

    // Chamar Claude API
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

    if (!apiKey) {
      // Se não tem API key, retorna mensagens de exemplo
      const mensagensExemplo: MensagemGerada[] = gatilhos.map((gatilho: string) => ({
        gatilho,
        headline: `Mensagem de ${gatilho} - Configure sua API Key`,
        texto_curto: `Esta é uma mensagem de exemplo para o gatilho ${gatilho}. Configure ANTHROPIC_API_KEY ou CLAUDE_API_KEY no .env para gerar mensagens reais.`,
        texto_longo: `Esta é uma versão expandida da mensagem de exemplo para o gatilho ${gatilho}.\n\nPara gerar mensagens reais com IA, configure a variável de ambiente ANTHROPIC_API_KEY ou CLAUDE_API_KEY com sua chave da API Anthropic.\n\nO sistema analisará o perfil dos ${total} eleitores selecionados e gerará mensagens otimizadas para cada gatilho psicológico.`,
        palavras_gatilho: ['exemplo', 'configurar', 'API'],
        tom: 'informativo',
        canal_ideal: 'WhatsApp',
        perfil_mais_receptivo: 'Todos os perfis',
        risco_backfire_estimado: 0.1,
        eficacia_estimada: 0.5,
        justificativa: 'Mensagem de exemplo - configure a API Key para gerar mensagens reais.',
      }));

      const tempoGeracao = (Date.now() - startTime) / 1000;

      return NextResponse.json({
        mensagens: mensagensExemplo,
        recomendacao_geral: 'Configure ANTHROPIC_API_KEY ou CLAUDE_API_KEY para gerar mensagens reais.',
        alerta_riscos: ['API Key não configurada - usando mensagens de exemplo'],
        sequencia_sugerida: 'Configure a API Key primeiro.',
        metadados: {
          objetivo,
          total_eleitores_analisados: total,
          gatilhos_utilizados: gatilhos,
          tempo_geracao_segundos: tempoGeracao,
          custo_estimado_usd: 0,
          gerado_em: new Date().toISOString(),
        },
        perfil_agregado: perfilAgregado,
      });
    }

    // Chamar Claude
    const anthropic = new Anthropic({
      apiKey,
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extrair JSON da resposta
    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    let mensagens: MensagemGerada[];
    try {
      // Tentar extrair JSON do texto
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        mensagens = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON não encontrado na resposta');
      }
    } catch (parseError) {
      console.error('Erro ao parsear resposta do Claude:', parseError);
      console.error('Resposta:', responseText);
      return NextResponse.json(
        { detail: 'Erro ao processar resposta da IA' },
        { status: 500 }
      );
    }

    // Calcular custo estimado
    const inputTokens = response.usage?.input_tokens || 0;
    const outputTokens = response.usage?.output_tokens || 0;
    const custoEstimado = (inputTokens * 0.003 + outputTokens * 0.015) / 1000;

    const tempoGeracao = (Date.now() - startTime) / 1000;

    // Gerar recomendações
    const recomendacaoGeral = `Para o público analisado de ${total} eleitores, com idade média de ${idadeMedia.toFixed(0)} anos e susceptibilidade ${susceptibilidadeMedia.toFixed(1)}/10, recomendamos focar nas mensagens que abordam os medos mais frequentes (${perfilAgregado.medos[0]?.item || 'não definido'}) e valores prioritários (${perfilAgregado.valores[0]?.item || 'não definido'}).`;

    const alertaRiscos = [
      'Mensagens de medo devem ser usadas com moderação para evitar rejeição',
      'Verifique se as mensagens estão alinhadas com a legislação eleitoral',
      'Adapte o tom conforme o canal de comunicação escolhido',
    ];

    const sequenciaSugerida = `Sugerimos começar com mensagens de esperança/valores, seguidas por mensagens econômicas, e usar o gatilho de medo apenas em momentos estratégicos específicos.`;

    return NextResponse.json({
      mensagens,
      recomendacao_geral: recomendacaoGeral,
      alerta_riscos: alertaRiscos,
      sequencia_sugerida: sequenciaSugerida,
      metadados: {
        objetivo,
        total_eleitores_analisados: total,
        gatilhos_utilizados: gatilhos,
        tempo_geracao_segundos: tempoGeracao,
        custo_estimado_usd: custoEstimado,
        gerado_em: new Date().toISOString(),
      },
      perfil_agregado: perfilAgregado,
    });
  } catch (error) {
    console.error('Erro ao gerar mensagens:', error);
    return NextResponse.json(
      { detail: 'Erro ao gerar mensagens' },
      { status: 500 }
    );
  }
}
