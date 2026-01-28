/**
 * API Route: /api/v1/candidatos/por-cargo/[cargo]
 *
 * Lista candidatos por cargo pretendido.
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Força rota dinâmica
export const dynamic = 'force-dynamic';

const CANDIDATOS_FILE = path.join(process.cwd(), 'public', 'data', 'banco-candidatos-df-2026.json');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cargo: string }> }
) {
  try {
    const { cargo } = await params;
    const fileContent = await fs.readFile(CANDIDATOS_FILE, 'utf-8');
    const data = JSON.parse(fileContent);

    const candidatos = data.candidatos
      .filter((c: any) => c.ativo && c.cargo_pretendido === cargo)
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
        orientacao_politica: c.orientacao_politica,
        intencao_voto_pesquisa: c.intencao_voto_pesquisa,
        rejeicao_estimada: c.rejeicao_estimada,
        elegivel: c.elegivel,
        ativo: c.ativo,
      }));

    return NextResponse.json({ candidatos });
  } catch (error) {
    console.error('Erro ao buscar candidatos por cargo:', error);
    return NextResponse.json(
      { detail: 'Erro ao buscar candidatos por cargo' },
      { status: 500 }
    );
  }
}
