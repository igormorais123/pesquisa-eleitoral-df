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
} from 'recharts';
import type { Gestor } from '@/types';
import {
  Users,
  Briefcase,
  GraduationCap,
  Building2,
  MapPin,
  Activity,
  Brain,
  Target,
  Award,
  Zap,
  BarChart3,
  TrendingUp,
  Clock,
  Users2,
  Compass,
  Layers,
  Settings,
  Network,
  Shield,
  Building,
  Factory,
  Heart,
} from 'lucide-react';

interface GestoresChartsProps {
  gestores: Gestor[];
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
  setor: {
    publico: 'Setor Publico',
    privado: 'Setor Privado',
  },
  nivel_hierarquico: {
    estrategico: 'Estrategico',
    tatico: 'Tatico',
    operacional: 'Operacional',
  },
  estilo_lideranca: {
    transformacional: 'Transformacional',
    transacional: 'Transacional',
    democratico: 'Democratico',
    autoritario: 'Autoritario',
    laissez_faire: 'Laissez-faire',
    servical: 'Servical',
    tecnico: 'Tecnico',
    coaching: 'Coaching',
    visionario: 'Visionario',
    coordenativo: 'Coordenativo',
  },
  area_atuacao: {
    gestao_pessoas: 'Gestao de Pessoas',
    financeiro_orcamento: 'Financeiro/Orcamento',
    juridico: 'Juridico',
    tecnologia_informacao: 'TI',
    infraestrutura_obras: 'Infraestrutura',
    saude: 'Saude',
    educacao: 'Educacao',
    avaliacao_monitoramento: 'Avaliacao',
    licitacoes_contratos: 'Licitacoes',
    comunicacao: 'Comunicacao',
    pesquisa: 'Pesquisa',
    operacoes: 'Operacoes',
    comercial_vendas: 'Comercial',
    marketing: 'Marketing',
    producao: 'Producao',
    logistica_supply: 'Logistica',
    controladoria: 'Controladoria',
    auditoria: 'Auditoria',
    compliance: 'Compliance',
    estrategia: 'Estrategia',
  },
  tipo_orgao: {
    ministerio: 'Ministerio',
    autarquia: 'Autarquia',
    empresa_publica: 'Empresa Publica',
    fundacao: 'Fundacao',
    agencia_reguladora: 'Agencia Reguladora',
    orgao_controle: 'Orgao de Controle',
    tribunal: 'Tribunal',
    hospital_publico: 'Hospital Publico',
    universidade_federal: 'Universidade',
    instituto_pesquisa: 'Inst. Pesquisa',
  },
  setor_privado: {
    industria: 'Industria',
    servicos: 'Servicos',
    varejo: 'Varejo',
    tecnologia: 'Tecnologia',
    financeiro: 'Financeiro',
    saude: 'Saude',
    agronegocio: 'Agronegocio',
    construcao: 'Construcao',
    energia: 'Energia',
    telecomunicacoes: 'Telecom',
    logistica: 'Logistica',
    educacao_privada: 'Educacao',
    juridico: 'Juridico',
    consultoria: 'Consultoria',
  },
  porte_empresa: {
    multinacional: 'Multinacional',
    grande_nacional: 'Grande Nacional',
    media: 'Media',
    pequena: 'Pequena',
  },
};

// Cores para graficos
const CORES = {
  primarias: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#6366f1'],
  genero: ['#3b82f6', '#ec4899'],
  setor: ['#3b82f6', '#10b981'],
  nivel: ['#8b5cf6', '#f59e0b', '#06b6d4'],
  podc: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
};

export function GestoresCharts({ gestores }: GestoresChartsProps) {
  const total = gestores.length || 1;

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
    const porSetor: Record<string, number> = {};
    const porNivel: Record<string, number> = {};
    const porAreaAtuacao: Record<string, number> = {};
    const porTipoOrgao: Record<string, number> = {};
    const porSetorPrivado: Record<string, number> = {};
    const porPorteEmpresa: Record<string, number> = {};
    const porEstiloLideranca: Record<string, number> = {};
    const porLocalizacao: Record<string, number> = {};
    const porRegiao: Record<string, number> = {};
    const porFormacao: Record<string, number> = {};
    const porDesafio: Record<string, number> = {};
    const porCompetencia: Record<string, number> = {};
    const porMotivacao: Record<string, number> = {};
    const porFrustracao: Record<string, number> = {};

    let somaIdade = 0;
    let somaPODC_P = 0, somaPODC_O = 0, somaPODC_D = 0, somaPODC_C = 0;
    let contPODC = 0;
    let somaEquipe = 0, contEquipe = 0;

    gestores.forEach((g) => {
      // Basicos
      porGenero[g.genero] = (porGenero[g.genero] || 0) + 1;
      porSetor[g.setor] = (porSetor[g.setor] || 0) + 1;
      porNivel[g.nivel_hierarquico] = (porNivel[g.nivel_hierarquico] || 0) + 1;
      porAreaAtuacao[g.area_atuacao] = (porAreaAtuacao[g.area_atuacao] || 0) + 1;
      porEstiloLideranca[g.estilo_lideranca] = (porEstiloLideranca[g.estilo_lideranca] || 0) + 1;

      if (g.tipo_orgao) porTipoOrgao[g.tipo_orgao] = (porTipoOrgao[g.tipo_orgao] || 0) + 1;
      if (g.setor_privado) porSetorPrivado[g.setor_privado] = (porSetorPrivado[g.setor_privado] || 0) + 1;
      if (g.porte_empresa) porPorteEmpresa[g.porte_empresa] = (porPorteEmpresa[g.porte_empresa] || 0) + 1;

      porLocalizacao[g.localizacao] = (porLocalizacao[g.localizacao] || 0) + 1;
      if (g.regiao) porRegiao[g.regiao] = (porRegiao[g.regiao] || 0) + 1;

      // Formacao academica
      g.formacao_academica?.forEach((f) => {
        porFormacao[f] = (porFormacao[f] || 0) + 1;
      });

      // Desafios
      g.desafios_cotidianos?.forEach((d) => {
        porDesafio[d] = (porDesafio[d] || 0) + 1;
      });

      // Competencias
      g.competencias_distintivas?.forEach((c) => {
        porCompetencia[c] = (porCompetencia[c] || 0) + 1;
      });

      // Motivacoes
      g.motivacoes?.forEach((m) => {
        porMotivacao[m] = (porMotivacao[m] || 0) + 1;
      });

      // Frustracoes
      g.frustracoes?.forEach((fr) => {
        porFrustracao[fr] = (porFrustracao[fr] || 0) + 1;
      });

      // Numericos
      somaIdade += g.idade;

      // PODC
      if (g.distribuicao_podc) {
        somaPODC_P += g.distribuicao_podc.planejar;
        somaPODC_O += g.distribuicao_podc.organizar;
        somaPODC_D += g.distribuicao_podc.dirigir;
        somaPODC_C += g.distribuicao_podc.controlar;
        contPODC++;
      }

      if (g.tamanho_equipe !== undefined) {
        somaEquipe += g.tamanho_equipe;
        contEquipe++;
      }
    });

    return {
      porGenero,
      porSetor,
      porNivel,
      porAreaAtuacao,
      porTipoOrgao,
      porSetorPrivado,
      porPorteEmpresa,
      porEstiloLideranca,
      porLocalizacao,
      porRegiao,
      porFormacao,
      porDesafio,
      porCompetencia,
      porMotivacao,
      porFrustracao,
      mediaIdade: somaIdade / total,
      mediaPODC: contPODC > 0 ? {
        planejar: somaPODC_P / contPODC,
        organizar: somaPODC_O / contPODC,
        dirigir: somaPODC_D / contPODC,
        controlar: somaPODC_C / contPODC,
      } : null,
      mediaEquipe: contEquipe > 0 ? somaEquipe / contEquipe : 0,
    };
  }, [gestores, total]);

  // Dados formatados
  const dadosGenero = useMemo(() => formatarDados(estatisticas.porGenero), [estatisticas.porGenero]);
  const dadosSetor = useMemo(() => formatarDados(estatisticas.porSetor, LABELS.setor), [estatisticas.porSetor]);
  const dadosNivel = useMemo(() => formatarDados(estatisticas.porNivel, LABELS.nivel_hierarquico), [estatisticas.porNivel]);
  const dadosAreaAtuacao = useMemo(() => formatarDados(estatisticas.porAreaAtuacao, LABELS.area_atuacao).slice(0, 12), [estatisticas.porAreaAtuacao]);
  const dadosTipoOrgao = useMemo(() => formatarDados(estatisticas.porTipoOrgao, LABELS.tipo_orgao).slice(0, 10), [estatisticas.porTipoOrgao]);
  const dadosSetorPrivado = useMemo(() => formatarDados(estatisticas.porSetorPrivado, LABELS.setor_privado).slice(0, 10), [estatisticas.porSetorPrivado]);
  const dadosPorteEmpresa = useMemo(() => formatarDados(estatisticas.porPorteEmpresa, LABELS.porte_empresa), [estatisticas.porPorteEmpresa]);
  const dadosEstiloLideranca = useMemo(() => formatarDados(estatisticas.porEstiloLideranca, LABELS.estilo_lideranca).slice(0, 10), [estatisticas.porEstiloLideranca]);
  const dadosLocalizacao = useMemo(() => formatarDados(estatisticas.porLocalizacao).slice(0, 10), [estatisticas.porLocalizacao]);
  const dadosRegiao = useMemo(() => formatarDados(estatisticas.porRegiao), [estatisticas.porRegiao]);
  const dadosFormacao = useMemo(() => formatarDados(estatisticas.porFormacao).slice(0, 10), [estatisticas.porFormacao]);
  const dadosDesafio = useMemo(() => formatarDados(estatisticas.porDesafio).slice(0, 10), [estatisticas.porDesafio]);
  const dadosCompetencia = useMemo(() => formatarDados(estatisticas.porCompetencia).slice(0, 10), [estatisticas.porCompetencia]);
  const dadosMotivacao = useMemo(() => formatarDados(estatisticas.porMotivacao).slice(0, 8), [estatisticas.porMotivacao]);
  const dadosFrustracao = useMemo(() => formatarDados(estatisticas.porFrustracao).slice(0, 8), [estatisticas.porFrustracao]);

  // Dados PODC para radar
  const dadosPODC = useMemo(() => {
    if (!estatisticas.mediaPODC) return [];
    return [
      { subject: 'Planejar', A: estatisticas.mediaPODC.planejar, fullMark: 100 },
      { subject: 'Organizar', A: estatisticas.mediaPODC.organizar, fullMark: 100 },
      { subject: 'Dirigir', A: estatisticas.mediaPODC.dirigir, fullMark: 100 },
      { subject: 'Controlar', A: estatisticas.mediaPODC.controlar, fullMark: 100 },
    ];
  }, [estatisticas.mediaPODC]);

  // Dados PODC para barras
  const dadosPODCBarra = useMemo(() => {
    if (!estatisticas.mediaPODC) return [];
    return [
      { nome: 'Planejar', valor: estatisticas.mediaPODC.planejar, percentual: estatisticas.mediaPODC.planejar.toFixed(1) },
      { nome: 'Organizar', valor: estatisticas.mediaPODC.organizar, percentual: estatisticas.mediaPODC.organizar.toFixed(1) },
      { nome: 'Dirigir', valor: estatisticas.mediaPODC.dirigir, percentual: estatisticas.mediaPODC.dirigir.toFixed(1) },
      { nome: 'Controlar', valor: estatisticas.mediaPODC.controlar, percentual: estatisticas.mediaPODC.controlar.toFixed(1) },
    ];
  }, [estatisticas.mediaPODC]);

  // Faixas etarias
  const faixasEtarias = useMemo(() => {
    const faixas = [
      { faixa: '25-34', min: 25, max: 34 },
      { faixa: '35-44', min: 35, max: 44 },
      { faixa: '45-54', min: 45, max: 54 },
      { faixa: '55-64', min: 55, max: 64 },
      { faixa: '65+', min: 65, max: 120 },
    ];

    return faixas.map(({ faixa, min, max }) => {
      const count = gestores.filter(g => g.idade >= min && g.idade <= max).length;
      return { faixa, valor: count, percentual: ((count / total) * 100).toFixed(1) };
    });
  }, [gestores, total]);

  // Tooltip comum
  const tooltipStyle = {
    contentStyle: { background: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px' },
    itemStyle: { color: '#fff' },
  };

  if (gestores.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          Selecione filtros para ver graficos dos gestores.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-y-auto h-full pr-2">
      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{gestores.length}</p>
          <p className="text-xs text-muted-foreground">Gestores</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{estatisticas.mediaIdade.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">Idade Media</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{Object.keys(estatisticas.porAreaAtuacao).length}</p>
          <p className="text-xs text-muted-foreground">Areas de Atuacao</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{Object.keys(estatisticas.porEstiloLideranca).length}</p>
          <p className="text-xs text-muted-foreground">Estilos Lideranca</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{estatisticas.mediaEquipe.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">Equipe Media</p>
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

        {/* Setor (Publico vs Privado) */}
        <ChartCard titulo="Setor" icone={Building2} corIcone="bg-blue-500/20">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={dadosSetor}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="valor"
                nameKey="nome"
                label={({ nome, percentual }) => `${nome}: ${percentual}%`}
              >
                {dadosSetor.map((_, index) => (
                  <Cell key={index} fill={CORES.setor[index % CORES.setor.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Nivel Hierarquico */}
        <ChartCard titulo="Nivel Hierarquico" icone={Layers} corIcone="bg-purple-500/20">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={dadosNivel}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="valor"
                nameKey="nome"
                label={({ nome, percentual }) => `${nome}: ${percentual}%`}
              >
                {dadosNivel.map((_, index) => (
                  <Cell key={index} fill={CORES.nivel[index % CORES.nivel.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* PODC - Radar */}
        {dadosPODC.length > 0 && (
          <ChartCard titulo="Distribuicao PODC (Media)" icone={Compass} corIcone="bg-cyan-500/20">
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={dadosPODC}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis stroke="#9ca3af" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="PODC" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Tooltip {...tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* PODC - Barras */}
        {dadosPODCBarra.length > 0 && (
          <ChartCard titulo="PODC - Distribuicao de Tempo (%)" icone={Clock} corIcone="bg-indigo-500/20">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosPODCBarra}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip {...tooltipStyle} formatter={(value: number) => [`${value.toFixed(1)}%`, 'Media']} />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                  {dadosPODCBarra.map((_, index) => (
                    <Cell key={index} fill={CORES.podc[index % CORES.podc.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Area de Atuacao */}
        <ChartCard titulo="Area de Atuacao (Top 12)" icone={Briefcase} corIcone="bg-emerald-500/20">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dadosAreaAtuacao} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <YAxis dataKey="nome" type="category" width={90} stroke="#9ca3af" tick={{ fontSize: 9 }} />
              <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Gestores']} />
              <Bar dataKey="valor" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Estilo de Lideranca */}
        <ChartCard titulo="Estilo de Lideranca (Top 10)" icone={Award} corIcone="bg-violet-500/20">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosEstiloLideranca} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <YAxis dataKey="nome" type="category" width={100} stroke="#9ca3af" tick={{ fontSize: 9 }} />
              <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Gestores']} />
              <Bar dataKey="valor" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Tipo de Orgao (Setor Publico) */}
        {dadosTipoOrgao.length > 0 && (
          <ChartCard titulo="Tipo de Orgao (Setor Publico)" icone={Building} corIcone="bg-blue-500/20">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosTipoOrgao} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis dataKey="nome" type="category" width={100} stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Gestores']} />
                <Bar dataKey="valor" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Setor Privado */}
        {dadosSetorPrivado.length > 0 && (
          <ChartCard titulo="Setor da Economia (Privado)" icone={Factory} corIcone="bg-green-500/20">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosSetorPrivado} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis dataKey="nome" type="category" width={90} stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Gestores']} />
                <Bar dataKey="valor" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Porte da Empresa */}
        {dadosPorteEmpresa.length > 0 && (
          <ChartCard titulo="Porte da Empresa (Privado)" icone={TrendingUp} corIcone="bg-amber-500/20">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dadosPorteEmpresa}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="valor"
                  nameKey="nome"
                  label={({ percentual }) => `${percentual}%`}
                >
                  {dadosPorteEmpresa.map((_, index) => (
                    <Cell key={index} fill={CORES.primarias[index % CORES.primarias.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Faixa Etaria */}
        <ChartCard titulo="Faixa Etaria" icone={Activity} corIcone="bg-green-500/20">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={faixasEtarias}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="faixa" stroke="#9ca3af" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Gestores']} />
              <Bar dataKey="valor" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Regiao */}
        {dadosRegiao.length > 0 && (
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
        )}

        {/* Localizacao (Top 10) */}
        <ChartCard titulo="Localizacao (Top 10)" icone={MapPin} corIcone="bg-teal-500/20">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosLocalizacao} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <YAxis dataKey="nome" type="category" width={100} stroke="#9ca3af" tick={{ fontSize: 9 }} />
              <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Gestores']} />
              <Bar dataKey="valor" fill="#14b8a6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Formacao Academica (Top 10) */}
        {dadosFormacao.length > 0 && (
          <ChartCard titulo="Formacao Academica (Top 10)" icone={GraduationCap} corIcone="bg-blue-500/20">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosFormacao} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis dataKey="nome" type="category" width={120} stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Gestores']} />
                <Bar dataKey="valor" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Desafios Cotidianos (Top 10) */}
        {dadosDesafio.length > 0 && (
          <ChartCard titulo="Desafios Cotidianos (Top 10)" icone={Target} corIcone="bg-red-500/20">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosDesafio} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis dataKey="nome" type="category" width={140} stroke="#9ca3af" tick={{ fontSize: 8 }} />
                <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Gestores']} />
                <Bar dataKey="valor" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Competencias Distintivas (Top 10) */}
        {dadosCompetencia.length > 0 && (
          <ChartCard titulo="Competencias Distintivas (Top 10)" icone={Zap} corIcone="bg-emerald-500/20">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosCompetencia} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis dataKey="nome" type="category" width={140} stroke="#9ca3af" tick={{ fontSize: 8 }} />
                <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Gestores']} />
                <Bar dataKey="valor" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Motivacoes (Top 8) */}
        {dadosMotivacao.length > 0 && (
          <ChartCard titulo="Motivacoes (Top 8)" icone={Heart} corIcone="bg-pink-500/20">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dadosMotivacao} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis dataKey="nome" type="category" width={140} stroke="#9ca3af" tick={{ fontSize: 8 }} />
                <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Gestores']} />
                <Bar dataKey="valor" fill="#ec4899" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Frustracoes (Top 8) */}
        {dadosFrustracao.length > 0 && (
          <ChartCard titulo="Frustracoes (Top 8)" icone={Brain} corIcone="bg-orange-500/20">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dadosFrustracao} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis dataKey="nome" type="category" width={140} stroke="#9ca3af" tick={{ fontSize: 8 }} />
                <Tooltip {...tooltipStyle} formatter={(value: number, _: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Gestores']} />
                <Bar dataKey="valor" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    </div>
  );
}
