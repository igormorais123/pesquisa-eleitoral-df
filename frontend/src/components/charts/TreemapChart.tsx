'use client';

/**
 * Componente TreemapChart
 * Visualiza proporções hierárquicas
 * Pesquisa Eleitoral DF 2026
 */

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Eleitor } from '@/types';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface TreemapChartProps {
  eleitores: Eleitor[];
  niveis: Array<'regiao_administrativa' | 'cluster_socioeconomico' | 'orientacao_politica' | 'genero' | 'religiao'>;
  altura?: number;
}

const CORES_POR_CATEGORIA: Record<string, string> = {
  // Orientação política
  'esquerda': '#ef4444',
  'centro-esquerda': '#f97316',
  'centro': '#a3a3a3',
  'centro-direita': '#3b82f6',
  'direita': '#1e40af',

  // Gênero
  'masculino': '#3b82f6',
  'feminino': '#ec4899',

  // Cluster
  'G1_alta': '#22c55e',
  'G2_media_alta': '#84cc16',
  'G3_media_baixa': '#eab308',
  'G4_baixa': '#f97316',
};

export function TreemapChart({
  eleitores,
  niveis,
  altura = 500,
}: TreemapChartProps) {
  const { labels, parents, values, colors } = useMemo(() => {
    const labelsArr: string[] = ['Eleitores'];
    const parentsArr: string[] = [''];
    const valuesArr: number[] = [eleitores.length];
    const colorsArr: string[] = ['#3b82f6'];

    if (niveis.length === 0) {
      return { labels: labelsArr, parents: parentsArr, values: valuesArr, colors: colorsArr };
    }

    // Primeiro nível
    const nivel1 = niveis[0];
    const contagem1: Record<string, number> = {};

    for (const e of eleitores) {
      const valor = (e[nivel1] as string) || 'Outros';
      contagem1[valor] = (contagem1[valor] || 0) + 1;
    }

    for (const [nome, count] of Object.entries(contagem1)) {
      labelsArr.push(nome);
      parentsArr.push('Eleitores');
      valuesArr.push(count);
      colorsArr.push(CORES_POR_CATEGORIA[nome.toLowerCase()] || '#6b7280');
    }

    // Segundo nível (se houver)
    if (niveis.length >= 2) {
      const nivel2 = niveis[1];

      for (const [nome1] of Object.entries(contagem1)) {
        const eleitoresNivel1 = eleitores.filter(e => (e[nivel1] as string || 'Outros') === nome1);
        const contagem2: Record<string, number> = {};

        for (const e of eleitoresNivel1) {
          const valor = (e[nivel2] as string) || 'Outros';
          contagem2[valor] = (contagem2[valor] || 0) + 1;
        }

        for (const [nome2, count] of Object.entries(contagem2)) {
          const labelUnico = `${nome1} - ${nome2}`;
          labelsArr.push(labelUnico);
          parentsArr.push(nome1);
          valuesArr.push(count);
          colorsArr.push(CORES_POR_CATEGORIA[nome2.toLowerCase()] || '#6b7280');
        }
      }
    }

    return { labels: labelsArr, parents: parentsArr, values: valuesArr, colors: colorsArr };
  }, [eleitores, niveis]);

  return (
    <div className="w-full" style={{ height: altura }}>
      <Plot
        data={[
          {
            type: 'treemap',
            labels,
            parents,
            values,
            marker: {
              colors,
              line: { width: 1, color: '#1f2937' },
            },
            textinfo: 'label+value+percent parent',
            textfont: { size: 12, color: '#fff' },
            hovertemplate: '<b>%{label}</b><br>Total: %{value}<br>%{percentParent:.1%} do grupo pai<extra></extra>',
          },
        ]}
        layout={{
          title: {
            text: `Distribuição: ${niveis.map(n => n.replace('_', ' ')).join(' → ')}`,
            font: { color: '#e5e7eb', size: 14 },
          },
          paper_bgcolor: 'transparent',
          margin: { l: 10, r: 10, t: 50, b: 10 },
          height: altura,
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

export default TreemapChart;
