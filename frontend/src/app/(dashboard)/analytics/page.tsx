'use client';

/**
 * Página de Analytics Global
 * Análises visuais completas das pesquisas realizadas
 *
 * Pesquisa Eleitoral DF 2026
 */

import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  MessageSquare,
  Lightbulb,
  RefreshCcw,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Activity,
  Target,
  AlertTriangle,
  Sparkles,
  FileText,
  Cpu,
  Zap,
  Eye,
  ChevronDown,
  ChevronUp,
  Map,
  Brain,
} from 'lucide-react';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

import {
  obterAnalyticsLocal,
  formatarNumero,
  formatarMoeda,
  formatarTokens,
  type AnalyticsCompleto,
  type InsightLocal,
  type SegmentoAnalise,
  type SentimentoAnalise,
  type TendenciaLocal,
} from '@/services/analytics-local';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

// ============================================
// CORES
// ============================================

const CORES = {
  primaria: '#3b82f6',
  sucesso: '#22c55e',
  alerta: '#f59e0b',
  erro: '#ef4444',
  roxo: '#8b5cf6',
  rosa: '#ec4899',
  ciano: '#06b6d4',
  neutro: '#6b7280',
};

const CORES_SENTIMENTO = {
  positivo: '#22c55e',
  negativo: '#ef4444',
  neutro: '#6b7280',
  misto: '#f59e0b',
};

const CORES_GRAFICO = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#f97316', '#14b8a6', '#a855f7', '#0ea5e9',
];

// ============================================
// COMPONENTES DE CARDS
// ============================================

function CardMetrica({
  titulo,
  valor,
  subtitulo,
  icone: Icone,
  cor = 'blue',
  variacao,
  grande = false,
}: {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icone: React.ElementType;
  cor?: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'cyan';
  variacao?: number;
  grande?: boolean;
}) {
  const cores = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    purple: 'bg-purple-500/20 text-purple-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    red: 'bg-red-500/20 text-red-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
  };

  return (
    <div className={cn(
      'glass-card rounded-xl p-5 transition-all hover:shadow-lg',
      grande && 'col-span-2'
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', cores[cor])}>
          <Icone className="w-6 h-6" />
        </div>
        {variacao !== undefined && variacao !== 0 && (
          <div
            className={cn(
              'flex items-center text-sm font-medium px-2 py-1 rounded-full',
              variacao >= 0 ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
            )}
          >
            {variacao >= 0 ? (
              <ArrowUpRight className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDownRight className="w-4 h-4 mr-1" />
            )}
            {Math.abs(variacao).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-1">{titulo}</p>
      <p className={cn('font-bold text-foreground', grande ? 'text-4xl' : 'text-2xl')}>
        {valor}
      </p>
      {subtitulo && (
        <p className="text-xs text-muted-foreground mt-1">{subtitulo}</p>
      )}
    </div>
  );
}

// ============================================
// GRÁFICO DE PIZZA SENTIMENTOS
// ============================================

function GraficoSentimentos({ dados }: { dados: SentimentoAnalise[] }) {
  const dadosGrafico = dados.filter(d => d.total > 0);

  if (dadosGrafico.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Sem dados de sentimento disponíveis</p>
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RePieChart>
          <Pie
            data={dadosGrafico}
            dataKey="total"
            nameKey="tipo"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            label={({ tipo, percentual }) => `${tipo}: ${percentual.toFixed(0)}%`}
            labelLine={true}
          >
            {dadosGrafico.map((entry, i) => (
              <Cell
                key={`cell-${i}`}
                fill={CORES_SENTIMENTO[entry.tipo]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value} respostas`,
              name.charAt(0).toUpperCase() + name.slice(1),
            ]}
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
          />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// GRÁFICO DE BARRAS POR SEGMENTO
// ============================================

function GraficoSegmento({
  dados,
  titulo,
  mostrarSentimento = true,
}: {
  dados: SegmentoAnalise[];
  titulo: string;
  mostrarSentimento?: boolean;
}) {
  const dadosTop = dados.slice(0, 8);

  if (dadosTop.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Sem dados disponíveis</p>
      </div>
    );
  }

  if (mostrarSentimento) {
    // Barras empilhadas com sentimento
    const dadosProcessados = dadosTop.map((d) => ({
      nome: d.valor.length > 15 ? d.valor.slice(0, 15) + '...' : d.valor,
      nomeCompleto: d.valor,
      positivo: d.sentimentoPositivo,
      negativo: d.sentimentoNegativo,
      neutro: d.sentimentoNeutro,
      total: d.total,
    }));

    return (
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dadosProcessados} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9ca3af" />
            <YAxis
              dataKey="nome"
              type="category"
              width={110}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-black/90 p-3 rounded-lg border border-gray-700">
                      <p className="font-medium text-white mb-2">{data.nomeCompleto}</p>
                      <p className="text-green-400 text-sm">Positivo: {data.positivo}</p>
                      <p className="text-red-400 text-sm">Negativo: {data.negativo}</p>
                      <p className="text-gray-400 text-sm">Neutro: {data.neutro}</p>
                      <p className="text-white text-sm font-medium mt-1">Total: {data.total}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="positivo" stackId="a" fill={CORES_SENTIMENTO.positivo} name="Positivo" />
            <Bar dataKey="negativo" stackId="a" fill={CORES_SENTIMENTO.negativo} name="Negativo" />
            <Bar dataKey="neutro" stackId="a" fill={CORES_SENTIMENTO.neutro} name="Neutro" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Barras simples
  const dadosSimples = dadosTop.map((d, i) => ({
    nome: d.valor.length > 15 ? d.valor.slice(0, 15) + '...' : d.valor,
    total: d.total,
    percentual: d.percentual,
    cor: CORES_GRAFICO[i % CORES_GRAFICO.length],
  }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dadosSimples} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" stroke="#9ca3af" />
          <YAxis
            dataKey="nome"
            type="category"
            width={110}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
          />
          <Tooltip
            formatter={(value: number) => [`${value} respostas`, 'Total']}
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Bar dataKey="total" fill={CORES.primaria} radius={[0, 4, 4, 0]}>
            {dadosSimples.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={CORES_GRAFICO[i % CORES_GRAFICO.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// GRÁFICO DE TENDÊNCIAS
// ============================================

function GraficoTendencias({ dados }: { dados: TendenciaLocal[] }) {
  if (dados.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Sem dados de tendências disponíveis</p>
      </div>
    );
  }

  const dadosFormatados = dados.map((d) => ({
    ...d,
    periodoFormatado: d.periodo.replace('-', '/'),
  }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dadosFormatados}>
          <defs>
            <linearGradient id="colorRespostas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CORES.primaria} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CORES.primaria} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCusto" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CORES.alerta} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CORES.alerta} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="periodoFormatado" stroke="#9ca3af" tick={{ fontSize: 11 }} />
          <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.9)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'custo') return [formatarMoeda(value), 'Custo'];
              return [value, name.charAt(0).toUpperCase() + name.slice(1)];
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="respostas"
            stroke={CORES.primaria}
            fill="url(#colorRespostas)"
            name="Respostas"
          />
          <Line
            type="monotone"
            dataKey="pesquisas"
            stroke={CORES.sucesso}
            strokeWidth={2}
            dot={{ fill: CORES.sucesso, strokeWidth: 2 }}
            name="Pesquisas"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// TABELA DE SEGMENTAÇÃO
// ============================================

function TabelaSegmentacao({
  dados,
  titulo,
}: {
  dados: SegmentoAnalise[];
  titulo: string;
}) {
  const [expandido, setExpandido] = useState(false);
  const dadosVisiveis = expandido ? dados : dados.slice(0, 5);

  if (dados.length === 0) {
    return null;
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          {titulo}
        </h3>
        <span className="text-xs text-muted-foreground">{dados.length} segmentos</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Segmento</th>
              <th className="text-right p-3 text-xs font-medium text-muted-foreground">Total</th>
              <th className="text-right p-3 text-xs font-medium text-muted-foreground">%</th>
              <th className="text-center p-3 text-xs font-medium text-muted-foreground">Sentimento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {dadosVisiveis.map((item, i) => {
              const totalSentimento = item.sentimentoPositivo + item.sentimentoNegativo + item.sentimentoNeutro || 1;
              const pctPositivo = (item.sentimentoPositivo / totalSentimento) * 100;
              const pctNegativo = (item.sentimentoNegativo / totalSentimento) * 100;

              return (
                <tr key={i} className="hover:bg-secondary/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CORES_GRAFICO[i % CORES_GRAFICO.length] }}
                      />
                      <span className="text-sm text-foreground">{item.valor}</span>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-sm font-medium text-foreground">{item.total}</span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-sm text-muted-foreground">{item.percentual.toFixed(1)}%</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${pctPositivo}%` }}
                        />
                        <div
                          className="h-full bg-red-500"
                          style={{ width: `${pctNegativo}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground ml-1">
                        {pctPositivo.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {dados.length > 5 && (
        <button
          onClick={() => setExpandido(!expandido)}
          className="w-full p-3 text-center text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors flex items-center justify-center gap-1"
        >
          {expandido ? (
            <>
              <ChevronUp className="w-4 h-4" /> Ver menos
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" /> Ver todos ({dados.length})
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ============================================
// PAINEL DE INSIGHTS VISUAIS
// ============================================

function InsightsVisuais({ insights }: { insights: InsightLocal[] }) {
  const [expandido, setExpandido] = useState(false);
  const insightsVisiveis = expandido ? insights : insights.slice(0, 6);

  const iconesPorTipo: Record<string, typeof Lightbulb> = {
    destaque: Sparkles,
    alerta: AlertTriangle,
    tendencia: TrendingUp,
    correlacao: Activity,
    descoberta: Eye,
  };

  const coresPorTipo: Record<string, { bg: string; text: string; border: string }> = {
    destaque: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    alerta: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
    tendencia: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
    correlacao: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    descoberta: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  };

  const coresPorRelevancia: Record<string, string> = {
    alta: 'bg-red-500',
    media: 'bg-amber-500',
    baixa: 'bg-green-500',
  };

  if (insights.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">
          Execute mais pesquisas para gerar insights automáticos.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Insights de IA</h3>
            <p className="text-xs text-muted-foreground">
              {insights.length} insights descobertos automaticamente
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insightsVisiveis.map((insight, i) => {
          const Icone = iconesPorTipo[insight.tipo] || Lightbulb;
          const cores = coresPorTipo[insight.tipo] || coresPorTipo.destaque;

          return (
            <div
              key={insight.id || i}
              className={cn(
                'p-4 rounded-lg border transition-all hover:shadow-md',
                cores.bg,
                cores.border
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    cores.bg
                  )}
                >
                  <Icone className={cn('w-5 h-5', cores.text)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground text-sm">{insight.titulo}</h4>
                    <span
                      className={cn('w-2 h-2 rounded-full flex-shrink-0', coresPorRelevancia[insight.relevancia])}
                      title={`Relevância ${insight.relevancia}`}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {insight.descricao}
                  </p>
                  {insight.valor !== undefined && (
                    <div className={cn('mt-2 text-lg font-bold', cores.text)}>
                      {typeof insight.valor === 'number' ? formatarNumero(insight.valor) : insight.valor}
                    </div>
                  )}
                </div>
              </div>

              {insight.dados && Object.keys(insight.dados).length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(insight.dados).slice(0, 4).map(([chave, valor]) => (
                      <span
                        key={chave}
                        className="text-xs px-2 py-1 rounded-full bg-secondary"
                      >
                        {chave}: <strong>{valor}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {insights.length > 6 && (
        <button
          onClick={() => setExpandido(!expandido)}
          className="w-full p-3 text-center text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors flex items-center justify-center gap-1 border-t border-border"
        >
          {expandido ? (
            <>
              <ChevronUp className="w-4 h-4" /> Ver menos
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" /> Ver todos ({insights.length})
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ============================================
// GRÁFICO RADAR DE ORIENTAÇÃO POLÍTICA
// ============================================

function GraficoRadarPolitico({ dados }: { dados: SegmentoAnalise[] }) {
  const dadosRadar = dados.map((d) => ({
    orientacao: d.valor.replace('-', '\n'),
    total: d.total,
    positivo: d.sentimentoPositivo,
    negativo: d.sentimentoNegativo,
  }));

  if (dadosRadar.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Sem dados disponíveis</p>
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={dadosRadar} outerRadius="80%">
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="orientacao" tick={{ fill: '#9ca3af', fontSize: 10 }} />
          <PolarRadiusAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
          <Radar
            name="Total"
            dataKey="total"
            stroke={CORES.primaria}
            fill={CORES.primaria}
            fillOpacity={0.3}
          />
          <Radar
            name="Positivo"
            dataKey="positivo"
            stroke={CORES.sucesso}
            fill={CORES.sucesso}
            fillOpacity={0.2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.9)',
              border: 'none',
              borderRadius: '8px',
            }}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// PALAVRAS FREQUENTES (MINI WORD CLOUD)
// ============================================

function PalavrasFrequentes({ dados }: { dados: { palavra: string; contagem: number }[] }) {
  const maxContagem = Math.max(...dados.map((d) => d.contagem), 1);

  if (dados.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Sem palavras frequentes detectadas</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center p-4">
      {dados.slice(0, 20).map((item, i) => {
        const tamanho = 0.7 + (item.contagem / maxContagem) * 0.8;
        const opacidade = 0.5 + (item.contagem / maxContagem) * 0.5;

        return (
          <span
            key={item.palavra}
            className="px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-default"
            style={{
              fontSize: `${tamanho}rem`,
              opacity: opacidade,
            }}
            title={`${item.contagem} ocorrências`}
          >
            {item.palavra}
          </span>
        );
      })}
    </div>
  );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================

export default function AnalyticsPage() {
  const { usuario } = useAuthStore();

  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['analytics-local', usuario?.id],
    queryFn: () => obterAnalyticsLocal(usuario?.id),
    staleTime: 30000,
  });

  // Extrair palavras frequentes de todas as perguntas
  const palavrasFrequentes = useMemo(() => {
    if (!analytics?.porPergunta) return [];

    const todas: Record<string, number> = {};
    analytics.porPergunta.forEach((p) => {
      p.palavrasFrequentes.forEach((pf) => {
        todas[pf.palavra] = (todas[pf.palavra] || 0) + pf.contagem;
      });
    });

    return Object.entries(todas)
      .map(([palavra, contagem]) => ({ palavra, contagem }))
      .sort((a, b) => b.contagem - a.contagem)
      .slice(0, 30);
  }, [analytics?.porPergunta]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  const dashboard = analytics?.dashboard;
  const semDados = !dashboard || dashboard.totalPesquisasConcluidas === 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <PieChart className="w-7 h-7 text-primary" />
            Analytics Global
          </h1>
          <p className="text-muted-foreground mt-1">
            Análises visuais completas das pesquisas realizadas
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Atualizar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {semDados ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Nenhuma pesquisa realizada ainda
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Execute entrevistas para visualizar análises detalhadas, gráficos e insights automáticos aqui.
          </p>
          <a
            href="/entrevistas/nova"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Criar Primeira Entrevista
          </a>
        </div>
      ) : (
        <>
          {/* Cards de Métricas Principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <CardMetrica
              titulo="Pesquisas"
              valor={dashboard.totalPesquisasConcluidas}
              subtitulo="Concluídas"
              icone={BarChart3}
              cor="blue"
            />
            <CardMetrica
              titulo="Respostas"
              valor={formatarNumero(dashboard.totalRespostas)}
              subtitulo={`Média: ${dashboard.mediaRespostasPorPesquisa.toFixed(0)}/pesquisa`}
              icone={MessageSquare}
              cor="green"
            />
            <CardMetrica
              titulo="Eleitores"
              valor={formatarNumero(dashboard.totalEleitoresUnicos)}
              subtitulo="Únicos participantes"
              icone={Users}
              cor="purple"
            />
            <CardMetrica
              titulo="Custo Total"
              valor={formatarMoeda(dashboard.custoTotal)}
              subtitulo={`Média: ${formatarMoeda(dashboard.mediaCustoPorPesquisa)}`}
              icone={DollarSign}
              cor="yellow"
            />
            <CardMetrica
              titulo="Tokens Entrada"
              valor={formatarTokens(dashboard.tokensEntrada)}
              icone={Cpu}
              cor="cyan"
            />
            <CardMetrica
              titulo="Tokens Saída"
              valor={formatarTokens(dashboard.tokensSaida)}
              icone={Zap}
              cor="purple"
            />
          </div>

          {/* Gráficos Principais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentimentos */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Distribuição de Sentimentos
              </h3>
              <GraficoSentimentos dados={analytics?.sentimentos || []} />
            </div>

            {/* Tendências */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Tendências Temporais
              </h3>
              <GraficoTendencias dados={analytics?.tendencias || []} />
            </div>
          </div>

          {/* Insights de IA */}
          <InsightsVisuais insights={analytics?.insights || []} />

          {/* Análises por Segmento com Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Por Cluster */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Respostas por Classe Social
              </h3>
              <GraficoSegmento dados={analytics?.porCluster || []} titulo="Cluster" />
            </div>

            {/* Por Orientação Política */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Espectro Político
              </h3>
              <GraficoRadarPolitico dados={analytics?.porOrientacao || []} />
            </div>
          </div>

          {/* Mais Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Por Região */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Map className="w-5 h-5 text-cyan-400" />
                Respostas por Região Administrativa
              </h3>
              <GraficoSegmento
                dados={analytics?.porRegiao || []}
                titulo="Região"
                mostrarSentimento={false}
              />
            </div>

            {/* Por Gênero */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-400" />
                Respostas por Gênero
              </h3>
              <GraficoSegmento dados={analytics?.porGenero || []} titulo="Gênero" />
            </div>
          </div>

          {/* Palavras Frequentes */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Palavras Mais Frequentes nas Respostas
            </h3>
            <PalavrasFrequentes dados={palavrasFrequentes} />
          </div>

          {/* Tabelas de Segmentação Detalhadas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TabelaSegmentacao
              dados={analytics?.porReligiao || []}
              titulo="Por Religião"
            />
            <TabelaSegmentacao
              dados={analytics?.porFaixaEtaria || []}
              titulo="Por Faixa Etária"
            />
          </div>

          {/* Última atualização */}
          {dashboard?.atualizadoEm && (
            <p className="text-center text-sm text-muted-foreground">
              Última atualização:{' '}
              {new Date(dashboard.atualizadoEm).toLocaleString('pt-BR')}
            </p>
          )}
        </>
      )}
    </div>
  );
}
