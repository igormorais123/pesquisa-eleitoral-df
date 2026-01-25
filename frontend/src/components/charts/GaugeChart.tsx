'use client';

/**
 * Componente GaugeChart
 * Indicador visual tipo velocímetro
 * Pesquisa Eleitoral DF 2026
 */

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Eleitor } from '@/types';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface GaugeChartProps {
  eleitores: Eleitor[];
  metrica: 'susceptibilidade_media' | 'interesse_politico' | 'polarizacao' | 'engajamento';
  altura?: number;
}

export function GaugeChart({
  eleitores,
  metrica,
  altura = 300,
}: GaugeChartProps) {
  const { valor, titulo, subtitulo, sufixo, max, steps } = useMemo(() => {
    const total = eleitores.length || 1;

    switch (metrica) {
      case 'susceptibilidade_media': {
        const soma = eleitores.reduce((acc, e) => acc + (e.susceptibilidade_desinformacao ?? 5), 0);
        const media = soma / total;
        return {
          valor: media,
          titulo: 'Susceptibilidade Média',
          subtitulo: 'à Desinformação',
          sufixo: '/10',
          max: 10,
          steps: [
            { range: [0, 3], color: '#22c55e' },
            { range: [3, 6], color: '#eab308' },
            { range: [6, 8], color: '#f97316' },
            { range: [8, 10], color: '#ef4444' },
          ],
        };
      }

      case 'interesse_politico': {
        const alto = eleitores.filter(e => e.interesse_politico === 'alto').length;
        const medio = eleitores.filter(e => e.interesse_politico === 'medio').length;
        const percentual = ((alto * 1 + medio * 0.5) / total) * 100;
        return {
          valor: percentual,
          titulo: 'Interesse Político',
          subtitulo: 'Índice de Engajamento',
          sufixo: '%',
          max: 100,
          steps: [
            { range: [0, 30], color: '#ef4444' },
            { range: [30, 60], color: '#eab308' },
            { range: [60, 80], color: '#22c55e' },
            { range: [80, 100], color: '#3b82f6' },
          ],
        };
      }

      case 'polarizacao': {
        const extremos = eleitores.filter(e => {
          const pos = e.posicao_bolsonaro?.toLowerCase() ?? '';
          return pos.includes('forte');
        }).length;
        const percentual = (extremos / total) * 100;
        return {
          valor: percentual,
          titulo: 'Índice de Polarização',
          subtitulo: 'Posições Extremas',
          sufixo: '%',
          max: 100,
          steps: [
            { range: [0, 25], color: '#22c55e' },
            { range: [25, 50], color: '#eab308' },
            { range: [50, 75], color: '#f97316' },
            { range: [75, 100], color: '#ef4444' },
          ],
        };
      }

      case 'engajamento': {
        const toleranciaAlta = eleitores.filter(e => e.tolerancia_nuance === 'alta').length;
        const interesseAlto = eleitores.filter(e => e.interesse_politico === 'alto').length;
        const score = ((toleranciaAlta + interesseAlto) / (total * 2)) * 100;
        return {
          valor: score,
          titulo: 'Qualidade do Engajamento',
          subtitulo: 'Interesse + Tolerância',
          sufixo: '%',
          max: 100,
          steps: [
            { range: [0, 25], color: '#ef4444' },
            { range: [25, 50], color: '#f97316' },
            { range: [50, 75], color: '#eab308' },
            { range: [75, 100], color: '#22c55e' },
          ],
        };
      }

      default:
        return {
          valor: 0,
          titulo: 'Métrica',
          subtitulo: '',
          sufixo: '',
          max: 100,
          steps: [],
        };
    }
  }, [eleitores, metrica]);

  return (
    <div className="w-full" style={{ height: altura }}>
      <Plot
        data={[
          {
            type: 'indicator',
            mode: 'gauge+number',
            value: valor,
            number: {
              suffix: sufixo,
              font: { color: '#e5e7eb', size: 32 },
            },
            gauge: {
              axis: {
                range: [0, max],
                tickcolor: '#9ca3af',
                tickfont: { color: '#9ca3af' },
              },
              bar: { color: '#3b82f6' },
              bgcolor: '#1f2937',
              borderwidth: 2,
              bordercolor: '#374151',
              steps: steps,
              threshold: {
                line: { color: '#e5e7eb', width: 4 },
                thickness: 0.75,
                value: valor,
              },
            },
          },
        ]}
        layout={{
          title: {
            text: `${titulo}<br><span style="font-size:12px;color:#9ca3af">${subtitulo}</span>`,
            font: { color: '#e5e7eb', size: 14 },
          },
          paper_bgcolor: 'transparent',
          font: { color: '#9ca3af' },
          margin: { l: 30, r: 30, t: 80, b: 20 },
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

// Componente com múltiplos gauges
interface MultiGaugeProps {
  eleitores: Eleitor[];
  altura?: number;
}

export function MultiGauge({ eleitores, altura = 250 }: MultiGaugeProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <GaugeChart eleitores={eleitores} metrica="susceptibilidade_media" altura={altura} />
      <GaugeChart eleitores={eleitores} metrica="interesse_politico" altura={altura} />
      <GaugeChart eleitores={eleitores} metrica="polarizacao" altura={altura} />
      <GaugeChart eleitores={eleitores} metrica="engajamento" altura={altura} />
    </div>
  );
}

export default GaugeChart;
