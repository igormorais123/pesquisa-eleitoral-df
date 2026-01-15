'use client';

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
} from 'lucide-react';
import { PiramideEtaria, CorrelacaoHeatmap, TabelaCalorEmocional } from '@/components/charts';

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
    // Novos campos
    porCorRaca?: Record<string, number>;
    porEscolaridade?: Record<string, number>;
    porOcupacao?: Record<string, number>;
    porRenda?: Record<string, number>;
    porEstadoCivil?: Record<string, number>;
    porBolsonaro?: Record<string, number>;
    porInteresse?: Record<string, number>;
    porEstiloDecisao?: Record<string, number>;
    porTolerancia?: Record<string, number>;
    porVieses?: Record<string, number>;
    porFontes?: Record<string, number>;
    porSusceptibilidade?: Record<string, number>;
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
}: {
  titulo: string;
  icone?: React.ElementType;
  corIcone?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        {Icone && (
          <div className={`w-8 h-8 rounded-lg ${corIcone || 'bg-primary/20'} flex items-center justify-center`}>
            <Icone className="w-4 h-4 text-primary" />
          </div>
        )}
        <h3 className="font-semibold text-foreground">{titulo}</h3>
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

  // Função auxiliar para formatar dados
  const formatarDados = (dados: Record<string, number>, labels?: Record<string, string>) => {
    return Object.entries(dados)
      .filter(([nome]) => nome !== 'undefined' && nome !== 'Não informado')
      .sort((a, b) => b[1] - a[1])
      .map(([nome, valor]) => ({
        nome: labels?.[nome] || nome.charAt(0).toUpperCase() + nome.slice(1).replace(/_/g, ' '),
        valor,
        percentual: ((valor / total) * 100).toFixed(1),
      }));
  };

  // Preparar todos os dados
  const dadosGenero = formatarDados(estatisticas.porGenero);
  const dadosCluster = formatarDados(estatisticas.porCluster, LABELS.cluster);
  const dadosOrientacao = formatarDados(estatisticas.porOrientacao, LABELS.orientacao);
  const dadosReligiao = formatarDados(estatisticas.porReligiao).slice(0, 6);
  const dadosRegiao = formatarDados(estatisticas.porRegiao).slice(0, 10);
  const dadosOcupacao = estatisticas.porOcupacao ? formatarDados(estatisticas.porOcupacao, LABELS.ocupacao) : [];
  const dadosEscolaridade = estatisticas.porEscolaridade ? formatarDados(estatisticas.porEscolaridade, LABELS.escolaridade) : [];
  const dadosRenda = estatisticas.porRenda ? formatarDados(estatisticas.porRenda, LABELS.renda) : [];
  const dadosBolsonaro = estatisticas.porBolsonaro ? formatarDados(estatisticas.porBolsonaro, LABELS.bolsonaro) : [];
  const dadosInteresse = estatisticas.porInteresse ? formatarDados(estatisticas.porInteresse, LABELS.interesse) : [];
  const dadosDecisao = estatisticas.porEstiloDecisao ? formatarDados(estatisticas.porEstiloDecisao, LABELS.decisao) : [];
  const dadosFontes = estatisticas.porFontes ? formatarDados(estatisticas.porFontes).slice(0, 8) : [];
  const dadosSusceptibilidade = estatisticas.porSusceptibilidade ? formatarDados(estatisticas.porSusceptibilidade) : [];

  // Dados de filhos
  const dadosFilhos = [
    { nome: 'Com filhos', valor: estatisticas.comFilhos || 0, percentual: (((estatisticas.comFilhos || 0) / total) * 100).toFixed(1) },
    { nome: 'Sem filhos', valor: estatisticas.semFilhos || 0, percentual: (((estatisticas.semFilhos || 0) / total) * 100).toFixed(1) },
  ];

  // Vieses cognitivos para radar
  const dadosVieses = estatisticas.porVieses ? [
    { subject: 'Confirmação', A: estatisticas.porVieses['confirmacao'] || 0 },
    { subject: 'Disponibilidade', A: estatisticas.porVieses['disponibilidade'] || 0 },
    { subject: 'Aversão Perda', A: estatisticas.porVieses['aversao_perda'] || 0 },
    { subject: 'Tribalismo', A: estatisticas.porVieses['tribalismo'] || 0 },
  ] : [];

  // Faixas etárias
  const faixasEtarias = calcularFaixasEtarias(eleitores);

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
        <ChartCard titulo="Distribuição por Gênero" icone={Users} corIcone="bg-pink-500/20">
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

        {/* Classe Social - Pizza */}
        <ChartCard titulo="Classe Social" icone={Wallet} corIcone="bg-emerald-500/20">
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
              >
                {dadosCluster.map((_, index) => (
                  <Cell key={index} fill={CORES.cluster[index % CORES.cluster.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Ocupação/Vínculo - Barras Horizontais */}
        {dadosOcupacao.length > 0 && (
          <ChartCard titulo="Ocupação / Vínculo" icone={Briefcase} corIcone="bg-violet-500/20">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dadosOcupacao} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="nome" type="category" width={95} stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
                />
                <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
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
          <ChartCard titulo="Escolaridade" icone={GraduationCap} corIcone="bg-blue-500/20">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dadosEscolaridade}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
                />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
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
          <ChartCard titulo="Faixa de Renda" icone={Wallet} corIcone="bg-yellow-500/20">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dadosRenda}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
                />
                <Area type="monotone" dataKey="valor" stroke="#eab308" fill="#eab308" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Espectro Político */}
        <ChartCard titulo="Espectro Político" icone={Vote} corIcone="bg-red-500/20">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dadosOrientacao} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="nome" type="category" width={80} stroke="#9ca3af" />
              <Tooltip
                {...tooltipStyle}
                formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
              />
              <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                {dadosOrientacao.map((_, index) => (
                  <Cell key={index} fill={CORES.orientacao[index % CORES.orientacao.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Posição Bolsonaro */}
        {dadosBolsonaro.length > 0 && (
          <ChartCard titulo="Posição sobre Bolsonaro" icone={Vote} corIcone="bg-yellow-500/20">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosBolsonaro}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
                />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
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
        <ChartCard titulo="Religião" icone={Church} corIcone="bg-purple-500/20">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dadosReligiao}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                {...tooltipStyle}
                formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
              />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                {dadosReligiao.map((_, index) => (
                  <Cell key={index} fill={CORES.religiao[index % CORES.religiao.length]} />
                ))}
              </Bar>
            </BarChart>
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

        {/* Estilo de Decisão */}
        {dadosDecisao.length > 0 && (
          <ChartCard titulo="Estilo de Decisão" icone={Brain} corIcone="bg-fuchsia-500/20">
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
                >
                  {dadosDecisao.map((_, index) => (
                    <Cell key={index} fill={CORES.decisao[index % CORES.decisao.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
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

        {/* Top 10 Regiões */}
        <ChartCard titulo="Top 10 Regiões" icone={MapPin} corIcone="bg-cyan-500/20">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosRegiao} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="nome" type="category" width={100} stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <Tooltip
                {...tooltipStyle}
                formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
              />
              <Bar dataKey="valor" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

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
