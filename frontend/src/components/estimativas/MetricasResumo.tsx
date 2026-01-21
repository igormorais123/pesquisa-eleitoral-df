'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BarChart3,
  TrendingUp,
  Calendar,
  Percent,
  Target,
} from 'lucide-react';
import { PESQUISAS_2026, calcularMediaPonderada } from '@/data/pesquisas-eleitorais-2026';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MetricaCardProps {
  icone: React.ReactNode;
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  cor?: string;
  delay?: number;
}

function MetricaCard({ icone, titulo, valor, subtitulo, cor, delay = 0 }: MetricaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative overflow-hidden p-6 rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-lg hover:shadow-black/5 transition-all group"
    >
      {/* Decoração de fundo */}
      <div
        className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity"
        style={{ backgroundColor: cor || 'hsl(var(--primary))' }}
      />

      <div className="relative">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
          style={{
            backgroundColor: `${cor || 'hsl(var(--primary))'}15`,
            color: cor || 'hsl(var(--primary))',
          }}
        >
          {icone}
        </div>

        <div className="text-sm text-muted-foreground mb-1">{titulo}</div>
        <div className="text-3xl font-bold text-foreground tracking-tight number">{valor}</div>
        {subtitulo && (
          <div className="text-xs text-muted-foreground mt-1">{subtitulo}</div>
        )}
      </div>
    </motion.div>
  );
}

export function MetricasResumo() {
  const metricas = useMemo(() => {
    const totalPesquisas = PESQUISAS_2026.length;
    const totalEntrevistados = PESQUISAS_2026.reduce((acc, p) => acc + p.entrevistados, 0);

    const ultimaPesquisa = PESQUISAS_2026.reduce((mais, p) =>
      new Date(p.publicacao) > new Date(mais.publicacao) ? p : mais
    );

    const liderMedia = calcularMediaPonderada(PESQUISAS_2026, 'Lula');
    const segundoMedia = calcularMediaPonderada(PESQUISAS_2026, 'Flávio Bolsonaro');
    const distancia = liderMedia - segundoMedia;

    const margemMedia =
      PESQUISAS_2026.reduce((acc, p) => acc + p.margemErro, 0) / PESQUISAS_2026.length;

    return {
      totalPesquisas,
      totalEntrevistados,
      ultimaPesquisa,
      liderMedia,
      distancia,
      margemMedia,
    };
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <MetricaCard
        icone={<BarChart3 className="w-5 h-5" />}
        titulo="Pesquisas"
        valor={metricas.totalPesquisas}
        subtitulo="Registradas no TSE"
        cor="#3B82F6"
        delay={0}
      />

      <MetricaCard
        icone={<Users className="w-5 h-5" />}
        titulo="Entrevistados"
        valor={metricas.totalEntrevistados.toLocaleString('pt-BR')}
        subtitulo="Total agregado"
        cor="#8B5CF6"
        delay={0.05}
      />

      <MetricaCard
        icone={<Calendar className="w-5 h-5" />}
        titulo="Última Pesquisa"
        valor={format(parseISO(metricas.ultimaPesquisa.publicacao), "dd MMM", { locale: ptBR })}
        subtitulo={metricas.ultimaPesquisa.instituto}
        cor="#10B981"
        delay={0.1}
      />

      <MetricaCard
        icone={<Target className="w-5 h-5" />}
        titulo="Líder"
        valor={`${metricas.liderMedia.toFixed(1)}%`}
        subtitulo="Lula (PT)"
        cor="#E31C23"
        delay={0.15}
      />

      <MetricaCard
        icone={<TrendingUp className="w-5 h-5" />}
        titulo="Vantagem"
        valor={`+${metricas.distancia.toFixed(1)}pp`}
        subtitulo="Sobre 2º colocado"
        cor="#F59E0B"
        delay={0.2}
      />

      <MetricaCard
        icone={<Percent className="w-5 h-5" />}
        titulo="Margem Média"
        valor={`±${metricas.margemMedia.toFixed(1)}pp`}
        subtitulo="Confiança 95%"
        cor="#6B7280"
        delay={0.25}
      />
    </div>
  );
}
