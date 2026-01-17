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
  RefreshCw,
} from 'lucide-react';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import type {
  ResultadoExtracaoIA,
  ResultadoSinteseIA,
  KPISintetizado,
  AlertaSintetizado,
  RiscoSintetizado,
} from '@/lib/extrator-inteligente';

// Cores do tema
const CORES = {
  primaria: '#8b5cf6',
  positivo: '#22c55e',
  negativo: '#ef4444',
  neutro: '#6b7280',
  alerta: '#f59e0b',
  info: '#3b82f6',
};

interface DashboardConsolidadoProps {
  extracao?: ResultadoExtracaoIA | null;
  sintese?: ResultadoSinteseIA | null;
  carregando?: boolean;
  erro?: string | null;
  onRecarregar?: () => void;
}

// Componente do Scorecard Principal
function ScorecardPrincipal({ scorecard }: { scorecard: ResultadoSinteseIA['scorecard'] }) {
  const corNivel = {
    verde: 'bg-green-500/10 border-green-500/30 text-green-600',
    amarelo: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600',
    laranja: 'bg-orange-500/10 border-orange-500/30 text-orange-600',
    vermelho: 'bg-red-500/10 border-red-500/30 text-red-600',
  };

  const IconeTendencia = {
    subindo: TrendingUp,
    estavel: Minus,
    descendo: TrendingDown,
  };

  const Icone = IconeTendencia[scorecard.tendencia];

  return (
    <div className={cn('rounded-xl p-6 border-2', corNivel[scorecard.nivelAlerta])}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center border-2 border-current">
            <span className="text-2xl font-bold">{scorecard.notaGeral.toFixed(1)}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Scorecard Geral</h3>
            <div className="flex items-center gap-2 text-sm">
              <Icone className="w-4 h-4" />
              <span className="capitalize">{scorecard.tendencia}</span>
            </div>
          </div>
        </div>
        <div className={cn(
          'px-3 py-1 rounded-full text-sm font-medium uppercase',
          corNivel[scorecard.nivelAlerta]
        )}>
          {scorecard.nivelAlerta}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{scorecard.resumoUmaLinha}</p>
    </div>
  );
}

// Componente de KPI Card
function KPICard({ kpi }: { kpi: KPISintetizado }) {
  const corStatus = {
    bom: 'text-green-600 bg-green-500/10',
    atencao: 'text-yellow-600 bg-yellow-500/10',
    critico: 'text-red-600 bg-red-500/10',
  };

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{kpi.nome}</span>
        <span className={cn('px-2 py-0.5 rounded text-xs font-medium', corStatus[kpi.status])}>
          {kpi.status}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{kpi.valor}</span>
        {kpi.unidade && <span className="text-sm text-muted-foreground">{kpi.unidade}</span>}
      </div>
      {kpi.variacao !== undefined && (
        <div className="flex items-center gap-1 mt-1">
          {kpi.variacao > 0 ? (
            <ArrowUpRight className="w-4 h-4 text-green-600" />
          ) : kpi.variacao < 0 ? (
            <ArrowDownRight className="w-4 h-4 text-red-600" />
          ) : (
            <Minus className="w-4 h-4 text-gray-400" />
          )}
          <span className={cn(
            'text-sm',
            kpi.variacao > 0 ? 'text-green-600' : kpi.variacao < 0 ? 'text-red-600' : 'text-gray-400'
          )}>
            {kpi.variacao > 0 ? '+' : ''}{kpi.variacao}%
          </span>
        </div>
      )}
      {kpi.descricao && (
        <p className="text-xs text-muted-foreground mt-2">{kpi.descricao}</p>
      )}
    </div>
  );
}

// Componente de Alerta
function AlertaCard({ alerta }: { alerta: AlertaSintetizado }) {
  const estilos = {
    critico: {
      cor: 'border-red-500/50 bg-red-500/5',
      icone: AlertTriangle,
      iconeCor: 'text-red-500',
    },
    atencao: {
      cor: 'border-yellow-500/50 bg-yellow-500/5',
      icone: AlertCircle,
      iconeCor: 'text-yellow-500',
    },
    info: {
      cor: 'border-blue-500/50 bg-blue-500/5',
      icone: Info,
      iconeCor: 'text-blue-500',
    },
    sucesso: {
      cor: 'border-green-500/50 bg-green-500/5',
      icone: CheckCircle,
      iconeCor: 'text-green-500',
    },
  };

  const estilo = estilos[alerta.tipo];
  const Icone = estilo.icone;

  return (
    <div className={cn('rounded-lg border p-3 flex gap-3', estilo.cor)}>
      <Icone className={cn('w-5 h-5 flex-shrink-0 mt-0.5', estilo.iconeCor)} />
      <div className="flex-1">
        <h4 className="font-medium text-sm">{alerta.titulo}</h4>
        <p className="text-xs text-muted-foreground mt-1">{alerta.descricao}</p>
        {alerta.metrica && (
          <div className="mt-2 text-xs">
            <span className="text-muted-foreground">{alerta.metrica.nome}:</span>{' '}
            <span className="font-medium">{alerta.metrica.valor}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de Gráfico de Sentimento (Pizza)
function GraficoSentimento({ dados }: { dados: { categoria: string; percentual: number; cor: string }[] }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <h4 className="font-medium mb-4 flex items-center gap-2">
        <PieChart className="w-4 h-4 text-primary" />
        Distribuição de Sentimento
      </h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPie>
            <Pie
              data={dados}
              dataKey="percentual"
              nameKey="categoria"
              cx="50%"
              cy="50%"
              outerRadius={70}
              innerRadius={40}
              label={({ categoria, percentual }) => `${categoria}: ${percentual}%`}
              labelLine={false}
            >
              {dados.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.cor} />
              ))}
            </Pie>
            <Tooltip />
          </RechartsPie>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-2">
        {dados.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.cor }} />
            <span>{d.categoria}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente de Gráfico de Temas (Barras)
function GraficoTemas({ dados }: { dados: { tema: string; mencoes: number; sentimento: string }[] }) {
  const dadosFormatados = dados.slice(0, 5).map(d => ({
    ...d,
    cor: d.sentimento === 'positivo' ? CORES.positivo : d.sentimento === 'negativo' ? CORES.negativo : CORES.neutro,
  }));

  return (
    <div className="rounded-xl border bg-card p-4">
      <h4 className="font-medium mb-4 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" />
        Temas Principais
      </h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dadosFormatados} layout="vertical">
            <XAxis type="number" />
            <YAxis type="category" dataKey="tema" width={80} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="mencoes" radius={[0, 4, 4, 0]}>
              {dadosFormatados.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.cor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Componente de Matriz de Riscos
function MatrizRiscos({ riscos }: { riscos: RiscoSintetizado[] }) {
  const dadosRadar = riscos.slice(0, 6).map(r => ({
    fator: r.fator.length > 15 ? r.fator.substring(0, 15) + '...' : r.fator,
    score: r.score,
    probabilidade: r.probabilidade,
    impacto: r.impacto,
  }));

  return (
    <div className="rounded-xl border bg-card p-4">
      <h4 className="font-medium mb-4 flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" />
        Matriz de Riscos
      </h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={dadosRadar}>
            <PolarGrid />
            <PolarAngleAxis dataKey="fator" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              name="Score"
              dataKey="score"
              stroke={CORES.negativo}
              fill={CORES.negativo}
              fillOpacity={0.3}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 space-y-1">
        {riscos.slice(0, 3).map((r, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground truncate max-w-[150px]">{r.fator}</span>
            <span className={cn(
              'font-medium',
              r.score > 50 ? 'text-red-600' : r.score > 25 ? 'text-yellow-600' : 'text-green-600'
            )}>
              {r.score.toFixed(0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente de Conclusões
function ConclusoesRecomendacoes({ conclusoes, recomendacoes }: { conclusoes: string[]; recomendacoes: string[] }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <h4 className="font-medium mb-4 flex items-center gap-2">
        <Target className="w-4 h-4 text-primary" />
        Conclusões e Recomendações
      </h4>
      <div className="space-y-4">
        <div>
          <h5 className="text-sm font-medium text-muted-foreground mb-2">Conclusões</h5>
          <ul className="space-y-1">
            {conclusoes.slice(0, 3).map((c, i) => (
              <li key={i} className="text-sm flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="text-sm font-medium text-muted-foreground mb-2">Recomendações</h5>
          <ul className="space-y-1">
            {recomendacoes.slice(0, 3).map((r, i) => (
              <li key={i} className="text-sm flex gap-2">
                <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Dashboard Principal
export function DashboardConsolidado({
  extracao,
  sintese,
  carregando,
  erro,
  onRecarregar,
}: DashboardConsolidadoProps) {
  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Analisando dados com IA...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="w-8 h-8 text-red-500 mb-4" />
        <p className="text-red-500 mb-4">{erro}</p>
        {onRecarregar && (
          <button
            onClick={onRecarregar}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  if (!sintese && !extracao) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-center">
          Nenhum dado de análise disponível.<br />
          Execute uma análise para ver o dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scorecard Principal */}
      {sintese?.scorecard && (
        <ScorecardPrincipal scorecard={sintese.scorecard} />
      )}

      {/* KPIs */}
      {sintese?.kpis && sintese.kpis.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Indicadores Chave
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sintese.kpis.slice(0, 4).map((kpi, i) => (
              <KPICard key={i} kpi={kpi} />
            ))}
          </div>
        </div>
      )}

      {/* Alertas */}
      {sintese?.alertas && sintese.alertas.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Alertas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sintese.alertas.slice(0, 4).map((alerta, i) => (
              <AlertaCard key={i} alerta={alerta} />
            ))}
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Sentimento */}
        {(sintese?.distribuicaoSentimento || extracao?.dadosGraficos?.distribuicaoSentimento) && (
          <GraficoSentimento
            dados={(sintese?.distribuicaoSentimento || extracao?.dadosGraficos?.distribuicaoSentimento || []).map(d => ({
              categoria: d.categoria,
              percentual: 'percentual' in d ? d.percentual : ('valor' in d ? d.valor : 0),
              cor: d.cor,
            }))}
          />
        )}

        {/* Temas */}
        {(sintese?.temasPrincipais || extracao?.dadosGraficos?.topTemas) && (
          <GraficoTemas
            dados={(sintese?.temasPrincipais || []).length > 0
              ? sintese!.temasPrincipais
              : (extracao?.dadosGraficos?.topTemas || []).map(t => ({
                  tema: t.tema,
                  mencoes: t.frequencia,
                  sentimento: t.sentimento > 20 ? 'positivo' : t.sentimento < -20 ? 'negativo' : 'neutro',
                }))
            }
          />
        )}

        {/* Riscos */}
        {sintese?.riscos && sintese.riscos.length > 0 && (
          <MatrizRiscos riscos={sintese.riscos} />
        )}
      </div>

      {/* Conclusões */}
      {sintese?.conclusoes && sintese.conclusoes.length > 0 && (
        <ConclusoesRecomendacoes
          conclusoes={sintese.conclusoes}
          recomendacoes={sintese.recomendacoes || []}
        />
      )}

      {/* Resumo Executivo da Extração */}
      {extracao?.resumoExecutivo && !sintese && (
        <div className="rounded-xl border bg-card p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Resumo da Análise
          </h4>
          <p className="text-sm font-medium mb-2">{extracao.resumoExecutivo.conclusaoPrincipal}</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• {extracao.resumoExecutivo.pontoChave1}</li>
            <li>• {extracao.resumoExecutivo.pontoChave2}</li>
            <li>• {extracao.resumoExecutivo.pontoChave3}</li>
          </ul>
        </div>
      )}

      {/* Metadados */}
      <div className="text-xs text-muted-foreground text-center">
        {extracao && (
          <span>
            {extracao.totalRespostasAnalisadas} respostas analisadas |
            Confiança: {Math.round(extracao.confiancaGeral)}% |
            Tempo: {extracao.tempoProcessamentoMs}ms
          </span>
        )}
      </div>
    </div>
  );
}
