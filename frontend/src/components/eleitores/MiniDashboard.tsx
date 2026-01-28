'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Activity,
  MapPin,
  Vote,
  Brain,
  TrendingUp,
  ChevronRight,
  Wallet,
  Church,
  BarChart3,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';
import type { Eleitor } from '@/types';
import { formatarNumero, formatarPercentual } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Cores para gráficos
const CORES = {
  genero: ['#3b82f6', '#ec4899'],
  cluster: ['#22c55e', '#84cc16', '#eab308', '#f97316'],
  orientacao: ['#ef4444', '#f97316', '#a855f7', '#3b82f6', '#1d4ed8'],
};

const LABELS = {
  cluster: {
    G1_alta: 'Alta',
    G2_media_alta: 'Méd-Alta',
    G3_media_baixa: 'Méd-Baixa',
    G4_baixa: 'Baixa',
  } as Record<string, string>,
  orientacao: {
    esquerda: 'Esq',
    'centro-esquerda': 'C-Esq',
    centro: 'Centro',
    'centro-direita': 'C-Dir',
    direita: 'Dir',
  } as Record<string, string>,
};

interface MiniDashboardProps {
  eleitoresFiltrados: Eleitor[];
  totalEleitores: number;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function MiniDashboard({
  eleitoresFiltrados,
  totalEleitores,
  isCollapsed = false,
  onToggle,
}: MiniDashboardProps) {
  // Calcular estatísticas do grupo filtrado
  const stats = useMemo(() => {
    const total = eleitoresFiltrados.length;
    if (total === 0) return null;

    const mediaIdade = eleitoresFiltrados.reduce((acc, e) => acc + e.idade, 0) / total;

    // Distribuições
    const genero: Record<string, number> = {};
    const cluster: Record<string, number> = {};
    const orientacao: Record<string, number> = {};
    const religiao: Record<string, number> = {};
    const regiao: Record<string, number> = {};
    const interesse: Record<string, number> = {};

    eleitoresFiltrados.forEach((e) => {
      genero[e.genero] = (genero[e.genero] || 0) + 1;
      cluster[e.cluster_socioeconomico] = (cluster[e.cluster_socioeconomico] || 0) + 1;
      orientacao[e.orientacao_politica] = (orientacao[e.orientacao_politica] || 0) + 1;
      religiao[e.religiao] = (religiao[e.religiao] || 0) + 1;
      regiao[e.regiao_administrativa] = (regiao[e.regiao_administrativa] || 0) + 1;
      interesse[e.interesse_politico] = (interesse[e.interesse_politico] || 0) + 1;
    });

    // Região mais comum
    const regiaoTop = Object.entries(regiao).sort((a, b) => b[1] - a[1])[0];

    // Susceptibilidade média
    const susceptMedia =
      eleitoresFiltrados.reduce((acc, e) => acc + (e.susceptibilidade_desinformacao || 0), 0) /
      total;

    return {
      total,
      mediaIdade,
      genero,
      cluster,
      orientacao,
      religiao,
      regiaoTop,
      interesse,
      susceptMedia,
      percentual: ((total / totalEleitores) * 100).toFixed(1),
    };
  }, [eleitoresFiltrados, totalEleitores]);

  if (!stats) {
    return (
      <div className="glass-card rounded-xl p-4 text-center text-muted-foreground">
        <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhum eleitor no filtro atual</p>
      </div>
    );
  }

  // Dados para gráficos mini
  const dadosGenero = Object.entries(stats.genero).map(([nome, valor]) => ({
    nome: nome === 'masculino' ? 'M' : 'F',
    valor,
  }));

  const dadosCluster = Object.entries(stats.cluster).map(([nome, valor]) => ({
    nome: LABELS.cluster[nome] || nome,
    valor,
    valorOriginal: nome,
  }));

  const dadosOrientacao = Object.entries(stats.orientacao).map(([nome, valor]) => ({
    nome: LABELS.orientacao[nome] || nome,
    valor,
    valorOriginal: nome,
  }));

  if (isCollapsed) {
    return (
      <button
        onClick={onToggle}
        className="glass-card rounded-xl p-3 w-full flex items-center justify-between hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Resumo do Grupo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatarNumero(stats.total)} eleitores
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </button>
    );
  }

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-medium text-foreground">Resumo do Grupo Selecionado</h3>
        </div>
        <Link
          href="/dashboard"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Ver dashboard completo
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Stats principais */}
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center p-2 bg-secondary/30 rounded-lg">
          <Users className="w-4 h-4 mx-auto text-blue-400 mb-1" />
          <p className="text-lg font-bold text-foreground">{formatarNumero(stats.total)}</p>
          <p className="text-[10px] text-muted-foreground">{stats.percentual}% do total</p>
        </div>
        <div className="text-center p-2 bg-secondary/30 rounded-lg">
          <Activity className="w-4 h-4 mx-auto text-orange-400 mb-1" />
          <p className="text-lg font-bold text-foreground">{stats.mediaIdade.toFixed(0)}</p>
          <p className="text-[10px] text-muted-foreground">Idade média</p>
        </div>
        <div className="text-center p-2 bg-secondary/30 rounded-lg">
          <MapPin className="w-4 h-4 mx-auto text-cyan-400 mb-1" />
          <p className="text-sm font-bold text-foreground truncate" title={stats.regiaoTop?.[0]}>
            {stats.regiaoTop?.[0]?.substring(0, 10)}...
          </p>
          <p className="text-[10px] text-muted-foreground">Região top</p>
        </div>
        <div className="text-center p-2 bg-secondary/30 rounded-lg">
          <Brain className="w-4 h-4 mx-auto text-purple-400 mb-1" />
          <p className="text-lg font-bold text-foreground">{stats.susceptMedia.toFixed(1)}</p>
          <p className="text-[10px] text-muted-foreground">Suscept. média</p>
        </div>
      </div>

      {/* Mini gráficos */}
      <div className="grid grid-cols-3 gap-3">
        {/* Gênero - Mini Donut */}
        <div className="bg-secondary/20 rounded-lg p-2">
          <p className="text-[10px] text-muted-foreground mb-1 text-center">Gênero</p>
          <ResponsiveContainer width="100%" height={60}>
            <PieChart>
              <Pie
                data={dadosGenero}
                cx="50%"
                cy="50%"
                innerRadius={15}
                outerRadius={25}
                dataKey="valor"
              >
                <Cell fill="#3b82f6" />
                <Cell fill="#ec4899" />
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '6px', fontSize: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-2 text-[9px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              M
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-pink-500" />
              F
            </span>
          </div>
        </div>

        {/* Classe Social - Mini Bars */}
        <div className="bg-secondary/20 rounded-lg p-2">
          <p className="text-[10px] text-muted-foreground mb-1 text-center">Classe</p>
          <ResponsiveContainer width="100%" height={60}>
            <BarChart data={dadosCluster} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="nome" type="category" hide />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '6px', fontSize: '10px' }}
              />
              <Bar dataKey="valor" radius={[0, 2, 2, 0]}>
                {dadosCluster.map((_, index) => (
                  <Cell key={index} fill={CORES.cluster[index % CORES.cluster.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-1 text-[8px] flex-wrap">
            {dadosCluster.slice(0, 2).map((d, i) => (
              <span key={i} className="flex items-center gap-0.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: CORES.cluster[i] }}
                />
                {d.nome}
              </span>
            ))}
          </div>
        </div>

        {/* Orientação Política - Mini Bars */}
        <div className="bg-secondary/20 rounded-lg p-2">
          <p className="text-[10px] text-muted-foreground mb-1 text-center">Política</p>
          <ResponsiveContainer width="100%" height={60}>
            <BarChart data={dadosOrientacao}>
              <XAxis dataKey="nome" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '6px', fontSize: '10px' }}
              />
              <Bar dataKey="valor" radius={[2, 2, 0, 0]}>
                {dadosOrientacao.map((_, index) => (
                  <Cell key={index} fill={CORES.orientacao[index % CORES.orientacao.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-1 text-[8px]">
            <span className="text-red-400">Esq</span>
            <span className="text-purple-400">C</span>
            <span className="text-blue-400">Dir</span>
          </div>
        </div>
      </div>

      {/* Interesse político */}
      <div className="flex items-center justify-between text-xs bg-secondary/20 rounded-lg p-2">
        <span className="text-muted-foreground">Interesse Político:</span>
        <div className="flex gap-2">
          {Object.entries(stats.interesse).map(([nivel, count]) => (
            <span
              key={nivel}
              className={cn(
                'px-2 py-0.5 rounded text-[10px]',
                nivel === 'alto' && 'bg-green-500/20 text-green-400',
                nivel === 'medio' && 'bg-yellow-500/20 text-yellow-400',
                nivel === 'baixo' && 'bg-red-500/20 text-red-400'
              )}
            >
              {nivel}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center pt-2 border-t border-border">
        <p className="text-[10px] text-muted-foreground">
          Clique nos gráficos do dashboard para filtrar diretamente
        </p>
      </div>
    </div>
  );
}
