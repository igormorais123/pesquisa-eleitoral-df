import axios from 'axios';

// Usa rota relativa para funcionar em qualquer ambiente (dev, producao, Vercel)
// As API routes do Next.js respondem em /api/v1/*
export const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Performance: cache do token em memória para evitar localStorage em cada request
let cachedToken: string | null = null;
let tokenLoadedFromStorage = false;

/**
 * Carrega o token do localStorage para o cache em memória (uma vez).
 * Chamadas subsequentes usam o cache.
 */
function getAuthToken(): string | null {
  if (!tokenLoadedFromStorage && typeof window !== 'undefined') {
    try {
      const authStorage = localStorage.getItem('pesquisa-eleitoral-auth');
      if (authStorage) {
        const { state } = JSON.parse(authStorage);
        cachedToken = state?.token || null;
      }
    } catch (e) {
      console.error('Erro ao parsear auth storage:', e);
      cachedToken = null;
    }
    tokenLoadedFromStorage = true;
  }
  return cachedToken;
}

/**
 * Atualiza o token em cache (chamado após login).
 */
export function setAuthToken(token: string | null): void {
  cachedToken = token;
  tokenLoadedFromStorage = true;
}

/**
 * Limpa o token em cache (chamado após logout ou expiração).
 */
export function clearAuthToken(): void {
  cachedToken = null;
  tokenLoadedFromStorage = true; // Marca como carregado para não recarregar
}

// Interceptor para adicionar token (usa cache em memória)
api.interceptors.request.use(
  (config) => {
    // Se já tem Authorization header (setado pelo auth-store), não sobrescreve
    if (config.headers.Authorization) {
      return config;
    }
    // Senão, tenta pegar do cache/localStorage
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag para controlar redirecionamento automático em 401
let autoRedirectOn401 = true;

/**
 * Desabilita o redirecionamento automático para login em 401.
 * Útil para requisições em segundo plano que não devem forçar logout.
 */
export function disableAutoRedirect(): void {
  autoRedirectOn401 = false;
}

/**
 * Habilita o redirecionamento automático para login em 401.
 */
export function enableAutoRedirect(): void {
  autoRedirectOn401 = true;
}

// Rotas que não devem causar redirecionamento em 401
const ROTAS_SEM_REDIRECT = [
  '/auth/me',
  '/candidatos',
  '/eleitores/estatisticas',
  '/parlamentares',
  '/gestores',
];

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';

      // Verifica se é uma rota que não deve causar redirecionamento
      const isRotaSemRedirect = ROTAS_SEM_REDIRECT.some(rota => url.includes(rota));

      // Só redireciona se autoRedirect estiver ativo E não for rota sem redirect
      // E não for uma requisição em background (verificação silenciosa)
      if (autoRedirectOn401 && !isRotaSemRedirect && !error.config?.headers?.['X-Silent-Request']) {
        // Token expirado ou inválido - limpa cache e storage
        clearAuthToken();
        if (typeof window !== 'undefined') {
          // Verifica se já está na página de login para evitar loop
          if (!window.location.pathname.includes('/login')) {
            localStorage.removeItem('pesquisa-eleitoral-auth');
            window.location.href = '/login';
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

// Tipos de resposta da API
export interface RespostaPaginada<T> {
  itens: T[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
  tem_proxima: boolean;
  tem_anterior: boolean;
}

export interface RespostaErro {
  detalhe: string;
  codigo?: string;
  campo?: string;
}

// Funções auxiliares
export function tratarErroApi(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.detalhe) {
      return error.response.data.detalhe;
    }
    if (error.response?.status === 404) {
      return 'Recurso não encontrado';
    }
    if (error.response?.status === 500) {
      return 'Erro interno do servidor';
    }
    if (error.code === 'ECONNABORTED') {
      return 'Tempo de conexão esgotado';
    }
    if (!error.response) {
      return 'Erro de conexão com o servidor';
    }
  }
  return 'Ocorreu um erro inesperado';
}
