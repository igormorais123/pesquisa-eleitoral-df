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
}

export interface RegiaoPath {
  id: string;
  nome: string;
  path: string;
  centro: { x: number; y: number };
}

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

// População aproximada das RAs
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

// Calcular centro aproximado de um path
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
  mostrarRotulos = false,
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
                  strokeWidth={isHovered ? 2 : 0.5}
                  className="cursor-pointer transition-all duration-150"
                  style={{
                    filter: isHovered ? 'brightness(1.15) drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'
                  }}
                  onMouseMove={(e) => handleMouseMove(e, regiao.id)}
                  onMouseLeave={() => setRegiaoHover(null)}
                  onClick={() => onRegiaoClick?.(regiao.nome)}
                />

                {/* Rótulo da região */}
                {mostrarRotulos && (
                  <text
                    x={centro.x}
                    y={centro.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none select-none"
                    style={{
                      fontSize: '8px',
                      fontWeight: 600,
                      fill: dado ? getCorTexto(corFundo) : '#6b7280',
                      textShadow: '0 1px 2px rgba(255,255,255,0.9), 0 0 3px rgba(255,255,255,0.8)'
                    }}
                  >
                    {regiao.nome.length > 10
                      ? regiao.nome.substring(0, 8) + '...'
                      : regiao.nome}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {regiaoHover && (
          <div
            className="absolute z-50 bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 pointer-events-none transform -translate-y-full"
            style={{
              left: Math.min(Math.max(tooltipPos.x, 100), 300),
              top: Math.max(tooltipPos.y - 10, 80),
              minWidth: '180px'
            }}
          >
            {(() => {
              const regiao = PATHS_RAS_DF.find((r: PathRA) => r.id === regiaoHover);
              const dado = dadosPorId.get(regiaoHover);
              if (!regiao) return null;

              return (
                <>
                  <p className="font-semibold text-foreground">{regiao.nome}</p>
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
                  {POPULACAO_RA[regiaoHover] && (
                    <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                      População: ~{(POPULACAO_RA[regiaoHover]).toLocaleString('pt-BR')} hab.
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

      {/* Rodapé */}
      <p className="text-center text-xs text-muted-foreground mt-3">
        Distrito Federal - {PATHS_RAS_DF.length} Regiões Administrativas
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
  PATHS_RAS_DF.map((r: PathRA) => [r.nome, POPULACAO_RA[r.id] || 0])
);

export const REGIOES_DF_PATHS = PATHS_RAS_DF.map((r: PathRA) => ({
  ...r,
  centro: calcularCentroPath(r.path)
}));
