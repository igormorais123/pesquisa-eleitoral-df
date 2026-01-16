'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Parlamentar,
  FiltrosParlamentar,
  CasaLegislativa,
  EstatisticasParlamentares
} from '@/types';

// Interface estendida para filtros
interface FiltrosParlamentarExtendido extends FiltrosParlamentar {
  estilos_comunicacao?: string[];
  formacoes?: string[];
}

interface ParlamentaresState {
  // Dados
  parlamentares: Parlamentar[];
  parlamentaresFiltrados: Parlamentar[];
  parlamentarSelecionado: Parlamentar | null;
  parlamentaresSelecionados: string[];
  carregando: boolean;
  erro: string | null;

  // Filtros
  filtros: FiltrosParlamentarExtendido;
  filtrosAbertos: boolean;
  casaAtiva: CasaLegislativa | 'todas';

  // Estatísticas
  estatisticas: EstatisticasParlamentares | null;

  // Ações
  setParlamentares: (parlamentares: Parlamentar[]) => void;
  setCarregando: (carregando: boolean) => void;
  setErro: (erro: string | null) => void;
  selecionarParlamentar: (parlamentar: Parlamentar | null) => void;
  toggleSelecionarParaPesquisa: (id: string) => void;
  selecionarTodos: () => void;
  limparSelecao: () => void;
  selecionarPorFiltro: () => void;
  setFiltros: (filtros: Partial<FiltrosParlamentarExtendido>) => void;
  limparFiltros: () => void;
  toggleFiltros: () => void;
  setCasaAtiva: (casa: CasaLegislativa | 'todas') => void;
  aplicarFiltros: () => void;
  calcularEstatisticas: () => void;
}

const filtrosIniciais: FiltrosParlamentarExtendido = {
  busca: '',
  casas_legislativas: [],
  partidos: [],
  generos: [],
  orientacoes_politicas: [],
  posicoes_bolsonaro: [],
  posicoes_lula: [],
  religioes: [],
  temas_atuacao: [],
  relacoes_governo: [],
  estilos_comunicacao: [],
  formacoes: [],
};

export const useParlamentaresStore = create<ParlamentaresState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      parlamentares: [],
      parlamentaresFiltrados: [],
      parlamentarSelecionado: null,
      parlamentaresSelecionados: [],
      carregando: false,
      erro: null,
      filtros: filtrosIniciais,
      filtrosAbertos: false,
      casaAtiva: 'todas',
      estatisticas: null,

      // Ações
      setParlamentares: (parlamentares) => {
        set({ parlamentares });
        get().aplicarFiltros();
        get().calcularEstatisticas();
      },

      setCarregando: (carregando) => set({ carregando }),

      setErro: (erro) => set({ erro }),

      selecionarParlamentar: (parlamentar) => set({ parlamentarSelecionado: parlamentar }),

      toggleSelecionarParaPesquisa: (id) => {
        const { parlamentaresSelecionados } = get();
        if (parlamentaresSelecionados.includes(id)) {
          set({ parlamentaresSelecionados: parlamentaresSelecionados.filter((pId) => pId !== id) });
        } else {
          set({ parlamentaresSelecionados: [...parlamentaresSelecionados, id] });
        }
      },

      selecionarTodos: () => {
        const { parlamentaresFiltrados } = get();
        set({ parlamentaresSelecionados: parlamentaresFiltrados.map((p) => p.id) });
      },

      limparSelecao: () => set({ parlamentaresSelecionados: [] }),

      selecionarPorFiltro: () => {
        const { parlamentaresFiltrados } = get();
        set({ parlamentaresSelecionados: parlamentaresFiltrados.map((p) => p.id) });
      },

      setFiltros: (novosFiltros) => {
        const { filtros } = get();
        set({ filtros: { ...filtros, ...novosFiltros } });
        get().aplicarFiltros();
      },

      limparFiltros: () => {
        set({ filtros: filtrosIniciais });
        get().aplicarFiltros();
      },

      toggleFiltros: () => {
        const { filtrosAbertos } = get();
        set({ filtrosAbertos: !filtrosAbertos });
      },

      setCasaAtiva: (casa) => {
        set({ casaAtiva: casa });
        get().aplicarFiltros();
      },

      aplicarFiltros: () => {
        const { parlamentares, filtros, casaAtiva } = get();

        const filtrados = parlamentares.filter((p) => {
          // Filtro por casa ativa (aba selecionada)
          if (casaAtiva !== 'todas' && p.casa_legislativa !== casaAtiva) {
            return false;
          }

          // Busca textual
          if (filtros.busca) {
            const busca = filtros.busca.toLowerCase();
            const match =
              p.nome.toLowerCase().includes(busca) ||
              p.nome_parlamentar.toLowerCase().includes(busca) ||
              p.partido.toLowerCase().includes(busca) ||
              p.base_eleitoral.toLowerCase().includes(busca) ||
              p.temas_atuacao.some((t) => t.toLowerCase().includes(busca));
            if (!match) return false;
          }

          // Filtro por casas legislativas
          if (filtros.casas_legislativas?.length && !filtros.casas_legislativas.includes(p.casa_legislativa)) {
            return false;
          }

          // Filtro por partidos
          if (filtros.partidos?.length && !filtros.partidos.includes(p.partido)) {
            return false;
          }

          // Filtro por gênero
          if (filtros.generos?.length && !filtros.generos.includes(p.genero)) {
            return false;
          }

          // Filtro por orientação política
          if (filtros.orientacoes_politicas?.length && !filtros.orientacoes_politicas.includes(p.orientacao_politica)) {
            return false;
          }

          // Filtro por posição Bolsonaro
          if (filtros.posicoes_bolsonaro?.length && !filtros.posicoes_bolsonaro.includes(p.posicao_bolsonaro)) {
            return false;
          }

          // Filtro por posição Lula
          if (filtros.posicoes_lula?.length && p.posicao_lula && !filtros.posicoes_lula.includes(p.posicao_lula)) {
            return false;
          }

          // Filtro por religião
          if (filtros.religioes?.length && !filtros.religioes.includes(p.religiao)) {
            return false;
          }

          // Filtro por temas de atuação
          if (filtros.temas_atuacao?.length) {
            const temAlgumTema = filtros.temas_atuacao.some((tema) =>
              p.temas_atuacao.some((t) => t.toLowerCase().includes(tema.toLowerCase()))
            );
            if (!temAlgumTema) return false;
          }

          // Filtro por relação com governo
          if (filtros.relacoes_governo?.length && p.relacao_governo_atual && !filtros.relacoes_governo.includes(p.relacao_governo_atual)) {
            return false;
          }

          return true;
        });

        set({ parlamentaresFiltrados: filtrados });
      },

      calcularEstatisticas: () => {
        const { parlamentares } = get();
        if (!parlamentares.length) {
          set({ estatisticas: null });
          return;
        }

        // Por casa legislativa
        const casas = ['camara_federal', 'senado', 'cldf'] as CasaLegislativa[];
        const porCasa = casas.map((casa) => {
          const count = parlamentares.filter((p) => p.casa_legislativa === casa).length;
          return {
            casa,
            contagem: count,
            percentual: (count / parlamentares.length) * 100,
          };
        });

        // Por partido
        const partidos = [...new Set(parlamentares.map((p) => p.partido))];
        const porPartido = partidos
          .map((partido) => {
            const count = parlamentares.filter((p) => p.partido === partido).length;
            return {
              partido,
              contagem: count,
              percentual: (count / parlamentares.length) * 100,
            };
          })
          .sort((a, b) => b.contagem - a.contagem);

        // Por gênero
        const generos = ['masculino', 'feminino'] as const;
        const porGenero = generos.map((genero) => {
          const count = parlamentares.filter((p) => p.genero === genero).length;
          return {
            genero,
            contagem: count,
            percentual: (count / parlamentares.length) * 100,
          };
        });

        // Por orientação política
        const orientacoes = ['esquerda', 'centro-esquerda', 'centro', 'centro-direita', 'direita'] as const;
        const porOrientacao = orientacoes.map((orientacao) => {
          const count = parlamentares.filter((p) => p.orientacao_politica === orientacao).length;
          return {
            orientacao,
            contagem: count,
            percentual: (count / parlamentares.length) * 100,
          };
        });

        // Por posição Bolsonaro
        const posicoesBolsonaro = ['apoiador_forte', 'apoiador_moderado', 'neutro', 'critico_moderado', 'critico_forte'] as const;
        const porPosicaoBolsonaro = posicoesBolsonaro.map((posicao) => {
          const count = parlamentares.filter((p) => p.posicao_bolsonaro === posicao).length;
          return {
            posicao,
            contagem: count,
            percentual: (count / parlamentares.length) * 100,
          };
        });

        // Por relação com governo
        const relacoes = ['base_aliada', 'independente', 'oposicao_moderada', 'oposicao_forte'] as const;
        const porRelacao = relacoes.map((relacao) => {
          const count = parlamentares.filter((p) => p.relacao_governo_atual === relacao).length;
          return {
            relacao,
            contagem: count,
            percentual: (count / parlamentares.length) * 100,
          };
        });

        // Médias
        const mediaIdade = parlamentares.reduce((sum, p) => sum + p.idade, 0) / parlamentares.length;
        const mediaVotos = parlamentares.reduce((sum, p) => sum + p.votos_eleicao, 0) / parlamentares.length;

        set({
          estatisticas: {
            total: parlamentares.length,
            por_casa: porCasa,
            por_partido: porPartido,
            por_genero: porGenero,
            por_orientacao_politica: porOrientacao,
            por_posicao_bolsonaro: porPosicaoBolsonaro,
            por_relacao_governo: porRelacao,
            media_idade: Math.round(mediaIdade),
            media_votos: Math.round(mediaVotos),
          },
        });
      },
    }),
    {
      name: 'parlamentares-storage',
      partialize: (state) => ({
        parlamentaresSelecionados: state.parlamentaresSelecionados,
        filtros: state.filtros,
        casaAtiva: state.casaAtiva,
      }),
    }
  )
);

// Seletores otimizados
export const useParlamentaresFiltrados = () => useParlamentaresStore((state) => state.parlamentaresFiltrados);
export const useParlamentaresSelecionados = () => useParlamentaresStore((state) => state.parlamentaresSelecionados);
export const useFiltrosParlamentares = () => useParlamentaresStore((state) => state.filtros);
export const useCasaAtiva = () => useParlamentaresStore((state) => state.casaAtiva);
export const useEstatisticasParlamentares = () => useParlamentaresStore((state) => state.estatisticas);
export const useContagemSelecionadosParlamentares = () => useParlamentaresStore((state) => state.parlamentaresSelecionados.length);

// Ações
export const useParlamentaresActions = () =>
  useParlamentaresStore((state) => ({
    setParlamentares: state.setParlamentares,
    selecionarParlamentar: state.selecionarParlamentar,
    toggleSelecionarParaPesquisa: state.toggleSelecionarParaPesquisa,
    selecionarTodos: state.selecionarTodos,
    limparSelecao: state.limparSelecao,
    selecionarPorFiltro: state.selecionarPorFiltro,
    setFiltros: state.setFiltros,
    limparFiltros: state.limparFiltros,
    toggleFiltros: state.toggleFiltros,
    setCasaAtiva: state.setCasaAtiva,
  }));
