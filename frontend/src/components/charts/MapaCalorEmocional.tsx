'use client';

/**
 * Componente de Mapa de Calor Emocional
 * Visualiza intensidade emocional por região ou segmento
 * Pesquisa Eleitoral DF 2026
 */

import { useMemo, useState } from 'react';
import type { Eleitor } from '@/types';
import { cn } from '@/lib/utils';

interface DadoEmocional {
  regiao: string;
  positivo: number;
  negativo: number;
  neutro: number;
  intensidade: number;
  dominante: 'positivo' | 'negativo' | 'neutro';
}

interface MapaCalorEmocionalProps {
  eleitores: Eleitor[];
  respostas?: Array<{
    eleitor_id: string;
    sentimento?: 'positivo' | 'negativo' | 'neutro';
  }>;
  altura?: number;
}

// Mapear regiões do DF para coordenadas relativas (simplificado)
const COORDENADAS_REGIOES: Record<string, { x: number; y: number }> = {
  'Plano Piloto': { x: 50, y: 30 },
  'Lago Sul': { x: 55, y: 45 },
  'Lago Norte': { x: 45, y: 20 },
  'Taguatinga': { x: 25, y: 50 },
  'Ceilândia': { x: 15, y: 45 },
  'Samambaia': { x: 20, y: 60 },
  'Águas Claras': { x: 30, y: 55 },
  'Gama': { x: 40, y: 80 },
  'Santa Maria': { x: 35, y: 90 },
  'Recanto das Emas': { x: 25, y: 75 },
  'Guará': { x: 35, y: 45 },
  'Brazlândia': { x: 10, y: 20 },
  'Sobradinho': { x: 60, y: 15 },
  'Sobradinho II': { x: 65, y: 10 },
  'Planaltina': { x: 80, y: 20 },
  'Paranoá': { x: 75, y: 35 },
  'São Sebastião': { x: 85, y: 50 },
  'Núcleo Bandeirante': { x: 40, y: 55 },
  'Candangolândia': { x: 45, y: 60 },
  'Riacho Fundo': { x: 35, y: 65 },
  'Riacho Fundo II': { x: 32, y: 70 },
  'Vicente Pires': { x: 28, y: 48 },
  'Sudoeste/Octogonal': { x: 42, y: 38 },
  'Cruzeiro': { x: 48, y: 42 },
  'Park Way': { x: 45, y: 70 },
  'SIA': { x: 38, y: 50 },
  'SCIA/Estrutural': { x: 52, y: 38 },
  'Jardim Botânico': { x: 70, y: 45 },
  'Varjão': { x: 52, y: 25 },
  'Fercal': { x: 55, y: 5 },
  'Itapoã': { x: 78, y: 30 },
  'Sol Nascente/Pôr do Sol': { x: 12, y: 52 },
  'Arniqueira': { x: 32, y: 60 },
};

// Cores para intensidade emocional
function getCorEmocional(dominante: 'positivo' | 'negativo' | 'neutro', intensidade: number): string {
  const opacidade = Math.min(0.2 + intensidade * 0.8, 1);

  switch (dominante) {
    case 'positivo':
      return `rgba(34, 197, 94, ${opacidade})`; // Verde
    case 'negativo':
      return `rgba(239, 68, 68, ${opacidade})`; // Vermelho
    default:
      return `rgba(156, 163, 175, ${opacidade})`; // Cinza
  }
}

export function MapaCalorEmocional({
  eleitores,
  respostas,
  altura = 400,
}: MapaCalorEmocionalProps) {
  const [regiaoHover, setRegiaoHover] = useState<string | null>(null);

  // Calcular dados emocionais por região
  const dadosPorRegiao = useMemo(() => {
    const resultado: Record<string, DadoEmocional> = {};

    // Agrupar eleitores por região
    const eleitoresPorRegiao: Record<string, Eleitor[]> = {};
    eleitores.forEach((e) => {
      const regiao = e.regiao_administrativa;
      if (!eleitoresPorRegiao[regiao]) {
        eleitoresPorRegiao[regiao] = [];
      }
      eleitoresPorRegiao[regiao].push(e);
    });

    // Calcular sentimento para cada região
    Object.entries(eleitoresPorRegiao).forEach(([regiao, eleitoresRegiao]) => {
      let positivo = 0;
      let negativo = 0;
      let neutro = 0;

      // Se temos respostas, usar sentimento das respostas
      if (respostas && respostas.length > 0) {
        eleitoresRegiao.forEach((eleitor) => {
          const resposta = respostas.find((r) => r.eleitor_id === eleitor.id);
          if (resposta?.sentimento === 'positivo') positivo++;
          else if (resposta?.sentimento === 'negativo') negativo++;
          else neutro++;
        });
      } else {
        // Estimar baseado em atributos do eleitor
        eleitoresRegiao.forEach((eleitor) => {
          // Baseado em orientação política e outros fatores
          const isPositivo =
            eleitor.interesse_politico === 'alto' ||
            eleitor.tolerancia_nuance === 'alta';
          const isNegativo =
            (eleitor.susceptibilidade_desinformacao ?? 0) > 7 ||
            eleitor.interesse_politico === 'baixo';

          if (isPositivo && !isNegativo) positivo++;
          else if (isNegativo && !isPositivo) negativo++;
          else neutro++;
        });
      }

      const total = positivo + negativo + neutro;
      const intensidade = total > 0 ? Math.max(positivo, negativo, neutro) / total : 0;

      let dominante: 'positivo' | 'negativo' | 'neutro' = 'neutro';
      if (positivo > negativo && positivo > neutro) dominante = 'positivo';
      else if (negativo > positivo && negativo > neutro) dominante = 'negativo';

      resultado[regiao] = {
        regiao,
        positivo,
        negativo,
        neutro,
        intensidade,
        dominante,
      };
    });

    return resultado;
  }, [eleitores, respostas]);

  // Região selecionada
  const dadosRegiaoHover = regiaoHover ? dadosPorRegiao[regiaoHover] : null;

  return (
    <div className="relative" style={{ height: altura }}>
      {/* Mapa SVG simplificado */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ maxHeight: altura - 60 }}
      >
        {/* Background */}
        <rect x="0" y="0" width="100" height="100" fill="#1f2937" rx="4" />

        {/* Círculos para cada região */}
        {Object.entries(dadosPorRegiao).map(([regiao, dados]) => {
          const coords = COORDENADAS_REGIOES[regiao];
          if (!coords) return null;

          const tamanho = Math.max(3, Math.min(8, dados.positivo + dados.negativo + dados.neutro) / 10);

          return (
            <g key={regiao}>
              {/* Círculo de fundo */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r={tamanho + 2}
                fill={getCorEmocional(dados.dominante, dados.intensidade)}
                className="transition-all duration-300"
                style={{
                  transform: regiaoHover === regiao ? 'scale(1.5)' : 'scale(1)',
                  transformOrigin: `${coords.x}px ${coords.y}px`,
                }}
              />

              {/* Círculo interativo */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r={tamanho}
                fill={regiaoHover === regiao ? '#fff' : 'rgba(255,255,255,0.8)'}
                stroke={
                  dados.dominante === 'positivo'
                    ? '#22c55e'
                    : dados.dominante === 'negativo'
                      ? '#ef4444'
                      : '#6b7280'
                }
                strokeWidth="0.5"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setRegiaoHover(regiao)}
                onMouseLeave={() => setRegiaoHover(null)}
              />

              {/* Label da região */}
              <text
                x={coords.x}
                y={coords.y + tamanho + 4}
                fontSize="2"
                fill="#9ca3af"
                textAnchor="middle"
                className={cn(
                  'pointer-events-none transition-opacity',
                  regiaoHover === regiao ? 'opacity-100' : 'opacity-50'
                )}
              >
                {regiao.substring(0, 10)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip/Info Box */}
      {dadosRegiaoHover && (
        <div className="absolute top-4 right-4 bg-secondary/95 backdrop-blur border border-border rounded-lg p-4 shadow-lg min-w-48">
          <h4 className="font-semibold text-foreground mb-2">{regiaoHover}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-green-400">Positivo</span>
              <span className="font-medium">{dadosRegiaoHover.positivo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-red-400">Negativo</span>
              <span className="font-medium">{dadosRegiaoHover.negativo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Neutro</span>
              <span className="font-medium">{dadosRegiaoHover.neutro}</span>
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <span className="text-muted-foreground">Sentimento dominante: </span>
              <span
                className={cn(
                  'font-medium',
                  dadosRegiaoHover.dominante === 'positivo' && 'text-green-400',
                  dadosRegiaoHover.dominante === 'negativo' && 'text-red-400',
                  dadosRegiaoHover.dominante === 'neutro' && 'text-gray-400'
                )}
              >
                {dadosRegiaoHover.dominante.charAt(0).toUpperCase() +
                  dadosRegiaoHover.dominante.slice(1)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legenda */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-6 p-2 bg-secondary/50 rounded-b-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span className="text-xs text-muted-foreground">Positivo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500" />
          <span className="text-xs text-muted-foreground">Negativo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-500" />
          <span className="text-xs text-muted-foreground">Neutro</span>
        </div>
      </div>
    </div>
  );
}

// Versão simplificada como tabela/grid
export function TabelaCalorEmocional({
  eleitores,
  altura = 300,
}: MapaCalorEmocionalProps) {
  const dadosPorRegiao = useMemo(() => {
    const resultado: DadoEmocional[] = [];

    // Agrupar eleitores por região
    const eleitoresPorRegiao: Record<string, Eleitor[]> = {};
    eleitores.forEach((e) => {
      const regiao = e.regiao_administrativa;
      if (!eleitoresPorRegiao[regiao]) {
        eleitoresPorRegiao[regiao] = [];
      }
      eleitoresPorRegiao[regiao].push(e);
    });

    // Calcular dados para cada região
    Object.entries(eleitoresPorRegiao).forEach(([regiao, eleitoresRegiao]) => {
      let positivo = 0;
      let negativo = 0;
      let neutro = 0;

      eleitoresRegiao.forEach((eleitor) => {
        const isPositivo =
          eleitor.interesse_politico === 'alto' || eleitor.tolerancia_nuance === 'alta';
        const isNegativo = (eleitor.susceptibilidade_desinformacao ?? 0) > 7;

        if (isPositivo && !isNegativo) positivo++;
        else if (isNegativo && !isPositivo) negativo++;
        else neutro++;
      });

      const total = positivo + negativo + neutro;
      const intensidade = total > 0 ? Math.max(positivo, negativo, neutro) / total : 0;

      let dominante: 'positivo' | 'negativo' | 'neutro' = 'neutro';
      if (positivo > negativo && positivo > neutro) dominante = 'positivo';
      else if (negativo > positivo && negativo > neutro) dominante = 'negativo';

      resultado.push({
        regiao,
        positivo,
        negativo,
        neutro,
        intensidade,
        dominante,
      });
    });

    // Ordenar por total de eleitores
    return resultado.sort((a, b) =>
      (b.positivo + b.negativo + b.neutro) - (a.positivo + a.negativo + a.neutro)
    ).slice(0, 15);
  }, [eleitores]);

  return (
    <div className="overflow-y-auto" style={{ maxHeight: altura }}>
      <div className="space-y-2">
        {dadosPorRegiao.map((dados) => {
          const total = dados.positivo + dados.negativo + dados.neutro;
          const percPositivo = total > 0 ? (dados.positivo / total) * 100 : 0;
          const percNegativo = total > 0 ? (dados.negativo / total) * 100 : 0;
          const percNeutro = total > 0 ? (dados.neutro / total) * 100 : 0;

          return (
            <div key={dados.regiao} className="p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{dados.regiao}</span>
                <span className="text-xs text-muted-foreground">{total} eleitores</span>
              </div>

              {/* Barra de proporção */}
              <div className="h-4 flex rounded-full overflow-hidden">
                <div
                  className="bg-green-500 transition-all"
                  style={{ width: `${percPositivo}%` }}
                  title={`Positivo: ${dados.positivo} (${percPositivo.toFixed(1)}%)`}
                />
                <div
                  className="bg-gray-500 transition-all"
                  style={{ width: `${percNeutro}%` }}
                  title={`Neutro: ${dados.neutro} (${percNeutro.toFixed(1)}%)`}
                />
                <div
                  className="bg-red-500 transition-all"
                  style={{ width: `${percNegativo}%` }}
                  title={`Negativo: ${dados.negativo} (${percNegativo.toFixed(1)}%)`}
                />
              </div>

              {/* Números */}
              <div className="flex items-center justify-between mt-1 text-xs">
                <span className="text-green-400">{dados.positivo}</span>
                <span className="text-gray-400">{dados.neutro}</span>
                <span className="text-red-400">{dados.negativo}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MapaCalorEmocional;
