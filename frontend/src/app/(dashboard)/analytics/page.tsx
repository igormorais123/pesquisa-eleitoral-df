'use client';

/**
 * Página de Analytics Global
 * Design Apple-style minimalista
 * Pesquisa Eleitoral DF 2026
 */

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  DollarSign,
  MessageSquare,
  Lightbulb,
  RefreshCw,
  Database,
  Zap,
  PieChart as PieChartIcon,
  Target,
  MapPin,
  ChevronRight,
  Activity,
  Sparkles,
  Clock,
  AlertCircle,
  BarChart3,
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

// Animações Apple-style
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } }
};

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
      'bg-card rounded-2xl',
      'border border-border',
      'transition-all duration-300',
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
    primary: 'bg-indigo-500/10',
    success: 'bg-emerald-500/10',
    warning: 'bg-amber-500/10',
    danger: 'bg-red-500/10',
    info: 'bg-blue-500/10',
    purple: 'bg-purple-500/10',
    cyan: 'bg-cyan-500/10',
  };

  const iconColors: Record<string, string> = {
    primary: 'text-indigo-500',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    danger: 'text-red-500',
    info: 'text-blue-500',
    purple: 'text-purple-500',
    cyan: 'text-cyan-500',
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2.5 rounded-xl', bgColors[color])}>
          <Icon className={cn('w-5 h-5', iconColors[color])} />
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
          )}>
            {trend === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
        {value}
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        {label}
      </p>
      {subtitle && (
        <p className="text-xs text-muted-foreground/70 mt-0.5">
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
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2.5 rounded-xl bg-blue-500/10">
        <Icon className="w-5 h-5 text-blue-500" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
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
      <div className={cn('flex-1 bg-muted rounded-full overflow-hidden', heights[size])}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground w-10 text-right">
          {percentage.toFixed(0)}%
        </span>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="p-4 rounded-2xl bg-muted mb-4">
        <Icon className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <h4 className="font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-muted rounded-lg', className)} />
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// TOOLTIP CUSTOMIZADO
// ============================================

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-foreground text-background px-3 py-2 rounded-lg shadow-xl">
      <p className="text-xs font-medium opacity-80 mb-1">{label}</p>
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
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="text-center">
          <Skeleton className="h-12 w-48 mx-auto mb-3" />
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {[...Array(6)].map((_, i) => (
            <MetricSkeleton key={i} />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (erro) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 max-w-md text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Erro ao carregar
          </h3>
          <p className="text-muted-foreground text-sm mb-4">{erro}</p>
          <button
            onClick={() => carregarDados()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="space-y-8"
    >
      {/* Hero Header - Apple Style */}
      <motion.header variants={fadeIn} className="text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
          Analytics
        </h1>
        <p className="text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
          Visão geral das pesquisas eleitorais
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          {tempoRelativo && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Atualizado {tempoRelativo}
            </span>
          )}
          <button
            onClick={() => carregarDados(true)}
            disabled={atualizando}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2.5 rounded-full',
              'bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm',
              'transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <RefreshCw className={cn('w-4 h-4', atualizando && 'animate-spin')} />
            Atualizar
          </button>
        </div>
      </motion.header>

      {/* Métricas Principais */}
      <motion.section variants={fadeIn} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
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
      </motion.section>

      {/* Grid Principal */}
      <motion.div variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

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
      </motion.div>

      {/* Tendências */}
      {dadosTendencia.length > 1 && (
        <motion.div variants={fadeIn}>
          <AnimatedCard delay={400}>
            <Card className="p-6">
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
                    formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            </Card>
          </AnimatedCard>
        </motion.div>
      )}

      {/* Segmentações */}
      <motion.div variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Por Região */}
        <AnimatedCard delay={450}>
          <Card className="p-6">
            <SectionHeader icon={MapPin} title="Por Região" subtitle="Distribuição geográfica" />
            {segRegiao.length > 0 ? (
              <div className="space-y-4">
                {segRegiao.slice(0, 6).map((seg, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground truncate pr-2">
                        {seg.nome}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
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
          <Card className="p-6">
            <SectionHeader icon={Users} title="Por Cluster" subtitle="Perfil socioeconômico" />
            {segCluster.length > 0 ? (
              <div className="space-y-4">
                {segCluster.slice(0, 6).map((seg, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground truncate pr-2">
                        {seg.nome}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
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
      </motion.div>

      {/* Palavras Frequentes */}
      {palavras.length > 0 && (
        <motion.div variants={fadeIn}>
          <AnimatedCard delay={550}>
            <Card className="p-6">
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
        </motion.div>
      )}

      {/* Insights */}
      <motion.div variants={fadeIn}>
        <AnimatedCard delay={600}>
          <Card className="p-6">
          <SectionHeader icon={Lightbulb} title="Insights" subtitle="Descobertas automáticas" />
          {insights.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.map((insight, i) => {
                const styles: Record<string, { bg: string; border: string; icon: string }> = {
                  destaque: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'text-blue-500' },
                  alerta: { bg: 'bg-red-500/10', border: 'border-red-500/20', icon: 'text-red-500' },
                  tendencia: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-500' },
                  correlacao: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: 'text-purple-500' },
                  descoberta: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: 'text-amber-500' },
                };

                const style = styles[insight.tipo] || styles.descoberta;

                return (
                  <div
                    key={i}
                    className={cn(
                      'p-4 rounded-xl border transition-all duration-200',
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
                          <span className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">
                            {insight.tipo}
                          </span>
                        </div>
                        <h4 className="font-semibold text-foreground text-sm leading-snug mb-1">
                          {insight.titulo}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
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
      </motion.div>

      {/* Estado Vazio Global */}
      {dashboard?.totalPesquisas === 0 && (
        <motion.div variants={fadeIn}>
          <Card className="p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 mb-5">
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Comece a analisar
              </h3>
              <p className="text-muted-foreground mb-6">
                Execute sua primeira pesquisa eleitoral para visualizar métricas,
                gráficos e insights automatizados.
              </p>
              <a
                href="/entrevistas/nova"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
              >
                Criar Pesquisa
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
