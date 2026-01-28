/**
 * API Route: /api/v1/mensagens/preview
 *
 * Retorna preview do público-alvo baseado nos filtros aplicados.
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

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
}

interface Filtros {
  regiao_administrativa?: string[];
  cluster_socioeconomico?: string[];
  orientacao_politica?: string[];
  religiao?: string[];
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
  try {
    const body = await request.json();
    const filtros: Filtros = body.filtros || {};

    // Carregar eleitores
    const fileContent = await fs.readFile(ELEITORES_FILE, 'utf-8');
    let eleitores: Eleitor[] = JSON.parse(fileContent);

    // Aplicar filtros
    if (filtros.regiao_administrativa?.length) {
      eleitores = eleitores.filter(e =>
        filtros.regiao_administrativa!.includes(e.regiao_administrativa)
      );
    }

    if (filtros.cluster_socioeconomico?.length) {
      eleitores = eleitores.filter(e =>
        filtros.cluster_socioeconomico!.includes(e.cluster_socioeconomico)
      );
    }

    if (filtros.orientacao_politica?.length) {
      eleitores = eleitores.filter(e =>
        filtros.orientacao_politica!.includes(e.orientacao_politica)
      );
    }

    if (filtros.religiao?.length) {
      eleitores = eleitores.filter(e =>
        filtros.religiao!.includes(e.religiao)
      );
    }

    const total = eleitores.length;

    if (total === 0) {
      return NextResponse.json({
        total: 0,
        perfil_resumido: null,
      });
    }

    // Calcular estatísticas
    const idadeMedia = eleitores.reduce((sum, e) => sum + e.idade, 0) / total;
    const susceptibilidadeMedia = eleitores.reduce((sum, e) =>
      sum + calcularSusceptibilidade(e.susceptibilidade_desinformacao), 0
    ) / total;

    // Top regiões
    const todasRegioes = eleitores.map(e => e.regiao_administrativa);
    const topRegioes = contarFrequencias(todasRegioes).slice(0, 5);

    // Top medos
    const todosMedos = eleitores.flatMap(e => e.medos || []);
    const topMedos = contarFrequencias(todosMedos).slice(0, 5);

    // Top valores
    const todosValores = eleitores.flatMap(e => e.valores || []);
    const topValores = contarFrequencias(todosValores).slice(0, 5);

    return NextResponse.json({
      total,
      perfil_resumido: {
        idade_media: idadeMedia,
        susceptibilidade_media: susceptibilidadeMedia,
        top_regioes: topRegioes.map(r => ({ item: r.item, percentual: r.percentual })),
        top_medos: topMedos.map(m => ({ item: m.item, percentual: m.percentual })),
        top_valores: topValores.map(v => ({ item: v.item, percentual: v.percentual })),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar preview:', error);
    return NextResponse.json(
      { detail: 'Erro ao buscar preview do público' },
      { status: 500 }
    );
  }
}
