'use client';

import { useEffect, useState } from 'react';
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

export default function PaginaResultadoDetalhe() {
  const params = useParams();
  const router = useRouter();
  const sessaoId = params.sessaoId as string;

  const [sessao, setSessao] = useState<SessaoEntrevista | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'geral' | 'respostas' | 'insights'>('geral');

  // Carregar sessão
  useEffect(() => {
    async function carregar() {
      try {
        const dados = await db.sessoes.get(sessaoId);
        setSessao(dados || null);
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

    // Análise simples de sentimento baseada em palavras-chave
    respostas.forEach((r) => {
      const texto = r.respostas
        .map((resp) => String(resp.resposta))
        .join(' ')
        .toLowerCase();

      if (
        texto.includes('bom') ||
        texto.includes('ótimo') ||
        texto.includes('concordo') ||
        texto.includes('apoio')
      ) {
        sentimentos.positivo++;
      } else if (
        texto.includes('ruim') ||
        texto.includes('péssimo') ||
        texto.includes('discordo') ||
        texto.includes('contra')
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
          ? respostas.reduce((acc, r) => acc + r.tempo_resposta_ms, 0) /
            respostas.length /
            1000
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {sessao.titulo || 'Resultado da Pesquisa'}
            </h1>
            <p className="text-muted-foreground">
              {formatarDataHora(sessao.finalizadaEm || sessao.iniciadaEm)}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(sessao, null, 2)], {
              type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `resultado-${sessao.id}.json`;
            a.click();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar JSON
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Respondentes</p>
              <p className="text-2xl font-bold text-foreground">
                {sessao.respostas.length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Respostas</p>
              <p className="text-2xl font-bold text-foreground">
                {sessao.respostas.reduce((acc, r) => acc + r.respostas.length, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Custo Total</p>
              <p className="text-2xl font-bold text-yellow-400">
                {formatarMoeda(sessao.custoAtual)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tokens</p>
              <p className="text-2xl font-bold text-foreground">
                {formatarNumero(sessao.tokensInput + sessao.tokensOutput)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="flex items-center gap-2 border-b border-border">
        {(['geral', 'respostas', 'insights'] as const).map((aba) => (
          <button
            key={aba}
            onClick={() => setAbaAtiva(aba)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Sentimentos */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Análise de Sentimento</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dadosSentimentos}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="valor"
                  nameKey="nome"
                  label={({ nome, valor }) => `${nome}: ${valor}`}
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
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Métricas adicionais */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Métricas Detalhadas</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <span className="text-muted-foreground">Taxa de Conclusão</span>
                <span className="font-bold text-green-400">
                  {Math.round(
                    (sessao.respostas.length / sessao.totalAgentes) * 100
                  )}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <span className="text-muted-foreground">Custo por Resposta</span>
                <span className="font-bold text-foreground">
                  {formatarMoeda(sessao.custoAtual / sessao.respostas.length || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <span className="text-muted-foreground">Tokens por Resposta</span>
                <span className="font-bold text-foreground">
                  {Math.round(
                    (sessao.tokensInput + sessao.tokensOutput) /
                      sessao.respostas.length || 0
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <span className="text-muted-foreground">Sentimento Predominante</span>
                <span
                  className={cn(
                    'font-bold',
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
        <div className="glass-card rounded-xl divide-y divide-border">
          {sessao.respostas.map((resposta, i) => (
            <div key={i} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">{resposta.eleitor_nome}</span>
                <span className="text-xs text-muted-foreground">
                  {resposta.tokens_usados} tokens • {formatarMoeda(resposta.custo)}
                </span>
              </div>
              {resposta.respostas.map((r, j) => (
                <div key={j} className="mt-2 p-3 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {String(r.resposta)}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {abaAtiva === 'insights' && (
        <div className="space-y-6">
          {/* Caixa Voto Silencioso */}
          <div className="glass-card rounded-xl p-6 border-l-4 border-purple-500">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <EyeOff className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Voto Silencioso</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Eleitores que podem votar de forma diferente do que declaram publicamente.
                  Esta análise identifica contradições entre valores declarados e respostas.
                </p>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Análise detalhada disponível após processamento com IA.
                    Execute a geração de insights para ver resultados.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Caixa Ponto de Ruptura */}
          <div className="glass-card rounded-xl p-6 border-l-4 border-orange-500">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Pontos de Ruptura</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Eventos ou situações que podem fazer grupos de eleitores mudarem
                  sua posição ou intenção de voto.
                </p>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Análise detalhada disponível após processamento com IA.
                    Execute a geração de insights para ver resultados.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botão para gerar insights */}
          <div className="text-center">
            <button
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
              onClick={() => {
                alert('Funcionalidade de geração de insights via IA será implementada.');
              }}
            >
              <Lightbulb className="w-5 h-5" />
              Gerar Insights com IA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
