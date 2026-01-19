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
  // Pontos principais - sempre visíveis
  { id: 'congresso', nome: 'Congresso Nacional', x: 940, y: 375, icone: '🏛️', tipo: 'principal' },
  { id: 'torre-tv', nome: 'Torre de TV', x: 895, y: 388, icone: '📡', tipo: 'principal' },
  { id: 'aeroporto', nome: 'Aeroporto JK', x: 1100, y: 342, icone: '✈️', tipo: 'principal' },

  // Pontos secundários - visíveis em nível médio e completo
  { id: 'rodoviaria', nome: 'Rodoviária do Plano Piloto', x: 912, y: 388, icone: '🚌', tipo: 'secundario' },
  { id: 'catedral', nome: 'Catedral de Brasília', x: 930, y: 375, icone: '⛪', tipo: 'secundario' },
  { id: 'ponte-jk', nome: 'Ponte JK', x: 985, y: 432, icone: '🌉', tipo: 'secundario' },
  { id: 'estadio-mane', nome: 'Estádio Mané Garrincha', x: 880, y: 368, icone: '⚽', tipo: 'secundario' },
  { id: 'palacio-planalto', nome: 'Palácio do Planalto', x: 945, y: 378, icone: '🏛️', tipo: 'secundario' },

  // Pontos terciários - visíveis apenas em nível completo
  { id: 'unb', nome: 'UnB - Universidade de Brasília', x: 1000, y: 345, icone: '🎓', tipo: 'terciario' },
  { id: 'shopping-conjunto', nome: 'Conjunto Nacional', x: 905, y: 382, icone: '🛒', tipo: 'terciario' },
  { id: 'parque-cidade', nome: 'Parque da Cidade', x: 890, y: 405, icone: '🌳', tipo: 'terciario' },
  { id: 'zoo', nome: 'Zoológico de Brasília', x: 870, y: 430, icone: '🦁', tipo: 'terciario' },
  { id: 'jk-memorial', nome: 'Memorial JK', x: 885, y: 398, icone: '🏛️', tipo: 'terciario' },
  { id: 'taguapark', nome: 'Taguapark', x: 680, y: 440, icone: '🛒', tipo: 'terciario' },
];

// ============================================
// CENTROS DAS CIDADES (coordenadas ajustadas)
// ============================================

const CENTROS_CIDADES: Record<string, { x: number; y: number; prioridade: number; nome: string; nomeCompleto?: string }> = {
  // Regiões principais (prioridade 1) - sempre visíveis
  'ceilandia': { x: 640, y: 445, prioridade: 1, nome: 'CEILÂNDIA', nomeCompleto: 'Ceilândia - RA IX' },
  'taguatinga': { x: 695, y: 425, prioridade: 1, nome: 'TAGUATINGA', nomeCompleto: 'Taguatinga - RA III' },
  'samambaia': { x: 640, y: 510, prioridade: 1, nome: 'SAMAMBAIA', nomeCompleto: 'Samambaia - RA XII' },
  'plano-piloto': { x: 920, y: 365, prioridade: 1, nome: 'PLANO PILOTO', nomeCompleto: 'Brasília/Plano Piloto - RA I' },
  'gama': { x: 615, y: 585, prioridade: 1, nome: 'GAMA', nomeCompleto: 'Gama - RA II' },
  'planaltina': { x: 1180, y: 225, prioridade: 1, nome: 'PLANALTINA', nomeCompleto: 'Planaltina - RA VI' },

  // Regiões secundárias (prioridade 2) - visíveis em médio e completo
  'sobradinho': { x: 1015, y: 220, prioridade: 2, nome: 'SOBRADINHO', nomeCompleto: 'Sobradinho - RA V' },
  'sobradinho-ii': { x: 1065, y: 260, prioridade: 2, nome: 'SOBRADINHO II', nomeCompleto: 'Sobradinho II - RA XXVI' },
  'brazlandia': { x: 560, y: 270, prioridade: 2, nome: 'BRAZLÂNDIA', nomeCompleto: 'Brazlândia - RA IV' },
  'paranoa': { x: 1125, y: 375, prioridade: 2, nome: 'PARANOÁ', nomeCompleto: 'Paranoá - RA VII' },
  'lago-sul': { x: 990, y: 465, prioridade: 2, nome: 'LAGO SUL', nomeCompleto: 'Lago Sul - RA XVI' },
  'lago-norte': { x: 1010, y: 315, prioridade: 2, nome: 'LAGO NORTE', nomeCompleto: 'Lago Norte - RA XVIII' },
  'guara': { x: 810, y: 420, prioridade: 2, nome: 'GUARÁ', nomeCompleto: 'Guará - RA X' },
  'aguas-claras': { x: 745, y: 438, prioridade: 2, nome: 'ÁGUAS CLARAS', nomeCompleto: 'Águas Claras - RA XX' },
  'recanto-das-emas': { x: 575, y: 540, prioridade: 2, nome: 'RECANTO DAS EMAS', nomeCompleto: 'Recanto das Emas - RA XV' },
  'santa-maria': { x: 705, y: 568, prioridade: 2, nome: 'SANTA MARIA', nomeCompleto: 'Santa Maria - RA XIII' },
  'sao-sebastiao': { x: 1090, y: 468, prioridade: 2, nome: 'SÃO SEBASTIÃO', nomeCompleto: 'São Sebastião - RA XIV' },
  'sol-nascente-por-do-sol': { x: 595, y: 445, prioridade: 2, nome: 'SOL NASCENTE', nomeCompleto: 'Sol Nascente/Pôr do Sol - RA XXXII' },

  // Regiões terciárias (prioridade 3) - visíveis apenas em completo
  'nucleo-bandeirante': { x: 850, y: 448, prioridade: 3, nome: 'N. BANDEIRANTE', nomeCompleto: 'Núcleo Bandeirante - RA VIII' },
  'riacho-fundo': { x: 778, y: 472, prioridade: 3, nome: 'R. FUNDO', nomeCompleto: 'Riacho Fundo - RA XVII' },
  'riacho-fundo-ii': { x: 748, y: 498, prioridade: 3, nome: 'R. FUNDO II', nomeCompleto: 'Riacho Fundo II - RA XXI' },
  'candangolandia': { x: 870, y: 438, prioridade: 3, nome: 'CANDANGOLÂNDIA', nomeCompleto: 'Candangolândia - RA XIX' },
  'cruzeiro': { x: 875, y: 398, prioridade: 3, nome: 'CRUZEIRO', nomeCompleto: 'Cruzeiro - RA XI' },
  'sudoeste-octogonal': { x: 862, y: 382, prioridade: 3, nome: 'SUDOESTE', nomeCompleto: 'Sudoeste/Octogonal - RA XXII' },
  'jardim-botanico': { x: 1050, y: 495, prioridade: 3, nome: 'JD. BOTÂNICO', nomeCompleto: 'Jardim Botânico - RA XXVII' },
  'vicente-pires': { x: 768, y: 412, prioridade: 3, nome: 'V. PIRES', nomeCompleto: 'Vicente Pires - RA XXX' },
  'itapoa': { x: 1150, y: 322, prioridade: 3, nome: 'ITAPOÃ', nomeCompleto: 'Itapoã - RA XXVIII' },
  'varjao': { x: 1022, y: 305, prioridade: 3, nome: 'VARJÃO', nomeCompleto: 'Varjão - RA XXIII' },
  'fercal': { x: 1050, y: 172, prioridade: 3, nome: 'FERCAL', nomeCompleto: 'Fercal - RA XXXI' },
  'arniqueira': { x: 718, y: 452, prioridade: 3, nome: 'ARNIQUEIRA', nomeCompleto: 'Arniqueira - RA XXXIII' },
  'park-way': { x: 902, y: 482, prioridade: 3, nome: 'PARK WAY', nomeCompleto: 'Park Way - RA XXIV' },
  'scia-estrutural': { x: 832, y: 372, prioridade: 3, nome: 'ESTRUTURAL', nomeCompleto: 'SCIA/Estrutural - RA XXV' },
  'sia': { x: 828, y: 402, prioridade: 3, nome: 'SIA', nomeCompleto: 'SIA - RA XXIX' },
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
// LAGO PARANOÁ (path mais detalhado e realista)
// ============================================

// Corpo principal do lago - forma mais realista
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

// Braço Norte do lago - direção ao Lago Norte
const LAGO_NORTE_BRACO = `
  M 980,345
  Q 992,335 1008,330
  L 1025,334
  Q 1032,345 1020,358
  L 998,360
  Q 985,356 980,345
  Z
`;

// Braço Sul do lago - direção ao Lago Sul
const LAGO_SUL_BRACO = `
  M 965,445
  Q 978,458 972,475
  L 960,488
  Q 948,482 952,465
  L 965,445
  Z
`;

// Braço Leste - Paranoá
const LAGO_LESTE_BRACO = `
  M 1040,395
  Q 1055,398 1068,405
  L 1075,418
  Q 1070,428 1055,425
  L 1042,412
  Q 1038,402 1040,395
  Z
`;

// Contorno estilizado do Plano Piloto (forma icônica de avião)
// Representa a forma característica de Brasília vista de cima
const PLANO_PILOTO_CONTORNO = `
  M 858,388
  L 870,385
  L 905,375
  L 925,372
  L 950,373
  L 958,376
  L 950,379
  L 925,378
  L 905,381
  L 870,391
  L 858,388
  Z
`;

// Eixo Monumental (linha central do Plano Piloto)
const EIXO_MONUMENTAL = `
  M 890,382 L 945,375
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

          {/* Lago Paranoá - desenho mais detalhado */}
          {mostrarLago && (
            <g className="pointer-events-none">
              {/* Lago principal */}
              <path
                d={LAGO_PARANOA_PATH}
                fill="url(#lagoGradient)"
                stroke="#1d4ed8"
                strokeWidth="1.5"
                filter="url(#waterEffect)"
                opacity="0.92"
              />
              {/* Padrão de ondas no lago principal */}
              <path
                d={LAGO_PARANOA_PATH}
                fill="url(#waterPattern)"
                opacity="0.4"
              />
              {/* Braço Norte do lago */}
              <path
                d={LAGO_NORTE_BRACO}
                fill="url(#lagoGradient)"
                stroke="#1d4ed8"
                strokeWidth="1"
                filter="url(#waterEffect)"
                opacity="0.88"
              />
              {/* Braço Sul do lago */}
              <path
                d={LAGO_SUL_BRACO}
                fill="url(#lagoGradient)"
                stroke="#1d4ed8"
                strokeWidth="1"
                filter="url(#waterEffect)"
                opacity="0.88"
              />
              {/* Braço Leste do lago (direção Paranoá) */}
              <path
                d={LAGO_LESTE_BRACO}
                fill="url(#lagoGradient)"
                stroke="#1d4ed8"
                strokeWidth="1"
                filter="url(#waterEffect)"
                opacity="0.85"
              />
              {/* Nome do lago com fundo para legibilidade */}
              <rect
                x="950"
                y="393"
                width="70"
                height="14"
                rx="3"
                fill="white"
                opacity="0.75"
              />
              <text
                x="985"
                y="404"
                textAnchor="middle"
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  fill: '#1e40af',
                  fontStyle: 'italic',
                  letterSpacing: '0.5px',
                }}
              >
                Lago Paranoá
              </text>
            </g>
          )}

          {/* Contorno do Plano Piloto (forma icônica de avião) */}
          {mostrarContornoPlano && (
            <g className="pointer-events-none">
              {/* Forma de avião do Plano Piloto */}
              <path
                d={PLANO_PILOTO_CONTORNO}
                fill="rgba(99, 102, 241, 0.15)"
                stroke="#6366f1"
                strokeWidth="2"
                strokeDasharray="6,3"
                opacity="0.75"
              />
              {/* Eixo Monumental - linha central */}
              <path
                d={EIXO_MONUMENTAL}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.6"
              />
              {/* Legenda do Eixo Monumental com fundo */}
              <rect
                x="882"
                y="355"
                width="60"
                height="12"
                rx="2"
                fill="white"
                opacity="0.8"
              />
              <text
                x="912"
                y="364"
                textAnchor="middle"
                style={{
                  fontSize: '7px',
                  fill: '#6366f1',
                  fontWeight: 600,
                }}
              >
                Eixo Monumental
              </text>
              {/* Indicação de Asa Norte e Asa Sul */}
              <text
                x="875"
                y="378"
                textAnchor="middle"
                style={{
                  fontSize: '5.5px',
                  fill: '#6366f1',
                  fontWeight: 500,
                  opacity: 0.8,
                }}
              >
                Asa Norte
              </text>
              <text
                x="875"
                y="395"
                textAnchor="middle"
                style={{
                  fontSize: '5.5px',
                  fill: '#6366f1',
                  fontWeight: 500,
                  opacity: 0.8,
                }}
              >
                Asa Sul
              </text>
            </g>
          )}

          {/* Nomes das principais cidades - melhorado para maior legibilidade */}
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
                  // Tamanhos de fonte maiores para melhor legibilidade
                  const fontSize = info.prioridade === 1 ? '13px' : info.prioridade === 2 ? '10px' : '8px';
                  const fontWeight = info.prioridade === 1 ? 800 : info.prioridade === 2 ? 700 : 600;
                  const dotRadius = info.prioridade === 1 ? 4 : info.prioridade === 2 ? 3 : 2.5;
                  const dotOffset = info.prioridade === 1 ? 14 : info.prioridade === 2 ? 11 : 9;

                  return (
                    <g key={`label-${id}`}>
                      {/* Ponto marcador da cidade */}
                      <circle
                        cx={info.x}
                        cy={info.y - dotOffset}
                        r={dotRadius}
                        fill={isHovered ? '#dc2626' : info.prioridade === 1 ? '#1e40af' : '#374151'}
                        stroke="white"
                        strokeWidth="1.5"
                        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
                      />

                      {/* Fundo do texto (retângulo arredondado para legibilidade máxima) */}
                      {info.prioridade <= 2 && (
                        <rect
                          x={info.x - (info.nome.length * (info.prioridade === 1 ? 4 : 3.2))}
                          y={info.y - 2}
                          width={info.nome.length * (info.prioridade === 1 ? 8 : 6.4)}
                          height={info.prioridade === 1 ? 16 : 13}
                          rx="3"
                          fill="white"
                          opacity="0.9"
                          style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.15))' }}
                        />
                      )}

                      {/* Contorno branco do texto para prioridade 3 */}
                      {info.prioridade === 3 && (
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
                            strokeWidth: 5,
                            paintOrder: 'stroke',
                          }}
                        >
                          {info.nome}
                        </text>
                      )}

                      {/* Texto principal */}
                      <text
                        x={info.x}
                        y={info.y}
                        textAnchor="middle"
                        dominantBaseline="hanging"
                        style={{
                          fontSize,
                          fontWeight,
                          fill: isHovered ? '#dc2626' : info.prioridade === 1 ? '#1e3a8a' : '#1f2937',
                          letterSpacing: info.prioridade === 1 ? '0.5px' : '0px',
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

          {/* Pontos de referência melhorados */}
          {mostrarPontosReferencia && (
            <g className="pointer-events-none">
              {PONTOS_REFERENCIA
                .filter(p =>
                  nivelDetalhe === 'completo' ||
                  (nivelDetalhe === 'medio' && (p.tipo === 'principal' || p.tipo === 'secundario')) ||
                  (nivelDetalhe === 'minimo' && p.tipo === 'principal')
                )
                .map((ponto) => {
                  const radius = ponto.tipo === 'principal' ? 12 : ponto.tipo === 'secundario' ? 9 : 7;
                  const fontSize = ponto.tipo === 'principal' ? '12px' : ponto.tipo === 'secundario' ? '9px' : '7px';
                  const showLabel = nivelDetalhe === 'completo' ||
                    (nivelDetalhe === 'medio' && ponto.tipo === 'principal');

                  return (
                    <g key={ponto.id}>
                      {/* Círculo de fundo com sombra */}
                      <circle
                        cx={ponto.x}
                        cy={ponto.y}
                        r={radius}
                        fill="white"
                        stroke={ponto.tipo === 'principal' ? '#1e40af' : '#6b7280'}
                        strokeWidth={ponto.tipo === 'principal' ? 1.5 : 0.75}
                        opacity="0.98"
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                      />
                      {/* Emoji/ícone */}
                      <text
                        x={ponto.x}
                        y={ponto.y + 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ fontSize }}
                      >
                        {ponto.icone}
                      </text>
                      {/* Nome do ponto de referência */}
                      {showLabel && (
                        <>
                          {/* Fundo para legibilidade */}
                          <rect
                            x={ponto.x - (ponto.nome.length * 2.2)}
                            y={ponto.y + radius + 2}
                            width={ponto.nome.length * 4.4}
                            height={10}
                            rx="2"
                            fill="white"
                            opacity="0.85"
                          />
                          <text
                            x={ponto.x}
                            y={ponto.y + radius + 10}
                            textAnchor="middle"
                            style={{
                              fontSize: '7px',
                              fill: ponto.tipo === 'principal' ? '#1e3a8a' : '#4b5563',
                              fontWeight: ponto.tipo === 'principal' ? 600 : 500,
                            }}
                          >
                            {ponto.nome}
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}
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
