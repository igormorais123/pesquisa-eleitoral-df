'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  MessageSquare,
  Lightbulb,
  Search,
  Download,
  RefreshCcw,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  Cpu,
  Zap,
} from 'lucide-react';

import {
  DashboardGlobal,
  Correlacao,
  Tendencia,
  InsightGlobal,
  obterDashboardGlobal,
  obterCorrelacoes,
  obterTendencias,
  obterInsights,
  formatarNumero,
  formatarReais,
  corRelevancia,
} from '@/services/analytics-api';

import {
  AnalyticsGlobais,
  obterAnalyticsGlobais,
  formatarTokens,
  formatarCusto,
} from '@/services/memorias-api';

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
}: {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icone: React.ElementType;
  cor?: 'blue' | 'green' | 'purple' | 'yellow' | 'red';
  variacao?: number;
}) {
  const cores = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${cores[cor]}`}>
          <Icone className="w-6 h-6" />
        </div>
        {variacao !== undefined && (
          <div
            className={`flex items-center text-sm font-medium ${
              variacao >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
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
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{titulo}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{valor}</p>
      {subtitulo && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitulo}</p>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE DE CORRELAÇÕES
// ============================================

function CorrelacoesCard({ correlacoes }: { correlacoes: Correlacao[] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-purple-500" />
        Correlações Significativas
      </h3>

      {correlacoes.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Nenhuma correlação significativa encontrada ainda. Execute mais pesquisas para gerar análises.
        </p>
      ) : (
        <div className="space-y-4">
          {correlacoes.slice(0, 5).map((corr, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border ${corRelevancia(corr.significancia)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium capitalize">
                  {corr.variavel_x.replace(/_/g, ' ')}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    corr.significancia === 'alta'
                      ? 'bg-red-100 text-red-700'
                      : corr.significancia === 'media'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {corr.significancia}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {corr.interpretacao}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>Coef: {corr.coeficiente.toFixed(3)}</span>
                <span>Amostra: {corr.amostra}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE DE TENDÊNCIAS
// ============================================

function TendenciasCard({ tendencias }: { tendencias: Tendencia[] }) {
  const ultimasTres = tendencias.slice(-3);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-500" />
        Tendências Recentes
      </h3>

      {tendencias.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Sem dados suficientes para análise de tendências.
        </p>
      ) : (
        <div className="space-y-4">
          {ultimasTres.map((t, i) => (
            <div
              key={i}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {t.periodo}
                </span>
                {t.sentimento_medio != null && (
                  <span
                    className={`text-sm font-medium ${
                      (t.sentimento_medio || 0) > 0.2
                        ? 'text-green-600'
                        : (t.sentimento_medio || 0) < -0.2
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    Sentimento: {(t.sentimento_medio || 0).toFixed(2)}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Pesquisas</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {t.pesquisas_realizadas}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Respostas</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatarNumero(t.respostas_coletadas)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Custo</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatarReais(t.custo_total)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE DE INSIGHTS
// ============================================

function InsightsCard({ insights }: { insights: InsightGlobal[] }) {
  const iconesPorTipo: Record<string, React.ElementType> = {
    descoberta: Lightbulb,
    alerta: MessageSquare,
    correlacao: BarChart3,
    tendencia: TrendingUp,
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        Insights Descobertos
      </h3>

      {insights.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Nenhum insight disponível ainda. Continue executando pesquisas para descobrir padrões.
        </p>
      ) : (
        <div className="space-y-4">
          {insights.slice(0, 4).map((insight, i) => {
            const Icone = iconesPorTipo[insight.tipo] || Lightbulb;
            return (
              <div
                key={i}
                className={`p-4 rounded-lg border ${corRelevancia(insight.relevancia)}`}
              >
                <div className="flex items-start gap-3">
                  <Icone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {insight.titulo}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {insight.descricao}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500 capitalize">
                        {insight.tipo}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        Relevância {insight.relevancia}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE DE USO DA API (MEMÓRIAS)
// ============================================

function UsoAPICard({ memorias }: { memorias: AnalyticsGlobais | null }) {
  if (!memorias) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-500" />
          Uso da API (Memórias)
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Dados de memórias não disponíveis.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Database className="w-5 h-5 text-indigo-500" />
        Uso da API (Memórias Persistidas)
      </h3>

      {/* Totais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <p className="text-sm text-indigo-600 dark:text-indigo-400">Total Memórias</p>
          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
            {formatarNumero(memorias.total_memorias)}
          </p>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400">Eleitores Únicos</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {formatarNumero(memorias.total_eleitores_unicos)}
          </p>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">Tokens Total</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {formatarTokens(memorias.tokens_acumulados)}
          </p>
        </div>
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">Custo Total</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
            {formatarCusto(memorias.custo_acumulado)}
          </p>
        </div>
      </div>

      {/* Tokens por Tipo */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-blue-500" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tokens Entrada</p>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatarTokens(memorias.tokens_entrada_acumulados)}
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-500" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tokens Saída</p>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatarTokens(memorias.tokens_saida_acumulados)}
          </p>
        </div>
      </div>

      {/* Distribuição por Modelo */}
      {Object.keys(memorias.distribuicao_modelos).length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Distribuição por Modelo
          </h4>
          <div className="space-y-2">
            {Object.entries(memorias.distribuicao_modelos).map(([modelo, total]) => {
              const custo = memorias.custo_por_modelo[modelo] || 0;
              const tokens = memorias.tokens_por_modelo[modelo] || 0;
              const isOpus = modelo.includes('opus');

              return (
                <div
                  key={modelo}
                  className={`p-3 rounded-lg ${
                    isOpus ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      isOpus ? 'text-purple-700 dark:text-purple-300' : 'text-blue-700 dark:text-blue-300'
                    }`}>
                      {isOpus ? 'Claude Opus' : 'Claude Sonnet'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {total} chamadas
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{formatarTokens(tokens)} tokens</span>
                    <span>{formatarCusto(custo)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Médias */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Custo médio por resposta:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatarCusto(memorias.custo_medio_por_resposta)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-500 dark:text-gray-400">Custo médio por eleitor:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatarCusto(memorias.custo_medio_por_eleitor)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-500 dark:text-gray-400">Tempo médio de resposta:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {memorias.tempo_resposta_medio_ms}ms
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState<DashboardGlobal | null>(null);
  const [correlacoes, setCorrelacoes] = useState<Correlacao[]>([]);
  const [tendencias, setTendencias] = useState<Tendencia[]>([]);
  const [insights, setInsights] = useState<InsightGlobal[]>([]);
  const [memorias, setMemorias] = useState<AnalyticsGlobais | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const [dashData, corrData, tendData, insData, memData] = await Promise.all([
        obterDashboardGlobal().catch(() => null),
        obterCorrelacoes().catch(() => []),
        obterTendencias('mensal', 6).catch(() => []),
        obterInsights().catch(() => []),
        obterAnalyticsGlobais(30).catch(() => null),
      ]);

      if (dashData) setDashboard(dashData);
      setCorrelacoes(corrData);
      setTendencias(tendData);
      setInsights(insData);
      setMemorias(memData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics Global
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Análises acumulativas de todas as pesquisas realizadas
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={carregarDados}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Atualizar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <CardMetrica
            titulo="Total de Pesquisas"
            valor={dashboard?.total_pesquisas || 0}
            subtitulo={`${dashboard?.total_pesquisas_concluidas || 0} concluídas`}
            icone={BarChart3}
            cor="blue"
          />
          <CardMetrica
            titulo="Respostas Coletadas"
            valor={formatarNumero(dashboard?.total_respostas || 0)}
            subtitulo={`Média: ${dashboard?.media_respostas_por_pesquisa?.toFixed(0) || 0} por pesquisa`}
            icone={MessageSquare}
            cor="green"
          />
          <CardMetrica
            titulo="Eleitores Únicos"
            valor={formatarNumero(dashboard?.total_eleitores_unicos || 0)}
            subtitulo="Participaram de pesquisas"
            icone={Users}
            cor="purple"
          />
          <CardMetrica
            titulo="Investimento Total"
            valor={formatarReais(dashboard?.custo_total_reais || 0)}
            subtitulo={`Média: ${formatarReais(dashboard?.media_custo_por_pesquisa || 0)} por pesquisa`}
            icone={DollarSign}
            cor="yellow"
          />
        </div>

        {/* Tokens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Uso de Tokens
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">Entrada</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {formatarNumero(dashboard?.tokens_entrada_total || 0)}
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-purple-600 dark:text-purple-400">Saída</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {formatarNumero(dashboard?.tokens_saida_total || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Distribuição de Sentimentos
            </h3>
            {dashboard?.sentimentos_acumulados ? (
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(dashboard.sentimentos_acumulados).map(([sent, count]) => (
                  <div
                    key={sent}
                    className={`p-3 rounded-lg ${
                      sent === 'positivo'
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : sent === 'negativo'
                        ? 'bg-red-50 dark:bg-red-900/20'
                        : 'bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    <p className="text-sm capitalize text-gray-600 dark:text-gray-300">
                      {sent}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatarNumero(count as number)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Dados de sentimento não disponíveis ainda.
              </p>
            )}
          </div>
        </div>

        {/* Grid de Análises */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CorrelacoesCard correlacoes={correlacoes} />
          <TendenciasCard tendencias={tendencias} />
        </div>

        {/* Insights */}
        <InsightsCard insights={insights} />

        {/* Uso da API / Memórias Persistidas */}
        <div className="mt-8">
          <UsoAPICard memorias={memorias} />
        </div>

        {/* Última atualização */}
        {dashboard?.atualizado_em && (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-8">
            Última atualização:{' '}
            {new Date(dashboard.atualizado_em).toLocaleString('pt-BR')}
          </p>
        )}
      </div>
    </div>
  );
}
