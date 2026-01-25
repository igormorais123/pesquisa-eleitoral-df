'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import type { Eleitor } from '@/types';

// Importar Plotly dinamicamente para evitar SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface MapaDFProps {
  eleitores: Eleitor[];
  onRegiaoClick?: (regiao: string) => void;
  regiaoSelecionada?: string;
}

// Coordenadas aproximadas das RAs do DF (lat, lon)
const COORDENADAS_RAS: Record<string, [number, number]> = {
  'Plano Piloto': [-15.7942, -47.8822],
  'Gama': [-16.0233, -48.0644],
  'Taguatinga': [-15.8351, -48.0534],
  'Brazlândia': [-15.6752, -48.2084],
  'Sobradinho': [-15.6508, -47.7897],
  'Planaltina': [-15.6167, -47.6500],
  'Paranoá': [-15.7760, -47.7765],
  'Núcleo Bandeirante': [-15.8714, -47.9686],
  'Ceilândia': [-15.8244, -48.1083],
  'Guará': [-15.8333, -47.9833],
  'Cruzeiro': [-15.7942, -47.9336],
  'Samambaia': [-15.8792, -48.0842],
  'Santa Maria': [-16.0189, -48.0131],
  'São Sebastião': [-15.9028, -47.7700],
  'Recanto das Emas': [-15.9131, -48.0572],
  'Lago Sul': [-15.8333, -47.8500],
  'Riacho Fundo': [-15.8833, -48.0167],
  'Lago Norte': [-15.7333, -47.8500],
  'Candangolândia': [-15.8511, -47.9511],
  'Águas Claras': [-15.8397, -48.0267],
  'Riacho Fundo II': [-15.9000, -48.0500],
  'Sudoeste/Octogonal': [-15.8000, -47.9333],
  'Varjão': [-15.7167, -47.8667],
  'Park Way': [-15.9000, -47.9500],
  'SCIA/Estrutural': [-15.7833, -47.9833],
  'Sobradinho II': [-15.6333, -47.8167],
  'Jardim Botânico': [-15.8667, -47.8000],
  'Itapoã': [-15.7500, -47.7667],
  'SIA': [-15.8167, -47.9667],
  'Vicente Pires': [-15.8000, -48.0333],
  'Fercal': [-15.6000, -47.8833],
  'Sol Nascente/Pôr do Sol': [-15.8333, -48.1333],
  'Arniqueira': [-15.8500, -48.0333],
};

export function MapaDF({ eleitores, onRegiaoClick, regiaoSelecionada }: MapaDFProps) {
  // Calcular contagem por região
  const dadosPorRegiao = useMemo(() => {
    const contagem: Record<string, number> = {};
    eleitores.forEach((e) => {
      contagem[e.regiao_administrativa] = (contagem[e.regiao_administrativa] || 0) + 1;
    });
    return contagem;
  }, [eleitores]);

  // Preparar dados para o mapa
  const dadosMapa = useMemo(() => {
    const regioes = Object.keys(COORDENADAS_RAS);
    const lats = regioes.map((r) => COORDENADAS_RAS[r][0]);
    const lons = regioes.map((r) => COORDENADAS_RAS[r][1]);
    const valores = regioes.map((r) => dadosPorRegiao[r] || 0);
    const textos = regioes.map(
      (r) => `<b>${r}</b><br>${dadosPorRegiao[r] || 0} eleitores`
    );
    const tamanhos = valores.map((v) => Math.max(10, Math.min(50, v * 0.5)));

    return { regioes, lats, lons, valores, textos, tamanhos };
  }, [dadosPorRegiao]);

  return (
    <div className="glass-card rounded-xl p-4 h-[500px]">
      <h3 className="font-semibold text-foreground mb-4">Distribuição por Região Administrativa</h3>
      <Plot
        data={[
          {
            type: 'scattermapbox',
            lat: dadosMapa.lats,
            lon: dadosMapa.lons,
            mode: 'markers+text',
            marker: {
              size: dadosMapa.tamanhos,
              color: dadosMapa.valores,
              colorscale: 'Blues',
              showscale: true,
              colorbar: {
                title: 'Eleitores',
                titlefont: { color: '#fff' },
                tickfont: { color: '#fff' },
              },
            },
            text: dadosMapa.regioes,
            textposition: 'top center',
            textfont: { size: 9, color: '#fff' },
            hoverinfo: 'text',
            hovertext: dadosMapa.textos,
          },
        ]}
        layout={{
          mapbox: {
            style: 'carto-darkmatter',
            center: { lat: -15.8, lon: -47.9 },
            zoom: 9,
          },
          margin: { l: 0, r: 0, t: 0, b: 0 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          showlegend: false,
        }}
        config={{
          mapboxAccessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '',
          displayModeBar: false,
        }}
        style={{ width: '100%', height: '100%' }}
        onClick={(data) => {
          if (data.points?.[0]) {
            const regiao = dadosMapa.regioes[data.points[0].pointIndex];
            onRegiaoClick?.(regiao);
          }
        }}
      />
    </div>
  );
}

// Versão simplificada sem Mapbox (usando gráfico de bolhas)
export function MapaDFSimplificado({ eleitores, onRegiaoClick }: MapaDFProps) {
  const dadosPorRegiao = useMemo(() => {
    const contagem: Record<string, number> = {};
    eleitores.forEach((e) => {
      contagem[e.regiao_administrativa] = (contagem[e.regiao_administrativa] || 0) + 1;
    });

    return Object.entries(contagem)
      .sort((a, b) => b[1] - a[1])
      .map(([regiao, total]) => ({
        regiao,
        total,
        percentual: ((total / eleitores.length) * 100).toFixed(1),
      }));
  }, [eleitores]);

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-semibold text-foreground mb-4">Distribuição por Região Administrativa</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {dadosPorRegiao.map(({ regiao, total, percentual }) => (
          <button
            key={regiao}
            onClick={() => onRegiaoClick?.(regiao)}
            className="p-3 bg-secondary/50 hover:bg-secondary rounded-lg text-left transition-colors group"
          >
            <p className="font-medium text-foreground text-sm truncate group-hover:text-primary">
              {regiao}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-primary">{total}</span>
              <span className="text-xs text-muted-foreground">({percentual}%)</span>
            </div>
            <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${Math.min(100, parseFloat(percentual) * 3)}%` }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
