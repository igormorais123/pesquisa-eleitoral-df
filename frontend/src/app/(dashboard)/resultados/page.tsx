'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  Clock,
  CheckCircle,
  Users,
  Coins,
  TrendingUp,
  FileText,
  Download,
  User,
} from 'lucide-react';
import { db } from '@/lib/db/dexie';
import { formatarDataHora, formatarMoeda, cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

export default function PaginaResultados() {
  const { usuario } = useAuthStore();

  // Buscar sessões concluídas - filtrar por usuário logado
  const { data: sessoes, isLoading } = useQuery({
    queryKey: ['sessoes-concluidas', usuario?.id],
    queryFn: async () => {
      const todas = await db.sessoes.toArray();
      // Filtrar por usuário logado (mostrar também sessões antigas sem usuário)
      const filtradas = todas.filter((s) => {
        const pertenceAoUsuario = !s.usuarioId || s.usuarioId === usuario?.id;
        return s.status === 'concluida' && pertenceAoUsuario;
      });
      return filtradas.sort((a, b) =>
        new Date(b.finalizadaEm || b.iniciadaEm).getTime() -
        new Date(a.finalizadaEm || a.iniciadaEm).getTime()
      );
    },
  });

  // Estatísticas gerais
  const estatisticas = sessoes
    ? {
        totalSessoes: sessoes.length,
        totalRespostas: sessoes.reduce((acc, s) => acc + s.respostas.length, 0),
        custoTotal: sessoes.reduce((acc, s) => acc + s.custoAtual, 0),
        tokensTotal: sessoes.reduce(
          (acc, s) => acc + s.tokensInput + s.tokensOutput,
          0
        ),
      }
    : { totalSessoes: 0, totalRespostas: 0, custoTotal: 0, tokensTotal: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary" />
            Resultados
          </h1>
          <p className="text-muted-foreground mt-1">
            Análises e visualizações das pesquisas realizadas
          </p>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pesquisas</p>
              <p className="text-2xl font-bold text-foreground">
                {estatisticas.totalSessoes}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Respostas</p>
              <p className="text-2xl font-bold text-foreground">
                {estatisticas.totalRespostas}
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
              <p className="text-2xl font-bold text-foreground">
                {formatarMoeda(estatisticas.custoTotal)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tokens</p>
              <p className="text-2xl font-bold text-foreground">
                {(estatisticas.tokensTotal / 1000).toFixed(1)}k
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de resultados */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Pesquisas Concluídas</h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : !sessoes?.length ? (
          <div className="p-12 text-center">
            <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              Nenhum resultado disponível
            </p>
            <p className="text-muted-foreground mb-6">
              Execute entrevistas para ver os resultados aqui
            </p>
            <Link
              href="/entrevistas/nova"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
            >
              Criar Entrevista
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sessoes.map((sessao) => (
              <Link
                key={sessao.id}
                href={`/resultados/${sessao.id}`}
                className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 p-4 hover:bg-secondary/50 transition-colors"
              >
                {/* Ícone */}
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {sessao.titulo || 'Pesquisa sem título'}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      {formatarDataHora(sessao.finalizadaEm || sessao.iniciadaEm)} •{' '}
                      {new Set(sessao.respostas.map(r => r.eleitor_id)).size} eleitores
                    </span>
                    {sessao.usuarioNome && (
                      <span className="flex items-center gap-1 text-xs bg-secondary px-2 py-0.5 rounded-full">
                        <User className="w-3 h-3" />
                        {sessao.usuarioNome}
                      </span>
                    )}
                  </div>
                </div>

                {/* Métricas */}
                <div className="hidden sm:flex items-center gap-4 lg:gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Custo</p>
                    <p className="font-medium text-yellow-400">
                      {formatarMoeda(sessao.custoAtual)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Tokens</p>
                    <p className="font-medium text-foreground">
                      {((sessao.tokensInput + sessao.tokensOutput) / 1000).toFixed(1)}k
                    </p>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      // Exportar JSON
                      const blob = new Blob([JSON.stringify(sessao, null, 2)], {
                        type: 'application/json',
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `resultado-${sessao.id}.json`;
                      a.click();
                    }}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="Exportar JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
