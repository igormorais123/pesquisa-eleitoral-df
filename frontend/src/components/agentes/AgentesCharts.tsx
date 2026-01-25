'use client';

import { useMemo, useCallback } from 'react';
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
} from 'recharts';
import type { Eleitor } from '@/types';
import {
  Users,
  Briefcase,
  GraduationCap,
  Wallet,
  Heart,
  Church,
  Vote,
  Brain,
  Smartphone,
  MapPin,
  Activity,
  GitBranch,
  MousePointerClick,
  Car,
  Clock,
  UserCircle,
  AlertTriangle,
  Target,
  Compass,
  Scale,
  Lightbulb,
  ShieldAlert,
} from 'lucide-react';
import { PiramideEtaria, CorrelacaoHeatmap, TabelaCalorEmocional, SankeyComSeletor } from '@/components/charts';
import { CorrelacoesAutomaticas } from '@/components/analysis';
import { useFilterNavigation, FilterType } from '@/hooks/useFilterNavigation';

interface AgentesChartsProps {
  estatisticas: {
    total: number;
    filtrados: number;
    porGenero: Record<string, number>;
    porCluster: Record<string, number>;
    porOrientacao: Record<string, number>;
    porReligiao: Record<string, number>;
    porRegiao: Record<string, number>;
    mediaIdade: number;
    // Campos demográficos
    porCorRaca?: Record<string, number>;
    porEscolaridade?: Record<string, number>;
    porOcupacao?: Record<string, number>;
    porRenda?: Record<string, number>;
    porEstadoCivil?: Record<string, number>;
    porTransporte?: Record<string, number>;
    porTempoDeslocamento?: Record<string, number>;
    // Campos políticos
    porBolsonaro?: Record<string, number>;
    porInteresse?: Record<string, number>;
    // Campos psicológicos
    porEstiloDecisao?: Record<string, number>;
    porTolerancia?: Record<string, number>;
    porVieses?: Record<string, number>;
    // Campos de informação
    porFontes?: Record<string, number>;
    porSusceptibilidade?: Record<string, number>;
    // Campos de valores e preocupações
    porValores?: Record<string, number>;
    porPreocupacoes?: Record<string, number>;
    porMedos?: Record<string, number>;
    // Campos comportamentais
    porVotoFacultativo?: Record<string, number>;
    porConflitoIdentitario?: Record<string, number>;
    // Família
    comFilhos?: number;
    semFilhos?: number;
  };
  eleitores: Eleitor[];
}

// Componente de Card de Gráfico
function ChartCard({
  titulo,
  icone: Icone,
  corIcone,
  children,
  clicavel = false,
}: {
  titulo: string;
  icone?: React.ElementType;
  corIcone?: string;
  children: React.ReactNode;
  clicavel?: boolean;
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
          <h3 className="font-semibold text-foreground">{titulo}</h3>
        </div>
        {clicavel && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            <MousePointerClick className="w-3 h-3" />
            <span>Clique para filtrar</span>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

// Labels formatados
const LABELS: Record<string, Record<string, string>> = {
  cluster: {
    G1_alta: 'Alta',
    G2_media_alta: 'Média-Alta',
    G3_media_baixa: 'Média-Baixa',
    G4_baixa: 'Baixa',
  },
  orientacao: {
    esquerda: 'Esquerda',
    'centro-esquerda': 'Centro-Esq',
    centro: 'Centro',
    'centro-direita': 'Centro-Dir',
    direita: 'Direita',
  },
  ocupacao: {
    clt: 'CLT',
    servidor_publico: 'Servidor Público',
    autonomo: 'Autônomo',
    empresario: 'Empresário',
    informal: 'Informal',
    desempregado: 'Desempregado',
    aposentado: 'Aposentado',
    estudante: 'Estudante',
  },
  escolaridade: {
    fundamental_incompleto: 'Fund. Inc.',
    fundamental_completo: 'Fund. Comp.',
    medio_incompleto: 'Médio Inc.',
    medio_completo_ou_sup_incompleto: 'Médio/Sup.Inc.',
    superior_completo_ou_pos: 'Superior/Pós',
  },
  renda: {
    ate_1: 'Até 1 SM',
    mais_de_1_ate_2: '1-2 SM',
    mais_de_2_ate_5: '2-5 SM',
    mais_de_5_ate_10: '5-10 SM',
    mais_de_10: '+10 SM',
  },
  decisao: {
    identitario: 'Identitário',
    pragmatico: 'Pragmático',
    moral: 'Moral',
    economico: 'Econômico',
    emocional: 'Emocional',
  },
  interesse: {
    baixo: 'Baixo',
    medio: 'Médio',
    alto: 'Alto',
  },
  tolerancia: {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
  },
  bolsonaro: {
    apoiador_forte: 'Apoiador Forte',
    apoiador_moderado: 'Apoiador Mod.',
    neutro: 'Neutro',
    critico_moderado: 'Crítico Mod.',
    critico_forte: 'Crítico Forte',
  },
};

// Cores para gráficos
const CORES = {
  primarias: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'],
  genero: ['#3b82f6', '#ec4899'],
  cluster: ['#22c55e', '#84cc16', '#eab308', '#f97316'],
  orientacao: ['#ef4444', '#f97316', '#a855f7', '#3b82f6', '#1d4ed8'],
  religiao: ['#eab308', '#8b5cf6', '#06b6d4', '#6b7280', '#10b981', '#78716c'],
  decisao: ['#f472b6', '#c084fc', '#60a5fa', '#34d399', '#fbbf24'],
  interesse: ['#fca5a5', '#fdba74', '#4ade80'],
  susceptibilidade: ['#22c55e', '#eab308', '#ef4444'],
};

export function AgentesCharts({ estatisticas, eleitores }: AgentesChartsProps) {
  const total = estatisticas.filtrados || 1;
  const { navigateWithFilter } = useFilterNavigation();

  // Hook para criar handler de clique genérico
  const createChartClickHandler = useCallback(
    (filterType: FilterType) => {
      return (data: any) => {
        if (data?.activePayload?.[0]?.payload) {
          const payload = data.activePayload[0].payload;
          const value = payload.valorOriginal || payload.nome;
          if (value) {
            navigateWithFilter(filterType, value);
          }
        }
      };
    },
    [navigateWithFilter]
  );

  // Handler para clique em célula de gráfico de pizza
  const createPieCellClickHandler = useCallback(
    (filterType: FilterType, dados: any[]) => {
      return (_: any, index: number) => {
        const item = dados[index];
        if (item?.valorOriginal || item?.nome) {
          navigateWithFilter(filterType, item.valorOriginal || item.nome);
        }
      };
    },
    [navigateWithFilter]
  );

  // Função auxiliar para formatar dados com memoização
  const formatarDados = useMemo(() => {
    return (dados: Record<string, number>, labels?: Record<string, string>) => {
      return Object.entries(dados)
        .filter(([nome]) => nome !== 'undefined' && nome !== 'Não informado')
        .sort((a, b) => b[1] - a[1])
        .map(([chave, valor]) => ({
          nome: labels?.[chave] || chave.charAt(0).toUpperCase() + chave.slice(1).replace(/_/g, ' '),
          valor,
          valorOriginal: chave,
          percentual: ((valor / total) * 100).toFixed(1),
        }));
    };
  }, [total]);

  // Preparar todos os dados com memoização
  const dadosGenero = useMemo(() => formatarDados(estatisticas.porGenero), [formatarDados, estatisticas.porGenero]);
  const dadosCluster = useMemo(() => formatarDados(estatisticas.porCluster, LABELS.cluster), [formatarDados, estatisticas.porCluster]);
  const dadosOrientacao = useMemo(() => formatarDados(estatisticas.porOrientacao, LABELS.orientacao), [formatarDados, estatisticas.porOrientacao]);
  const dadosReligiao = useMemo(() => formatarDados(estatisticas.porReligiao).slice(0, 6), [formatarDados, estatisticas.porReligiao]);
  const dadosRegiao = useMemo(() => formatarDados(estatisticas.porRegiao).slice(0, 10), [formatarDados, estatisticas.porRegiao]);
  const dadosOcupacao = useMemo(() => estatisticas.porOcupacao ? formatarDados(estatisticas.porOcupacao, LABELS.ocupacao) : [], [formatarDados, estatisticas.porOcupacao]);
  const dadosEscolaridade = useMemo(() => estatisticas.porEscolaridade ? formatarDados(estatisticas.porEscolaridade, LABELS.escolaridade) : [], [formatarDados, estatisticas.porEscolaridade]);
  const dadosRenda = useMemo(() => estatisticas.porRenda ? formatarDados(estatisticas.porRenda, LABELS.renda) : [], [formatarDados, estatisticas.porRenda]);
  const dadosBolsonaro = useMemo(() => estatisticas.porBolsonaro ? formatarDados(estatisticas.porBolsonaro, LABELS.bolsonaro) : [], [formatarDados, estatisticas.porBolsonaro]);
  const dadosInteresse = useMemo(() => estatisticas.porInteresse ? formatarDados(estatisticas.porInteresse, LABELS.interesse) : [], [formatarDados, estatisticas.porInteresse]);
  const dadosDecisao = useMemo(() => estatisticas.porEstiloDecisao ? formatarDados(estatisticas.porEstiloDecisao, LABELS.decisao) : [], [formatarDados, estatisticas.porEstiloDecisao]);
  const dadosFontes = useMemo(() => estatisticas.porFontes ? formatarDados(estatisticas.porFontes).slice(0, 8) : [], [formatarDados, estatisticas.porFontes]);
  const dadosSusceptibilidade = useMemo(() => estatisticas.porSusceptibilidade ? formatarDados(estatisticas.porSusceptibilidade) : [], [formatarDados, estatisticas.porSusceptibilidade]);

  // Novos dados formatados
  const dadosCorRaca = useMemo(() => estatisticas.porCorRaca ? formatarDados(estatisticas.porCorRaca) : [], [formatarDados, estatisticas.porCorRaca]);
  const dadosEstadoCivil = useMemo(() => estatisticas.porEstadoCivil ? formatarDados(estatisticas.porEstadoCivil) : [], [formatarDados, estatisticas.porEstadoCivil]);
  const dadosTransporte = useMemo(() => estatisticas.porTransporte ? formatarDados(estatisticas.porTransporte) : [], [formatarDados, estatisticas.porTransporte]);
  const dadosTempoDeslocamento = useMemo(() => estatisticas.porTempoDeslocamento ? formatarDados(estatisticas.porTempoDeslocamento) : [], [formatarDados, estatisticas.porTempoDeslocamento]);
  const dadosTolerancia = useMemo(() => estatisticas.porTolerancia ? formatarDados(estatisticas.porTolerancia, LABELS.tolerancia) : [], [formatarDados, estatisticas.porTolerancia]);
  const dadosValores = useMemo(() => estatisticas.porValores ? formatarDados(estatisticas.porValores).slice(0, 10) : [], [formatarDados, estatisticas.porValores]);
  const dadosPreocupacoes = useMemo(() => estatisticas.porPreocupacoes ? formatarDados(estatisticas.porPreocupacoes).slice(0, 10) : [], [formatarDados, estatisticas.porPreocupacoes]);
  const dadosMedos = useMemo(() => estatisticas.porMedos ? formatarDados(estatisticas.porMedos).slice(0, 8) : [], [formatarDados, estatisticas.porMedos]);
  const dadosVotoFacultativo = useMemo(() => estatisticas.porVotoFacultativo ? formatarDados(estatisticas.porVotoFacultativo).filter(d => d.nome !== 'Não informado' || d.valor > 0) : [], [formatarDados, estatisticas.porVotoFacultativo]);
  const dadosConflitoIdentitario = useMemo(() => estatisticas.porConflitoIdentitario ? formatarDados(estatisticas.porConflitoIdentitario).filter(d => d.nome !== 'Não informado' || d.valor > 0) : [], [formatarDados, estatisticas.porConflitoIdentitario]);

  // Dados de filhos
  const dadosFilhos = useMemo(() => [
    { nome: 'Com filhos', valor: estatisticas.comFilhos || 0, percentual: (((estatisticas.comFilhos || 0) / total) * 100).toFixed(1) },
    { nome: 'Sem filhos', valor: estatisticas.semFilhos || 0, percentual: (((estatisticas.semFilhos || 0) / total) * 100).toFixed(1) },
  ], [estatisticas.comFilhos, estatisticas.semFilhos, total]);

  // Vieses cognitivos para radar
  const dadosVieses = useMemo(() => estatisticas.porVieses ? [
    { subject: 'Confirmação', A: estatisticas.porVieses['confirmacao'] || 0 },
    { subject: 'Disponibilidade', A: estatisticas.porVieses['disponibilidade'] || 0 },
    { subject: 'Aversão Perda', A: estatisticas.porVieses['aversao_perda'] || 0 },
    { subject: 'Tribalismo', A: estatisticas.porVieses['tribalismo'] || 0 },
  ] : [], [estatisticas.porVieses]);

  // Faixas etárias com memoização
  const faixasEtarias = useMemo(() =>
    calcularFaixasEtarias(eleitores),
    [eleitores]
  );

  // Tooltip comum
  const tooltipStyle = {
    contentStyle: { background: '#1f2937', border: 'none', borderRadius: '8px' },
    itemStyle: { color: '#fff' },
  };

  return (
    <div className="space-y-6 overflow-y-auto h-full pr-2">
      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-primary">{estatisticas.filtrados}</p>
          <p className="text-sm text-muted-foreground">Eleitores Filtrados</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{estatisticas.mediaIdade.toFixed(1)}</p>
          <p className="text-sm text-muted-foreground">Média de Idade</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-400">{Object.keys(estatisticas.porRegiao).length}</p>
          <p className="text-sm text-muted-foreground">Regiões</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-purple-400">{Object.keys(estatisticas.porOcupacao || {}).length || 8}</p>
          <p className="text-sm text-muted-foreground">Ocupações</p>
        </div>
      </div>

      {/* Gráficos em grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gênero - Pizza */}
        <ChartCard titulo="Distribuição por Gênero" icone={Users} corIcone="bg-pink-500/20" clicavel>
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
                onClick={createPieCellClickHandler('generos', dadosGenero)}
                style={{ cursor: 'pointer' }}
              >
                <Cell fill="#3b82f6" />
                <Cell fill="#ec4899" />
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(value: number, name: string) => [value, `Clique para filtrar: ${name}`]} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Classe Social - Pizza */}
        <ChartCard titulo="Classe Social" icone={Wallet} corIcone="bg-emerald-500/20" clicavel>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={dadosCluster}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="valor"
                nameKey="nome"
                label={({ percentual }) => `${percentual}%`}
                onClick={createPieCellClickHandler('clusters', dadosCluster)}
                style={{ cursor: 'pointer' }}
              >
                {dadosCluster.map((_, index) => (
                  <Cell key={index} fill={CORES.cluster[index % CORES.cluster.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(value: number, name: string) => [value, `Clique para filtrar: ${name}`]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Ocupação/Vínculo - Barras Horizontais */}
        {dadosOcupacao.length > 0 && (
          <ChartCard titulo="Ocupação / Vínculo" icone={Briefcase} corIcone="bg-violet-500/20" clicavel>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dadosOcupacao} layout="vertical" onClick={createChartClickHandler('ocupacoes_vinculos')}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="nome" type="category" width={95} stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Clique para filtrar']}
                />
                <Bar dataKey="valor" radius={[0, 4, 4, 0]} style={{ cursor: 'pointer' }}>
                  {dadosOcupacao.map((_, index) => (
                    <Cell key={index} fill={CORES.primarias[index % CORES.primarias.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Escolaridade */}
        {dadosEscolaridade.length > 0 && (
          <ChartCard titulo="Escolaridade" icone={GraduationCap} corIcone="bg-blue-500/20" clicavel>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dadosEscolaridade} onClick={createChartClickHandler('escolaridades')}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Clique para filtrar']}
                />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]} style={{ cursor: 'pointer' }}>
                  {dadosEscolaridade.map((_, index) => (
                    <Cell key={index} fill={CORES.primarias[index % CORES.primarias.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Faixa de Renda */}
        {dadosRenda.length > 0 && (
          <ChartCard titulo="Faixa de Renda" icone={Wallet} corIcone="bg-yellow-500/20" clicavel>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dadosRenda} onClick={createChartClickHandler('faixas_renda')}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Clique para filtrar']}
                />
                <Area type="monotone" dataKey="valor" stroke="#eab308" fill="#eab308" fillOpacity={0.3} style={{ cursor: 'pointer' }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Espectro Político */}
        <ChartCard titulo="Espectro Político" icone={Vote} corIcone="bg-red-500/20" clicavel>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dadosOrientacao} layout="vertical" onClick={createChartClickHandler('orientacoes_politicas')}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="nome" type="category" width={80} stroke="#9ca3af" />
              <Tooltip
                {...tooltipStyle}
                formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Clique para filtrar']}
              />
              <Bar dataKey="valor" radius={[0, 4, 4, 0]} style={{ cursor: 'pointer' }}>
                {dadosOrientacao.map((_, index) => (
                  <Cell key={index} fill={CORES.orientacao[index % CORES.orientacao.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Posição Bolsonaro */}
        {dadosBolsonaro.length > 0 && (
          <ChartCard titulo="Posição sobre Bolsonaro" icone={Vote} corIcone="bg-yellow-500/20" clicavel>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosBolsonaro} onClick={createChartClickHandler('posicoes_bolsonaro')}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Clique para filtrar']}
                />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]} style={{ cursor: 'pointer' }}>
                  {dadosBolsonaro.map((entry, index) => (
                    <Cell key={index} fill={
                      entry.nome.includes('Apoiador Forte') ? '#22c55e' :
                      entry.nome.includes('Apoiador') ? '#84cc16' :
                      entry.nome.includes('Neutro') ? '#94a3b8' :
                      entry.nome.includes('Crítico Mod') ? '#f97316' : '#ef4444'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Religião */}
        <ChartCard titulo="Religião" icone={Church} corIcone="bg-purple-500/20" clicavel>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dadosReligiao} onClick={createChartClickHandler('religioes')}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                {...tooltipStyle}
                formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Clique para filtrar']}
              />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]} style={{ cursor: 'pointer' }}>
                {dadosReligiao.map((_, index) => (
                  <Cell key={index} fill={CORES.religiao[index % CORES.religiao.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Filhos */}
        <ChartCard titulo="Filhos" icone={Heart} corIcone="bg-pink-500/20" clicavel>
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
                onClick={createPieCellClickHandler('tem_filhos', dadosFilhos.map((d, i) => ({ ...d, valorOriginal: i === 0 ? 'sim' : 'nao' })))}
                style={{ cursor: 'pointer' }}
              >
                <Cell fill="#ec4899" />
                <Cell fill="#94a3b8" />
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(value: number, name: string) => [value, `Clique para filtrar: ${name}`]} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Estilo de Decisão */}
        {dadosDecisao.length > 0 && (
          <ChartCard titulo="Estilo de Decisão" icone={Brain} corIcone="bg-fuchsia-500/20" clicavel>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dadosDecisao}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="valor"
                  nameKey="nome"
                  label={({ percentual }) => `${percentual}%`}
                  onClick={createPieCellClickHandler('estilos_decisao', dadosDecisao)}
                  style={{ cursor: 'pointer' }}
                >
                  {dadosDecisao.map((_, index) => (
                    <Cell key={index} fill={CORES.decisao[index % CORES.decisao.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(value: number, name: string) => [value, `Clique para filtrar: ${name}`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Vieses Cognitivos - Radar */}
        {dadosVieses.length > 0 && (
          <ChartCard titulo="Vieses Cognitivos" icone={Brain} corIcone="bg-amber-500/20">
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={dadosVieses}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis stroke="#9ca3af" />
                <Radar name="Eleitores" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.5} />
                <Tooltip {...tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Fontes de Informação */}
        {dadosFontes.length > 0 && (
          <ChartCard titulo="Fontes de Informação" icone={Smartphone} corIcone="bg-cyan-500/20">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dadosFontes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="nome" type="category" width={100} stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
                />
                <Bar dataKey="valor" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Susceptibilidade à Desinformação */}
        {dadosSusceptibilidade.length > 0 && (
          <ChartCard titulo="Susceptibilidade à Desinformação" icone={Activity} corIcone="bg-orange-500/20">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosSusceptibilidade}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
                />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                  {dadosSusceptibilidade.map((_, index) => (
                    <Cell key={index} fill={CORES.susceptibilidade[index % CORES.susceptibilidade.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Cor/Raça */}
        {dadosCorRaca.length > 0 && (
          <ChartCard titulo="Cor/Raça" icone={Users} corIcone="bg-amber-500/20" clicavel>
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
                  onClick={createPieCellClickHandler('cores_racas', dadosCorRaca)}
                  style={{ cursor: 'pointer' }}
                >
                  {dadosCorRaca.map((_, index) => (
                    <Cell key={index} fill={CORES.primarias[index % CORES.primarias.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(value: number, name: string) => [value, `Clique para filtrar: ${name}`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Estado Civil */}
        {dadosEstadoCivil.length > 0 && (
          <ChartCard titulo="Estado Civil" icone={Heart} corIcone="bg-rose-500/20" clicavel>
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
                  onClick={createPieCellClickHandler('estados_civis', dadosEstadoCivil)}
                  style={{ cursor: 'pointer' }}
                >
                  {dadosEstadoCivil.map((_, index) => (
                    <Cell key={index} fill={CORES.primarias[index % CORES.primarias.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(value: number, name: string) => [value, `Clique para filtrar: ${name}`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Interesse Político */}
        {dadosInteresse.length > 0 && (
          <ChartCard titulo="Interesse Político" icone={Vote} corIcone="bg-indigo-500/20" clicavel>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosInteresse} onClick={createChartClickHandler('interesses_politicos')}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Clique para filtrar']}
                />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]} style={{ cursor: 'pointer' }}>
                  {dadosInteresse.map((_, index) => (
                    <Cell key={index} fill={CORES.interesse[index % CORES.interesse.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Tolerância à Nuance */}
        {dadosTolerancia.length > 0 && (
          <ChartCard titulo="Tolerância à Nuance" icone={Scale} corIcone="bg-teal-500/20" clicavel>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosTolerancia} onClick={createChartClickHandler('tolerancias_nuance')}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Clique para filtrar']}
                />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]} style={{ cursor: 'pointer' }}>
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Meio de Transporte */}
        {dadosTransporte.length > 0 && (
          <ChartCard titulo="Meio de Transporte" icone={Car} corIcone="bg-sky-500/20" clicavel>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dadosTransporte} layout="vertical" onClick={createChartClickHandler('meios_transporte')}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="nome" type="category" width={100} stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Clique para filtrar']}
                />
                <Bar dataKey="valor" fill="#0ea5e9" radius={[0, 4, 4, 0]} style={{ cursor: 'pointer' }} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Tempo de Deslocamento */}
        {dadosTempoDeslocamento.length > 0 && (
          <ChartCard titulo="Tempo de Deslocamento" icone={Clock} corIcone="bg-slate-500/20">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosTempoDeslocamento}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
                />
                <Bar dataKey="valor" fill="#64748b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Voto Facultativo */}
        {dadosVotoFacultativo.length > 0 && dadosVotoFacultativo.some(d => d.valor > 0) && (
          <ChartCard titulo="Voto Facultativo" icone={Vote} corIcone="bg-lime-500/20" clicavel>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dadosVotoFacultativo}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="valor"
                  nameKey="nome"
                  label={({ nome, percentual }) => `${nome}: ${percentual}%`}
                  onClick={createPieCellClickHandler('voto_facultativo', dadosVotoFacultativo.map((d) => ({ ...d, valorOriginal: d.nome === 'Sim' ? 'sim' : 'nao' })))}
                  style={{ cursor: 'pointer' }}
                >
                  <Cell fill="#84cc16" />
                  <Cell fill="#94a3b8" />
                  <Cell fill="#6b7280" />
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(value: number, name: string) => [value, `Clique para filtrar: ${name}`]} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Conflito Identitário */}
        {dadosConflitoIdentitario.length > 0 && dadosConflitoIdentitario.some(d => d.valor > 0) && (
          <ChartCard titulo="Conflito Identitário" icone={AlertTriangle} corIcone="bg-orange-500/20" clicavel>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dadosConflitoIdentitario}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="valor"
                  nameKey="nome"
                  label={({ nome, percentual }) => `${nome}: ${percentual}%`}
                  onClick={createPieCellClickHandler('conflito_identitario', dadosConflitoIdentitario.map((d) => ({ ...d, valorOriginal: d.nome === 'Com conflito' ? 'sim' : 'nao' })))}
                  style={{ cursor: 'pointer' }}
                >
                  <Cell fill="#f97316" />
                  <Cell fill="#22c55e" />
                  <Cell fill="#6b7280" />
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(value: number, name: string) => [value, `Clique para filtrar: ${name}`]} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Top 10 Regiões */}
        <ChartCard titulo="Top 10 Regiões" icone={MapPin} corIcone="bg-cyan-500/20" clicavel>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosRegiao} layout="vertical" onClick={createChartClickHandler('regioes')}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="nome" type="category" width={100} stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <Tooltip
                {...tooltipStyle}
                formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Clique para filtrar']}
              />
              <Bar dataKey="valor" fill="#3b82f6" radius={[0, 4, 4, 0]} style={{ cursor: 'pointer' }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Valores - Top 10 */}
        {dadosValores.length > 0 && (
          <ChartCard titulo="Valores (Top 10)" icone={Target} corIcone="bg-emerald-500/20">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosValores} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="nome" type="category" width={120} stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
                />
                <Bar dataKey="valor" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Preocupações - Top 10 */}
        {dadosPreocupacoes.length > 0 && (
          <ChartCard titulo="Preocupações (Top 10)" icone={Compass} corIcone="bg-red-500/20">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosPreocupacoes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="nome" type="category" width={120} stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
                />
                <Bar dataKey="valor" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Medos - Top 8 */}
        {dadosMedos.length > 0 && (
          <ChartCard titulo="Medos (Top 8)" icone={ShieldAlert} corIcone="bg-violet-500/20">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dadosMedos} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="nome" type="category" width={120} stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
                />
                <Bar dataKey="valor" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Pirâmide Etária */}
        <ChartCard titulo="Pirâmide Etária" icone={Activity} corIcone="bg-green-500/20">
          <PiramideEtaria eleitores={eleitores} altura={300} />
        </ChartCard>

        {/* Heatmap de Correlações */}
        <ChartCard titulo="Correlações entre Atributos" icone={Brain} corIcone="bg-indigo-500/20">
          <CorrelacaoHeatmap eleitores={eleitores} altura={350} />
        </ChartCard>

        {/* Mapa de Calor Emocional */}
        <ChartCard titulo="Mapa de Calor Emocional por Região" icone={Heart} corIcone="bg-rose-500/20">
          <TabelaCalorEmocional eleitores={eleitores} altura={350} />
        </ChartCard>

        {/* Correlações Automáticas - Ocupa 2 colunas */}
        <div className="lg:col-span-2">
          <ChartCard titulo="Análise de Correlações Automáticas (20+)" icone={Activity} corIcone="bg-purple-500/20">
            <CorrelacoesAutomaticas eleitores={eleitores} minCorrelacao={0.1} />
          </ChartCard>
        </div>

        {/* Diagrama Sankey - Ocupa 2 colunas */}
        <div className="lg:col-span-2">
          <ChartCard titulo="Diagrama de Fluxo Sankey" icone={GitBranch} corIcone="bg-teal-500/20">
            <SankeyComSeletor eleitores={eleitores} altura={450} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

// Função auxiliar para calcular faixas etárias
function calcularFaixasEtarias(eleitores: Eleitor[]) {
  const faixas = [
    { faixa: '16-24', min: 16, max: 24 },
    { faixa: '25-34', min: 25, max: 34 },
    { faixa: '35-44', min: 35, max: 44 },
    { faixa: '45-54', min: 45, max: 54 },
    { faixa: '55-64', min: 55, max: 64 },
    { faixa: '65+', min: 65, max: 120 },
  ];

  return faixas.map(({ faixa, min, max }) => {
    const masculino = eleitores.filter(
      (e) => e.genero === 'masculino' && e.idade >= min && e.idade <= max
    ).length;
    const feminino = eleitores.filter(
      (e) => e.genero === 'feminino' && e.idade >= min && e.idade <= max
    ).length;

    return { faixa, masculino, feminino };
  });
}
