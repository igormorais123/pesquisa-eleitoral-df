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
  Vote,
  Building2,
  FileText,
  Globe,
  ShieldCheck,
  Scale,
  Landmark,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Parlamentar } from '@/types';

interface ParlamentaresMiniDashboardProps {
  parlamentares: Parlamentar[];
  totalGeral: number;
}

const CORES_ORIENTACAO: Record<string, string> = {
  esquerda: '#ef4444',
  'centro-esquerda': '#f97316',
  centro: '#a855f7',
  'centro-direita': '#3b82f6',
  direita: '#1d4ed8',
};

const CORES_RELACAO: Record<string, string> = {
  base_aliada: '#22c55e',
  independente: '#f59e0b',
  oposicao_moderada: '#f97316',
  oposicao_forte: '#ef4444',
};

const CORES_CASA: Record<string, string> = {
  camara_federal: '#3b82f6',
  senado: '#8b5cf6',
  cldf: '#10b981',
};

const LABELS_ORIENTACAO: Record<string, string> = {
  esquerda: 'Esq',
  'centro-esquerda': 'C-E',
  centro: 'Cen',
  'centro-direita': 'C-D',
  direita: 'Dir',
};

const LABELS_RELACAO: Record<string, string> = {
  base_aliada: 'Base',
  independente: 'Indep',
  oposicao_moderada: 'Op.Mod',
  oposicao_forte: 'Op.For',
};

const LABELS_CASA: Record<string, string> = {
  camara_federal: 'Camara',
  senado: 'Senado',
  cldf: 'CLDF',
};

function calcularDistribuicao(parlamentares: Parlamentar[], campo: keyof Parlamentar): Record<string, number> {
  const distribuicao: Record<string, number> = {};
  parlamentares.forEach((p) => {
    const valor = String(p[campo] || 'Nao informado');
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

export function ParlamentaresMiniDashboard({ parlamentares, totalGeral }: ParlamentaresMiniDashboardProps) {
  const stats = useMemo(() => {
    const total = parlamentares.length;
    if (total === 0) return null;

    const mediaIdade = parlamentares.reduce((acc, p) => acc + p.idade, 0) / total;
    const genero = calcularDistribuicao(parlamentares, 'genero');
    const casa = calcularDistribuicao(parlamentares, 'casa_legislativa');
    const orientacao = calcularDistribuicao(parlamentares, 'orientacao_politica');
    const partido = calcularDistribuicao(parlamentares, 'partido');
    const uf = calcularDistribuicao(parlamentares, 'uf');

    // Relacao com governo
    const relacaoGoverno: Record<string, number> = {};
    parlamentares.forEach((p) => {
      if (p.relacao_governo_atual) {
        relacaoGoverno[p.relacao_governo_atual] = (relacaoGoverno[p.relacao_governo_atual] || 0) + 1;
      }
    });

    // Calcular medias
    let somaPresenca = 0, contPresenca = 0;
    let somaProjetos = 0, contProjetos = 0;
    let fichaLimpaCount = 0;

    parlamentares.forEach((p) => {
      if (p.taxa_presenca_plenario !== undefined) { somaPresenca += p.taxa_presenca_plenario; contPresenca++; }
      if (p.total_projetos_autoria !== undefined) { somaProjetos += p.total_projetos_autoria; contProjetos++; }
      if (p.ficha_limpa === true) fichaLimpaCount++;
    });

    // Top 3 partidos
    const topPartidos = Object.entries(partido)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Top 3 UFs
    const topUFs = Object.entries(uf)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Ordenar orientacoes politicas
    const ordemOrientacao = ['esquerda', 'centro-esquerda', 'centro', 'centro-direita', 'direita'];
    const orientacaoOrdenada = ordemOrientacao
      .filter(o => orientacao[o])
      .map(o => ({ key: o, value: orientacao[o] || 0 }));

    // Ordenar casas legislativas
    const casaOrdenada = Object.entries(casa)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value);

    // Ordenar relacao governo
    const ordemRelacao = ['base_aliada', 'independente', 'oposicao_moderada', 'oposicao_forte'];
    const relacaoOrdenada = ordemRelacao
      .filter(r => relacaoGoverno[r])
      .map(r => ({ key: r, value: relacaoGoverno[r] || 0 }));

    return {
      total,
      mediaIdade,
      masculino: genero['masculino'] || 0,
      feminino: genero['feminino'] || 0,
      casa: casaOrdenada,
      orientacao: orientacaoOrdenada,
      relacaoGoverno: relacaoOrdenada,
      topPartidos,
      topUFs,
      mediaPresenca: contPresenca > 0 ? somaPresenca / contPresenca : 0,
      mediaProjetos: contProjetos > 0 ? somaProjetos / contProjetos : 0,
      fichaLimpaPerc: (fichaLimpaCount / total) * 100,
      percentualTotal: ((total / totalGeral) * 100).toFixed(1),
    };
  }, [parlamentares, totalGeral]);

  if (!stats || parlamentares.length === 0) {
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

  const maxOrientacao = Math.max(...stats.orientacao.map(o => o.value));
  const maxRelacao = Math.max(...stats.relacaoGoverno.map(r => r.value), 1);

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
            href="/parlamentares"
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
            <p className="text-[10px] text-muted-foreground">parlamentares</p>
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
              <Target className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-xl font-bold text-foreground">{stats.mediaPresenca.toFixed(0)}%</p>
            <p className="text-[10px] text-muted-foreground">presenca</p>
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

        {/* Casa Legislativa */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Building2 className="w-3 h-3" />
            Casa Legislativa
          </p>
          <div className="flex flex-wrap gap-1.5">
            {stats.casa.map(({ key, value }) => {
              const percentual = Math.round((value / stats.total) * 100);
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium"
                  style={{
                    backgroundColor: `${CORES_CASA[key] || '#888'}15`,
                    color: CORES_CASA[key] || '#888'
                  }}
                >
                  {LABELS_CASA[key] || key}
                  <span className="opacity-70">{percentual}%</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Espectro politico - barras horizontais */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Scale className="w-3 h-3" />
            Espectro Politico
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

        {/* Relacao com Governo */}
        {stats.relacaoGoverno.length > 0 && (
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Landmark className="w-3 h-3" />
              Relacao com Governo
            </p>
            <div className="space-y-2">
              {stats.relacaoGoverno.map(({ key, value }) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-12">
                    {LABELS_RELACAO[key] || key}
                  </span>
                  <div className="flex-1">
                    <MiniBar valor={value} max={maxRelacao} cor={CORES_RELACAO[key] || '#888'} />
                  </div>
                  <span className="text-[10px] text-foreground font-medium w-6 text-right">
                    {Math.round((value / stats.total) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top partidos */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Vote className="w-3 h-3" />
            Top Partidos
          </p>
          <div className="space-y-2">
            {stats.topPartidos.map(([nome, valor], index) => (
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

        {/* Top UFs */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            Top Estados
          </p>
          <div className="space-y-2">
            {stats.topUFs.map(([nome, valor], index) => (
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

        {/* Metricas adicionais */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <FileText className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.mediaProjetos.toFixed(0)}</p>
            <p className="text-[9px] text-muted-foreground">projetos (media)</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <ShieldCheck className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.fichaLimpaPerc.toFixed(0)}%</p>
            <p className="text-[9px] text-muted-foreground">ficha limpa</p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/parlamentares?visualizacao=graficos"
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
