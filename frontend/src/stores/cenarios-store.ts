/**
 * Store de Cenários Eleitorais
 *
 * Gerencia o estado de cenários eleitorais e simulações.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CenarioEleitoral,
  CriarCenarioDTO,
  FiltrosCenario,
  ResultadoCenario,
  ResultadoAnaliseRejeicao,
  CargoPretendido,
} from '@/types';
import { api } from '@/services/api';

interface CenariosState {
  // Estado
  cenarios: CenarioEleitoral[];
  cenarioSelecionado: CenarioEleitoral | null;
  resultadoAtual: ResultadoCenario | null;
  analiseRejeicao: ResultadoAnaliseRejeicao | null;
  carregando: boolean;
  simulando: boolean;
  erro: string | null;

  // Paginação
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;

  // Ações de busca
  carregarCenarios: (filtros?: FiltrosCenario) => Promise<void>;
  carregarCenarioPorId: (id: string) => Promise<CenarioEleitoral | null>;

  // Ações de CRUD
  criarCenario: (dados: CriarCenarioDTO) => Promise<CenarioEleitoral>;
  atualizarCenario: (id: string, dados: Partial<CriarCenarioDTO>) => Promise<CenarioEleitoral>;
  deletarCenario: (id: string) => Promise<void>;

  // Ações de simulação
  executarCenario: (id: string) => Promise<ResultadoCenario>;
  simularRapido: (dados: {
    cargo: CargoPretendido;
    turno: 1 | 2;
    candidatos_ids: string[];
    amostra_tamanho?: number;
  }) => Promise<ResultadoCenario>;
  simularSegundoTurno: (cenarioId: string, candidato1Id: string, candidato2Id: string) => Promise<ResultadoCenario>;

  // Análise de rejeição
  analisarRejeicao: (candidatos_ids: string[], amostra?: number) => Promise<ResultadoAnaliseRejeicao>;
  obterRejeicaoCandidato: (candidatoId: string) => Promise<any>;

  // Ações de estado local
  selecionarCenario: (cenario: CenarioEleitoral | null) => void;
  limparResultado: () => void;
  limparErro: () => void;
}

export const useCenariosStore = create<CenariosState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      cenarios: [],
      cenarioSelecionado: null,
      resultadoAtual: null,
      analiseRejeicao: null,
      carregando: false,
      simulando: false,
      erro: null,
      total: 0,
      pagina: 1,
      porPagina: 20,
      totalPaginas: 0,

      // Ações de busca
      carregarCenarios: async (filtros?: FiltrosCenario) => {
        set({ carregando: true, erro: null });
        try {
          const params = new URLSearchParams();

          if (filtros?.busca_texto) params.append('busca', filtros.busca_texto);
          if (filtros?.cargos?.length) params.append('cargos', filtros.cargos.join(','));
          if (filtros?.turnos?.length) params.append('turnos', filtros.turnos.join(','));
          if (filtros?.status?.length) params.append('status', filtros.status.join(','));
          params.append('apenas_ativos', String(filtros?.apenas_ativos ?? true));
          params.append('pagina', String(filtros?.pagina || 1));
          params.append('por_pagina', String(filtros?.por_pagina || 20));
          params.append('ordenar_por', filtros?.ordenar_por || 'criado_em');
          params.append('ordem', filtros?.ordem || 'desc');

          const response = await api.get(`/cenarios?${params.toString()}`);

          set({
            cenarios: response.data.cenarios,
            total: response.data.total,
            pagina: response.data.pagina,
            porPagina: response.data.por_pagina,
            totalPaginas: response.data.total_paginas,
            carregando: false,
          });
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro ao carregar cenários',
            carregando: false,
          });
        }
      },

      carregarCenarioPorId: async (id: string) => {
        set({ carregando: true, erro: null });
        try {
          const response = await api.get(`/cenarios/${id}`);
          const cenario = response.data;
          set({ cenarioSelecionado: cenario, carregando: false });
          return cenario;
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro ao carregar cenário',
            carregando: false,
          });
          return null;
        }
      },

      // Ações de CRUD
      criarCenario: async (dados: CriarCenarioDTO) => {
        set({ carregando: true, erro: null });
        try {
          const response = await api.post('/cenarios', dados);
          const novoCenario = response.data;

          set((state) => ({
            cenarios: [novoCenario, ...state.cenarios],
            carregando: false,
          }));

          return novoCenario;
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro ao criar cenário',
            carregando: false,
          });
          throw error;
        }
      },

      atualizarCenario: async (id: string, dados: Partial<CriarCenarioDTO>) => {
        set({ carregando: true, erro: null });
        try {
          const response = await api.put(`/cenarios/${id}`, dados);
          const cenarioAtualizado = response.data;

          set((state) => ({
            cenarios: state.cenarios.map((c) =>
              c.id === id ? cenarioAtualizado : c
            ),
            cenarioSelecionado:
              state.cenarioSelecionado?.id === id
                ? cenarioAtualizado
                : state.cenarioSelecionado,
            carregando: false,
          }));

          return cenarioAtualizado;
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro ao atualizar cenário',
            carregando: false,
          });
          throw error;
        }
      },

      deletarCenario: async (id: string) => {
        set({ carregando: true, erro: null });
        try {
          await api.delete(`/cenarios/${id}`);

          set((state) => ({
            cenarios: state.cenarios.filter((c) => c.id !== id),
            cenarioSelecionado:
              state.cenarioSelecionado?.id === id ? null : state.cenarioSelecionado,
            carregando: false,
          }));
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro ao deletar cenário',
            carregando: false,
          });
          throw error;
        }
      },

      // Ações de simulação
      executarCenario: async (id: string) => {
        set({ simulando: true, erro: null });
        try {
          const response = await api.post(`/cenarios/${id}/executar`);
          const resultado = response.data;

          // Atualizar cenário com resultados
          set((state) => ({
            cenarios: state.cenarios.map((c) =>
              c.id === id ? { ...c, status: 'concluido', resultados: resultado.resultados } : c
            ),
            resultadoAtual: resultado,
            simulando: false,
          }));

          return resultado;
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro ao executar simulação',
            simulando: false,
          });
          throw error;
        }
      },

      simularRapido: async (dados) => {
        set({ simulando: true, erro: null });
        try {
          const response = await api.post('/cenarios/simular-rapido', dados);
          const resultado = response.data;

          set({
            resultadoAtual: resultado,
            simulando: false,
          });

          return resultado;
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro na simulação rápida',
            simulando: false,
          });
          throw error;
        }
      },

      simularSegundoTurno: async (cenarioId: string, candidato1Id: string, candidato2Id: string) => {
        set({ simulando: true, erro: null });
        try {
          const response = await api.post(
            `/cenarios/${cenarioId}/simular-segundo-turno?candidato1_id=${candidato1Id}&candidato2_id=${candidato2Id}`
          );
          const resultado = response.data;

          set({
            resultadoAtual: resultado,
            simulando: false,
          });

          return resultado;
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro na simulação de 2º turno',
            simulando: false,
          });
          throw error;
        }
      },

      // Análise de rejeição
      analisarRejeicao: async (candidatos_ids: string[], amostra = 200) => {
        set({ carregando: true, erro: null });
        try {
          const response = await api.post('/cenarios/analisar-rejeicao', {
            candidatos_ids,
            amostra_tamanho: amostra,
            incluir_motivos: true,
            incluir_perfil_rejeitadores: true,
          });
          const resultado = response.data;

          set({
            analiseRejeicao: resultado,
            carregando: false,
          });

          return resultado;
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro na análise de rejeição',
            carregando: false,
          });
          throw error;
        }
      },

      obterRejeicaoCandidato: async (candidatoId: string) => {
        set({ carregando: true, erro: null });
        try {
          const response = await api.get(`/cenarios/rejeicao/candidato/${candidatoId}`);
          set({ carregando: false });
          return response.data;
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro ao obter rejeição',
            carregando: false,
          });
          throw error;
        }
      },

      // Ações de estado local
      selecionarCenario: (cenario: CenarioEleitoral | null) => {
        set({ cenarioSelecionado: cenario });
      },

      limparResultado: () => {
        set({ resultadoAtual: null });
      },

      limparErro: () => {
        set({ erro: null });
      },
    }),
    {
      name: 'pesquisa-eleitoral-cenarios',
      partialize: (state) => ({
        // Não persistir dados sensíveis
      }),
    }
  )
);
