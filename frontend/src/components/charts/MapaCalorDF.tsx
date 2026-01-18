'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// TIPOS
// ============================================

export interface DadoRegiao {
  regiao: string;
  nome?: string;
  valor: number;
  label?: string;
  variacao?: number;
}

export interface RegiaoPath {
  id: string;
  nome: string;
  path: string;
  centro: { x: number; y: number };
}

// ============================================
// PATHS SVG DAS REGIÕES ADMINISTRATIVAS DO DF
// Baseado na geografia real do Distrito Federal
// ViewBox: 0 0 800 500 (proporcional ao formato do DF)
// ============================================

export const REGIOES_DF_PATHS: RegiaoPath[] = [
  // BRAZLÂNDIA - Noroeste (área rural grande)
  {
    id: 'brazlandia',
    nome: 'Brazlândia',
    path: 'M 50 50 L 180 30 L 220 80 L 200 150 L 140 180 L 80 160 L 40 100 Z',
    centro: { x: 120, y: 100 }
  },
  // SOBRADINHO - Norte
  {
    id: 'sobradinho',
    nome: 'Sobradinho',
    path: 'M 220 80 L 350 40 L 400 70 L 380 140 L 300 160 L 240 140 L 200 150 Z',
    centro: { x: 300, y: 100 }
  },
  // SOBRADINHO II - Norte
  {
    id: 'sobradinho2',
    nome: 'Sobradinho II',
    path: 'M 300 160 L 380 140 L 390 180 L 340 200 L 290 190 Z',
    centro: { x: 340, y: 170 }
  },
  // FERCAL - Norte extremo
  {
    id: 'fercal',
    nome: 'Fercal',
    path: 'M 350 40 L 450 20 L 480 60 L 440 100 L 400 70 Z',
    centro: { x: 420, y: 55 }
  },
  // PLANALTINA - Nordeste (grande área)
  {
    id: 'planaltina',
    nome: 'Planaltina',
    path: 'M 400 70 L 480 60 L 600 30 L 750 80 L 720 200 L 600 250 L 500 220 L 440 180 L 390 180 L 380 140 Z',
    centro: { x: 560, y: 140 }
  },
  // PARANOÁ - Leste
  {
    id: 'paranoa',
    nome: 'Paranoá',
    path: 'M 500 220 L 600 250 L 650 320 L 580 360 L 500 340 L 480 280 Z',
    centro: { x: 550, y: 295 }
  },
  // ITAPOÃ - Nordeste pequeno
  {
    id: 'itapoa',
    nome: 'Itapoã',
    path: 'M 440 180 L 500 220 L 480 280 L 420 260 L 400 220 Z',
    centro: { x: 450, y: 230 }
  },
  // VARJÃO - Norte pequeno
  {
    id: 'varjao',
    nome: 'Varjão',
    path: 'M 340 200 L 390 180 L 400 220 L 370 240 L 340 230 Z',
    centro: { x: 368, y: 214 }
  },
  // LAGO NORTE - Norte lago
  {
    id: 'lago-norte',
    nome: 'Lago Norte',
    path: 'M 290 190 L 340 200 L 340 230 L 370 240 L 360 280 L 300 300 L 270 260 L 260 220 Z',
    centro: { x: 310, y: 245 }
  },
  // PLANO PILOTO - Centro (formato característico)
  {
    id: 'plano-piloto',
    nome: 'Plano Piloto',
    path: 'M 260 220 L 270 260 L 300 300 L 360 280 L 370 240 L 400 220 L 420 260 L 400 300 L 360 340 L 300 360 L 260 340 L 240 300 L 250 260 Z',
    centro: { x: 320, y: 290 }
  },
  // CRUZEIRO - Centro pequeno
  {
    id: 'cruzeiro',
    nome: 'Cruzeiro',
    path: 'M 250 260 L 260 220 L 240 200 L 220 220 L 220 260 L 240 300 Z',
    centro: { x: 238, y: 250 }
  },
  // SUDOESTE/OCTOGONAL - Centro
  {
    id: 'sudoeste-octogonal',
    nome: 'Sudoeste/Octogonal',
    path: 'M 220 260 L 240 300 L 260 340 L 230 360 L 200 340 L 190 300 Z',
    centro: { x: 223, y: 315 }
  },
  // LAGO SUL - Sudeste lago
  {
    id: 'lago-sul',
    nome: 'Lago Sul',
    path: 'M 300 360 L 360 340 L 400 300 L 420 330 L 400 380 L 340 400 L 280 390 Z',
    centro: { x: 355, y: 365 }
  },
  // JARDIM BOTÂNICO - Leste
  {
    id: 'jardim-botanico',
    nome: 'Jardim Botânico',
    path: 'M 420 260 L 480 280 L 500 340 L 480 380 L 420 390 L 400 380 L 420 330 L 400 300 Z',
    centro: { x: 450, y: 335 }
  },
  // SÃO SEBASTIÃO - Leste
  {
    id: 'sao-sebastiao',
    nome: 'São Sebastião',
    path: 'M 500 340 L 580 360 L 650 320 L 700 380 L 650 450 L 550 430 L 480 380 Z',
    centro: { x: 585, y: 390 }
  },
  // PARK WAY - Sul
  {
    id: 'park-way',
    nome: 'Park Way',
    path: 'M 280 390 L 340 400 L 400 380 L 420 390 L 400 430 L 320 450 L 260 420 Z',
    centro: { x: 340, y: 415 }
  },
  // NÚCLEO BANDEIRANTE - Centro-sul
  {
    id: 'nucleo-bandeirante',
    nome: 'Núcleo Bandeirante',
    path: 'M 200 340 L 230 360 L 260 340 L 280 390 L 260 420 L 220 400 L 180 370 Z',
    centro: { x: 230, y: 375 }
  },
  // CANDANGOLÂNDIA - Centro-sul pequeno
  {
    id: 'candangolandia',
    nome: 'Candangolândia',
    path: 'M 180 370 L 220 400 L 200 430 L 160 410 Z',
    centro: { x: 190, y: 400 }
  },
  // RIACHO FUNDO - Sul
  {
    id: 'riacho-fundo',
    nome: 'Riacho Fundo',
    path: 'M 160 410 L 200 430 L 220 400 L 260 420 L 240 460 L 180 470 L 140 440 Z',
    centro: { x: 200, y: 440 }
  },
  // RIACHO FUNDO II - Sul
  {
    id: 'riacho-fundo2',
    nome: 'Riacho Fundo II',
    path: 'M 140 440 L 180 470 L 160 500 L 100 490 L 90 460 Z',
    centro: { x: 135, y: 470 }
  },
  // GUARÁ - Centro-oeste
  {
    id: 'guara',
    nome: 'Guará',
    path: 'M 140 280 L 190 300 L 200 340 L 180 370 L 160 410 L 140 440 L 100 420 L 80 360 L 100 300 Z',
    centro: { x: 145, y: 355 }
  },
  // SIA - Centro industrial
  {
    id: 'sia',
    nome: 'SIA',
    path: 'M 100 300 L 140 280 L 180 260 L 190 300 L 140 280 Z',
    centro: { x: 145, y: 282 }
  },
  // SCIA/ESTRUTURAL - Noroeste
  {
    id: 'estrutural',
    nome: 'SCIA/Estrutural',
    path: 'M 140 180 L 200 150 L 240 140 L 240 200 L 220 220 L 180 260 L 140 280 L 100 260 L 80 220 Z',
    centro: { x: 165, y: 215 }
  },
  // VICENTE PIRES - Oeste
  {
    id: 'vicente-pires',
    nome: 'Vicente Pires',
    path: 'M 80 220 L 100 260 L 100 300 L 80 360 L 50 340 L 40 280 Z',
    centro: { x: 72, y: 295 }
  },
  // ÁGUAS CLARAS - Oeste
  {
    id: 'aguas-claras',
    nome: 'Águas Claras',
    path: 'M 40 280 L 50 340 L 80 360 L 100 420 L 60 440 L 30 400 L 20 340 Z',
    centro: { x: 55, y: 370 }
  },
  // TAGUATINGA - Oeste
  {
    id: 'taguatinga',
    nome: 'Taguatinga',
    path: 'M 40 100 L 80 160 L 140 180 L 80 220 L 40 280 L 20 340 L 0 280 L 0 180 Z',
    centro: { x: 55, y: 210 }
  },
  // CEILÂNDIA - Oeste (grande)
  {
    id: 'ceilandia',
    nome: 'Ceilândia',
    path: 'M 0 280 L 20 340 L 30 400 L 60 440 L 40 480 L 0 470 L 0 350 Z',
    centro: { x: 30, y: 400 }
  },
  // SOL NASCENTE/PÔR DO SOL - Oeste
  {
    id: 'sol-nascente',
    nome: 'Sol Nascente/Pôr do Sol',
    path: 'M 0 180 L 40 100 L 50 50 L 0 80 Z',
    centro: { x: 25, y: 115 }
  },
  // SAMAMBAIA - Sudoeste
  {
    id: 'samambaia',
    nome: 'Samambaia',
    path: 'M 60 440 L 100 420 L 90 460 L 100 490 L 80 520 L 40 510 L 40 480 Z',
    centro: { x: 70, y: 480 }
  },
  // RECANTO DAS EMAS - Sudoeste
  {
    id: 'recanto-emas',
    nome: 'Recanto das Emas',
    path: 'M 100 490 L 160 500 L 180 540 L 140 560 L 80 550 L 80 520 Z',
    centro: { x: 125, y: 525 }
  },
  // GAMA - Sul
  {
    id: 'gama',
    nome: 'Gama',
    path: 'M 180 470 L 240 460 L 300 490 L 320 550 L 260 580 L 180 570 L 180 540 Z',
    centro: { x: 245, y: 520 }
  },
  // SANTA MARIA - Sul
  {
    id: 'santa-maria',
    nome: 'Santa Maria',
    path: 'M 320 450 L 400 430 L 450 470 L 420 530 L 350 550 L 320 550 L 300 490 L 320 450 Z',
    centro: { x: 370, y: 495 }
  },
  // ARNIQUEIRA - Oeste pequeno
  {
    id: 'arniqueira',
    nome: 'Arniqueira',
    path: 'M 90 460 L 100 420 L 140 440 L 140 470 L 100 490 Z',
    centro: { x: 115, y: 455 }
  }
];

// Mapeamento de nomes alternativos para IDs
export const MAPA_NOMES_RA: Record<string, string> = {
  'Plano Piloto': 'plano-piloto',
  'Brasília': 'plano-piloto',
  'Asa Norte': 'plano-piloto',
  'Asa Sul': 'plano-piloto',
  'Gama': 'gama',
  'Taguatinga': 'taguatinga',
  'Brazlândia': 'brazlandia',
  'Sobradinho': 'sobradinho',
  'Sobradinho II': 'sobradinho2',
  'Sobradinho 2': 'sobradinho2',
  'Planaltina': 'planaltina',
  'Paranoá': 'paranoa',
  'Núcleo Bandeirante': 'nucleo-bandeirante',
  'Ceilândia': 'ceilandia',
  'Guará': 'guara',
  'Cruzeiro': 'cruzeiro',
  'Samambaia': 'samambaia',
  'Santa Maria': 'santa-maria',
  'São Sebastião': 'sao-sebastiao',
  'Recanto das Emas': 'recanto-emas',
  'Lago Sul': 'lago-sul',
  'Riacho Fundo': 'riacho-fundo',
  'Riacho Fundo II': 'riacho-fundo2',
  'Riacho Fundo 2': 'riacho-fundo2',
  'Lago Norte': 'lago-norte',
  'Candangolândia': 'candangolandia',
  'Águas Claras': 'aguas-claras',
  'Vicente Pires': 'vicente-pires',
  'Fercal': 'fercal',
  'Sol Nascente': 'sol-nascente',
  'Sol Nascente/Pôr do Sol': 'sol-nascente',
  'Pôr do Sol': 'sol-nascente',
  'Arniqueira': 'arniqueira',
  'Jardim Botânico': 'jardim-botanico',
  'Itapoã': 'itapoa',
  'SIA': 'sia',
  'SCIA': 'estrutural',
  'Estrutural': 'estrutural',
  'SCIA/Estrutural': 'estrutural',
  'Sudoeste': 'sudoeste-octogonal',
  'Octogonal': 'sudoeste-octogonal',
  'Sudoeste/Octogonal': 'sudoeste-octogonal',
  'Park Way': 'park-way',
  'Varjão': 'varjao'
};

// População aproximada das RAs (para referência)
export const POPULACAO_RA: Record<string, number> = {
  'ceilandia': 430000,
  'samambaia': 270000,
  'taguatinga': 225000,
  'plano-piloto': 220000,
  'planaltina': 195000,
  'aguas-claras': 160000,
  'recanto-emas': 150000,
  'gama': 145000,
  'guara': 135000,
  'santa-maria': 135000,
  'sobradinho': 85000,
  'sobradinho2': 105000,
  'paranoa': 65000,
  'sao-sebastiao': 115000,
  'vicente-pires': 75000,
  'itapoa': 68000,
  'estrutural': 40000,
  'sol-nascente': 90000,
  'riacho-fundo': 45000,
  'riacho-fundo2': 55000,
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
// FUNÇÕES DE COR
// ============================================

function getCorPorValor(
  valor: number,
  min: number,
  max: number,
  escala: 'verde_vermelho' | 'azul_vermelho' | 'azul' | 'gradiente' = 'azul'
): string {
  const normalizado = max === min ? 0.5 : (valor - min) / (max - min);

  switch (escala) {
    case 'verde_vermelho':
      // Verde (baixo) -> Amarelo (médio) -> Vermelho (alto)
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
      // Azul (baixo) -> Roxo (médio) -> Vermelho (alto)
      const r = Math.round(normalizado * 220);
      const b = Math.round(220 - normalizado * 180);
      return `rgb(${r}, 80, ${b})`;

    case 'gradiente':
      // Azul claro -> Azul escuro
      const intensity = Math.round(40 + normalizado * 180);
      return `rgb(${255 - intensity}, ${255 - intensity * 0.6}, 255)`;

    case 'azul':
    default:
      // Escala de azul (padrão)
      const alpha = 0.2 + normalizado * 0.7;
      return `rgba(59, 130, 246, ${alpha})`;
  }
}

function getCorTexto(corFundo: string): string {
  // Extrair valores RGB da cor
  const match = corFundo.match(/\d+/g);
  if (!match || match.length < 3) return '#1f2937';

  const [r, g, b] = match.map(Number);
  // Calcular luminosidade
  const luminosidade = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminosidade > 0.5 ? '#1f2937' : '#ffffff';
}

// ============================================
// COMPONENTE PRINCIPAL - MAPA DE CALOR DO DF
// ============================================

interface MapaCalorDFProps {
  dados: DadoRegiao[];
  titulo?: string;
  subtitulo?: string;
  escala?: 'verde_vermelho' | 'azul_vermelho' | 'azul' | 'gradiente';
  formatarValor?: (valor: number) => string;
  onRegiaoClick?: (regiao: string) => void;
  mostrarLegenda?: boolean;
  mostrarRotulos?: boolean;
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
  mostrarRotulos = true,
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
      const id = MAPA_NOMES_RA[nomeNormalizado] || nomeNormalizado.toLowerCase().replace(/\s+/g, '-');
      mapa.set(id, d);
    });
    return mapa;
  }, [dados]);

  // Calcular min e max para escala de cores
  const { min, max } = useMemo(() => {
    if (dados.length === 0) return { min: 0, max: 100 };
    const valores = dados.map(d => d.valor);
    return {
      min: Math.min(...valores),
      max: Math.max(...valores)
    };
  }, [dados]);

  const handleMouseMove = (e: React.MouseEvent, regiaoId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
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
          viewBox="0 0 800 600"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Fundo */}
          <rect x="0" y="0" width="800" height="600" fill="transparent" />

          {/* Renderizar regiões */}
          {REGIOES_DF_PATHS.map(regiao => {
            const dado = dadosPorId.get(regiao.id);
            const valor = dado?.valor ?? 0;
            const corFundo = dado
              ? getCorPorValor(valor, min, max, escala)
              : 'rgba(156, 163, 175, 0.3)';
            const isHovered = regiaoHover === regiao.id;

            return (
              <g key={regiao.id}>
                {/* Path da região */}
                <path
                  d={regiao.path}
                  fill={corFundo}
                  stroke={isHovered ? '#1f2937' : '#6b7280'}
                  strokeWidth={isHovered ? 2.5 : 1}
                  className="cursor-pointer transition-all duration-200"
                  style={{
                    filter: isHovered ? 'brightness(1.1)' : 'none',
                    transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                    transformOrigin: `${regiao.centro.x}px ${regiao.centro.y}px`
                  }}
                  onMouseMove={(e) => handleMouseMove(e, regiao.id)}
                  onMouseLeave={() => setRegiaoHover(null)}
                  onClick={() => onRegiaoClick?.(regiao.nome)}
                />

                {/* Rótulo da região (se mostrarRotulos) */}
                {mostrarRotulos && (
                  <text
                    x={regiao.centro.x}
                    y={regiao.centro.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none select-none"
                    style={{
                      fontSize: '9px',
                      fontWeight: 500,
                      fill: dado ? getCorTexto(corFundo) : '#6b7280',
                      textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                    }}
                  >
                    {regiao.nome.length > 12
                      ? regiao.nome.substring(0, 10) + '...'
                      : regiao.nome}
                  </text>
                )}
              </g>
            );
          })}

          {/* Contorno do DF */}
          <path
            d="M 50 50 L 180 30 L 350 40 L 450 20 L 600 30 L 750 80 L 720 200 L 700 380 L 650 450 L 550 430 L 420 530 L 320 550 L 260 580 L 180 570 L 140 560 L 80 550 L 40 510 L 0 470 L 0 80 L 50 50"
            fill="none"
            stroke="#374151"
            strokeWidth="3"
            className="pointer-events-none"
          />

          {/* Texto identificador */}
          <text x="400" y="590" textAnchor="middle" className="fill-muted-foreground text-xs">
            Distrito Federal - Regiões Administrativas
          </text>
        </svg>

        {/* Tooltip */}
        {regiaoHover && (
          <div
            className="absolute z-50 bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 pointer-events-none"
            style={{
              left: Math.min(tooltipPos.x + 15, 250),
              top: tooltipPos.y - 10,
              minWidth: '180px'
            }}
          >
            {(() => {
              const regiao = REGIOES_DF_PATHS.find(r => r.id === regiaoHover);
              const dado = dadosPorId.get(regiaoHover);
              if (!regiao) return null;

              return (
                <>
                  <p className="font-semibold text-foreground">{regiao.nome}</p>
                  {dado ? (
                    <>
                      <p className="text-lg font-bold text-primary mt-1">
                        {formatarValor(dado.valor)}
                      </p>
                      {dado.variacao !== undefined && (
                        <p className={cn(
                          "text-sm",
                          dado.variacao > 0 ? "text-green-600" : dado.variacao < 0 ? "text-red-600" : "text-muted-foreground"
                        )}>
                          {dado.variacao > 0 ? '↑' : dado.variacao < 0 ? '↓' : '→'} {Math.abs(dado.variacao).toFixed(1)}%
                        </p>
                      )}
                      {dado.label && (
                        <p className="text-xs text-muted-foreground mt-1">{dado.label}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sem dados</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Pop. aprox.: {(POPULACAO_RA[regiaoHover] || 0).toLocaleString('pt-BR')}
                  </p>
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
            <span className="text-xs text-muted-foreground">{formatarValor(min)}</span>
          </div>
          <div className="flex-1 h-3 rounded-full max-w-[200px]"
            style={{
              background: escala === 'verde_vermelho'
                ? 'linear-gradient(to right, rgb(80, 200, 80), rgb(255, 255, 80), rgb(255, 80, 80))'
                : escala === 'azul_vermelho'
                ? 'linear-gradient(to right, rgb(80, 80, 220), rgb(180, 80, 180), rgb(220, 80, 80))'
                : 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.9))'
            }}
          />
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getCorPorValor(max, min, max, escala) }}
            />
            <span className="text-xs text-muted-foreground">{formatarValor(max)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE DE COMPARAÇÃO (ANTES/DEPOIS)
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
          altura={350}
        />
        <MapaCalorDF
          dados={dadosDepois}
          titulo={tituloDepois}
          escala={escala}
          formatarValor={formatarValor}
          mostrarLegenda={false}
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
    escala?: 'verde_vermelho' | 'azul_vermelho' | 'azul' | 'gradiente';
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
      {/* Seletor de métrica */}
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

      {/* Mapa da métrica selecionada */}
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
// EXPORTAÇÕES LEGADAS (compatibilidade)
// ============================================

export const REGIOES_DF: Record<string, number> = Object.fromEntries(
  REGIOES_DF_PATHS.map(r => [r.nome, POPULACAO_RA[r.id] || 0])
);
