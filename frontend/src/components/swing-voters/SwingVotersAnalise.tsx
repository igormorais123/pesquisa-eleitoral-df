'use client';

/**
 * Análise de Swing Voters
 *
 * Componente para identificar e analisar eleitores indecisos
 * que podem ser convertidos durante a campanha.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  SwingVoter,
  PerfilSwingVoters,
  FatorInfluencia,
  PotencialConversao,
  ResultadoAnaliseSwingVoters,
  CategoriaSwingVoter,
  ClusterSocioeconomico,
  OrientacaoPolitica,
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
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Users,
  Target,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Filter,
  UserCheck,
  UserX,
  Shuffle,
  HelpCircle,
  BarChart3,
  PieChart,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart as RePieChart,
  Pie,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { toast } from 'sonner';

// Cores para categorias
const CORES_CATEGORIA: Record<CategoriaSwingVoter, string> = {
  indeciso_total: '#EF4444',
  baixa_conviccao: '#F59E0B',
  susceptivel_mudanca: '#3B82F6',
  volatil: '#8B5CF6',
};

const NOMES_CATEGORIA: Record<CategoriaSwingVoter, string> = {
  indeciso_total: 'Indeciso Total',
  baixa_conviccao: 'Baixa Convicção',
  susceptivel_mudanca: 'Susceptível a Mudança',
  volatil: 'Volátil',
};

const CORES_CLUSTER: Record<ClusterSocioeconomico, string> = {
  G1_alta: '#10B981',
  G2_media_alta: '#3B82F6',
  G3_media_baixa: '#F59E0B',
  G4_baixa: '#EF4444',
};

// Gerar dados simulados
const gerarDadosSimulados = (): ResultadoAnaliseSwingVoters => {
  const categorias: CategoriaSwingVoter[] = [
    'indeciso_total',
    'baixa_conviccao',
    'susceptivel_mudanca',
    'volatil',
  ];

  const regioes = [
    'Ceilândia', 'Taguatinga', 'Samambaia', 'Planaltina', 'Águas Claras',
    'Gama', 'Santa Maria', 'Recanto das Emas', 'Sobradinho', 'Guará',
  ];

  const clusters: ClusterSocioeconomico[] = ['G1_alta', 'G2_media_alta', 'G3_media_baixa', 'G4_baixa'];
  const orientacoes: OrientacaoPolitica[] = ['esquerda', 'centro-esquerda', 'centro', 'centro-direita', 'direita'];

  const candidatos = ['Celina Leão', 'Izalci Lucas', 'Flávia Arruda', 'José Roberto'];

  // Gerar swing voters
  const swingVoters: SwingVoter[] = Array.from({ length: 150 }, (_, i) => ({
    eleitor_id: `sv-${i + 1}`,
    eleitor_nome: `Eleitor ${i + 1}`,
    regiao_administrativa: regioes[Math.floor(Math.random() * regioes.length)],
    cluster_socioeconomico: clusters[Math.floor(Math.random() * clusters.length)],
    orientacao_politica: orientacoes[Math.floor(Math.random() * orientacoes.length)],
    idade: 18 + Math.floor(Math.random() * 62),
    genero: Math.random() > 0.5 ? 'masculino' : 'feminino',
    categoria: categorias[Math.floor(Math.random() * categorias.length)],
    score_indecisao: 40 + Math.floor(Math.random() * 60),
    candidato_inclinacao: Math.random() > 0.3 ? candidatos[Math.floor(Math.random() * candidatos.length)] : undefined,
    fatores_influencia: ['Debates', 'Propostas', 'Redes Sociais', 'Família'].slice(0, 2 + Math.floor(Math.random() * 3)),
    susceptibilidade_campanha: 30 + Math.floor(Math.random() * 70),
    principais_preocupacoes: ['Saúde', 'Segurança', 'Emprego', 'Educação', 'Transporte'].slice(0, 2 + Math.floor(Math.random() * 3)),
  }));

  // Calcular perfil
  const perfil: PerfilSwingVoters = {
    total: swingVoters.length,
    percentual_eleitorado: 15 + Math.random() * 10,
    por_categoria: categorias.map((cat) => {
      const qtd = swingVoters.filter((sv) => sv.categoria === cat).length;
      return {
        categoria: cat,
        quantidade: qtd,
        percentual: (qtd / swingVoters.length) * 100,
      };
    }),
    por_regiao: regioes.map((reg) => {
      const qtd = swingVoters.filter((sv) => sv.regiao_administrativa === reg).length;
      return {
        regiao: reg,
        quantidade: qtd,
        percentual: (qtd / swingVoters.length) * 100,
      };
    }).sort((a, b) => b.quantidade - a.quantidade),
    por_cluster: clusters.map((cluster) => {
      const qtd = swingVoters.filter((sv) => sv.cluster_socioeconomico === cluster).length;
      return {
        cluster,
        quantidade: qtd,
        percentual: (qtd / swingVoters.length) * 100,
      };
    }),
    por_orientacao: orientacoes.map((ori) => {
      const qtd = swingVoters.filter((sv) => sv.orientacao_politica === ori).length;
      return {
        orientacao: ori,
        quantidade: qtd,
        percentual: (qtd / swingVoters.length) * 100,
      };
    }),
    por_faixa_etaria: [
      { faixa: '18-24', quantidade: 0, percentual: 0 },
      { faixa: '25-34', quantidade: 0, percentual: 0 },
      { faixa: '35-44', quantidade: 0, percentual: 0 },
      { faixa: '45-59', quantidade: 0, percentual: 0 },
      { faixa: '60+', quantidade: 0, percentual: 0 },
    ].map((f) => {
      let qtd = 0;
      swingVoters.forEach((sv) => {
        if (f.faixa === '18-24' && sv.idade >= 18 && sv.idade <= 24) qtd++;
        else if (f.faixa === '25-34' && sv.idade >= 25 && sv.idade <= 34) qtd++;
        else if (f.faixa === '35-44' && sv.idade >= 35 && sv.idade <= 44) qtd++;
        else if (f.faixa === '45-59' && sv.idade >= 45 && sv.idade <= 59) qtd++;
        else if (f.faixa === '60+' && sv.idade >= 60) qtd++;
      });
      return { ...f, quantidade: qtd, percentual: (qtd / swingVoters.length) * 100 };
    }),
    media_idade: swingVoters.reduce((acc, sv) => acc + sv.idade, 0) / swingVoters.length,
    distribuicao_genero: [
      {
        genero: 'masculino' as const,
        quantidade: swingVoters.filter((sv) => sv.genero === 'masculino').length,
        percentual: 0,
      },
      {
        genero: 'feminino' as const,
        quantidade: swingVoters.filter((sv) => sv.genero === 'feminino').length,
        percentual: 0,
      },
    ].map((g) => ({ ...g, percentual: (g.quantidade / swingVoters.length) * 100 })),
  };

  // Fatores de influência
  const fatoresInfluencia: FatorInfluencia[] = [
    { fator: 'Debates Televisivos', peso: 85, descricao: 'Debates entre candidatos na TV', eleitores_afetados: 95 },
    { fator: 'Propostas de Governo', peso: 78, descricao: 'Planos e propostas apresentadas', eleitores_afetados: 112 },
    { fator: 'Redes Sociais', peso: 72, descricao: 'Conteúdo em Instagram, TikTok, etc', eleitores_afetados: 88 },
    { fator: 'Opinião de Família', peso: 65, descricao: 'Influência de familiares', eleitores_afetados: 76 },
    { fator: 'Situação Econômica', peso: 60, descricao: 'Percepção da economia pessoal', eleitores_afetados: 68 },
    { fator: 'Histórico do Candidato', peso: 55, descricao: 'Trajetória política anterior', eleitores_afetados: 62 },
    { fator: 'Propaganda Eleitoral', peso: 48, descricao: 'Horário político gratuito', eleitores_afetados: 54 },
    { fator: 'Apoios de Lideranças', peso: 42, descricao: 'Endosso de figuras públicas', eleitores_afetados: 45 },
  ];

  // Potencial de conversão
  const potencialConversao: PotencialConversao[] = [
    {
      candidato_origem: 'Indecisos',
      candidato_destino: 'Celina Leão',
      quantidade_eleitores: 45,
      percentual: 30,
      facilidade_conversao: 'moderada',
      fatores_chave: ['Gestão atual', 'Propostas sociais', 'Presença feminina'],
    },
    {
      candidato_origem: 'Indecisos',
      candidato_destino: 'Izalci Lucas',
      quantidade_eleitores: 38,
      percentual: 25.3,
      facilidade_conversao: 'moderada',
      fatores_chave: ['Experiência legislativa', 'Conservadorismo moderado'],
    },
    {
      candidato_origem: 'Flávia Arruda',
      candidato_destino: 'Celina Leão',
      quantidade_eleitores: 22,
      percentual: 14.7,
      facilidade_conversao: 'facil',
      fatores_chave: ['Mesmo espectro político', 'Transferência de votos femininos'],
    },
    {
      candidato_origem: 'José Roberto',
      candidato_destino: 'Izalci Lucas',
      quantidade_eleitores: 18,
      percentual: 12,
      facilidade_conversao: 'facil',
      fatores_chave: ['Proximidade ideológica', 'Eleitorado conservador'],
    },
  ];

  return {
    perfil,
    swing_voters: swingVoters,
    fatores_influencia: fatoresInfluencia,
    potencial_conversao: potencialConversao,
    insights: [
      'A maioria dos swing voters está concentrada em Ceilândia e Taguatinga, áreas de classe média-baixa.',
      'Eleitores de 25-44 anos são os mais susceptíveis a mudar de voto.',
      'Debates televisivos são o fator mais influente na decisão dos indecisos.',
      'Há um potencial significativo de conversão de indecisos para Celina Leão, especialmente entre mulheres.',
      'Eleitores de centro político representam a maior parcela dos swing voters.',
    ],
    recomendacoes_campanha: [
      'Intensificar presença em Ceilândia e Taguatinga com propostas específicas para a região.',
      'Preparar candidatos para debates com foco em propostas concretas e realizáveis.',
      'Investir em conteúdo para redes sociais direcionado a jovens de 25-34 anos.',
      'Desenvolver material de campanha que ressoe com preocupações de saúde e segurança.',
      'Criar estratégia de mobilização familiar para amplificar mensagem de campanha.',
    ],
    executado_em: new Date().toISOString(),
  };
};

interface SwingVotersAnaliseProps {
  dadosIniciais?: ResultadoAnaliseSwingVoters;
  onAtualizar?: () => void;
}

export function SwingVotersAnalise({
  dadosIniciais,
  onAtualizar,
}: SwingVotersAnaliseProps) {
  const [dados, setDados] = useState<ResultadoAnaliseSwingVoters | null>(dadosIniciais || null);
  const [carregando, setCarregando] = useState(!dadosIniciais);
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaSwingVoter | 'todos'>('todos');
  const [filtroRegiao, setFiltroRegiao] = useState<string>('todos');
  const [abaAtiva, setAbaAtiva] = useState('visao-geral');

  // Carregar dados simulados
  useEffect(() => {
    if (!dadosIniciais) {
      setCarregando(true);
      setTimeout(() => {
        setDados(gerarDadosSimulados());
        setCarregando(false);
      }, 500);
    }
  }, [dadosIniciais]);

  // Filtrar swing voters
  const swingVotersFiltrados = useMemo(() => {
    if (!dados) return [];
    let filtrados = dados.swing_voters;

    if (filtroCategoria !== 'todos') {
      filtrados = filtrados.filter((sv) => sv.categoria === filtroCategoria);
    }
    if (filtroRegiao !== 'todos') {
      filtrados = filtrados.filter((sv) => sv.regiao_administrativa === filtroRegiao);
    }

    return filtrados;
  }, [dados, filtroCategoria, filtroRegiao]);

  // Atualizar dados
  const atualizarDados = () => {
    setCarregando(true);
    setTimeout(() => {
      setDados(gerarDadosSimulados());
      setCarregando(false);
      toast.success('Análise atualizada!');
    }, 500);
  };

  if (carregando) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Analisando eleitores indecisos...</p>
        </CardContent>
      </Card>
    );
  }

  if (!dados) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Não foi possível carregar os dados de swing voters.
        </CardContent>
      </Card>
    );
  }

  // Dados para gráfico de pizza (categorias)
  const dadosPizzaCategorias = dados.perfil.por_categoria.map((cat) => ({
    name: NOMES_CATEGORIA[cat.categoria],
    value: cat.quantidade,
    cor: CORES_CATEGORIA[cat.categoria],
  }));

  // Dados para gráfico de barras (regiões)
  const dadosBarrasRegioes = dados.perfil.por_regiao.slice(0, 8);

  // Dados para radar (fatores de influência)
  const dadosRadar = dados.fatores_influencia.slice(0, 6).map((f) => ({
    fator: f.fator.split(' ')[0],
    peso: f.peso,
  }));

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shuffle className="h-5 w-5" />
                Análise de Swing Voters
              </CardTitle>
              <CardDescription>
                Identifique eleitores indecisos e oportunidades de conversão
              </CardDescription>
            </div>
            <Button onClick={atualizarDados} disabled={carregando}>
              <RefreshCw className={`h-4 w-4 mr-2 ${carregando ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-sm">Swing Voters</span>
            </div>
            <p className="text-2xl font-bold">{dados.perfil.total}</p>
            <p className="text-xs text-muted-foreground">
              {dados.perfil.percentual_eleitorado.toFixed(1)}% do eleitorado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-700 mb-1">
              <HelpCircle className="h-4 w-4" />
              <span className="text-sm">Indecisos Totais</span>
            </div>
            <p className="text-2xl font-bold text-red-700">
              {dados.perfil.por_categoria.find((c) => c.categoria === 'indeciso_total')?.quantidade || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <Target className="h-4 w-4" />
              <span className="text-sm">Conversíveis</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {dados.potencial_conversao.reduce((acc, p) => acc + p.quantidade_eleitores, 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-700 mb-1">
              <Zap className="h-4 w-4" />
              <span className="text-sm">Alta Susceptibilidade</span>
            </div>
            <p className="text-2xl font-bold text-green-700">
              {dados.swing_voters.filter((sv) => sv.susceptibilidade_campanha > 70).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Abas de Conteúdo */}
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="conversao">Conversão</TabsTrigger>
          <TabsTrigger value="lista">Lista</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="visao-geral" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Distribuição por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribuição por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={dadosPizzaCategorias}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {dadosPizzaCategorias.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.cor} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Regiões */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Regiões com Swing Voters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosBarrasRegioes} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="regiao" width={90} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="quantidade" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fatores de Influência */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Fatores que Influenciam a Decisão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dados.fatores_influencia.map((fator, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{fator.fator}</span>
                      <span className="text-sm text-muted-foreground">
                        {fator.eleitores_afetados} eleitores
                      </span>
                    </div>
                    <Progress value={fator.peso} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {dados.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Perfil */}
        <TabsContent value="perfil" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Por Cluster */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Por Cluster Socioeconômico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dados.perfil.por_cluster.map((item) => (
                    <div key={item.cluster} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: CORES_CLUSTER[item.cluster] }}
                          />
                          <span className="text-sm">{item.cluster.replace('_', ' ')}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {item.quantidade} ({item.percentual.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={item.percentual} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Por Orientação Política */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Por Orientação Política</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dados.perfil.por_orientacao.map((item) => (
                    <div key={item.orientacao} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm capitalize">{item.orientacao.replace('-', ' ')}</span>
                        <span className="text-sm font-medium">
                          {item.quantidade} ({item.percentual.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={item.percentual} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Por Faixa Etária */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Por Faixa Etária</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dados.perfil.por_faixa_etaria.map((item) => (
                    <div key={item.faixa} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{item.faixa} anos</span>
                        <span className="text-sm font-medium">
                          {item.quantidade} ({item.percentual.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={item.percentual} className="h-2" />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Média de idade: {dados.perfil.media_idade.toFixed(0)} anos
                </p>
              </CardContent>
            </Card>

            {/* Por Gênero */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Por Gênero</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dados.perfil.distribuicao_genero.map((item) => (
                    <div key={item.genero} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm capitalize">{item.genero}</span>
                        <span className="text-sm font-medium">
                          {item.quantidade} ({item.percentual.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={item.percentual} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conversão */}
        <TabsContent value="conversao" className="space-y-6">
          {/* Potencial de Conversão */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Potencial de Conversão
              </CardTitle>
              <CardDescription>
                Análise de para qual candidato os swing voters podem migrar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dados.potencial_conversao.map((conversao, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{conversao.candidato_origem || 'Indecisos'}</Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge className="bg-primary">{conversao.candidato_destino}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{conversao.quantidade_eleitores}</p>
                        <p className="text-xs text-muted-foreground">
                          {conversao.percentual.toFixed(1)}% dos swing voters
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-muted-foreground">Facilidade:</span>
                      <Badge
                        variant={
                          conversao.facilidade_conversao === 'facil'
                            ? 'default'
                            : conversao.facilidade_conversao === 'moderada'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {conversao.facilidade_conversao}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {conversao.fatores_chave.map((fator, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {fator}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recomendações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Recomendações de Campanha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {dados.recomendacoes_campanha.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lista */}
        <TabsContent value="lista" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Categoria</Label>
                  <Select value={filtroCategoria} onValueChange={(v) => setFiltroCategoria(v as any)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      {Object.entries(NOMES_CATEGORIA).map(([key, nome]) => (
                        <SelectItem key={key} value={key}>{nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Região</Label>
                  <Select value={filtroRegiao} onValueChange={setFiltroRegiao}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      {dados.perfil.por_regiao.map((r) => (
                        <SelectItem key={r.regiao} value={r.regiao}>{r.regiao}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Badge variant="secondary">
                  {swingVotersFiltrados.length} eleitores
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Swing Voters */}
          <Card>
            <CardContent className="pt-4">
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {swingVotersFiltrados.slice(0, 50).map((sv) => (
                    <div
                      key={sv.eleitor_id}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-8 rounded-full"
                            style={{ backgroundColor: CORES_CATEGORIA[sv.categoria] }}
                          />
                          <div>
                            <p className="font-medium text-sm">{sv.eleitor_nome}</p>
                            <p className="text-xs text-muted-foreground">
                              {sv.regiao_administrativa} • {sv.idade} anos • {sv.genero}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Score: {sv.score_indecisao}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {NOMES_CATEGORIA[sv.categoria]}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Susceptibilidade:</span>
                          <Progress value={sv.susceptibilidade_campanha} className="w-20 h-1.5" />
                          <span>{sv.susceptibilidade_campanha}%</span>
                        </div>
                        {sv.candidato_inclinacao && (
                          <Badge variant="secondary" className="text-xs">
                            Inclinação: {sv.candidato_inclinacao}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
