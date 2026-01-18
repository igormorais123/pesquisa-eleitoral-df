/**
 * API Route: /api/v1/candidatos
 *
 * Gerencia candidatos eleitorais do DF 2026.
 * Lê dados do arquivo JSON e serve via API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Força rota dinâmica
export const dynamic = 'force-dynamic';

// Caminho para o arquivo de candidatos
const CANDIDATOS_FILE = path.join(process.cwd(), '..', 'agentes', 'banco-candidatos-df-2026.json');

interface CandidatoJSON {
  id: string;
  nome: string;
  nome_urna: string;
  partido: string | null;
  numero_partido: number | null;
  cargo_pretendido: string;
  status_candidatura: string;
  coligacao: string | null;
  vice_ou_suplentes: string | null;
  foto_url: string | null;
  cor_campanha: string | null;
  slogan: string | null;
  idade: number | null;
  data_nascimento: string | null;
  genero: string;
  naturalidade: string | null;
  profissao: string | null;
  cargo_atual: string | null;
  historico_politico: string[];
  biografia: string | null;
  propostas_principais: string[];
  areas_foco: string[];
  redes_sociais: {
    instagram?: string | null;
    twitter?: string | null;
    facebook?: string | null;
    youtube?: string | null;
  } | null;
  site_campanha: string | null;
  orientacao_politica: string | null;
  posicao_bolsonaro: string | null;
  posicao_lula?: string | null;
  eleicoes_anteriores: Array<{
    ano: number;
    cargo: string;
    resultado: string;
    votos: number | null;
    percentual: number | null;
  }>;
  intencao_voto_pesquisa?: number;
  rejeicao_estimada?: number;
  conhecimento_estimado?: number;
  pontos_fortes: string[];
  pontos_fracos: string[];
  controversias: string[];
  elegivel: boolean;
  observacao_elegibilidade?: string;
  ativo: boolean;
  ordem_exibicao: number;
}

interface BancoCandidatos {
  metadados: {
    versao: string;
    data_criacao: string;
    data_atualizacao: string;
    descricao: string;
    total_candidatos: number;
    fonte_pesquisa: string;
  };
  candidatos: CandidatoJSON[];
}

// Cache em memória para evitar leituras frequentes do disco
let cachedData: BancoCandidatos | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60000; // 1 minuto

async function loadCandidatos(): Promise<BancoCandidatos> {
  const now = Date.now();

  // Retorna cache se ainda válido
  if (cachedData && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedData;
  }

  try {
    const fileContent = await fs.readFile(CANDIDATOS_FILE, 'utf-8');
    cachedData = JSON.parse(fileContent);
    cacheTimestamp = now;
    return cachedData!;
  } catch (error) {
    console.error('Erro ao ler arquivo de candidatos:', error);
    throw new Error('Não foi possível carregar os dados dos candidatos');
  }
}

function transformCandidato(c: CandidatoJSON) {
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
 * GET /api/v1/candidatos
 * Lista candidatos com filtros e paginação
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parâmetros de paginação
    const pagina = parseInt(searchParams.get('pagina') || '1');
    const porPagina = parseInt(searchParams.get('por_pagina') || '50');

    // Filtros
    const busca = searchParams.get('busca')?.toLowerCase();
    const partidos = searchParams.get('partidos')?.split(',').filter(Boolean);
    const cargos = searchParams.get('cargos')?.split(',').filter(Boolean);
    const status = searchParams.get('status')?.split(',').filter(Boolean);
    const orientacoes = searchParams.get('orientacoes')?.split(',').filter(Boolean);
    const generos = searchParams.get('generos')?.split(',').filter(Boolean);
    const apenasAtivos = searchParams.get('apenas_ativos') !== 'false';

    // Ordenação
    const ordenarPor = searchParams.get('ordenar_por') || 'ordem_exibicao';
    const ordem = searchParams.get('ordem') || 'asc';

    // Carregar dados
    const data = await loadCandidatos();
    let candidatos = data.candidatos.map(transformCandidato);

    // Aplicar filtros
    if (apenasAtivos) {
      candidatos = candidatos.filter(c => c.ativo);
    }

    if (busca) {
      candidatos = candidatos.filter(c =>
        c.nome.toLowerCase().includes(busca) ||
        c.nome_urna.toLowerCase().includes(busca) ||
        c.partido.toLowerCase().includes(busca) ||
        c.biografia?.toLowerCase().includes(busca)
      );
    }

    if (partidos?.length) {
      candidatos = candidatos.filter(c => partidos.includes(c.partido));
    }

    if (cargos?.length) {
      candidatos = candidatos.filter(c => cargos.includes(c.cargo_pretendido));
    }

    if (status?.length) {
      candidatos = candidatos.filter(c => status.includes(c.status_candidatura));
    }

    if (orientacoes?.length) {
      candidatos = candidatos.filter(c => c.orientacao_politica && orientacoes.includes(c.orientacao_politica));
    }

    if (generos?.length) {
      candidatos = candidatos.filter(c => c.genero && generos.includes(c.genero));
    }

    // Ordenar
    candidatos.sort((a, b) => {
      let valorA: any = a[ordenarPor as keyof typeof a];
      let valorB: any = b[ordenarPor as keyof typeof b];

      // Tratar valores nulos
      if (valorA == null) valorA = ordem === 'asc' ? Infinity : -Infinity;
      if (valorB == null) valorB = ordem === 'asc' ? Infinity : -Infinity;

      if (typeof valorA === 'string') {
        return ordem === 'asc'
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA);
      }

      return ordem === 'asc' ? valorA - valorB : valorB - valorA;
    });

    // Paginação
    const total = candidatos.length;
    const totalPaginas = Math.ceil(total / porPagina);
    const inicio = (pagina - 1) * porPagina;
    const fim = inicio + porPagina;
    const candidatosPaginados = candidatos.slice(inicio, fim);

    return NextResponse.json({
      candidatos: candidatosPaginados,
      total,
      pagina,
      por_pagina: porPagina,
      total_paginas: totalPaginas,
      tem_proxima: pagina < totalPaginas,
      tem_anterior: pagina > 1,
    });
  } catch (error) {
    console.error('Erro ao buscar candidatos:', error);
    return NextResponse.json(
      { detail: 'Erro ao buscar candidatos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/candidatos
 * Cria novo candidato (adiciona ao JSON)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar campos obrigatórios
    if (!body.nome || !body.nome_urna || !body.partido || !body.cargo_pretendido) {
      return NextResponse.json(
        { detail: 'Campos obrigatórios: nome, nome_urna, partido, cargo_pretendido' },
        { status: 400 }
      );
    }

    // Carregar dados existentes
    const data = await loadCandidatos();

    // Gerar ID único
    const id = `cand-${body.nome_urna.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    // Criar novo candidato
    const novoCandidato: CandidatoJSON = {
      id,
      nome: body.nome,
      nome_urna: body.nome_urna,
      partido: body.partido,
      numero_partido: body.numero_partido || null,
      cargo_pretendido: body.cargo_pretendido,
      status_candidatura: body.status_candidatura || 'pre_candidato',
      coligacao: body.coligacao || null,
      vice_ou_suplentes: body.vice_ou_suplentes || null,
      foto_url: body.foto_url || null,
      cor_campanha: body.cor_campanha || null,
      slogan: body.slogan || null,
      idade: body.idade || null,
      data_nascimento: body.data_nascimento || null,
      genero: body.genero || 'masculino',
      naturalidade: body.naturalidade || null,
      profissao: body.profissao || null,
      cargo_atual: body.cargo_atual || null,
      historico_politico: body.historico_politico || [],
      biografia: body.biografia || null,
      propostas_principais: body.propostas_principais || [],
      areas_foco: body.areas_foco || [],
      redes_sociais: body.redes_sociais || null,
      site_campanha: body.site_campanha || null,
      orientacao_politica: body.orientacao_politica || null,
      posicao_bolsonaro: body.posicao_bolsonaro || null,
      posicao_lula: body.posicao_lula || null,
      eleicoes_anteriores: body.eleicoes_anteriores || [],
      pontos_fortes: body.pontos_fortes || [],
      pontos_fracos: body.pontos_fracos || [],
      controversias: body.controversias || [],
      elegivel: body.elegivel !== false,
      ativo: true,
      ordem_exibicao: data.candidatos.length + 1,
    };

    // Adicionar ao array
    data.candidatos.push(novoCandidato);
    data.metadados.total_candidatos = data.candidatos.length;
    data.metadados.data_atualizacao = new Date().toISOString().split('T')[0];

    // Salvar arquivo
    await fs.writeFile(CANDIDATOS_FILE, JSON.stringify(data, null, 2), 'utf-8');

    // Invalidar cache
    cachedData = null;

    return NextResponse.json(transformCandidato(novoCandidato), { status: 201 });
  } catch (error) {
    console.error('Erro ao criar candidato:', error);
    return NextResponse.json(
      { detail: 'Erro ao criar candidato' },
      { status: 500 }
    );
  }
}
