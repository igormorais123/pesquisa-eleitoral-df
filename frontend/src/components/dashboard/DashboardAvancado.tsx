'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  BarChart3,
  PieChart,
  Map,
  TrendingUp,
  Users,
  AlertTriangle,
  Filter,
  Download,
  RefreshCw,
  Loader2,
  ChevronDown,
  CheckCircle,
  X,
  FileText,
  Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { MapaCalorDF, type DadoRegiao } from '@/components/charts/MapaCalorDF';
import { GraficoTendenciaTemporal, type SerieTemporal } from '@/components/charts/GraficoTendenciaTemporal';
import { AlertasProativos, gerarAlertasAutomaticos, type Alerta } from '@/components/alertas/AlertasProativos';
import { baixarRelatorioPDF, type DadosRelatorio } from '@/lib/gerador-pdf';

// ============================================
// TIPOS
// ============================================

export interface FiltrosDashboard {
  regiao?: string;
  orientacao?: string;
  faixaEtaria?: string;
  genero?: string;
  escolaridade?: string;
  periodoInicio?: Date;
  periodoFim?: Date;
}

export interface DadosDashboard {
  // Métricas principais
  totalEntrevistas: number;
  taxaResposta: number;
  margemErro: number;
  confianca: number;

  // Intenção de voto
  intencaoVoto: {
    candidato: string;
    percentual: number;
    variacao?: number;
    cor?: string;
  }[];

  // Dados por região
  dadosRegionais: DadoRegiao[];

  // Séries temporais
  seriesTemporais: SerieTemporal[];

  // Segmentos
  segmentos: {
    nome: string;
    tamanho: number;
    percentual: number;
    candidatoLider: string;
  }[];

  // Temas
  temas: {
    tema: string;
    frequencia: number;
    sentimento: 'positivo' | 'neutro' | 'negativo';
  }[];

  // Opções de filtro
  opcoesRegiao: string[];
  opcoesOrientacao: string[];
  opcoesFaixaEtaria: string[];
  opcoesGenero: string[];
  opcoesEscolaridade: string[];
}

interface DashboardAvancadoProps {
  dados: DadosDashboard;
  titulo?: string;
  onFiltrar?: (filtros: FiltrosDashboard) => void;
  onAtualizar?: () => void;
  carregando?: boolean;
  className?: string;
}

// ============================================
// CORES
// ============================================

const CORES_CANDIDATOS = [
  '#2563eb', '#dc2626', '#16a34a', '#9333ea',
  '#ea580c', '#0891b2', '#c026d3', '#65a30d'
];

const CORES_SENTIMENTO = {
  positivo: '#22c55e',
  neutro: '#94a3b8',
  negativo: '#ef4444'
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function DashboardAvancado({
  dados,
  titulo = 'Dashboard de Análise Eleitoral',
  onFiltrar,
  onAtualizar,
  carregando = false,
  className
}: DashboardAvancadoProps) {
  // Estados
  const [filtros, setFiltros] = useState<FiltrosDashboard>({});
  const [abaAtiva, setAbaAtiva] = useState('visao-geral');
  const [painelFiltros, setPainelFiltros] = useState(false);
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  // Gerar alertas automaticamente
  useMemo(() => {
    const alertasGerados = gerarAlertasAutomaticos({
      predicoes: dados.intencaoVoto.map(iv => ({
        candidato: iv.candidato,
        percentual: iv.percentual,
        tendencia: iv.variacao && iv.variacao > 0 ? 'subindo' : iv.variacao && iv.variacao < 0 ? 'caindo' : 'estavel',
        volatilidade: Math.abs(iv.variacao || 0) * 2
      })),
      clusters: dados.segmentos,
      nivelPolarizacao: 65
    });
    setAlertas(alertasGerados);
  }, [dados]);

  // Handler para atualizar filtros
  const handleFiltroChange = useCallback((campo: keyof FiltrosDashboard, valor: string | Date | undefined) => {
    const novosFiltros = { ...filtros, [campo]: valor };
    setFiltros(novosFiltros);
    onFiltrar?.(novosFiltros);
  }, [filtros, onFiltrar]);

  // Limpar filtros
  const limparFiltros = useCallback(() => {
    setFiltros({});
    onFiltrar?.({});
  }, [onFiltrar]);

  // Contagem de filtros ativos
  const filtrosAtivos = useMemo(() => {
    return Object.values(filtros).filter(v => v !== undefined && v !== '').length;
  }, [filtros]);

  // Dados para o gráfico de pizza
  const dadosPizza = useMemo(() => {
    return dados.intencaoVoto.map((iv, i) => ({
      name: iv.candidato,
      value: iv.percentual,
      fill: iv.cor || CORES_CANDIDATOS[i % CORES_CANDIDATOS.length]
    }));
  }, [dados.intencaoVoto]);

  // Dados para o gráfico de temas
  const dadosTemas = useMemo(() => {
    return dados.temas.slice(0, 8).map(t => ({
      tema: t.tema,
      frequencia: t.frequencia,
      fill: CORES_SENTIMENTO[t.sentimento]
    }));
  }, [dados.temas]);

  // Gerar relatório PDF
  const handleExportarPDF = useCallback(() => {
    const dadosRelatorio: DadosRelatorio = {
      titulo: titulo,
      subtitulo: 'Relatório de Pesquisa Eleitoral',
      dataGeracao: new Date(),
      organizacao: 'Sistema de Pesquisa Eleitoral DF',
      resumoExecutivo: {
        conclusaoPrincipal: `${dados.intencaoVoto[0]?.candidato || 'Candidato'} lidera com ${dados.intencaoVoto[0]?.percentual.toFixed(1)}%`,
        pontoChave1: `Total de ${dados.totalEntrevistas} entrevistas realizadas`,
        pontoChave2: `Margem de erro de ±${dados.margemErro}%`,
        pontoChave3: `${dados.segmentos.length} segmentos identificados`
      },
      metricas: {
        totalEntrevistas: dados.totalEntrevistas,
        margemErro: dados.margemErro,
        confianca: dados.confianca,
        dataInicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        dataFim: new Date()
      },
      intencaoVoto: dados.intencaoVoto,
      analiseSegmentos: dados.segmentos.map(s => ({
        segmento: s.nome,
        candidatoLider: s.candidatoLider,
        percentual: s.percentual
      })),
      temasDiscurso: dados.temas,
      analiseRegional: dados.dadosRegionais.map(r => ({
        regiao: r.nome || r.regiao,
        candidatoLider: dados.intencaoVoto[0]?.candidato || '',
        percentual: r.valor,
        variacao: r.variacao ?? 0
      })),
      conclusoes: [
        'Pesquisa indica cenário competitivo entre os principais candidatos',
        'Existem oportunidades em segmentos específicos para crescimento',
        'Temas econômicos dominam as preocupações do eleitorado'
      ],
      recomendacoes: [
        'Focar comunicação nos segmentos mais voláteis',
        'Desenvolver propostas para temas de maior preocupação',
        'Monitorar evolução nas regiões de maior competitividade'
      ]
    };

    baixarRelatorioPDF(dadosRelatorio);
  }, [dados, titulo]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{titulo}</h1>
          <p className="text-muted-foreground">
            {dados.totalEntrevistas} entrevistas • Margem de erro ±{dados.margemErro}%
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão de filtros */}
          <Button
            variant={filtrosAtivos > 0 ? 'default' : 'outline'}
            onClick={() => setPainelFiltros(!painelFiltros)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {filtrosAtivos > 0 && (
              <Badge variant="secondary" className="ml-1">
                {filtrosAtivos}
              </Badge>
            )}
          </Button>

          {/* Atualizar */}
          <Button
            variant="outline"
            onClick={onAtualizar}
            disabled={carregando}
            className="gap-2"
          >
            {carregando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Atualizar
          </Button>

          {/* Exportar PDF */}
          <Button
            variant="outline"
            onClick={handleExportarPDF}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Painel de Filtros */}
      {painelFiltros && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Filtros</CardTitle>
              {filtrosAtivos > 0 && (
                <Button variant="ghost" size="sm" onClick={limparFiltros}>
                  <X className="w-4 h-4 mr-1" />
                  Limpar todos
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Região */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Região</label>
                <select
                  value={filtros.regiao || ''}
                  onChange={(e) => handleFiltroChange('regiao', e.target.value || undefined)}
                  className="w-full mt-1 p-2 border rounded-md bg-background"
                >
                  <option value="">Todas</option>
                  {dados.opcoesRegiao.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Orientação */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Orientação</label>
                <select
                  value={filtros.orientacao || ''}
                  onChange={(e) => handleFiltroChange('orientacao', e.target.value || undefined)}
                  className="w-full mt-1 p-2 border rounded-md bg-background"
                >
                  <option value="">Todas</option>
                  {dados.opcoesOrientacao.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              {/* Faixa Etária */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Faixa Etária</label>
                <select
                  value={filtros.faixaEtaria || ''}
                  onChange={(e) => handleFiltroChange('faixaEtaria', e.target.value || undefined)}
                  className="w-full mt-1 p-2 border rounded-md bg-background"
                >
                  <option value="">Todas</option>
                  {dados.opcoesFaixaEtaria.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Gênero */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Gênero</label>
                <select
                  value={filtros.genero || ''}
                  onChange={(e) => handleFiltroChange('genero', e.target.value || undefined)}
                  className="w-full mt-1 p-2 border rounded-md bg-background"
                >
                  <option value="">Todos</option>
                  {dados.opcoesGenero.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Escolaridade */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Escolaridade</label>
                <select
                  value={filtros.escolaridade || ''}
                  onChange={(e) => handleFiltroChange('escolaridade', e.target.value || undefined)}
                  className="w-full mt-1 p-2 border rounded-md bg-background"
                >
                  <option value="">Todas</option>
                  {dados.opcoesEscolaridade.map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Líder</p>
                <p className="text-2xl font-bold">{dados.intencaoVoto[0]?.candidato || '-'}</p>
                <p className="text-sm text-primary font-medium">
                  {dados.intencaoVoto[0]?.percentual.toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Resposta</p>
                <p className="text-2xl font-bold">{dados.taxaResposta.toFixed(1)}%</p>
                <p className="text-sm text-green-600">
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  Dentro do esperado
                </p>
              </div>
              <Users className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Margem de Erro</p>
                <p className="text-2xl font-bold">±{dados.margemErro}%</p>
                <p className="text-sm text-muted-foreground">
                  {dados.confianca}% confiança
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas</p>
                <p className="text-2xl font-bold">{alertas.filter(a => !a.lido).length}</p>
                <p className="text-sm text-orange-600">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  Pendentes
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Abas de Conteúdo */}
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="visao-geral" className="gap-2">
            <PieChart className="w-4 h-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="mapa" className="gap-2">
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Mapa</span>
          </TabsTrigger>
          <TabsTrigger value="tendencias" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Tendências</span>
          </TabsTrigger>
          <TabsTrigger value="segmentos" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Segmentos</span>
          </TabsTrigger>
          <TabsTrigger value="alertas" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Alertas</span>
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="visao-geral" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Pizza - Intenção de Voto */}
            <Card>
              <CardHeader>
                <CardTitle>Intenção de Voto</CardTitle>
                <CardDescription>Distribuição atual entre candidatos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={dadosPizza}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    >
                      {dadosPizza.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Barras - Temas */}
            <Card>
              <CardHeader>
                <CardTitle>Principais Temas</CardTitle>
                <CardDescription>Frequência de menção nas respostas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosTemas} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="tema" width={100} />
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                    <Bar dataKey="frequencia" name="Frequência">
                      {dadosTemas.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Candidatos */}
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Candidatos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dados.intencaoVoto.map((iv, i) => (
                  <div key={iv.candidato} className="flex items-center gap-4">
                    <span className="font-bold text-lg text-muted-foreground w-8">
                      {i + 1}º
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{iv.candidato}</span>
                        <span className="font-bold">{iv.percentual.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${iv.percentual}%`,
                            backgroundColor: iv.cor || CORES_CANDIDATOS[i % CORES_CANDIDATOS.length]
                          }}
                        />
                      </div>
                    </div>
                    {iv.variacao !== undefined && (
                      <Badge
                        variant="outline"
                        className={cn(
                          iv.variacao > 0 ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'
                        )}
                      >
                        {iv.variacao > 0 ? '+' : ''}{iv.variacao.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mapa */}
        <TabsContent value="mapa">
          <Card>
            <CardHeader>
              <CardTitle>Análise Regional</CardTitle>
              <CardDescription>Performance por região administrativa do DF</CardDescription>
            </CardHeader>
            <CardContent>
              <MapaCalorDF
                dados={dados.dadosRegionais}
                titulo=""
                escala="verde_vermelho"
                formatarValor={(v) => `${v.toFixed(1)}%`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tendências */}
        <TabsContent value="tendencias">
          {dados.seriesTemporais.length > 0 ? (
            <GraficoTendenciaTemporal
              series={dados.seriesTemporais}
              titulo="Evolução da Intenção de Voto"
              subtitulo="Últimas semanas de pesquisa"
              mostrarPrevisao={true}
              mostrarIntervaloConfianca={true}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Dados temporais não disponíveis</p>
                <p className="text-sm">Execute mais rodadas de pesquisa para visualizar tendências</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Segmentos */}
        <TabsContent value="segmentos">
          <Card>
            <CardHeader>
              <CardTitle>Segmentação do Eleitorado</CardTitle>
              <CardDescription>Clusters identificados por análise de K-means</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dados.segmentos.map((seg, i) => (
                  <Card key={seg.nome} className="border-l-4" style={{ borderLeftColor: CORES_CANDIDATOS[i % CORES_CANDIDATOS.length] }}>
                    <CardContent className="pt-4">
                      <h4 className="font-semibold text-foreground">{seg.nome}</h4>
                      <p className="text-2xl font-bold text-primary">{seg.percentual.toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">{seg.tamanho} eleitores</p>
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs text-muted-foreground">Líder no segmento:</p>
                        <p className="font-medium">{seg.candidatoLider}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alertas */}
        <TabsContent value="alertas">
          <AlertasProativos
            alertas={alertas}
            onMarcarLido={(id) => {
              setAlertas(prev => prev.map(a => a.id === id ? { ...a, lido: true } : a));
            }}
            onDismiss={(id) => {
              setAlertas(prev => prev.filter(a => a.id !== id));
            }}
            onMarcarTodosLidos={() => {
              setAlertas(prev => prev.map(a => ({ ...a, lido: true })));
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DashboardAvancado;
