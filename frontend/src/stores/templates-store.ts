/**
 * Store Zustand para gerenciamento de Templates de Pesquisa Eleitoral
 *
 * Gerencia o estado dos templates de perguntas predefinidos,
 * incluindo filtros, seleção e aplicação em pesquisas.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '@/services/api';
import {
  TemplateResumo,
  TemplateCompleto,
  CategoriaTemplateInfo,
  TipoEleicaoInfo,
  EstatisticasTemplates,
  PerguntaTemplate,
  CategoriaTemplate,
} from '@/types';

// ============================================
// INTERFACES DO ESTADO
// ============================================

interface FiltrosTemplates {
  categoria?: CategoriaTemplate;
  tipo_eleicao?: string;
  busca?: string;
  tag?: string;
}

interface TemplatesState {
  // Dados
  templates: TemplateResumo[];
  templateSelecionado: TemplateCompleto | null;
  categorias: CategoriaTemplateInfo[];
  tiposEleicao: TipoEleicaoInfo[];
  tags: string[];
  estatisticas: EstatisticasTemplates | null;

  // Filtros
  filtros: FiltrosTemplates;

  // UI State
  carregando: boolean;
  carregandoTemplate: boolean;
  erro: string | null;

  // Perguntas selecionadas para adicionar à pesquisa
  perguntasSelecionadas: PerguntaTemplate[];

  // Ações
  carregarTemplates: () => Promise<void>;
  carregarTemplate: (id: string) => Promise<void>;
  carregarCategorias: () => Promise<void>;
  carregarTiposEleicao: () => Promise<void>;
  carregarTags: () => Promise<void>;
  carregarEstatisticas: () => Promise<void>;
  carregarDadosIniciais: () => Promise<void>;

  // Filtros
  setFiltros: (filtros: Partial<FiltrosTemplates>) => void;
  limparFiltros: () => void;
  filtrarPorCategoria: (categoria: CategoriaTemplate | undefined) => void;
  filtrarPorTipoEleicao: (tipo: string | undefined) => void;
  buscar: (texto: string) => void;
  filtrarPorTag: (tag: string | undefined) => void;

  // Seleção de perguntas
  selecionarPergunta: (pergunta: PerguntaTemplate) => void;
  removerPergunta: (codigo: string) => void;
  selecionarTodasPerguntas: (perguntas: PerguntaTemplate[]) => void;
  limparSelecao: () => void;

  // Template selecionado
  selecionarTemplate: (template: TemplateCompleto | null) => void;

  // Aplicar template
  aplicarTemplate: (templateId: string, pesquisaId: number, substituir?: boolean) => Promise<any>;

  // Reset
  resetStore: () => void;
}

// ============================================
// ESTADO INICIAL
// ============================================

const estadoInicial = {
  templates: [],
  templateSelecionado: null,
  categorias: [],
  tiposEleicao: [],
  tags: [],
  estatisticas: null,
  filtros: {},
  carregando: false,
  carregandoTemplate: false,
  erro: null,
  perguntasSelecionadas: [],
};

// ============================================
// STORE
// ============================================

export const useTemplatesStore = create<TemplatesState>()(
  devtools(
    (set, get) => ({
      ...estadoInicial,

      // ============================================
      // CARREGAR DADOS
      // ============================================

      carregarTemplates: async () => {
        set({ carregando: true, erro: null });
        try {
          const { filtros } = get();
          const params = new URLSearchParams();

          if (filtros.categoria) params.append('categoria', filtros.categoria);
          if (filtros.tipo_eleicao) params.append('tipo_eleicao', filtros.tipo_eleicao);
          if (filtros.busca) params.append('busca', filtros.busca);
          if (filtros.tag) params.append('tag', filtros.tag);

          const response = await api.get(`/templates/?${params.toString()}`);
          set({ templates: response.data, carregando: false });
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro ao carregar templates',
            carregando: false
          });
        }
      },

      carregarTemplate: async (id: string) => {
        set({ carregandoTemplate: true, erro: null });
        try {
          const response = await api.get(`/templates/${id}`);
          set({ templateSelecionado: response.data, carregandoTemplate: false });
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro ao carregar template',
            carregandoTemplate: false
          });
        }
      },

      carregarCategorias: async () => {
        try {
          const response = await api.get('/templates/meta/categorias');
          set({ categorias: response.data });
        } catch (error: any) {
          console.error('Erro ao carregar categorias:', error);
        }
      },

      carregarTiposEleicao: async () => {
        try {
          const response = await api.get('/templates/meta/tipos-eleicao');
          set({ tiposEleicao: response.data });
        } catch (error: any) {
          console.error('Erro ao carregar tipos de eleição:', error);
        }
      },

      carregarTags: async () => {
        try {
          const response = await api.get('/templates/meta/tags');
          set({ tags: response.data });
        } catch (error: any) {
          console.error('Erro ao carregar tags:', error);
        }
      },

      carregarEstatisticas: async () => {
        try {
          const response = await api.get('/templates/meta/estatisticas');
          set({ estatisticas: response.data });
        } catch (error: any) {
          console.error('Erro ao carregar estatísticas:', error);
        }
      },

      carregarDadosIniciais: async () => {
        set({ carregando: true });
        await Promise.all([
          get().carregarTemplates(),
          get().carregarCategorias(),
          get().carregarTiposEleicao(),
          get().carregarTags(),
          get().carregarEstatisticas(),
        ]);
        set({ carregando: false });
      },

      // ============================================
      // FILTROS
      // ============================================

      setFiltros: (novosFiltros: Partial<FiltrosTemplates>) => {
        set(state => ({
          filtros: { ...state.filtros, ...novosFiltros }
        }));
        get().carregarTemplates();
      },

      limparFiltros: () => {
        set({ filtros: {} });
        get().carregarTemplates();
      },

      filtrarPorCategoria: (categoria: CategoriaTemplate | undefined) => {
        set(state => ({
          filtros: { ...state.filtros, categoria }
        }));
        get().carregarTemplates();
      },

      filtrarPorTipoEleicao: (tipo: string | undefined) => {
        set(state => ({
          filtros: { ...state.filtros, tipo_eleicao: tipo }
        }));
        get().carregarTemplates();
      },

      buscar: (texto: string) => {
        set(state => ({
          filtros: { ...state.filtros, busca: texto || undefined }
        }));
        get().carregarTemplates();
      },

      filtrarPorTag: (tag: string | undefined) => {
        set(state => ({
          filtros: { ...state.filtros, tag }
        }));
        get().carregarTemplates();
      },

      // ============================================
      // SELEÇÃO DE PERGUNTAS
      // ============================================

      selecionarPergunta: (pergunta: PerguntaTemplate) => {
        set(state => {
          const existe = state.perguntasSelecionadas.some(p => p.codigo === pergunta.codigo);
          if (existe) return state;
          return {
            perguntasSelecionadas: [...state.perguntasSelecionadas, pergunta]
          };
        });
      },

      removerPergunta: (codigo: string) => {
        set(state => ({
          perguntasSelecionadas: state.perguntasSelecionadas.filter(p => p.codigo !== codigo)
        }));
      },

      selecionarTodasPerguntas: (perguntas: PerguntaTemplate[]) => {
        set(state => {
          const codigosExistentes = new Set(state.perguntasSelecionadas.map(p => p.codigo));
          const novasPerguntas = perguntas.filter(p => !codigosExistentes.has(p.codigo));
          return {
            perguntasSelecionadas: [...state.perguntasSelecionadas, ...novasPerguntas]
          };
        });
      },

      limparSelecao: () => {
        set({ perguntasSelecionadas: [] });
      },

      // ============================================
      // TEMPLATE SELECIONADO
      // ============================================

      selecionarTemplate: (template: TemplateCompleto | null) => {
        set({ templateSelecionado: template });
      },

      // ============================================
      // APLICAR TEMPLATE
      // ============================================

      aplicarTemplate: async (templateId: string, pesquisaId: number, substituir = false) => {
        set({ carregando: true, erro: null });
        try {
          const response = await api.post(
            `/templates/${templateId}/aplicar/${pesquisaId}?substituir_existentes=${substituir}`
          );
          set({ carregando: false });
          return response.data;
        } catch (error: any) {
          set({
            erro: error.response?.data?.detail || 'Erro ao aplicar template',
            carregando: false
          });
          throw error;
        }
      },

      // ============================================
      // RESET
      // ============================================

      resetStore: () => {
        set(estadoInicial);
      },
    }),
    { name: 'templates-store' }
  )
);

// ============================================
// SELETORES
// ============================================

export const selectTemplates = (state: TemplatesState) => state.templates;
export const selectTemplateSelecionado = (state: TemplatesState) => state.templateSelecionado;
export const selectCategorias = (state: TemplatesState) => state.categorias;
export const selectTiposEleicao = (state: TemplatesState) => state.tiposEleicao;
export const selectTags = (state: TemplatesState) => state.tags;
export const selectEstatisticas = (state: TemplatesState) => state.estatisticas;
export const selectFiltros = (state: TemplatesState) => state.filtros;
export const selectCarregando = (state: TemplatesState) => state.carregando;
export const selectErro = (state: TemplatesState) => state.erro;
export const selectPerguntasSelecionadas = (state: TemplatesState) => state.perguntasSelecionadas;

// Seletores derivados
export const selectTemplatesPorCategoria = (categoria: CategoriaTemplate) => (state: TemplatesState) =>
  state.templates.filter(t => t.categoria === categoria);

export const selectTemplatesPorTipoEleicao = (tipo: string) => (state: TemplatesState) =>
  state.templates.filter(t => t.tipo_eleicao === tipo || t.tipo_eleicao === 'geral');

export const selectTotalPerguntasSelecionadas = (state: TemplatesState) =>
  state.perguntasSelecionadas.length;
