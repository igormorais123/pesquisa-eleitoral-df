'use client';

/**
 * Gráficos de Candidatos
 *
 * Visualização de todas as características dos candidatos em gráficos.
 */

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
} from 'recharts';
import {
  Users,
  Building2,
  Compass,
  Target,
  TrendingUp,
  AlertTriangle,
  Award,
  Vote,
} from 'lucide-react';
import type { Candidato } from '@/types';

interface CandidatosChartsProps {
  candidatos: Candidato[];
}

// Cores para os gráficos
const CORES_PARTIDOS: Record<string, string> = {
  PL: '#0066CC',
  PP: '#1E3A8A',
  MDB: '#00AA55',
  PT: '#FF0000',
  PSB: '#FF6B00',
  PV: '#00AA00',
  PDT: '#FF4444',
  REPUBLICANOS: '#0033AA',
  PSOL: '#FFDD00',
  UNIÃO: '#6366F1',
  CIDADANIA: '#8B5CF6',
  NOVO: '#F97316',
  PSD: '#3B82F6',
  default: '#6B7280',
};

const CORES_ORIENTACAO: Record<string, string> = {
  esquerda: '#EF4444',
  'centro-esquerda': '#F97316',
  centro: '#EAB308',
  'centro-direita': '#3B82F6',
  direita: '#1E3A8A',
};

const CORES_POSICAO: Record<string, string> = {
  apoiador_forte: '#22C55E',
  apoiador_moderado: '#84CC16',
  neutro: '#EAB308',
  opositor_moderado: '#F97316',
  opositor_forte: '#EF4444',
};

const CORES_CARGO: Record<string, string> = {
  governador: '#6366F1',
  senador: '#3B82F6',
  deputado_federal: '#22C55E',
  deputado_distrital: '#EAB308',
  vice_governador: '#8B5CF6',
};

const CORES_GENERO: Record<string, string> = {
  masculino: '#3B82F6',
  feminino: '#EC4899',
};

// Componente de gráfico de pizza genérico
function GraficoPizza({
  titulo,
  dados,
  cores,
  icon: Icon,
}: {
  titulo: string;
  dados: { nome: string; valor: number }[];
  cores: Record<string, string>;
  icon: React.ElementType;
}) {
  const total = dados.reduce((acc, d) => acc + d.valor, 0);

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-primary" />
        <h3 className="font-medium text-foreground">{titulo}</h3>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={dados}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            dataKey="valor"
            nameKey="nome"
            label={({ nome, valor }) => `${nome}: ${valor}`}
            labelLine={false}
          >
            {dados.map((entry, index) => (
              <Cell key={index} fill={cores[entry.nome] || cores.default || '#6B7280'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              border: 'none',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, 'Quantidade']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-2 mt-2 justify-center">
        {dados.map((d, i) => (
          <span key={i} className="flex items-center gap-1 text-xs">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: cores[d.nome] || cores.default || '#6B7280' }}
            />
            {d.nome}
          </span>
        ))}
      </div>
    </div>
  );
}

// Componente de gráfico de barras horizontais
function GraficoBarrasHorizontal({
  titulo,
  dados,
  cor,
  icon: Icon,
  sufixo = '',
}: {
  titulo: string;
  dados: { nome: string; valor: number }[];
  cor: string;
  icon: React.ElementType;
  sufixo?: string;
}) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-primary" />
        <h3 className="font-medium text-foreground">{titulo}</h3>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={dados} layout="vertical" margin={{ left: 80, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" stroke="#9CA3AF" />
          <YAxis
            type="category"
            dataKey="nome"
            stroke="#9CA3AF"
            tick={{ fontSize: 11 }}
            width={75}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              border: 'none',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`${value}${sufixo}`, 'Valor']}
          />
          <Bar dataKey="valor" fill={cor} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Componente de radar de características
function GraficoRadar({
  titulo,
  dados,
  icon: Icon,
}: {
  titulo: string;
  dados: { caracteristica: string; valor: number; fullMark: number }[];
  icon: React.ElementType;
}) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-primary" />
        <h3 className="font-medium text-foreground">{titulo}</h3>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={dados}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="caracteristica" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9CA3AF" />
          <Radar
            name="Média"
            dataKey="valor"
            stroke="#6366F1"
            fill="#6366F1"
            fillOpacity={0.5}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              border: 'none',
              borderRadius: '8px',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CandidatosCharts({ candidatos }: CandidatosChartsProps) {
  // Calcular estatísticas
  const estatisticas = useMemo(() => {
    // Por partido
    const porPartido: Record<string, number> = {};
    candidatos.forEach((c) => {
      const partido = c.partido || 'Sem partido';
      porPartido[partido] = (porPartido[partido] || 0) + 1;
    });

    // Por cargo
    const porCargo: Record<string, number> = {};
    candidatos.forEach((c) => {
      const cargo = c.cargo_pretendido || 'Não definido';
      porCargo[cargo] = (porCargo[cargo] || 0) + 1;
    });

    // Por gênero
    const porGenero: Record<string, number> = {};
    candidatos.forEach((c) => {
      const genero = c.genero || 'Não informado';
      porGenero[genero] = (porGenero[genero] || 0) + 1;
    });

    // Por orientação política
    const porOrientacao: Record<string, number> = {};
    candidatos.forEach((c) => {
      const orientacao = c.orientacao_politica || 'Não definida';
      porOrientacao[orientacao] = (porOrientacao[orientacao] || 0) + 1;
    });

    // Por posição sobre Bolsonaro
    const porPosicaoBolsonaro: Record<string, number> = {};
    candidatos.forEach((c) => {
      const posicao = c.posicao_bolsonaro || 'Não definida';
      porPosicaoBolsonaro[posicao] = (porPosicaoBolsonaro[posicao] || 0) + 1;
    });

    // Intenção de voto (top 10)
    const intencaoVoto = candidatos
      .filter((c) => c.votos_ultima_eleicao && c.votos_ultima_eleicao > 0)
      .sort((a, b) => (b.votos_ultima_eleicao || 0) - (a.votos_ultima_eleicao || 0))
      .slice(0, 10)
      .map((c) => ({
        nome: c.nome_urna,
        valor: Math.round((c.votos_ultima_eleicao || 0) / 1000),
      }));

    // Rejeição estimada
    const rejeicao = candidatos
      .filter((c) => c.rejeicao_estimada !== undefined)
      .map((c) => ({
        nome: c.nome_urna,
        valor: c.rejeicao_estimada || 0,
      }))
      .sort((a, b) => b.valor - a.valor);

    // Conhecimento estimado
    const conhecimento = candidatos
      .filter((c) => c.conhecimento_estimado !== undefined)
      .map((c) => ({
        nome: c.nome_urna,
        valor: c.conhecimento_estimado || 0,
      }))
      .sort((a, b) => b.valor - a.valor);

    // Média de características
    const mediaConhecimento = candidatos
      .filter((c) => c.conhecimento_estimado)
      .reduce((acc, c) => acc + (c.conhecimento_estimado || 0), 0) / candidatos.length || 0;

    const mediaRejeicao = candidatos
      .filter((c) => c.rejeicao_estimada)
      .reduce((acc, c) => acc + (c.rejeicao_estimada || 0), 0) / candidatos.length || 0;

    // Pontos fortes e fracos (contagem)
    const totalPontosFortes = candidatos.reduce(
      (acc, c) => acc + (c.pontos_fortes?.length || 0),
      0
    );
    const totalPontosFracos = candidatos.reduce(
      (acc, c) => acc + (c.pontos_fracos?.length || 0),
      0
    );
    const totalControversias = candidatos.reduce(
      (acc, c) => acc + (c.controversias?.length || 0),
      0
    );

    return {
      porPartido: Object.entries(porPartido).map(([nome, valor]) => ({ nome, valor })),
      porCargo: Object.entries(porCargo).map(([nome, valor]) => ({ nome, valor })),
      porGenero: Object.entries(porGenero).map(([nome, valor]) => ({ nome, valor })),
      porOrientacao: Object.entries(porOrientacao).map(([nome, valor]) => ({ nome, valor })),
      porPosicaoBolsonaro: Object.entries(porPosicaoBolsonaro).map(([nome, valor]) => ({
        nome,
        valor,
      })),
      intencaoVoto,
      rejeicao,
      conhecimento,
      radar: [
        { caracteristica: 'Conhecimento', valor: mediaConhecimento, fullMark: 100 },
        { caracteristica: 'Rejeição', valor: mediaRejeicao, fullMark: 100 },
        { caracteristica: 'Pontos Fortes', valor: Math.min((totalPontosFortes / candidatos.length) * 20, 100), fullMark: 100 },
        { caracteristica: 'Pontos Fracos', valor: Math.min((totalPontosFracos / candidatos.length) * 25, 100), fullMark: 100 },
        { caracteristica: 'Controvérsias', valor: Math.min((totalControversias / candidatos.length) * 50, 100), fullMark: 100 },
      ],
    };
  }, [candidatos]);

  if (candidatos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum candidato para exibir gráficos.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="font-semibold text-foreground mb-4">
          Resumo dos Candidatos ({candidatos.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {estatisticas.porPartido.length}
            </div>
            <div className="text-xs text-muted-foreground">Partidos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {estatisticas.porGenero.find((g) => g.nome === 'feminino')?.valor || 0}
            </div>
            <div className="text-xs text-muted-foreground">Mulheres</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {estatisticas.porCargo.find((c) => c.nome === 'governador')?.valor || 0}
            </div>
            <div className="text-xs text-muted-foreground">P/ Governador</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {estatisticas.porCargo.find((c) => c.nome === 'senador')?.valor || 0}
            </div>
            <div className="text-xs text-muted-foreground">P/ Senador</div>
          </div>
        </div>
      </div>

      {/* Grid de gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Por Partido */}
        <GraficoPizza
          titulo="Por Partido"
          dados={estatisticas.porPartido}
          cores={CORES_PARTIDOS}
          icon={Building2}
        />

        {/* Por Cargo */}
        <GraficoPizza
          titulo="Por Cargo Pretendido"
          dados={estatisticas.porCargo}
          cores={CORES_CARGO}
          icon={Target}
        />

        {/* Por Gênero */}
        <GraficoPizza
          titulo="Por Gênero"
          dados={estatisticas.porGenero}
          cores={CORES_GENERO}
          icon={Users}
        />

        {/* Por Orientação Política */}
        <GraficoPizza
          titulo="Por Orientação Política"
          dados={estatisticas.porOrientacao}
          cores={CORES_ORIENTACAO}
          icon={Compass}
        />

        {/* Por Posição Bolsonaro */}
        <GraficoPizza
          titulo="Posição sobre Bolsonaro"
          dados={estatisticas.porPosicaoBolsonaro}
          cores={CORES_POSICAO}
          icon={Vote}
        />

        {/* Radar de características */}
        <GraficoRadar
          titulo="Média de Características"
          dados={estatisticas.radar}
          icon={Award}
        />
      </div>

      {/* Gráficos de barras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {estatisticas.intencaoVoto.length > 0 && (
          <GraficoBarrasHorizontal
            titulo="Votos na Última Eleição (mil)"
            dados={estatisticas.intencaoVoto}
            cor="#6366F1"
            icon={TrendingUp}
            sufixo=" mil"
          />
        )}

        {estatisticas.conhecimento.length > 0 && (
          <GraficoBarrasHorizontal
            titulo="Conhecimento Estimado (%)"
            dados={estatisticas.conhecimento}
            cor="#22C55E"
            icon={Users}
            sufixo="%"
          />
        )}

        {estatisticas.rejeicao.length > 0 && (
          <GraficoBarrasHorizontal
            titulo="Rejeição Estimada (%)"
            dados={estatisticas.rejeicao}
            cor="#EF4444"
            icon={AlertTriangle}
            sufixo="%"
          />
        )}
      </div>
    </div>
  );
}

export default CandidatosCharts;
