'use client';

import React, { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// DADOS DAS REGIÕES ADMINISTRATIVAS DO DF
// ============================================

export interface DadoRegiao {
  id: string;
  nome: string;
  valor: number;
  total?: number;
  variacao?: number;
  detalhes?: Record<string, number | string>;
}

interface RegiaoPath {
  id: string;
  nome: string;
  path: string;
  centroX: number;
  centroY: number;
}

// Caminhos SVG simplificados das RAs do DF
const REGIOES_DF: RegiaoPath[] = [
  { id: 'plano_piloto', nome: 'Plano Piloto', path: 'M250,180 L280,160 L320,160 L350,180 L350,220 L320,240 L280,240 L250,220 Z', centroX: 300, centroY: 200 },
  { id: 'gama', nome: 'Gama', path: 'M150,350 L200,330 L220,360 L200,400 L150,400 Z', centroX: 180, centroY: 370 },
  { id: 'taguatinga', nome: 'Taguatinga', path: 'M100,200 L150,180 L180,200 L180,250 L150,270 L100,250 Z', centroX: 140, centroY: 220 },
  { id: 'brazlandia', nome: 'Brazlândia', path: 'M50,100 L100,80 L130,100 L130,150 L100,170 L50,150 Z', centroX: 90, centroY: 125 },
  { id: 'sobradinho', nome: 'Sobradinho', path: 'M280,80 L340,60 L380,80 L380,130 L340,150 L280,130 Z', centroX: 330, centroY: 105 },
  { id: 'planaltina', nome: 'Planaltina', path: 'M400,80 L480,60 L520,100 L500,160 L440,160 L400,130 Z', centroX: 460, centroY: 110 },
  { id: 'paranoa', nome: 'Paranoá', path: 'M380,180 L430,160 L470,180 L470,230 L430,250 L380,230 Z', centroX: 425, centroY: 205 },
  { id: 'nucleo_bandeirante', nome: 'Núcleo Bandeirante', path: 'M220,260 L250,250 L270,270 L260,300 L230,300 L210,280 Z', centroX: 240, centroY: 275 },
  { id: 'ceilandia', nome: 'Ceilândia', path: 'M50,200 L90,180 L90,260 L50,280 Z', centroX: 70, centroY: 230 },
  { id: 'guara', nome: 'Guará', path: 'M180,250 L210,240 L230,260 L220,290 L190,290 L170,270 Z', centroX: 200, centroY: 265 },
  { id: 'cruzeiro', nome: 'Cruzeiro', path: 'M260,220 L280,210 L300,220 L300,245 L280,255 L260,245 Z', centroX: 280, centroY: 232 },
  { id: 'samambaia', nome: 'Samambaia', path: 'M80,280 L130,260 L150,290 L130,330 L80,330 Z', centroX: 115, centroY: 295 },
  { id: 'santa_maria', nome: 'Santa Maria', path: 'M180,380 L230,360 L260,390 L240,430 L190,430 L160,400 Z', centroX: 210, centroY: 400 },
  { id: 'sao_sebastiao', nome: 'São Sebastião', path: 'M420,260 L470,240 L500,270 L480,310 L440,310 L410,280 Z', centroX: 455, centroY: 275 },
  { id: 'recanto_emas', nome: 'Recanto das Emas', path: 'M100,330 L140,310 L160,340 L140,380 L100,380 Z', centroX: 130, centroY: 345 },
  { id: 'lago_sul', nome: 'Lago Sul', path: 'M320,250 L370,230 L400,260 L380,300 L340,300 L310,270 Z', centroX: 355, centroY: 265 },
  { id: 'lago_norte', nome: 'Lago Norte', path: 'M340,140 L380,120 L410,140 L400,180 L360,180 L330,160 Z', centroX: 370, centroY: 150 },
  { id: 'candangolandia', nome: 'Candangolândia', path: 'M260,290 L285,280 L300,300 L290,320 L265,320 L250,305 Z', centroX: 275, centroY: 300 },
  { id: 'aguas_claras', nome: 'Águas Claras', path: 'M130,200 L160,190 L175,210 L165,240 L135,240 L120,220 Z', centroX: 147, centroY: 215 },
  { id: 'riacho_fundo', nome: 'Riacho Fundo', path: 'M180,300 L210,290 L225,310 L215,340 L185,340 L170,320 Z', centroX: 197, centroY: 315 },
  { id: 'vicente_pires', nome: 'Vicente Pires', path: 'M160,180 L190,170 L205,190 L195,220 L165,220 L150,200 Z', centroX: 177, centroY: 195 },
  { id: 'fercal', nome: 'Fercal', path: 'M320,50 L360,35 L390,55 L380,85 L350,85 L320,70 Z', centroX: 355, centroY: 60 },
  { id: 'sol_nascente', nome: 'Sol Nascente/Pôr do Sol', path: 'M60,250 L95,235 L110,260 L95,290 L60,290 Z', centroX: 85, centroY: 262 },
  { id: 'arniqueira', nome: 'Arniqueira', path: 'M145,240 L170,230 L185,250 L175,275 L150,275 L140,255 Z', centroX: 162, centroY: 252 },
];

// ============================================
// FUNÇÕES DE CORES
// ============================================

type EscalaCor = 'verde_vermelho' | 'azul_amarelo' | 'roxo_laranja' | 'cinza_azul';

function obterCorPorValor(valor: number, min: number, max: number, escala: EscalaCor): string {
  const normalizado = max > min ? (valor - min) / (max - min) : 0.5;

  const escalas: Record<EscalaCor, { inicio: [number, number, number]; fim: [number, number, number] }> = {
    verde_vermelho: { inicio: [239, 68, 68], fim: [34, 197, 94] },
    azul_amarelo: { inicio: [59, 130, 246], fim: [234, 179, 8] },
    roxo_laranja: { inicio: [168, 85, 247], fim: [249, 115, 22] },
    cinza_azul: { inicio: [148, 163, 184], fim: [37, 99, 235] }
  };

  const { inicio, fim } = escalas[escala];
  const r = Math.round(inicio[0] + (fim[0] - inicio[0]) * normalizado);
  const g = Math.round(inicio[1] + (fim[1] - inicio[1]) * normalizado);
  const b = Math.round(inicio[2] + (fim[2] - inicio[2]) * normalizado);

  return `rgb(${r}, ${g}, ${b})`;
}

function obterCorTexto(corFundo: string): string {
  const match = corFundo.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return '#000000';

  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);

  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminancia > 0.5 ? '#000000' : '#ffffff';
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface MapaCalorDFProps {
  dados: DadoRegiao[];
  titulo?: string;
  subtitulo?: string;
  escala?: EscalaCor;
  mostrarValores?: boolean;
  mostrarLegenda?: boolean;
  formatarValor?: (valor: number) => string;
  onRegiaoClick?: (regiao: DadoRegiao) => void;
  className?: string;
}

export function MapaCalorDF({
  dados,
  titulo = 'Mapa de Calor - Distrito Federal',
  subtitulo,
  escala = 'verde_vermelho',
  mostrarValores = true,
  mostrarLegenda = true,
  formatarValor = (v) => `${v.toFixed(1)}%`,
  onRegiaoClick,
  className
}: MapaCalorDFProps) {
  const [regiaoHover, setRegiaoHover] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const dadosPorRegiao = useMemo(() => {
    const map = new Map<string, DadoRegiao>();
    dados.forEach(d => map.set(d.id, d));
    return map;
  }, [dados]);

  const { min, max } = useMemo(() => {
    const valores = dados.map(d => d.valor);
    return {
      min: Math.min(...valores),
      max: Math.max(...valores)
    };
  }, [dados]);

  const regiaoHoverData = useMemo(() => {
    if (!regiaoHover) return null;
    return dadosPorRegiao.get(regiaoHover);
  }, [regiaoHover, dadosPorRegiao]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className={cn('relative', className)}>
      {titulo && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">{titulo}</h3>
          {subtitulo && <p className="text-sm text-muted-foreground">{subtitulo}</p>}
        </div>
      )}

      <div className="relative" onMouseMove={handleMouseMove}>
        <svg
          viewBox="0 0 560 450"
          className="w-full h-auto"
          style={{ maxHeight: '500px' }}
        >
          <rect x="0" y="0" width="560" height="450" fill="#f8fafc" rx="8" />

          {REGIOES_DF.map(regiao => {
            const dado = dadosPorRegiao.get(regiao.id);
            const valor = dado?.valor ?? 0;
            const cor = obterCorPorValor(valor, min, max, escala);
            const isHover = regiaoHover === regiao.id;

            return (
              <g key={regiao.id}>
                <path
                  d={regiao.path}
                  fill={dado ? cor : '#e2e8f0'}
                  stroke={isHover ? '#1e293b' : '#94a3b8'}
                  strokeWidth={isHover ? 2 : 1}
                  className="cursor-pointer transition-all duration-200"
                  style={{
                    filter: isHover ? 'brightness(1.1) drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none',
                    transform: isHover ? 'scale(1.02)' : 'scale(1)',
                    transformOrigin: `${regiao.centroX}px ${regiao.centroY}px`
                  }}
                  onMouseEnter={() => setRegiaoHover(regiao.id)}
                  onMouseLeave={() => setRegiaoHover(null)}
                  onClick={() => dado && onRegiaoClick?.(dado)}
                />

                {mostrarValores && dado && (
                  <text
                    x={regiao.centroX}
                    y={regiao.centroY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={obterCorTexto(cor)}
                    fontSize="10"
                    fontWeight="600"
                    className="pointer-events-none select-none"
                  >
                    {formatarValor(valor)}
                  </text>
                )}
              </g>
            );
          })}

          <text x="280" y="430" textAnchor="middle" fill="#64748b" fontSize="12">
            Regiões Administrativas do Distrito Federal
          </text>
        </svg>

        {regiaoHoverData && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{
              left: tooltipPos.x + 15,
              top: tooltipPos.y - 10,
              transform: 'translateY(-100%)'
            }}
          >
            <div className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[180px]">
              <p className="font-semibold text-foreground">{regiaoHoverData.nome}</p>
              <p className="text-lg font-bold text-primary">
                {formatarValor(regiaoHoverData.valor)}
              </p>
              {regiaoHoverData.total && (
                <p className="text-sm text-muted-foreground">
                  Base: {regiaoHoverData.total} eleitores
                </p>
              )}
              {regiaoHoverData.variacao !== undefined && (
                <p className={cn(
                  'text-sm font-medium',
                  regiaoHoverData.variacao > 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {regiaoHoverData.variacao > 0 ? '↑' : '↓'} {Math.abs(regiaoHoverData.variacao).toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {mostrarLegenda && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: obterCorPorValor(min, min, max, escala) }}
            />
            <span className="text-sm text-muted-foreground">{formatarValor(min)}</span>
          </div>
          <div className="flex-1 max-w-[200px] h-3 rounded-full" style={{
            background: `linear-gradient(to right, ${obterCorPorValor(min, min, max, escala)}, ${obterCorPorValor((min + max) / 2, min, max, escala)}, ${obterCorPorValor(max, min, max, escala)})`
          }} />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{formatarValor(max)}</span>
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: obterCorPorValor(max, min, max, escala) }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE DE COMPARAÇÃO
// ============================================

interface MapaComparacaoProps {
  dadosAntes: DadoRegiao[];
  dadosDepois: DadoRegiao[];
  tituloAntes?: string;
  tituloDepois?: string;
  escala?: EscalaCor;
  className?: string;
}

export function MapaComparacao({
  dadosAntes,
  dadosDepois,
  tituloAntes = 'Período Anterior',
  tituloDepois = 'Período Atual',
  escala = 'verde_vermelho',
  className
}: MapaComparacaoProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-6', className)}>
      <MapaCalorDF
        dados={dadosAntes}
        titulo={tituloAntes}
        escala={escala}
        mostrarLegenda={false}
      />
      <MapaCalorDF
        dados={dadosDepois}
        titulo={tituloDepois}
        escala={escala}
        mostrarLegenda={true}
      />
    </div>
  );
}

// ============================================
// COMPONENTE DE MÚLTIPLAS MÉTRICAS
// ============================================

interface MetricaMapa {
  id: string;
  nome: string;
  dados: DadoRegiao[];
  escala?: EscalaCor;
  formatarValor?: (valor: number) => string;
}

interface MapaMultiplasMetricasProps {
  metricas: MetricaMapa[];
  className?: string;
}

export function MapaMultiplasMetricas({ metricas, className }: MapaMultiplasMetricasProps) {
  const [metricaSelecionada, setMetricaSelecionada] = useState(metricas[0]?.id || '');

  const metricaAtual = metricas.find(m => m.id === metricaSelecionada);

  if (!metricaAtual) return null;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap gap-2">
        {metricas.map(metrica => (
          <button
            key={metrica.id}
            onClick={() => setMetricaSelecionada(metrica.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              metricaSelecionada === metrica.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {metrica.nome}
          </button>
        ))}
      </div>

      <MapaCalorDF
        dados={metricaAtual.dados}
        titulo={metricaAtual.nome}
        escala={metricaAtual.escala || 'verde_vermelho'}
        formatarValor={metricaAtual.formatarValor}
      />
    </div>
  );
}

// ============================================
// EXPORTAÇÕES
// ============================================

export { REGIOES_DF };
export type { RegiaoPath };
