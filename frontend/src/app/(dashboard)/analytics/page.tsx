'use client';

/**
 * Página de Analytics Global
 * Design minimalista e responsivo
 * Pesquisa Eleitoral DF 2026
 */

import { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp,
  Users,
  DollarSign,
  MessageSquare,
  Lightbulb,
  RefreshCw,
  Database,
  Cpu,
  Zap,
  PieChart as PieChartIcon,
  Target,
  MapPin,
  ChevronRight,
  Activity,
  Sparkles,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import {
  calcularDashboard,
  calcularSegmentacao,
  calcularTendencias,
  gerarInsights,
  extrairPalavrasFrequentes,
  formatarMoeda,
  type DashboardLocal,
  type SegmentacaoLocal,
  type TendenciaLocal,
  type InsightLocal,
  type PalavraFrequente,
} from '@/services/analytics-local';
import { cn } from '@/lib/utils';

// ============================================
// DESIGN TOKENS
// ============================================

const cores = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  cyan: '#06b6d4',
  neutral: '#64748b',
};

const coresGrafico = [cores.primary, cores.success, cores.warning, cores.info, cores.purple, cores.pink, cores.cyan];

// ============================================
// COMPONENTES DE UI
// ============================================

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'bg-white dark:bg-zinc-900 rounded-2xl',
      'border border-zinc-100 dark:border-zinc-800',
      'shadow-sm hover:shadow-md transition-shadow duration-300',
      className
    )}>
      {children}
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'primary',
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  color?: keyof typeof cores;
}) {
  const bgColors: Record<string, string> = {
    primary: 'bg-indigo-50 dark:bg-indigo-950/30',
    success: 'bg-emerald-50 dark:bg-emerald-950/30',
    warning: 'bg-amber-50 dark:bg-amber-950/30',
    danger: 'bg-red-50 dark:bg-red-950/30',
    info: 'bg-blue-50 dark:bg-blue-950/30',
    purple: 'bg-purple-50 dark:bg-purple-950/30',
    cyan: 'bg-cyan-50 dark:bg-cyan-950/30',
  };

  const iconColors: Record<string, string> = {
    primary: 'text-indigo-600 dark:text-indigo-400',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    cyan: 'text-cyan-600 dark:text-cyan-400',
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2.5 rounded-xl', bgColors[color])}>
          <Icon className={cn('w-5 h-5', iconColors[color])} />
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            trend === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          )}>
            {trend === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
        {value}
      </p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
        {label}
      </p>
      {subtitle && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
          {subtitle}
        </p>
      )}
    </Card>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4 sm:mb-5">
      <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30">
        <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
        {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function ProgressBar({
  value,
  max = 100,
  color = cores.primary,
  showLabel = true,
  size = 'md',
}: {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const heights = { sm: 'h-1.5', md: 'h-2' };

  return (
    <div className="flex items-center gap-3">
      <div className={cn('flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden', heights[size])}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-zinc-500 w-10 text-right">
          {percentage.toFixed(0)}%
        </span>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
        <Icon className="w-8 h-8 text-zinc-400" />
      </div>
      <h4 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">{title}</h4>
      <p className="text-sm text-zinc-500 max-w-xs">{description}</p>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-lg', className)} />
  );
}

function MetricSkeleton() {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-4 w-16" />
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-5">
        <Skeleton className="w-9 h-9 rounded-xl" />
        <div>
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-64 sm:h-72 w-full rounded-xl" />
    </Card>
  );
}

function AnimatedCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ============================================
// TOOLTIP CUSTOMIZADO
// ============================================

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-zinc-900 dark:bg-zinc-800 px-3 py-2 rounded-lg shadow-xl border border-zinc-700">
      <p className="text-xs font-medium text-zinc-300 mb-1">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString('pt-BR') : entry.value}
        </p>
      ))}
    </div>
  );
};

// ============================================
// PÁGINA PRINCIPAL
// ============================================

export default function AnalyticsPage() {
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);
  const [dashboard, setDashboard] = useState<DashboardLocal | null>(null);
  const [segCluster, setSegCluster] = useState<SegmentacaoLocal[]>([]);
  const [segRegiao, setSegRegiao] = useState<SegmentacaoLocal[]>([]);
  const [segOrientacao, setSegOrientacao] = useState<SegmentacaoLocal[]>([]);
  const [tendencias, setTendencias] = useState<TendenciaLocal[]>([]);
  const [insights, setInsights] = useState<InsightLocal[]>([]);
  const [palavras, setPalavras] = useState<PalavraFrequente[]>([]);

  const carregarDados = async (isRefresh = false) => {
    if (isRefresh) setAtualizando(true);
    else setCarregando(true);
    setErro(null);

    try {
      const [dash, cluster, regiao, orient, tend, ins, palav] = await Promise.all([
        calcularDashboard(),
        calcularSegmentacao('cluster'),
        calcularSegmentacao('regiao'),
        calcularSegmentacao('orientacao'),
        calcularTendencias(),
        gerarInsights(),
        extrairPalavrasFrequentes(15),
      ]);

      setDashboard(dash);
      setSegCluster(cluster);
      setSegRegiao(regiao);
      setSegOrientacao(orient);
      setTendencias(tend);
      setInsights(ins);
      setPalavras(palav);
      setUltimaAtualizacao(new Date());
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      setErro('Falha ao carregar dados. Tente novamente.');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Formatar tempo relativo
  const tempoRelativo = useMemo(() => {
    if (!ultimaAtualizacao) return null;
    const agora = new Date();
    const diff = Math.floor((agora.getTime() - ultimaAtualizacao.getTime()) / 1000);
    if (diff < 60) return 'agora mesmo';
    if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
    return ultimaAtualizacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }, [ultimaAtualizacao]);

  // Formatar tempo de execução
  const formatarTempo = (segundos: number) => {
    if (segundos < 60) return `${segundos.toFixed(0)}s`;
    const min = Math.floor(segundos / 60);
    const sec = Math.floor(segundos % 60);
    return `${min}m ${sec}s`;
  };

  // Dados para gráficos
  const dadosSentimento = dashboard ? [
    { name: 'Positivo', value: dashboard.sentimentos.positivo, fill: cores.success },
    { name: 'Negativo', value: dashboard.sentimentos.negativo, fill: cores.danger },
    { name: 'Neutro', value: dashboard.sentimentos.neutro, fill: cores.neutral },
    { name: 'Misto', value: dashboard.sentimentos.misto, fill: cores.warning },
  ].filter(d => d.value > 0) : [];

  const dadosOrientacao = segOrientacao.slice(0, 5).map((s, i) => ({
    name: s.nome.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: s.total,
    percent: s.percentual,
    fill: coresGrafico[i % coresGrafico.length],
  }));

  const dadosTendencia = tendencias.slice(-6).map(t => ({
    name: t.periodo.split('-')[1] + '/' + t.periodo.split('-')[0].slice(2),
    pesquisas: t.pesquisas,
    respostas: t.respostas,
  }));

  // Loading state com Skeleton
  if (carregando) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>

          {/* Métricas Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[...Array(6)].map((_, i) => (
              <MetricSkeleton key={i} />
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (erro) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 mb-4">
            <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
            Erro ao carregar
          </h3>
          <p className="text-zinc-500 text-sm mb-4">{erro}</p>
          <button
            onClick={() => carregarDados()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Analytics
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-zinc-500 text-sm">
                Visão geral das pesquisas eleitorais
              </p>
              {tempoRelativo && (
                <span className="flex items-center gap-1 text-xs text-zinc-400">
                  <Clock className="w-3 h-3" />
                  {tempoRelativo}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => carregarDados(true)}
            disabled={atualizando}
            className={cn(
              'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl',
              'bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm',
              'transition-all duration-200 shadow-sm hover:shadow-md',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'active:scale-95'
            )}
          >
            <RefreshCw className={cn('w-4 h-4', atualizando && 'animate-spin')} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </header>

        {/* Métricas Principais */}
        <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <AnimatedCard delay={0}>
            <MetricCard
              label="Pesquisas"
              value={dashboard?.totalPesquisas || 0}
              subtitle={`${dashboard?.totalPesquisasConcluidas || 0} concluídas`}
              icon={Database}
              color="primary"
            />
          </AnimatedCard>
          <AnimatedCard delay={50}>
            <MetricCard
              label="Respostas"
              value={(dashboard?.totalRespostas || 0).toLocaleString('pt-BR')}
              subtitle={`${dashboard?.mediaRespostasPorPesquisa.toFixed(1)} por pesquisa`}
              icon={MessageSquare}
              color="success"
            />
          </AnimatedCard>
          <AnimatedCard delay={100}>
            <MetricCard
              label="Eleitores"
              value={(dashboard?.totalEleitoresUnicos || 0).toLocaleString('pt-BR')}
              subtitle="participantes únicos"
              icon={Users}
              color="purple"
            />
          </AnimatedCard>
          <AnimatedCard delay={150}>
            <MetricCard
              label="Investimento"
              value={formatarMoeda(dashboard?.custoAtual || 0)}
              subtitle={`${formatarMoeda(dashboard?.mediaCustoPorPesquisa || 0)}/pesquisa`}
              icon={DollarSign}
              color="warning"
            />
          </AnimatedCard>
          <AnimatedCard delay={200}>
            <MetricCard
              label="Tempo Médio"
              value={formatarTempo(dashboard?.mediaTempoExecucao || 0)}
              subtitle="por execução"
              icon={Clock}
              color="cyan"
            />
          </AnimatedCard>
          <AnimatedCard delay={250}>
            <MetricCard
              label="Tokens"
              value={((dashboard?.tokensEntrada || 0 + (dashboard?.tokensSaida || 0)) / 1000).toFixed(1) + 'k'}
              subtitle={`${((dashboard?.tokensEntrada || 0) / 1000).toFixed(0)}k in / ${((dashboard?.tokensSaida || 0) / 1000).toFixed(0)}k out`}
              icon={Zap}
              color="info"
            />
          </AnimatedCard>
        </section>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">

          {/* Gráfico de Sentimentos */}
          <AnimatedCard delay={300}>
            <Card className="p-4 sm:p-6">
              <SectionHeader icon={PieChartIcon} title="Sentimentos" subtitle="Análise de tom das respostas" />
              {dadosSentimento.length > 0 ? (
                <div className="h-64 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dadosSentimento}
                        cx="50%"
                        cy="50%"
                        innerRadius="55%"
                        outerRadius="85%"
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {dadosSentimento.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-xs text-zinc-600 dark:text-zinc-400">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  icon={PieChartIcon}
                  title="Sem dados"
                  description="Execute pesquisas para ver a análise de sentimentos"
                />
              )}
            </Card>
          </AnimatedCard>

          {/* Gráfico de Orientação Política */}
          <AnimatedCard delay={350}>
            <Card className="p-4 sm:p-6">
              <SectionHeader icon={Target} title="Espectro Político" subtitle="Distribuição ideológica" />
              {dadosOrientacao.length > 0 ? (
                <div className="h-64 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosOrientacao} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={80}
                        tick={{ fill: '#71717a', fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.length > 12 ? value.slice(0, 10) + '...' : value}
                      />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="value"
                      radius={[0, 6, 6, 0]}
                      maxBarSize={28}
                    >
                      {dadosOrientacao.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                icon={Target}
                title="Sem dados"
                description="Execute pesquisas para ver o espectro político"
              />
            )}
            </Card>
          </AnimatedCard>
        </div>

        {/* Tendências */}
        {dadosTendencia.length > 1 && (
          <AnimatedCard delay={400}>
            <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
              <SectionHeader icon={TrendingUp} title="Evolução Temporal" subtitle="Últimos períodos" />
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dadosTendencia} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientRespostas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={cores.primary} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={cores.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradientPesquisas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={cores.success} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={cores.success} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#71717a', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#71717a', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="respostas"
                    name="Respostas"
                    stroke={cores.primary}
                    strokeWidth={2}
                    fill="url(#gradientRespostas)"
                  />
                  <Area
                    type="monotone"
                    dataKey="pesquisas"
                    name="Pesquisas"
                    stroke={cores.success}
                    strokeWidth={2}
                    fill="url(#gradientPesquisas)"
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => <span className="text-xs text-zinc-600 dark:text-zinc-400">{value}</span>}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            </Card>
          </AnimatedCard>
        )}

        {/* Segmentações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">

          {/* Por Região */}
          <AnimatedCard delay={450}>
            <Card className="p-4 sm:p-6">
              <SectionHeader icon={MapPin} title="Por Região" subtitle="Distribuição geográfica" />
            {segRegiao.length > 0 ? (
              <div className="space-y-4">
                {segRegiao.slice(0, 6).map((seg, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate pr-2">
                        {seg.nome}
                      </span>
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {seg.total}
                      </span>
                    </div>
                    <ProgressBar
                      value={seg.percentual}
                      color={coresGrafico[i % coresGrafico.length]}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={MapPin} title="Sem dados" description="Nenhuma região identificada" />
            )}
            </Card>
          </AnimatedCard>

          {/* Por Cluster */}
          <AnimatedCard delay={500}>
            <Card className="p-4 sm:p-6">
              <SectionHeader icon={Users} title="Por Cluster" subtitle="Perfil socioeconômico" />
            {segCluster.length > 0 ? (
              <div className="space-y-4">
                {segCluster.slice(0, 6).map((seg, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate pr-2">
                        {seg.nome}
                      </span>
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {seg.total}
                      </span>
                    </div>
                    <ProgressBar
                      value={seg.percentual}
                      color={coresGrafico[i % coresGrafico.length]}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Users} title="Sem dados" description="Nenhum cluster identificado" />
            )}
            </Card>
          </AnimatedCard>
        </div>

        {/* Palavras Frequentes - Design melhorado */}
        {palavras.length > 0 && (
          <AnimatedCard delay={550}>
            <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
              <SectionHeader icon={MessageSquare} title="Termos Frequentes" subtitle="Palavras mais citadas" />
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {palavras.map((p, i) => {
                  const ratio = p.frequencia / (palavras[0]?.frequencia || 1);
                  const size = Math.max(0.7, Math.min(1.3, ratio * 0.6 + 0.7));
                  const weight = ratio > 0.7 ? 600 : ratio > 0.4 ? 500 : 400;
                  const colorIndex = i % coresGrafico.length;

                  return (
                    <span
                      key={i}
                      className="inline-flex items-center px-3 py-1.5 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md cursor-default"
                      style={{
                        fontSize: `${size}rem`,
                        fontWeight: weight,
                        backgroundColor: `${coresGrafico[colorIndex]}15`,
                        color: coresGrafico[colorIndex],
                        border: `1px solid ${coresGrafico[colorIndex]}30`,
                      }}
                      title={`${p.frequencia} menções`}
                    >
                      {p.palavra}
                      <span className="ml-1.5 text-[10px] opacity-60">{p.frequencia}</span>
                    </span>
                  );
                })}
              </div>
            </Card>
          </AnimatedCard>
        )}

        {/* Insights */}
        <AnimatedCard delay={600}>
          <Card className="p-4 sm:p-6">
          <SectionHeader icon={Lightbulb} title="Insights" subtitle="Descobertas automáticas" />
          {insights.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {insights.map((insight, i) => {
                const styles: Record<string, { bg: string; border: string; icon: string }> = {
                  destaque: {
                    bg: 'bg-blue-50 dark:bg-blue-950/20',
                    border: 'border-blue-200 dark:border-blue-800',
                    icon: 'text-blue-600 dark:text-blue-400'
                  },
                  alerta: {
                    bg: 'bg-red-50 dark:bg-red-950/20',
                    border: 'border-red-200 dark:border-red-800',
                    icon: 'text-red-600 dark:text-red-400'
                  },
                  tendencia: {
                    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
                    border: 'border-emerald-200 dark:border-emerald-800',
                    icon: 'text-emerald-600 dark:text-emerald-400'
                  },
                  correlacao: {
                    bg: 'bg-purple-50 dark:bg-purple-950/20',
                    border: 'border-purple-200 dark:border-purple-800',
                    icon: 'text-purple-600 dark:text-purple-400'
                  },
                  descoberta: {
                    bg: 'bg-amber-50 dark:bg-amber-950/20',
                    border: 'border-amber-200 dark:border-amber-800',
                    icon: 'text-amber-600 dark:text-amber-400'
                  },
                };

                const style = styles[insight.tipo] || styles.descoberta;

                return (
                  <div
                    key={i}
                    className={cn(
                      'p-4 rounded-xl border transition-all duration-200 hover:shadow-sm',
                      style.bg,
                      style.border
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('mt-0.5', style.icon)}>
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            insight.relevancia === 'alta' ? 'bg-red-500' :
                            insight.relevancia === 'media' ? 'bg-amber-500' : 'bg-emerald-500'
                          )} />
                          <span className="text-[10px] uppercase tracking-wide font-semibold text-zinc-400">
                            {insight.tipo}
                          </span>
                        </div>
                        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm leading-snug mb-1">
                          {insight.titulo}
                        </h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {insight.descricao}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Lightbulb}
              title="Nenhum insight ainda"
              description="Execute pesquisas para descobrir padrões e tendências"
            />
          )}
          </Card>
        </AnimatedCard>

        {/* Estado Vazio Global */}
        {dashboard?.totalPesquisas === 0 && (
          <AnimatedCard delay={100}>
            <Card className="p-8 sm:p-12 mt-6">
              <div className="text-center max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 mb-5">
                  <Activity className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                  Comece a analisar
                </h3>
                <p className="text-zinc-500 mb-6">
                  Execute sua primeira pesquisa eleitoral para visualizar métricas,
                  gráficos e insights automatizados.
                </p>
                <a
                  href="/entrevistas/nova"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-sm hover:shadow-md"
                >
                  Criar Pesquisa
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </Card>
          </AnimatedCard>
        )}

      </div>
    </div>
  );
}
