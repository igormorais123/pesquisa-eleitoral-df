'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Eleitor, FiltrosEleitor } from '@/types';

interface EleitoresState {
  // Dados
  eleitores: Eleitor[];
  eleitoresFiltrados: Eleitor[];
  eleitorSelecionado: Eleitor | null;
  eleitoresSelecionados: string[];
  carregando: boolean;
  erro: string | null;

  // Filtros
  filtros: FiltrosEleitor;
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
  setFiltros: (filtros: Partial<FiltrosEleitor>) => void;
  limparFiltros: () => void;
  toggleFiltros: () => void;
  aplicarFiltros: () => void;
  adicionarEleitores: (eleitores: Eleitor[]) => void;
  removerEleitor: (id: string) => void;
}

const filtrosIniciais: FiltrosEleitor = {
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
