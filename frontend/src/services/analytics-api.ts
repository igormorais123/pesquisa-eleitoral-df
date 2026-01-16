/**
 * API de Analytics e Histórico
 *
 * Serviços para análises globais, correlações e tendências.
 */

import { api } from './api';

// ============================================
// TIPOS
// ============================================

export interface DashboardGlobal {
  total_pesquisas: number;
  total_pesquisas_concluidas: number;
  total_respostas: number;
  total_eleitores_unicos: number;
  custo_total_reais: number;
  tokens_entrada_total: number;
  tokens_saida_total: number;
  media_respostas_por_pesquisa: number;
  media_custo_por_pesquisa: number;
  media_tempo_execucao_segundos: number;
  sentimentos_acumulados?: Record<string, number>;
  atualizado_em: string;
}

export interface Correlacao {
  variavel_x: string;
  variavel_y: string;
  coeficiente: number;
  p_valor: number;
  significancia: 'alta' | 'media' | 'baixa';
  amostra: number;
  interpretacao: string;
}

export interface Tendencia {
  periodo: string;
  pesquisas_realizadas: number;
  respostas_coletadas: number;
  custo_total: number;
  sentimento_medio?: number;
}

export interface SegmentoAnalise {
  segmento: string;
  valor: string;
  total_participacoes: number;
  sentimento_predominante?: string;
  temas_recorrentes?: string[];
  citacao_exemplo?: string;
}

export interface InsightGlobal {
  tipo: 'descoberta' | 'alerta' | 'correlacao' | 'tendencia';
  titulo: string;
  descricao: string;
  relevancia: 'alta' | 'media' | 'baixa';
  dados_suporte?: Record<string, unknown>;
  pesquisas_relacionadas?: string[];
  criado_em: string;
}

export interface HistoricoEleitor {
  eleitor_id: string;
  eleitor_nome?: string;
  total_participacoes: number;
  pesquisas: Array<{
    pesquisa_id: string;
    titulo: string;
    data: string;
    total_respostas: number;
    respostas: Array<{
      pergunta_id: string;
      resposta_texto: string;
      sentimento?: string;
    }>;
  }>;
}

export interface BuscaRespostasResult {
  termo_busca: string;
  total_encontrado: number;
  respostas: Array<{
    id: string;
    pesquisa_id: string;
    eleitor_nome: string;
    resposta_texto: string;
    sentimento?: string;
    criado_em?: string;
  }>;
}

export interface ComparacaoPesquisas {
  pesquisas_comparadas: number;
  dados: Array<{
    id: string;
    titulo: string;
    status: string;
    total_eleitores: number;
    total_respostas: number;
    custo_real: number;
    criado_em?: string;
  }>;
}

// ============================================
// SERVIÇOS
// ============================================

/**
 * Obtém métricas globais do dashboard
 */
export async function obterDashboardGlobal(): Promise<DashboardGlobal> {
  const response = await api.get<DashboardGlobal>('/analytics/dashboard');
  return response.data;
}

/**
 * Obtém correlações entre variáveis
 */
export async function obterCorrelacoes(variaveis?: string[]): Promise<Correlacao[]> {
  const params = variaveis ? `?variaveis=${variaveis.join(',')}` : '';
  const response = await api.get<Correlacao[]>(`/analytics/correlacoes${params}`);
  return response.data;
}

/**
 * Obtém tendências temporais
 */
export async function obterTendencias(
  periodo: 'diario' | 'semanal' | 'mensal' = 'mensal',
  meses = 12
): Promise<Tendencia[]> {
  const response = await api.get<Tendencia[]>(
    `/analytics/tendencias?periodo=${periodo}&meses=${meses}`
  );
  return response.data;
}

/**
 * Obtém análise por segmento
 */
export async function obterSegmento(
  tipo: 'cluster' | 'regiao' | 'orientacao' | 'religiao' | 'genero' | 'escolaridade'
): Promise<SegmentoAnalise[]> {
  const response = await api.get<SegmentoAnalise[]>(`/analytics/segmentos/${tipo}`);
  return response.data;
}

/**
 * Obtém insights automáticos
 */
export async function obterInsights(): Promise<InsightGlobal[]> {
  const response = await api.get<InsightGlobal[]>('/analytics/insights');
  return response.data;
}

/**
 * Obtém histórico de um eleitor
 */
export async function obterHistoricoEleitor(eleitorId: string): Promise<HistoricoEleitor> {
  const response = await api.get<HistoricoEleitor>(
    `/analytics/historico/eleitor/${eleitorId}`
  );
  return response.data;
}

/**
 * Busca texto em respostas
 */
export async function buscarEmRespostas(
  texto: string,
  limite = 100
): Promise<BuscaRespostasResult> {
  const response = await api.get<BuscaRespostasResult>(
    `/analytics/historico/busca?texto=${encodeURIComponent(texto)}&limite=${limite}`
  );
  return response.data;
}

/**
 * Compara múltiplas pesquisas
 */
export async function compararPesquisas(ids: string[]): Promise<ComparacaoPesquisas> {
  const response = await api.get<ComparacaoPesquisas>(
    `/analytics/comparar/pesquisas?ids=${ids.join(',')}`
  );
  return response.data;
}

/**
 * Exporta dataset completo
 */
export async function exportarDataset(formato: 'json' | 'csv' = 'json'): Promise<unknown> {
  const response = await api.get(`/analytics/exportar?formato=${formato}`);
  return response.data;
}

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Formata número para exibição (ex: 1500 -> 1.5k)
 */
export function formatarNumero(valor: number): string {
  if (valor >= 1000000) {
    return `${(valor / 1000000).toFixed(1)}M`;
  }
  if (valor >= 1000) {
    return `${(valor / 1000).toFixed(1)}k`;
  }
  return valor.toString();
}

/**
 * Formata valor em reais
 */
export function formatarReais(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

/**
 * Retorna cor por relevância
 */
export function corRelevancia(relevancia: 'alta' | 'media' | 'baixa'): string {
  const mapa = {
    alta: 'text-red-600 bg-red-50 border-red-200',
    media: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    baixa: 'text-blue-600 bg-blue-50 border-blue-200',
  };
  return mapa[relevancia];
}

/**
 * Retorna cor por sentimento
 */
export function corSentimento(sentimento?: string): string {
  const mapa: Record<string, string> = {
    positivo: 'text-green-600',
    negativo: 'text-red-600',
    neutro: 'text-gray-600',
    misto: 'text-yellow-600',
  };
  return mapa[sentimento || 'neutro'] || 'text-gray-600';
}
