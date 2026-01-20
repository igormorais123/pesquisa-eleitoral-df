'use client';

import { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Zap,
  Database,
  Globe,
} from 'lucide-react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
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
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { formatarNumero, formatarPercentual } from '@/lib/utils';
import eleitoresData from '@/data/eleitores-df-1000.json';
import type { Eleitor } from '@/types';
import { useEleitoresStore, useEleitoresFiltrados, useFiltros, useFiltrosActions } from '@/stores/eleitores-store';

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

// Card de estatística - Design Limpo
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="relative bg-card border border-border rounded-2xl p-6 transition-all duration-300 overflow-hidden group hover:shadow-lg hover:border-primary/30"
    >
      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{titulo}</p>
          <p className="text-3xl font-bold font-mono text-foreground tracking-tight">{valor}</p>
          {subtitulo && (
            <p className="text-xs text-muted-foreground/70">{subtitulo}</p>
          )}
          {tendencia && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                tendencia.positivo ? 'text-emerald-500' : 'text-red-500'
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
        <div className={`w-12 h-12 rounded-xl ${corIcone} flex items-center justify-center shadow-lg`}>
          <Icone className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

// Card de ação rápida - Design Limpo
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
    <Link href={href}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative bg-card border border-border rounded-2xl p-5 transition-all duration-300 group cursor-pointer overflow-hidden hover:shadow-lg hover:border-primary/30"
      >
        <div className="relative flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${cor} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
            <Icone className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
              {titulo}
              <Zap className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-sm text-muted-foreground">{descricao}</p>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </motion.div>
    </Link>
  );
}

// Componente de Card de Gráfico - Design Limpo
function GraficoCard({
  titulo,
  subtitulo,
  icone: Icone,
  corIcone,
  children,
  className = '',
  href,
}: {
  titulo: string;
  subtitulo?: string;
  icone: React.ElementType;
  corIcone: string;
  children: React.ReactNode;
  className?: string;
  href?: string;
}) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={href ? { y: -2 } : undefined}
      className={`relative bg-card border border-border rounded-2xl p-6 ${className} ${href ? 'cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all group' : ''} overflow-hidden`}
    >
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${corIcone} flex items-center justify-center shadow-lg`}>
              <Icone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{titulo}</h3>
              {subtitulo && <p className="text-xs text-muted-foreground">{subtitulo}</p>}
            </div>
          </div>
          {href && (
            <span className="flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 text-primary px-2.5 py-1 rounded-lg">
              <ExternalLink className="w-3 h-3" />
              Ver detalhes
            </span>
          )}
        </div>
        {children}
      </div>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
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

// ============================================
// OPÇÕES DE FILTRO PARA O DASHBOARD
// ============================================

const GENEROS = [
  { valor: 'masculino', rotulo: 'Masculino' },
  { valor: 'feminino', rotulo: 'Feminino' },
];

const CLUSTERS = [
  { valor: 'G1_alta', rotulo: 'Alta Renda' },
  { valor: 'G2_media_alta', rotulo: 'Média-Alta' },
  { valor: 'G3_media_baixa', rotulo: 'Média-Baixa' },
  { valor: 'G4_baixa', rotulo: 'Baixa Renda' },
];

const ORIENTACOES = [
  { valor: 'esquerda', rotulo: 'Esquerda' },
  { valor: 'centro-esquerda', rotulo: 'Centro-Esq' },
  { valor: 'centro', rotulo: 'Centro' },
  { valor: 'centro-direita', rotulo: 'Centro-Dir' },
  { valor: 'direita', rotulo: 'Direita' },
];

const POSICOES_BOLSONARO = [
  { valor: 'apoiador_forte', rotulo: 'Apoiador Forte' },
  { valor: 'apoiador_moderado', rotulo: 'Apoiador Mod.' },
  { valor: 'neutro', rotulo: 'Neutro' },
  { valor: 'critico_moderado', rotulo: 'Crítico Mod.' },
  { valor: 'critico_forte', rotulo: 'Crítico Forte' },
];

const FAIXAS_ETARIAS = [
  { valor: '16-24', rotulo: '16-24' },
  { valor: '25-34', rotulo: '25-34' },
  { valor: '35-44', rotulo: '35-44' },
  { valor: '45-54', rotulo: '45-54' },
  { valor: '55-64', rotulo: '55-64' },
  { valor: '65+', rotulo: '65+' },
];

const RELIGIOES = [
  { valor: 'catolica', rotulo: 'Católica' },
  { valor: 'evangelica', rotulo: 'Evangélica' },
  { valor: 'espirita', rotulo: 'Espírita' },
  { valor: 'sem_religiao', rotulo: 'Sem Religião' },
];

const INTERESSES_POLITICOS = [
  { valor: 'baixo', rotulo: 'Baixo' },
  { valor: 'medio', rotulo: 'Médio' },
  { valor: 'alto', rotulo: 'Alto' },
];

// Componente de Filtro Rápido - Design Limpo
function FiltroRapidoDashboard({
  titulo,
  opcoes,
  selecionados,
  onChange,
  icone: Icone,
}: {
  titulo: string;
  opcoes: { valor: string; rotulo: string }[];
  selecionados: string[];
  onChange: (valores: string[]) => void;
  icone: React.ElementType;
}) {
  const [aberto, setAberto] = useState(false);

  const toggleOpcao = (valor: string) => {
    if (selecionados.includes(valor)) {
      onChange(selecionados.filter((v) => v !== valor));
    } else {
      onChange([...selecionados, valor]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setAberto(!aberto)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
          selecionados.length > 0
            ? 'bg-primary/10 text-primary border border-primary/30'
            : 'bg-muted border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
        }`}
      >
        <Icone className="w-4 h-4" />
        <span>{titulo}</span>
        {selecionados.length > 0 && (
          <span className="bg-primary/20 px-1.5 py-0.5 rounded text-[10px] font-bold">
            {selecionados.length}
          </span>
        )}
        {aberto ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {aberto && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 mt-2 z-50 bg-card border border-border rounded-xl shadow-2xl p-2 min-w-[180px]"
        >
          {opcoes.map((opcao) => (
            <button
              key={opcao.valor}
              onClick={() => toggleOpcao(opcao.valor)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selecionados.includes(opcao.valor)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {opcao.rotulo}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function PaginaInicial() {
  // Integração com o store de eleitores
  const setEleitores = useEleitoresStore((state) => state.setEleitores);
  const todosEleitores = useEleitoresStore((state) => state.eleitores);
  const eleitoresFiltrados = useEleitoresFiltrados();
  const filtros = useFiltros();
  const { setFiltros, limparFiltros } = useFiltrosActions();
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);

  // Carrega os eleitores no store quando o componente monta
  useEffect(() => {
    if (todosEleitores.length === 0) {
      setEleitores(eleitoresData as unknown as Eleitor[]);
    }
  }, [setEleitores, todosEleitores.length]);

  // Usa os eleitores filtrados se houver filtros aplicados, senão usa todos
  const eleitores = eleitoresFiltrados.length > 0 || temFiltrosAtivos(filtros)
    ? eleitoresFiltrados
    : (todosEleitores.length > 0 ? todosEleitores : eleitoresData as unknown as Eleitor[]);

  // Função para verificar se há filtros ativos
  function temFiltrosAtivos(filtros: any): boolean {
    return Object.values(filtros).some((v) => {
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === 'string') return v.length > 0;
      return false;
    });
  }

  // Contagem de filtros ativos
  const totalFiltrosAtivos = Object.values(filtros).reduce((acc, v) => {
    if (Array.isArray(v)) return acc + v.length;
    if (typeof v === 'string' && v.length > 0) return acc + 1;
    return acc;
  }, 0);

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

  // Total de eleitores (todos, sem filtro)
  const totalGeral = todosEleitores.length > 0 ? todosEleitores.length : (eleitoresData as unknown as Eleitor[]).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero - Apresentação do Projeto */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Globe className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Pesquisa Eleitoral DF 2026
                </h1>
                <p className="text-blue-100 text-sm">Sistema de Simulação com Agentes de IA</p>
              </div>
            </div>

            <p className="text-blue-50 leading-relaxed">
              Plataforma inovadora que utiliza <strong>inteligência artificial</strong> para simular pesquisas eleitorais
              com <strong>1.000 eleitores sintéticos</strong> do Distrito Federal. Cada agente possui perfil demográfico,
              socioeconômico e psicológico único, respondendo a entrevistas como cidadãos reais.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-sm">
                <Users className="w-4 h-4" />
                <span>1.000 Eleitores IA</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-sm">
                <Brain className="w-4 h-4" />
                <span>60+ Atributos por Perfil</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-sm">
                <MapPin className="w-4 h-4" />
                <span>35 Regiões do DF</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Claude AI (Anthropic)</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center gap-2 text-center">
            <div className="text-5xl font-bold">{formatarNumero(stats.total)}</div>
            <div className="text-blue-100 text-sm">Eleitores Ativos</div>
          </div>
        </div>
      </div>

      {/* Subtítulo de contexto */}
      <div>
        <p className="text-muted-foreground">
          {temFiltrosAtivos(filtros) ? (
            <>
              Analisando <span className="text-primary font-semibold">{stats.total}</span> de {totalGeral} eleitores ({((stats.total / totalGeral) * 100).toFixed(1)}% da amostra)
            </>
          ) : (
            <>Explore os dados demográficos, políticos e comportamentais dos agentes sintéticos.</>
          )}
        </p>
      </div>

      {/* Painel de Filtros */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Filter className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Filtrar Amostra</h3>
              <p className="text-xs text-muted-foreground">
                Selecione grupos para analisar segmentos específicos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalFiltrosAtivos > 0 && (
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {totalFiltrosAtivos} filtro{totalFiltrosAtivos > 1 ? 's' : ''} ativo{totalFiltrosAtivos > 1 ? 's' : ''}
              </span>
            )}
            <button
              onClick={() => setFiltrosVisiveis(!filtrosVisiveis)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              {filtrosVisiveis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {filtrosVisiveis ? 'Ocultar' : 'Mostrar'} Filtros
            </button>
            {totalFiltrosAtivos > 0 && (
              <button
                onClick={limparFiltros}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Limpar
              </button>
            )}
          </div>
        </div>

        {filtrosVisiveis && (
          <div className="border-t border-border pt-4">
            <div className="flex flex-wrap gap-3">
              <FiltroRapidoDashboard
                titulo="Gênero"
                opcoes={GENEROS}
                selecionados={filtros.generos || []}
                onChange={(valores) => setFiltros({ generos: valores as any })}
                icone={Users}
              />
              <FiltroRapidoDashboard
                titulo="Classe Social"
                opcoes={CLUSTERS}
                selecionados={filtros.clusters || []}
                onChange={(valores) => setFiltros({ clusters: valores as any })}
                icone={Wallet}
              />
              <FiltroRapidoDashboard
                titulo="Faixa Etária"
                opcoes={FAIXAS_ETARIAS}
                selecionados={filtros.faixas_etarias || []}
                onChange={(valores) => setFiltros({ faixas_etarias: valores })}
                icone={Activity}
              />
              <FiltroRapidoDashboard
                titulo="Orientação Política"
                opcoes={ORIENTACOES}
                selecionados={filtros.orientacoes_politicas || []}
                onChange={(valores) => setFiltros({ orientacoes_politicas: valores as any })}
                icone={Scale}
              />
              <FiltroRapidoDashboard
                titulo="Posição Bolsonaro"
                opcoes={POSICOES_BOLSONARO}
                selecionados={filtros.posicoes_bolsonaro || []}
                onChange={(valores) => setFiltros({ posicoes_bolsonaro: valores as any })}
                icone={UserCheck}
              />
              <FiltroRapidoDashboard
                titulo="Religião"
                opcoes={RELIGIOES}
                selecionados={filtros.religioes || []}
                onChange={(valores) => setFiltros({ religioes: valores })}
                icone={Church}
              />
              <FiltroRapidoDashboard
                titulo="Interesse Político"
                opcoes={INTERESSES_POLITICOS}
                selecionados={(filtros as any).interesses_politicos || []}
                onChange={(valores) => setFiltros({ interesses_politicos: valores } as any)}
                icone={Vote}
              />
            </div>

            {/* Filtros ativos como tags */}
            {totalFiltrosAtivos > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">Filtros ativos:</span>
                {filtros.generos?.map((g) => (
                  <span key={g} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                    {g === 'masculino' ? 'Masculino' : 'Feminino'}
                    <button onClick={() => setFiltros({ generos: filtros.generos?.filter((v) => v !== g) })} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filtros.clusters?.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                    {CLUSTERS.find((cl) => cl.valor === c)?.rotulo}
                    <button onClick={() => setFiltros({ clusters: filtros.clusters?.filter((v) => v !== c) })} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filtros.faixas_etarias?.map((f) => (
                  <span key={f} className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">
                    {f} anos
                    <button onClick={() => setFiltros({ faixas_etarias: filtros.faixas_etarias?.filter((v) => v !== f) })} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filtros.orientacoes_politicas?.map((o) => (
                  <span key={o} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                    {ORIENTACOES.find((op) => op.valor === o)?.rotulo}
                    <button onClick={() => setFiltros({ orientacoes_politicas: filtros.orientacoes_politicas?.filter((v) => v !== o) })} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filtros.posicoes_bolsonaro?.map((p) => (
                  <span key={p} className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                    {POSICOES_BOLSONARO.find((pb) => pb.valor === p)?.rotulo}
                    <button onClick={() => setFiltros({ posicoes_bolsonaro: filtros.posicoes_bolsonaro?.filter((v) => v !== p) })} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filtros.religioes?.map((r) => (
                  <span key={r} className="inline-flex items-center gap-1 px-2 py-1 bg-pink-500/20 text-pink-400 rounded text-xs">
                    {RELIGIOES.find((re) => re.valor === r)?.rotulo}
                    <button onClick={() => setFiltros({ religioes: filtros.religioes?.filter((v) => v !== r) })} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filtros.interesses_politicos?.map((i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                    Interesse: {INTERESSES_POLITICOS.find((ip) => ip.valor === i)?.rotulo}
                    <button onClick={() => setFiltros({ interesses_politicos: filtros.interesses_politicos?.filter((v) => v !== i) })} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
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

      {/* Ações Rápidas */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <GraficoCard titulo="Distribuição por Gênero" icone={Users} corIcone="bg-pink-500/20" href="/eleitores?filtro=generos&valor=masculino,feminino">
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
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Cor/Raça - Barras Horizontais */}
          <GraficoCard titulo="Distribuição por Cor/Raça" icone={Users} corIcone="bg-amber-500/20" href="/eleitores?filtro=cores_racas&valor=branca,parda,preta,amarela,indigena">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosCorRaca} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="nome" type="category" width={60} stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number, name: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
                />
                <Bar dataKey="valor" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Pirâmide Etária */}
          <GraficoCard titulo="Pirâmide Etária" icone={Activity} corIcone="bg-green-500/20" href="/eleitores?filtro=faixas_etarias&valor=16-24,25-34,35-44,45-54,55-64,65%2B">
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
          href="/eleitores"
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
          <GraficoCard titulo="Classe Social (Cluster)" icone={TrendingUp} corIcone="bg-emerald-500/20" href="/eleitores?filtro=clusters&valor=G1_alta,G2_media_alta,G3_media_baixa,G4_baixa">
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
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Faixa de Renda - Area Chart */}
          <GraficoCard titulo="Distribuição por Faixa de Renda" icone={Wallet} corIcone="bg-yellow-500/20" href="/eleitores?filtro=faixas_renda&valor=ate_1,mais_de_1_ate_2,mais_de_2_ate_5,mais_de_5_ate_10,mais_de_10">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dadosRenda}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number, name: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
                />
                <Area type="monotone" dataKey="valor" stroke="#eab308" fill="#eab308" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Ocupação/Vínculo - Treemap */}
          <GraficoCard titulo="Ocupação / Vínculo Empregatício" subtitulo="Distribuição por tipo de vínculo" icone={Briefcase} corIcone="bg-violet-500/20" href="/eleitores?filtro=ocupacoes_vinculos&valor=clt,servidor_publico,autonomo,empresario,informal,desempregado,aposentado,estudante">
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
          <GraficoCard titulo="Nível de Escolaridade" icone={GraduationCap} corIcone="bg-blue-500/20" href="/eleitores?filtro=escolaridades&valor=fundamental_incompleto,fundamental_completo,medio_incompleto,medio_completo_ou_sup_incompleto,superior_completo_ou_pos">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dadosEscolaridade}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 9 }} angle={-15} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number, name: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
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
          <GraficoCard titulo="Estado Civil" icone={Heart} corIcone="bg-rose-500/20" href="/eleitores?filtro=estados_civis&valor=solteiro,casado,divorciado,viuvo,uniao_estavel">
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
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Filhos */}
          <GraficoCard titulo="Filhos" icone={Users} corIcone="bg-pink-500/20" href="/eleitores?filtro=tem_filhos&valor=sim,nao">
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
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Religião */}
          <GraficoCard titulo="Religião" icone={Church} corIcone="bg-purple-500/20" href="/eleitores?filtro=religioes&valor=catolica,evangelica,espirita,sem_religiao,afro_brasileira,outras">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dadosReligiao}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number, name: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
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
          <GraficoCard titulo="Espectro Político" subtitulo="Orientação ideológica dos eleitores" icone={Scale} corIcone="bg-red-500/20" href="/eleitores?filtro=orientacoes_politicas&valor=esquerda,centro-esquerda,centro,centro-direita,direita">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dadosOrientacao} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="nome" type="category" width={90} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number, name: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
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
          <GraficoCard titulo="Posição sobre Bolsonaro" icone={UserCheck} corIcone="bg-yellow-500/20" href="/eleitores?filtro=posicoes_bolsonaro&valor=apoiador_forte,apoiador_moderado,neutro,critico_moderado,critico_forte">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dadosBolsonaro}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 9 }} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number, name: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
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
          <GraficoCard titulo="Interesse Político" icone={Activity} corIcone="bg-indigo-500/20" href="/eleitores?filtro=interesses_politicos&valor=baixo,medio,alto">
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
          <GraficoCard titulo="Tolerância à Nuance Política" icone={Brain} corIcone="bg-sky-500/20" href="/eleitores?filtro=tolerancias_nuance&valor=baixa,media,alta">
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
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
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
          <GraficoCard titulo="Estilo de Decisão Eleitoral" subtitulo="Como os eleitores tomam decisões de voto" icone={Brain} corIcone="bg-fuchsia-500/20" href="/eleitores?filtro=estilos_decisao&valor=identitario,pragmatico,moral,economico,emocional">
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
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Vieses Cognitivos - Radar */}
          <GraficoCard titulo="Vieses Cognitivos Predominantes" subtitulo="Padrões de pensamento que influenciam decisões" icone={Eye} corIcone="bg-amber-500/20" href="/eleitores">
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
          <GraficoCard titulo="Susceptibilidade à Desinformação" subtitulo="Nível de vulnerabilidade a fake news" icone={Eye} corIcone="bg-orange-500/20" href="/eleitores?filtro=susceptibilidade_desinformacao&valor=1-3,4-6,7-10">
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
          <GraficoCard titulo="Top 10 Valores dos Eleitores" subtitulo="O que os eleitores mais valorizam" icone={Heart} corIcone="bg-rose-500/20" href="/eleitores">
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
          <GraficoCard titulo="Top 10 Preocupações" subtitulo="O que mais preocupa os eleitores" icone={Activity} corIcone="bg-red-500/20" href="/eleitores">
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
          <GraficoCard titulo="Fontes de Informação" subtitulo="Onde os eleitores se informam" icone={Smartphone} corIcone="bg-cyan-500/20" href="/eleitores">
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
        <GraficoCard titulo="Meio de Transporte Principal" subtitulo="Como os eleitores se locomovem" icone={Car} corIcone="bg-slate-500/20" href="/eleitores?filtro=meios_transporte&valor=carro_proprio,transporte_publico,moto,bicicleta,a_pe,aplicativo">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dadosTransporte}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="nome" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number, name: string, props: any) => [`${value} (${props.payload.percentual}%)`, 'Eleitores']}
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
