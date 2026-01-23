/**
 * Serviço de API para Sessões de Entrevista
 *
 * Gerencia a sincronização entre IndexedDB local e PostgreSQL
 */

import { api } from './api';
import { db, SessaoEntrevista as SessaoLocal } from '@/lib/db/dexie';
import type { ResultadoEntrevista } from '@/types';

// Tipos da API
export interface SessaoAPI {
  id: string;
  entrevistaId: string;
  titulo: string;
  status: 'em_andamento' | 'pausada' | 'concluida' | 'erro';
  progresso: number;
  totalAgentes: number;
  custoAtual: number;
  tokensInput: number;
  tokensOutput: number;
  perguntas?: Array<{
    id: string;
    texto: string;
    tipo: string;
    opcoes?: string[];
  }>;
  respostas?: Array<{
    eleitor_id: string;
    eleitor_nome: string;
    respostas: Array<{
      pergunta_id: string;
      resposta: string | number | string[];
    }>;
    tokens_usados: number;
    custo: number;
    tempo_resposta_ms: number;
  }>;
  resultado?: ResultadoEntrevista;
  relatorioIA?: Record<string, unknown>;
  estatisticas?: Record<string, unknown>;
  modeloUsado?: string;
  configuracoes?: Record<string, unknown>;
  iniciadaEm?: string;
  atualizadaEm?: string;
  finalizadaEm?: string;
  usuarioId?: string;
  usuarioNome?: string;
  sincronizado?: boolean;
  versao?: number;
}

export interface ListaSessoesResponse {
  sessoes: SessaoAPI[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

export interface SincronizarResponse {
  sucesso: boolean;
  sincronizadas: number;
  erros: Array<{ id: string; erro: string }>;
  sessoes: SessaoAPI[];
}

export interface MigrarResponse {
  sucesso: boolean;
  total_recebidas: number;
  migradas: number;
  ignoradas: number;
  erros: Array<{ id: string; erro: string }>;
}

export interface EstatisticasSessoes {
  total_sessoes: number;
  por_status: Record<string, number>;
  custo_total: number;
  tokens_input_total: number;
  tokens_output_total: number;
  tokens_total: number;
}

// ============================================
// FUNÇÕES DE API
// ============================================

/**
 * Lista sessões do usuário no servidor
 */
export async function listarSessoes(
  pagina = 1,
  porPagina = 20,
  status?: string,
  busca?: string
): Promise<ListaSessoesResponse> {
  const params = new URLSearchParams();
  params.append('pagina', pagina.toString());
  params.append('por_pagina', porPagina.toString());
  if (status) params.append('status', status);
  if (busca) params.append('busca', busca);

  const response = await api.get(`/sessoes?${params.toString()}`);
  return response.data;
}

/**
 * Obtém uma sessão específica do servidor
 */
export async function obterSessao(sessaoId: string): Promise<SessaoAPI> {
  const response = await api.get(`/sessoes/${sessaoId}`);
  return response.data;
}

/**
 * Cria ou atualiza uma sessão no servidor
 */
export async function salvarSessao(sessao: SessaoLocal): Promise<SessaoAPI> {
  const dados = converterParaAPI(sessao);
  const response = await api.post('/sessoes', dados);
  return response.data;
}

/**
 * Atualiza uma sessão existente no servidor
 */
export async function atualizarSessao(
  sessaoId: string,
  dados: Partial<SessaoLocal>
): Promise<SessaoAPI> {
  const response = await api.put(`/sessoes/${sessaoId}`, converterParaAPI(dados as SessaoLocal));
  return response.data;
}

/**
 * Deleta uma sessão do servidor
 */
export async function deletarSessao(sessaoId: string): Promise<void> {
  await api.delete(`/sessoes/${sessaoId}`);
}

/**
 * Sincroniza múltiplas sessões com o servidor
 */
export async function sincronizarSessoes(sessoes: SessaoLocal[]): Promise<SincronizarResponse> {
  const dados = sessoes.map(converterParaAPI);
  const response = await api.post('/sessoes/sincronizar', { sessoes: dados });
  return response.data;
}

/**
 * Migra todas as sessões locais para o servidor
 */
export async function migrarSessoesLocais(
  substituirExistentes = false
): Promise<MigrarResponse> {
  // Buscar todas as sessões do IndexedDB
  const sessoesLocais = await db.sessoes.toArray();

  if (sessoesLocais.length === 0) {
    return {
      sucesso: true,
      total_recebidas: 0,
      migradas: 0,
      ignoradas: 0,
      erros: [],
    };
  }

  const dados = sessoesLocais.map(converterParaAPI);
  const response = await api.post('/sessoes/migrar', {
    sessoes: dados,
    substituir_existentes: substituirExistentes,
  });

  return response.data;
}

/**
 * Obtém estatísticas das sessões do usuário
 */
export async function obterEstatisticas(): Promise<EstatisticasSessoes> {
  const response = await api.get('/sessoes/resumo/estatisticas');
  return response.data;
}

// ============================================
// SINCRONIZAÇÃO BIDIRECIONAL
// ============================================

/**
 * Sincroniza dados entre local e servidor
 * - Envia sessões locais novas/atualizadas para o servidor
 * - Baixa sessões do servidor que não existem localmente
 */
export async function sincronizarBidirecional(): Promise<{
  enviadas: number;
  recebidas: number;
  erros: string[];
}> {
  const erros: string[] = [];
  let enviadas = 0;
  let recebidas = 0;

  try {
    // 1. Buscar sessões locais
    const sessoesLocais = await db.sessoes.toArray();

    // 2. Enviar sessões locais para o servidor
    if (sessoesLocais.length > 0) {
      try {
        const resultadoSync = await sincronizarSessoes(sessoesLocais);
        enviadas = resultadoSync.sincronizadas;

        if (resultadoSync.erros.length > 0) {
          erros.push(...resultadoSync.erros.map((e) => `${e.id}: ${e.erro}`));
        }
      } catch (e) {
        erros.push(`Erro ao enviar sessões: ${e instanceof Error ? e.message : 'Erro desconhecido'}`);
      }
    }

    // 3. Buscar sessões do servidor
    try {
      const { sessoes: sessoesServidor } = await listarSessoes(1, 1000);

      // 4. Salvar sessões do servidor que não existem localmente
      for (const sessaoAPI of sessoesServidor) {
        const existeLocal = await db.sessoes.get(sessaoAPI.id);

        if (!existeLocal) {
          const sessaoLocal = converterParaLocal(sessaoAPI);
          await db.sessoes.put(sessaoLocal);
          recebidas++;
        } else if (sessaoAPI.versao && existeLocal.usuarioId) {
          // Se a versão do servidor for mais recente, atualizar local
          const sessaoLocal = converterParaLocal(sessaoAPI);
          await db.sessoes.put(sessaoLocal);
        }
      }
    } catch (e) {
      erros.push(`Erro ao baixar sessões: ${e instanceof Error ? e.message : 'Erro desconhecido'}`);
    }

    return { enviadas, recebidas, erros };
  } catch (e) {
    erros.push(`Erro geral: ${e instanceof Error ? e.message : 'Erro desconhecido'}`);
    return { enviadas, recebidas, erros };
  }
}

/**
 * Carrega sessões do servidor para o banco local
 * Usado quando usuário faz login
 */
export async function carregarSessoesDoServidor(): Promise<number> {
  try {
    const { sessoes } = await listarSessoes(1, 1000);
    let carregadas = 0;

    for (const sessaoAPI of sessoes) {
      const sessaoLocal = converterParaLocal(sessaoAPI);
      await db.sessoes.put(sessaoLocal);
      carregadas++;
    }

    return carregadas;
  } catch (e) {
    console.error('Erro ao carregar sessões do servidor:', e);
    return 0;
  }
}

// ============================================
// CONVERSORES
// ============================================

/**
 * Converte sessão local (Dexie) para formato da API
 */
function converterParaAPI(sessao: SessaoLocal): SessaoAPI {
  return {
    id: sessao.id,
    entrevistaId: sessao.entrevistaId,
    titulo: sessao.titulo,
    status: sessao.status,
    progresso: sessao.progresso,
    totalAgentes: sessao.totalAgentes,
    custoAtual: sessao.custoAtual,
    tokensInput: sessao.tokensInput,
    tokensOutput: sessao.tokensOutput,
    perguntas: undefined, // Será preenchido se existir
    respostas: sessao.respostas,
    resultado: sessao.resultado,
    relatorioIA: undefined, // Será preenchido se existir
    estatisticas: undefined, // Será preenchido se existir
    modeloUsado: undefined,
    configuracoes: undefined,
    iniciadaEm: sessao.iniciadaEm,
    atualizadaEm: sessao.atualizadaEm,
    finalizadaEm: sessao.finalizadaEm,
    usuarioId: sessao.usuarioId,
    usuarioNome: sessao.usuarioNome,
  };
}

/**
 * Converte sessão da API para formato local (Dexie)
 */
function converterParaLocal(sessaoAPI: SessaoAPI): SessaoLocal {
  return {
    id: sessaoAPI.id,
    entrevistaId: sessaoAPI.entrevistaId,
    titulo: sessaoAPI.titulo,
    status: sessaoAPI.status,
    progresso: sessaoAPI.progresso,
    totalAgentes: sessaoAPI.totalAgentes,
    custoAtual: sessaoAPI.custoAtual,
    tokensInput: sessaoAPI.tokensInput,
    tokensOutput: sessaoAPI.tokensOutput,
    respostas: sessaoAPI.respostas || [],
    resultado: sessaoAPI.resultado as ResultadoEntrevista | undefined,
    iniciadaEm: sessaoAPI.iniciadaEm || new Date().toISOString(),
    atualizadaEm: sessaoAPI.atualizadaEm || new Date().toISOString(),
    finalizadaEm: sessaoAPI.finalizadaEm,
    usuarioId: sessaoAPI.usuarioId,
    usuarioNome: sessaoAPI.usuarioNome,
  };
}

const sessoesApi = {
  listarSessoes,
  obterSessao,
  salvarSessao,
  atualizarSessao,
  deletarSessao,
  sincronizarSessoes,
  migrarSessoesLocais,
  obterEstatisticas,
  sincronizarBidirecional,
  carregarSessoesDoServidor,
};

export default sessoesApi;
