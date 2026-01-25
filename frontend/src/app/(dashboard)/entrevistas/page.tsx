'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  BarChart3,
  Coins,
  User,
} from 'lucide-react';
import { db } from '@/lib/db/dexie';
import { formatarDataHora, formatarMoeda, cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

export default function PaginaEntrevistas() {
  const { usuario } = useAuthStore();

  // Buscar sessões do banco - filtrar por usuário logado
  const { data: sessoes, isLoading } = useQuery({
    queryKey: ['sessoes', usuario?.id],
    queryFn: async () => {
      const todas = await db.sessoes.orderBy('iniciadaEm').reverse().toArray();
      // Filtrar por usuário logado (mostrar também sessões antigas sem usuário)
      return todas.filter((s) => !s.usuarioId || s.usuarioId === usuario?.id);
    },
  });

  const statusConfig = {
    em_andamento: { cor: 'bg-blue-500', texto: 'Em andamento', icone: Play },
    pausada: { cor: 'bg-yellow-500', texto: 'Pausada', icone: Clock },
    concluida: { cor: 'bg-green-500', texto: 'Concluída', icone: CheckCircle },
    erro: { cor: 'bg-red-500', texto: 'Erro', icone: AlertCircle },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-primary" />
            Entrevistas
          </h1>
          <p className="text-muted-foreground mt-1">
            Crie e gerencie pesquisas com agentes sintéticos
          </p>
        </div>

        <Link
          href="/entrevistas/nova"
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Entrevista
        </Link>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">{sessoes?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Concluídas</p>
              <p className="text-2xl font-bold text-foreground">
                {sessoes?.filter((s) => s.status === 'concluida').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Respostas</p>
              <p className="text-2xl font-bold text-foreground">
                {sessoes?.reduce((acc, s) => acc + s.respostas.length, 0) || 0}
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
                {formatarMoeda(sessoes?.reduce((acc, s) => acc + s.custoAtual, 0) || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de sessões */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Histórico de Entrevistas</h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : !sessoes?.length ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">Nenhuma entrevista ainda</p>
            <p className="text-muted-foreground mb-6">
              Comece criando sua primeira pesquisa com os agentes sintéticos
            </p>
            <Link
              href="/entrevistas/nova"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Criar Primeira Entrevista
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sessoes.map((sessao) => {
              const config = statusConfig[sessao.status];
              const Icone = config.icone;

              return (
                <Link
                  key={sessao.id}
                  href={
                    sessao.status === 'concluida'
                      ? `/resultados/${sessao.id}`
                      : `/entrevistas/execucao?sessao=${sessao.id}`
                  }
                  className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
                >
                  {/* Status */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      config.cor + '/20'
                    )}
                  >
                    <Icone className={cn('w-5 h-5', config.cor.replace('bg-', 'text-'))} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {sessao.titulo || 'Sem título'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {formatarDataHora(sessao.iniciadaEm)} •{' '}
                        {new Set(sessao.respostas.map(r => r.eleitor_id)).size}/{sessao.totalAgentes} eleitores
                      </span>
                      {sessao.usuarioNome && (
                        <span className="flex items-center gap-1 text-xs bg-secondary px-2 py-0.5 rounded-full">
                          <User className="w-3 h-3" />
                          {sessao.usuarioNome}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progresso - calculado por eleitores únicos */}
                  <div className="w-32">
                    {(() => {
                      const eleitoresUnicos = new Set(sessao.respostas.map(r => r.eleitor_id)).size;
                      const progressoPct = Math.min((eleitoresUnicos / sessao.totalAgentes) * 100, 100);
                      return (
                        <>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="text-foreground">
                              {Math.round(progressoPct)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', config.cor)}
                              style={{ width: `${progressoPct}%` }}
                            />
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Custo */}
                  <div className="text-right">
                    <p className="font-medium text-foreground">{formatarMoeda(sessao.custoAtual)}</p>
                    <p className="text-xs text-muted-foreground">
                      {sessao.tokensInput + sessao.tokensOutput} tokens
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
