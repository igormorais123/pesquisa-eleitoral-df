'use client';

/**
 * Componente ViolinPlot
 * Visualiza distribuição de dados numéricos
 * Pesquisa Eleitoral DF 2026
 */

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Eleitor } from '@/types';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface ViolinPlotProps {
  eleitores: Eleitor[];
  campo: 'idade' | 'susceptibilidade_desinformacao';
  grupoPor?: 'genero' | 'orientacao_politica' | 'cluster_socioeconomico';
  altura?: number;
}

const LABELS: Record<string, string> = {
  idade: 'Idade',
  susceptibilidade_desinformacao: 'Susceptibilidade à Desinformação',
  genero: 'Gênero',
  orientacao_politica: 'Orientação Política',
  cluster_socioeconomico: 'Classe Social',
};

export function ViolinPlot({
  eleitores,
  campo,
  grupoPor,
  altura = 400,
}: ViolinPlotProps) {
  const dados = useMemo(() => {
    if (!grupoPor) {
      // Violin único
      const valores = eleitores
        .map(e => campo === 'idade' ? e.idade : (e.susceptibilidade_desinformacao ?? 5))
        .filter(v => v !== null && v !== undefined);

      return [{
        type: 'violin' as const,
        y: valores,
        name: LABELS[campo],
        box: { visible: true },
        meanline: { visible: true },
        fillcolor: 'rgba(59, 130, 246, 0.5)',
        line: { color: '#3b82f6' },
      }];
    }

    // Violins agrupados
    const grupos: Record<string, number[]> = {};

    for (const eleitor of eleitores) {
      const grupo = eleitor[grupoPor] as string || 'Outros';
      const valor = campo === 'idade' ? eleitor.idade : (eleitor.susceptibilidade_desinformacao ?? 5);

      if (!grupos[grupo]) grupos[grupo] = [];
      grupos[grupo].push(valor);
    }

    const cores = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

    return Object.entries(grupos).map(([grupo, valores], index) => ({
      type: 'violin' as const,
      y: valores,
      name: grupo,
      box: { visible: true },
      meanline: { visible: true },
      fillcolor: `${cores[index % cores.length]}80`,
      line: { color: cores[index % cores.length] },
    }));
  }, [eleitores, campo, grupoPor]);

  const titulo = grupoPor
    ? `${LABELS[campo]} por ${LABELS[grupoPor]}`
    : `Distribuição de ${LABELS[campo]}`;

  return (
    <div className="w-full" style={{ height: altura }}>
      <Plot
        data={dados}
        layout={{
          title: {
            text: titulo,
            font: { color: '#e5e7eb', size: 14 },
          },
          font: { color: '#9ca3af', size: 11 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          margin: { l: 50, r: 20, t: 50, b: 50 },
          height: altura,
          xaxis: {
            color: '#9ca3af',
            gridcolor: '#374151',
          },
          yaxis: {
            color: '#9ca3af',
            gridcolor: '#374151',
            title: LABELS[campo],
          },
          showlegend: !!grupoPor,
          legend: {
            font: { color: '#9ca3af' },
            bgcolor: 'transparent',
          },
        }}
        config={{
          displayModeBar: false,
          responsive: true,
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default ViolinPlot;
