'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  CheckCircle,
  Users,
  Coins,
  TrendingUp,
  Download,
  User,
  ArrowRight,
} from 'lucide-react';
import { db } from '@/lib/db/dexie';
import { formatarDataHora, formatarMoeda } from '@/lib/utils';
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

export default function PaginaResultados() {
  const { usuario } = useAuthStore();

  const { data: sessoes, isLoading } = useQuery({
    queryKey: ['sessoes-concluidas', usuario?.id],
    queryFn: async () => {
      const todas = await db.sessoes.toArray();
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

  const estatisticas = sessoes
    ? {
        totalSessoes: sessoes.length,
        totalRespostas: sessoes.reduce((acc, s) => acc + s.respostas.length, 0),
        custoTotal: sessoes.reduce((acc, s) => acc + s.custoAtual, 0),
        tokensTotal: sessoes.reduce((acc, s) => acc + s.tokensInput + s.tokensOutput, 0),
      }
    : { totalSessoes: 0, totalRespostas: 0, custoTotal: 0, tokensTotal: 0 };

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
          Resultados
        </h1>
        <p className="text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
          Análises e visualizações das pesquisas realizadas
        </p>
      </motion.header>

      {/* Números em destaque */}
      <motion.div
        variants={fadeIn}
        className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto"
      >
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-semibold text-foreground">
            {estatisticas.totalSessoes}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Pesquisas</div>
        </div>
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-semibold text-foreground">
            {estatisticas.totalRespostas}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Respostas</div>
        </div>
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-semibold text-foreground">
            {formatarMoeda(estatisticas.custoTotal)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Custo Total</div>
        </div>
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-semibold text-foreground">
            {(estatisticas.tokensTotal / 1000).toFixed(1)}k
          </div>
          <div className="text-sm text-muted-foreground mt-1">Tokens</div>
        </div>
      </motion.div>

      {/* Lista de resultados */}
      <motion.div
        variants={fadeIn}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold text-foreground text-lg">Pesquisas Concluídas</h2>
        </div>

        {isLoading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </div>
        ) : !sessoes?.length ? (
          <div className="p-16 text-center">
            <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-xl font-semibold text-foreground mb-2">
              Nenhum resultado disponível
            </p>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Execute entrevistas para ver os resultados aqui
            </p>
            <Link
              href="/entrevistas/nova"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors"
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
                className="flex flex-wrap sm:flex-nowrap items-center gap-4 p-5 hover:bg-muted/50 transition-colors group"
              >
                {/* Ícone */}
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate text-lg">
                    {sessao.titulo || 'Pesquisa sem título'}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                    <span>
                      {formatarDataHora(sessao.finalizadaEm || sessao.iniciadaEm)} •{' '}
                      {new Set(sessao.respostas.map(r => r.eleitor_id)).size} eleitores
                    </span>
                    {sessao.usuarioNome && (
                      <span className="flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                        <User className="w-3 h-3" />
                        {sessao.usuarioNome}
                      </span>
                    )}
                  </div>
                </div>

                {/* Métricas */}
                <div className="hidden sm:flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Custo</p>
                    <p className="font-semibold text-amber-500">
                      {formatarMoeda(sessao.custoAtual)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Tokens</p>
                    <p className="font-semibold text-foreground">
                      {((sessao.tokensInput + sessao.tokensOutput) / 1000).toFixed(1)}k
                    </p>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const blob = new Blob([JSON.stringify(sessao, null, 2)], {
                        type: 'application/json',
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `resultado-${sessao.id}.json`;
                      a.click();
                    }}
                    className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Exportar JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
