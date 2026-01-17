'use client';

/**
 * Componente de Visualização do Relatório de Inteligência
 * Transforma dados de IA em gráficos e tabelas visuais
 * Pesquisa Eleitoral DF 2026
 */

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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  Users,
  Target,
  TrendingUp,
  AlertTriangle,
  Shield,
  Zap,
  Eye,
  MessageSquare,
  BarChart3,
  PieChartIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Cores do tema
const CORES = {
  primaria: '#8b5cf6',
  positivo: '#22c55e',
  negativo: '#ef4444',
  neutro: '#6b7280',
  alerta: '#f59e0b',
  info: '#3b82f6',
  roxo: '#a855f7',
  cyan: '#06b6d4',
  rosa: '#ec4899',
  laranja: '#f97316',
};

const CORES_GRAFICO = [CORES.primaria, CORES.positivo, CORES.negativo, CORES.alerta, CORES.info, CORES.roxo, CORES.cyan, CORES.rosa];

interface PerfilPsicografico {
  segmento: string;
  percentual: number;
  caracteristicas: string[];
  gatilhosEmocionais: string[];
  mensagensEficazes: string[];
  errosEvitar: string[];
}

interface PontoRuptura {
  grupo: string;
  eventoGatilho: string;
  probabilidadeMudanca: number;
  direcaoMudanca: string;
  sinaisAlerta: string[];
}

interface VotoSilencioso {
  estimativaPercentual: number;
  perfilTipico: string;
  indicadoresIdentificacao: string[];
  estrategiasConversao: string[];
  riscos: string[];
}

interface AnaliseEstrategica {
  panoramaGeral: string;
  fortalezas: string[];
  vulnerabilidades: string[];
  oportunidades: string[];
  ameacas: string[];
}

interface AlertaInteligencia {
  tipo: 'oportunidade' | 'risco' | 'tendencia' | 'urgente';
  titulo: string;
  descricao: string;
  acaoRecomendada: string;
  prioridade: number;
}

interface RelatorioInteligenciaVisualProps {
  perfisPsicograficos?: PerfilPsicografico[];
  pontosRuptura?: PontoRuptura[];
  votoSilencioso?: VotoSilencioso;
  analiseEstrategica?: AnaliseEstrategica;
  alertasInteligencia?: AlertaInteligencia[];
  totalEntrevistados?: number;
}

export function RelatorioInteligenciaVisual({
  perfisPsicograficos = [],
  pontosRuptura = [],
  votoSilencioso,
  analiseEstrategica,
  alertasInteligencia = [],
  totalEntrevistados = 0,
}: RelatorioInteligenciaVisualProps) {
  // Dados para gráfico de perfis
  const dadosPerfis = perfisPsicograficos.map((p, i) => ({
    nome: p.segmento.length > 15 ? p.segmento.substring(0, 15) + '...' : p.segmento,
    nomeCompleto: p.segmento,
    percentual: p.percentual,
    valor: Math.round((p.percentual / 100) * totalEntrevistados),
    cor: CORES_GRAFICO[i % CORES_GRAFICO.length],
  }));

  // Dados para gráfico de pontos de ruptura
  const dadosRuptura = pontosRuptura.map((p, i) => ({
    nome: p.grupo.length > 12 ? p.grupo.substring(0, 12) + '...' : p.grupo,
    nomeCompleto: p.grupo,
    probabilidade: p.probabilidadeMudanca,
    cor: p.probabilidadeMudanca >= 70 ? CORES.negativo : p.probabilidadeMudanca >= 40 ? CORES.alerta : CORES.positivo,
  }));

  // Dados para gráfico SWOT
  const dadosSWOT = analiseEstrategica ? [
    { categoria: 'Fortalezas', valor: analiseEstrategica.fortalezas.length, fill: CORES.positivo },
    { categoria: 'Vulnerabilidades', valor: analiseEstrategica.vulnerabilidades.length, fill: CORES.negativo },
    { categoria: 'Oportunidades', valor: analiseEstrategica.oportunidades.length, fill: CORES.info },
    { categoria: 'Ameaças', valor: analiseEstrategica.ameacas.length, fill: CORES.alerta },
  ] : [];

  // Dados para radar de características
  const dadosRadarPerfis = perfisPsicograficos.slice(0, 4).map(p => ({
    perfil: p.segmento.length > 10 ? p.segmento.substring(0, 10) : p.segmento,
    caracteristicas: p.caracteristicas.length * 20,
    gatilhos: p.gatilhosEmocionais.length * 25,
    mensagens: p.mensagensEficazes.length * 20,
    erros: p.errosEvitar.length * 25,
    percentual: p.percentual,
  }));

  // Dados para gráfico de alertas por tipo
  const alertasPorTipo = alertasInteligencia.reduce((acc, a) => {
    acc[a.tipo] = (acc[a.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dadosAlertas = [
    { tipo: 'Urgente', valor: alertasPorTipo.urgente || 0, cor: CORES.negativo },
    { tipo: 'Risco', valor: alertasPorTipo.risco || 0, cor: CORES.alerta },
    { tipo: 'Oportunidade', valor: alertasPorTipo.oportunidade || 0, cor: CORES.positivo },
    { tipo: 'Tendência', valor: alertasPorTipo.tendencia || 0, cor: CORES.info },
  ].filter(d => d.valor > 0);

  // Dados para gráfico de prioridades
  const dadosPrioridades = alertasInteligencia
    .sort((a, b) => b.prioridade - a.prioridade)
    .slice(0, 6)
    .map((a, i) => ({
      titulo: a.titulo.length > 20 ? a.titulo.substring(0, 20) + '...' : a.titulo,
      prioridade: a.prioridade,
      cor: a.prioridade >= 8 ? CORES.negativo : a.prioridade >= 5 ? CORES.alerta : CORES.info,
    }));

  if (perfisPsicograficos.length === 0 && pontosRuptura.length === 0 && !votoSilencioso) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header Visual */}
      <div className="glass-card rounded-xl p-6 bg-gradient-to-r from-primary/10 to-purple-500/10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Visualizações do Relatório</h2>
            <p className="text-sm text-muted-foreground">
              Análise visual dos dados de inteligência política
            </p>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-secondary/50 rounded-lg p-4 text-center">
            <Users className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{perfisPsicograficos.length}</p>
            <p className="text-xs text-muted-foreground">Perfis Identificados</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4 text-center">
            <AlertTriangle className="w-5 h-5 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{pontosRuptura.length}</p>
            <p className="text-xs text-muted-foreground">Pontos de Ruptura</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4 text-center">
            <Eye className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{votoSilencioso?.estimativaPercentual || 0}%</p>
            <p className="text-xs text-muted-foreground">Voto Silencioso</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4 text-center">
            <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{alertasInteligencia.length}</p>
            <p className="text-xs text-muted-foreground">Alertas Ativos</p>
          </div>
        </div>
      </div>

      {/* Gráficos de Perfis Psicográficos */}
      {perfisPsicograficos.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Pizza - Distribuição de Perfis */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" />
              Distribuição de Perfis Psicográficos
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dadosPerfis}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="percentual"
                  nameKey="nome"
                  label={({ percentual }) => `${percentual}%`}
                >
                  {dadosPerfis.map((entry, index) => (
                    <Cell key={index} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value}% (${props?.payload?.nomeCompleto || name})`,
                    'Percentual',
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Barras - Tamanho dos Perfis */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Tamanho Estimado por Perfil
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dadosPerfis} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="nome" width={100} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  formatter={(value: number, name: string, props: any) => [
                    `${props?.payload?.percentual || 0}% (~${value} eleitores)`,
                    props?.payload?.nomeCompleto || name,
                  ]}
                />
                <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                  {dadosPerfis.map((entry, index) => (
                    <Cell key={index} fill={entry.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Radar de Características dos Perfis */}
      {dadosRadarPerfis.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Radar de Características dos Perfis
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={dadosRadarPerfis}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="perfil" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                <Radar name="Características" dataKey="caracteristicas" stroke={CORES.primaria} fill={CORES.primaria} fillOpacity={0.3} />
                <Radar name="Gatilhos" dataKey="gatilhos" stroke={CORES.alerta} fill={CORES.alerta} fillOpacity={0.3} />
                <Radar name="Mensagens" dataKey="mensagens" stroke={CORES.positivo} fill={CORES.positivo} fillOpacity={0.3} />
                <Legend />
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>

            {/* Tabela de Perfis */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Perfil</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">%</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">Caract.</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">Gatilhos</th>
                  </tr>
                </thead>
                <tbody>
                  {perfisPsicograficos.slice(0, 5).map((p, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CORES_GRAFICO[i % CORES_GRAFICO.length] }} />
                          <span className="text-foreground truncate max-w-[120px]" title={p.segmento}>{p.segmento}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-primary">{p.percentual}%</td>
                      <td className="py-2 px-3 text-center text-muted-foreground">{p.caracteristicas.length}</td>
                      <td className="py-2 px-3 text-center text-muted-foreground">{p.gatilhosEmocionais.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos de Pontos de Ruptura */}
      {pontosRuptura.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            Probabilidade de Mudança por Grupo
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosRuptura}>
                <XAxis dataKey="nome" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value}% de chance`,
                    props?.payload?.nomeCompleto || name,
                  ]}
                />
                <Bar dataKey="probabilidade" radius={[4, 4, 0, 0]}>
                  {dadosRuptura.map((entry, index) => (
                    <Cell key={index} fill={entry.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Lista de Pontos de Ruptura */}
            <div className="space-y-3 max-h-[220px] overflow-y-auto">
              {pontosRuptura.map((p, i) => (
                <div
                  key={i}
                  className={cn(
                    'p-3 rounded-lg border',
                    p.probabilidadeMudanca >= 70 ? 'bg-red-500/10 border-red-500/30' :
                    p.probabilidadeMudanca >= 40 ? 'bg-orange-500/10 border-orange-500/30' :
                    'bg-green-500/10 border-green-500/30'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground text-sm">{p.grupo}</span>
                    <span className={cn(
                      'text-sm font-bold',
                      p.probabilidadeMudanca >= 70 ? 'text-red-400' :
                      p.probabilidadeMudanca >= 40 ? 'text-orange-400' : 'text-green-400'
                    )}>
                      {p.probabilidadeMudanca}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.eventoGatilho}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Visualização do Voto Silencioso */}
      {votoSilencioso && (
        <div className="glass-card rounded-xl p-6 border-l-4 border-purple-500">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-400" />
            Análise do Voto Silencioso
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Indicador Principal */}
            <div className="flex flex-col items-center justify-center p-6 bg-purple-500/10 rounded-xl">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="#374151" strokeWidth="12" />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke={CORES.roxo}
                    strokeWidth="12"
                    strokeDasharray={`${(votoSilencioso.estimativaPercentual / 100) * 352} 352`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-purple-400">{votoSilencioso.estimativaPercentual}%</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">Estimativa de Voto Silencioso</p>
            </div>

            {/* Indicadores de Identificação */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Como Identificar</h4>
              {votoSilencioso.indicadoresIdentificacao.slice(0, 4).map((ind, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">{ind}</span>
                </div>
              ))}
            </div>

            {/* Estratégias de Conversão */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-green-400">Estratégias de Conversão</h4>
              {votoSilencioso.estrategiasConversao.slice(0, 4).map((est, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">{est}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Análise SWOT Visual */}
      {analiseEstrategica && dadosSWOT.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Análise SWOT Visual
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dadosSWOT} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="categoria" width={100} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                  {dadosSWOT.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Grid SWOT */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <h4 className="text-xs font-medium text-green-400 mb-2">Fortalezas ({analiseEstrategica.fortalezas.length})</h4>
                <ul className="space-y-1">
                  {analiseEstrategica.fortalezas.slice(0, 2).map((f, i) => (
                    <li key={i} className="text-xs text-muted-foreground truncate" title={f}>• {f}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <h4 className="text-xs font-medium text-red-400 mb-2">Vulnerabilidades ({analiseEstrategica.vulnerabilidades.length})</h4>
                <ul className="space-y-1">
                  {analiseEstrategica.vulnerabilidades.slice(0, 2).map((v, i) => (
                    <li key={i} className="text-xs text-muted-foreground truncate" title={v}>• {v}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <h4 className="text-xs font-medium text-blue-400 mb-2">Oportunidades ({analiseEstrategica.oportunidades.length})</h4>
                <ul className="space-y-1">
                  {analiseEstrategica.oportunidades.slice(0, 2).map((o, i) => (
                    <li key={i} className="text-xs text-muted-foreground truncate" title={o}>• {o}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <h4 className="text-xs font-medium text-orange-400 mb-2">Ameaças ({analiseEstrategica.ameacas.length})</h4>
                <ul className="space-y-1">
                  {analiseEstrategica.ameacas.slice(0, 2).map((a, i) => (
                    <li key={i} className="text-xs text-muted-foreground truncate" title={a}>• {a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos de Alertas */}
      {alertasInteligencia.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alertas por Tipo */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Alertas por Tipo
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={dadosAlertas}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="valor"
                  nameKey="tipo"
                  label={({ tipo, valor }) => `${tipo}: ${valor}`}
                >
                  {dadosAlertas.map((entry, index) => (
                    <Cell key={index} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Prioridades */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Top Alertas por Prioridade
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dadosPrioridades} layout="vertical">
                <XAxis type="number" domain={[0, 10]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis type="category" dataKey="titulo" width={120} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="prioridade" radius={[0, 4, 4, 0]}>
                  {dadosPrioridades.map((entry, index) => (
                    <Cell key={index} fill={entry.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default RelatorioInteligenciaVisual;
