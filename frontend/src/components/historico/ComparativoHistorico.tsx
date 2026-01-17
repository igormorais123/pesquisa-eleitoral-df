'use client';

/**
 * Comparativo Histórico
 *
 * Componente para visualizar a evolução temporal dos resultados eleitorais.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  ComparativoHistorico as ComparativoHistoricoType,
  SerieHistorica,
  EventoRelevante,
  PontoHistorico,
} from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  History,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Flag,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { toast } from 'sonner';

// Cores para candidatos
const CORES_CANDIDATOS = [
  '#3B82F6', // Azul
  '#EF4444', // Vermelho
  '#10B981', // Verde
  '#F59E0B', // Amarelo
  '#8B5CF6', // Roxo
  '#EC4899', // Rosa
  '#06B6D4', // Ciano
  '#F97316', // Laranja
];

// Gerar dados simulados
const gerarDadosSimulados = (): ComparativoHistoricoType => {
  const candidatos = [
    { id: '1', nome: 'Celina Leão', partido: 'PP', cor: '#3B82F6' },
    { id: '2', nome: 'Izalci Lucas', partido: 'PL', cor: '#EF4444' },
    { id: '3', nome: 'Flávia Arruda', partido: 'PSD', cor: '#10B981' },
    { id: '4', nome: 'José Roberto', partido: 'PSB', cor: '#F59E0B' },
  ];

  // Gerar datas dos últimos 6 meses
  const datas: string[] = [];
  const hoje = new Date();
  for (let i = 6; i >= 0; i--) {
    const data = new Date(hoje);
    data.setMonth(data.getMonth() - i);
    datas.push(data.toISOString().split('T')[0]);
  }

  // Gerar séries
  const series: SerieHistorica[] = candidatos.map((cand, index) => {
    const baseValue = 20 + Math.random() * 15;
    const trend = (Math.random() - 0.5) * 2; // -1 a 1

    const pontos: PontoHistorico[] = datas.map((data, i) => ({
      data,
      valor: Math.max(5, Math.min(45, baseValue + trend * i + (Math.random() - 0.5) * 5)),
      margem_erro: 2 + Math.random() * 1,
      amostra: 800 + Math.floor(Math.random() * 400),
      fonte: ['Instituto A', 'Instituto B', 'Instituto C'][Math.floor(Math.random() * 3)],
    }));

    return {
      candidato_id: cand.id,
      candidato_nome: cand.nome,
      partido: cand.partido,
      cor: cand.cor,
      pontos,
    };
  });

  // Eventos relevantes
  const eventos: EventoRelevante[] = [
    {
      data: datas[1],
      titulo: 'Início das pré-candidaturas',
      descricao: 'Partidos começam a definir candidatos',
      impacto: 'neutro',
    },
    {
      data: datas[3],
      titulo: 'Debate em TV local',
      descricao: 'Primeiro debate entre pré-candidatos',
      impacto: 'positivo',
      candidatos_afetados: ['1', '2'],
    },
    {
      data: datas[4],
      titulo: 'Denúncia de irregularidades',
      descricao: 'Candidato envolvido em escândalo',
      impacto: 'negativo',
      candidatos_afetados: ['3'],
    },
    {
      data: datas[5],
      titulo: 'Aliança partidária anunciada',
      descricao: 'Coligação formada entre partidos',
      impacto: 'positivo',
      candidatos_afetados: ['1'],
    },
  ];

  // Calcular tendências
  const tendencias: { candidato_id: string; tendencia: 'subindo' | 'estavel' | 'descendo'; variacao_periodo: number; }[] = series.map((serie) => {
    const primeiro = serie.pontos[0].valor;
    const ultimo = serie.pontos[serie.pontos.length - 1].valor;
    const variacao = ultimo - primeiro;

    return {
      candidato_id: serie.candidato_id,
      tendencia: (variacao > 2 ? 'subindo' : variacao < -2 ? 'descendo' : 'estavel') as 'subindo' | 'estavel' | 'descendo',
      variacao_periodo: variacao,
    };
  });

  return {
    periodo_inicio: datas[0],
    periodo_fim: datas[datas.length - 1],
    tipo: 'intencao_voto',
    series,
    eventos,
    tendencias,
    insights: [
      'Celina Leão mantém liderança com tendência de alta nas últimas semanas.',
      'Izalci Lucas apresenta recuperação após queda no início do período.',
      'O debate televisivo impactou positivamente os dois líderes.',
      'Flávia Arruda perdeu pontos após escândalo, mas está se recuperando.',
      'Indecisos ainda representam parcela significativa do eleitorado.',
    ],
  };
};

interface ComparativoHistoricoProps {
  dadosIniciais?: ComparativoHistoricoType;
  onAtualizar?: () => void;
}

export function ComparativoHistorico({
  dadosIniciais,
  onAtualizar,
}: ComparativoHistoricoProps) {
  const [dados, setDados] = useState<ComparativoHistoricoType | null>(dadosIniciais || null);
  const [carregando, setCarregando] = useState(!dadosIniciais);
  const [tipoGrafico, setTipoGrafico] = useState<'linha' | 'area'>('linha');
  const [mostrarMargemErro, setMostrarMargemErro] = useState(false);
  const [mostrarEventos, setMostrarEventos] = useState(true);
  const [candidatosVisiveis, setCandidatosVisiveis] = useState<string[]>([]);

  // Carregar dados simulados
  useEffect(() => {
    if (!dadosIniciais) {
      setCarregando(true);
      setTimeout(() => {
        const dadosGerados = gerarDadosSimulados();
        setDados(dadosGerados);
        setCandidatosVisiveis(dadosGerados.series.map((s) => s.candidato_id));
        setCarregando(false);
      }, 500);
    } else {
      setCandidatosVisiveis(dadosIniciais.series.map((s) => s.candidato_id));
    }
  }, [dadosIniciais]);

  // Atualizar dados
  const atualizarDados = () => {
    setCarregando(true);
    setTimeout(() => {
      const dadosGerados = gerarDadosSimulados();
      setDados(dadosGerados);
      setCandidatosVisiveis(dadosGerados.series.map((s) => s.candidato_id));
      setCarregando(false);
      toast.success('Dados atualizados!');
    }, 500);
  };

  // Toggle candidato
  const toggleCandidato = (candidatoId: string) => {
    setCandidatosVisiveis((prev) =>
      prev.includes(candidatoId)
        ? prev.filter((id) => id !== candidatoId)
        : [...prev, candidatoId]
    );
  };

  // Preparar dados para gráfico
  const dadosGrafico = useMemo(() => {
    if (!dados) return [];

    const todasDatas = dados.series[0]?.pontos.map((p) => p.data) || [];

    return todasDatas.map((data) => {
      const ponto: any = {
        data,
        dataFormatada: new Date(data).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
        }),
      };

      dados.series.forEach((serie) => {
        const pontoSerie = serie.pontos.find((p) => p.data === data);
        if (pontoSerie) {
          ponto[serie.candidato_nome] = pontoSerie.valor;
          ponto[`${serie.candidato_nome}_erro`] = pontoSerie.margem_erro;
        }
      });

      // Adicionar eventos
      const evento = dados.eventos.find((e) => e.data === data);
      if (evento) {
        ponto.evento = evento;
      }

      return ponto;
    });
  }, [dados]);

  // Obter ícone de tendência
  const getIconeTendencia = (tendencia: 'subindo' | 'estavel' | 'descendo') => {
    switch (tendencia) {
      case 'subindo':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'descendo':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // Obter ícone de impacto
  const getIconeImpacto = (impacto: 'positivo' | 'negativo' | 'neutro') => {
    switch (impacto) {
      case 'positivo':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'negativo':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  if (carregando) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Carregando histórico...</p>
        </CardContent>
      </Card>
    );
  }

  if (!dados) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Não foi possível carregar os dados históricos.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Comparativo Histórico
              </CardTitle>
              <CardDescription>
                Evolução da intenção de voto de{' '}
                {new Date(dados.periodo_inicio).toLocaleDateString('pt-BR')} a{' '}
                {new Date(dados.periodo_fim).toLocaleDateString('pt-BR')}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={atualizarDados}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            {/* Tipo de Gráfico */}
            <div className="space-y-1">
              <Label className="text-xs">Tipo de Gráfico</Label>
              <Select value={tipoGrafico} onValueChange={(v) => setTipoGrafico(v as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linha">Linha</SelectItem>
                  <SelectItem value="area">Área</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Opções */}
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="margem-erro"
                  checked={mostrarMargemErro}
                  onCheckedChange={setMostrarMargemErro}
                />
                <Label htmlFor="margem-erro" className="text-sm">
                  Margem de erro
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="eventos"
                  checked={mostrarEventos}
                  onCheckedChange={setMostrarEventos}
                />
                <Label htmlFor="eventos" className="text-sm">
                  Eventos
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Tendência */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dados.series.map((serie) => {
          const tendencia = dados.tendencias.find((t) => t.candidato_id === serie.candidato_id);
          const ultimoValor = serie.pontos[serie.pontos.length - 1]?.valor || 0;
          const visivel = candidatosVisiveis.includes(serie.candidato_id);

          return (
            <Card
              key={serie.candidato_id}
              className={`cursor-pointer transition-all ${
                visivel ? 'ring-2' : 'opacity-50'
              }`}
              style={{ borderLeftColor: serie.cor, borderLeftWidth: '4px' }}
              onClick={() => toggleCandidato(serie.candidato_id)}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: serie.cor }}
                    />
                    <span className="font-medium text-sm">{serie.candidato_nome}</span>
                  </div>
                  {visivel ? (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold">{ultimoValor.toFixed(1)}%</p>
                  <div className="flex items-center gap-1">
                    {tendencia && getIconeTendencia(tendencia.tendencia)}
                    <span
                      className={`text-sm font-medium ${
                        tendencia?.variacao_periodo && tendencia.variacao_periodo > 0
                          ? 'text-green-600'
                          : tendencia?.variacao_periodo && tendencia.variacao_periodo < 0
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {tendencia?.variacao_periodo
                        ? `${tendencia.variacao_periodo > 0 ? '+' : ''}${tendencia.variacao_periodo.toFixed(1)}%`
                        : '0%'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{serie.partido}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráfico Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolução da Intenção de Voto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {tipoGrafico === 'linha' ? (
                <LineChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dataFormatada" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 50]} tickFormatter={(v) => `${v}%`} />
                  <RechartsTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const ponto = dadosGrafico.find((d) => d.dataFormatada === label);
                        return (
                          <div className="bg-white border rounded-lg shadow-lg p-3 max-w-xs">
                            <p className="font-medium mb-2">{label}</p>
                            {payload.map((entry: any, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span>{entry.name}:</span>
                                <span className="font-medium">{entry.value.toFixed(1)}%</span>
                              </div>
                            ))}
                            {ponto?.evento && (
                              <div className="mt-2 pt-2 border-t">
                                <div className="flex items-center gap-1 text-xs">
                                  <Flag className="h-3 w-3" />
                                  <span className="font-medium">{ponto.evento.titulo}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  {dados.series
                    .filter((s) => candidatosVisiveis.includes(s.candidato_id))
                    .map((serie) => (
                      <Line
                        key={serie.candidato_id}
                        type="monotone"
                        dataKey={serie.candidato_nome}
                        stroke={serie.cor}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  {mostrarEventos &&
                    dados.eventos.map((evento, index) => {
                      const pontoIndex = dadosGrafico.findIndex((d) => d.data === evento.data);
                      if (pontoIndex >= 0) {
                        return (
                          <ReferenceLine
                            key={index}
                            x={dadosGrafico[pontoIndex].dataFormatada}
                            stroke={
                              evento.impacto === 'positivo'
                                ? '#10B981'
                                : evento.impacto === 'negativo'
                                ? '#EF4444'
                                : '#6B7280'
                            }
                            strokeDasharray="3 3"
                          />
                        );
                      }
                      return null;
                    })}
                </LineChart>
              ) : (
                <AreaChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dataFormatada" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 50]} tickFormatter={(v) => `${v}%`} />
                  <RechartsTooltip />
                  <Legend />
                  {dados.series
                    .filter((s) => candidatosVisiveis.includes(s.candidato_id))
                    .map((serie) => (
                      <Area
                        key={serie.candidato_id}
                        type="monotone"
                        dataKey={serie.candidato_nome}
                        stroke={serie.cor}
                        fill={serie.cor}
                        fillOpacity={0.3}
                      />
                    ))}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Eventos e Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Timeline de Eventos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Eventos Relevantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-4">
                {dados.eventos.map((evento, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      {getIconeImpacto(evento.impacto)}
                      {index < dados.eventos.length - 1 && (
                        <div className="w-px h-full bg-border mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{evento.titulo}</span>
                        <Badge
                          variant={
                            evento.impacto === 'positivo'
                              ? 'default'
                              : evento.impacto === 'negativo'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {evento.impacto}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{evento.descricao}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(evento.data).toLocaleDateString('pt-BR')}
                      </p>
                      {evento.candidatos_afetados && evento.candidatos_afetados.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {evento.candidatos_afetados.map((candId) => {
                            const cand = dados.series.find((s) => s.candidato_id === candId);
                            return cand ? (
                              <Badge key={candId} variant="outline" className="text-xs">
                                {cand.candidato_nome}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <ul className="space-y-3">
                {dados.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
