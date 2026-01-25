'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Gestor,
  FiltrosGestor,
  SetorGestor,
  NivelHierarquico,
  EstatisticasGestores,
  DistribuicaoPODC
} from '@/types';

interface GestoresState {
  // Dados
  gestores: Gestor[];
  gestoresFiltrados: Gestor[];
  gestorSelecionado: Gestor | null;
  gestoresSelecionados: string[];
  carregando: boolean;
  erro: string | null;

  // Filtros
  filtros: FiltrosGestor;
  filtrosAbertos: boolean;
  setorAtivo: SetorGestor | 'todos';
  nivelAtivo: NivelHierarquico | 'todos';

  // Estatisticas
  estatisticas: EstatisticasGestores | null;

  // Acoes
  setGestores: (gestores: Gestor[]) => void;
  setCarregando: (carregando: boolean) => void;
  setErro: (erro: string | null) => void;
  selecionarGestor: (gestor: Gestor | null) => void;
  toggleSelecionarParaPesquisa: (id: string) => void;
  selecionarTodos: () => void;
  limparSelecao: () => void;
  selecionarPorFiltro: () => void;
  setFiltros: (filtros: Partial<FiltrosGestor>) => void;
  limparFiltros: () => void;
  toggleFiltros: () => void;
  setSetorAtivo: (setor: SetorGestor | 'todos') => void;
  setNivelAtivo: (nivel: NivelHierarquico | 'todos') => void;
  aplicarFiltros: () => void;
  calcularEstatisticas: () => void;
}

const filtrosIniciais: FiltrosGestor = {
  busca: '',
  setores: [],
  niveis_hierarquicos: [],
  generos: [],
  areas_atuacao: [],
  tipos_orgao: [],
  setores_privados: [],
  portes_empresa: [],
  faixas_etarias: [],
  localizacoes: [],
  estilos_lideranca: [],
};

export const useGestoresStore = create<GestoresState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      gestores: [],
      gestoresFiltrados: [],
      gestorSelecionado: null,
      gestoresSelecionados: [],
      carregando: false,
      erro: null,
      filtros: filtrosIniciais,
      filtrosAbertos: false,
      setorAtivo: 'todos',
      nivelAtivo: 'todos',
      estatisticas: null,

      // Acoes
      setGestores: (gestores) => {
        set({ gestores });
        get().aplicarFiltros();
        get().calcularEstatisticas();
      },

      setCarregando: (carregando) => set({ carregando }),

      setErro: (erro) => set({ erro }),

      selecionarGestor: (gestor) => set({ gestorSelecionado: gestor }),

      toggleSelecionarParaPesquisa: (id) => {
        const { gestoresSelecionados } = get();
        if (gestoresSelecionados.includes(id)) {
          set({ gestoresSelecionados: gestoresSelecionados.filter((gId) => gId !== id) });
        } else {
          set({ gestoresSelecionados: [...gestoresSelecionados, id] });
        }
      },

      selecionarTodos: () => {
        const { gestoresFiltrados } = get();
        set({ gestoresSelecionados: gestoresFiltrados.map((g) => g.id) });
      },

      limparSelecao: () => set({ gestoresSelecionados: [] }),

      selecionarPorFiltro: () => {
        const { gestoresFiltrados } = get();
        set({ gestoresSelecionados: gestoresFiltrados.map((g) => g.id) });
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

      setSetorAtivo: (setor) => {
        set({ setorAtivo: setor });
        get().aplicarFiltros();
      },

      setNivelAtivo: (nivel) => {
        set({ nivelAtivo: nivel });
        get().aplicarFiltros();
      },

      aplicarFiltros: () => {
        const { gestores, filtros, setorAtivo, nivelAtivo } = get();

        const filtrados = gestores.filter((g) => {
          // Filtro por setor ativo (aba selecionada)
          if (setorAtivo !== 'todos' && g.setor !== setorAtivo) {
            return false;
          }

          // Filtro por nivel ativo
          if (nivelAtivo !== 'todos' && g.nivel_hierarquico !== nivelAtivo) {
            return false;
          }

          // Busca textual
          if (filtros.busca) {
            const busca = filtros.busca.toLowerCase();
            const match =
              g.nome.toLowerCase().includes(busca) ||
              g.cargo.toLowerCase().includes(busca) ||
              g.instituicao.toLowerCase().includes(busca) ||
              g.area_atuacao.toLowerCase().includes(busca) ||
              g.localizacao.toLowerCase().includes(busca);
            if (!match) return false;
          }

          // Filtro por setores
          if (filtros.setores?.length && !filtros.setores.includes(g.setor)) {
            return false;
          }

          // Filtro por niveis hierarquicos
          if (filtros.niveis_hierarquicos?.length && !filtros.niveis_hierarquicos.includes(g.nivel_hierarquico)) {
            return false;
          }

          // Filtro por genero
          if (filtros.generos?.length && !filtros.generos.includes(g.genero)) {
            return false;
          }

          // Filtro por areas de atuacao
          if (filtros.areas_atuacao?.length && !filtros.areas_atuacao.includes(g.area_atuacao)) {
            return false;
          }

          // Filtro por tipos de orgao (setor publico)
          if (filtros.tipos_orgao?.length && g.tipo_orgao && !filtros.tipos_orgao.includes(g.tipo_orgao)) {
            return false;
          }

          // Filtro por setores privados
          if (filtros.setores_privados?.length && g.setor_privado && !filtros.setores_privados.includes(g.setor_privado)) {
            return false;
          }

          // Filtro por porte de empresa
          if (filtros.portes_empresa?.length && g.porte_empresa && !filtros.portes_empresa.includes(g.porte_empresa)) {
            return false;
          }

          // Filtro por faixa etaria
          if (filtros.faixas_etarias?.length) {
            const idade = g.idade;
            const faixaMatch = filtros.faixas_etarias.some((faixa) => {
              if (faixa === '25-34') return idade >= 25 && idade <= 34;
              if (faixa === '35-44') return idade >= 35 && idade <= 44;
              if (faixa === '45-54') return idade >= 45 && idade <= 54;
              if (faixa === '55-64') return idade >= 55 && idade <= 64;
              if (faixa === '65+') return idade >= 65;
              return false;
            });
            if (!faixaMatch) return false;
          }

          // Filtro por localizacao
          if (filtros.localizacoes?.length) {
            const locMatch = filtros.localizacoes.some((loc) =>
              g.localizacao.toLowerCase().includes(loc.toLowerCase())
            );
            if (!locMatch) return false;
          }

          // Filtro por estilo de lideranca
          if (filtros.estilos_lideranca?.length && !filtros.estilos_lideranca.includes(g.estilo_lideranca)) {
            return false;
          }

          return true;
        });

        set({ gestoresFiltrados: filtrados });
      },

      calcularEstatisticas: () => {
        const { gestores } = get();
        if (!gestores.length) {
          set({ estatisticas: null });
          return;
        }

        // Por setor
        const setores: SetorGestor[] = ['publico', 'privado'];
        const porSetor = setores.map((setor) => {
          const count = gestores.filter((g) => g.setor === setor).length;
          return {
            categoria: setor === 'publico' ? 'Publico' : 'Privado',
            contagem: count,
            percentual: (count / gestores.length) * 100,
          };
        });

        // Por nivel hierarquico
        const niveis: NivelHierarquico[] = ['estrategico', 'tatico', 'operacional'];
        const porNivel = niveis.map((nivel) => {
          const count = gestores.filter((g) => g.nivel_hierarquico === nivel).length;
          return {
            categoria: nivel.charAt(0).toUpperCase() + nivel.slice(1),
            contagem: count,
            percentual: (count / gestores.length) * 100,
          };
        });

        // Por genero
        const generos = ['masculino', 'feminino'] as const;
        const porGenero = generos.map((genero) => {
          const count = gestores.filter((g) => g.genero === genero).length;
          return {
            categoria: genero.charAt(0).toUpperCase() + genero.slice(1),
            contagem: count,
            percentual: (count / gestores.length) * 100,
          };
        });

        // Por area de atuacao (top 10)
        const areasMap = new Map<string, number>();
        gestores.forEach((g) => {
          const area = g.area_atuacao;
          areasMap.set(area, (areasMap.get(area) || 0) + 1);
        });
        const porArea = Array.from(areasMap.entries())
          .map(([area, count]) => ({
            categoria: area.replace(/_/g, ' '),
            contagem: count,
            percentual: (count / gestores.length) * 100,
          }))
          .sort((a, b) => b.contagem - a.contagem)
          .slice(0, 10);

        // Por localizacao (top 10)
        const locMap = new Map<string, number>();
        gestores.forEach((g) => {
          const loc = g.localizacao.split(',')[0].trim();
          locMap.set(loc, (locMap.get(loc) || 0) + 1);
        });
        const porLocalizacao = Array.from(locMap.entries())
          .map(([loc, count]) => ({
            categoria: loc,
            contagem: count,
            percentual: (count / gestores.length) * 100,
          }))
          .sort((a, b) => b.contagem - a.contagem)
          .slice(0, 10);

        // Media de idade
        const mediaIdade = gestores.reduce((sum, g) => sum + g.idade, 0) / gestores.length;

        // Media PODC
        const mediaPODC: DistribuicaoPODC = {
          planejar: 0,
          organizar: 0,
          dirigir: 0,
          controlar: 0,
        };
        gestores.forEach((g) => {
          mediaPODC.planejar += g.distribuicao_podc.planejar;
          mediaPODC.organizar += g.distribuicao_podc.organizar;
          mediaPODC.dirigir += g.distribuicao_podc.dirigir;
          mediaPODC.controlar += g.distribuicao_podc.controlar;
        });
        mediaPODC.planejar = Math.round((mediaPODC.planejar / gestores.length) * 10) / 10;
        mediaPODC.organizar = Math.round((mediaPODC.organizar / gestores.length) * 10) / 10;
        mediaPODC.dirigir = Math.round((mediaPODC.dirigir / gestores.length) * 10) / 10;
        mediaPODC.controlar = Math.round((mediaPODC.controlar / gestores.length) * 10) / 10;

        set({
          estatisticas: {
            total: gestores.length,
            por_setor: porSetor,
            por_nivel: porNivel,
            por_genero: porGenero,
            por_area: porArea,
            por_localizacao: porLocalizacao,
            media_idade: Math.round(mediaIdade),
            media_podc: mediaPODC,
          },
        });
      },
    }),
    {
      name: 'gestores-storage',
      partialize: (state) => ({
        gestoresSelecionados: state.gestoresSelecionados,
        filtros: state.filtros,
        setorAtivo: state.setorAtivo,
        nivelAtivo: state.nivelAtivo,
      }),
    }
  )
);

// Seletores otimizados
export const useGestoresFiltrados = () => useGestoresStore((state) => state.gestoresFiltrados);
export const useGestoresSelecionados = () => useGestoresStore((state) => state.gestoresSelecionados);
export const useFiltrosGestores = () => useGestoresStore((state) => state.filtros);
export const useSetorAtivo = () => useGestoresStore((state) => state.setorAtivo);
export const useNivelAtivo = () => useGestoresStore((state) => state.nivelAtivo);
export const useEstatisticasGestores = () => useGestoresStore((state) => state.estatisticas);
export const useContagemSelecionadosGestores = () => useGestoresStore((state) => state.gestoresSelecionados.length);

// Acoes
export const useGestoresActions = () =>
  useGestoresStore((state) => ({
    setGestores: state.setGestores,
    selecionarGestor: state.selecionarGestor,
    toggleSelecionarParaPesquisa: state.toggleSelecionarParaPesquisa,
    selecionarTodos: state.selecionarTodos,
    limparSelecao: state.limparSelecao,
    selecionarPorFiltro: state.selecionarPorFiltro,
    setFiltros: state.setFiltros,
    limparFiltros: state.limparFiltros,
    toggleFiltros: state.toggleFiltros,
    setSetorAtivo: state.setSetorAtivo,
    setNivelAtivo: state.setNivelAtivo,
  }));

// Seletores avançados para estatisticas PODC por setor e nivel
export const useEstatisticasPODCPorGrupo = () => {
  const gestores = useGestoresStore((state) => state.gestores);

  const calcularPODCPorGrupo = (setor: SetorGestor | 'todos', nivel: NivelHierarquico | 'todos') => {
    let filtrados = gestores;

    if (setor !== 'todos') {
      filtrados = filtrados.filter((g) => g.setor === setor);
    }
    if (nivel !== 'todos') {
      filtrados = filtrados.filter((g) => g.nivel_hierarquico === nivel);
    }

    if (filtrados.length === 0) return null;

    const media: DistribuicaoPODC = {
      planejar: 0,
      organizar: 0,
      dirigir: 0,
      controlar: 0,
    };

    filtrados.forEach((g) => {
      media.planejar += g.distribuicao_podc.planejar;
      media.organizar += g.distribuicao_podc.organizar;
      media.dirigir += g.distribuicao_podc.dirigir;
      media.controlar += g.distribuicao_podc.controlar;
    });

    return {
      planejar: Math.round((media.planejar / filtrados.length) * 10) / 10,
      organizar: Math.round((media.organizar / filtrados.length) * 10) / 10,
      dirigir: Math.round((media.dirigir / filtrados.length) * 10) / 10,
      controlar: Math.round((media.controlar / filtrados.length) * 10) / 10,
      total: filtrados.length,
    };
  };

  return { calcularPODCPorGrupo };
};
