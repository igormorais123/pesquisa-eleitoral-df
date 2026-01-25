/**
 * Store de Pesquisas Persistidas
 *
 * Gerencia estado das pesquisas salvas no banco de dados.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  Pesquisa,
  PesquisaResumo,
  RespostaPesquisa,
  FiltrosPesquisa,
  StatusPesquisa,
  listarPesquisas,
  obterPesquisa,
  criarPesquisa,
  deletarPesquisa,
  registrarResposta,
  iniciarPesquisa,
  pausarPesquisa,
  finalizarPesquisa,
  atualizarProgresso,
  PesquisaCreate,
  RespostaCreate,
} from '@/services/pesquisas-api';
import {
  DashboardGlobal,
  obterDashboardGlobal,
} from '@/services/analytics-api';

// ============================================
// TIPOS
// ============================================

interface PesquisasState {
  // Lista de pesquisas
  pesquisas: PesquisaResumo[];
  pesquisaAtual: Pesquisa | null;
  respostasAtuais: RespostaPesquisa[];

  // Dashboard global
  dashboard: DashboardGlobal | null;

  // Estado de carregamento
  carregando: boolean;
  carregandoPesquisa: boolean;
  carregandoRespostas: boolean;
  carregandoDashboard: boolean;
  salvando: boolean;

  // Paginação
  paginaAtual: number;
  totalPaginas: number;
  totalPesquisas: number;
  porPagina: number;

  // Filtros
  filtros: FiltrosPesquisa;

  // Erros
  erro: string | null;

  // Pesquisa em execução (sincronização com backend)
  pesquisaEmExecucao: string | null;
  progressoExecucao: number;
  respostasSalvas: number;

  // Ações
  carregarPesquisas: (pagina?: number) => Promise<void>;
  carregarPesquisa: (id: string) => Promise<void>;
  carregarRespostas: (pesquisaId: string, perguntaId?: string) => Promise<void>;
  carregarDashboard: () => Promise<void>;
  criar: (dados: PesquisaCreate) => Promise<Pesquisa | null>;
  deletar: (id: string) => Promise<boolean>;
  setFiltros: (filtros: FiltrosPesquisa) => void;
  limparFiltros: () => void;
  setPagina: (pagina: number) => void;

  // Execução com sincronização
  iniciarExecucao: (id: string) => Promise<boolean>;
  pausarExecucao: (id: string) => Promise<boolean>;
  salvarResposta: (dados: RespostaCreate) => Promise<RespostaPesquisa | null>;
  finalizarExecucao: (id: string, erro?: string) => Promise<boolean>;
  atualizarProgressoExecucao: (progresso: number, eleitores: number) => Promise<void>;

  // Reset
  limpar: () => void;
}

// ============================================
// STORE
// ============================================

export const usePesquisasStore = create<PesquisasState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      pesquisas: [],
      pesquisaAtual: null,
      respostasAtuais: [],
      dashboard: null,
      carregando: false,
      carregandoPesquisa: false,
      carregandoRespostas: false,
      carregandoDashboard: false,
      salvando: false,
      paginaAtual: 1,
      totalPaginas: 1,
      totalPesquisas: 0,
      porPagina: 20,
      filtros: {},
      erro: null,
      pesquisaEmExecucao: null,
      progressoExecucao: 0,
      respostasSalvas: 0,

      // Carregar lista de pesquisas
      carregarPesquisas: async (pagina = 1) => {
        set({ carregando: true, erro: null });
        try {
          const { filtros, porPagina } = get();
          const response = await listarPesquisas(filtros, pagina, porPagina);
          set({
            pesquisas: response.pesquisas,
            paginaAtual: response.pagina,
            totalPaginas: response.total_paginas,
            totalPesquisas: response.total,
            carregando: false,
          });
        } catch (error) {
          set({
            erro: 'Erro ao carregar pesquisas',
            carregando: false,
          });
          console.error('Erro ao carregar pesquisas:', error);
        }
      },

      // Carregar detalhes de uma pesquisa
      carregarPesquisa: async (id: string) => {
        set({ carregandoPesquisa: true, erro: null });
        try {
          const pesquisa = await obterPesquisa(id);
          set({
            pesquisaAtual: pesquisa,
            carregandoPesquisa: false,
          });
        } catch (error) {
          set({
            erro: 'Erro ao carregar pesquisa',
            carregandoPesquisa: false,
          });
          console.error('Erro ao carregar pesquisa:', error);
        }
      },

      // Carregar respostas de uma pesquisa
      carregarRespostas: async (pesquisaId: string, perguntaId?: string) => {
        set({ carregandoRespostas: true, erro: null });
        try {
          const { listarRespostas } = await import('@/services/pesquisas-api');
          const response = await listarRespostas(pesquisaId, perguntaId);
          set({
            respostasAtuais: response.respostas,
            carregandoRespostas: false,
          });
        } catch (error) {
          set({
            erro: 'Erro ao carregar respostas',
            carregandoRespostas: false,
          });
          console.error('Erro ao carregar respostas:', error);
        }
      },

      // Carregar dashboard global
      carregarDashboard: async () => {
        set({ carregandoDashboard: true });
        try {
          const dashboard = await obterDashboardGlobal();
          set({
            dashboard,
            carregandoDashboard: false,
          });
        } catch (error) {
          set({ carregandoDashboard: false });
          console.error('Erro ao carregar dashboard:', error);
        }
      },

      // Criar nova pesquisa
      criar: async (dados: PesquisaCreate) => {
        set({ salvando: true, erro: null });
        try {
          const pesquisa = await criarPesquisa(dados);
          // Atualizar lista
          await get().carregarPesquisas();
          set({ salvando: false });
          return pesquisa;
        } catch (error) {
          set({
            erro: 'Erro ao criar pesquisa',
            salvando: false,
          });
          console.error('Erro ao criar pesquisa:', error);
          return null;
        }
      },

      // Deletar pesquisa
      deletar: async (id: string) => {
        set({ salvando: true, erro: null });
        try {
          await deletarPesquisa(id);
          // Atualizar lista
          await get().carregarPesquisas();
          set({ salvando: false });
          return true;
        } catch (error) {
          set({
            erro: 'Erro ao deletar pesquisa',
            salvando: false,
          });
          console.error('Erro ao deletar pesquisa:', error);
          return false;
        }
      },

      // Definir filtros
      setFiltros: (filtros: FiltrosPesquisa) => {
        set({ filtros, paginaAtual: 1 });
        get().carregarPesquisas(1);
      },

      // Limpar filtros
      limparFiltros: () => {
        set({ filtros: {}, paginaAtual: 1 });
        get().carregarPesquisas(1);
      },

      // Definir página
      setPagina: (pagina: number) => {
        set({ paginaAtual: pagina });
        get().carregarPesquisas(pagina);
      },

      // Iniciar execução
      iniciarExecucao: async (id: string) => {
        try {
          await iniciarPesquisa(id);
          set({
            pesquisaEmExecucao: id,
            progressoExecucao: 0,
            respostasSalvas: 0,
          });
          return true;
        } catch (error) {
          console.error('Erro ao iniciar execução:', error);
          return false;
        }
      },

      // Pausar execução
      pausarExecucao: async (id: string) => {
        try {
          await pausarPesquisa(id);
          return true;
        } catch (error) {
          console.error('Erro ao pausar execução:', error);
          return false;
        }
      },

      // Salvar resposta durante execução
      salvarResposta: async (dados: RespostaCreate) => {
        try {
          const resposta = await registrarResposta(dados.pesquisa_id, dados);
          set((state) => ({
            respostasSalvas: state.respostasSalvas + 1,
          }));
          return resposta;
        } catch (error) {
          console.error('Erro ao salvar resposta:', error);
          return null;
        }
      },

      // Finalizar execução
      finalizarExecucao: async (id: string, erro?: string) => {
        try {
          await finalizarPesquisa(id, erro);
          set({
            pesquisaEmExecucao: null,
            progressoExecucao: 100,
          });
          // Atualizar lista e dashboard
          await get().carregarPesquisas();
          await get().carregarDashboard();
          return true;
        } catch (error) {
          console.error('Erro ao finalizar execução:', error);
          return false;
        }
      },

      // Atualizar progresso
      atualizarProgressoExecucao: async (progresso: number, eleitores: number) => {
        const { pesquisaEmExecucao } = get();
        if (!pesquisaEmExecucao) return;

        try {
          await atualizarProgresso(pesquisaEmExecucao, progresso, eleitores);
          set({ progressoExecucao: progresso });
        } catch (error) {
          console.error('Erro ao atualizar progresso:', error);
        }
      },

      // Limpar estado
      limpar: () => {
        set({
          pesquisas: [],
          pesquisaAtual: null,
          respostasAtuais: [],
          dashboard: null,
          paginaAtual: 1,
          totalPaginas: 1,
          totalPesquisas: 0,
          filtros: {},
          erro: null,
          pesquisaEmExecucao: null,
          progressoExecucao: 0,
          respostasSalvas: 0,
        });
      },
    }),
    {
      name: 'pesquisas-persistidas-store',
      partialize: (state) => ({
        // Persistir apenas filtros e última página
        filtros: state.filtros,
        paginaAtual: state.paginaAtual,
        porPagina: state.porPagina,
      }),
    }
  )
);

// ============================================
// HOOKS AUXILIARES
// ============================================

/**
 * Hook para buscar pesquisas ao montar componente
 */
export function usePesquisasLoader() {
  const { carregarPesquisas, carregarDashboard, carregando } = usePesquisasStore();

  const carregar = async () => {
    await Promise.all([carregarPesquisas(), carregarDashboard()]);
  };

  return { carregar, carregando };
}
