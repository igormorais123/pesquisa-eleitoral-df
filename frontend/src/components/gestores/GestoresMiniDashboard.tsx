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
  Briefcase,
  Building2,
  Layers,
  Clock,
  Award,
  Compass,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Gestor } from '@/types';

interface GestoresMiniDashboardProps {
  gestores: Gestor[];
  totalGeral: number;
}

const CORES_SETOR: Record<string, string> = {
  publico: '#3b82f6',
  privado: '#10b981',
};

const CORES_NIVEL: Record<string, string> = {
  estrategico: '#8b5cf6',
  tatico: '#f59e0b',
  operacional: '#06b6d4',
};

const CORES_PODC: Record<string, string> = {
  planejar: '#3b82f6',
  organizar: '#10b981',
  dirigir: '#f59e0b',
  controlar: '#ec4899',
};

const LABELS_SETOR: Record<string, string> = {
  publico: 'Publico',
  privado: 'Privado',
};

const LABELS_NIVEL: Record<string, string> = {
  estrategico: 'Estrateg.',
  tatico: 'Tatico',
  operacional: 'Operac.',
};

function calcularDistribuicao(gestores: Gestor[], campo: keyof Gestor): Record<string, number> {
  const distribuicao: Record<string, number> = {};
  gestores.forEach((g) => {
    const valor = String(g[campo] || 'Nao informado');
    distribuicao[valor] = (distribuicao[valor] || 0) + 1;
  });
  return distribuicao;
}

// Mini barra de progresso elegante
function MiniBar({ valor, max, cor }: { valor: number; max: number; cor: string }) {
  const percentual = max > 0 ? (valor / max) * 100 : 0;
  return (
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
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
            className="text-white/5"
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

export function GestoresMiniDashboard({ gestores, totalGeral }: GestoresMiniDashboardProps) {
  const stats = useMemo(() => {
    const total = gestores.length;
    if (total === 0) return null;

    const mediaIdade = gestores.reduce((acc, g) => acc + g.idade, 0) / total;
    const genero = calcularDistribuicao(gestores, 'genero');
    const setor = calcularDistribuicao(gestores, 'setor');
    const nivel = calcularDistribuicao(gestores, 'nivel_hierarquico');
    const area = calcularDistribuicao(gestores, 'area_atuacao');
    const estilo = calcularDistribuicao(gestores, 'estilo_lideranca');
    const localizacao = calcularDistribuicao(gestores, 'localizacao');

    // Calcular PODC medio
    let somaPODC_P = 0, somaPODC_O = 0, somaPODC_D = 0, somaPODC_C = 0, contPODC = 0;
    let somaEquipe = 0, contEquipe = 0;

    gestores.forEach((g) => {
      if (g.distribuicao_podc) {
        somaPODC_P += g.distribuicao_podc.planejar;
        somaPODC_O += g.distribuicao_podc.organizar;
        somaPODC_D += g.distribuicao_podc.dirigir;
        somaPODC_C += g.distribuicao_podc.controlar;
        contPODC++;
      }
      if (g.tamanho_equipe !== undefined) { somaEquipe += g.tamanho_equipe; contEquipe++; }
    });

    const mediaPODC = contPODC > 0 ? {
      planejar: somaPODC_P / contPODC,
      organizar: somaPODC_O / contPODC,
      dirigir: somaPODC_D / contPODC,
      controlar: somaPODC_C / contPODC,
    } : null;

    // Top 3 areas
    const topAreas = Object.entries(area)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Top 3 estilos
    const topEstilos = Object.entries(estilo)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Top 3 localizacoes
    const topLocalizacoes = Object.entries(localizacao)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Ordenar setor
    const setorOrdenado = Object.entries(setor)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value);

    // Ordenar nivel
    const nivelOrdenado = Object.entries(nivel)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value);

    return {
      total,
      mediaIdade,
      masculino: genero['masculino'] || 0,
      feminino: genero['feminino'] || 0,
      setor: setorOrdenado,
      nivel: nivelOrdenado,
      mediaPODC,
      mediaEquipe: contEquipe > 0 ? somaEquipe / contEquipe : 0,
      topAreas,
      topEstilos,
      topLocalizacoes,
      percentualTotal: ((total / totalGeral) * 100).toFixed(1),
    };
  }, [gestores, totalGeral]);

  if (!stats || gestores.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center">
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Target className="w-6 h-6 text-primary/50" />
          </div>
          <p className="text-sm text-muted-foreground">
            Selecione filtros para ver estatisticas
          </p>
        </div>
      </div>
    );
  }

  const maxSetor = Math.max(...stats.setor.map(s => s.value), 1);
  const maxNivel = Math.max(...stats.nivel.map(n => n.value), 1);

  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header com efeito gradiente */}
      <div className="relative px-5 py-4 bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Resumo do Grupo</h3>
              <p className="text-[10px] text-muted-foreground">{stats.percentualTotal}% do total</p>
            </div>
          </div>
          <Link
            href="/gestores"
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            Detalhes
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Stats principais */}
      <div className="p-5 space-y-5">
        {/* Numeros principais */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-white/5">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xl font-bold text-foreground">{stats.total}</p>
            <p className="text-[10px] text-muted-foreground">gestores</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-white/5">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Activity className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-xl font-bold text-foreground">{stats.mediaIdade.toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground">idade media</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-white/5">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Users className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-xl font-bold text-foreground">{Math.round(stats.mediaEquipe)}</p>
            <p className="text-[10px] text-muted-foreground">equipe media</p>
          </div>
        </div>

        {/* Genero - circulos */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-pink-500" />
            Genero
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

        {/* Setor */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Building2 className="w-3 h-3" />
            Setor
          </p>
          <div className="space-y-2">
            {stats.setor.map(({ key, value }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-14">
                  {LABELS_SETOR[key] || key}
                </span>
                <div className="flex-1">
                  <MiniBar valor={value} max={maxSetor} cor={CORES_SETOR[key] || '#888'} />
                </div>
                <span className="text-[10px] text-foreground font-medium w-8 text-right">
                  {Math.round((value / stats.total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Nivel Hierarquico */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Layers className="w-3 h-3" />
            Nivel Hierarquico
          </p>
          <div className="space-y-2">
            {stats.nivel.map(({ key, value }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-14">
                  {LABELS_NIVEL[key] || key}
                </span>
                <div className="flex-1">
                  <MiniBar valor={value} max={maxNivel} cor={CORES_NIVEL[key] || '#888'} />
                </div>
                <span className="text-[10px] text-foreground font-medium w-8 text-right">
                  {Math.round((value / stats.total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PODC */}
        {stats.mediaPODC && (
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Compass className="w-3 h-3" />
              PODC (Media %)
            </p>
            <div className="grid grid-cols-4 gap-2">
              {(['planejar', 'organizar', 'dirigir', 'controlar'] as const).map((key) => (
                <div key={key} className="text-center">
                  <p className="text-lg font-bold" style={{ color: CORES_PODC[key] }}>
                    {stats.mediaPODC![key].toFixed(0)}
                  </p>
                  <p className="text-[9px] text-muted-foreground capitalize">{key.slice(0, 4)}.</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top areas */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Briefcase className="w-3 h-3" />
            Top Areas
          </p>
          <div className="space-y-2">
            {stats.topAreas.map(([nome, valor], index) => (
              <div key={nome} className="flex items-center gap-2">
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                  index === 1 ? "bg-slate-400/20 text-slate-400" :
                  "bg-orange-700/20 text-orange-600"
                )}>
                  {index + 1}
                </span>
                <span className="flex-1 text-xs text-foreground truncate">{nome.replace(/_/g, ' ')}</span>
                <span className="text-[10px] text-muted-foreground">
                  {Math.round((valor / stats.total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Estilos */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Award className="w-3 h-3" />
            Estilos de Lideranca
          </p>
          <div className="flex flex-wrap gap-1.5">
            {stats.topEstilos.map(([nome, valor]) => {
              const percentual = Math.round((valor / stats.total) * 100);
              return (
                <span
                  key={nome}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-violet-500/15 text-violet-400"
                >
                  {nome.replace(/_/g, ' ')}
                  <span className="opacity-70">{percentual}%</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Top Localizacoes */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            Top Localizacoes
          </p>
          <div className="space-y-2">
            {stats.topLocalizacoes.map(([nome, valor], index) => (
              <div key={nome} className="flex items-center gap-2">
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                  index === 1 ? "bg-slate-400/20 text-slate-400" :
                  "bg-orange-700/20 text-orange-600"
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
          href="/gestores?visualizacao=graficos"
          className={cn(
            "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl",
            "bg-gradient-to-r from-primary/20 to-purple-500/20",
            "border border-primary/20 hover:border-primary/40",
            "text-sm font-medium text-primary",
            "transition-all duration-300 hover:scale-[1.02]",
            "group"
          )}
        >
          <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
          Ver analise completa
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
