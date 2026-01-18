/**
 * API Route: /api/v1/candidatos/para-pesquisa
 *
 * Retorna candidatos em formato simplificado para uso em pesquisas.
 */

import { NextRequest, NextResponse } from 'next/server';

// Força rota dinâmica
export const dynamic = 'force-dynamic';
import { promises as fs } from 'fs';
import path from 'path';

const CANDIDATOS_FILE = path.join(process.cwd(), '..', 'agentes', 'banco-candidatos-df-2026.json');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cargo = searchParams.get('cargo');

    const fileContent = await fs.readFile(CANDIDATOS_FILE, 'utf-8');
    const data = JSON.parse(fileContent);

    let candidatos = data.candidatos.filter((c: any) => c.ativo && c.elegivel !== false);

    if (cargo) {
      candidatos = candidatos.filter((c: any) => c.cargo_pretendido === cargo);
    }

    const candidatosResumo = candidatos
      .sort((a: any, b: any) => (a.ordem_exibicao || 0) - (b.ordem_exibicao || 0))
      .map((c: any) => ({
        id: c.id,
        nome: c.nome,
        nome_urna: c.nome_urna,
        partido: c.partido || 'Sem partido',
        numero_partido: c.numero_partido,
        cargo_pretendido: c.cargo_pretendido,
        foto_url: c.foto_url,
        cor_campanha: c.cor_campanha,
        status_candidatura: c.status_candidatura,
        ativo: c.ativo,
      }));

    return NextResponse.json({ candidatos: candidatosResumo });
  } catch (error) {
    console.error('Erro ao buscar candidatos para pesquisa:', error);
    return NextResponse.json(
      { detail: 'Erro ao buscar candidatos para pesquisa' },
      { status: 500 }
    );
  }
}
