'use client';

/**
 * Página de Analytics Global
 * Análises visuais das pesquisas realizadas (dados locais do Dexie)
 * Pesquisa Eleitoral DF 2026
 */

import { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  MessageSquare,
  Lightbulb,
  RefreshCcw,
  Database,
  Cpu,
  Zap,
  PieChart as PieChartIcon,
  Target,
  MapPin,
  Calendar,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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
// CORES
// ============================================

const CORES = {
  primaria: '#8b5cf6',
  positivo: '#22c55e',
  negativo: '#ef4444',
  neutro: '#6b7280',
  alerta: '#f59e0b',
  info: '#3b82f6',
  roxo: '#a855f7',
  cyan: '#06b6d4',
};

const CORES_GRAFICO = [CORES.primaria, CORES.positivo, CORES.alerta, CORES.info, CORES.roxo, CORES.cyan, CORES.negativo];

// ============================================
// COMPONENTES
// ============================================

function CardMetrica({
  titulo,
  valor,
  subtitulo,
  icone: Icone,
  cor,
}: {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icone: React.ElementType;
  cor: string;
}) {
  return (
    <div className={cn('rounded-xl p-5 border', cor)}>
      <Icone className="w-6 h-6 mb-3" />
      <p className="text-2xl font-bold">{valor}</p>
      <p className="text-sm opacity-80">{titulo}</p>
      {subtitulo && <p className="text-xs opacity-60 mt-1">{subtitulo}</p>}
    </div>
  );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================

export default function AnalyticsPage() {
  const [carregando, setCarregando] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardLocal | null>(null);
  const [segCluster, setSegCluster] = useState<SegmentacaoLocal[]>([]);
  const [segRegiao, setSegRegiao] = useState<SegmentacaoLocal[]>([]);
  const [segOrientacao, setSegOrientacao] = useState<SegmentacaoLocal[]>([]);
  const [tendencias, setTendencias] = useState<TendenciaLocal[]>([]);
  const [insights, setInsights] = useState<InsightLocal[]>([]);
  const [palavras, setPalavras] = useState<PalavraFrequente[]>([]);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const [dash, cluster, regiao, orient, tend, ins, palav] = await Promise.all([
        calcularDashboard(),
        calcularSegmentacao('cluster'),
        calcularSegmentacao('regiao'),
        calcularSegmentacao('orientacao'),
        calcularTendencias(),
        gerarInsights(),
        extrairPalavrasFrequentes(20),
      ]);

      setDashboard(dash);
      setSegCluster(cluster);
      setSegRegiao(regiao);
      setSegOrientacao(orient);
      setTendencias(tend);
      setInsights(ins);
      setPalavras(palav);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Dados para gráficos
  const dadosSentimento = dashboard ? [
    { nome: 'Positivo', valor: dashboard.sentimentos.positivo, cor: CORES.positivo },
    { nome: 'Negativo', valor: dashboard.sentimentos.negativo, cor: CORES.negativo },
    { nome: 'Neutro', valor: dashboard.sentimentos.neutro, cor: CORES.neutro },
    { nome: 'Misto', valor: dashboard.sentimentos.misto, cor: CORES.alerta },
  ].filter(d => d.valor > 0) : [];

  const dadosOrientacao = segOrientacao.slice(0, 6).map((s, i) => ({
    nome: s.nome.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    valor: s.total,
    percentual: s.percentual,
    cor: s.nome.includes('direita') ? CORES.negativo :
         s.nome.includes('esquerda') ? CORES.positivo :
         s.nome.includes('centro') ? CORES.alerta : CORES_GRAFICO[i],
  }));

  const dadosTendencia = tendencias.map(t => ({
    periodo: t.periodo,
    pesquisas: t.pesquisas,
    respostas: t.respostas,
    custo: t.custo,
  }));

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-primary" />
            Analytics Global
          </h1>
          <p className="text-muted-foreground text-sm">
            Análise completa das pesquisas realizadas
          </p>
        </div>
        <button
          onClick={carregarDados}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <CardMetrica
          titulo="Pesquisas"
          valor={dashboard?.totalPesquisas || 0}
          subtitulo={`${dashboard?.totalPesquisasConcluidas || 0} concluídas`}
          icone={Database}
          cor="bg-blue-500/10 border-blue-500/30 text-blue-400"
        />
        <CardMetrica
          titulo="Respostas"
          valor={dashboard?.totalRespostas || 0}
          subtitulo={`Média: ${(dashboard?.mediaRespostasPorPesquisa || 0).toFixed(1)}/pesquisa`}
          icone={MessageSquare}
          cor="bg-green-500/10 border-green-500/30 text-green-400"
        />
        <CardMetrica
          titulo="Eleitores"
          valor={dashboard?.totalEleitoresUnicos || 0}
          subtitulo="Participantes únicos"
          icone={Users}
          cor="bg-purple-500/10 border-purple-500/30 text-purple-400"
        />
        <CardMetrica
          titulo="Custo Total"
          valor={formatarMoeda(dashboard?.custoAtual || 0)}
          subtitulo={`Média: ${formatarMoeda(dashboard?.mediaCustoPorPesquisa || 0)}`}
          icone={DollarSign}
          cor="bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
        />
        <CardMetrica
          titulo="Tokens Entrada"
          valor={((dashboard?.tokensEntrada || 0) / 1000).toFixed(1) + 'k'}
          subtitulo="Prompts enviados"
          icone={Cpu}
          cor="bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
        />
        <CardMetrica
          titulo="Tokens Saída"
          valor={((dashboard?.tokensSaida || 0) / 1000).toFixed(1) + 'k'}
          subtitulo="Respostas geradas"
          icone={Zap}
          cor="bg-orange-500/10 border-orange-500/30 text-orange-400"
        />
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Sentimentos */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-primary" />
            Distribuição de Sentimentos
          </h3>
          {dadosSentimento.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dadosSentimento}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="valor"
                  nameKey="nome"
                  label={({ nome, valor }) => `${nome}: ${valor}`}
                >
                  {dadosSentimento.map((entry, index) => (
                    <Cell key={index} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Sem dados de sentimento disponíveis
            </div>
          )}
        </div>

        {/* Gráfico de Orientação Política */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Espectro Político
          </h3>
          {dadosOrientacao.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dadosOrientacao} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="nome" width={100} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value} (${props.payload.percentual}%)`,
                    'Total'
                  ]}
                />
                <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                  {dadosOrientacao.map((entry, index) => (
                    <Cell key={index} fill={entry.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Sem dados de orientação política
            </div>
          )}
        </div>
      </div>

      {/* Tendências Temporais */}
      {dadosTendencia.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Tendências Temporais
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dadosTendencia}>
              <XAxis dataKey="periodo" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="respostas" name="Respostas" stroke={CORES.primaria} fill={CORES.primaria} fillOpacity={0.3} />
              <Area type="monotone" dataKey="pesquisas" name="Pesquisas" stroke={CORES.positivo} fill={CORES.positivo} fillOpacity={0.3} />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Segmentações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por Região */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Por Região Administrativa
          </h3>
          {segRegiao.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {segRegiao.slice(0, 10).map((seg, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground truncate" title={seg.nome}>{seg.nome}</span>
                      <span className="text-sm text-muted-foreground">{seg.percentual}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${seg.percentual}%`, backgroundColor: CORES_GRAFICO[i % CORES_GRAFICO.length] }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">{seg.total}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              Sem dados de região
            </div>
          )}
        </div>

        {/* Por Cluster */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Por Cluster Socioeconômico
          </h3>
          {segCluster.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {segCluster.slice(0, 10).map((seg, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground truncate" title={seg.nome}>{seg.nome}</span>
                      <span className="text-sm text-muted-foreground">{seg.percentual}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${seg.percentual}%`, backgroundColor: CORES_GRAFICO[i % CORES_GRAFICO.length] }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">{seg.total}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              Sem dados de cluster
            </div>
          )}
        </div>
      </div>

      {/* Nuvem de Palavras */}
      {palavras.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Palavras Mais Frequentes
          </h3>
          <div className="flex flex-wrap gap-2">
            {palavras.map((p, i) => {
              const tamanho = Math.max(0.8, Math.min(2, p.frequencia / (palavras[0]?.frequencia || 1) * 1.5));
              return (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                  style={{ fontSize: `${tamanho}rem` }}
                  title={`${p.frequencia} ocorrências`}
                >
                  {p.palavra}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          Insights Automáticos
        </h3>
        {insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, i) => {
              const cores = {
                destaque: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
                alerta: 'bg-red-500/10 border-red-500/30 text-red-400',
                tendencia: 'bg-green-500/10 border-green-500/30 text-green-400',
                correlacao: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
                descoberta: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
              };
              return (
                <div
                  key={i}
                  className={cn('p-4 rounded-xl border', cores[insight.tipo])}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      'w-2 h-2 rounded-full',
                      insight.relevancia === 'alta' ? 'bg-red-500' :
                      insight.relevancia === 'media' ? 'bg-yellow-500' : 'bg-green-500'
                    )} />
                    <span className="text-xs uppercase opacity-70">{insight.tipo}</span>
                  </div>
                  <h4 className="font-medium text-foreground mb-1">{insight.titulo}</h4>
                  <p className="text-sm text-muted-foreground">{insight.descricao}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum insight disponível ainda.</p>
            <p className="text-sm">Execute pesquisas para gerar insights automáticos.</p>
          </div>
        )}
      </div>

      {/* Mensagem quando não há dados */}
      {dashboard?.totalPesquisas === 0 && (
        <div className="glass-card rounded-xl p-8 text-center">
          <Database className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma pesquisa encontrada</h3>
          <p className="text-muted-foreground">
            Execute pesquisas eleitorais para ver análises e insights aqui.
          </p>
        </div>
      )}
    </div>
  );
}
