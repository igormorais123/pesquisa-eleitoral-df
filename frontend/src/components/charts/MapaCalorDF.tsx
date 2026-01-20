'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { PATHS_RAS_DF, type PathRA } from './paths-ras-df';

// ============================================
// TIPOS
// ============================================

export interface DadoRegiao {
  regiao: string;
  nome?: string;
  valor: number;
  label?: string;
  variacao?: number;
  eleitores?: number;
}

export interface RegiaoPath {
  id: string;
  nome: string;
  path: string;
  centro: { x: number; y: number };
}

// ============================================
// CENTROS DAS RAs - POSIÇÕES OTIMIZADAS PARA NÃO SOBREPOR
// ============================================

const CENTROS_RAS: Record<string, { x: number; y: number; nome: string }> = {
  // Regiões grandes - bem espaçadas
  'plano-piloto': { x: 920, y: 375, nome: 'Plano Piloto' },
  'ceilandia': { x: 590, y: 420, nome: 'Ceilândia' },
  'taguatinga': { x: 700, y: 385, nome: 'Taguatinga' },
  'samambaia': { x: 600, y: 530, nome: 'Samambaia' },
  'gama': { x: 620, y: 620, nome: 'Gama' },
  'planaltina': { x: 1220, y: 220, nome: 'Planaltina' },
  'sobradinho': { x: 1000, y: 180, nome: 'Sobradinho' },
  'sobradinho-ii': { x: 1120, y: 250, nome: 'Sobradinho II' },
  'brazlandia': { x: 530, y: 270, nome: 'Brazlândia' },
  'paranoa': { x: 1170, y: 380, nome: 'Paranoá' },
  'lago-sul': { x: 1020, y: 500, nome: 'Lago Sul' },
  'lago-norte': { x: 1050, y: 310, nome: 'Lago Norte' },
  'guara': { x: 810, y: 450, nome: 'Guará' },
  'aguas-claras': { x: 745, y: 470, nome: 'Águas Claras' },
  'recanto-das-emas': { x: 530, y: 560, nome: 'Recanto das Emas' },
  'santa-maria': { x: 730, y: 600, nome: 'Santa Maria' },
  'sao-sebastiao': { x: 1130, y: 510, nome: 'São Sebastião' },
  'sol-nascente-por-do-sol': { x: 540, y: 460, nome: 'Sol Nascente' },
  'nucleo-bandeirante': { x: 870, y: 480, nome: 'N. Bandeirante' },
  'riacho-fundo': { x: 780, y: 510, nome: 'Riacho Fundo' },
  'riacho-fundo-ii': { x: 700, y: 540, nome: 'Riacho Fundo II' },
  'candangolandia': { x: 880, y: 445, nome: 'Candangolândia' },
  'cruzeiro': { x: 865, y: 395, nome: 'Cruzeiro' },
  'sudoeste-octogonal': { x: 840, y: 370, nome: 'Sudoeste' },
  'jardim-botanico': { x: 1080, y: 540, nome: 'Jd. Botânico' },
  'vicente-pires': { x: 750, y: 410, nome: 'Vicente Pires' },
  'itapoa': { x: 1190, y: 330, nome: 'Itapoã' },
  'varjao': { x: 1070, y: 285, nome: 'Varjão' },
  'fercal': { x: 1060, y: 155, nome: 'Fercal' },
  'arniqueira': { x: 680, y: 490, nome: 'Arniqueira' },
  'park-way': { x: 920, y: 530, nome: 'Park Way' },
  'scia-estrutural': { x: 800, y: 355, nome: 'Estrutural' },
  'sia': { x: 820, y: 420, nome: 'SIA' },
};

// ============================================
// MAPEAMENTO DE NOMES PARA IDs
// ============================================

const MAPA_NOMES_RA: Record<string, string> = {
  'Plano Piloto': 'plano-piloto',
  'Brasília': 'plano-piloto',
  'Asa Norte': 'plano-piloto',
  'Asa Sul': 'plano-piloto',
  'Gama': 'gama',
  'Taguatinga': 'taguatinga',
  'Brazlândia': 'brazlandia',
  'Sobradinho': 'sobradinho',
  'Sobradinho II': 'sobradinho-ii',
  'Sobradinho 2': 'sobradinho-ii',
  'Planaltina': 'planaltina',
  'Paranoá': 'paranoa',
  'Núcleo Bandeirante': 'nucleo-bandeirante',
  'Ceilândia': 'ceilandia',
  'Guará': 'guara',
  'Cruzeiro': 'cruzeiro',
  'Samambaia': 'samambaia',
  'Santa Maria': 'santa-maria',
  'São Sebastião': 'sao-sebastiao',
  'Recanto das Emas': 'recanto-das-emas',
  'Lago Sul': 'lago-sul',
  'Riacho Fundo': 'riacho-fundo',
  'Riacho Fundo II': 'riacho-fundo-ii',
  'Riacho Fundo 2': 'riacho-fundo-ii',
  'Lago Norte': 'lago-norte',
  'Candangolândia': 'candangolandia',
  'Águas Claras': 'aguas-claras',
  'Vicente Pires': 'vicente-pires',
  'Fercal': 'fercal',
  'Sol Nascente': 'sol-nascente-por-do-sol',
  'Sol Nascente/Pôr do Sol': 'sol-nascente-por-do-sol',
  'Pôr do Sol': 'sol-nascente-por-do-sol',
  'Arniqueira': 'arniqueira',
  'Jardim Botânico': 'jardim-botanico',
  'Itapoã': 'itapoa',
  'SIA': 'sia',
  'SCIA': 'scia-estrutural',
  'Estrutural': 'scia-estrutural',
  'SCIA/Estrutural': 'scia-estrutural',
  'Sudoeste': 'sudoeste-octogonal',
  'Octogonal': 'sudoeste-octogonal',
  'Sudoeste/Octogonal': 'sudoeste-octogonal',
  'Park Way': 'park-way',
  'Varjão': 'varjao'
};

// ============================================
// POPULAÇÃO APROXIMADA DAS RAs
// ============================================

const POPULACAO_RA: Record<string, number> = {
  'ceilandia': 430000,
  'samambaia': 270000,
  'taguatinga': 225000,
  'plano-piloto': 220000,
  'planaltina': 195000,
  'aguas-claras': 160000,
  'recanto-das-emas': 150000,
  'gama': 145000,
  'guara': 135000,
  'santa-maria': 135000,
  'sobradinho': 85000,
  'sobradinho-ii': 105000,
  'paranoa': 65000,
  'sao-sebastiao': 115000,
  'vicente-pires': 75000,
  'itapoa': 68000,
  'scia-estrutural': 40000,
  'sol-nascente-por-do-sol': 90000,
  'riacho-fundo': 45000,
  'riacho-fundo-ii': 55000,
  'lago-sul': 30000,
  'lago-norte': 38000,
  'brazlandia': 55000,
  'jardim-botanico': 28000,
  'nucleo-bandeirante': 25000,
  'candangolandia': 18000,
  'cruzeiro': 35000,
  'sudoeste-octogonal': 55000,
  'park-way': 22000,
  'fercal': 10000,
  'varjao': 10000,
  'sia': 2000,
  'arniqueira': 70000
};

// ============================================
// LAGO PARANOÁ
// ============================================

const LAGO_PARANOA_PATH = `
  M 945,345
  C 950,340 965,335 985,338
  Q 1005,342 1025,358
  L 1038,372
  Q 1048,388 1042,405
  L 1032,425
  Q 1022,442 1002,452
  L 978,448
  Q 958,444 948,430
  L 942,410
  Q 936,390 942,368
  L 945,345
  Z
`;

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function getCorPorValor(
  valor: number,
  min: number,
  max: number,
  escala: 'verde_vermelho' | 'azul_vermelho' | 'azul' | 'gradiente' | 'quantidade' = 'azul'
): string {
  const normalizado = max === min ? 0.5 : (valor - min) / (max - min);

  switch (escala) {
    case 'verde_vermelho':
      if (normalizado < 0.5) {
        const g = Math.round(200 + normalizado * 110);
        const r = Math.round(normalizado * 2 * 255);
        return `rgb(${r}, ${g}, 80)`;
      } else {
        const r = 255;
        const g = Math.round(255 - (normalizado - 0.5) * 2 * 200);
        return `rgb(${r}, ${g}, 80)`;
      }

    case 'azul_vermelho':
      const r2 = Math.round(normalizado * 220);
      const b2 = Math.round(220 - normalizado * 180);
      return `rgb(${r2}, 80, ${b2})`;

    case 'gradiente':
      const intensity = Math.round(40 + normalizado * 180);
      return `rgb(${255 - intensity}, ${255 - intensity * 0.6}, 255)`;

    case 'quantidade':
      const h = 270 - normalizado * 40;
      const s = 50 + normalizado * 40;
      const l = 80 - normalizado * 45;
      return `hsl(${h}, ${s}%, ${l}%)`;

    case 'azul':
    default:
      const alpha = 0.2 + normalizado * 0.7;
      return `rgba(59, 130, 246, ${alpha})`;
  }
}

function getCorTexto(corFundo: string): string {
  const match = corFundo.match(/\d+/g);
  if (!match || match.length < 3) return '#1f2937';

  const [r, g, b] = match.map(Number);
  const luminosidade = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminosidade > 0.5 ? '#1f2937' : '#ffffff';
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface MapaCalorDFProps {
  dados: DadoRegiao[];
  titulo?: string;
  subtitulo?: string;
  escala?: 'verde_vermelho' | 'azul_vermelho' | 'azul' | 'gradiente' | 'quantidade';
  formatarValor?: (valor: number) => string;
  onRegiaoClick?: (regiao: string) => void;
  mostrarLegenda?: boolean;
  mostrarRotulos?: boolean;
  mostrarLago?: boolean;
  mostrarNomesCidades?: boolean;
  mostrarBussola?: boolean;
  mostrarEscala?: boolean;
  altura?: number;
  className?: string;
}

export function MapaCalorDF({
  dados,
  titulo,
  subtitulo,
  escala = 'azul',
  formatarValor = (v) => `${v.toFixed(1)}%`,
  onRegiaoClick,
  mostrarLegenda = true,
  mostrarRotulos = false,
  mostrarLago = true,
  mostrarNomesCidades = true,
  mostrarBussola = true,
  mostrarEscala = true,
  altura = 500,
  className
}: MapaCalorDFProps) {
  const [regiaoHover, setRegiaoHover] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Criar mapa de dados por ID
  const dadosPorId = useMemo(() => {
    const mapa = new Map<string, DadoRegiao>();
    dados.forEach(d => {
      const nomeNormalizado = d.regiao || d.nome || '';
      const id = MAPA_NOMES_RA[nomeNormalizado] ||
        nomeNormalizado.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-');
      mapa.set(id, d);
    });
    return mapa;
  }, [dados]);

  // Calcular min e max
  const { min, max } = useMemo(() => {
    if (dados.length === 0) return { min: 0, max: 100 };
    const valores = dados.map(d => d.valor);
    return {
      min: Math.min(...valores),
      max: Math.max(...valores)
    };
  }, [dados]);

  const handleMouseMove = (e: React.MouseEvent, regiaoId: string) => {
    const svg = e.currentTarget.closest('svg');
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setRegiaoHover(regiaoId);
  };

  return (
    <div className={cn("relative bg-card rounded-lg border p-4", className)}>
      {/* Título */}
      {titulo && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">{titulo}</h3>
          {subtitulo && <p className="text-sm text-muted-foreground">{subtitulo}</p>}
        </div>
      )}

      {/* Container do mapa */}
      <div className="relative" style={{ height: altura }}>
        <svg
          viewBox="482 119 993 587"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          style={{ background: 'transparent' }}
        >
          {/* Definições */}
          <defs>
            <linearGradient id="lagoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4"/>
            </linearGradient>
          </defs>

          {/* Regiões */}
          {PATHS_RAS_DF.map((regiao: PathRA) => {
            const dado = dadosPorId.get(regiao.id);
            const valor = dado?.valor ?? 0;
            const corFundo = dado
              ? getCorPorValor(valor, min, max, escala)
              : 'rgba(156, 163, 175, 0.3)';
            const isHovered = regiaoHover === regiao.id;

            return (
              <path
                key={regiao.id}
                d={regiao.path}
                fill={corFundo}
                stroke={isHovered ? '#1e40af' : '#9ca3af'}
                strokeWidth={isHovered ? 2 : 0.5}
                className="cursor-pointer transition-all duration-150"
                style={{
                  filter: isHovered ? 'brightness(1.1)' : 'none'
                }}
                onMouseMove={(e) => handleMouseMove(e, regiao.id)}
                onMouseLeave={() => setRegiaoHover(null)}
                onClick={() => onRegiaoClick?.(regiao.nome)}
              />
            );
          })}

          {/* Lago Paranoá */}
          {mostrarLago && (
            <path
              d={LAGO_PARANOA_PATH}
              fill="url(#lagoGradient)"
              stroke="#3b82f6"
              strokeWidth="1"
              className="pointer-events-none"
            />
          )}

          {/* Nomes das RAs - LIMPO: apenas ponto + nome */}
          {mostrarNomesCidades && (
            <g className="pointer-events-none">
              {Object.entries(CENTROS_RAS).map(([id, info]) => {
                const isHovered = regiaoHover === id;

                return (
                  <g key={`label-${id}`}>
                    {/* Ponto */}
                    <circle
                      cx={info.x}
                      cy={info.y}
                      r="3"
                      fill={isHovered ? '#dc2626' : '#1e3a8a'}
                    />
                    {/* Nome com fundo branco */}
                    <text
                      x={info.x + 6}
                      y={info.y + 3}
                      style={{
                        fontSize: '8px',
                        fontWeight: 600,
                        fill: 'white',
                        stroke: 'white',
                        strokeWidth: 3,
                        strokeLinejoin: 'round',
                        paintOrder: 'stroke',
                      }}
                    >
                      {info.nome}
                    </text>
                    <text
                      x={info.x + 6}
                      y={info.y + 3}
                      style={{
                        fontSize: '8px',
                        fontWeight: 600,
                        fill: isHovered ? '#dc2626' : '#1e3a8a',
                      }}
                    >
                      {info.nome}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Bússola */}
          {mostrarBussola && (
            <g transform="translate(1420, 160)" className="pointer-events-none">
              <circle cx="0" cy="0" r="18" fill="white" stroke="#d1d5db" strokeWidth="1"/>
              <polygon points="0,-12 -3,3 0,0 3,3" fill="#dc2626"/>
              <polygon points="0,12 -3,-3 0,0 3,-3" fill="#9ca3af"/>
              <text x="0" y="-5" textAnchor="middle" style={{ fontSize: '6px', fontWeight: 700, fill: '#1f2937' }}>N</text>
            </g>
          )}

          {/* Escala */}
          {mostrarEscala && (
            <g transform="translate(500, 680)" className="pointer-events-none">
              <rect x="0" y="-2" width="80" height="6" fill="white" rx="2"/>
              <rect x="5" y="0" width="70" height="3" fill="#1f2937"/>
              <rect x="5" y="0" width="23" height="3" fill="white"/>
              <rect x="51" y="0" width="24" height="3" fill="white"/>
              <text x="5" y="10" style={{ fontSize: '6px', fill: '#374151' }}>0</text>
              <text x="40" y="10" textAnchor="middle" style={{ fontSize: '6px', fill: '#374151' }}>15km</text>
              <text x="75" y="10" textAnchor="end" style={{ fontSize: '6px', fill: '#374151' }}>30km</text>
            </g>
          )}
        </svg>

        {/* Tooltip */}
        {regiaoHover && (
          <div
            className="absolute z-50 bg-popover text-popover-foreground border rounded-lg shadow-xl p-3 pointer-events-none transform -translate-y-full"
            style={{
              left: Math.min(Math.max(tooltipPos.x, 100), 300),
              top: Math.max(tooltipPos.y - 10, 80),
              minWidth: '180px'
            }}
          >
            {(() => {
              const regiao = PATHS_RAS_DF.find((r: PathRA) => r.id === regiaoHover);
              const dado = dadosPorId.get(regiaoHover);
              const raInfo = CENTROS_RAS[regiaoHover];
              if (!regiao) return null;

              return (
                <>
                  <p className="font-bold text-foreground">{raInfo?.nome || regiao.nome}</p>
                  {dado ? (
                    <>
                      <p className="text-xl font-bold text-primary mt-1">
                        {formatarValor(dado.valor)}
                      </p>
                      {dado.variacao !== undefined && (
                        <p className={cn(
                          "text-sm font-medium",
                          dado.variacao > 0 ? "text-green-600" : dado.variacao < 0 ? "text-red-600" : "text-muted-foreground"
                        )}>
                          {dado.variacao > 0 ? '↑' : dado.variacao < 0 ? '↓' : '→'} {Math.abs(dado.variacao).toFixed(1)}%
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sem dados</p>
                  )}
                  {POPULACAO_RA[regiaoHover] && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Pop: ~{POPULACAO_RA[regiaoHover].toLocaleString('pt-BR')}
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Legenda */}
      {mostrarLegenda && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getCorPorValor(min, min, max, escala) }}
            />
            <span className="text-sm text-muted-foreground">{formatarValor(min)}</span>
          </div>
          <div className="flex-1 h-3 rounded-full max-w-[150px]"
            style={{
              background: escala === 'verde_vermelho'
                ? 'linear-gradient(to right, rgb(80, 200, 80), rgb(255, 255, 80), rgb(255, 80, 80))'
                : escala === 'azul_vermelho'
                ? 'linear-gradient(to right, rgb(80, 80, 220), rgb(180, 80, 180), rgb(220, 80, 80))'
                : escala === 'quantidade'
                ? 'linear-gradient(to right, hsl(270, 50%, 80%), hsl(250, 70%, 50%), hsl(230, 90%, 35%))'
                : 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.9))'
            }}
          />
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getCorPorValor(max, min, max, escala) }}
            />
            <span className="text-sm text-muted-foreground">{formatarValor(max)}</span>
          </div>
        </div>
      )}

      {/* Rodapé */}
      <p className="text-center text-xs text-muted-foreground mt-2">
        DF - {PATHS_RAS_DF.length} Regiões Administrativas
      </p>
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
  titulo?: string;
  escala?: 'verde_vermelho' | 'azul_vermelho' | 'azul' | 'gradiente';
  formatarValor?: (valor: number) => string;
  className?: string;
}

export function MapaComparacao({
  dadosAntes,
  dadosDepois,
  tituloAntes = 'Antes',
  tituloDepois = 'Depois',
  titulo,
  escala = 'azul',
  formatarValor,
  className
}: MapaComparacaoProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {titulo && (
        <h3 className="text-lg font-semibold text-foreground text-center">{titulo}</h3>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MapaCalorDF
          dados={dadosAntes}
          titulo={tituloAntes}
          escala={escala}
          formatarValor={formatarValor}
          mostrarLegenda={false}
          mostrarBussola={false}
          mostrarEscala={false}
          altura={350}
        />
        <MapaCalorDF
          dados={dadosDepois}
          titulo={tituloDepois}
          escala={escala}
          formatarValor={formatarValor}
          mostrarLegenda={false}
          mostrarBussola={false}
          mostrarEscala={false}
          altura={350}
        />
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE DE MÚLTIPLAS MÉTRICAS
// ============================================

interface MapaMultiplasMetricasProps {
  metricas: {
    nome: string;
    dados: DadoRegiao[];
    escala?: 'verde_vermelho' | 'azul_vermelho' | 'azul' | 'gradiente' | 'quantidade';
    formatarValor?: (valor: number) => string;
  }[];
  className?: string;
}

export function MapaMultiplasMetricas({ metricas, className }: MapaMultiplasMetricasProps) {
  const [metricaSelecionada, setMetricaSelecionada] = useState(0);

  if (metricas.length === 0) return null;

  const metricaAtual = metricas[metricaSelecionada];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-2 justify-center">
        {metricas.map((m, i) => (
          <button
            key={i}
            onClick={() => setMetricaSelecionada(i)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              i === metricaSelecionada
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {m.nome}
          </button>
        ))}
      </div>

      <MapaCalorDF
        dados={metricaAtual.dados}
        titulo={metricaAtual.nome}
        escala={metricaAtual.escala}
        formatarValor={metricaAtual.formatarValor}
      />
    </div>
  );
}

// ============================================
// EXPORTAÇÕES LEGADAS
// ============================================

export const REGIOES_DF: Record<string, number> = Object.fromEntries(
  PATHS_RAS_DF.map((r: PathRA) => [r.nome, POPULACAO_RA[r.id] || 0])
);

export const REGIOES_DF_PATHS = PATHS_RAS_DF.map((r: PathRA) => ({
  ...r,
  centro: CENTROS_RAS[r.id] || { x: 0, y: 0 }
}));
