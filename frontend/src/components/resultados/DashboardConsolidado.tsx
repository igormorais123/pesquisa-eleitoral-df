'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Info,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Shield,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import type { ResultadoExtracaoIA, ResultadoSinteseIA } from '@/lib/extrator-inteligente';

interface DashboardConsolidadoProps {
  extracao?: ResultadoExtracaoIA;
  sintese?: ResultadoSinteseIA;
  carregando?: boolean;
  onRefresh?: () => void;
}

// Scorecard Principal
function ScorecardExecutivo({ sintese }: { sintese: ResultadoSinteseIA }) {
  const { scorecardExecutivo } = sintese;

  const corNivel = {
    verde: 'bg-green-500',
    amarelo: 'bg-yellow-500',
    vermelho: 'bg-red-500',
  };

  const iconeTendencia = {
    subindo: <TrendingUp className="h-5 w-5 text-green-500" />,
    estavel: <Minus className="h-5 w-5 text-gray-500" />,
    caindo: <TrendingDown className="h-5 w-5 text-red-500" />,
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="text-5xl font-bold">{scorecardExecutivo.notaGeral.toFixed(1)}</div>
              <div className="absolute -top-1 -right-3">
                {iconeTendencia[scorecardExecutivo.tendencia]}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${corNivel[scorecardExecutivo.nivelAlerta]}`} />
                <span className="text-sm font-medium uppercase">
                  {scorecardExecutivo.nivelAlerta === 'verde' ? 'Situação Favorável' :
                   scorecardExecutivo.nivelAlerta === 'amarelo' ? 'Atenção Necessária' :
                   'Alerta Crítico'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Nota Geral da Pesquisa</p>
            </div>
          </div>
          <div className="text-right max-w-md">
            <p className="text-lg font-medium">{scorecardExecutivo.mensagemChave}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// KPIs Cards
function KPICards({ kpis }: { kpis: ResultadoSinteseIA['kpis'] }) {
  const icones: Record<string, React.ReactNode> = {
    'trending-up': <TrendingUp className="h-4 w-4" />,
    'trending-down': <TrendingDown className="h-4 w-4" />,
    'minus': <Minus className="h-4 w-4" />,
    'alert': <AlertTriangle className="h-4 w-4" />,
    'check': <CheckCircle className="h-4 w-4" />,
  };

  const corStatus = {
    acima: 'text-green-600 bg-green-50',
    dentro: 'text-blue-600 bg-blue-50',
    abaixo: 'text-red-600 bg-red-50',
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.slice(0, 8).map((kpi, i) => (
        <Card key={i} className="relative overflow-hidden">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase">
                {kpi.nome}
              </span>
              <Badge variant="outline" className={corStatus[kpi.status]}>
                {icones[kpi.icone] || <Target className="h-3 w-3" />}
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{kpi.valor}</span>
              <span className="text-sm text-muted-foreground">{kpi.unidade}</span>
            </div>
            {kpi.variacao !== undefined && (
              <div className={`flex items-center gap-1 text-xs mt-1 ${kpi.variacao >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.variacao >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(kpi.variacao)}%
              </div>
            )}
            {kpi.meta && (
              <Progress value={(kpi.valor / kpi.meta) * 100} className="h-1 mt-2" />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Alertas
function PainelAlertas({ alertas }: { alertas: ResultadoSinteseIA['alertas'] }) {
  const configAlerta = {
    critico: { icon: AlertCircle, cor: 'border-red-500 bg-red-50', texto: 'text-red-700' },
    atencao: { icon: AlertTriangle, cor: 'border-yellow-500 bg-yellow-50', texto: 'text-yellow-700' },
    info: { icon: Info, cor: 'border-blue-500 bg-blue-50', texto: 'text-blue-700' },
  };

  if (alertas.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alertas e Notificações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alertas.map((alerta, i) => {
          const config = configAlerta[alerta.tipo];
          const Icon = config.icon;
          return (
            <div key={i} className={`p-3 rounded-lg border-l-4 ${config.cor}`}>
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 mt-0.5 ${config.texto}`} />
                <div>
                  <p className={`font-medium ${config.texto}`}>{alerta.titulo}</p>
                  <p className="text-sm text-muted-foreground">{alerta.descricao}</p>
                  {alerta.metricaAssociada && (
                    <Badge variant="secondary" className="mt-2">
                      {alerta.metricaAssociada.nome}: {alerta.metricaAssociada.valor}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// Matriz de Risco
function MatrizRisco({ riscos }: { riscos: ResultadoSinteseIA['matrizRisco'] }) {
  const corRisco = (score: number) => {
    if (score <= 5) return '#22c55e';
    if (score <= 10) return '#eab308';
    if (score <= 15) return '#f97316';
    return '#ef4444';
  };

  const dadosRadar = riscos.map(r => ({
    fator: r.fator.substring(0, 15) + (r.fator.length > 15 ? '...' : ''),
    risco: r.scoreRisco,
    fullFator: r.fator,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Matriz de Riscos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={dadosRadar}>
                <PolarGrid />
                <PolarAngleAxis dataKey="fator" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 25]} />
                <Radar
                  name="Score de Risco"
                  dataKey="risco"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {riscos.map((risco, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">{risco.fator}</p>
                  <p className="text-xs text-muted-foreground">
                    P:{risco.probabilidade} × I:{risco.impacto}
                  </p>
                </div>
                <Badge
                  style={{ backgroundColor: corRisco(risco.scoreRisco), color: 'white' }}
                >
                  {risco.scoreRisco}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Gráfico de Sentimentos
function GraficoSentimentos({ dados }: { dados: ResultadoExtracaoIA['dadosGraficos']['distribuicaoSentimento'] }) {
  if (!dados || dados.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Distribuição de Sentimentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPie>
              <Pie
                data={dados}
                dataKey="valor"
                nameKey="categoria"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ categoria, valor }) => `${categoria}: ${valor}%`}
              >
                {dados.map((entry, i) => (
                  <Cell key={i} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPie>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Temas Principais
function GraficoTemas({ dados }: { dados: ResultadoExtracaoIA['dadosGraficos']['topTemas'] }) {
  if (!dados || dados.length === 0) return null;

  const dadosFormatados = dados.map(d => ({
    ...d,
    sentimentoNormalizado: (d.sentimento + 1) * 50, // -1 a 1 -> 0 a 100
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Temas Mais Mencionados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosFormatados} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="tema" type="category" width={100} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'sentimentoNormalizado') {
                    const sentimento = ((value as number) - 50) / 50;
                    return [sentimento.toFixed(2), 'Sentimento'];
                  }
                  return [value, name];
                }}
              />
              <Bar dataKey="frequencia" fill="#3b82f6" name="Frequência" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Conclusões e Recomendações
function PainelConclusoes({ conclusoes }: { conclusoes: ResultadoSinteseIA['conclusoes'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Conclusões e Próximos Passos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="font-semibold text-lg">{conclusoes.principal}</p>
        </div>

        {conclusoes.secundarias.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 text-sm uppercase text-muted-foreground">Pontos Adicionais</h4>
            <ul className="space-y-1">
              {conclusoes.secundarias.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {conclusoes.recomendacoes.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2 text-blue-700 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Recomendações
              </h4>
              <ul className="space-y-1">
                {conclusoes.recomendacoes.map((r, i) => (
                  <li key={i} className="text-sm text-blue-600">• {r}</li>
                ))}
              </ul>
            </div>
          )}

          {conclusoes.proximosPassos.length > 0 && (
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium mb-2 text-green-700 flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4" />
                Próximos Passos
              </h4>
              <ul className="space-y-1">
                {conclusoes.proximosPassos.map((p, i) => (
                  <li key={i} className="text-sm text-green-600">{i + 1}. {p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Insights Extraídos
function PainelInsights({ insights }: { insights: ResultadoExtracaoIA['insights'] }) {
  if (!insights || insights.length === 0) return null;

  const iconesTipo = {
    descoberta: <Zap className="h-4 w-4 text-yellow-500" />,
    alerta: <AlertTriangle className="h-4 w-4 text-red-500" />,
    oportunidade: <Target className="h-4 w-4 text-green-500" />,
    risco: <Shield className="h-4 w-4 text-orange-500" />,
    tendencia: <TrendingUp className="h-4 w-4 text-blue-500" />,
  };

  const coresTipo = {
    descoberta: 'border-yellow-200 bg-yellow-50',
    alerta: 'border-red-200 bg-red-50',
    oportunidade: 'border-green-200 bg-green-50',
    risco: 'border-orange-200 bg-orange-50',
    tendencia: 'border-blue-200 bg-blue-50',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Insights Identificados
        </CardTitle>
        <CardDescription>
          Descobertas acionáveis extraídas da análise
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {insights.map((insight, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border ${coresTipo[insight.tipo]}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {iconesTipo[insight.tipo]}
                <span className="font-medium">{insight.titulo}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {insight.relevancia}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{insight.descricao}</p>
              {insight.dadosSuporteQuantitativo.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {insight.dadosSuporteQuantitativo.map((d, j) => (
                    <Badge key={j} variant="secondary">
                      {d.metrica}: {d.valor} {d.comparacao && `(${d.comparacao})`}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs font-medium text-primary">
                → {insight.acaoSugerida}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente Principal
export function DashboardConsolidado({
  extracao,
  sintese,
  carregando = false,
  onRefresh,
}: DashboardConsolidadoProps) {
  if (carregando) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Analisando dados com IA...</p>
          <p className="text-sm text-muted-foreground">Transformando texto em indicadores visuais</p>
        </div>
      </div>
    );
  }

  if (!extracao && !sintese) {
    return (
      <Card className="p-8 text-center">
        <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum dado para exibir</h3>
        <p className="text-muted-foreground mb-4">
          Execute uma análise para ver os resultados consolidados
        </p>
        {onRefresh && (
          <Button onClick={onRefresh}>
            Executar Análise
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scorecard Executivo */}
      {sintese && <ScorecardExecutivo sintese={sintese} />}

      {/* KPIs */}
      {sintese && sintese.kpis.length > 0 && <KPICards kpis={sintese.kpis} />}

      {/* Tabs para diferentes visualizações */}
      <Tabs defaultValue="visao-geral" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="riscos">Riscos</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="conclusoes">Conclusões</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-6 mt-6">
          {/* Alertas */}
          {sintese && <PainelAlertas alertas={sintese.alertas} />}

          {/* Gráficos lado a lado */}
          <div className="grid md:grid-cols-2 gap-6">
            {extracao && <GraficoSentimentos dados={extracao.dadosGraficos.distribuicaoSentimento} />}
            {extracao && <GraficoTemas dados={extracao.dadosGraficos.topTemas} />}
          </div>

          {/* Resumo Executivo */}
          {extracao && (
            <Card>
              <CardHeader>
                <CardTitle>Resumo Executivo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="font-medium text-lg">{extracao.resumoExecutivo.conclusaoPrincipal}</p>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{extracao.resumoExecutivo.pontoChave1}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{extracao.resumoExecutivo.pontoChave2}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{extracao.resumoExecutivo.pontoChave3}</p>
                  </div>
                </div>
                {extracao.resumoExecutivo.alertaCritico && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">Alerta Crítico:</span>
                    </div>
                    <p className="text-red-600 mt-1">{extracao.resumoExecutivo.alertaCritico}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="riscos" className="mt-6">
          {sintese && sintese.matrizRisco.length > 0 ? (
            <MatrizRisco riscos={sintese.matrizRisco} />
          ) : (
            <Card className="p-8 text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum risco identificado</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          {extracao && <PainelInsights insights={extracao.insights} />}
        </TabsContent>

        <TabsContent value="conclusoes" className="mt-6">
          {sintese && <PainelConclusoes conclusoes={sintese.conclusoes} />}
        </TabsContent>
      </Tabs>

      {/* Métricas de Confiança */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Confiança da Análise: {((extracao?.confiancaGeral || 0) * 100).toFixed(0)}%
            </span>
            <span>
              Tempo de Processamento: {(extracao?.tempoProcessamentoMs || 0) / 1000}s
            </span>
            <span>
              Respostas Analisadas: {extracao?.totalRespostasAnalisadas || 0}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardConsolidado;
