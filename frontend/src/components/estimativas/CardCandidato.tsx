'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardCandidatoProps {
  posicao: number;
  nome: string;
  partido: string;
  percentual: number;
  intervaloInferior: number;
  intervaloSuperior: number;
  tendencia: 'subindo' | 'estavel' | 'caindo';
  variacao: number;
  cor: string;
  probabilidadeVitoria?: number;
  isLider?: boolean;
}

export function CardCandidato({
  posicao,
  nome,
  partido,
  percentual,
  intervaloInferior,
  intervaloSuperior,
  tendencia,
  variacao,
  cor,
  probabilidadeVitoria,
  isLider,
}: CardCandidatoProps) {
  const TendenciaIcon = tendencia === 'subindo' ? TrendingUp : tendencia === 'caindo' ? TrendingDown : Minus;
  const tendenciaCor = tendencia === 'subindo' ? 'text-emerald-500' : tendencia === 'caindo' ? 'text-red-500' : 'text-muted-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: posicao * 0.05 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl transition-all duration-500',
        'bg-card border border-border/50',
        'hover:shadow-xl hover:shadow-black/5 hover:border-border',
        'hover:-translate-y-1',
        isLider && 'ring-2 ring-primary/20 shadow-lg shadow-primary/5'
      )}
    >
      {/* Barra de progresso sutil no topo */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted/30 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentual}%` }}
          transition={{ duration: 1, delay: 0.2 + posicao * 0.05, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: cor }}
        />
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Posição e Info do Candidato */}
          <div className="flex items-start gap-4">
            {/* Posição com estilo Apple */}
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-colors',
                isLider ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'
              )}
            >
              {posicao}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {nome}
              </h3>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium mt-1"
                style={{ backgroundColor: `${cor}15`, color: cor }}
              >
                {partido}
              </span>
            </div>
          </div>

          {/* Percentual Principal */}
          <div className="text-right">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-foreground number">
                {percentual.toFixed(1)}
              </span>
              <span className="text-xl text-muted-foreground">%</span>
            </div>

            {/* Intervalo de Confiança */}
            <div className="text-xs text-muted-foreground mt-1">
              {intervaloInferior.toFixed(1)}% – {intervaloSuperior.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Footer com tendência e probabilidade */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
          {/* Tendência */}
          <div className={cn('flex items-center gap-2', tendenciaCor)}>
            <TendenciaIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {tendencia === 'subindo' && `+${variacao.toFixed(1)}pp`}
              {tendencia === 'caindo' && `${variacao.toFixed(1)}pp`}
              {tendencia === 'estavel' && 'Estável'}
            </span>
            <span className="text-xs text-muted-foreground">vs semana anterior</span>
          </div>

          {/* Probabilidade de Vitória */}
          {probabilidadeVitoria !== undefined && (
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">Prob. vitória</div>
              <div
                className={cn(
                  'px-2.5 py-1 rounded-lg text-sm font-semibold',
                  probabilidadeVitoria >= 70
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : probabilidadeVitoria >= 50
                    ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {probabilidadeVitoria}%
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
