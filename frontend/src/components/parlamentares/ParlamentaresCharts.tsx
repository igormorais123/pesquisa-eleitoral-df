'use client';

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import type { Parlamentar } from '@/types';
import {
  Users,
  Briefcase,
  GraduationCap,
  Wallet,
  Heart,
  Church,
  Vote,
  Brain,
  MapPin,
  Activity,
  Building2,
  Scale,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Star,
  Target,
  Gavel,
  MessageSquare,
  Globe,
  FileText,
  Award,
  Zap,
  DollarSign,
  BarChart3,
  PieChartIcon,
  Users2,
  Landmark,
} from 'lucide-react';

interface ParlamentaresChartsProps {
  parlamentares: Parlamentar[];
}

// Componente de Card de Grafico
function ChartCard({
  titulo,
  icone: Icone,
  corIcone,
  children,
}: {
  titulo: string;
  icone?: React.ElementType;
  corIcone?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-xl p-6 group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icone && (
            <div className={`w-8 h-8 rounded-lg ${corIcone || 'bg-primary/20'} flex items-center justify-center`}>
              <Icone className="w-4 h-4 text-primary" />
            </div>
          )}
          <h3 className="font-semibold text-foreground text-sm">{titulo}</h3>
        </div>
      </div>
      {children}
    </div>
  );
}

// Labels formatados
const LABELS: Record<string, Record<string, string>> = {
  orientacao: {
    esquerda: 'Esquerda',
    'centro-esquerda': 'Centro-Esq',
    centro: 'Centro',
    'centro-direita': 'Centro-Dir',
    direita: 'Direita',
  },
  bolsonaro: {
    apoiador_forte: 'Apoiador Forte',
    apoiador_moderado: 'Apoiador Mod.',
    neutro: 'Neutro',
    critico_moderado: 'Critico Mod.',
    critico_forte: 'Critico Forte',
    opositor_forte: 'Opositor Forte',
    opositor_moderado: 'Opositor Mod.',
  },
  lula: {
    apoiador_forte: 'Apoiador Forte',
    apoiador_moderado: 'Apoiador Mod.',
    neutro: 'Neutro',
    critico_moderado: 'Critico Mod.',
    critico_forte: 'Critico Forte',
    opositor_forte: 'Opositor Forte',
    opositor_moderado: 'Opositor Mod.',
  },
  relacao_governo: {
    base_aliada: 'Base Aliada',
    independente: 'Independente',
    oposicao_moderada: 'Oposicao Mod.',
    oposicao_forte: 'Oposicao Forte',
  },
  casa: {
    camara_federal: 'Camara Federal',
    senado: 'Senado',
    cldf: 'CLDF',
  },
  nivel_hierarquico: {
    estrategico: 'Estrategico',
    tatico: 'Tatico',
    operacional: 'Operacional',
  },
  interesse: {
    baixo: 'Baixo',
    medio: 'Medio',
    alto: 'Alto',
  },
  estilo_decisao: {
    identitario: 'Identitario',
    pragmatico: 'Pragmatico',
    moral: 'Moral',
    economico: 'Economico',
    emocional: 'Emocional',
  },
  estilo_comunicacao: {
    combativo: 'Combativo',
    articulado: 'Articulado',
    popular: 'Popular',
    tecnico: 'Tecnico',
    religioso: 'Religioso',
    emotivo: 'Emotivo',
    institucional: 'Institucional',
    conservador: 'Conservador',
    pragmatico: 'Pragmatico',
    didatico: 'Didatico',
    militante: 'Militante',
    sindicalista: 'Sindicalista',
    assertivo: 'Assertivo',
    autoritario: 'Autoritario',
    conciliador: 'Conciliador',
    digital: 'Digital',
    firme: 'Firme',
  },
  engajamento: {
    muito_baixo: 'Muito Baixo',
    baixo: 'Baixo',
    medio: 'Medio',
    alto: 'Alto',
    muito_alto: 'Muito Alto',
  },
  capital_politico: {
    baixo: 'Baixo',
    medio: 'Medio',
    alto: 'Alto',
    muito_alto: 'Muito Alto',
  },
  motivacao: {
    ideologia: 'Ideologia',
    poder: 'Poder',
    servico: 'Servico',
    fama: 'Fama',
    dinheiro: 'Dinheiro',
    corporativismo: 'Corporativismo',
  },
  estilo_lideranca: {
    autoritario: 'Autoritario',
    democratico: 'Democratico',
    laissez_faire: 'Laissez Faire',
    carismatico: 'Carismatico',
    servical: 'Servical',
    pragmatico: 'Pragmatico',
  },
};

// Cores para graficos
const CORES = {
  primarias: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#6366f1'],
  genero: ['#3b82f6', '#ec4899'],
  orientacao: ['#ef4444', '#f97316', '#a855f7', '#3b82f6', '#1d4ed8'],
  casa: ['#3b82f6', '#8b5cf6', '#10b981'],
  relacao_governo: ['#22c55e', '#f59e0b', '#f97316', '#ef4444'],
  bolsonaro: ['#22c55e', '#84cc16', '#94a3b8', '#f97316', '#ef4444'],
  lula: ['#ef4444', '#f97316', '#94a3b8', '#84cc16', '#22c55e'],
  interesse: ['#fca5a5', '#fdba74', '#4ade80'],
  ficha: ['#22c55e', '#ef4444'],
};

// Regioes do Brasil
const REGIOES_BRASIL: Record<string, string[]> = {
  Norte: ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO'],
  Nordeste: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
  'Centro-Oeste': ['DF', 'GO', 'MS', 'MT'],
  Sudeste: ['ES', 'MG', 'RJ', 'SP'],
  Sul: ['PR', 'RS', 'SC'],
};

function getRegiaoByUF(uf: string): string {
  for (const [regiao, estados] of Object.entries(REGIOES_BRASIL)) {
    if (estados.includes(uf)) return regiao;
  }
  return 'Outros';
}

export function ParlamentaresCharts({ parlamentares }: ParlamentaresChartsProps) {
  const total = parlamentares.length || 1;

  // Funcao auxiliar para formatar dados
  const formatarDados = (dados: Record<string, number>, labels?: Record<string, string>) => {
    return Object.entries(dados)
      .filter(([nome]) => nome !== 'undefined' && nome !== 'null' && nome !== '')
      .sort((a, b) => b[1] - a[1])
      .map(([chave, valor]) => ({
        nome: labels?.[chave] || chave.charAt(0).toUpperCase() + chave.slice(1).replace(/_/g, ' '),
        valor,
        valorOriginal: chave,
        percentual: ((valor / total) * 100).toFixed(1),
      }));
  };

  // Calcular todas as estatisticas
  const estatisticas = useMemo(() => {
    const porGenero: Record<string, number> = {};
    const porCasa: Record<string, number> = {};
    const porPartido: Record<string, number> = {};
    const porUF: Record<string, number> = {};
    const porRegiao: Record<string, number> = {};
    const porOrientacao: Record<string, number> = {};
    const porBolsonaro: Record<string, number> = {};
    const porLula: Record<string, number> = {};
    const porRelacaoGoverno: Record<string, number> = {};
    const porReligiao: Record<string, number> = {};
    const porEstiloComunicacao: Record<string, number> = {};
    const porEstiloDecisao: Record<string, number> = {};
    const porInteresse: Record<string, number> = {};
    const porCorRaca: Record<string, number> = {};
    const porEstadoCivil: Record<string, number> = {};
    const porBancada: Record<string, number> = {};
    const porEngajamento: Record<string, number> = {};
    const porCapitalPolitico: Record<string, number> = {};
    const porMotivacao: Record<string, number> = {};
    const porEstiloLideranca: Record<string, number> = {};
    const porFichaLimpa: Record<string, number> = { 'Ficha Limpa': 0, 'Com Pendencias': 0 };
    const porEscolaridade: Record<string, number> = {};
    const porTemaAtuacao: Record<string, number> = {};
    const porValores: Record<string, number> = {};
    const porPreocupacoes: Record<string, number> = {};

    let somaIdade = 0;
    let somaVotos = 0;
    let somaPresenca = 0;
    let somaPatrimonio = 0;
    let somaProjetos = 0;
    let somaSeguidores = 0;
    let contPresenca = 0;
    let contPatrimonio = 0;
    let contProjetos = 0;
    let contSeguidores = 0;
    let comFilhos = 0;
    let semFilhos = 0;
    let bancadaBBB = 0;

    parlamentares.forEach((p) => {
      // Basicos
      porGenero[p.genero] = (porGenero[p.genero] || 0) + 1;
      porCasa[p.casa_legislativa] = (porCasa[p.casa_legislativa] || 0) + 1;
      porPartido[p.partido] = (porPartido[p.partido] || 0) + 1;
      porUF[p.uf] = (porUF[p.uf] || 0) + 1;

      const regiao = getRegiaoByUF(p.uf);
      porRegiao[regiao] = (porRegiao[regiao] || 0) + 1;

      porOrientacao[p.orientacao_politica] = (porOrientacao[p.orientacao_politica] || 0) + 1;
      porBolsonaro[p.posicao_bolsonaro] = (porBolsonaro[p.posicao_bolsonaro] || 0) + 1;
      if (p.posicao_lula) porLula[p.posicao_lula] = (porLula[p.posicao_lula] || 0) + 1;
      if (p.relacao_governo_atual) porRelacaoGoverno[p.relacao_governo_atual] = (porRelacaoGoverno[p.relacao_governo_atual] || 0) + 1;

      porReligiao[p.religiao] = (porReligiao[p.religiao] || 0) + 1;
      porEstiloComunicacao[p.estilo_comunicacao] = (porEstiloComunicacao[p.estilo_comunicacao] || 0) + 1;
      if (p.estilo_decisao) porEstiloDecisao[p.estilo_decisao] = (porEstiloDecisao[p.estilo_decisao] || 0) + 1;
      if (p.interesse_politico) porInteresse[p.interesse_politico] = (porInteresse[p.interesse_politico] || 0) + 1;

      porCorRaca[p.cor_raca] = (porCorRaca[p.cor_raca] || 0) + 1;
      porEstadoCivil[p.estado_civil] = (porEstadoCivil[p.estado_civil] || 0) + 1;

      // Bancadas
      if (p.bancadas_tematicas) {
        p.bancadas_tematicas.forEach((b) => {
          porBancada[b] = (porBancada[b] || 0) + 1;
        });
      }
      if (p.bancada_bbb) bancadaBBB++;

      // Novos campos
      if (p.engajamento_redes) porEngajamento[p.engajamento_redes] = (porEngajamento[p.engajamento_redes] || 0) + 1;
      if (p.capital_politico) porCapitalPolitico[p.capital_politico] = (porCapitalPolitico[p.capital_politico] || 0) + 1;
      if (p.motivacao_primaria) porMotivacao[p.motivacao_primaria] = (porMotivacao[p.motivacao_primaria] || 0) + 1;
      if (p.estilo_lideranca) porEstiloLideranca[p.estilo_lideranca] = (porEstiloLideranca[p.estilo_lideranca] || 0) + 1;
      if (p.escolaridade_nivel) porEscolaridade[p.escolaridade_nivel] = (porEscolaridade[p.escolaridade_nivel] || 0) + 1;

      // Ficha limpa
      if (p.ficha_limpa === true) porFichaLimpa['Ficha Limpa']++;
      else if (p.ficha_limpa === false) porFichaLimpa['Com Pendencias']++;

      // Temas de atuacao
      p.temas_atuacao?.forEach((t) => {
        porTemaAtuacao[t] = (porTemaAtuacao[t] || 0) + 1;
      });

      // Valores
      p.valores?.forEach((v) => {
        porValores[v] = (porValores[v] || 0) + 1;
      });

      // Preocupacoes
      p.preocupacoes?.forEach((pr) => {
        porPreocupacoes[pr] = (porPreocupacoes[pr] || 0) + 1;
      });

      // Numericos
      somaIdade += p.idade;
      somaVotos += p.votos_eleicao || 0;
      if (p.taxa_presenca_plenario !== undefined) {
        somaPresenca += p.taxa_presenca_plenario;
        contPresenca++;
      }
      if (p.patrimonio_declarado !== undefined) {
        somaPatrimonio += p.patrimonio_declarado;
        contPatrimonio++;
      }
      if (p.total_projetos_autoria !== undefined) {
        somaProjetos += p.total_projetos_autoria;
        contProjetos++;
      }
      if (p.seguidores_total !== undefined) {
        somaSeguidores += p.seguidores_total;
        contSeguidores++;
      }

      // Filhos
      if (p.filhos > 0) comFilhos++;
      else semFilhos++;
    });

    return {
      porGenero,
      porCasa,
      porPartido,
      porUF,
      porRegiao,
      porOrientacao,
      porBolsonaro,
      porLula,
      porRelacaoGoverno,
      porReligiao,
      porEstiloComunicacao,
      porEstiloDecisao,
      porInteresse,
      porCorRaca,
      porEstadoCivil,
      porBancada,
      porEngajamento,
      porCapitalPolitico,
      porMotivacao,
      porEstiloLideranca,
      porFichaLimpa,
      porEscolaridade,
      porTemaAtuacao,
      porValores,
      porPreocupacoes,
      mediaIdade: somaIdade / total,
      mediaVotos: somaVotos / total,
      mediaPresenca: contPresenca > 0 ? somaPresenca / contPresenca : 0,
      mediaPatrimonio: contPatrimonio > 0 ? somaPatrimonio / contPatrimonio : 0,
      mediaProjetos: contProjetos > 0 ? somaProjetos / contProjetos : 0,
      mediaSeguidores: contSeguidores > 0 ? somaSeguidores / contSeguidores : 0,
      comFilhos,
      semFilhos,
      bancadaBBB,
    };
  }, [parlamentares, total]);

  // Dados formatados
  const dadosGenero = useMemo(() => formatarDados(estatisticas.porGenero), [estatisticas.porGenero]);
  const dadosCasa = useMemo(() => formatarDados(estatisticas.porCasa, LABELS.casa), [estatisticas.porCasa]);
  const dadosPartido = useMemo(() => formatarDados(estatisticas.porPartido).slice(0, 15), [estatisticas.porPartido]);
  const dadosUF = useMemo(() => formatarDados(estatisticas.porUF).slice(0, 15), [estatisticas.porUF]);
  const dadosRegiao = useMemo(() => formatarDados(estatisticas.porRegiao), [estatisticas.porRegiao]);
  const dadosOrientacao = useMemo(() => formatarDados(estatisticas.porOrientacao, LABELS.orientacao), [estatisticas.porOrientacao]);
  const dadosBolsonaro = useMemo(() => formatarDados(estatisticas.porBolsonaro, LABELS.bolsonaro), [estatisticas.porBolsonaro]);
  const dadosLula = useMemo(() => formatarDados(estatisticas.porLula, LABELS.lula), [estatisticas.porLula]);
  const dadosRelacaoGoverno = useMemo(() => formatarDados(estatisticas.porRelacaoGoverno, LABELS.relacao_governo), [estatisticas.porRelacaoGoverno]);
  const dadosReligiao = useMemo(() => formatarDados(estatisticas.porReligiao).slice(0, 8), [estatisticas.porReligiao]);
  const dadosEstiloComunicacao = useMemo(() => formatarDados(estatisticas.porEstiloComunicacao, LABELS.estilo_comunicacao).slice(0, 10), [estatisticas.porEstiloComunicacao]);
  const dadosEstiloDecisao = useMemo(() => formatarDados(estatisticas.porEstiloDecisao, LABELS.estilo_decisao), [estatisticas.porEstiloDecisao]);
  const dadosInteresse = useMemo(() => formatarDados(estatisticas.porInteresse, LABELS.interesse), [estatisticas.porInteresse]);
  const dadosCorRaca = useMemo(() => formatarDados(estatisticas.porCorRaca), [estatisticas.porCorRaca]);
  const dadosEstadoCivil = useMemo(() => formatarDados(estatisticas.porEstadoCivil), [estatisticas.porEstadoCivil]);
  const dadosBancada = useMemo(() => formatarDados(estatisticas.porBancada).slice(0, 10), [estatisticas.porBancada]);
  const dadosEngajamento = useMemo(() => formatarDados(estatisticas.porEngajamento, LABELS.engajamento), [estatisticas.porEngajamento]);
  const dadosCapitalPolitico = useMemo(() => formatarDados(estatisticas.porCapitalPolitico, LABELS.capital_politico), [estatisticas.porCapitalPolitico]);
  const dadosMotivacao = useMemo(() => formatarDados(estatisticas.porMotivacao, LABELS.motivacao), [estatisticas.porMotivacao]);
  const dadosEstiloLideranca = useMemo(() => formatarDados(estatisticas.porEstiloLideranca, LABELS.estilo_lideranca), [estatisticas.porEstiloLideranca]);
  const dadosFichaLimpa = useMemo(() => formatarDados(estatisticas.porFichaLimpa), [estatisticas.porFichaLimpa]);
  const dadosEscolaridade = useMemo(() => formatarDados(estatisticas.porEscolaridade), [estatisticas.porEscolaridade]);
  const dadosTemaAtuacao = useMemo(() => formatarDados(estatisticas.porTemaAtuacao).slice(0, 12), [estatisticas.porTemaAtuacao]);
  const dadosValores = useMemo(() => formatarDados(estatisticas.porValores).slice(0, 10), [estatisticas.porValores]);
  const dadosPreocupacoes = useMemo(() => formatarDados(estatisticas.porPreocupacoes).slice(0, 10), [estatisticas.porPreocupacoes]);

  const dadosFilhos = useMemo(() => [
    { nome: 'Com filhos', valor: estatisticas.comFilhos, percentual: ((estatisticas.comFilhos / total) * 100).toFixed(1) },
    { nome: 'Sem filhos', valor: estatisticas.semFilhos, percentual: ((estatisticas.semFilhos / total) * 100).toFixed(1) },
  ], [estatisticas.comFilhos, estatisticas.semFilhos, total]);

  // Faixas etarias
  const faixasEtarias = useMemo(() => {
    const faixas = [
      { faixa: '25-34', min: 25, max: 34 },
      { faixa: '35-44', min: 35, max: 44 },
      { faixa: '45-54', min: 45, max: 54 },
      { faixa: '55-64', min: 55, max: 64 },
      { faixa: '65-74', min: 65, max: 74 },
      { faixa: '75+', min: 75, max: 120 },
    ];

    return faixas.map(({ faixa, min, max }) => {
      const count = parlamentares.filter(p => p.idade >= min && p.idade <= max).length;
      return { faixa, valor: count, percentual: ((count / total) * 100).toFixed(1) };
    });
  }, [parlamentares, total]);

  // Tooltip comum
  const tooltipStyle = {
    contentStyle: { background: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px' },
    itemStyle: { color: '#fff' },
  };

  if (parlamentares.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          Selecione filtros para ver graficos dos parlamentares.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-y-auto h-full pr-2">
      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{parlamentares.length}</p>
          <p className="text-xs text-muted-foreground">Parlamentares</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{estatisticas.mediaIdade.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">Idade Media</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{Object.keys(estatisticas.porPartido).length}</p>
          <p className="text-xs text-muted-foreground">Partidos</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{Object.keys(estatisticas.porUF).length}</p>
          <p className="text-xs text-muted-foreground">Estados</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{estatisticas.mediaPresenca.toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground">Presenca Media</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">{estatisticas.mediaProjetos.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">Projetos Media</p>
        </div>
      </div>

      {/* Graficos em grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genero */}
        <ChartCard titulo="Distribuicao por Genero" icone={Users} corIcone="bg-pink-500/20">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={dadosGenero}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="valor"
                nameKey="nome"
                label={({ nome, percentual }) => `${nome}: ${percentual}%`}
              >
                <Cell fill="#3b82f6" />
                <Cell fill="#ec4899" />
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Casa Legislativa */}
        <ChartCard titulo="Casa Legislativa" icone={Building2} corIcone="bg-blue-500/20">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={dadosCasa}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="valor"
                nameKey="nome"
                label={({ nome, percentual }) => `${nome}: ${percentual}%`}
              >
                {dadosCasa.map((_, index) => (
                  <Cell key={index} fill={CORES.casa[index % CORES.casa.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top 15 Partidos */}
        <ChartCard titulo="Top 15 Partidos" icone={Vote} corIcone="bg-purple-500/20">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dadosPartido} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <YAxis dataKey="nome" type="category" width={60} stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Parlamentares']} />
              <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                {dadosPartido.map((_, index) => (
                  <Cell key={index} fill={CORES.primarias[index % CORES.primarias.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Espectro Politico */}
        <ChartCard titulo="Espectro Politico" icone={Scale} corIcone="bg-red-500/20">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dadosOrientacao} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <YAxis dataKey="nome" type="category" width={80} stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Parlamentares']} />
              <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                {dadosOrientacao.map((_, index) => (
                  <Cell key={index} fill={CORES.orientacao[index % CORES.orientacao.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Posicao Bolsonaro */}
        <ChartCard titulo="Posicao sobre Bolsonaro" icone={Target} corIcone="bg-yellow-500/20">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dadosBolsonaro}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 8 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Parlamentares']} />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                {dadosBolsonaro.map((entry, index) => (
                  <Cell key={index} fill={
                    entry.nome.includes('Apoiador Forte') ? '#22c55e' :
                    entry.nome.includes('Apoiador') ? '#84cc16' :
                    entry.nome.includes('Neutro') ? '#94a3b8' :
                    entry.nome.includes('Critico Mod') || entry.nome.includes('Opositor Mod') ? '#f97316' : '#ef4444'
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Posicao Lula */}
        {dadosLula.length > 0 && (
          <ChartCard titulo="Posicao sobre Lula" icone={Target} corIcone="bg-red-500/20">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosLula}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 8 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Parlamentares']} />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                  {dadosLula.map((entry, index) => (
                    <Cell key={index} fill={
                      entry.nome.includes('Opositor Forte') || entry.nome.includes('Critico Forte') ? '#ef4444' :
                      entry.nome.includes('Opositor') || entry.nome.includes('Critico') ? '#f97316' :
                      entry.nome.includes('Neutro') ? '#94a3b8' :
                      entry.nome.includes('Apoiador Mod') ? '#84cc16' : '#22c55e'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Relacao com Governo */}
        {dadosRelacaoGoverno.length > 0 && (
          <ChartCard titulo="Relacao com Governo" icone={Landmark} corIcone="bg-emerald-500/20">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dadosRelacaoGoverno}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="valor"
                  nameKey="nome"
                  label={({ percentual }) => `${percentual}%`}
                >
                  {dadosRelacaoGoverno.map((_, index) => (
                    <Cell key={index} fill={CORES.relacao_governo[index % CORES.relacao_governo.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Distribuicao por Regiao */}
        <ChartCard titulo="Distribuicao por Regiao" icone={MapPin} corIcone="bg-cyan-500/20">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={dadosRegiao}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="valor"
                nameKey="nome"
                label={({ nome, percentual }) => `${nome}: ${percentual}%`}
              >
                {dadosRegiao.map((_, index) => (
                  <Cell key={index} fill={CORES.primarias[index % CORES.primarias.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top 15 Estados */}
        <ChartCard titulo="Top 15 Estados (UF)" icone={MapPin} corIcone="bg-teal-500/20">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dadosUF} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <YAxis dataKey="nome" type="category" width={40} stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Parlamentares']} />
              <Bar dataKey="valor" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Religiao */}
        <ChartCard titulo="Religiao" icone={Church} corIcone="bg-purple-500/20">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dadosReligiao}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 9 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Parlamentares']} />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                {dadosReligiao.map((_, index) => (
                  <Cell key={index} fill={CORES.primarias[index % CORES.primarias.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Bancadas Tematicas */}
        {dadosBancada.length > 0 && (
          <ChartCard titulo="Bancadas Tematicas" icone={Users2} corIcone="bg-orange-500/20">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosBancada} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis dataKey="nome" type="category" width={90} stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Parlamentares']} />
                <Bar dataKey="valor" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Cor/Raca */}
        <ChartCard titulo="Cor/Raca" icone={Users} corIcone="bg-amber-500/20">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={dadosCorRaca}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="valor"
                nameKey="nome"
                label={({ percentual }) => `${percentual}%`}
              >
                {dadosCorRaca.map((_, index) => (
                  <Cell key={index} fill={CORES.primarias[index % CORES.primarias.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Estado Civil */}
        <ChartCard titulo="Estado Civil" icone={Heart} corIcone="bg-rose-500/20">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={dadosEstadoCivil}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="valor"
                nameKey="nome"
                label={({ percentual }) => `${percentual}%`}
              >
                {dadosEstadoCivil.map((_, index) => (
                  <Cell key={index} fill={CORES.primarias[index % CORES.primarias.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Filhos */}
        <ChartCard titulo="Filhos" icone={Heart} corIcone="bg-pink-500/20">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={dadosFilhos}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="valor"
                nameKey="nome"
                label={({ nome, percentual }) => `${nome}: ${percentual}%`}
              >
                <Cell fill="#ec4899" />
                <Cell fill="#94a3b8" />
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Faixa Etaria */}
        <ChartCard titulo="Faixa Etaria" icone={Activity} corIcone="bg-green-500/20">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={faixasEtarias}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="faixa" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Parlamentares']} />
              <Bar dataKey="valor" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Estilo de Comunicacao */}
        <ChartCard titulo="Estilo de Comunicacao" icone={MessageSquare} corIcone="bg-indigo-500/20">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosEstiloComunicacao} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <YAxis dataKey="nome" type="category" width={85} stroke="#9ca3af" tick={{ fontSize: 9 }} />
              <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Parlamentares']} />
              <Bar dataKey="valor" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Estilo de Decisao */}
        {dadosEstiloDecisao.length > 0 && (
          <ChartCard titulo="Estilo de Decisao" icone={Brain} corIcone="bg-fuchsia-500/20">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dadosEstiloDecisao}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="valor"
                  nameKey="nome"
                  label={({ percentual }) => `${percentual}%`}
                >
                  {dadosEstiloDecisao.map((_, index) => (
                    <Cell key={index} fill={CORES.primarias[index % CORES.primarias.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Interesse Politico */}
        {dadosInteresse.length > 0 && (
          <ChartCard titulo="Interesse Politico" icone={Zap} corIcone="bg-yellow-500/20">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosInteresse}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Parlamentares']} />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                  {dadosInteresse.map((_, index) => (
                    <Cell key={index} fill={CORES.interesse[index % CORES.interesse.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Ficha Limpa */}
        <ChartCard titulo="Ficha Limpa" icone={ShieldCheck} corIcone="bg-green-500/20">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={dadosFichaLimpa}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="valor"
                nameKey="nome"
                label={({ nome, percentual }) => `${nome}: ${percentual}%`}
              >
                <Cell fill="#22c55e" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Engajamento Redes */}
        {dadosEngajamento.length > 0 && (
          <ChartCard titulo="Engajamento nas Redes" icone={Globe} corIcone="bg-cyan-500/20">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosEngajamento}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Parlamentares']} />
                <Bar dataKey="valor" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Capital Politico */}
        {dadosCapitalPolitico.length > 0 && (
          <ChartCard titulo="Capital Politico" icone={TrendingUp} corIcone="bg-emerald-500/20">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosCapitalPolitico}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Parlamentares']} />
                <Bar dataKey="valor" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Motivacao Primaria */}
        {dadosMotivacao.length > 0 && (
          <ChartCard titulo="Motivacao Primaria" icone={Star} corIcone="bg-amber-500/20">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dadosMotivacao}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="valor"
                  nameKey="nome"
                  label={({ percentual }) => `${percentual}%`}
                >
                  {dadosMotivacao.map((_, index) => (
                    <Cell key={index} fill={CORES.primarias[index % CORES.primarias.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Estilo de Lideranca */}
        {dadosEstiloLideranca.length > 0 && (
          <ChartCard titulo="Estilo de Lideranca" icone={Award} corIcone="bg-violet-500/20">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dadosEstiloLideranca}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="valor"
                  nameKey="nome"
                  label={({ percentual }) => `${percentual}%`}
                >
                  {dadosEstiloLideranca.map((_, index) => (
                    <Cell key={index} fill={CORES.primarias[index % CORES.primarias.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Escolaridade */}
        {dadosEscolaridade.length > 0 && (
          <ChartCard titulo="Nivel de Escolaridade" icone={GraduationCap} corIcone="bg-blue-500/20">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosEscolaridade}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Parlamentares']} />
                <Bar dataKey="valor" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Temas de Atuacao */}
        {dadosTemaAtuacao.length > 0 && (
          <ChartCard titulo="Temas de Atuacao (Top 12)" icone={FileText} corIcone="bg-teal-500/20">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dadosTemaAtuacao} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis dataKey="nome" type="category" width={100} stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Parlamentares']} />
                <Bar dataKey="valor" fill="#14b8a6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Valores (Top 10) */}
        {dadosValores.length > 0 && (
          <ChartCard titulo="Valores (Top 10)" icone={Target} corIcone="bg-emerald-500/20">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosValores} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis dataKey="nome" type="category" width={120} stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Parlamentares']} />
                <Bar dataKey="valor" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Preocupacoes (Top 10) */}
        {dadosPreocupacoes.length > 0 && (
          <ChartCard titulo="Preocupacoes (Top 10)" icone={AlertTriangle} corIcone="bg-red-500/20">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosPreocupacoes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis dataKey="nome" type="category" width={120} stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Parlamentares']} />
                <Bar dataKey="valor" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    </div>
  );
}
