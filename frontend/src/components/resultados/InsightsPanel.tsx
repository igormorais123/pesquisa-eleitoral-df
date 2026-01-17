'use client';

/**
 * Painel de Insights Automáticos com Visualizações Ricas
 * Gera insights estatísticos com gráficos e tabelas
 * Pesquisa Eleitoral DF 2026
 */

import { useMemo, useState } from 'react';
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Users,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MapPin,
  Heart,
  Briefcase,
  Calendar,
  Scale,
  Brain,
  MessageSquare,
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
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';
import type { Eleitor } from '@/types';
import { cn } from '@/lib/utils';

interface InsightsPanelProps {
  eleitores: Eleitor[];
  maxInsights?: number;
}

interface Insight {
  id: string;
  tipo: 'destaque' | 'alerta' | 'tendencia' | 'oportunidade' | 'correlacao';
  titulo: string;
  descricao: string;
  valor?: string;
  importancia: 'alta' | 'media' | 'baixa';
  dados?: Record<string, number | string>;
  graficoData?: Array<{ nome: string; valor: number; cor?: string }>;
}

// Cores do tema
const CORES = {
  primaria: '#8b5cf6',
  positivo: '#22c55e',
  negativo: '#ef4444',
  neutro: '#6b7280',
  alerta: '#f59e0b',
  info: '#3b82f6',
  roxo: '#a855f7',
  cyan: '#06b6d4',
  rosa: '#ec4899',
  laranja: '#f97316',
};

const CORES_GRAFICO = [CORES.primaria, CORES.positivo, CORES.negativo, CORES.alerta, CORES.info, CORES.roxo, CORES.cyan, CORES.rosa];

export function InsightsPanel({ eleitores, maxInsights = 15 }: InsightsPanelProps) {
  const [expandido, setExpandido] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'visao-geral' | 'demografico' | 'politico' | 'comportamental'>('visao-geral');

  // Análises detalhadas
  const analises = useMemo(() => {
    const total = eleitores.length;
    if (total === 0) return null;

    // Análise de gênero
    const porGenero: Record<string, number> = {};
    eleitores.forEach(e => {
      porGenero[e.genero] = (porGenero[e.genero] || 0) + 1;
    });
    const dadosGenero = Object.entries(porGenero).map(([nome, valor]) => ({
      nome: nome === 'masculino' ? 'Masculino' : nome === 'feminino' ? 'Feminino' : 'Outro',
      valor,
      percentual: Math.round((valor / total) * 100),
    }));

    // Análise de idade
    const faixasEtarias = { '18-29': 0, '30-44': 0, '45-59': 0, '60+': 0 };
    eleitores.forEach(e => {
      if (e.idade < 30) faixasEtarias['18-29']++;
      else if (e.idade < 45) faixasEtarias['30-44']++;
      else if (e.idade < 60) faixasEtarias['45-59']++;
      else faixasEtarias['60+']++;
    });
    const dadosFaixaEtaria = Object.entries(faixasEtarias).map(([nome, valor]) => ({
      nome,
      valor,
      percentual: Math.round((valor / total) * 100),
    }));
    const idadeMedia = eleitores.reduce((acc, e) => acc + e.idade, 0) / total;

    // Análise de região
    const porRegiao: Record<string, number> = {};
    eleitores.forEach(e => {
      porRegiao[e.regiao_administrativa] = (porRegiao[e.regiao_administrativa] || 0) + 1;
    });
    const dadosRegiao = Object.entries(porRegiao)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([nome, valor]) => ({
        nome: nome.length > 12 ? nome.substring(0, 12) + '...' : nome,
        nomeCompleto: nome,
        valor,
        percentual: Math.round((valor / total) * 100),
      }));

    // Análise de orientação política
    const porOrientacao: Record<string, number> = {};
    eleitores.forEach(e => {
      const orientacao = e.orientacao_politica || 'Não informado';
      porOrientacao[orientacao] = (porOrientacao[orientacao] || 0) + 1;
    });
    const dadosOrientacao = Object.entries(porOrientacao)
      .sort((a, b) => b[1] - a[1])
      .map(([nome, valor]) => ({
        nome: nome.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        valor,
        percentual: Math.round((valor / total) * 100),
        cor: nome.includes('direita') ? CORES.negativo : nome.includes('esquerda') ? CORES.positivo : nome.includes('centro') ? CORES.alerta : CORES.neutro,
      }));

    // Análise de cluster socioeconômico
    const porCluster: Record<string, number> = {};
    eleitores.forEach(e => {
      const cluster = e.cluster_socioeconomico || 'Não informado';
      porCluster[cluster] = (porCluster[cluster] || 0) + 1;
    });
    const dadosCluster = Object.entries(porCluster)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([nome, valor]) => ({
        nome,
        valor,
        percentual: Math.round((valor / total) * 100),
      }));

    // Análise de interesse político
    const porInteresse: Record<string, number> = { alto: 0, medio: 0, baixo: 0 };
    eleitores.forEach(e => {
      const interesse = e.interesse_politico || 'medio';
      porInteresse[interesse] = (porInteresse[interesse] || 0) + 1;
    });
    const dadosInteresse = [
      { nome: 'Alto', valor: porInteresse.alto, percentual: Math.round((porInteresse.alto / total) * 100), cor: CORES.positivo },
      { nome: 'Médio', valor: porInteresse.medio, percentual: Math.round((porInteresse.medio / total) * 100), cor: CORES.alerta },
      { nome: 'Baixo', valor: porInteresse.baixo, percentual: Math.round((porInteresse.baixo / total) * 100), cor: CORES.negativo },
    ];

    // Análise de religião
    const porReligiao: Record<string, number> = {};
    eleitores.forEach(e => {
      const religiao = e.religiao || 'Não informado';
      porReligiao[religiao] = (porReligiao[religiao] || 0) + 1;
    });
    const dadosReligiao = Object.entries(porReligiao)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nome, valor]) => ({
        nome,
        valor,
        percentual: Math.round((valor / total) * 100),
      }));

    // Análise de susceptibilidade à desinformação
    const susceptibilidade = {
      baixa: eleitores.filter(e => (e.susceptibilidade_desinformacao ?? 5) <= 3).length,
      media: eleitores.filter(e => (e.susceptibilidade_desinformacao ?? 5) > 3 && (e.susceptibilidade_desinformacao ?? 5) <= 6).length,
      alta: eleitores.filter(e => (e.susceptibilidade_desinformacao ?? 5) > 6).length,
    };
    const dadosSusceptibilidade = [
      { nome: 'Baixa (1-3)', valor: susceptibilidade.baixa, percentual: Math.round((susceptibilidade.baixa / total) * 100), fill: CORES.positivo },
      { nome: 'Média (4-6)', valor: susceptibilidade.media, percentual: Math.round((susceptibilidade.media / total) * 100), fill: CORES.alerta },
      { nome: 'Alta (7-10)', valor: susceptibilidade.alta, percentual: Math.round((susceptibilidade.alta / total) * 100), fill: CORES.negativo },
    ];

    // Análise de tolerância a nuances
    const porTolerancia: Record<string, number> = { alta: 0, media: 0, baixa: 0 };
    eleitores.forEach(e => {
      const tolerancia = e.tolerancia_nuance || 'media';
      porTolerancia[tolerancia] = (porTolerancia[tolerancia] || 0) + 1;
    });
    const dadosTolerancia = [
      { nome: 'Alta', valor: porTolerancia.alta, percentual: Math.round((porTolerancia.alta / total) * 100), cor: CORES.positivo },
      { nome: 'Média', valor: porTolerancia.media, percentual: Math.round((porTolerancia.media / total) * 100), cor: CORES.alerta },
      { nome: 'Baixa', valor: porTolerancia.baixa, percentual: Math.round((porTolerancia.baixa / total) * 100), cor: CORES.negativo },
    ];

    // Análise de posição sobre Bolsonaro
    const porPosicaoBolsonaro: Record<string, number> = {};
    eleitores.forEach(e => {
      const posicao = e.posicao_bolsonaro || 'Não informado';
      porPosicaoBolsonaro[posicao] = (porPosicaoBolsonaro[posicao] || 0) + 1;
    });
    const dadosBolsonaro = Object.entries(porPosicaoBolsonaro)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nome, valor]) => ({
        nome: nome.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        valor,
        percentual: Math.round((valor / total) * 100),
      }));

    // Calcular polarização
    const apoiadoresFortes = eleitores.filter(e => e.posicao_bolsonaro?.includes('apoiador_forte')).length;
    const criticosFortes = eleitores.filter(e => e.posicao_bolsonaro?.includes('critico_forte')).length;
    const percentualExtremos = ((apoiadoresFortes + criticosFortes) / total) * 100;

    return {
      total,
      dadosGenero,
      dadosFaixaEtaria,
      idadeMedia,
      dadosRegiao,
      dadosOrientacao,
      dadosCluster,
      dadosInteresse,
      dadosReligiao,
      dadosSusceptibilidade,
      dadosTolerancia,
      dadosBolsonaro,
      percentualExtremos,
      apoiadoresFortes,
      criticosFortes,
    };
  }, [eleitores]);

  // Gerar insights
  const insights = useMemo(() => {
    const resultado: Insight[] = [];
    const total = eleitores.length;

    if (total === 0 || !analises) return resultado;

    // 1. Insight de gênero
    const masculino = eleitores.filter(e => e.genero === 'masculino').length;
    const feminino = eleitores.filter(e => e.genero === 'feminino').length;
    const razaoGenero = masculino / (feminino || 1);

    if (razaoGenero > 1.2 || razaoGenero < 0.8) {
      resultado.push({
        id: 'genero-desequilibrio',
        tipo: 'alerta',
        titulo: 'Desequilíbrio de Gênero',
        descricao: razaoGenero > 1.2
          ? `Amostra com ${((masculino / total) * 100).toFixed(0)}% de homens`
          : `Amostra com ${((feminino / total) * 100).toFixed(0)}% de mulheres`,
        valor: `${razaoGenero.toFixed(2)}:1`,
        importancia: 'media',
        graficoData: analises.dadosGenero,
      });
    }

    // 2. Insight de polarização
    if (analises.percentualExtremos > 40) {
      resultado.push({
        id: 'alta-polarizacao',
        tipo: 'alerta',
        titulo: 'Alta Polarização',
        descricao: `${analises.percentualExtremos.toFixed(0)}% dos eleitores têm posições extremas`,
        valor: `${analises.percentualExtremos.toFixed(0)}%`,
        importancia: 'alta',
        dados: { apoiadores: analises.apoiadoresFortes, criticos: analises.criticosFortes },
        graficoData: [
          { nome: 'Apoiadores Fortes', valor: analises.apoiadoresFortes, cor: CORES.positivo },
          { nome: 'Críticos Fortes', valor: analises.criticosFortes, cor: CORES.negativo },
          { nome: 'Moderados', valor: total - analises.apoiadoresFortes - analises.criticosFortes, cor: CORES.neutro },
        ],
      });
    }

    // 3. Susceptibilidade à desinformação
    const altaSusceptibilidade = eleitores.filter(e => (e.susceptibilidade_desinformacao ?? 5) >= 7).length;
    const percentualSusceptivel = (altaSusceptibilidade / total) * 100;

    if (percentualSusceptivel > 20) {
      resultado.push({
        id: 'susceptibilidade-alta',
        tipo: 'alerta',
        titulo: 'Risco de Desinformação',
        descricao: `${percentualSusceptivel.toFixed(0)}% com alta susceptibilidade (≥7/10)`,
        valor: `${percentualSusceptivel.toFixed(0)}%`,
        importancia: 'alta',
        graficoData: analises.dadosSusceptibilidade,
      });
    }

    // 4. Interesse político
    const interesseAlto = eleitores.filter(e => e.interesse_politico === 'alto').length;
    const interesseBaixo = eleitores.filter(e => e.interesse_politico === 'baixo').length;

    if (interesseAlto > interesseBaixo * 2) {
      resultado.push({
        id: 'alto-engajamento',
        tipo: 'destaque',
        titulo: 'Alto Engajamento Político',
        descricao: `${((interesseAlto / total) * 100).toFixed(0)}% têm alto interesse político`,
        valor: `${interesseAlto}`,
        importancia: 'media',
        graficoData: analises.dadosInteresse,
      });
    } else if (interesseBaixo > interesseAlto * 2) {
      resultado.push({
        id: 'baixo-engajamento',
        tipo: 'tendencia',
        titulo: 'Baixo Engajamento',
        descricao: `${((interesseBaixo / total) * 100).toFixed(0)}% com baixo interesse. Mobilização necessária.`,
        valor: `${interesseBaixo}`,
        importancia: 'media',
        graficoData: analises.dadosInteresse,
      });
    }

    // 5. Concentração regional
    const regiaoTop = analises.dadosRegiao[0];
    if (regiaoTop && regiaoTop.percentual > 15) {
      resultado.push({
        id: 'concentracao-regional',
        tipo: 'destaque',
        titulo: `Concentração em ${regiaoTop.nomeCompleto}`,
        descricao: `${regiaoTop.percentual}% da amostra em uma única região`,
        valor: `${regiaoTop.valor}`,
        importancia: 'baixa',
        graficoData: analises.dadosRegiao.slice(0, 5),
      });
    }

    // 6. Análise etária
    const jovens = eleitores.filter(e => e.idade < 30).length;
    const idosos = eleitores.filter(e => e.idade >= 60).length;

    if (jovens / total > 0.4) {
      resultado.push({
        id: 'amostra-jovem',
        tipo: 'oportunidade',
        titulo: 'Amostra Jovem',
        descricao: `${((jovens / total) * 100).toFixed(0)}% < 30 anos. Priorize redes sociais.`,
        valor: `${analises.idadeMedia.toFixed(0)} anos`,
        importancia: 'media',
        graficoData: analises.dadosFaixaEtaria,
      });
    } else if (idosos / total > 0.3) {
      resultado.push({
        id: 'amostra-idosa',
        tipo: 'oportunidade',
        titulo: 'Público Maduro',
        descricao: `${((idosos / total) * 100).toFixed(0)}% têm 60+ anos. Considere mídia tradicional.`,
        valor: `${analises.idadeMedia.toFixed(0)} anos`,
        importancia: 'media',
        graficoData: analises.dadosFaixaEtaria,
      });
    }

    // 7. Religião predominante
    const religiaoTop = analises.dadosReligiao[0];
    if (religiaoTop && religiaoTop.nome !== 'Não informado' && religiaoTop.percentual > 40) {
      resultado.push({
        id: 'religiao-predominante',
        tipo: 'destaque',
        titulo: `Maioria ${religiaoTop.nome}`,
        descricao: `${religiaoTop.percentual}% da amostra. Adapte valores e linguagem.`,
        valor: `${religiaoTop.valor}`,
        importancia: 'media',
        graficoData: analises.dadosReligiao,
      });
    }

    // 8. Tolerância a nuances
    const toleranciaBaixa = eleitores.filter(e => e.tolerancia_nuance === 'baixa').length;
    const toleranciaAlta = eleitores.filter(e => e.tolerancia_nuance === 'alta').length;

    if (toleranciaBaixa > toleranciaAlta * 2) {
      resultado.push({
        id: 'baixa-tolerancia',
        tipo: 'alerta',
        titulo: 'Baixa Tolerância a Nuances',
        descricao: 'Maioria não aceita posições intermediárias. Seja direto.',
        valor: `${((toleranciaBaixa / total) * 100).toFixed(0)}%`,
        importancia: 'media',
        graficoData: analises.dadosTolerancia,
      });
    }

    // 9. Classe social
    const classeAlta = eleitores.filter(e =>
      e.cluster_socioeconomico?.includes('alta') || e.cluster_socioeconomico?.includes('G1')
    ).length;
    const classeBaixa = eleitores.filter(e =>
      e.cluster_socioeconomico?.includes('baixa') || e.cluster_socioeconomico?.includes('G4')
    ).length;

    if (classeAlta / total > 0.3) {
      resultado.push({
        id: 'classe-alta',
        tipo: 'destaque',
        titulo: 'Classes A/B Predominantes',
        descricao: `${((classeAlta / total) * 100).toFixed(0)}% pertencem às classes altas`,
        valor: `${classeAlta}`,
        importancia: 'baixa',
        graficoData: analises.dadosCluster,
      });
    } else if (classeBaixa / total > 0.3) {
      resultado.push({
        id: 'classe-baixa',
        tipo: 'destaque',
        titulo: 'Classes C/D/E Predominantes',
        descricao: `${((classeBaixa / total) * 100).toFixed(0)}% pertencem às classes mais baixas`,
        valor: `${classeBaixa}`,
        importancia: 'baixa',
        graficoData: analises.dadosCluster,
      });
    }

    // Ordenar por importância
    const ordemImportancia = { alta: 0, media: 1, baixa: 2 };
    resultado.sort((a, b) => ordemImportancia[a.importancia] - ordemImportancia[b.importancia]);

    return resultado.slice(0, maxInsights);
  }, [eleitores, analises, maxInsights]);

  const iconesPorTipo: Record<string, typeof Lightbulb> = {
    destaque: Sparkles,
    alerta: AlertTriangle,
    tendencia: TrendingUp,
    oportunidade: Target,
    correlacao: TrendingDown,
  };

  const coresPorTipo: Record<string, { bg: string; text: string; border: string }> = {
    destaque: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/50' },
    alerta: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/50' },
    tendencia: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/50' },
    oportunidade: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/50' },
    correlacao: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/50' },
  };

  if (!analises || eleitores.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Insights Automáticos</h3>
            <p className="text-sm text-muted-foreground">Nenhum dado disponível para análise</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Análise Visual da Amostra</h3>
              <p className="text-sm text-muted-foreground">
                {analises.total} eleitores • {insights.length} insights gerados
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpandido(!expandido)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            {expandido ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Abas de navegação */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'visao-geral', label: 'Visão Geral', icon: BarChart3 },
            { id: 'demografico', label: 'Demográfico', icon: Users },
            { id: 'politico', label: 'Político', icon: Scale },
            { id: 'comportamental', label: 'Comportamental', icon: Brain },
          ].map(aba => (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id as typeof abaAtiva)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                abaAtiva === aba.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
              )}
            >
              <aba.icon className="w-4 h-4" />
              {aba.label}
            </button>
          ))}
        </div>

        {expandido && (
          <>
            {/* Aba: Visão Geral */}
            {abaAtiva === 'visao-geral' && (
              <div className="space-y-6">
                {/* Cards de métricas principais */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl p-4 border border-blue-500/20">
                    <Users className="w-5 h-5 text-blue-400 mb-2" />
                    <p className="text-2xl font-bold text-foreground">{analises.total}</p>
                    <p className="text-xs text-muted-foreground">Total Eleitores</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl p-4 border border-purple-500/20">
                    <Calendar className="w-5 h-5 text-purple-400 mb-2" />
                    <p className="text-2xl font-bold text-foreground">{analises.idadeMedia.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">Idade Média</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl p-4 border border-orange-500/20">
                    <AlertTriangle className="w-5 h-5 text-orange-400 mb-2" />
                    <p className="text-2xl font-bold text-foreground">{analises.percentualExtremos.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Polarização</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-4 border border-green-500/20">
                    <MapPin className="w-5 h-5 text-green-400 mb-2" />
                    <p className="text-2xl font-bold text-foreground">{analises.dadosRegiao.length}</p>
                    <p className="text-xs text-muted-foreground">Regiões</p>
                  </div>
                </div>

                {/* Gráficos lado a lado */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico de Gênero */}
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      Distribuição por Gênero
                    </h4>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={analises.dadosGenero}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="valor"
                          nameKey="nome"
                        >
                          {analises.dadosGenero.map((_, index) => (
                            <Cell key={index} fill={CORES_GRAFICO[index % CORES_GRAFICO.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                          formatter={(value: number, name: string) => [`${value} (${((value / analises.total) * 100).toFixed(0)}%)`, name]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Gráfico de Faixa Etária */}
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Faixas Etárias
                    </h4>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={analises.dadosFaixaEtaria} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="nome" width={50} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                          formatter={(value: number) => [`${value} (${((value / analises.total) * 100).toFixed(0)}%)`, 'Eleitores']}
                        />
                        <Bar dataKey="valor" fill={CORES.primaria} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tabela resumo */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Métrica</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">Valor</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">%</th>
                        <th className="py-3 px-4 text-muted-foreground font-medium">Visual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analises.dadosOrientacao.slice(0, 5).map((item, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                          <td className="py-3 px-4 text-foreground">{item.nome}</td>
                          <td className="py-3 px-4 text-right text-foreground font-medium">{item.valor}</td>
                          <td className="py-3 px-4 text-right text-muted-foreground">{item.percentual}%</td>
                          <td className="py-3 px-4">
                            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${item.percentual}%`, backgroundColor: item.cor }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Aba: Demográfico */}
            {abaAtiva === 'demografico' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Regiões */}
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Top Regiões Administrativas
                    </h4>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={analises.dadosRegiao} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="nome" width={100} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                          formatter={(value: number) => [`${value} eleitores`, 'Total']}
                        />
                        <Bar dataKey="valor" fill={CORES.info} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Religião */}
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-primary" />
                      Distribuição por Religião
                    </h4>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={analises.dadosReligiao}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="valor"
                          nameKey="nome"
                          label={({ nome, percentual }) => `${nome}: ${percentual}%`}
                          labelLine={false}
                        >
                          {analises.dadosReligiao.map((_, index) => (
                            <Cell key={index} fill={CORES_GRAFICO[index % CORES_GRAFICO.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Cluster Socioeconômico */}
                <div className="bg-secondary/30 rounded-xl p-4">
                  <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    Clusters Socioeconômicos
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {analises.dadosCluster.map((item, i) => (
                      <div
                        key={i}
                        className="bg-secondary/50 rounded-lg p-3 text-center border border-border/50"
                      >
                        <p className="text-xl font-bold text-foreground">{item.percentual}%</p>
                        <p className="text-xs text-muted-foreground truncate" title={item.nome}>{item.nome}</p>
                        <p className="text-xs text-primary mt-1">{item.valor} eleitores</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Aba: Político */}
            {abaAtiva === 'politico' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Orientação Política */}
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-primary" />
                      Espectro Político
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analises.dadosOrientacao}>
                        <XAxis dataKey="nome" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                        <YAxis hide />
                        <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} />
                        <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                          {analises.dadosOrientacao.map((entry, index) => (
                            <Cell key={index} fill={entry.cor} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Posição Bolsonaro */}
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Posição sobre Bolsonaro
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analises.dadosBolsonaro} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="nome" width={120} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} />
                        <Bar dataKey="valor" fill={CORES.roxo} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Interesse Político */}
                <div className="bg-secondary/30 rounded-xl p-4">
                  <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Nível de Interesse Político
                  </h4>
                  <div className="flex items-center gap-4">
                    {analises.dadosInteresse.map((item, i) => (
                      <div key={i} className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">{item.nome}</span>
                          <span className="text-sm font-bold" style={{ color: item.cor }}>{item.percentual}%</span>
                        </div>
                        <div className="h-4 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${item.percentual}%`, backgroundColor: item.cor }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{item.valor} eleitores</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Indicador de Polarização */}
                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-500/30">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">Índice de Polarização</h4>
                      <p className="text-sm text-muted-foreground">
                        {analises.percentualExtremos.toFixed(0)}% dos eleitores têm posições extremas
                        ({analises.apoiadoresFortes} apoiadores fortes, {analises.criticosFortes} críticos fortes)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-orange-400">{analises.percentualExtremos.toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">
                        {analises.percentualExtremos > 50 ? 'ALTA' : analises.percentualExtremos > 30 ? 'MODERADA' : 'BAIXA'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Aba: Comportamental */}
            {abaAtiva === 'comportamental' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Susceptibilidade à Desinformação */}
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-primary" />
                      Susceptibilidade à Desinformação
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="30%"
                        outerRadius="90%"
                        data={analises.dadosSusceptibilidade}
                        startAngle={180}
                        endAngle={0}
                      >
                        <RadialBar
                          dataKey="valor"
                          cornerRadius={5}
                          background={{ fill: '#374151' }}
                        />
                        <Legend
                          iconSize={10}
                          layout="horizontal"
                          verticalAlign="bottom"
                          wrapperStyle={{ fontSize: '11px' }}
                        />
                        <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Tolerância a Nuances */}
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" />
                      Tolerância a Nuances Políticas
                    </h4>
                    <div className="space-y-4">
                      {analises.dadosTolerancia.map((item, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-foreground">{item.nome}</span>
                            <span className="text-sm font-bold" style={{ color: item.cor }}>
                              {item.valor} ({item.percentual}%)
                            </span>
                          </div>
                          <div className="h-6 bg-secondary rounded-lg overflow-hidden relative">
                            <div
                              className="h-full rounded-lg transition-all flex items-center justify-end pr-2"
                              style={{ width: `${item.percentual}%`, backgroundColor: item.cor }}
                            >
                              {item.percentual > 15 && (
                                <span className="text-xs font-bold text-white">{item.percentual}%</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Resumo Comportamental */}
                <div className="bg-secondary/30 rounded-xl p-6">
                  <h4 className="font-medium text-foreground mb-4">Perfil Comportamental da Amostra</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <p className="text-3xl font-bold text-foreground">
                        {analises.dadosInteresse.find(i => i.nome === 'Alto')?.percentual || 0}%
                      </p>
                      <p className="text-sm text-muted-foreground">Politicamente Engajados</p>
                      <div className="mt-2 h-1 bg-secondary rounded">
                        <div
                          className="h-full bg-green-500 rounded"
                          style={{ width: `${analises.dadosInteresse.find(i => i.nome === 'Alto')?.percentual || 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <p className="text-3xl font-bold text-foreground">
                        {analises.dadosSusceptibilidade.find(s => s.nome === 'Alta (7-10)')?.percentual || 0}%
                      </p>
                      <p className="text-sm text-muted-foreground">Vulneráveis à Desinformação</p>
                      <div className="mt-2 h-1 bg-secondary rounded">
                        <div
                          className="h-full bg-red-500 rounded"
                          style={{ width: `${analises.dadosSusceptibilidade.find(s => s.nome === 'Alta (7-10)')?.percentual || 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <p className="text-3xl font-bold text-foreground">
                        {analises.dadosTolerancia.find(t => t.nome === 'Baixa')?.percentual || 0}%
                      </p>
                      <p className="text-sm text-muted-foreground">Intolerantes a Nuances</p>
                      <div className="mt-2 h-1 bg-secondary rounded">
                        <div
                          className="h-full bg-orange-500 rounded"
                          style={{ width: `${analises.dadosTolerancia.find(t => t.nome === 'Baixa')?.percentual || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Seção de Insights com mini-gráficos */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Insights Automáticos</h3>
            <p className="text-sm text-muted-foreground">{insights.length} insights detectados</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight) => {
            const Icone = iconesPorTipo[insight.tipo];
            const cores = coresPorTipo[insight.tipo];

            return (
              <div
                key={insight.id}
                className={cn(
                  'p-4 rounded-xl border transition-all hover:shadow-lg',
                  cores.bg,
                  cores.border
                )}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', cores.bg)}>
                    <Icone className={cn('w-5 h-5', cores.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{insight.titulo}</h4>
                      <span className={cn(
                        'w-2 h-2 rounded-full',
                        insight.importancia === 'alta' ? 'bg-red-500' :
                        insight.importancia === 'media' ? 'bg-amber-500' : 'bg-green-500'
                      )} />
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.descricao}</p>
                  </div>
                  {insight.valor && (
                    <div className={cn('text-right flex-shrink-0', cores.text)}>
                      <span className="text-xl font-bold">{insight.valor}</span>
                    </div>
                  )}
                </div>

                {/* Mini gráfico do insight */}
                {insight.graficoData && insight.graficoData.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <ResponsiveContainer width="100%" height={80}>
                      <BarChart data={insight.graficoData.slice(0, 5)} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="nome" width={60} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '6px', fontSize: '11px' }} />
                        <Bar dataKey="valor" radius={[0, 3, 3, 0]}>
                          {insight.graficoData.slice(0, 5).map((entry, index) => (
                            <Cell key={index} fill={entry.cor || CORES_GRAFICO[index % CORES_GRAFICO.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default InsightsPanel;
