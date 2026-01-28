/**
 * API Route: /api/v1/candidatos/estatisticas
 *
 * Retorna estatísticas dos candidatos.
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Força rota dinâmica
export const dynamic = 'force-dynamic';

const CANDIDATOS_FILE = path.join(process.cwd(), 'public', 'data', 'banco-candidatos-df-2026.json');

export async function GET(request: NextRequest) {
  try {
    const fileContent = await fs.readFile(CANDIDATOS_FILE, 'utf-8');
    const data = JSON.parse(fileContent);
    const candidatos = data.candidatos.filter((c: any) => c.ativo);

    // Contar por cargo
    const porCargo: Record<string, number> = {};
    candidatos.forEach((c: any) => {
      const cargo = c.cargo_pretendido || 'indefinido';
      porCargo[cargo] = (porCargo[cargo] || 0) + 1;
    });

    // Contar por partido
    const porPartido: Record<string, number> = {};
    candidatos.forEach((c: any) => {
      const partido = c.partido || 'Sem partido';
      porPartido[partido] = (porPartido[partido] || 0) + 1;
    });

    // Contar por gênero
    const porGenero: Record<string, number> = {};
    candidatos.forEach((c: any) => {
      const genero = c.genero || 'indefinido';
      porGenero[genero] = (porGenero[genero] || 0) + 1;
    });

    // Contar por orientação política
    const porOrientacao: Record<string, number> = {};
    candidatos.forEach((c: any) => {
      const orientacao = c.orientacao_politica || 'indefinida';
      porOrientacao[orientacao] = (porOrientacao[orientacao] || 0) + 1;
    });

    // Contar por status
    const porStatus: Record<string, number> = {};
    candidatos.forEach((c: any) => {
      const status = c.status_candidatura || 'indefinido';
      porStatus[status] = (porStatus[status] || 0) + 1;
    });

    const total = candidatos.length;

    const toArray = (obj: Record<string, number>, labelKey: string, quantidadeKey: string = 'quantidade') => {
      return Object.entries(obj).map(([key, value]) => ({
        [labelKey]: key,
        [quantidadeKey]: value,
        percentual: total > 0 ? Math.round((value / total) * 100 * 10) / 10 : 0,
      }));
    };

    return NextResponse.json({
      total,
      por_cargo: toArray(porCargo, 'cargo'),
      por_partido: toArray(porPartido, 'partido'),
      por_genero: toArray(porGenero, 'genero'),
      por_orientacao_politica: toArray(porOrientacao, 'orientacao'),
      por_status: Object.entries(porStatus).map(([status, quantidade]) => ({ status, quantidade })),
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { detail: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
