'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  Users,
  Coins,
  Brain,
  MessageSquare,
  Download,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Eye,
  EyeOff,
  Target,
  Shield,
  Zap,
  FileText,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
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
import { db } from '@/lib/db/dexie';
import type { SessaoEntrevista } from '@/lib/db/dexie';
import { cn, formatarDataHora, formatarMoeda, formatarNumero } from '@/lib/utils';

// Tipos do Relatório de Inteligência
interface RelatorioInteligencia {
  sumarioExecutivo: {
    titulo: string;
    dataCriacao: string;
    totalEntrevistados: number;
    conclusaoPrincipal: string;
    nivelAlerta: 'baixo' | 'moderado' | 'alto' | 'critico';
  };
  analiseEstrategica: {
    panoramaGeral: string;
    fortalezas: string[];
    vulnerabilidades: string[];
    oportunidades: string[];
    ameacas: string[];
  };
  perfisPsicograficos: Array<{
    segmento: string;
    percentual: number;
    caracteristicas: string[];
    gatilhosEmocionais: string[];
    mensagensEficazes: string[];
    errosEvitar: string[];
  }>;
  votoSilencioso: {
    estimativaPercentual: number;
    perfilTipico: string;
    indicadoresIdentificacao: string[];
    estrategiasConversao: string[];
    riscos: string[];
  };
  pontosRuptura: Array<{
    grupo: string;
    eventoGatilho: string;
    probabilidadeMudanca: number;
    direcaoMudanca: string;
    sinaisAlerta: string[];
  }>;
  recomendacoesEstrategicas: {
    curtoPrazo: string[];
    medioPrazo: string[];
    mensagensChave: string[];
    temasEvitar: string[];
    canaisRecomendados: string[];
  };
  alertasInteligencia: Array<{
    tipo: 'oportunidade' | 'risco' | 'tendencia' | 'urgente';
    titulo: string;
    descricao: string;
    acaoRecomendada: string;
    prioridade: number;
  }>;
  conclusaoAnalitica: string;
  thinkingProcess?: string;
}

interface MetadadosRelatorio {
  sessaoId: string;
  modelo: string;
  tokensInput: number;
  tokensOutput: number;
  custoReais: number;
  tempoProcessamento: string;
  usouExtendedThinking: boolean;
}

// Componentes auxiliares
function SecaoColapsavel({
  titulo,
  icone: Icone,
  corIcone,
  children,
  defaultAberto = false,
}: {
  titulo: string;
  icone: React.ComponentType<{ className?: string }>;
  corIcone: string;
  children: React.ReactNode;
  defaultAberto?: boolean;
}) {
  const [aberto, setAberto] = useState(defaultAberto);

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', corIcone)}>
            <Icone className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-foreground">{titulo}</h3>
        </div>
        {aberto ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      {aberto && <div className="p-4 pt-0 border-t border-border">{children}</div>}
    </div>
  );
}

function BadgeAlerta({ nivel }: { nivel: 'baixo' | 'moderado' | 'alto' | 'critico' }) {
  const configs = {
    baixo: { cor: 'bg-green-500/20 text-green-400 border-green-500/30', texto: 'Baixo' },
    moderado: { cor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', texto: 'Moderado' },
    alto: { cor: 'bg-orange-500/20 text-orange-400 border-orange-500/30', texto: 'Alto' },
    critico: { cor: 'bg-red-500/20 text-red-400 border-red-500/30', texto: 'Critico' },
  };
  const config = configs[nivel];

  return (
    <span className={cn('px-3 py-1 rounded-full text-sm font-medium border', config.cor)}>
      {config.texto}
    </span>
  );
}

function IconeAlertaTipo({ tipo }: { tipo: 'oportunidade' | 'risco' | 'tendencia' | 'urgente' }) {
  const configs = {
    oportunidade: { icone: CheckCircle, cor: 'text-green-400' },
    risco: { icone: AlertTriangle, cor: 'text-red-400' },
    tendencia: { icone: TrendingUp, cor: 'text-blue-400' },
    urgente: { icone: Zap, cor: 'text-yellow-400' },
  };
  const config = configs[tipo];
  const Icone = config.icone;

  return <Icone className={cn('w-5 h-5', config.cor)} />;
}

export default function PaginaResultadoDetalhe() {
  const params = useParams();
  const router = useRouter();
  const sessaoId = params.sessaoId as string;

  const [sessao, setSessao] = useState<SessaoEntrevista | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'geral' | 'respostas' | 'insights'>('geral');

  // Estados do relatório de inteligência
  const [relatorio, setRelatorio] = useState<RelatorioInteligencia | null>(null);
  const [metadadosRelatorio, setMetadadosRelatorio] = useState<MetadadosRelatorio | null>(null);
  const [gerandoRelatorio, setGerandoRelatorio] = useState(false);
  const [erroRelatorio, setErroRelatorio] = useState<string | null>(null);
  const [mostrarThinking, setMostrarThinking] = useState(false);

  // Carregar sessão
  useEffect(() => {
    async function carregar() {
      try {
        const dados = await db.sessoes.get(sessaoId);
        setSessao(dados || null);

        // Tentar carregar relatório salvo
        const relatorioSalvo = localStorage.getItem(`relatorio-${sessaoId}`);
        if (relatorioSalvo) {
          const parsed = JSON.parse(relatorioSalvo);
          setRelatorio(parsed.relatorio);
          setMetadadosRelatorio(parsed.metadados);
        }
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [sessaoId]);

  // Calcular estatísticas das respostas
  const calcularEstatisticas = () => {
    if (!sessao) return null;

    const respostas = sessao.respostas;
    const sentimentos: Record<string, number> = {
      positivo: 0,
      negativo: 0,
      neutro: 0,
    };

    respostas.forEach((r) => {
      const texto = r.respostas
        .map((resp) => String(resp.resposta))
        .join(' ')
        .toLowerCase();

      if (
        texto.includes('bom') ||
        texto.includes('ótimo') ||
        texto.includes('concordo') ||
        texto.includes('apoio') ||
        texto.includes('favor')
      ) {
        sentimentos.positivo++;
      } else if (
        texto.includes('ruim') ||
        texto.includes('péssimo') ||
        texto.includes('discordo') ||
        texto.includes('contra') ||
        texto.includes('nunca')
      ) {
        sentimentos.negativo++;
      } else {
        sentimentos.neutro++;
      }
    });

    return {
      totalRespostas: respostas.length,
      sentimentos,
      tempoMedio:
        respostas.length > 0
          ? respostas.reduce((acc, r) => acc + r.tempo_resposta_ms, 0) / respostas.length / 1000
          : 0,
    };
  };

  const stats = calcularEstatisticas();

  // Dados para gráficos
  const dadosSentimentos = stats
    ? [
        { nome: 'Positivo', valor: stats.sentimentos.positivo, cor: '#22c55e' },
        { nome: 'Negativo', valor: stats.sentimentos.negativo, cor: '#ef4444' },
        { nome: 'Neutro', valor: stats.sentimentos.neutro, cor: '#6b7280' },
      ]
    : [];

  // Gerar relatório de inteligência
  const gerarRelatorioInteligencia = useCallback(async () => {
    if (!sessao || gerandoRelatorio) return;

    setGerandoRelatorio(true);
    setErroRelatorio(null);

    try {
      // Extrair perguntas únicas das respostas
      const perguntasSet = new Set<string>();
      sessao.respostas.forEach((r) => {
        r.respostas.forEach((resp) => {
          perguntasSet.add(resp.pergunta_id);
        });
      });

      const perguntas = Array.from(perguntasSet).map((id) => ({
        id,
        texto: id, // Usar ID como texto se não tiver a pergunta original
        tipo: 'aberta',
      }));

      const response = await fetch('/api/claude/relatorio-inteligencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessaoId,
          titulo: sessao.titulo,
          perguntas,
          respostas: sessao.respostas,
          estatisticas: {
            totalRespostas: sessao.respostas.length,
            custoTotal: sessao.custoAtual,
            sentimentos: stats?.sentimentos || {},
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || 'Erro ao gerar relatório');
      }

      setRelatorio(data.relatorio);
      setMetadadosRelatorio(data.metadados);

      // Salvar no localStorage
      localStorage.setItem(
        `relatorio-${sessaoId}`,
        JSON.stringify({
          relatorio: data.relatorio,
          metadados: data.metadados,
        })
      );
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      setErroRelatorio(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setGerandoRelatorio(false);
    }
  }, [sessao, sessaoId, gerandoRelatorio, stats?.sentimentos]);

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!sessao) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-muted-foreground">Resultado não encontrado</p>
        <Link href="/resultados" className="text-primary hover:underline mt-4 inline-block">
          Voltar para lista
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-4">
      {/* Header - Mobile Optimized */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg -mx-4 px-4 py-3 sm:relative sm:bg-transparent sm:backdrop-blur-none sm:mx-0 sm:px-0 sm:py-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
                {sessao.titulo || 'Resultado da Pesquisa'}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {formatarDataHora(sessao.finalizadaEm || sessao.iniciadaEm)}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const exportData = {
                sessao,
                relatorio,
                metadados: metadadosRelatorio,
              };
              const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json',
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `resultado-completo-${sessao.id}.json`;
              a.click();
            }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors min-h-[44px] flex-shrink-0"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* Cards de resumo - Mobile: 2x2 grid compacto */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
        <div className="glass-card rounded-lg sm:rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Respondentes</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{sessao.respostas.length}</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-lg sm:rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Respostas</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground">
                {sessao.respostas.reduce((acc, r) => acc + r.respostas.length, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-lg sm:rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Custo</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-400">
                {formatarMoeda(sessao.custoAtual)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-lg sm:rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Tokens</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground">
                {formatarNumero(sessao.tokensInput + sessao.tokensOutput)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Abas - Mobile: Scrollable horizontal */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-border overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        {(['geral', 'respostas', 'insights'] as const).map((aba) => (
          <button
            key={aba}
            onClick={() => setAbaAtiva(aba)}
            className={cn(
              'px-3 sm:px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap min-h-[44px]',
              abaAtiva === aba
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {aba === 'geral' ? 'Visão Geral' : aba === 'respostas' ? 'Respostas' : 'Insights'}
          </button>
        ))}
      </div>

      {/* Conteúdo das abas */}
      {abaAtiva === 'geral' && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Gráfico de Sentimentos */}
          <div className="glass-card rounded-lg sm:rounded-xl p-4 sm:p-6">
            <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Análise de Sentimento</h3>
            <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
              <PieChart>
                <Pie
                  data={dadosSentimentos}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="valor"
                  nameKey="nome"
                  label={({ nome, valor }) => `${valor}`}
                  labelLine={false}
                >
                  {dadosSentimentos.map((entry, index) => (
                    <Cell key={index} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Métricas adicionais */}
          <div className="glass-card rounded-lg sm:rounded-xl p-4 sm:p-6">
            <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Métricas Detalhadas</h3>
            <div className="space-y-2 sm:space-y-4">
              <div className="flex items-center justify-between p-2 sm:p-3 bg-secondary/50 rounded-lg">
                <span className="text-xs sm:text-sm text-muted-foreground">Taxa de Conclusão</span>
                <span className="font-bold text-green-400 text-sm sm:text-base">
                  {Math.round((sessao.respostas.length / sessao.totalAgentes) * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between p-2 sm:p-3 bg-secondary/50 rounded-lg">
                <span className="text-xs sm:text-sm text-muted-foreground">Custo por Resposta</span>
                <span className="font-bold text-foreground text-sm sm:text-base">
                  {formatarMoeda(sessao.custoAtual / sessao.respostas.length || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 sm:p-3 bg-secondary/50 rounded-lg">
                <span className="text-xs sm:text-sm text-muted-foreground">Tokens por Resposta</span>
                <span className="font-bold text-foreground text-sm sm:text-base">
                  {Math.round(
                    (sessao.tokensInput + sessao.tokensOutput) / sessao.respostas.length || 0
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 sm:p-3 bg-secondary/50 rounded-lg">
                <span className="text-xs sm:text-sm text-muted-foreground">Sentimento</span>
                <span
                  className={cn(
                    'font-bold text-sm sm:text-base',
                    stats.sentimentos.positivo > stats.sentimentos.negativo
                      ? 'text-green-400'
                      : stats.sentimentos.negativo > stats.sentimentos.positivo
                        ? 'text-red-400'
                        : 'text-gray-400'
                  )}
                >
                  {stats.sentimentos.positivo > stats.sentimentos.negativo
                    ? 'Positivo'
                    : stats.sentimentos.negativo > stats.sentimentos.positivo
                      ? 'Negativo'
                      : 'Neutro'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {abaAtiva === 'respostas' && (
        <div className="glass-card rounded-lg sm:rounded-xl divide-y divide-border">
          {sessao.respostas.map((resposta, i) => (
            <div key={i} className="p-3 sm:p-4">
              <div className="flex items-start sm:items-center justify-between gap-2 mb-2">
                <span className="font-medium text-foreground text-sm sm:text-base truncate">{resposta.eleitor_nome}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                  <span className="hidden sm:inline">{resposta.tokens_usados} tokens • </span>
                  {formatarMoeda(resposta.custo)}
                </span>
              </div>
              {resposta.respostas.map((r, j) => (
                <div key={j} className="mt-2 p-2 sm:p-3 bg-secondary/50 rounded-lg">
                  <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">
                    {String(r.resposta)}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {abaAtiva === 'insights' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Botão para gerar relatório */}
          {!relatorio && (
            <>
              {/* Caixa Voto Silencioso - Placeholder */}
              <div className="glass-card rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-purple-500">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <EyeOff className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">Voto Silencioso</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                      Eleitores que podem votar de forma diferente do que declaram publicamente.
                    </p>
                    <div className="p-2 sm:p-4 bg-secondary/50 rounded-lg">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Clique no botão abaixo para gerar análise.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Caixa Ponto de Ruptura - Placeholder */}
              <div className="glass-card rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-orange-500">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">Pontos de Ruptura</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                      Eventos que podem mudar a intenção de voto.
                    </p>
                    <div className="p-2 sm:p-4 bg-secondary/50 rounded-lg">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Clique no botão abaixo para gerar análise.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão de geração */}
              <div className="text-center px-4 sm:px-0">
                {erroRelatorio && (
                  <div className="mb-4 p-3 sm:p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-xs sm:text-sm">{erroRelatorio}</p>
                  </div>
                )}
                <button
                  onClick={gerarRelatorioInteligencia}
                  disabled={gerandoRelatorio}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg transition-colors w-full sm:w-auto min-h-[48px]',
                    gerandoRelatorio
                      ? 'bg-primary/50 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  )}
                >
                  {gerandoRelatorio ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm sm:text-base">Gerando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span className="text-sm sm:text-base">Gerar Análise com IA</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-muted-foreground mt-2">
                  Claude Opus 4.5 com Extended Thinking
                </p>
              </div>
            </>
          )}

          {/* Relatório de Inteligência Completo */}
          {relatorio && (
            <div className="space-y-4 sm:space-y-6">
              {/* Header do Relatório */}
              <div className="glass-card rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-primary">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      <h2 className="text-base sm:text-xl font-bold text-foreground">
                        Relatório de Inteligência
                      </h2>
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      {formatarDataHora(relatorio.sumarioExecutivo.dataCriacao)}
                    </p>
                  </div>
                  <BadgeAlerta nivel={relatorio.sumarioExecutivo.nivelAlerta} />
                </div>

                {metadadosRelatorio && (
                  <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      {metadadosRelatorio.modelo}
                    </span>
                    <span className="flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      {formatarMoeda(metadadosRelatorio.custoReais)}
                    </span>
                    <span className="hidden sm:inline">
                      {formatarNumero(metadadosRelatorio.tokensInput + metadadosRelatorio.tokensOutput)} tokens
                    </span>
                    {metadadosRelatorio.usouExtendedThinking && (
                      <span className="text-purple-400">Extended Thinking</span>
                    )}
                  </div>
                )}
              </div>

              {/* Sumário Executivo */}
              <div className="glass-card rounded-lg sm:rounded-xl p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-transparent">
                <h3 className="font-semibold text-foreground mb-2 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Sumário Executivo
                </h3>
                <p className="text-sm sm:text-lg text-foreground leading-relaxed">
                  {relatorio.sumarioExecutivo.conclusaoPrincipal}
                </p>
              </div>

              {/* Análise Estratégica - SWOT */}
              <SecaoColapsavel
                titulo="Análise SWOT"
                icone={BarChart3}
                corIcone="bg-blue-500/20 text-blue-400"
                defaultAberto={true}
              >
                <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                  <p className="text-xs sm:text-sm text-muted-foreground">{relatorio.analiseEstrategica.panoramaGeral}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    {/* Fortalezas */}
                    <div className="p-3 sm:p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <h4 className="font-medium text-green-400 mb-1 sm:mb-2 flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Fortalezas
                      </h4>
                      <ul className="space-y-1">
                        {relatorio.analiseEstrategica.fortalezas.map((f, i) => (
                          <li key={i} className="text-xs sm:text-sm text-muted-foreground">• {f}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Vulnerabilidades */}
                    <div className="p-3 sm:p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                      <h4 className="font-medium text-red-400 mb-1 sm:mb-2 flex items-center gap-2 text-sm">
                        <XCircle className="w-4 h-4" />
                        Vulnerabilidades
                      </h4>
                      <ul className="space-y-1">
                        {relatorio.analiseEstrategica.vulnerabilidades.map((v, i) => (
                          <li key={i} className="text-xs sm:text-sm text-muted-foreground">• {v}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Oportunidades */}
                    <div className="p-3 sm:p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <h4 className="font-medium text-blue-400 mb-1 sm:mb-2 flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4" />
                        Oportunidades
                      </h4>
                      <ul className="space-y-1">
                        {relatorio.analiseEstrategica.oportunidades.map((o, i) => (
                          <li key={i} className="text-xs sm:text-sm text-muted-foreground">• {o}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Ameaças */}
                    <div className="p-3 sm:p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <h4 className="font-medium text-orange-400 mb-1 sm:mb-2 flex items-center gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        Ameaças
                      </h4>
                      <ul className="space-y-1">
                        {relatorio.analiseEstrategica.ameacas.map((a, i) => (
                          <li key={i} className="text-xs sm:text-sm text-muted-foreground">• {a}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </SecaoColapsavel>

              {/* Perfis Psicográficos */}
              <SecaoColapsavel
                titulo="Perfis Psicográficos"
                icone={Users}
                corIcone="bg-purple-500/20 text-purple-400"
              >
                <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                  {relatorio.perfisPsicograficos.map((perfil, i) => (
                    <div key={i} className="p-3 sm:p-4 bg-secondary/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h4 className="font-medium text-foreground text-sm sm:text-base">{perfil.segmento}</h4>
                        <span className="text-sm text-primary font-bold">{perfil.percentual}%</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                        <div>
                          <p className="text-muted-foreground font-medium mb-1">Características:</p>
                          <ul className="text-muted-foreground">
                            {perfil.caracteristicas.slice(0, 3).map((c, j) => (
                              <li key={j}>• {c}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-medium mb-1">Gatilhos:</p>
                          <ul className="text-muted-foreground">
                            {perfil.gatilhosEmocionais.slice(0, 3).map((g, j) => (
                              <li key={j}>• {g}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-green-400 font-medium mb-1">Mensagens:</p>
                          <ul className="text-muted-foreground">
                            {perfil.mensagensEficazes.slice(0, 2).map((m, j) => (
                              <li key={j}>• {m}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-red-400 font-medium mb-1">Evitar:</p>
                          <ul className="text-muted-foreground">
                            {perfil.errosEvitar.slice(0, 2).map((e, j) => (
                              <li key={j}>• {e}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SecaoColapsavel>

              {/* Voto Silencioso */}
              <div className="glass-card rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-purple-500">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <EyeOff className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">Voto Silencioso</h3>
                      <span className="text-lg sm:text-2xl font-bold text-purple-400">
                        ~{relatorio.votoSilencioso.estimativaPercentual}%
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                      {relatorio.votoSilencioso.perfilTipico}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-2">Identificar:</p>
                        <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                          {relatorio.votoSilencioso.indicadoresIdentificacao.slice(0, 3).map((ind, i) => (
                            <li key={i}>• {ind}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-green-400 mb-1 sm:mb-2">Conversão:</p>
                        <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                          {relatorio.votoSilencioso.estrategiasConversao.slice(0, 3).map((est, i) => (
                            <li key={i}>• {est}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {relatorio.votoSilencioso.riscos.length > 0 && (
                      <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <p className="text-xs sm:text-sm font-medium text-red-400 mb-1">Riscos:</p>
                        <ul className="text-xs sm:text-sm text-muted-foreground">
                          {relatorio.votoSilencioso.riscos.slice(0, 2).map((r, i) => (
                            <li key={i}>• {r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pontos de Ruptura */}
              <div className="glass-card rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-orange-500">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Pontos de Ruptura</h3>

                    <div className="space-y-3 sm:space-y-4">
                      {relatorio.pontosRuptura.slice(0, 3).map((ponto, i) => (
                        <div key={i} className="p-3 sm:p-4 bg-secondary/50 rounded-lg">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-medium text-foreground text-sm truncate">{ponto.grupo}</span>
                            <span
                              className={cn(
                                'text-xs sm:text-sm font-bold whitespace-nowrap',
                                ponto.probabilidadeMudanca >= 70
                                  ? 'text-red-400'
                                  : ponto.probabilidadeMudanca >= 40
                                    ? 'text-orange-400'
                                    : 'text-yellow-400'
                              )}
                            >
                              {ponto.probabilidadeMudanca}%
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                            <strong>Gatilho:</strong> {ponto.eventoGatilho}
                          </p>
                          <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                            {ponto.sinaisAlerta.slice(0, 2).map((sinal, j) => (
                              <span
                                key={j}
                                className="text-xs px-2 py-0.5 sm:py-1 bg-orange-500/20 text-orange-300 rounded-full"
                              >
                                {sinal}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recomendações Estratégicas */}
              <SecaoColapsavel
                titulo="Recomendações"
                icone={Lightbulb}
                corIcone="bg-yellow-500/20 text-yellow-400"
                defaultAberto={true}
              >
                <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    {/* Curto Prazo */}
                    <div className="p-3 sm:p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <h4 className="font-medium text-green-400 mb-1 sm:mb-2 flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" />
                        Curto Prazo
                      </h4>
                      <ul className="space-y-1">
                        {relatorio.recomendacoesEstrategicas.curtoPrazo.slice(0, 3).map((r, i) => (
                          <li key={i} className="text-xs sm:text-sm text-muted-foreground">• {r}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Médio Prazo */}
                    <div className="p-3 sm:p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <h4 className="font-medium text-blue-400 mb-1 sm:mb-2 flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4" />
                        Médio Prazo
                      </h4>
                      <ul className="space-y-1">
                        {relatorio.recomendacoesEstrategicas.medioPrazo.slice(0, 3).map((r, i) => (
                          <li key={i} className="text-xs sm:text-sm text-muted-foreground">• {r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Mensagens-Chave */}
                  <div className="p-3 sm:p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <h4 className="font-medium text-primary mb-1 sm:mb-2 text-sm">Mensagens-Chave</h4>
                    <ul className="space-y-1">
                      {relatorio.recomendacoesEstrategicas.mensagensChave.slice(0, 3).map((m, i) => (
                        <li key={i} className="text-xs sm:text-sm text-muted-foreground">&quot;{m}&quot;</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    {/* Temas a Evitar */}
                    <div className="p-3 sm:p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                      <h4 className="font-medium text-red-400 mb-1 sm:mb-2 text-sm">Evitar</h4>
                      <ul className="space-y-1">
                        {relatorio.recomendacoesEstrategicas.temasEvitar.slice(0, 3).map((t, i) => (
                          <li key={i} className="text-xs sm:text-sm text-muted-foreground">• {t}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Canais Recomendados */}
                    <div className="p-3 sm:p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <h4 className="font-medium text-purple-400 mb-1 sm:mb-2 text-sm">Canais</h4>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {relatorio.recomendacoesEstrategicas.canaisRecomendados.slice(0, 4).map((c, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 sm:py-1 bg-purple-500/20 text-purple-300 rounded-full"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </SecaoColapsavel>

              {/* Alertas de Inteligência */}
              <SecaoColapsavel
                titulo="Alertas"
                icone={AlertCircle}
                corIcone="bg-red-500/20 text-red-400"
              >
                <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                  {relatorio.alertasInteligencia
                    .sort((a, b) => b.prioridade - a.prioridade)
                    .slice(0, 5)
                    .map((alerta, i) => (
                      <div
                        key={i}
                        className={cn(
                          'p-3 sm:p-4 rounded-lg border',
                          alerta.tipo === 'urgente'
                            ? 'bg-red-500/10 border-red-500/30'
                            : alerta.tipo === 'risco'
                              ? 'bg-orange-500/10 border-orange-500/30'
                              : alerta.tipo === 'oportunidade'
                                ? 'bg-green-500/10 border-green-500/30'
                                : 'bg-blue-500/10 border-blue-500/30'
                        )}
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          <IconeAlertaTipo tipo={alerta.tipo} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start sm:items-center justify-between gap-2">
                              <h4 className="font-medium text-foreground text-sm truncate">{alerta.titulo}</h4>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {alerta.prioridade}/10
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{alerta.descricao}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </SecaoColapsavel>

              {/* Conclusão Analítica */}
              <div className="glass-card rounded-lg sm:rounded-xl p-4 sm:p-6 bg-gradient-to-r from-primary/5 to-transparent">
                <h3 className="font-semibold text-foreground mb-2 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Conclusão
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {relatorio.conclusaoAnalitica}
                </p>
              </div>

              {/* Processo de Thinking (se disponível) */}
              {relatorio.thinkingProcess && (
                <div className="glass-card rounded-xl overflow-hidden">
                  <button
                    onClick={() => setMostrarThinking(!mostrarThinking)}
                    className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-left">
                          Processo de Raciocínio da IA
                        </h3>
                        <p className="text-xs text-muted-foreground">Extended Thinking do Claude Opus 4.5</p>
                      </div>
                    </div>
                    {mostrarThinking ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  {mostrarThinking && (
                    <div className="p-4 pt-0 border-t border-border">
                      <div className="p-4 bg-secondary/30 rounded-lg max-h-96 overflow-y-auto">
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                          {relatorio.thinkingProcess}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Botão para regenerar */}
              <div className="text-center">
                <button
                  onClick={gerarRelatorioInteligencia}
                  disabled={gerandoRelatorio}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors text-sm"
                >
                  {gerandoRelatorio ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Regenerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Regenerar Análise
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
