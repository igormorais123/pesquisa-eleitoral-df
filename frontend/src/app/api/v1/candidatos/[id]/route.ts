/**
 * API Route: /api/v1/candidatos/[id]
 *
 * Operações em candidato específico.
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Força rota dinâmica
export const dynamic = 'force-dynamic';

const CANDIDATOS_FILE = path.join(process.cwd(), 'public', 'data', 'banco-candidatos-df-2026.json');

interface BancoCandidatos {
  metadados: any;
  candidatos: any[];
}

async function loadCandidatos(): Promise<BancoCandidatos> {
  const fileContent = await fs.readFile(CANDIDATOS_FILE, 'utf-8');
  return JSON.parse(fileContent);
}

async function saveCandidatos(data: BancoCandidatos): Promise<void> {
  await fs.writeFile(CANDIDATOS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function transformCandidato(c: any) {
  const now = new Date().toISOString();
  return {
    id: c.id,
    nome: c.nome,
    nome_urna: c.nome_urna,
    partido: c.partido || 'Sem partido',
    numero_partido: c.numero_partido,
    cargo_pretendido: c.cargo_pretendido,
    status_candidatura: c.status_candidatura,
    coligacao: c.coligacao,
    vice_ou_suplentes: c.vice_ou_suplentes,
    foto_url: c.foto_url,
    cor_campanha: c.cor_campanha,
    slogan: c.slogan,
    idade: c.idade,
    data_nascimento: c.data_nascimento,
    genero: c.genero,
    naturalidade: c.naturalidade,
    profissao: c.profissao,
    cargo_atual: c.cargo_atual,
    historico_politico: c.historico_politico || [],
    biografia: c.biografia,
    propostas_principais: c.propostas_principais || [],
    areas_foco: c.areas_foco || [],
    redes_sociais: c.redes_sociais,
    site_campanha: c.site_campanha,
    orientacao_politica: c.orientacao_politica,
    posicao_bolsonaro: c.posicao_bolsonaro,
    posicao_lula: c.posicao_lula,
    eleicoes_anteriores: c.eleicoes_anteriores || [],
    votos_ultima_eleicao: c.eleicoes_anteriores?.[0]?.votos,
    intencao_voto_pesquisa: c.intencao_voto_pesquisa,
    pontos_fortes: c.pontos_fortes || [],
    pontos_fracos: c.pontos_fracos || [],
    controversias: c.controversias || [],
    rejeicao_estimada: c.rejeicao_estimada,
    conhecimento_estimado: c.conhecimento_estimado,
    elegivel: c.elegivel,
    observacao_elegibilidade: c.observacao_elegibilidade,
    ativo: c.ativo,
    ordem_exibicao: c.ordem_exibicao,
    criado_em: now,
    atualizado_em: now,
  };
}

/**
 * GET /api/v1/candidatos/[id]
 * Busca candidato por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await loadCandidatos();
    const candidato = data.candidatos.find(c => c.id === id);

    if (!candidato) {
      return NextResponse.json(
        { detail: 'Candidato não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(transformCandidato(candidato));
  } catch (error) {
    console.error('Erro ao buscar candidato:', error);
    return NextResponse.json(
      { detail: 'Erro ao buscar candidato' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/candidatos/[id]
 * Atualiza candidato
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await loadCandidatos();

    const index = data.candidatos.findIndex(c => c.id === id);
    if (index === -1) {
      return NextResponse.json(
        { detail: 'Candidato não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar campos
    const candidatoAtual = data.candidatos[index];
    const candidatoAtualizado = {
      ...candidatoAtual,
      ...body,
      id: candidatoAtual.id, // ID não pode ser alterado
    };

    data.candidatos[index] = candidatoAtualizado;
    data.metadados.data_atualizacao = new Date().toISOString().split('T')[0];

    await saveCandidatos(data);

    return NextResponse.json(transformCandidato(candidatoAtualizado));
  } catch (error) {
    console.error('Erro ao atualizar candidato:', error);
    return NextResponse.json(
      { detail: 'Erro ao atualizar candidato' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/candidatos/[id]
 * Remove candidato
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await loadCandidatos();

    const index = data.candidatos.findIndex(c => c.id === id);
    if (index === -1) {
      return NextResponse.json(
        { detail: 'Candidato não encontrado' },
        { status: 404 }
      );
    }

    data.candidatos.splice(index, 1);
    data.metadados.total_candidatos = data.candidatos.length;
    data.metadados.data_atualizacao = new Date().toISOString().split('T')[0];

    await saveCandidatos(data);

    return NextResponse.json({ message: 'Candidato removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover candidato:', error);
    return NextResponse.json(
      { detail: 'Erro ao remover candidato' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/candidatos/[id]
 * Ativa/desativa candidato
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const action = url.pathname.split('/').pop();

    const data = await loadCandidatos();
    const index = data.candidatos.findIndex(c => c.id === id);

    if (index === -1) {
      return NextResponse.json(
        { detail: 'Candidato não encontrado' },
        { status: 404 }
      );
    }

    // Toggle ativo/inativo baseado no body ou na ação
    const body = await request.json().catch(() => ({}));
    if (body.ativo !== undefined) {
      data.candidatos[index].ativo = body.ativo;
    } else {
      // Toggle
      data.candidatos[index].ativo = !data.candidatos[index].ativo;
    }

    data.metadados.data_atualizacao = new Date().toISOString().split('T')[0];
    await saveCandidatos(data);

    return NextResponse.json(transformCandidato(data.candidatos[index]));
  } catch (error) {
    console.error('Erro ao atualizar status do candidato:', error);
    return NextResponse.json(
      { detail: 'Erro ao atualizar status do candidato' },
      { status: 500 }
    );
  }
}
