/**
 * Serviço de API para WhatsApp - Oráculo Eleitoral
 *
 * Cliente para endpoints do backend WhatsApp.
 * Segue o padrão do api.ts usando axios com interceptors.
 */

import { api } from './api';

// ============================================
// TIPOS
// ============================================

export interface StatusOraculo {
  whatsapp_configurado: boolean;
  redis_conectado: boolean;
  agentes_ativos: boolean;
  contatos_ativos: number;
  mensagens_hoje: number;
}

export interface ContatoWhatsApp {
  id: number;
  telefone: string;
  nome: string;
  tipo: 'cliente' | 'cabo_eleitoral' | 'candidato';
  plano: 'consultor' | 'estrategista' | 'war_room';
  ativo: boolean;
  opt_in_em: string | null;
  ultimo_acesso: string | null;
  criado_em: string;
}

export interface ContatoWhatsAppCreate {
  telefone: string;
  nome: string;
  tipo: 'cliente' | 'cabo_eleitoral' | 'candidato';
  plano: 'consultor' | 'estrategista' | 'war_room';
}

export interface FiltrosContato {
  tipo?: 'cliente' | 'cabo_eleitoral' | 'candidato';
  plano?: 'consultor' | 'estrategista' | 'war_room';
  ativo?: boolean;
  busca?: string;
}

export interface MensagemWhatsApp {
  id: number;
  conversa_id: number;
  direcao: 'entrada' | 'saida';
  tipo: string;
  conteudo: string;
  agente_usado: string | null;
  tokens_entrada: number;
  tokens_saida: number;
  custo: number;
  tempo_resposta_ms: number;
  criado_em: string;
}

// ============================================
// BASE URL
// ============================================

const BASE = '/whatsapp';

// ============================================
// FUNCOES DE API
// ============================================

/**
 * Busca o status geral do Oráculo Eleitoral
 */
export async function buscarStatusOraculo(): Promise<StatusOraculo> {
  const response = await api.get(`${BASE}/status`);
  return response.data;
}

/**
 * Lista contatos com filtros opcionais
 */
export async function listarContatos(filtros?: FiltrosContato): Promise<ContatoWhatsApp[]> {
  const params = new URLSearchParams();

  if (filtros?.tipo) params.append('tipo', filtros.tipo);
  if (filtros?.plano) params.append('plano', filtros.plano);
  if (filtros?.ativo !== undefined) params.append('ativo', filtros.ativo.toString());
  if (filtros?.busca) params.append('busca', filtros.busca);

  const queryString = params.toString();
  const url = queryString ? `${BASE}/contatos?${queryString}` : `${BASE}/contatos`;

  const response = await api.get(url);
  return response.data;
}

/**
 * Cria um novo contato WhatsApp
 */
export async function criarContato(dados: ContatoWhatsAppCreate): Promise<ContatoWhatsApp> {
  const response = await api.post(`${BASE}/contatos`, dados);
  return response.data;
}

/**
 * Atualiza um contato existente
 */
export async function atualizarContato(
  id: number,
  dados: Partial<ContatoWhatsApp>
): Promise<ContatoWhatsApp> {
  const response = await api.put(`${BASE}/contatos/${id}`, dados);
  return response.data;
}

/**
 * Deleta um contato
 */
export async function deletarContato(id: number): Promise<void> {
  await api.delete(`${BASE}/contatos/${id}`);
}

/**
 * Lista mensagens de um contato
 */
export async function listarMensagens(
  contatoId: number,
  limit?: number
): Promise<MensagemWhatsApp[]> {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());

  const queryString = params.toString();
  const url = queryString
    ? `${BASE}/conversas/${contatoId}/mensagens?${queryString}`
    : `${BASE}/conversas/${contatoId}/mensagens`;

  const response = await api.get(url);
  return response.data;
}

// ============================================
// EXPORTACAO DEFAULT
// ============================================

const whatsappApi = {
  buscarStatusOraculo,
  listarContatos,
  criarContato,
  atualizarContato,
  deletarContato,
  listarMensagens,
};

export default whatsappApi;
