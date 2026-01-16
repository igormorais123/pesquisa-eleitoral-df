/**
 * Serviço de API para Memórias
 *
 * Endpoints para:
 * - Analytics globais de tokens e custos
 * - Histórico completo por eleitor
 * - Listagem e busca de memórias
 */

import { api } from './api';

// ============================================
// TIPOS
// ============================================

export interface MemoriaResumo {
  id: number;
  tipo: 'entrevista' | 'interacao' | 'analise';
  eleitor_id: string;
  eleitor_nome?: string;
  pesquisa_id?: number;
  resposta_texto: string;
  modelo_usado: string;
  tokens_total: number;
  custo: number;
  criado_em: string;
}

export interface MemoriaCompleta extends MemoriaResumo {
  pergunta_id?: number;
  resposta_id?: number;
  usuario_id?: number;
  usuario_nome?: string;
  pergunta_texto?: string;
  tokens_entrada: number;
  tokens_saida: number;
  resposta_valor?: unknown;
  fluxo_cognitivo?: Record<string, unknown>;
  contexto?: Record<string, unknown>;
  metadados?: Record<string, unknown>;
  atualizado_em?: string;
}

export interface MemoriaListResponse {
  memorias: MemoriaResumo[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

export interface HistoricoEleitor {
  eleitor_id: string;
  eleitor_nome?: string;
  total_entrevistas: number;
  total_respostas: number;
  pesquisas_participadas: number[];
  tokens_total: number;
  custo_total: number;
  primeira_entrevista?: string;
  ultima_entrevista?: string;
  sentimentos_frequentes: Record<string, number>;
  memorias: MemoriaResumo[];
}

export interface UsoAPIResponse {
  periodo: string;
  tipo_periodo: string;
  total_chamadas: number;
  total_pesquisas: number;
  total_eleitores_unicos: number;
  tokens_entrada_total: number;
  tokens_saida_total: number;
  tokens_total: number;
  custo_total: number;
  chamadas_opus: number;
  chamadas_sonnet: number;
  tokens_opus: number;
  tokens_sonnet: number;
  custo_opus: number;
  custo_sonnet: number;
  tempo_resposta_medio_ms: number;
  custo_medio_por_chamada: number;
  tokens_medio_por_chamada: number;
}

export interface AnalyticsGlobais {
  total_memorias: number;
  total_pesquisas: number;
  total_eleitores_unicos: number;
  total_respostas: number;
  tokens_entrada_acumulados: number;
  tokens_saida_acumulados: number;
  tokens_acumulados: number;
  custo_acumulado: number;
  custo_medio_por_resposta: number;
  custo_medio_por_eleitor: number;
  distribuicao_modelos: Record<string, number>;
  custo_por_modelo: Record<string, number>;
  tokens_por_modelo: Record<string, number>;
  uso_por_periodo: UsoAPIResponse[];
  tendencia_custo: 'alta' | 'baixa' | 'estavel';
  tempo_resposta_medio_ms: number;
  data_primeira_memoria?: string;
  data_ultima_memoria?: string;
}

export interface AnalyticsPesquisa {
  pesquisa_id: number;
  total_respostas: number;
  eleitores_unicos: number;
  tokens_entrada: number;
  tokens_saida: number;
  tokens_total: number;
  custo_total: number;
  tempo_resposta_medio_ms: number;
  inicio?: string;
  fim?: string;
  modelos: Record<string, { total: number; custo: number }>;
}

// ============================================
// FUNÇÕES DE API - MEMÓRIAS
// ============================================

/**
 * Lista memórias com filtros e paginação
 */
export async function listarMemorias(params: {
  eleitor_id?: string;
  pesquisa_id?: number;
  usuario_id?: number;
  tipo?: string;
  modelo_usado?: string;
  data_inicio?: string;
  data_fim?: string;
  pagina?: number;
  por_pagina?: number;
} = {}): Promise<MemoriaListResponse> {
  const { data } = await api.get<MemoriaListResponse>('/api/v1/memorias/', {
    params,
  });
  return data;
}

/**
 * Obtém uma memória específica
 */
export async function obterMemoria(memoriaId: number): Promise<MemoriaCompleta> {
  const { data } = await api.get<MemoriaCompleta>(`/api/v1/memorias/${memoriaId}`);
  return data;
}

// ============================================
// FUNÇÕES DE API - HISTÓRICO POR ELEITOR
// ============================================

/**
 * Obtém histórico completo de um eleitor
 */
export async function obterHistoricoEleitor(
  eleitorId: string,
  limite: number = 50
): Promise<HistoricoEleitor> {
  const { data } = await api.get<HistoricoEleitor>(
    `/api/v1/memorias/eleitor/${eleitorId}`,
    { params: { limite } }
  );
  return data;
}

// ============================================
// FUNÇÕES DE API - ANALYTICS GLOBAIS
// ============================================

/**
 * Obtém analytics globais do sistema de memórias
 */
export async function obterAnalyticsGlobais(dias: number = 30): Promise<AnalyticsGlobais> {
  const { data } = await api.get<AnalyticsGlobais>('/api/v1/memorias/analytics/global', {
    params: { dias },
  });
  return data;
}

/**
 * Obtém estatísticas de uso da API por período
 */
export async function obterUsoAPI(
  dias: number = 30,
  tipo_periodo: 'dia' | 'semana' | 'mes' = 'dia'
): Promise<UsoAPIResponse[]> {
  const { data } = await api.get<UsoAPIResponse[]>('/api/v1/memorias/analytics/uso', {
    params: { dias, tipo_periodo },
  });
  return data;
}

/**
 * Obtém analytics de uma pesquisa específica
 */
export async function obterAnalyticsPesquisa(pesquisaId: number): Promise<AnalyticsPesquisa> {
  const { data } = await api.get<AnalyticsPesquisa>(
    `/api/v1/memorias/analytics/pesquisa/${pesquisaId}`
  );
  return data;
}

// ============================================
// FUNÇÕES DE API - MIGRAÇÃO
// ============================================

/**
 * Migra respostas existentes para memórias
 * (Usar apenas uma vez para importar dados históricos)
 */
export async function migrarRespostasParaMemorias(): Promise<{
  mensagem: string;
  total_respostas?: number;
  memorias_criadas?: number;
  memorias_existentes?: number;
}> {
  const { data } = await api.post('/api/v1/memorias/migrar-respostas');
  return data;
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

/**
 * Formata tokens para exibição
 */
export function formatarTokens(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(2)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }
  return tokens.toString();
}

/**
 * Formata custo em reais
 */
export function formatarCusto(custo: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(custo);
}

/**
 * Calcula custo por token
 */
export function calcularCustoPorToken(custo: number, tokens: number): number {
  return tokens > 0 ? custo / tokens : 0;
}

/**
 * Retorna cor baseada no modelo usado
 */
export function corModelo(modelo: string): string {
  if (modelo.includes('opus')) {
    return 'text-purple-600 bg-purple-50';
  }
  if (modelo.includes('sonnet')) {
    return 'text-blue-600 bg-blue-50';
  }
  return 'text-gray-600 bg-gray-50';
}

/**
 * Retorna ícone do sentimento
 */
export function iconeParaSentimento(sentimento: string): string {
  const icones: Record<string, string> = {
    raiva: '😠',
    medo: '😨',
    esperanca: '🌟',
    apatia: '😐',
    desconfianca: '🤨',
    entusiasmo: '🤩',
    ansiedade: '😰',
    satisfacao: '😊',
    frustracao: '😤',
    otimismo: '😃',
    pessimismo: '😞',
    indiferenca: '😑',
  };
  return icones[sentimento.toLowerCase()] || '🗣️';
}
