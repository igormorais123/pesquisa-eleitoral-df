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
// PONTOS DE REFERÊNCIA DO DF (melhorado)
// ============================================

const PONTOS_REFERENCIA = [
  { id: 'congresso', nome: 'Congresso Nacional', x: 935, y: 378, icone: '🏛️', tipo: 'principal' },
  { id: 'torre-tv', nome: 'Torre de TV', x: 895, y: 385, icone: '📡', tipo: 'principal' },
  { id: 'aeroporto', nome: 'Aeroporto JK', x: 1095, y: 345, icone: '✈️', tipo: 'principal' },
  { id: 'rodoviaria', nome: 'Rodoviária', x: 910, y: 385, icone: '🚌', tipo: 'secundario' },
  { id: 'catedral', nome: 'Catedral', x: 925, y: 378, icone: '⛪', tipo: 'secundario' },
  { id: 'esplanada', nome: 'Esplanada', x: 920, y: 380, icone: '🏢', tipo: 'secundario' },
  { id: 'ponte-jk', nome: 'Ponte JK', x: 980, y: 430, icone: '🌉', tipo: 'secundario' },
];

// ============================================
// CENTROS DAS CIDADES (coordenadas ajustadas)
// ============================================

const CENTROS_CIDADES: Record<string, { x: number; y: number; prioridade: number; nome: string }> = {
  'ceilandia': { x: 640, y: 445, prioridade: 1, nome: 'Ceilândia' },
  'taguatinga': { x: 695, y: 425, prioridade: 1, nome: 'Taguatinga' },
  'samambaia': { x: 640, y: 510, prioridade: 1, nome: 'Samambaia' },
  'plano-piloto': { x: 920, y: 365, prioridade: 1, nome: 'Plano Piloto' },
  'gama': { x: 615, y: 585, prioridade: 1, nome: 'Gama' },
  'planaltina': { x: 1180, y: 225, prioridade: 1, nome: 'Planaltina' },
  'sobradinho': { x: 1015, y: 225, prioridade: 2, nome: 'Sobradinho' },
  'sobradinho-ii': { x: 1060, y: 260, prioridade: 3, nome: 'Sobradinho II' },
  'brazlandia': { x: 560, y: 275, prioridade: 2, nome: 'Brazlândia' },
  'paranoa': { x: 1120, y: 375, prioridade: 2, nome: 'Paranoá' },
  'lago-sul': { x: 985, y: 460, prioridade: 2, nome: 'Lago Sul' },
  'lago-norte': { x: 1005, y: 320, prioridade: 2, nome: 'Lago Norte' },
  'guara': { x: 810, y: 420, prioridade: 2, nome: 'Guará' },
  'aguas-claras': { x: 745, y: 435, prioridade: 2, nome: 'Águas Claras' },
  'recanto-das-emas': { x: 580, y: 540, prioridade: 2, nome: 'Rec. das Emas' },
  'santa-maria': { x: 705, y: 565, prioridade: 2, nome: 'Santa Maria' },
  'sao-sebastiao': { x: 1085, y: 465, prioridade: 2, nome: 'São Sebastião' },
  'nucleo-bandeirante': { x: 850, y: 445, prioridade: 3, nome: 'N. Bandeirante' },
  'riacho-fundo': { x: 780, y: 470, prioridade: 3, nome: 'R. Fundo' },
  'riacho-fundo-ii': { x: 750, y: 495, prioridade: 3, nome: 'R. Fundo II' },
  'candangolandia': { x: 870, y: 435, prioridade: 3, nome: 'Candangolândia' },
  'cruzeiro': { x: 875, y: 400, prioridade: 3, nome: 'Cruzeiro' },
  'sudoeste-octogonal': { x: 865, y: 385, prioridade: 3, nome: 'Sudoeste' },
  'jardim-botanico': { x: 1045, y: 490, prioridade: 3, nome: 'Jd. Botânico' },
  'vicente-pires': { x: 770, y: 415, prioridade: 3, nome: 'V. Pires' },
  'itapoa': { x: 1145, y: 325, prioridade: 3, nome: 'Itapoã' },
  'varjao': { x: 1020, y: 310, prioridade: 3, nome: 'Varjão' },
  'fercal': { x: 1050, y: 175, prioridade: 3, nome: 'Fercal' },
  'sol-nascente-por-do-sol': { x: 600, y: 445, prioridade: 2, nome: 'Sol Nascente' },
  'arniqueira': { x: 720, y: 450, prioridade: 3, nome: 'Arniqueira' },
  'park-way': { x: 900, y: 480, prioridade: 3, nome: 'Park Way' },
  'scia-estrutural': { x: 835, y: 375, prioridade: 3, nome: 'Estrutural' },
  'sia': { x: 830, y: 405, prioridade: 3, nome: 'SIA' },
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
// LAGO PARANOÁ (path detalhado)
// ============================================

const LAGO_PARANOA_PATH = `
  M 940,340
  C 945,335 960,330 980,335
  Q 1000,340 1020,355
  L 1035,370
  Q 1045,385 1040,400
  L 1030,420
  Q 1020,440 1000,450
  L 975,445
  Q 955,440 945,425
  L 938,405
  Q 932,385 938,365
  L 940,340
  Z
`;

// Braços do lago
const LAGO_NORTE_BRACO = `
  M 975,340
  Q 985,330 1000,325
  L 1015,330
  Q 1020,340 1010,350
  L 990,355
  Q 980,352 975,340
  Z
`;

const LAGO_SUL_BRACO = `
  M 960,440
  Q 970,450 965,465
  L 955,475
  Q 945,470 948,455
  L 960,440
  Z
`;

// Contorno estilizado do Plano Piloto (forma de avião/cruz)
const PLANO_PILOTO_CONTORNO = `
  M 855,385 L 865,382 L 920,370 L 955,372 L 960,375 L 955,378 L 920,376 L 865,388 L 855,385 Z
`;

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function calcularCentroPath(pathD: string): { x: number; y: number } {
  const coords = pathD.match(/\d+/g)?.map(Number) || [];
  if (coords.length < 4) return { x: 0, y: 0 };

  const xs = coords.filter((_, i) => i % 2 === 0);
  const ys = coords.filter((_, i) => i % 2 === 1);

  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2
  };
}

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
      // Escala especial para quantidade de eleitores (tons de roxo/violeta)
      const h = 270 - normalizado * 40; // 270 (violeta) -> 230 (azul)
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
// COMPONENTE PRINCIPAL - MAPA DE CALOR DO DF
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
  mostrarPontosReferencia?: boolean;
  mostrarNomesCidades?: boolean;
  mostrarContornoPlano?: boolean;
  mostrarBussola?: boolean;
  mostrarEscala?: boolean;
  nivelDetalhe?: 'minimo' | 'medio' | 'completo';
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
  mostrarPontosReferencia = true,
  mostrarNomesCidades = true,
  mostrarContornoPlano = true,
  mostrarBussola = true,
  mostrarEscala = true,
  nivelDetalhe = 'completo',
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
          {/* Definições de filtros e gradientes */}
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="lagoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.7"/>
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.4"/>
            </linearGradient>
            <filter id="waterEffect">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.8"/>
            </filter>
            <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
              <feOffset dx="0" dy="1" result="offsetblur"/>
              <feFlood floodColor="white" floodOpacity="0.8"/>
              <feComposite in2="offsetblur" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <pattern id="waterPattern" patternUnits="userSpaceOnUse" width="10" height="10">
              <path d="M 0 5 Q 2.5 3 5 5 Q 7.5 7 10 5" stroke="#93c5fd" strokeWidth="0.5" fill="none" opacity="0.3"/>
            </pattern>
          </defs>

          {/* Renderizar regiões */}
          {PATHS_RAS_DF.map((regiao: PathRA) => {
            const dado = dadosPorId.get(regiao.id);
            const valor = dado?.valor ?? 0;
            const corFundo = dado
              ? getCorPorValor(valor, min, max, escala)
              : 'rgba(156, 163, 175, 0.3)';
            const isHovered = regiaoHover === regiao.id;
            const centro = calcularCentroPath(regiao.path);

            return (
              <g key={regiao.id}>
                <path
                  d={regiao.path}
                  fill={corFundo}
                  stroke={isHovered ? '#1e40af' : '#6b7280'}
                  strokeWidth={isHovered ? 2.5 : 0.5}
                  className="cursor-pointer transition-all duration-150"
                  style={{
                    filter: isHovered ? 'brightness(1.15) drop-shadow(0 3px 6px rgba(0,0,0,0.25))' : 'none'
                  }}
                  onMouseMove={(e) => handleMouseMove(e, regiao.id)}
                  onMouseLeave={() => setRegiaoHover(null)}
                  onClick={() => onRegiaoClick?.(regiao.nome)}
                />

                {/* Rótulo da região (valores) */}
                {mostrarRotulos && dado && (
                  <text
                    x={centro.x}
                    y={centro.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none select-none"
                    style={{
                      fontSize: '7px',
                      fontWeight: 700,
                      fill: getCorTexto(corFundo),
                      textShadow: '0 1px 2px rgba(255,255,255,0.9)'
                    }}
                  >
                    {formatarValor(dado.valor)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Lago Paranoá */}
          {mostrarLago && (
            <g className="pointer-events-none">
              {/* Lago principal */}
              <path
                d={LAGO_PARANOA_PATH}
                fill="url(#lagoGradient)"
                stroke="#2563eb"
                strokeWidth="1.5"
                filter="url(#waterEffect)"
                opacity="0.9"
              />
              {/* Padrão de ondas */}
              <path
                d={LAGO_PARANOA_PATH}
                fill="url(#waterPattern)"
                opacity="0.5"
              />
              {/* Braços do lago */}
              <path
                d={LAGO_NORTE_BRACO}
                fill="url(#lagoGradient)"
                stroke="#2563eb"
                strokeWidth="1"
                opacity="0.8"
              />
              <path
                d={LAGO_SUL_BRACO}
                fill="url(#lagoGradient)"
                stroke="#2563eb"
                strokeWidth="1"
                opacity="0.8"
              />
              {/* Nome do lago */}
              <text
                x="985"
                y="390"
                textAnchor="middle"
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  fill: '#1e40af',
                  fontStyle: 'italic',
                  letterSpacing: '0.5px',
                }}
              >
                Lago Paranoá
              </text>
            </g>
          )}

          {/* Contorno do Plano Piloto */}
          {mostrarContornoPlano && (
            <g className="pointer-events-none">
              <path
                d={PLANO_PILOTO_CONTORNO}
                fill="none"
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="4,2"
                opacity="0.6"
              />
              <text
                x="912"
                y="363"
                textAnchor="middle"
                style={{
                  fontSize: '6px',
                  fill: '#6366f1',
                  fontWeight: 500,
                }}
              >
                Eixo Monumental
              </text>
            </g>
          )}

          {/* Nomes das principais cidades */}
          {mostrarNomesCidades && (
            <g className="pointer-events-none">
              {Object.entries(CENTROS_CIDADES)
                .filter(([, info]) =>
                  nivelDetalhe === 'completo' ||
                  (nivelDetalhe === 'medio' && info.prioridade <= 2) ||
                  (nivelDetalhe === 'minimo' && info.prioridade === 1)
                )
                .map(([id, info]) => {
                  const isHovered = regiaoHover === id;
                  const fontSize = info.prioridade === 1 ? '11px' : info.prioridade === 2 ? '9px' : '7px';
                  const fontWeight = info.prioridade === 1 ? 700 : info.prioridade === 2 ? 600 : 500;

                  return (
                    <g key={`label-${id}`}>
                      {/* Ponto da cidade */}
                      <circle
                        cx={info.x}
                        cy={info.y - (info.prioridade === 1 ? 10 : 7)}
                        r={info.prioridade === 1 ? 3 : 2}
                        fill={isHovered ? '#1e40af' : '#374151'}
                        stroke="white"
                        strokeWidth="1"
                      />
                      {/* Fundo do texto para melhor legibilidade */}
                      <text
                        x={info.x}
                        y={info.y}
                        textAnchor="middle"
                        dominantBaseline="hanging"
                        style={{
                          fontSize,
                          fontWeight,
                          fill: 'white',
                          stroke: 'white',
                          strokeWidth: 4,
                          paintOrder: 'stroke',
                        }}
                      >
                        {info.nome}
                      </text>
                      {/* Texto principal */}
                      <text
                        x={info.x}
                        y={info.y}
                        textAnchor="middle"
                        dominantBaseline="hanging"
                        style={{
                          fontSize,
                          fontWeight,
                          fill: isHovered ? '#1e40af' : '#1f2937',
                          filter: isHovered ? 'url(#glow)' : 'none',
                        }}
                      >
                        {info.nome}
                      </text>
                    </g>
                  );
                })}
            </g>
          )}

          {/* Pontos de referência */}
          {mostrarPontosReferencia && (
            <g className="pointer-events-none">
              {PONTOS_REFERENCIA
                .filter(p => nivelDetalhe === 'completo' || p.tipo === 'principal')
                .map((ponto) => (
                <g key={ponto.id}>
                  {/* Círculo de fundo */}
                  <circle
                    cx={ponto.x}
                    cy={ponto.y}
                    r={ponto.tipo === 'principal' ? 10 : 7}
                    fill="white"
                    stroke="#6b7280"
                    strokeWidth="0.5"
                    opacity="0.95"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' }}
                  />
                  {/* Emoji/ícone */}
                  <text
                    x={ponto.x}
                    y={ponto.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: ponto.tipo === 'principal' ? '10px' : '8px' }}
                  >
                    {ponto.icone}
                  </text>
                  {/* Nome do ponto (apenas principais e em nível completo) */}
                  {nivelDetalhe === 'completo' && ponto.tipo === 'principal' && (
                    <text
                      x={ponto.x}
                      y={ponto.y + 18}
                      textAnchor="middle"
                      style={{
                        fontSize: '6px',
                        fill: '#6b7280',
                        fontWeight: 500,
                      }}
                    >
                      {ponto.nome}
                    </text>
                  )}
                </g>
              ))}
            </g>
          )}

          {/* Bússola / Indicador Norte */}
          {mostrarBussola && (
            <g transform="translate(1420, 160)" className="pointer-events-none">
              <circle cx="0" cy="0" r="22" fill="white" stroke="#d1d5db" strokeWidth="1" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))' }}/>
              <circle cx="0" cy="0" r="18" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
              {/* Seta Norte */}
              <polygon points="0,-14 -4,4 0,0 4,4" fill="#dc2626"/>
              {/* Seta Sul */}
              <polygon points="0,14 -4,-4 0,0 4,-4" fill="#9ca3af"/>
              {/* Letras cardeais */}
              <text x="0" y="-6" textAnchor="middle" style={{ fontSize: '7px', fontWeight: 700, fill: '#1f2937' }}>N</text>
              <text x="0" y="11" textAnchor="middle" style={{ fontSize: '5px', fontWeight: 500, fill: '#9ca3af' }}>S</text>
              <text x="11" y="2" textAnchor="middle" style={{ fontSize: '5px', fontWeight: 500, fill: '#9ca3af' }}>L</text>
              <text x="-11" y="2" textAnchor="middle" style={{ fontSize: '5px', fontWeight: 500, fill: '#9ca3af' }}>O</text>
              {/* Label */}
              <text x="0" y="32" textAnchor="middle" style={{ fontSize: '6px', fill: '#6b7280' }}>Bússola</text>
            </g>
          )}

          {/* Escala de distância */}
          {mostrarEscala && (
            <g transform="translate(500, 680)" className="pointer-events-none">
              <rect x="0" y="-2" width="100" height="8" fill="white" rx="2" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}/>
              <rect x="5" y="0" width="90" height="4" fill="#1f2937"/>
              <rect x="5" y="0" width="30" height="4" fill="white" stroke="#1f2937" strokeWidth="0.5"/>
              <rect x="35" y="0" width="30" height="4" fill="#1f2937"/>
              <rect x="65" y="0" width="30" height="4" fill="white" stroke="#1f2937" strokeWidth="0.5"/>
              <text x="5" y="12" style={{ fontSize: '7px', fill: '#374151', fontWeight: 500 }}>0</text>
              <text x="35" y="12" textAnchor="middle" style={{ fontSize: '7px', fill: '#374151', fontWeight: 500 }}>10km</text>
              <text x="65" y="12" textAnchor="middle" style={{ fontSize: '7px', fill: '#374151', fontWeight: 500 }}>20km</text>
              <text x="95" y="12" textAnchor="end" style={{ fontSize: '7px', fill: '#374151', fontWeight: 500 }}>30km</text>
            </g>
          )}

          {/* Título do mapa no SVG */}
          <g transform="translate(490, 140)" className="pointer-events-none">
            <text style={{ fontSize: '10px', fill: '#6b7280', fontWeight: 500 }}>
              Distrito Federal - Regiões Administrativas
            </text>
          </g>
        </svg>

        {/* Tooltip */}
        {regiaoHover && (
          <div
            className="absolute z-50 bg-popover text-popover-foreground border rounded-lg shadow-xl p-3 pointer-events-none transform -translate-y-full"
            style={{
              left: Math.min(Math.max(tooltipPos.x, 100), 300),
              top: Math.max(tooltipPos.y - 10, 80),
              minWidth: '200px'
            }}
          >
            {(() => {
              const regiao = PATHS_RAS_DF.find((r: PathRA) => r.id === regiaoHover);
              const dado = dadosPorId.get(regiaoHover);
              const cidadeInfo = CENTROS_CIDADES[regiaoHover];
              if (!regiao) return null;

              return (
                <>
                  <p className="font-bold text-foreground text-lg">{cidadeInfo?.nome || regiao.nome}</p>
                  {dado ? (
                    <>
                      <p className="text-2xl font-bold text-primary mt-1">
                        {formatarValor(dado.valor)}
                      </p>
                      {dado.variacao !== undefined && (
                        <p className={cn(
                          "text-sm font-medium mt-1",
                          dado.variacao > 0 ? "text-green-600" : dado.variacao < 0 ? "text-red-600" : "text-muted-foreground"
                        )}>
                          {dado.variacao > 0 ? '↑' : dado.variacao < 0 ? '↓' : '→'} {Math.abs(dado.variacao).toFixed(1)}% vs anterior
                        </p>
                      )}
                      {dado.label && (
                        <p className="text-xs text-muted-foreground mt-1">{dado.label}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sem dados disponíveis</p>
                  )}
                  {/* Info de população */}
                  {POPULACAO_RA[regiaoHover] && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>👥</span>
                        <span>População: ~{(POPULACAO_RA[regiaoHover]).toLocaleString('pt-BR')} hab.</span>
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>🗳️</span>
                        <span>Eleitores: ~{Math.round(POPULACAO_RA[regiaoHover] * 0.7).toLocaleString('pt-BR')}</span>
                      </p>
                    </div>
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
              className="w-5 h-5 rounded"
              style={{ backgroundColor: getCorPorValor(min, min, max, escala) }}
            />
            <span className="text-sm text-muted-foreground font-medium">{formatarValor(min)}</span>
          </div>
          <div className="flex-1 h-4 rounded-full max-w-[200px]"
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
              className="w-5 h-5 rounded"
              style={{ backgroundColor: getCorPorValor(max, min, max, escala) }}
            />
            <span className="text-sm text-muted-foreground font-medium">{formatarValor(max)}</span>
          </div>
        </div>
      )}

      {/* Rodapé */}
      <p className="text-center text-xs text-muted-foreground mt-3">
        Distrito Federal - {PATHS_RAS_DF.length} Regiões Administrativas • Fonte: GDF/CODEPLAN
      </p>
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
  PATHS_RAS_DF.map((r: PathRA) => [r.nome, POPULACAO_RA[r.id] || 0])
);

export const REGIOES_DF_PATHS = PATHS_RAS_DF.map((r: PathRA) => ({
  ...r,
  centro: calcularCentroPath(r.path)
}));
