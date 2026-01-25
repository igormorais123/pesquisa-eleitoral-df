'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TIPOS
// ============================================

export interface PontoTemporal {
  data: Date;
  valor: number;
  intervaloMin?: number;
  intervaloMax?: number;
}

export interface SerieTemporal {
  id: string;
  nome: string;
  cor: string;
  pontos: PontoTemporal[];
  tendencia?: 'crescente' | 'decrescente' | 'estavel' | 'volatil';
  variacao?: number;
  previsao?: PontoTemporal[];
}

interface GraficoTendenciaTemporalProps {
  series: SerieTemporal[];
  titulo?: string;
  subtitulo?: string;
  mostrarIntervaloConfianca?: boolean;
  mostrarPrevisao?: boolean;
  mostrarAnotacoes?: boolean;
  anotacoes?: { data: Date; texto: string }[];
  altura?: number;
  formatarValor?: (valor: number) => string;
  formatarData?: (data: Date) => string;
  className?: string;
}

// ============================================
// CORES PADRÃO
// ============================================

const CORES_PADRAO = [
  '#2563eb', // Azul
  '#dc2626', // Vermelho
  '#16a34a', // Verde
  '#9333ea', // Roxo
  '#ea580c', // Laranja
  '#0891b2', // Cyan
  '#c026d3', // Magenta
  '#65a30d', // Lima
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function GraficoTendenciaTemporal({
  series,
  titulo = 'Evolução Temporal',
  subtitulo,
  mostrarIntervaloConfianca = true,
  mostrarPrevisao = true,
  mostrarAnotacoes = true,
  anotacoes = [],
  altura = 400,
  formatarValor = (v) => `${v.toFixed(1)}%`,
  formatarData = (d) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
  className
}: GraficoTendenciaTemporalProps) {
  // Preparar dados para o gráfico
  const dadosGrafico = useMemo(() => {
    // Coletar todas as datas únicas
    const todasDatas = new Set<number>();
    series.forEach(s => {
      s.pontos.forEach(p => todasDatas.add(p.data.getTime()));
      s.previsao?.forEach(p => todasDatas.add(p.data.getTime()));
    });

    // Ordenar datas
    const datasOrdenadas = Array.from(todasDatas).sort((a, b) => a - b);

    // Criar dados para cada data
    return datasOrdenadas.map(timestamp => {
      const ponto: Record<string, number | string | boolean> = {
        data: timestamp,
        dataFormatada: formatarData(new Date(timestamp))
      };

      series.forEach(s => {
        // Dados reais
        const pontoReal = s.pontos.find(p => p.data.getTime() === timestamp);
        if (pontoReal) {
          ponto[s.id] = pontoReal.valor;
          ponto[`${s.id}_real`] = true;
          if (pontoReal.intervaloMin !== undefined && pontoReal.intervaloMax !== undefined) {
            ponto[`${s.id}_min`] = pontoReal.intervaloMin;
            ponto[`${s.id}_max`] = pontoReal.intervaloMax;
          }
        }

        // Previsão
        const pontoPrevisao = s.previsao?.find(p => p.data.getTime() === timestamp);
        if (pontoPrevisao) {
          ponto[`${s.id}_previsao`] = pontoPrevisao.valor;
          ponto[`${s.id}_real`] = false;
          if (pontoPrevisao.intervaloMin !== undefined && pontoPrevisao.intervaloMax !== undefined) {
            ponto[`${s.id}_prev_min`] = pontoPrevisao.intervaloMin;
            ponto[`${s.id}_prev_max`] = pontoPrevisao.intervaloMax;
          }
        }
      });

      return ponto;
    });
  }, [series, formatarData]);

  // Encontrar data de corte entre real e previsão
  const dataCorte = useMemo(() => {
    let maxDataReal = 0;
    series.forEach(s => {
      s.pontos.forEach(p => {
        if (p.data.getTime() > maxDataReal) {
          maxDataReal = p.data.getTime();
        }
      });
    });
    return maxDataReal;
  }, [series]);

  // Tooltip customizado
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[150px]">
        <p className="font-medium text-foreground mb-2">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              {p.name.replace('_previsao', ' (prev.)')}
            </span>
            <span className="font-semibold">{formatarValor(p.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{titulo}</CardTitle>
            {subtitulo && <CardDescription>{subtitulo}</CardDescription>}
          </div>

          {/* Indicadores de tendência */}
          <div className="flex gap-2">
            {series.map(s => (
              <Badge
                key={s.id}
                variant="outline"
                className={cn(
                  'flex items-center gap-1',
                  s.tendencia === 'crescente' && 'text-green-600 border-green-300',
                  s.tendencia === 'decrescente' && 'text-red-600 border-red-300',
                  s.tendencia === 'volatil' && 'text-orange-600 border-orange-300'
                )}
              >
                {s.tendencia === 'crescente' && <TrendingUp className="w-3 h-3" />}
                {s.tendencia === 'decrescente' && <TrendingDown className="w-3 h-3" />}
                {s.tendencia === 'estavel' && <Minus className="w-3 h-3" />}
                {s.tendencia === 'volatil' && <AlertTriangle className="w-3 h-3" />}
                {s.nome}
                {s.variacao !== undefined && (
                  <span className="ml-1">
                    {s.variacao > 0 ? '+' : ''}{s.variacao.toFixed(1)}%
                  </span>
                )}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={altura}>
          <AreaChart data={dadosGrafico} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              {series.map((s, i) => (
                <React.Fragment key={s.id}>
                  <linearGradient id={`gradient-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={s.cor || CORES_PADRAO[i]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={s.cor || CORES_PADRAO[i]} stopOpacity={0} />
                  </linearGradient>
                </React.Fragment>
              ))}
            </defs>

            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

            <XAxis
              dataKey="dataFormatada"
              tick={{ fill: 'currentColor', fontSize: 12 }}
              tickLine={{ stroke: 'currentColor' }}
              axisLine={{ stroke: 'currentColor' }}
            />

            <YAxis
              tick={{ fill: 'currentColor', fontSize: 12 }}
              tickLine={{ stroke: 'currentColor' }}
              axisLine={{ stroke: 'currentColor' }}
              tickFormatter={formatarValor}
              domain={['auto', 'auto']}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => value.replace('_previsao', ' (Previsão)')}
            />

            {/* Linha de corte entre real e previsão */}
            {mostrarPrevisao && dataCorte > 0 && (
              <ReferenceLine
                x={formatarData(new Date(dataCorte))}
                stroke="#94a3b8"
                strokeDasharray="5 5"
                label={{ value: 'Previsão →', position: 'top', fill: '#64748b', fontSize: 10 }}
              />
            )}

            {/* Áreas e linhas para cada série */}
            {series.map((s, i) => (
              <React.Fragment key={s.id}>
                {/* Área de intervalo de confiança (dados reais) */}
                {mostrarIntervaloConfianca && (
                  <Area
                    type="monotone"
                    dataKey={`${s.id}_max`}
                    stroke="none"
                    fill={s.cor || CORES_PADRAO[i]}
                    fillOpacity={0.1}
                    connectNulls
                  />
                )}

                {/* Linha principal (dados reais) */}
                <Line
                  type="monotone"
                  dataKey={s.id}
                  stroke={s.cor || CORES_PADRAO[i]}
                  strokeWidth={2}
                  dot={{ r: 4, fill: s.cor || CORES_PADRAO[i] }}
                  activeDot={{ r: 6 }}
                  connectNulls
                  name={s.nome}
                />

                {/* Linha de previsão (pontilhada) */}
                {mostrarPrevisao && s.previsao && (
                  <Line
                    type="monotone"
                    dataKey={`${s.id}_previsao`}
                    stroke={s.cor || CORES_PADRAO[i]}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3, fill: 'white', stroke: s.cor || CORES_PADRAO[i] }}
                    connectNulls
                    name={`${s.nome} (Previsão)`}
                  />
                )}
              </React.Fragment>
            ))}

            {/* Anotações */}
            {mostrarAnotacoes && anotacoes.map((ano, i) => (
              <ReferenceLine
                key={i}
                x={formatarData(ano.data)}
                stroke="#f97316"
                strokeDasharray="3 3"
                label={{
                  value: ano.texto,
                  position: 'insideTopRight',
                  fill: '#f97316',
                  fontSize: 10
                }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============================================
// COMPONENTE DE COMPARAÇÃO TEMPORAL
// ============================================

interface ComparacaoTemporalProps {
  serieAnterior: SerieTemporal;
  serieAtual: SerieTemporal;
  titulo?: string;
  altura?: number;
  className?: string;
}

export function ComparacaoTemporal({
  serieAnterior,
  serieAtual,
  titulo = 'Comparação de Períodos',
  altura = 300,
  className
}: ComparacaoTemporalProps) {
  const dadosComparacao = useMemo(() => {
    // Normalizar para mesma escala temporal (dias)
    const dadosAnt = serieAnterior.pontos.map((p, i) => ({
      dia: i + 1,
      anterior: p.valor,
      label: `Dia ${i + 1}`
    }));

    const dadosAtu = serieAtual.pontos.map((p, i) => ({
      dia: i + 1,
      atual: p.valor
    }));

    // Mesclar
    const maxDias = Math.max(dadosAnt.length, dadosAtu.length);
    return Array.from({ length: maxDias }, (_, i) => ({
      dia: i + 1,
      label: `Dia ${i + 1}`,
      anterior: dadosAnt[i]?.anterior,
      atual: dadosAtu[i]?.atual
    }));
  }, [serieAnterior, serieAtual]);

  const variacao = useMemo(() => {
    const mediaAnt = serieAnterior.pontos.reduce((s, p) => s + p.valor, 0) / serieAnterior.pontos.length;
    const mediaAtu = serieAtual.pontos.reduce((s, p) => s + p.valor, 0) / serieAtual.pontos.length;
    return ((mediaAtu - mediaAnt) / mediaAnt) * 100;
  }, [serieAnterior, serieAtual]);

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{titulo}</CardTitle>
          <Badge
            variant="outline"
            className={cn(
              variacao > 0 ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'
            )}
          >
            {variacao > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {variacao > 0 ? '+' : ''}{variacao.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={altura}>
          <LineChart data={dadosComparacao}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={(v) => `${v}%`} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="anterior"
              stroke="#94a3b8"
              strokeDasharray="5 5"
              name="Período Anterior"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="atual"
              stroke="#2563eb"
              strokeWidth={2}
              name="Período Atual"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default GraficoTendenciaTemporal;
