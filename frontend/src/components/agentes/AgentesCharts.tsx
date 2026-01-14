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
} from 'recharts';
import type { Eleitor } from '@/types';
import { CORES_CLUSTER, CORES_ORIENTACAO_POLITICA, CORES_GENERO, CORES_RELIGIAO } from '@/lib/utils';

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
  };
  eleitores: Eleitor[];
}

// Componente de Card de Gráfico
function ChartCard({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-semibold text-foreground mb-4">{titulo}</h3>
      {children}
    </div>
  );
}

// Labels formatados
const LABELS_CLUSTER: Record<string, string> = {
  G1_alta: 'Alta',
  G2_media_alta: 'Média-Alta',
  G3_media_baixa: 'Média-Baixa',
  G4_baixa: 'Baixa',
};

const LABELS_ORIENTACAO: Record<string, string> = {
  esquerda: 'Esquerda',
  'centro-esquerda': 'Centro-Esq',
  centro: 'Centro',
  'centro-direita': 'Centro-Dir',
  direita: 'Direita',
};

const CORES_GRAFICO_CLUSTER = ['#22c55e', '#84cc16', '#eab308', '#f97316'];
const CORES_GRAFICO_ORIENTACAO = ['#ef4444', '#f97316', '#a855f7', '#3b82f6', '#1d4ed8'];
const CORES_GRAFICO_RELIGIAO = ['#eab308', '#8b5cf6', '#06b6d4', '#6b7280', '#10b981', '#78716c'];

export function AgentesCharts({ estatisticas, eleitores }: AgentesChartsProps) {
  // Converter dados para formato do Recharts
  const dadosCluster = Object.entries(estatisticas.porCluster).map(([nome, valor]) => ({
    nome: LABELS_CLUSTER[nome] || nome,
    valor,
    percentual: ((valor / estatisticas.filtrados) * 100).toFixed(1),
  }));

  const dadosOrientacao = Object.entries(estatisticas.porOrientacao).map(([nome, valor]) => ({
    nome: LABELS_ORIENTACAO[nome] || nome,
    valor,
    percentual: ((valor / estatisticas.filtrados) * 100).toFixed(1),
  }));

  const dadosReligiao = Object.entries(estatisticas.porReligiao)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([nome, valor]) => ({
      nome: nome.charAt(0).toUpperCase() + nome.slice(1).replace(/_/g, ' '),
      valor,
      percentual: ((valor / estatisticas.filtrados) * 100).toFixed(1),
    }));

  const dadosRegiao = Object.entries(estatisticas.porRegiao)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([nome, valor]) => ({
      nome,
      valor,
      percentual: ((valor / estatisticas.filtrados) * 100).toFixed(1),
    }));

  const dadosGenero = Object.entries(estatisticas.porGenero).map(([nome, valor]) => ({
    nome: nome === 'masculino' ? 'Masculino' : 'Feminino',
    valor,
    percentual: ((valor / estatisticas.filtrados) * 100).toFixed(1),
  }));

  // Faixas etárias
  const faixasEtarias = calcularFaixasEtarias(eleitores);

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
          <p className="text-sm text-muted-foreground">Regiões Representadas</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-purple-400">{Object.keys(estatisticas.porReligiao).length}</p>
          <p className="text-sm text-muted-foreground">Religiões Diferentes</p>
        </div>
      </div>

      {/* Gráficos em grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gênero - Pizza */}
        <ChartCard titulo="Distribuição por Gênero">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dadosGenero}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="valor"
                nameKey="nome"
                label={({ nome, percentual }) => `${nome}: ${percentual}%`}
              >
                <Cell fill="#3b82f6" />
                <Cell fill="#ec4899" />
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Cluster - Pizza */}
        <ChartCard titulo="Distribuição por Classe Social">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dadosCluster}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="valor"
                nameKey="nome"
                label={({ nome, percentual }) => `${percentual}%`}
              >
                {dadosCluster.map((_, index) => (
                  <Cell key={index} fill={CORES_GRAFICO_CLUSTER[index % CORES_GRAFICO_CLUSTER.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Orientação Política - Barras Horizontais */}
        <ChartCard titulo="Espectro Político">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dadosOrientacao} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="nome" type="category" width={80} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="valor" name="Eleitores" radius={[0, 4, 4, 0]}>
                {dadosOrientacao.map((_, index) => (
                  <Cell key={index} fill={CORES_GRAFICO_ORIENTACAO[index % CORES_GRAFICO_ORIENTACAO.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Religião - Barras */}
        <ChartCard titulo="Distribuição por Religião">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dadosReligiao}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="valor" name="Eleitores" radius={[4, 4, 0, 0]}>
                {dadosReligiao.map((_, index) => (
                  <Cell key={index} fill={CORES_GRAFICO_RELIGIAO[index % CORES_GRAFICO_RELIGIAO.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Regiões - Barras Horizontais */}
        <ChartCard titulo="Top 10 Regiões Administrativas">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosRegiao} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="nome" type="category" width={100} stroke="#9ca3af" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="valor" name="Eleitores" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Pirâmide Etária */}
        <ChartCard titulo="Distribuição por Faixa Etária">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={faixasEtarias} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="faixa" type="category" width={60} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="masculino" name="Masculino" fill="#3b82f6" stackId="a" />
              <Bar dataKey="feminino" name="Feminino" fill="#ec4899" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
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
