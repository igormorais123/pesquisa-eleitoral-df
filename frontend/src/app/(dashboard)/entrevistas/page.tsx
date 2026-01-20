'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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
  Sparkles,
} from 'lucide-react';
import { db } from '@/lib/db/dexie';
import { formatarDataHora, formatarMoeda, cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

// Animações suaves estilo Apple
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } }
};

export default function PaginaEntrevistas() {
  const { usuario } = useAuthStore();

  const { data: sessoes, isLoading } = useQuery({
    queryKey: ['sessoes', usuario?.id],
    queryFn: async () => {
      const todas = await db.sessoes.orderBy('iniciadaEm').reverse().toArray();
      return todas.filter((s) => !s.usuarioId || s.usuarioId === usuario?.id);
    },
  });

  const statusConfig = {
    em_andamento: { cor: 'bg-blue-500', texto: 'Em andamento', icone: Play },
    pausada: { cor: 'bg-yellow-500', texto: 'Pausada', icone: Clock },
    concluida: { cor: 'bg-green-500', texto: 'Concluída', icone: CheckCircle },
    erro: { cor: 'bg-red-500', texto: 'Erro', icone: AlertCircle },
  };

  // Estatísticas
  const stats = {
    total: sessoes?.length || 0,
    concluidas: sessoes?.filter((s) => s.status === 'concluida').length || 0,
    respostas: sessoes?.reduce((acc, s) => acc + s.respostas.length, 0) || 0,
    custo: sessoes?.reduce((acc, s) => acc + s.custoAtual, 0) || 0,
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="space-y-8"
    >
      {/* Hero Header - Estilo Apple */}
      <motion.header variants={fadeIn} className="text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
          Entrevistas
        </h1>
        <p className="text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
          Pesquisas com agentes sintéticos alimentados por IA
        </p>
      </motion.header>

      {/* Números em destaque */}
      <motion.div
        variants={fadeIn}
        className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto"
      >
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-semibold text-foreground">
            {stats.total}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Total</div>
        </div>
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-semibold text-foreground">
            {stats.concluidas}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Concluídas</div>
        </div>
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-semibold text-foreground">
            {stats.respostas}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Respostas</div>
        </div>
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-semibold text-foreground">
            {formatarMoeda(stats.custo)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Custo Total</div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div variants={fadeIn} className="flex justify-center">
        <Link
          href="/entrevistas/nova"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors"
        >
          <Sparkles className="w-5 h-5" />
          Nova Entrevista
        </Link>
      </motion.div>

      {/* Lista de sessões */}
      <motion.div
        variants={fadeIn}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold text-foreground text-lg">Histórico de Entrevistas</h2>
        </div>

        {isLoading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </div>
        ) : !sessoes?.length ? (
          <div className="p-16 text-center">
            <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-xl font-semibold text-foreground mb-2">Nenhuma entrevista ainda</p>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Comece criando sua primeira pesquisa com os agentes sintéticos
            </p>
            <Link
              href="/entrevistas/nova"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors"
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
              const eleitoresUnicos = new Set(sessao.respostas.map(r => r.eleitor_id)).size;
              const progressoPct = Math.min((eleitoresUnicos / sessao.totalAgentes) * 100, 100);

              return (
                <Link
                  key={sessao.id}
                  href={
                    sessao.status === 'concluida'
                      ? `/resultados/${sessao.id}`
                      : `/entrevistas/execucao?sessao=${sessao.id}`
                  }
                  className="flex items-center gap-4 p-5 hover:bg-muted/50 transition-colors"
                >
                  {/* Status */}
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      config.cor + '/10'
                    )}
                  >
                    <Icone className={cn('w-6 h-6', config.cor.replace('bg-', 'text-').replace('-500', '-400'))} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate text-lg">
                      {sessao.titulo || 'Sem título'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                      <span>
                        {formatarDataHora(sessao.iniciadaEm)} • {eleitoresUnicos}/{sessao.totalAgentes} eleitores
                      </span>
                      {sessao.usuarioNome && (
                        <span className="flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                          <User className="w-3 h-3" />
                          {sessao.usuarioNome}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progresso */}
                  <div className="hidden sm:block w-32">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="text-foreground font-medium">{Math.round(progressoPct)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', config.cor)}
                        style={{ width: `${progressoPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Custo */}
                  <div className="text-right hidden sm:block">
                    <p className="font-semibold text-foreground">{formatarMoeda(sessao.custoAtual)}</p>
                    <p className="text-xs text-muted-foreground">
                      {((sessao.tokensInput + sessao.tokensOutput) / 1000).toFixed(1)}k tokens
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
