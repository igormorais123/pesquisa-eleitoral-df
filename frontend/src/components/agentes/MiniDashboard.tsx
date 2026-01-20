'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  MapPin,
  TrendingUp,
  Activity,
  ArrowRight,
  Sparkles,
  BarChart2,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Eleitor } from '@/types';

interface MiniDashboardProps {
  eleitores: Eleitor[];
  totalGeral: number;
}

const CORES_ORIENTACAO: Record<string, string> = {
  esquerda: '#ef4444',
  'centro-esquerda': '#f97316',
  centro: '#a855f7',
  'centro-direita': '#3b82f6',
  direita: '#1d4ed8',
};

const CORES_CLUSTER: Record<string, string> = {
  G1_alta: '#22c55e',
  G2_media_alta: '#84cc16',
  G3_media_baixa: '#eab308',
  G4_baixa: '#f97316',
};

const LABELS_ORIENTACAO: Record<string, string> = {
  esquerda: 'Esq',
  'centro-esquerda': 'C-E',
  centro: 'Cen',
  'centro-direita': 'C-D',
  direita: 'Dir',
};

const LABELS_CLUSTER: Record<string, string> = {
  G1_alta: 'Alta',
  G2_media_alta: 'M-A',
  G3_media_baixa: 'M-B',
  G4_baixa: 'Baixa',
};

function calcularDistribuicao(eleitores: Eleitor[], campo: keyof Eleitor): Record<string, number> {
  const distribuicao: Record<string, number> = {};
  eleitores.forEach((e) => {
    const valor = String(e[campo] || 'Não informado');
    distribuicao[valor] = (distribuicao[valor] || 0) + 1;
  });
  return distribuicao;
}

// Mini barra de progresso elegante
function MiniBar({ valor, max, cor }: { valor: number; max: number; cor: string }) {
  const percentual = max > 0 ? (valor / max) * 100 : 0;
  return (
    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percentual}%`, backgroundColor: cor }}
      />
    </div>
  );
}

// Indicador circular elegante
function CircleIndicator({
  valor,
  total,
  cor,
  label
}: {
  valor: number;
  total: number;
  cor: string;
  label: string;
}) {
  const percentual = total > 0 ? Math.round((valor / total) * 100) : 0;
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (percentual / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-slate-200 dark:text-slate-700"
          />
          <circle
            cx="24"
            cy="24"
            r="18"
            fill="none"
            stroke={cor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
          {percentual}%
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

export function MiniDashboard({ eleitores, totalGeral }: MiniDashboardProps) {
  const stats = useMemo(() => {
    const total = eleitores.length;
    if (total === 0) return null;

    const mediaIdade = eleitores.reduce((acc, e) => acc + e.idade, 0) / total;
    const genero = calcularDistribuicao(eleitores, 'genero');
    const cluster = calcularDistribuicao(eleitores, 'cluster_socioeconomico');
    const orientacao = calcularDistribuicao(eleitores, 'orientacao_politica');
    const regiao = calcularDistribuicao(eleitores, 'regiao_administrativa');

    // Top 3 regiões
    const topRegioes = Object.entries(regiao)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Ordenar orientações políticas
    const ordemOrientacao = ['esquerda', 'centro-esquerda', 'centro', 'centro-direita', 'direita'];
    const orientacaoOrdenada = ordemOrientacao
      .filter(o => orientacao[o])
      .map(o => ({ key: o, value: orientacao[o] || 0 }));

    return {
      total,
      mediaIdade,
      masculino: genero['masculino'] || 0,
      feminino: genero['feminino'] || 0,
      cluster,
      orientacao: orientacaoOrdenada,
      topRegioes,
      percentualTotal: ((total / totalGeral) * 100).toFixed(1),
    };
  }, [eleitores, totalGeral]);

  if (!stats || eleitores.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm">
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Target className="w-6 h-6 text-primary/50" />
          </div>
          <p className="text-sm text-muted-foreground">
            Selecione filtros para ver estatísticas
          </p>
        </div>
      </div>
    );
  }

  const maxOrientacao = Math.max(...stats.orientacao.map(o => o.value));

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 shadow-sm">
      {/* Header com efeito gradiente */}
      <div className="relative px-5 py-4 bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Resumo</h3>
              <p className="text-[10px] text-muted-foreground">{stats.percentualTotal}% do total</p>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            Dashboard
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Stats principais */}
      <div className="p-5 space-y-5">
        {/* Números principais */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-[10px] text-muted-foreground">eleitores</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Activity className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.mediaIdade.toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground">idade média</p>
          </div>
        </div>

        {/* Gênero - círculos */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-pink-500" />
            Gênero
          </p>
          <div className="flex justify-center gap-6">
            <CircleIndicator
              valor={stats.masculino}
              total={stats.total}
              cor="#3b82f6"
              label="Masc"
            />
            <CircleIndicator
              valor={stats.feminino}
              total={stats.total}
              cor="#ec4899"
              label="Fem"
            />
          </div>
        </div>

        {/* Espectro político - barras horizontais */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-red-500" />
            Espectro Político
          </p>
          <div className="space-y-2">
            {stats.orientacao.map(({ key, value }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-6">
                  {LABELS_ORIENTACAO[key] || key}
                </span>
                <div className="flex-1">
                  <MiniBar valor={value} max={maxOrientacao} cor={CORES_ORIENTACAO[key] || '#888'} />
                </div>
                <span className="text-[10px] text-foreground font-medium w-6 text-right">
                  {Math.round((value / stats.total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Classe social - chips */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            Classe Social
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(stats.cluster)
              .sort((a, b) => b[1] - a[1])
              .map(([key, value]) => {
                const percentual = Math.round((value / stats.total) * 100);
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium"
                    style={{
                      backgroundColor: `${CORES_CLUSTER[key] || '#888'}20`,
                      color: CORES_CLUSTER[key] || '#888'
                    }}
                  >
                    {LABELS_CLUSTER[key] || key}
                    <span className="opacity-70">{percentual}%</span>
                  </span>
                );
            })}
          </div>
        </div>

        {/* Top regiões */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            Top Regiões
          </p>
          <div className="space-y-2">
            {stats.topRegioes.map(([nome, valor], index) => (
              <div key={nome} className="flex items-center gap-2">
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  index === 0 ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" :
                  index === 1 ? "bg-slate-200 dark:bg-slate-600/30 text-slate-600 dark:text-slate-400" :
                  "bg-orange-100 dark:bg-orange-700/20 text-orange-600 dark:text-orange-500"
                )}>
                  {index + 1}
                </span>
                <span className="flex-1 text-xs text-foreground truncate">{nome}</span>
                <span className="text-[10px] text-muted-foreground">
                  {Math.round((valor / stats.total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/?visualizacao=graficos"
          className={cn(
            "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl",
            "bg-gradient-to-r from-primary/20 to-purple-500/20",
            "border border-primary/30 hover:border-primary/50",
            "text-sm font-medium text-primary",
            "transition-all duration-300 hover:scale-[1.02]",
            "group"
          )}
        >
          <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
          Ver análise completa
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
