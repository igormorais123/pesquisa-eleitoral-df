'use client';

/**
 * Componente FunnelChart
 * Visualiza funil de conversão/engajamento político
 * Pesquisa Eleitoral DF 2026
 */

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Eleitor } from '@/types';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface FunnelChartProps {
  eleitores: Eleitor[];
  tipo?: 'engajamento' | 'decisao' | 'susceptibilidade';
  altura?: number;
}

export function FunnelChart({
  eleitores,
  tipo = 'engajamento',
  altura = 400,
}: FunnelChartProps) {
  const dados = useMemo(() => {
    const total = eleitores.length;

    if (tipo === 'engajamento') {
      // Funil de engajamento político
      const interesseAlto = eleitores.filter(e => e.interesse_politico === 'alto').length;
      const interesseMedio = eleitores.filter(e => e.interesse_politico === 'medio').length;
      const interesseBaixo = eleitores.filter(e => e.interesse_politico === 'baixo').length;
      const toleranciaAlta = eleitores.filter(e => e.tolerancia_nuance === 'alta').length;

      return {
        labels: ['Total de Eleitores', 'Interesse Médio+', 'Interesse Alto', 'Alta Tolerância a Nuances'],
        values: [total, interesseMedio + interesseAlto, interesseAlto, toleranciaAlta],
        colors: ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'],
      };
    }

    if (tipo === 'decisao') {
      // Funil de estilo de decisão
      const pragmaticos = eleitores.filter(e => e.estilo_decisao?.toLowerCase().includes('pragmat')).length;
      const economicos = eleitores.filter(e => e.estilo_decisao?.toLowerCase().includes('econom')).length;
      const emocionais = eleitores.filter(e => e.estilo_decisao?.toLowerCase().includes('emocional')).length;
      const identitarios = eleitores.filter(e => e.estilo_decisao?.toLowerCase().includes('identit')).length;

      return {
        labels: ['Total', 'Pragmáticos', 'Econômicos', 'Emocionais', 'Identitários'],
        values: [total, pragmaticos, economicos, emocionais, identitarios],
        colors: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'],
      };
    }

    // Funil de susceptibilidade à desinformação
    const baixa = eleitores.filter(e => (e.susceptibilidade_desinformacao ?? 5) <= 3).length;
    const media = eleitores.filter(e => {
      const s = e.susceptibilidade_desinformacao ?? 5;
      return s > 3 && s <= 6;
    }).length;
    const alta = eleitores.filter(e => {
      const s = e.susceptibilidade_desinformacao ?? 5;
      return s > 6 && s <= 8;
    }).length;
    const muitoAlta = eleitores.filter(e => (e.susceptibilidade_desinformacao ?? 5) > 8).length;

    return {
      labels: ['Total', 'Suscept. Baixa (≤3)', 'Suscept. Média (4-6)', 'Suscept. Alta (7-8)', 'Suscept. Muito Alta (9-10)'],
      values: [total, baixa, media, alta, muitoAlta],
      colors: ['#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444'],
    };
  }, [eleitores, tipo]);

  const titulos: Record<string, string> = {
    engajamento: 'Funil de Engajamento Político',
    decisao: 'Funil por Estilo de Decisão',
    susceptibilidade: 'Funil de Susceptibilidade à Desinformação',
  };

  return (
    <div className="w-full" style={{ height: altura }}>
      <Plot
        data={[
          {
            type: 'funnel',
            y: dados.labels,
            x: dados.values,
            textposition: 'inside',
            textinfo: 'value+percent initial',
            marker: {
              color: dados.colors,
              line: { width: 1, color: '#1f2937' },
            },
            connector: {
              line: { color: '#374151', width: 1 },
              fillcolor: '#1f2937',
            },
          },
        ]}
        layout={{
          title: {
            text: titulos[tipo],
            font: { color: '#e5e7eb', size: 14 },
          },
          font: { color: '#9ca3af', size: 11 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          margin: { l: 150, r: 20, t: 50, b: 20 },
          height: altura,
          yaxis: {
            color: '#9ca3af',
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

export default FunnelChart;
