'use client';

import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Vote,
  MapPin,
  Church,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  GraduationCap,
  Heart,
  Brain,
  Smartphone,
  Car,
  Wallet,
  UserCheck,
  Scale,
  Eye,
  ExternalLink,
  MousePointerClick,
} from 'lucide-react';
import Link from 'next/link';
import { useFilterNavigation, FilterType } from '@/hooks/useFilterNavigation';
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
  Treemap,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Line,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts';
import { api } from '@/services/api';
import { formatarNumero, formatarPercentual } from '@/lib/utils';
import eleitoresData from '@/data/eleitores-df-400.json';
import type { Eleitor } from '@/types';
import dynamic from 'next/dynamic';
import { ResumoValidacao, TooltipComFonte, BadgeDivergenciaGrafico } from '@/components/validacao';
import {
  mapaDadosReferencia,
  type DadoReferencia,
} from '@/data/dados-referencia-oficiais';
import { useDivergencias, type MapaDivergencias } from '@/hooks/useDivergencias';

// Importar mapa de calor dinamicamente para evitar SSR issues
const MapaCalorEleitoral = dynamic(
  () => import('@/components/dashboard/MapaCalorEleitoral'),
  { ssr: false, loading: () => <div className="glass-card rounded-xl p-6 h-[600px] animate-pulse bg-secondary/20" /> }
);

// Cores para gráficos
const CORES = {
  primarias: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'],
  genero: ['#3b82f6', '#ec4899'],
  cluster: ['#22c55e', '#84cc16', '#eab308', '#f97316'],
  orientacao: ['#ef4444', '#f97316', '#a855f7', '#3b82f6', '#1d4ed8'],
  religiao: ['#eab308', '#8b5cf6', '#06b6d4', '#6b7280', '#10b981', '#78716c'],
  raca: ['#f8fafc', '#d4a574', '#8b4513', '#fcd34d', '#dc2626'],
  escolaridade: ['#fecaca', '#fed7aa', '#fef08a', '#bbf7d0', '#99f6e4'],
  renda: ['#fee2e2', '#fef3c7', '#d9f99d', '#a7f3d0', '#6ee7b7'],
  decisao: ['#f472b6', '#c084fc', '#60a5fa', '#34d399', '#fbbf24'],
  interesse: ['#fca5a5', '#fdba74', '#4ade80'],
};

// Card de estatística
function CardEstatistica({
  titulo,
  valor,
  subtitulo,
  icone: Icone,
  corIcone,
  tendencia,
}: {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icone: React.ElementType;
  corIcone: string;
  tendencia?: { valor: number; positivo: boolean };
}) {
  return (
    <div className="glass-card rounded-xl p-6 hover:shadow-primary-glow transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{titulo}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{valor}</p>
          {subtitulo && (
            <p className="text-xs text-muted-foreground mt-1">{subtitulo}</p>
          )}
          {tendencia && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${
                tendencia.positivo ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {tendencia.positivo ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span>{formatarPercentual(tendencia.valor)}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${corIcone} flex items-center justify-center`}>
          <Icone className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

// Card de ação rápida
function CardAcaoRapida({
  titulo,
  descricao,
  href,
  icone: Icone,
  cor,
}: {
  titulo: string;
  descricao: string;
  href: string;
  icone: React.ElementType;
  cor: string;
}) {
  return (
    <Link
      href={href}
      className="glass-card rounded-xl p-5 hover:border-primary/50 transition-all duration-300 group"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${cor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icone className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
            {titulo}
          </h3>
          <p className="text-sm text-muted-foreground">{descricao}</p>
        </div>
      </div>
    </Link>
  );
}

// Componente de Card de Gráfico com suporte a fonte oficial e clicabilidade
function GraficoCard({
  titulo,
  subtitulo,
  icone: Icone,
  corIcone,
  children,
  className = '',
  dadoReferencia,
  desvioMedio,
  isClickable = false,
  filterHint,
}: {
  titulo: string;
  subtitulo?: string;
  icone: React.ElementType;
  corIcone: string;
  children: React.ReactNode;
  className?: string;
  dadoReferencia?: DadoReferencia;
  desvioMedio?: number;
  isClickable?: boolean;
  filterHint?: string;
}) {
  return (
    <div className={`glass-card rounded-xl p-6 ${className} ${isClickable ? 'group' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${corIcone} flex items-center justify-center`}>
            <Icone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{titulo}</h3>
            {subtitulo && <p className="text-xs text-muted-foreground">{subtitulo}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Indicador de clicável */}
          {isClickable && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <MousePointerClick className="w-3 h-3" />
              <span>{filterHint || 'Clique para filtrar'}</span>
            </div>
          )}
          {/* Indicador de desvio médio */}
          {desvioMedio !== undefined && (
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              desvioMedio <= 3 ? 'bg-green-500/15 text-green-500' :
              desvioMedio <= 7 ? 'bg-blue-500/15 text-blue-500' :
              desvioMedio <= 12 ? 'bg-yellow-500/15 text-yellow-500' :
              'bg-red-500/15 text-red-500'
            }`}>
              Δ {desvioMedio.toFixed(1)}%
            </div>
          )}
        </div>
      </div>
      {children}
      {/* Fonte oficial */}
      {dadoReferencia && (
        <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Ref: {dadoReferencia.fonte} ({dadoReferencia.ano})</span>
          <a
            href={dadoReferencia.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1"
          >
            Fonte <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      )}
    </div>
  );
}

// Funções auxiliares para calcular estatísticas
function calcularDistribuicao(eleitores: Eleitor[], campo: keyof Eleitor): Record<string, number> {
  const distribuicao: Record<string, number> = {};
  eleitores.forEach((e) => {
    const valor = String(e[campo] || 'Não informado');
    distribuicao[valor] = (distribuicao[valor] || 0) + 1;
  });
  return distribuicao;
}

function calcularDistribuicaoArray(eleitores: Eleitor[], campo: keyof Eleitor): Record<string, number> {
  const distribuicao: Record<string, number> = {};
  eleitores.forEach((e) => {
    const valores = e[campo] as string[] | undefined;
    if (valores && Array.isArray(valores)) {
      valores.forEach((v) => {
        distribuicao[v] = (distribuicao[v] || 0) + 1;
      });
    }
  });
  return distribuicao;
}

function calcularFaixaEtaria(eleitores: Eleitor[]): { faixa: string; total: number; masculino: number; feminino: number }[] {
  const faixas = [
    { faixa: '16-24', min: 16, max: 24 },
    { faixa: '25-34', min: 25, max: 34 },
    { faixa: '35-44', min: 35, max: 44 },
    { faixa: '45-54', min: 45, max: 54 },
    { faixa: '55-64', min: 55, max: 64 },
    { faixa: '65+', min: 65, max: 120 },
  ];

  return faixas.map(({ faixa, min, max }) => {
    const masculino = eleitores.filter((e) => e.genero === 'masculino' && e.idade >= min && e.idade <= max).length;
    const feminino = eleitores.filter((e) => e.genero === 'feminino' && e.idade >= min && e.idade <= max).length;
    return { faixa, total: masculino + feminino, masculino, feminino };
  });
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
    fundamental_incompleto: 'Fund. Incompleto',
    fundamental_completo: 'Fund. Completo',
    medio_incompleto: 'Médio Incompleto',
    medio_completo_ou_sup_incompleto: 'Médio/Sup. Inc.',
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

/**
 * Calcula o desvio médio para uma variável
 */
function calcularDesvioMedio(divergencias: MapaDivergencias, variavel: string): number {
  const divs = divergencias[variavel];
  if (!divs) return 0;
  const valores = Object.values(divs);
  if (valores.length === 0) return 0;
  const soma = valores.reduce((acc, d) => acc + Math.abs(d.diferenca), 0);
  return soma / valores.length;
}

export default function PaginaInicial() {
  const eleitores = eleitoresData as Eleitor[];
  const { navigateWithFilter } = useFilterNavigation();

  // Handler para clique em gráficos - navega para eleitores com filtro
  const createChartClickHandler = useCallback(
    (filterType: FilterType, valueMapper?: (payload: any) => string) => {
      return (data: any) => {
        if (data?.activePayload?.[0]?.payload) {
          const payload = data.activePayload[0].payload;
          const value = valueMapper
            ? valueMapper(payload)
            : payload.valorOriginal || payload.nome || payload.name;
          if (value) {
            navigateWithFilter(filterType, value);
          }
        }
      };
    },
    [navigateWithFilter]
  );

  // Hook para calcular divergências
  const divergencias = useDivergencias(eleitores);

  // Calcula desvios médios para cada variável
  const desviosMedios = useMemo(() => ({
    genero: calcularDesvioMedio(divergencias, 'genero'),
    cor_raca: calcularDesvioMedio(divergencias, 'cor_raca'),
    faixa_etaria: calcularDesvioMedio(divergencias, 'faixa_etaria'),
    cluster_socioeconomico: calcularDesvioMedio(divergencias, 'cluster_socioeconomico'),
    escolaridade: calcularDesvioMedio(divergencias, 'escolaridade'),
    ocupacao_vinculo: calcularDesvioMedio(divergencias, 'ocupacao_vinculo'),
    renda_salarios_minimos: calcularDesvioMedio(divergencias, 'renda_salarios_minimos'),
    religiao: calcularDesvioMedio(divergencias, 'religiao'),
    estado_civil: calcularDesvioMedio(divergencias, 'estado_civil'),
    orientacao_politica: calcularDesvioMedio(divergencias, 'orientacao_politica'),
    interesse_politico: calcularDesvioMedio(divergencias, 'interesse_politico'),
    posicao_bolsonaro: calcularDesvioMedio(divergencias, 'posicao_bolsonaro'),
    estilo_decisao: calcularDesvioMedio(divergencias, 'estilo_decisao'),
    tolerancia_nuance: calcularDesvioMedio(divergencias, 'tolerancia_nuance'),
    meio_transporte: calcularDesvioMedio(divergencias, 'meio_transporte'),
  }), [divergencias]);

  // Performance: Memoiza todas as estatísticas (calculado uma vez, não a cada render)
  const stats = useMemo(() => ({
    total: eleitores.length,
    mediaIdade: eleitores.reduce((acc, e) => acc + e.idade, 0) / eleitores.length,
    genero: calcularDistribuicao(eleitores, 'genero'),
    cluster: calcularDistribuicao(eleitores, 'cluster_socioeconomico'),
    orientacao: calcularDistribuicao(eleitores, 'orientacao_politica'),
    religiao: calcularDistribuicao(eleitores, 'religiao'),
    regiao: calcularDistribuicao(eleitores, 'regiao_administrativa'),
    corRaca: calcularDistribuicao(eleitores, 'cor_raca'),
    escolaridade: calcularDistribuicao(eleitores, 'escolaridade'),
    ocupacao: calcularDistribuicao(eleitores, 'ocupacao_vinculo'),
    renda: calcularDistribuicao(eleitores, 'renda_salarios_minimos'),
    estadoCivil: calcularDistribuicao(eleitores, 'estado_civil'),
    interesse: calcularDistribuicao(eleitores, 'interesse_politico'),
    estiloDecisao: calcularDistribuicao(eleitores, 'estilo_decisao'),
    tolerancia: calcularDistribuicao(eleitores, 'tolerancia_nuance'),
    bolsonaro: calcularDistribuicao(eleitores, 'posicao_bolsonaro'),
    transporte: calcularDistribuicao(eleitores, 'meio_transporte'),
    fontes: calcularDistribuicaoArray(eleitores, 'fontes_informacao'),
    vieses: calcularDistribuicaoArray(eleitores, 'vieses_cognitivos'),
    valores: calcularDistribuicaoArray(eleitores, 'valores'),
    preocupacoes: calcularDistribuicaoArray(eleitores, 'preocupacoes'),
    faixasEtarias: calcularFaixaEtaria(eleitores),
  }), [eleitores]);

  // Performance: Memoiza todas as transformações de dados para gráficos
  const dadosGraficos = useMemo(() => {
    const dadosGenero = Object.entries(stats.genero).map(([nome, valor]) => ({
      nome: nome === 'masculino' ? 'Masculino' : 'Feminino',
      valor,
      percentual: ((valor / stats.total) * 100).toFixed(1),
    }));

    const dadosCluster = Object.entries(stats.cluster).map(([nome, valor]) => ({
      nome: LABELS.cluster[nome] || nome,
      valor,
      percentual: ((valor / stats.total) * 100).toFixed(1),
    }));

    const dadosOrientacao = Object.entries(stats.orientacao).map(([nome, valor]) => ({
      nome: LABELS.orientacao[nome] || nome,
      valor,
      percentual: ((valor / stats.total) * 100).toFixed(1),
    }));

    const dadosReligiao = Object.entries(stats.religiao)
      .sort((a, b) => b[1] - a[1])
      .map(([nome, valor]) => ({
        nome: nome.charAt(0).toUpperCase() + nome.slice(1).replace(/_/g, ' '),
        valor,
        percentual: ((valor / stats.total) * 100).toFixed(1),
      }));

    const dadosRegiao = Object.entries(stats.regiao)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([nome, valor]) => ({
        nome,
        valor,
        percentual: ((valor / stats.total) * 100).toFixed(1),
      }));

    const dadosCorRaca = Object.entries(stats.corRaca)
      .sort((a, b) => b[1] - a[1])
      .map(([nome, valor]) => ({
        nome: nome.charAt(0).toUpperCase() + nome.slice(1),
        valor,
        percentual: ((valor / stats.total) * 100).toFixed(1),
      }));

    const dadosEscolaridade = Object.entries(stats.escolaridade)
      .map(([nome, valor]) => ({
        nome: LABELS.escolaridade[nome] || nome,
        valor,
        percentual: ((valor / stats.total) * 100).toFixed(1),
      }));

    const dadosOcupacao = Object.entries(stats.ocupacao)
      .sort((a, b) => b[1] - a[1])
      .map(([nome, valor]) => ({
        nome: LABELS.ocupacao[nome] || nome,
        valor,
        percentual: ((valor / stats.total) * 100).toFixed(1),
      }));

    const dadosRenda = Object.entries(stats.renda)
      .map(([nome, valor]) => ({
        nome: LABELS.renda[nome] || nome,
        valor,
        percentual: ((valor / stats.total) * 100).toFixed(1),
      }));

    const dadosEstadoCivil = Object.entries(stats.estadoCivil)
      .sort((a, b) => b[1] - a[1])
      .map(([nome, valor]) => ({
        nome: nome.charAt(0).toUpperCase() + nome.slice(1).replace(/[()]/g, ''),
        valor,
        percentual: ((valor / stats.total) * 100).toFixed(1),
      }));

    const dadosInteresse = Object.entries(stats.interesse)
      .map(([nome, valor]) => ({
        nome: LABELS.interesse[nome] || nome,
        valor,
        percentual: ((valor / stats.total) * 100).toFixed(1),
        fill: nome === 'baixo' ? CORES.interesse[0] : nome === 'medio' ? CORES.interesse[1] : CORES.interesse[2],
      }));

    const dadosDecisao = Object.entries(stats.estiloDecisao)
      .filter(([nome]) => nome !== 'undefined')
      .map(([nome, valor]) => ({
        nome: LABELS.decisao[nome] || nome,
        valor,
        percentual: ((valor / stats.total) * 100).toFixed(1),
      }));

    const dadosTolerancia = Object.entries(stats.tolerancia)
      .filter(([nome]) => nome !== 'undefined')
      .map(([nome, valor]) => ({
        nome: LABELS.tolerancia[nome] || nome,
        valor,
        percentual: ((valor / stats.total) * 100).toFixed(1),
      }));

    const dadosBolsonaro = Object.entries(stats.bolsonaro)
      .map(([nome, valor]) => ({
        nome: LABELS.bolsonaro[nome] || nome,
        valor,
        percentual: ((valor / stats.total) * 100).toFixed(1),
      }));

    const dadosTransporte = Object.entries(stats.transporte)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([nome, valor]) => ({
        nome: nome.replace(/_/g, ' ').charAt(0).toUpperCase() + nome.replace(/_/g, ' ').slice(1),
        valor,
        percentual: ((valor / stats.total) * 100).toFixed(1),
      }));

    const dadosFontes = Object.entries(stats.fontes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([nome, valor]) => ({
        nome: nome.length > 20 ? nome.substring(0, 20) + '...' : nome,
        valor,
        percentual: ((valor / stats.total) * 100).toFixed(1),
      }));

    const dadosVieses = Object.entries(stats.vieses)
      .map(([nome, valor]) => ({
        nome: nome.replace(/_/g, ' ').charAt(0).toUpperCase() + nome.replace(/_/g, ' ').slice(1),
        valor,
        percentual: ((valor / stats.total) * 100).toFixed(1),
        fullMark: stats.total,
      }));

    const dadosValores = Object.entries(stats.valores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([nome, valor]) => ({
        nome,
        valor,
        percentual: ((valor / stats.total) * 100).toFixed(1),
      }));

    const dadosPreocupacoes = Object.entries(stats.preocupacoes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([nome, valor]) => ({
        nome,
        valor,
        percentual: ((valor / stats.total) * 100).toFixed(1),
      }));

    // Dados para radar de perfil psicológico
    const dadosRadarPsicologico = [
      { subject: 'Confirmação', A: stats.vieses['confirmacao'] || 0 },
      { subject: 'Disponibilidade', A: stats.vieses['disponibilidade'] || 0 },
      { subject: 'Aversão Perda', A: stats.vieses['aversao_perda'] || 0 },
      { subject: 'Tribalismo', A: stats.vieses['tribalismo'] || 0 },
    ];

    // Calcular estatísticas de filhos - otimizado: single-pass
    let comFilhos = 0;
    let susceptBaixa = 0;
    let susceptMedia = 0;
    let susceptAlta = 0;

    for (const e of eleitores) {
      if (e.filhos > 0) comFilhos++;
      const suscept = e.susceptibilidade_desinformacao || 0;
      if (suscept <= 3) susceptBaixa++;
      else if (suscept <= 6) susceptMedia++;
      else susceptAlta++;
    }

    const semFilhos = stats.total - comFilhos;
    const dadosFilhos = [
      { nome: 'Com filhos', valor: comFilhos, percentual: ((comFilhos / stats.total) * 100).toFixed(1) },
      { nome: 'Sem filhos', valor: semFilhos, percentual: ((semFilhos / stats.total) * 100).toFixed(1) },
    ];

    const dadosSuscept = [
      { nome: 'Baixa (1-3)', valor: susceptBaixa, percentual: ((susceptBaixa / stats.total) * 100).toFixed(1), fill: '#22c55e' },
      { nome: 'Média (4-6)', valor: susceptMedia, percentual: ((susceptMedia / stats.total) * 100).toFixed(1), fill: '#eab308' },
      { nome: 'Alta (7-10)', valor: susceptAlta, percentual: ((susceptAlta / stats.total) * 100).toFixed(1), fill: '#ef4444' },
    ];

    return {
      dadosGenero,
      dadosCluster,
      dadosOrientacao,
      dadosReligiao,
      dadosRegiao,
      dadosCorRaca,
      dadosEscolaridade,
      dadosOcupacao,
      dadosRenda,
      dadosEstadoCivil,
      dadosInteresse,
      dadosDecisao,
      dadosTolerancia,
      dadosBolsonaro,
      dadosTransporte,
      dadosFontes,
      dadosVieses,
      dadosValores,
      dadosPreocupacoes,
      dadosRadarPsicologico,
      dadosFilhos,
      dadosSuscept,
    };
  }, [stats, eleitores]);

  // Desestrutura os dados memoizados
  const {
    dadosGenero,
    dadosCluster,
    dadosOrientacao,
    dadosReligiao,
    dadosRegiao,
    dadosCorRaca,
    dadosEscolaridade,
    dadosOcupacao,
    dadosRenda,
    dadosEstadoCivil,
    dadosInteresse,
    dadosDecisao,
    dadosTolerancia,
    dadosBolsonaro,
    dadosTransporte,
    dadosFontes,
    dadosValores,
    dadosPreocupacoes,
    dadosRadarPsicologico,
    dadosFilhos,
    dadosSuscept,
  } = dadosGraficos;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Dashboard de Análise Eleitoral
        </h1>
        <p className="text-muted-foreground mt-2">
          Visão completa do perfil dos {stats.total} eleitores sintéticos do Distrito Federal para as eleições de 2026.
        </p>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardEstatistica
          titulo="Total de Eleitores"
          valor={formatarNumero(stats.total)}
          subtitulo="Agentes sintéticos cadastrados"
          icone={Users}
          corIcone="bg-blue-500"
        />
        <CardEstatistica
          titulo="Média de Idade"
          valor={`${stats.mediaIdade.toFixed(1)} anos`}
          subtitulo="Dos eleitores cadastrados"
          icone={Activity}
          corIcone="bg-orange-500"
        />
        <CardEstatistica
          titulo="Regiões Abrangidas"
          valor={Object.keys(stats.regiao).length}
          subtitulo="Regiões administrativas do DF"
          icone={MapPin}
          corIcone="bg-cyan-500"
        />
        <CardEstatistica
          titulo="Ocupações Diferentes"
          valor={Object.keys(stats.ocupacao).length}
          subtitulo="Tipos de vínculos empregatícios"
          icone={Briefcase}
          corIcone="bg-purple-500"
        />
      </div>

      {/* Ações Rápidas e Validação */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-foreground mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardAcaoRapida
              titulo="Ver Eleitores"
              descricao="Visualize e filtre os agentes sintéticos"
              href="/eleitores"
              icone={Users}
              cor="bg-blue-500"
            />
            <CardAcaoRapida
              titulo="Nova Entrevista"
              descricao="Crie uma nova pesquisa ou questionário"
              href="/entrevistas/nova"
              icone={MessageSquare}
              cor="bg-purple-500"
            />
            <CardAcaoRapida
              titulo="Ver Resultados"
              descricao="Analise os resultados das pesquisas"
              href="/resultados"
              icone={BarChart3}
              cor="bg-green-500"
            />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Qualidade da Amostra</h2>
          <ResumoValidacao eleitores={eleitores} />
        </div>
      </div>

      {/* ============================================ */}
      {/* SEÇÃO: MAPA DE CALOR ELEITORAL */}
      {/* ============================================ */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-cyan-500" />
          Mapa Eleitoral por Região
        </h2>
        <MapaCalorEleitoral eleitores={eleitores} />
      </div>

      {/* ============================================ */}
      {/* SEÇÃO 1: PERFIL DEMOGRÁFICO */}
      {/* ============================================ */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          Perfil Demográfico
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gênero - Donut */}
          <GraficoCard
            titulo="Distribuição por Gênero"
            icone={Users}
            corIcone="bg-pink-500/20"
            dadoReferencia={mapaDadosReferencia.genero}
            desvioMedio={desviosMedios.genero}
          >
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
                <Tooltip
                  content={(props) => (
                    <TooltipComFonte
                      {...props}
                      dadoReferencia={mapaDadosReferencia.genero}
                      categoriaMap={{ Masculino: 'masculino', Feminino: 'feminino' }}
                    />
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Cor/Raça - Barras Horizontais */}
          <GraficoCard
            titulo="Distribuição por Cor/Raça"
            icone={Users}
            corIcone="bg-amber-500/20"
            dadoReferencia={mapaDadosReferencia.cor_raca}
            desvioMedio={desviosMedios.cor_raca}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosCorRaca} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="nome" type="category" width={60} stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <Tooltip
                  content={(props) => (
                    <TooltipComFonte
                      {...props}
                      dadoReferencia={mapaDadosReferencia.cor_raca}
                      categoriaMap={{ Branca: 'branca', Parda: 'parda', Preta: 'preta', Amarela: 'amarela', Indigena: 'indigena' }}
                    />
                  )}
                />
                <Bar dataKey="valor" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Pirâmide Etária */}
          <GraficoCard
            titulo="Pirâmide Etária"
            icone={Activity}
            corIcone="bg-green-500/20"
            dadoReferencia={mapaDadosReferencia.faixa_etaria}
            desvioMedio={desviosMedios.faixa_etaria}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.faixasEtarias} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="faixa" type="category" width={50} stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="masculino" name="Masculino" fill="#3b82f6" stackId="a" />
                <Bar dataKey="feminino" name="Feminino" fill="#ec4899" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </GraficoCard>
        </div>
      </div>

      {/* ============================================ */}
      {/* SEÇÃO 2: DISTRIBUIÇÃO GEOGRÁFICA */}
      {/* ============================================ */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-cyan-500" />
          Distribuição Geográfica
        </h2>
        <GraficoCard
          titulo="Top 10 Regiões Administrativas"
          subtitulo="Concentração de eleitores por região do DF"
          icone={MapPin}
          corIcone="bg-cyan-500/20"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosRegiao}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-45} height={80} />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number, name: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
              />
              <Bar dataKey="valor" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                {dadosRegiao.map((entry, index) => (
                  <Cell key={index} fill={index === 0 ? '#0891b2' : index < 3 ? '#22d3ee' : '#67e8f9'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GraficoCard>
      </div>

      {/* ============================================ */}
      {/* SEÇÃO 3: SITUAÇÃO SOCIOECONÔMICA */}
      {/* ============================================ */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-green-500" />
          Situação Socioeconômica
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Classe Social - Donut */}
          <GraficoCard
            titulo="Classe Social (Cluster)"
            icone={TrendingUp}
            corIcone="bg-emerald-500/20"
            dadoReferencia={mapaDadosReferencia.cluster_socioeconomico}
            desvioMedio={desviosMedios.cluster_socioeconomico}
          >
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
                    <Cell key={index} fill={CORES.cluster[index % CORES.cluster.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={(props) => (
                    <TooltipComFonte
                      {...props}
                      dadoReferencia={mapaDadosReferencia.cluster_socioeconomico}
                      categoriaMap={{ Alta: 'G1_alta', 'Média-Alta': 'G2_media_alta', 'Média-Baixa': 'G3_media_baixa', Baixa: 'G4_baixa' }}
                    />
                  )}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Faixa de Renda - Area Chart */}
          <GraficoCard
            titulo="Distribuição por Faixa de Renda"
            icone={Wallet}
            corIcone="bg-yellow-500/20"
            dadoReferencia={mapaDadosReferencia.renda_salarios_minimos}
            desvioMedio={desviosMedios.renda_salarios_minimos}
          >
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dadosRenda}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  content={(props) => (
                    <TooltipComFonte
                      {...props}
                      dadoReferencia={mapaDadosReferencia.renda_salarios_minimos}
                      categoriaMap={{
                        'Até 1 SM': 'ate_1',
                        '1-2 SM': 'mais_de_1_ate_2',
                        '2-5 SM': 'mais_de_2_ate_5',
                        '5-10 SM': 'mais_de_5_ate_10',
                        '+10 SM': 'mais_de_10',
                      }}
                    />
                  )}
                />
                <Area type="monotone" dataKey="valor" stroke="#eab308" fill="#eab308" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Ocupação/Vínculo */}
          <GraficoCard
            titulo="Ocupação / Vínculo Empregatício"
            subtitulo="Distribuição por tipo de vínculo"
            icone={Briefcase}
            corIcone="bg-violet-500/20"
            dadoReferencia={mapaDadosReferencia.ocupacao_vinculo}
            desvioMedio={desviosMedios.ocupacao_vinculo}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dadosOcupacao} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="nome" type="category" width={100} stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number, name: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
                />
                <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                  {dadosOcupacao.map((_, index) => (
                    <Cell key={index} fill={CORES.primarias[index % CORES.primarias.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Escolaridade - Barras */}
          <GraficoCard
            titulo="Nível de Escolaridade"
            icone={GraduationCap}
            corIcone="bg-blue-500/20"
            dadoReferencia={mapaDadosReferencia.escolaridade}
            desvioMedio={desviosMedios.escolaridade}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dadosEscolaridade}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 9 }} angle={-15} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  content={(props) => (
                    <TooltipComFonte
                      {...props}
                      dadoReferencia={mapaDadosReferencia.escolaridade}
                      categoriaMap={{
                        'Superior/Pós': 'superior_completo_ou_pos',
                        'Médio/Sup. Inc.': 'medio_completo_ou_sup_incompleto',
                        'Fund. Incompleto': 'fundamental_incompleto',
                        'Fund. Completo': 'fundamental_completo',
                      }}
                    />
                  )}
                />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                  {dadosEscolaridade.map((_, index) => (
                    <Cell key={index} fill={CORES.escolaridade[index % CORES.escolaridade.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GraficoCard>
        </div>
      </div>

      {/* ============================================ */}
      {/* SEÇÃO 4: VIDA PESSOAL E RELIGIÃO */}
      {/* ============================================ */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-500" />
          Vida Pessoal e Religião
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Estado Civil */}
          <GraficoCard
            titulo="Estado Civil"
            icone={Heart}
            corIcone="bg-rose-500/20"
            dadoReferencia={mapaDadosReferencia.estado_civil}
            desvioMedio={desviosMedios.estado_civil}
          >
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dadosEstadoCivil}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="valor"
                  nameKey="nome"
                  label={({ nome, percentual }) => `${percentual}%`}
                >
                  {dadosEstadoCivil.map((_, index) => (
                    <Cell key={index} fill={CORES.primarias[index % CORES.primarias.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={(props) => (
                    <TooltipComFonte
                      {...props}
                      dadoReferencia={mapaDadosReferencia.estado_civil}
                      categoriaMap={{
                        'Solteiroa': 'solteiro(a)',
                        'Casadoa': 'casado(a)',
                        'Uniao estavel': 'uniao_estavel',
                        'Divorciadoa': 'divorciado(a)',
                        'Viuvoa': 'viuvo(a)',
                      }}
                    />
                  )}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Filhos */}
          <GraficoCard
            titulo="Filhos"
            icone={Users}
            corIcone="bg-pink-500/20"
            dadoReferencia={mapaDadosReferencia.filhos}
          >
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
                <Tooltip
                  content={(props) => (
                    <TooltipComFonte
                      {...props}
                      dadoReferencia={mapaDadosReferencia.filhos}
                      categoriaMap={{ 'Com filhos': 'com_filhos', 'Sem filhos': 'sem_filhos' }}
                    />
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Religião */}
          <GraficoCard
            titulo="Religião"
            icone={Church}
            corIcone="bg-purple-500/20"
            dadoReferencia={mapaDadosReferencia.religiao}
            desvioMedio={desviosMedios.religiao}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosReligiao}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  content={(props) => (
                    <TooltipComFonte
                      {...props}
                      dadoReferencia={mapaDadosReferencia.religiao}
                      categoriaMap={{
                        'Catolica': 'catolica',
                        'Evangelica': 'evangelica',
                        'Sem religiao': 'sem_religiao',
                        'Espirita': 'espirita',
                        'Umbanda candomble': 'umbanda_candomble',
                        'Outras religioes': 'outras_religioes',
                      }}
                    />
                  )}
                />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                  {dadosReligiao.map((_, index) => (
                    <Cell key={index} fill={CORES.religiao[index % CORES.religiao.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GraficoCard>
        </div>
      </div>

      {/* ============================================ */}
      {/* SEÇÃO 5: PERFIL POLÍTICO */}
      {/* ============================================ */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Vote className="w-5 h-5 text-red-500" />
          Perfil Político
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Espectro Político */}
          <GraficoCard
            titulo="Espectro Político"
            subtitulo="Orientação ideológica dos eleitores"
            icone={Scale}
            corIcone="bg-red-500/20"
            dadoReferencia={mapaDadosReferencia.orientacao_politica}
            desvioMedio={desviosMedios.orientacao_politica}
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dadosOrientacao} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="nome" type="category" width={90} stroke="#9ca3af" />
                <Tooltip
                  content={(props) => (
                    <TooltipComFonte
                      {...props}
                      dadoReferencia={mapaDadosReferencia.orientacao_politica}
                      categoriaMap={{
                        'Esquerda': 'esquerda',
                        'Centro-Esq': 'centro-esquerda',
                        'Centro': 'centro',
                        'Centro-Dir': 'centro-direita',
                        'Direita': 'direita',
                      }}
                    />
                  )}
                />
                <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                  {dadosOrientacao.map((_, index) => (
                    <Cell key={index} fill={CORES.orientacao[index % CORES.orientacao.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Posição Bolsonaro */}
          <GraficoCard
            titulo="Posição sobre Bolsonaro"
            icone={UserCheck}
            corIcone="bg-yellow-500/20"
            dadoReferencia={mapaDadosReferencia.posicao_bolsonaro}
            desvioMedio={desviosMedios.posicao_bolsonaro}
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dadosBolsonaro}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  content={(props) => (
                    <TooltipComFonte
                      {...props}
                      dadoReferencia={mapaDadosReferencia.posicao_bolsonaro}
                      categoriaMap={{
                        'Apoiador Forte': 'apoiador_forte',
                        'Apoiador Mod.': 'apoiador_moderado',
                        'Neutro': 'neutro',
                        'Crítico Mod.': 'critico_moderado',
                        'Crítico Forte': 'critico_forte',
                      }}
                    />
                  )}
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
          </GraficoCard>

          {/* Interesse Político - Radial */}
          <GraficoCard
            titulo="Interesse Político"
            icone={Activity}
            corIcone="bg-indigo-500/20"
            dadoReferencia={mapaDadosReferencia.interesse_politico}
            desvioMedio={desviosMedios.interesse_politico}
          >
            <ResponsiveContainer width="100%" height={250}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="30%"
                outerRadius="100%"
                data={dadosInteresse}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  label={{ position: 'insideStart', fill: '#fff', fontSize: 11 }}
                  background
                  dataKey="valor"
                />
                <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Tolerância à Nuance */}
          <GraficoCard
            titulo="Tolerância à Nuance Política"
            icone={Brain}
            corIcone="bg-sky-500/20"
            dadoReferencia={mapaDadosReferencia.tolerancia_nuance}
            desvioMedio={desviosMedios.tolerancia_nuance}
          >
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dadosTolerancia}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="valor"
                  nameKey="nome"
                  label={({ nome, percentual }) => `${nome}: ${percentual}%`}
                >
                  <Cell fill="#ef4444" />
                  <Cell fill="#eab308" />
                  <Cell fill="#22c55e" />
                </Pie>
                <Tooltip
                  content={(props) => (
                    <TooltipComFonte
                      {...props}
                      dadoReferencia={mapaDadosReferencia.tolerancia_nuance}
                      categoriaMap={{ 'Baixa': 'baixa', 'Média': 'media', 'Alta': 'alta' }}
                    />
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </GraficoCard>
        </div>
      </div>

      {/* ============================================ */}
      {/* SEÇÃO 6: PERFIL PSICOLÓGICO E COMPORTAMENTAL */}
      {/* ============================================ */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          Perfil Psicológico e Comportamental
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estilo de Decisão */}
          <GraficoCard
            titulo="Estilo de Decisão Eleitoral"
            subtitulo="Como os eleitores tomam decisões de voto"
            icone={Brain}
            corIcone="bg-fuchsia-500/20"
            dadoReferencia={mapaDadosReferencia.estilo_decisao}
            desvioMedio={desviosMedios.estilo_decisao}
          >
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dadosDecisao}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="valor"
                  nameKey="nome"
                  label={({ nome, percentual }) => `${nome}: ${percentual}%`}
                >
                  {dadosDecisao.map((_, index) => (
                    <Cell key={index} fill={CORES.decisao[index % CORES.decisao.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={(props) => (
                    <TooltipComFonte
                      {...props}
                      dadoReferencia={mapaDadosReferencia.estilo_decisao}
                      categoriaMap={{
                        'Identitário': 'identitario',
                        'Pragmático': 'pragmatico',
                        'Moral': 'moral',
                        'Econômico': 'economico',
                        'Emocional': 'emocional',
                      }}
                    />
                  )}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Vieses Cognitivos - Radar */}
          <GraficoCard titulo="Vieses Cognitivos Predominantes" subtitulo="Padrões de pensamento que influenciam decisões" icone={Eye} corIcone="bg-amber-500/20">
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={dadosRadarPsicologico}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis stroke="#9ca3af" />
                <Radar name="Eleitores" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.5} />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Susceptibilidade à Desinformação */}
          <GraficoCard titulo="Susceptibilidade à Desinformação" subtitulo="Nível de vulnerabilidade a fake news" icone={Eye} corIcone="bg-orange-500/20">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dadosSuscept}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number, name: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
                />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                  {dadosSuscept.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Valores Principais */}
          <GraficoCard titulo="Top 10 Valores dos Eleitores" subtitulo="O que os eleitores mais valorizam" icone={Heart} corIcone="bg-rose-500/20">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dadosValores} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="nome" type="category" width={100} stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number, name: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
                />
                <Bar dataKey="valor" fill="#f43f5e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GraficoCard>
        </div>
      </div>

      {/* ============================================ */}
      {/* SEÇÃO 7: PREOCUPAÇÕES E INFORMAÇÃO */}
      {/* ============================================ */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-cyan-500" />
          Preocupações e Fontes de Informação
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Principais Preocupações */}
          <GraficoCard titulo="Top 10 Preocupações" subtitulo="O que mais preocupa os eleitores" icone={Activity} corIcone="bg-red-500/20">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosPreocupacoes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="nome" type="category" width={120} stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number, name: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
                />
                <Bar dataKey="valor" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Fontes de Informação */}
          <GraficoCard titulo="Fontes de Informação" subtitulo="Onde os eleitores se informam" icone={Smartphone} corIcone="bg-cyan-500/20">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosFontes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="nome" type="category" width={120} stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number, name: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
                />
                <Bar dataKey="valor" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GraficoCard>
        </div>
      </div>

      {/* ============================================ */}
      {/* SEÇÃO 8: MOBILIDADE */}
      {/* ============================================ */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Car className="w-5 h-5 text-slate-500" />
          Mobilidade Urbana
        </h2>
        <GraficoCard
          titulo="Meio de Transporte Principal"
          subtitulo="Como os eleitores se locomovem"
          icone={Car}
          corIcone="bg-slate-500/20"
          dadoReferencia={mapaDadosReferencia.meio_transporte}
          desvioMedio={desviosMedios.meio_transporte}
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dadosTransporte}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                content={(props) => (
                  <TooltipComFonte
                    {...props}
                    dadoReferencia={mapaDadosReferencia.meio_transporte}
                    categoriaMap={{
                      'Carro': 'carro',
                      'Onibus': 'onibus',
                      'A pe': 'a_pe',
                      'Moto': 'moto',
                      'Metro': 'metro',
                      'Bicicleta': 'bicicleta',
                    }}
                  />
                )}
              />
              <Bar dataKey="valor" fill="#64748b" radius={[4, 4, 0, 0]}>
                {dadosTransporte.map((_, index) => (
                  <Cell key={index} fill={CORES.primarias[index % CORES.primarias.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GraficoCard>
      </div>

      {/* Rodapé */}
      <div className="text-center text-sm text-muted-foreground py-4 border-t border-border">
        Dashboard atualizado com dados de {stats.total} eleitores sintéticos do Distrito Federal
      </div>
    </div>
  );
}
