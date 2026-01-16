'use client';

import { useMemo } from 'react';
import {
  Users,
  MapPin,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Vote,
  Brain,
  Activity,
  Wallet,
  Heart,
} from 'lucide-react';
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
} from 'recharts';
import type { Eleitor } from '@/types';
import { formatarNumero } from '@/lib/utils';

interface MiniDashboardProps {
  eleitores: Eleitor[];
  totalGeral: number;
}

const CORES = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
const CORES_ORIENTACAO = ['#ef4444', '#f97316', '#a855f7', '#3b82f6', '#1d4ed8'];

const LABELS_ORIENTACAO: Record<string, string> = {
  esquerda: 'Esquerda',
  'centro-esquerda': 'Centro-Esq',
  centro: 'Centro',
  'centro-direita': 'Centro-Dir',
  direita: 'Direita',
};

const LABELS_CLUSTER: Record<string, string> = {
  G1_alta: 'Alta',
  G2_media_alta: 'Média-Alta',
  G3_media_baixa: 'Média-Baixa',
  G4_baixa: 'Baixa',
};

function calcularDistribuicao(eleitores: Eleitor[], campo: keyof Eleitor): Record<string, number> {
  const distribuicao: Record<string, number> = {};
  eleitores.forEach((e) => {
    const valor = String(e[campo] || 'Não informado');
    distribuicao[valor] = (distribuicao[valor] || 0) + 1;
  });
  return distribuicao;
}

function StatCard({
  titulo,
  valor,
  subtitulo,
  icone: Icone,
  cor,
}: {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icone: React.ElementType;
  cor: string;
}) {
  return (
    <div className="bg-secondary/50 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg ${cor} flex items-center justify-center`}>
          <Icone className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{titulo}</p>
          <p className="text-lg font-bold text-foreground">{valor}</p>
          {subtitulo && <p className="text-xs text-muted-foreground">{subtitulo}</p>}
        </div>
      </div>
    </div>
  );
}

export function MiniDashboard({ eleitores, totalGeral }: MiniDashboardProps) {
  const stats = useMemo(() => {
    const total = eleitores.length;
    if (total === 0) return null;

    const mediaIdade = eleitores.reduce((acc, e) => acc + e.idade, 0) / total;
    const genero = calcularDistribuicao(eleitores, 'genero');
    const cluster = calcularDistribuicao(eleitores, 'cluster_socioeconomico');
    const orientacao = calcularDistribuicao(eleitores, 'orientacao_politica');
    const regiao = calcularDistribuicao(eleitores, 'regiao_administrativa');

    // Top 3 regiões
    const topRegioes = Object.entries(regiao)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([nome, valor]) => ({ nome, valor, percentual: ((valor / total) * 100).toFixed(0) }));

    // Dados para gráficos
    const dadosGenero = Object.entries(genero).map(([nome, valor]) => ({
      nome: nome === 'masculino' ? 'Masc' : 'Fem',
      valor,
      percentual: ((valor / total) * 100).toFixed(0),
    }));

    const dadosCluster = Object.entries(cluster).map(([nome, valor]) => ({
      nome: LABELS_CLUSTER[nome] || nome,
      valor,
      percentual: ((valor / total) * 100).toFixed(0),
    }));

    const dadosOrientacao = Object.entries(orientacao).map(([nome, valor]) => ({
      nome: LABELS_ORIENTACAO[nome] || nome,
      valor,
      percentual: ((valor / total) * 100).toFixed(0),
    }));

    return {
      total,
      mediaIdade,
      dadosGenero,
      dadosCluster,
      dadosOrientacao,
      topRegioes,
      percentualTotal: ((total / totalGeral) * 100).toFixed(1),
    };
  }, [eleitores, totalGeral]);

  if (!stats || eleitores.length === 0) {
    return (
      <div className="bg-secondary/30 rounded-lg p-4 text-center text-muted-foreground">
        Nenhum eleitor para exibir estatísticas
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Resumo do Grupo</h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {stats.percentualTotal}% do total
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          titulo="Eleitores"
          valor={formatarNumero(stats.total)}
          subtitulo={`de ${formatarNumero(totalGeral)}`}
          icone={Users}
          cor="bg-blue-500"
        />
        <StatCard
          titulo="Idade Média"
          valor={`${stats.mediaIdade.toFixed(0)} anos`}
          icone={Activity}
          cor="bg-orange-500"
        />
      </div>

      {/* Mini Charts */}
      <div className="grid grid-cols-2 gap-3">
        {/* Gênero */}
        <div className="bg-secondary/30 rounded-lg p-2">
          <p className="text-xs text-muted-foreground mb-1 text-center">Gênero</p>
          <ResponsiveContainer width="100%" height={80}>
            <PieChart>
              <Pie
                data={stats.dadosGenero}
                cx="50%"
                cy="50%"
                innerRadius={20}
                outerRadius={35}
                dataKey="valor"
              >
                <Cell fill="#3b82f6" />
                <Cell fill="#ec4899" />
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value: number, name: string, props: any) => [`${value} (${props.payload.percentual}%)`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {stats.dadosGenero[0]?.percentual || 0}%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-pink-500" />
              {stats.dadosGenero[1]?.percentual || 0}%
            </span>
          </div>
        </div>

        {/* Orientação */}
        <div className="bg-secondary/30 rounded-lg p-2">
          <p className="text-xs text-muted-foreground mb-1 text-center">Espectro Político</p>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={stats.dadosOrientacao} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="nome" type="category" hide />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value: number, name: string, props: any) => [`${value} (${props.payload.percentual}%)`, '']}
              />
              <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                {stats.dadosOrientacao.map((_, index) => (
                  <Cell key={index} fill={CORES_ORIENTACAO[index % CORES_ORIENTACAO.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Regiões */}
      <div className="bg-secondary/30 rounded-lg p-2">
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Top Regiões
        </p>
        <div className="space-y-1">
          {stats.topRegioes.map((regiao, index) => (
            <div key={regiao.nome} className="flex items-center justify-between text-xs">
              <span className="text-foreground truncate max-w-[140px]">{regiao.nome}</span>
              <span className="text-muted-foreground">{regiao.percentual}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Classe Social */}
      <div className="bg-secondary/30 rounded-lg p-2">
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Classe Social
        </p>
        <div className="flex flex-wrap gap-1">
          {stats.dadosCluster.map((item, index) => (
            <span
              key={item.nome}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${CORES[index]}20`, color: CORES[index] }}
            >
              {item.nome}: {item.percentual}%
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
