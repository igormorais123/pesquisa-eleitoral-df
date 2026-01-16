/**
 * API de Pesquisas Persistidas
 *
 * Serviços para comunicação com os endpoints de pesquisas no banco de dados.
 */

import { api, tratarErroApi } from './api';

// ============================================
// TIPOS
// ============================================

export type StatusPesquisa = 'rascunho' | 'executando' | 'pausada' | 'concluida' | 'erro';
export type TipoPesquisa = 'quantitativa' | 'qualitativa' | 'mista';
export type TipoPergunta = 'aberta' | 'aberta_longa' | 'escala_likert' | 'multipla_escolha' | 'sim_nao' | 'ranking';

export interface PerguntaPesquisa {
  id?: string;
  texto: string;
  tipo: TipoPergunta;
  ordem: number;
  obrigatoria: boolean;
  opcoes?: string[];
  escala_min?: number;
  escala_max?: number;
  escala_rotulos?: string[];
  instrucoes_ia?: string;
}

export interface RespostaPesquisa {
  id: string;
  pesquisa_id: string;
  pergunta_id: string;
  eleitor_id: string;
  eleitor_nome: string;
  eleitor_perfil?: Record<string, unknown>;
  resposta_texto: string;
  resposta_valor?: unknown;
  fluxo_cognitivo?: Record<string, unknown>;
  sentimento?: string;
  intensidade_sentimento?: number;
  modelo_usado: string;
  tokens_entrada: number;
  tokens_saida: number;
  custo_reais: number;
  tempo_resposta_ms: number;
  criado_em: string;
}

export interface PesquisaResumo {
  id: string;
  titulo: string;
  tipo: TipoPesquisa;
  status: StatusPesquisa;
  progresso: number;
  total_eleitores: number;
  total_perguntas: number;
  total_respostas: number;
  custo_real: number;
  criado_em: string;
  concluido_em?: string;
}

export interface Pesquisa extends PesquisaResumo {
  descricao?: string;
  instrucao_geral?: string;
  erro_mensagem?: string;
  eleitores_processados: number;
  eleitores_ids?: string[];
  custo_estimado: number;
  tokens_entrada_total: number;
  tokens_saida_total: number;
  limite_custo: number;
  usar_opus_complexas: boolean;
  batch_size: number;
  atualizado_em: string;
  iniciado_em?: string;
  pausado_em?: string;
  perguntas: PerguntaPesquisa[];
}

export interface PesquisaCompleta extends Pesquisa {
  respostas: RespostaPesquisa[];
}

export interface PesquisaCreate {
  titulo: string;
  descricao?: string;
  tipo: TipoPesquisa;
  instrucao_geral?: string;
  perguntas: Omit<PerguntaPesquisa, 'id'>[];
  eleitores_ids: string[];
  limite_custo?: number;
  usar_opus_complexas?: boolean;
  batch_size?: number;
}

export interface RespostaCreate {
  pesquisa_id: string;
  pergunta_id: string;
  eleitor_id: string;
  eleitor_nome: string;
  eleitor_perfil?: Record<string, unknown>;
  resposta_texto: string;
  resposta_valor?: unknown;
  fluxo_cognitivo?: Record<string, unknown>;
  sentimento?: string;
  intensidade_sentimento?: number;
  modelo_usado?: string;
  tokens_entrada?: number;
  tokens_saida?: number;
  custo_reais?: number;
  tempo_resposta_ms?: number;
}

export interface FiltrosPesquisa {
  status?: StatusPesquisa;
  tipo?: TipoPesquisa;
  data_inicio?: string;
  data_fim?: string;
  busca?: string;
}

export interface PesquisaListResponse {
  pesquisas: PesquisaResumo[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

export interface RespostaListResponse {
  respostas: RespostaPesquisa[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

// ============================================
// SERVIÇOS DE PESQUISAS
// ============================================

/**
 * Lista pesquisas com filtros e paginação
 */
export async function listarPesquisas(
  filtros?: FiltrosPesquisa,
  pagina = 1,
  porPagina = 20
): Promise<PesquisaListResponse> {
  const params = new URLSearchParams();

  if (filtros?.status) params.append('status', filtros.status);
  if (filtros?.tipo) params.append('tipo', filtros.tipo);
  if (filtros?.data_inicio) params.append('data_inicio', filtros.data_inicio);
  if (filtros?.data_fim) params.append('data_fim', filtros.data_fim);
  if (filtros?.busca) params.append('busca', filtros.busca);

  params.append('pagina', String(pagina));
  params.append('por_pagina', String(porPagina));

  const response = await api.get<PesquisaListResponse>(`/pesquisas?${params}`);
  return response.data;
}

/**
 * Cria uma nova pesquisa
 */
export async function criarPesquisa(dados: PesquisaCreate): Promise<Pesquisa> {
  const response = await api.post<Pesquisa>('/pesquisas', dados);
  return response.data;
}

/**
 * Obtém detalhes de uma pesquisa
 */
export async function obterPesquisa(id: string): Promise<Pesquisa> {
  const response = await api.get<Pesquisa>(`/pesquisas/${id}`);
  return response.data;
}

/**
 * Obtém pesquisa com todas as respostas
 */
export async function obterPesquisaCompleta(id: string): Promise<PesquisaCompleta> {
  const response = await api.get<PesquisaCompleta>(`/pesquisas/${id}/completa`);
  return response.data;
}

/**
 * Deleta uma pesquisa
 */
export async function deletarPesquisa(id: string): Promise<void> {
  await api.delete(`/pesquisas/${id}`);
}

// ============================================
// RESPOSTAS
// ============================================

/**
 * Lista respostas de uma pesquisa
 */
export async function listarRespostas(
  pesquisaId: string,
  perguntaId?: string,
  eleitorId?: string,
  pagina = 1,
  porPagina = 50
): Promise<RespostaListResponse> {
  const params = new URLSearchParams();

  if (perguntaId) params.append('pergunta_id', perguntaId);
  if (eleitorId) params.append('eleitor_id', eleitorId);
  params.append('pagina', String(pagina));
  params.append('por_pagina', String(porPagina));

  const response = await api.get<RespostaListResponse>(
    `/pesquisas/${pesquisaId}/respostas?${params}`
  );
  return response.data;
}

/**
 * Registra uma nova resposta
 */
export async function registrarResposta(
  pesquisaId: string,
  dados: RespostaCreate
): Promise<RespostaPesquisa> {
  const response = await api.post<RespostaPesquisa>(
    `/pesquisas/${pesquisaId}/respostas`,
    dados
  );
  return response.data;
}

// ============================================
// CONTROLE DE EXECUÇÃO
// ============================================

/**
 * Inicia execução de uma pesquisa
 */
export async function iniciarPesquisa(id: string): Promise<void> {
  await api.post(`/pesquisas/${id}/iniciar`);
}

/**
 * Pausa execução de uma pesquisa
 */
export async function pausarPesquisa(id: string): Promise<void> {
  await api.post(`/pesquisas/${id}/pausar`);
}

/**
 * Retoma execução de uma pesquisa pausada
 */
export async function retomarPesquisa(id: string): Promise<void> {
  await api.post(`/pesquisas/${id}/retomar`);
}

/**
 * Finaliza execução de uma pesquisa
 */
export async function finalizarPesquisa(id: string, erro?: string): Promise<void> {
  const params = erro ? `?erro=${encodeURIComponent(erro)}` : '';
  await api.post(`/pesquisas/${id}/finalizar${params}`);
}

/**
 * Atualiza progresso de execução
 */
export async function atualizarProgresso(
  id: string,
  progresso: number,
  eleitoresProcessados: number
): Promise<void> {
  await api.put(
    `/pesquisas/${id}/progresso?progresso=${progresso}&eleitores_processados=${eleitoresProcessados}`
  );
}

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Formata status para exibição
 */
export function formatarStatus(status: StatusPesquisa): string {
  const mapa: Record<StatusPesquisa, string> = {
    rascunho: 'Rascunho',
    executando: 'Em execução',
    pausada: 'Pausada',
    concluida: 'Concluída',
    erro: 'Erro',
  };
  return mapa[status] || status;
}

/**
 * Retorna cor do badge por status
 */
export function corStatus(status: StatusPesquisa): string {
  const mapa: Record<StatusPesquisa, string> = {
    rascunho: 'bg-gray-100 text-gray-800',
    executando: 'bg-blue-100 text-blue-800',
    pausada: 'bg-yellow-100 text-yellow-800',
    concluida: 'bg-green-100 text-green-800',
    erro: 'bg-red-100 text-red-800',
  };
  return mapa[status] || 'bg-gray-100 text-gray-800';
}

export { tratarErroApi };
