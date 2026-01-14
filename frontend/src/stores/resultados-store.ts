'use client';

import { create } from 'zustand';
import type { ResultadoEntrevista, Insight, Citacao, Distribuicao, Correlacao } from '@/types';

interface ResultadosState {
  // Resultado atual
  resultadoAtual: ResultadoEntrevista | null;

  // Insights
  insights: Insight[];
  insightsCarregando: boolean;

  // Voto Silencioso
  votoSilencioso: {
    eleitores: string[];
    percentual: number;
    perfilTipico: string;
  } | null;

  // Pontos de Ruptura
  pontosRuptura: {
    grupo: string;
    eventoGatilho: string;
    probabilidadeMudanca: number;
  }[];

  // Visualização
  visualizacaoAtiva: 'geral' | 'quantitativa' | 'qualitativa' | 'insights';
  graficosExpandidos: string[];

  // Filtros de resultado
  filtroSubgrupo: string | null;

  // Exportação
  exportando: boolean;

  // Ações
  setResultado: (resultado: ResultadoEntrevista | null) => void;
  setInsights: (insights: Insight[]) => void;
  setInsightsCarregando: (carregando: boolean) => void;
  setVotoSilencioso: (dados: ResultadosState['votoSilencioso']) => void;
  setPontosRuptura: (pontos: ResultadosState['pontosRuptura']) => void;
  setVisualizacao: (vis: ResultadosState['visualizacaoAtiva']) => void;
  toggleGraficoExpandido: (id: string) => void;
  setFiltroSubgrupo: (subgrupo: string | null) => void;
  setExportando: (exportando: boolean) => void;
  limparResultados: () => void;

  // Cálculos
  calcularEstatisticas: () => void;
}

export const useResultadosStore = create<ResultadosState>((set, get) => ({
  // Estado inicial
  resultadoAtual: null,
  insights: [],
  insightsCarregando: false,
  votoSilencioso: null,
  pontosRuptura: [],
  visualizacaoAtiva: 'geral',
  graficosExpandidos: [],
  filtroSubgrupo: null,
  exportando: false,

  // Ações
  setResultado: (resultado) => set({ resultadoAtual: resultado }),

  setInsights: (insights) => set({ insights }),

  setInsightsCarregando: (carregando) => set({ insightsCarregando: carregando }),

  setVotoSilencioso: (dados) => set({ votoSilencioso: dados }),

  setPontosRuptura: (pontos) => set({ pontosRuptura: pontos }),

  setVisualizacao: (vis) => set({ visualizacaoAtiva: vis }),

  toggleGraficoExpandido: (id) => {
    set((state) => ({
      graficosExpandidos: state.graficosExpandidos.includes(id)
        ? state.graficosExpandidos.filter((g) => g !== id)
        : [...state.graficosExpandidos, id],
    }));
  },

  setFiltroSubgrupo: (subgrupo) => set({ filtroSubgrupo: subgrupo }),

  setExportando: (exportando) => set({ exportando }),

  limparResultados: () => {
    set({
      resultadoAtual: null,
      insights: [],
      votoSilencioso: null,
      pontosRuptura: [],
      visualizacaoAtiva: 'geral',
      graficosExpandidos: [],
      filtroSubgrupo: null,
    });
  },

  calcularEstatisticas: () => {
    const { resultadoAtual } = get();
    if (!resultadoAtual) return;

    // Estatísticas são calculadas na API
    // Este método pode ser usado para cálculos adicionais no cliente
  },
}));
