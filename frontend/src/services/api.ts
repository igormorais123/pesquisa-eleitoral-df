import axios from 'axios';

// Determina a URL base da API
// NEXT_PUBLIC_API_URL pode ser a URL completa (com /api/v1) ou apenas o host
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// Remove /api/v1 se já existir na URL para evitar duplicação
const baseHost = rawApiUrl.replace(/\/api\/v1\/?$/, '');

export const api = axios.create({
  baseURL: `${baseHost}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('pesquisa-eleitoral-auth');
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          if (state?.token) {
            config.headers.Authorization = `Bearer ${state.token}`;
          }
        } catch (e) {
          console.error('Erro ao parsear auth storage:', e);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pesquisa-eleitoral-auth');
        window.location.href = '/login';
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
