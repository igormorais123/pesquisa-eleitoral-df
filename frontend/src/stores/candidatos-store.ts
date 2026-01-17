/**
 * Store de Candidatos
 *
 * Gerencia o estado de candidatos eleitorais no frontend.
 * Usa Zustand com persist para manter dados entre sessões.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Candidato,
  CandidatoResumo,
  FiltrosCandidato,
  EstatisticasCandidatos,
  CriarCandidatoDTO,
  AtualizarCandidatoDTO,
  CargoPretendido,
} from '@/types';
import { api } from '@/services/api';

interface CandidatosState {
  // Estado
  candidatos: Candidato[];
  candidatosFiltrados: Candidato[];
  candidatoSelecionado: Candidato | null;
  estatisticas: EstatisticasCandidatos | null;
  filtros: FiltrosCandidato;
  carregando: boolean;
  erro: string | null;

  // Paginação
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;

  // Ações de busca
  carregarCandidatos: (filtros?: FiltrosCandidato) => Promise<void>;
  carregarCandidatoPorId: (id: string) => Promise<Candidato | null>;
  carregarCandidatosPorCargo: (cargo: CargoPretendido) => Promise<Candidato[]>;
  carregarEstatisticas: () => Promise<void>;
  carregarParaPesquisa: (cargo?: CargoPretendido) => Promise<CandidatoResumo[]>;

  // Ações de CRUD
  criarCandidato: (dados: CriarCandidatoDTO) => Promise<Candidato>;
  atualizarCandidato: (id: string, dados: AtualizarCandidatoDTO) => Promise<Candidato>;
  deletarCandidato: (id: string) => Promise<void>;
  ativarCandidato: (id: string) => Promise<void>;
  desativarCandidato: (id: string) => Promise<void>;

  // Ações de estado local
  selecionarCandidato: (candidato: Candidato | null) => void;
  setFiltros: (filtros: Partial<FiltrosCandidato>) => void;
  limparFiltros: () => void;
  setPagina: (pagina: number) => void;
  limparErro: () => void;
}

const filtrosIniciais: FiltrosCandidato = {
  pagina: 1,
  por_pagina: 50,
  apenas_ativos: true,
  ordenar_por: 'nome_urna',
  ordem: 'asc',
};

export const useCandidatosStore = create<CandidatosState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      candidatos: [],
      candidatosFiltrados: [],
      candidatoSelecionado: null,
      estatisticas: null,
      filtros: filtrosIniciais,
      carregando: false,
      erro: null,
      total: 0,
      pagina: 1,
      porPagina: 50,
      totalPaginas: 0,

      // Ações de busca
      carregarCandidatos: async (filtros?: FiltrosCandidato) => {
        set({ carregando: true, erro: null });
        try {
          const filtrosAtuais = filtros || get().filtros;

          // Construir query params
          const params = new URLSearchParams();

          if (filtrosAtuais.busca_texto) {
            params.append('busca', filtrosAtuais.busca_texto);
          }
          if (filtrosAtuais.partidos?.length) {
            params.append('partidos', filtrosAtuais.partidos.join(','));
          }
          if (filtrosAtuais.cargos?.length) {
            params.append('cargos', filtrosAtuais.cargos.join(','));
          }
          if (filtrosAtuais.status?.length) {
            params.append('status', filtrosAtuais.status.join(','));
          }
          if (filtrosAtuais.orientacoes_politicas?.length) {
            params.append('orientacoes', filtrosAtuais.orientacoes_politicas.join(','));
          }
          if (filtrosAtuais.generos?.length) {
            params.append('generos', filtrosAtuais.generos.join(','));
          }
          params.append('apenas_ativos', String(filtrosAtuais.apenas_ativos ?? true));
          params.append('pagina', String(filtrosAtuais.pagina || 1));
          params.append('por_pagina', String(filtrosAtuais.por_pagina || 50));
          params.append('ordenar_por', filtrosAtuais.ordenar_por || 'nome_urna');
          params.append('ordem', filtrosAtuais.ordem || 'asc');

          const response = await api.get(`/candidatos?${params.toString()}`);

          set({
            candidatos: response.data.candidatos,
            candidatosFiltrados: response.data.candidatos,
            total: response.data.total,
            pagina: response.data.pagina,
            porPagina: response.data.por_pagina,
            totalPaginas: response.data.total_paginas,
            filtros: filtrosAtuais,
            carregando: false,
          });
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro ao carregar candidatos',
            carregando: false,
          });
        }
      },

      carregarCandidatoPorId: async (id: string) => {
        set({ carregando: true, erro: null });
        try {
          const response = await api.get(`/candidatos/${id}`);
          const candidato = response.data;
          set({ candidatoSelecionado: candidato, carregando: false });
          return candidato;
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro ao carregar candidato',
            carregando: false,
          });
          return null;
        }
      },

      carregarCandidatosPorCargo: async (cargo: CargoPretendido) => {
        set({ carregando: true, erro: null });
        try {
          const response = await api.get(`/candidatos/por-cargo/${cargo}`);
          set({ carregando: false });
          return response.data.candidatos;
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro ao carregar candidatos',
            carregando: false,
          });
          return [];
        }
      },

      carregarEstatisticas: async () => {
        set({ carregando: true, erro: null });
        try {
          const response = await api.get('/candidatos/estatisticas');
          set({ estatisticas: response.data, carregando: false });
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro ao carregar estatísticas',
            carregando: false,
          });
        }
      },

      carregarParaPesquisa: async (cargo?: CargoPretendido) => {
        set({ carregando: true, erro: null });
        try {
          const url = cargo
            ? `/candidatos/para-pesquisa?cargo=${cargo}`
            : '/candidatos/para-pesquisa';
          const response = await api.get(url);
          set({ carregando: false });
          return response.data.candidatos;
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro ao carregar candidatos',
            carregando: false,
          });
          return [];
        }
      },

      // Ações de CRUD
      criarCandidato: async (dados: CriarCandidatoDTO) => {
        set({ carregando: true, erro: null });
        try {
          const response = await api.post('/candidatos', dados);
          const novoCandidato = response.data;

          // Adicionar à lista local
          set((state) => ({
            candidatos: [...state.candidatos, novoCandidato],
            candidatosFiltrados: [...state.candidatosFiltrados, novoCandidato],
            carregando: false,
          }));

          return novoCandidato;
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro ao criar candidato',
            carregando: false,
          });
          throw error;
        }
      },

      atualizarCandidato: async (id: string, dados: AtualizarCandidatoDTO) => {
        set({ carregando: true, erro: null });
        try {
          const response = await api.put(`/candidatos/${id}`, dados);
          const candidatoAtualizado = response.data;

          // Atualizar na lista local
          set((state) => ({
            candidatos: state.candidatos.map((c) =>
              c.id === id ? candidatoAtualizado : c
            ),
            candidatosFiltrados: state.candidatosFiltrados.map((c) =>
              c.id === id ? candidatoAtualizado : c
            ),
            candidatoSelecionado:
              state.candidatoSelecionado?.id === id
                ? candidatoAtualizado
                : state.candidatoSelecionado,
            carregando: false,
          }));

          return candidatoAtualizado;
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro ao atualizar candidato',
            carregando: false,
          });
          throw error;
        }
      },

      deletarCandidato: async (id: string) => {
        set({ carregando: true, erro: null });
        try {
          await api.delete(`/candidatos/${id}`);

          // Remover da lista local
          set((state) => ({
            candidatos: state.candidatos.filter((c) => c.id !== id),
            candidatosFiltrados: state.candidatosFiltrados.filter((c) => c.id !== id),
            candidatoSelecionado:
              state.candidatoSelecionado?.id === id ? null : state.candidatoSelecionado,
            carregando: false,
          }));
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro ao deletar candidato',
            carregando: false,
          });
          throw error;
        }
      },

      ativarCandidato: async (id: string) => {
        set({ carregando: true, erro: null });
        try {
          const response = await api.patch(`/candidatos/${id}/ativar`);
          const candidatoAtualizado = response.data;

          set((state) => ({
            candidatos: state.candidatos.map((c) =>
              c.id === id ? candidatoAtualizado : c
            ),
            candidatosFiltrados: state.candidatosFiltrados.map((c) =>
              c.id === id ? candidatoAtualizado : c
            ),
            carregando: false,
          }));
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro ao ativar candidato',
            carregando: false,
          });
          throw error;
        }
      },

      desativarCandidato: async (id: string) => {
        set({ carregando: true, erro: null });
        try {
          const response = await api.patch(`/candidatos/${id}/desativar`);
          const candidatoAtualizado = response.data;

          set((state) => ({
            candidatos: state.candidatos.map((c) =>
              c.id === id ? candidatoAtualizado : c
            ),
            candidatosFiltrados: state.candidatosFiltrados.map((c) =>
              c.id === id ? candidatoAtualizado : c
            ),
            carregando: false,
          }));
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro ao desativar candidato',
            carregando: false,
          });
          throw error;
        }
      },

      // Ações de estado local
      selecionarCandidato: (candidato: Candidato | null) => {
        set({ candidatoSelecionado: candidato });
      },

      setFiltros: (filtros: Partial<FiltrosCandidato>) => {
        set((state) => ({
          filtros: { ...state.filtros, ...filtros },
        }));
      },

      limparFiltros: () => {
        set({ filtros: filtrosIniciais });
      },

      setPagina: (pagina: number) => {
        set((state) => ({
          filtros: { ...state.filtros, pagina },
        }));
      },

      limparErro: () => {
        set({ erro: null });
      },
    }),
    {
      name: 'pesquisa-eleitoral-candidatos',
      partialize: (state) => ({
        filtros: state.filtros,
      }),
    }
  )
);
