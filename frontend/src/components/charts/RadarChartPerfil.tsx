'use client';

/**
 * Componente de Radar Chart para Perfil de Eleitor
 * Pesquisa Eleitoral DF 2026
 */

import { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Eleitor } from '@/types';

interface RadarChartPerfilProps {
  eleitor: Eleitor;
  altura?: number;
  mostrarLabels?: boolean;
}

interface DadoRadar {
  dimensao: string;
  valor: number;
  maximo: number;
}

// Mapear valores textuais para numéricos
const MAPEAMENTOS = {
  interesse_politico: {
    baixo: 2,
    medio: 5,
    alto: 8,
  },
  tolerancia_nuance: {
    baixa: 2,
    media: 5,
    alta: 8,
  },
  orientacao_politica: {
    esquerda: 1,
    'centro-esquerda': 3,
    centro: 5,
    'centro-direita': 7,
    direita: 9,
  },
  posicao_bolsonaro: {
    critico_forte: 1,
    critico_moderado: 3,
    neutro: 5,
    apoiador_moderado: 7,
    apoiador_forte: 9,
  },
  estilo_decisao: {
    emocional: 2,
    identitario: 4,
    moral: 5,
    pragmatico: 7,
    economico: 8,
  },
};

export function RadarChartPerfil({
  eleitor,
  altura = 300,
  mostrarLabels = true,
}: RadarChartPerfilProps) {
  // Processar dados do eleitor
  const dados: DadoRadar[] = useMemo(() => {
    const fontesLength = eleitor.fontes_informacao?.length ?? 0;
    const viesesLength = eleitor.vieses_cognitivos?.length ?? 0;

    return [
      {
        dimensao: 'Interesse Político',
        valor: MAPEAMENTOS.interesse_politico[eleitor.interesse_politico as keyof typeof MAPEAMENTOS.interesse_politico] ?? 5,
        maximo: 10,
      },
      {
        dimensao: 'Tolerância a Nuances',
        valor: eleitor.tolerancia_nuance
          ? MAPEAMENTOS.tolerancia_nuance[eleitor.tolerancia_nuance as keyof typeof MAPEAMENTOS.tolerancia_nuance] ?? 5
          : 5,
        maximo: 10,
      },
      {
        dimensao: 'Susc. Desinformação',
        valor: eleitor.susceptibilidade_desinformacao ?? 5,
        maximo: 10,
      },
      {
        dimensao: 'Posição Espectro',
        valor: MAPEAMENTOS.orientacao_politica[eleitor.orientacao_politica as keyof typeof MAPEAMENTOS.orientacao_politica] ?? 5,
        maximo: 10,
      },
      {
        dimensao: 'Engajamento',
        valor: fontesLength >= 4 ? 8 : fontesLength >= 2 ? 5 : 2,
        maximo: 10,
      },
      {
        dimensao: 'Complexidade',
        valor: Math.min(viesesLength + (eleitor.conflito_identitario ? 3 : 0), 10),
        maximo: 10,
      },
    ];
  }, [eleitor]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: DadoRadar }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-secondary/95 backdrop-blur border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.dimensao}</p>
          <p className="text-primary text-lg font-bold">
            {data.valor}/{data.maximo}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <RadarChart data={dados} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis
          dataKey="dimensao"
          stroke="#9ca3af"
          fontSize={11}
          tickLine={false}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 10]}
          stroke="#6b7280"
          fontSize={10}
          tickCount={5}
        />
        <Radar
          name={eleitor.nome}
          dataKey="valor"
          stroke="#818cf8"
          fill="#818cf8"
          fillOpacity={0.4}
          strokeWidth={2}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// Versão para comparar múltiplos eleitores
interface RadarChartComparacaoProps {
  eleitores: Eleitor[];
  altura?: number;
  cores?: string[];
}

export function RadarChartComparacao({
  eleitores,
  altura = 350,
  cores = ['#818cf8', '#34d399', '#f472b6', '#fbbf24'],
}: RadarChartComparacaoProps) {
  // Processar dados agregados
  const dados = useMemo(() => {
    const dimensoes = [
      'Interesse Político',
      'Tolerância a Nuances',
      'Susc. Desinformação',
      'Posição Espectro',
      'Engajamento',
    ];

    return dimensoes.map((dimensao) => {
      const resultado: Record<string, number | string> = { dimensao };

      eleitores.slice(0, 4).forEach((eleitor, idx) => {
        let valor = 5;
        const fontesLength = eleitor.fontes_informacao?.length ?? 0;

        switch (dimensao) {
          case 'Interesse Político':
            valor = MAPEAMENTOS.interesse_politico[eleitor.interesse_politico as keyof typeof MAPEAMENTOS.interesse_politico] ?? 5;
            break;
          case 'Tolerância a Nuances':
            valor = eleitor.tolerancia_nuance
              ? MAPEAMENTOS.tolerancia_nuance[eleitor.tolerancia_nuance as keyof typeof MAPEAMENTOS.tolerancia_nuance] ?? 5
              : 5;
            break;
          case 'Susc. Desinformação':
            valor = eleitor.susceptibilidade_desinformacao ?? 5;
            break;
          case 'Posição Espectro':
            valor = MAPEAMENTOS.orientacao_politica[eleitor.orientacao_politica as keyof typeof MAPEAMENTOS.orientacao_politica] ?? 5;
            break;
          case 'Engajamento':
            valor = fontesLength >= 4 ? 8 : fontesLength >= 2 ? 5 : 2;
            break;
        }

        resultado[`eleitor${idx}`] = valor;
      });

      return resultado;
    });
  }, [eleitores]);

  return (
    <div>
      {/* Legenda */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
        {eleitores.slice(0, 4).map((eleitor, idx) => (
          <div key={eleitor.id} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: cores[idx] }}
            />
            <span className="text-xs text-muted-foreground">
              {eleitor.nome.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={altura}>
        <RadarChart data={dados}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="dimensao" stroke="#9ca3af" fontSize={10} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#6b7280" fontSize={10} />

          {eleitores.slice(0, 4).map((_, idx) => (
            <Radar
              key={idx}
              dataKey={`eleitor${idx}`}
              stroke={cores[idx]}
              fill={cores[idx]}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          ))}

          <Tooltip
            contentStyle={{
              background: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RadarChartPerfil;
