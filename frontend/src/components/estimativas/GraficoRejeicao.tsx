'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Ban, AlertTriangle, Info } from 'lucide-react';
import { PESQUISAS_2026, CORES_CANDIDATOS, calcularRejeicaoMedia } from '@/data/pesquisas-eleitorais-2026';
import { cn } from '@/lib/utils';
import {
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const CANDIDATOS_PRINCIPAIS = [
  'Lula',
  'Flávio Bolsonaro',
  'Michelle Bolsonaro',
  'Tarcísio de Freitas',
  'Ronaldo Caiado',
  'Ratinho Junior',
  'Romeu Zema',
  'Eduardo Leite',
];

export function GraficoRejeicao() {
  const dadosRejeicao = useMemo(() => {
    return CANDIDATOS_PRINCIPAIS.map((candidato) => {
      const media = calcularRejeicaoMedia(PESQUISAS_2026, candidato);
      return {
        candidato,
        rejeicao: Math.round(media * 10) / 10,
        cor: CORES_CANDIDATOS[candidato] || '#6B7280',
      };
    })
      .filter((d) => d.rejeicao > 0)
      .sort((a, b) => b.rejeicao - a.rejeicao);
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;

    return (
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl p-4 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.cor }} />
          <span className="font-semibold text-foreground">{data.candidato}</span>
        </div>
        <div className="text-2xl font-bold text-red-500 number">{data.rejeicao}%</div>
        <div className="text-xs text-muted-foreground mt-1">não votariam de jeito nenhum</div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <Ban className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                Rejeição dos Candidatos
                <TooltipUI>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Percentual de eleitores que afirmam que não votariam no candidato de jeito
                      nenhum. Média ponderada das pesquisas disponíveis.
                    </p>
                  </TooltipContent>
                </TooltipUI>
              </h3>
              <p className="text-sm text-muted-foreground">
                &ldquo;Não votaria de jeito nenhum&rdquo; - Média das pesquisas
              </p>
            </div>
          </div>
        </div>

        {/* Gráfico de Barras Horizontal */}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dadosRejeicao}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                strokeOpacity={0.5}
                horizontal={true}
                vertical={false}
              />
              <XAxis
                type="number"
                domain={[0, 60]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="candidato"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 500 }}
                width={90}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
              <Bar dataKey="rejeicao" radius={[0, 8, 8, 0]} maxBarSize={40}>
                {dadosRejeicao.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.rejeicao > 40 ? '#EF4444' : entry.rejeicao > 25 ? '#F59E0B' : '#22C55E'}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cards de destaque */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Maior rejeição */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-red-500/5 border border-red-500/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-500">Maior Rejeição</span>
            </div>
            <div className="text-lg font-semibold text-foreground">{dadosRejeicao[0]?.candidato}</div>
            <div className="text-2xl font-bold text-red-500 number">{dadosRejeicao[0]?.rejeicao}%</div>
          </motion.div>

          {/* Menor rejeição */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-emerald-500">Menor Rejeição</span>
            </div>
            <div className="text-lg font-semibold text-foreground">
              {dadosRejeicao[dadosRejeicao.length - 1]?.candidato}
            </div>
            <div className="text-2xl font-bold text-emerald-500 number">
              {dadosRejeicao[dadosRejeicao.length - 1]?.rejeicao}%
            </div>
          </motion.div>

          {/* Média geral */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl bg-muted/50 border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-muted-foreground">Média Geral</span>
            </div>
            <div className="text-lg font-semibold text-foreground">Todos os candidatos</div>
            <div className="text-2xl font-bold text-foreground number">
              {(dadosRejeicao.reduce((a, b) => a + b.rejeicao, 0) / dadosRejeicao.length).toFixed(1)}%
            </div>
          </motion.div>
        </div>

        {/* Legenda de cores */}
        <div className="flex justify-center gap-6 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-muted-foreground">Alta (&gt;40%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-sm text-muted-foreground">Média (25-40%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-muted-foreground">Baixa (&lt;25%)</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
