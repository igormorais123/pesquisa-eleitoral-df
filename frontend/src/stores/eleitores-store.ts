'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Eleitor, FiltrosEleitor } from '@/types';

// Interface estendida para filtros com todos os campos
interface FiltrosEleitorExtendido extends FiltrosEleitor {
  cores_racas?: string[];
  faixas_renda?: string[];
  estados_civis?: string[];
  tem_filhos?: string[];
  interesses_politicos?: string[];
  estilos_decisao?: string[];
  tolerancias_nuance?: string[];
  vieses_cognitivos?: string[];
  fontes_informacao?: string[];
  susceptibilidade_desinformacao?: string[];
  voto_facultativo?: string[];
  conflito_identitario?: string[];
  meios_transporte?: string[];
}

interface EleitoresState {
  // Dados
  eleitores: Eleitor[];
  eleitoresFiltrados: Eleitor[];
  eleitorSelecionado: Eleitor | null;
  eleitoresSelecionados: string[];
  carregando: boolean;
  erro: string | null;

  // Filtros
  filtros: FiltrosEleitorExtendido;
  filtrosAbertos: boolean;

  // Ações
  setEleitores: (eleitores: Eleitor[]) => void;
  setCarregando: (carregando: boolean) => void;
  setErro: (erro: string | null) => void;
  selecionarEleitor: (eleitor: Eleitor | null) => void;
  toggleSelecionarParaEntrevista: (id: string) => void;
  selecionarTodos: () => void;
  limparSelecao: () => void;
  selecionarPorFiltro: () => void;
  setFiltros: (filtros: Partial<FiltrosEleitorExtendido>) => void;
  limparFiltros: () => void;
  toggleFiltros: () => void;
  aplicarFiltros: () => void;
  adicionarEleitores: (eleitores: Eleitor[]) => void;
  removerEleitor: (id: string) => void;
}

const filtrosIniciais: FiltrosEleitorExtendido = {
  busca: '',
  generos: [],
  clusters: [],
  regioes: [],
  religioes: [],
  orientacoes_politicas: [],
  posicoes_bolsonaro: [],
  faixas_etarias: [],
  escolaridades: [],
  ocupacoes_vinculos: [],
  // Novos filtros
  cores_racas: [],
  faixas_renda: [],
  estados_civis: [],
  tem_filhos: [],
  interesses_politicos: [],
  estilos_decisao: [],
  tolerancias_nuance: [],
  vieses_cognitivos: [],
  fontes_informacao: [],
  susceptibilidade_desinformacao: [],
  voto_facultativo: [],
  conflito_identitario: [],
  meios_transporte: [],
};

export const useEleitoresStore = create<EleitoresState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      eleitores: [],
      eleitoresFiltrados: [],
      eleitorSelecionado: null,
      eleitoresSelecionados: [],
      carregando: false,
      erro: null,
      filtros: filtrosIniciais,
      filtrosAbertos: false,

      // Ações
      setEleitores: (eleitores) => {
        set({ eleitores, eleitoresFiltrados: eleitores });
      },

      setCarregando: (carregando) => set({ carregando }),

      setErro: (erro) => set({ erro }),

      selecionarEleitor: (eleitor) => set({ eleitorSelecionado: eleitor }),

      toggleSelecionarParaEntrevista: (id) => {
        const { eleitoresSelecionados } = get();
        if (eleitoresSelecionados.includes(id)) {
          set({ eleitoresSelecionados: eleitoresSelecionados.filter((e) => e !== id) });
        } else {
          set({ eleitoresSelecionados: [...eleitoresSelecionados, id] });
        }
      },

      selecionarTodos: () => {
        const { eleitoresFiltrados } = get();
        set({ eleitoresSelecionados: eleitoresFiltrados.map((e) => e.id) });
      },

      limparSelecao: () => set({ eleitoresSelecionados: [] }),

      selecionarPorFiltro: () => {
        const { eleitoresFiltrados } = get();
        set({ eleitoresSelecionados: eleitoresFiltrados.map((e) => e.id) });
      },

      setFiltros: (novosFiltros) => {
        set((state) => ({
          filtros: { ...state.filtros, ...novosFiltros },
        }));
        get().aplicarFiltros();
      },

      limparFiltros: () => {
        set({ filtros: filtrosIniciais });
        get().aplicarFiltros();
      },

      toggleFiltros: () => set((state) => ({ filtrosAbertos: !state.filtrosAbertos })),

      aplicarFiltros: () => {
        const { eleitores, filtros } = get();

        const filtrados = eleitores.filter((e) => {
          // Busca por texto
          if (filtros.busca) {
            const busca = filtros.busca.toLowerCase();
            const campos = [
              e.nome,
              e.profissao,
              e.historia_resumida,
              e.regiao_administrativa,
              e.ocupacao_vinculo,
            ]
              .join(' ')
              .toLowerCase();
            if (!campos.includes(busca)) return false;
          }

          // Filtro por gênero
          if (filtros.generos?.length && !filtros.generos.includes(e.genero)) {
            return false;
          }

          // Filtro por cluster
          if (filtros.clusters?.length && !filtros.clusters.includes(e.cluster_socioeconomico)) {
            return false;
          }

          // Filtro por região
          if (filtros.regioes?.length && !filtros.regioes.includes(e.regiao_administrativa)) {
            return false;
          }

          // Filtro por religião
          if (filtros.religioes?.length && !filtros.religioes.includes(e.religiao)) {
            return false;
          }

          // Filtro por orientação política
          if (filtros.orientacoes_politicas?.length && !filtros.orientacoes_politicas.includes(e.orientacao_politica)) {
            return false;
          }

          // Filtro por posição Bolsonaro
          if (filtros.posicoes_bolsonaro?.length && !filtros.posicoes_bolsonaro.includes(e.posicao_bolsonaro)) {
            return false;
          }

          // Filtro por faixa etária
          if (filtros.faixas_etarias?.length) {
            const faixaEleitor = calcularFaixaEtaria(e.idade);
            if (!filtros.faixas_etarias.includes(faixaEleitor)) {
              return false;
            }
          }

          // Filtro por escolaridade
          if (filtros.escolaridades?.length && !filtros.escolaridades.includes(e.escolaridade)) {
            return false;
          }

          // Filtro por ocupação/vínculo (funcionário público, CLT, etc.)
          if (filtros.ocupacoes_vinculos?.length && !filtros.ocupacoes_vinculos.includes(e.ocupacao_vinculo)) {
            return false;
          }

          // ============================================
          // NOVOS FILTROS
          // ============================================

          // Filtro por cor/raça
          if (filtros.cores_racas?.length && !filtros.cores_racas.includes(e.cor_raca)) {
            return false;
          }

          // Filtro por faixa de renda
          if (filtros.faixas_renda?.length && !filtros.faixas_renda.includes(e.renda_salarios_minimos)) {
            return false;
          }

          // Filtro por estado civil
          if (filtros.estados_civis?.length && !filtros.estados_civis.includes(e.estado_civil)) {
            return false;
          }

          // Filtro por filhos
          if (filtros.tem_filhos?.length) {
            const temFilhos = e.filhos > 0 ? 'sim' : 'nao';
            if (!filtros.tem_filhos.includes(temFilhos)) {
              return false;
            }
          }

          // Filtro por interesse político
          if (filtros.interesses_politicos?.length && !filtros.interesses_politicos.includes(e.interesse_politico)) {
            return false;
          }

          // Filtro por estilo de decisão
          if (filtros.estilos_decisao?.length && e.estilo_decisao && !filtros.estilos_decisao.includes(e.estilo_decisao)) {
            return false;
          }

          // Filtro por tolerância à nuance
          if (filtros.tolerancias_nuance?.length && e.tolerancia_nuance && !filtros.tolerancias_nuance.includes(e.tolerancia_nuance)) {
            return false;
          }

          // Filtro por vieses cognitivos (verifica se tem pelo menos um dos vieses selecionados)
          if (filtros.vieses_cognitivos?.length && e.vieses_cognitivos) {
            const temVies = filtros.vieses_cognitivos.some((v) => e.vieses_cognitivos?.includes(v));
            if (!temVies) return false;
          }

          // Filtro por fontes de informação (verifica se tem pelo menos uma das fontes selecionadas)
          if (filtros.fontes_informacao?.length && e.fontes_informacao) {
            const temFonte = filtros.fontes_informacao.some((f) => e.fontes_informacao?.includes(f));
            if (!temFonte) return false;
          }

          // Filtro por susceptibilidade à desinformação
          if (filtros.susceptibilidade_desinformacao?.length && e.susceptibilidade_desinformacao !== undefined) {
            const valor = e.susceptibilidade_desinformacao;
            const faixa = valor <= 3 ? '1-3' : valor <= 6 ? '4-6' : '7-10';
            if (!filtros.susceptibilidade_desinformacao.includes(faixa)) {
              return false;
            }
          }

          // Filtro por voto facultativo
          if (filtros.voto_facultativo?.length && e.voto_facultativo !== undefined) {
            const valor = e.voto_facultativo ? 'sim' : 'nao';
            if (!filtros.voto_facultativo.includes(valor)) {
              return false;
            }
          }

          // Filtro por conflito identitário
          if (filtros.conflito_identitario?.length && e.conflito_identitario !== undefined) {
            const valor = e.conflito_identitario ? 'sim' : 'nao';
            if (!filtros.conflito_identitario.includes(valor)) {
              return false;
            }
          }

          // Filtro por meio de transporte
          if (filtros.meios_transporte?.length && e.meio_transporte && !filtros.meios_transporte.includes(e.meio_transporte)) {
            return false;
          }

          return true;
        });

        set({ eleitoresFiltrados: filtrados });
      },

      adicionarEleitores: (novosEleitores) => {
        set((state) => ({
          eleitores: [...state.eleitores, ...novosEleitores],
        }));
        get().aplicarFiltros();
      },

      removerEleitor: (id) => {
        set((state) => ({
          eleitores: state.eleitores.filter((e) => e.id !== id),
          eleitoresSelecionados: state.eleitoresSelecionados.filter((e) => e !== id),
        }));
        get().aplicarFiltros();
      },
    }),
    {
      name: 'eleitores-store',
      partialize: (state) => ({
        filtros: state.filtros,
        eleitoresSelecionados: state.eleitoresSelecionados,
      }),
    }
  )
);

// Função auxiliar para calcular faixa etária
function calcularFaixaEtaria(idade: number): string {
  if (idade < 25) return '16-24';
  if (idade < 35) return '25-34';
  if (idade < 45) return '35-44';
  if (idade < 55) return '45-54';
  if (idade < 65) return '55-64';
  return '65+';
}

// ============================================
// SELETORES OTIMIZADOS
// Performance: Usa seletores específicos para evitar re-renders
// ============================================

/** Retorna apenas os eleitores filtrados */
export const useEleitoresFiltrados = () =>
  useEleitoresStore((state) => state.eleitoresFiltrados);

/** Retorna apenas os IDs selecionados */
export const useEleitoresSelecionados = () =>
  useEleitoresStore((state) => state.eleitoresSelecionados);

/** Retorna apenas os filtros */
export const useFiltros = () =>
  useEleitoresStore((state) => state.filtros);

/** Retorna apenas o estado de carregamento */
export const useCarregando = () =>
  useEleitoresStore((state) => state.carregando);

/** Retorna apenas o erro */
export const useErro = () =>
  useEleitoresStore((state) => state.erro);

/** Retorna apenas as ações de seleção (sem causar re-render por estado) */
export const useSelecaoActions = () =>
  useEleitoresStore((state) => ({
    toggleSelecionarParaEntrevista: state.toggleSelecionarParaEntrevista,
    selecionarTodos: state.selecionarTodos,
    limparSelecao: state.limparSelecao,
    selecionarPorFiltro: state.selecionarPorFiltro,
  }));

/** Retorna apenas as ações de filtro (sem causar re-render por estado) */
export const useFiltrosActions = () =>
  useEleitoresStore((state) => ({
    setFiltros: state.setFiltros,
    limparFiltros: state.limparFiltros,
    toggleFiltros: state.toggleFiltros,
  }));

/** Retorna contagem de selecionados (número primitivo - otimiza re-renders) */
export const useContagemSelecionados = () =>
  useEleitoresStore((state) => state.eleitoresSelecionados.length);

/** Retorna contagem de filtrados (número primitivo - otimiza re-renders) */
export const useContagemFiltrados = () =>
  useEleitoresStore((state) => state.eleitoresFiltrados.length);
