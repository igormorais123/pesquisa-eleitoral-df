'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import {
  PESQUISAS_2026,
  CORES_CANDIDATOS,
  calcularMediaPonderada,
  calcularTendencia,
  calcularIntervaloConfianca,
  calcularProbabilidadeVitoria,
} from '@/data/pesquisas-eleitorais-2026';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PrevisaoModeloProps {
  turno: '1turno' | '2turno';
}

export function PrevisaoModelo({ turno }: PrevisaoModeloProps) {
  const previsoes = useMemo(() => {
    const candidatos = [
      'Lula',
      'Flávio Bolsonaro',
      'Tarcísio de Freitas',
      'Ratinho Junior',
      'Ronaldo Caiado',
      'Romeu Zema',
    ];

    // Ordenar pesquisas por data (mais recentes primeiro)
    const pesquisasOrdenadas = [...PESQUISAS_2026].sort(
      (a, b) => new Date(b.publicacao).getTime() - new Date(a.publicacao).getTime()
    );

    // Usar apenas as 3 pesquisas mais recentes para a previsão
    const pesquisasRecentes = pesquisasOrdenadas.slice(0, 3);

    return candidatos
      .map((candidato) => {
        const media = calcularMediaPonderada(pesquisasRecentes, candidato);
        if (media === 0) return null;

        const intervalo = calcularIntervaloConfianca(media, pesquisasRecentes);
        const tendencia = calcularTendencia(PESQUISAS_2026, candidato);

        // Encontrar segundo colocado para calcular probabilidade
        const mediasCandidatos = candidatos.map((c) => ({
          candidato: c,
          media: calcularMediaPonderada(pesquisasRecentes, c),
        }));
        const ordenados = mediasCandidatos.sort((a, b) => b.media - a.media);
        const posicao = ordenados.findIndex((c) => c.candidato === candidato) + 1;

        let probVitoria = 0;
        if (posicao === 1) {
          const segundo = ordenados[1]?.media || 0;
          probVitoria = calcularProbabilidadeVitoria(media, 2, media - segundo);
        } else {
          const primeiro = ordenados[0]?.media || 0;
          probVitoria = calcularProbabilidadeVitoria(media, 2, media - primeiro);
        }

        return {
          candidato,
          media: Math.round(media * 10) / 10,
          intervalo,
          tendencia,
          posicao,
          probVitoria,
          cor: CORES_CANDIDATOS[candidato],
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b?.media || 0) - (a?.media || 0)) as NonNullable<
      ReturnType<typeof calcularMediaPonderada> & {
        candidato: string;
        media: number;
        intervalo: { inferior: number; superior: number };
        tendencia: { inclinacao: number; direcao: 'subindo' | 'estavel' | 'caindo' };
        posicao: number;
        probVitoria: number;
        cor: string;
      }
    >[];
  }, []);

  const totalEntrevistados = PESQUISAS_2026.slice(0, 3).reduce(
    (acc, p) => acc + p.entrevistados,
    0
  );

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header do Modelo */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-violet-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                Modelo de Previsão
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Agregação ponderada das 3 pesquisas mais recentes, usando o tamanho
                      amostral como peso. Inclui regressão linear para tendência.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </h3>
              <p className="text-sm text-muted-foreground">
                Baseado em {totalEntrevistados.toLocaleString('pt-BR')} entrevistas
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-muted-foreground">Última atualização</div>
            <div className="text-sm font-medium text-foreground">
              {new Date().toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>

        {/* Previsões */}
        <div className="grid gap-4">
          {previsoes.map((p, index) => (
            <motion.div
              key={p.candidato}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'relative p-5 rounded-2xl border transition-all',
                index === 0
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-border/50 bg-card hover:border-border'
              )}
            >
              {/* Badge de posição */}
              {index === 0 && (
                <div className="absolute -top-2 -right-2 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Líder
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Posição */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                    style={{
                      backgroundColor: `${p.cor}15`,
                      color: p.cor,
                    }}
                  >
                    {p.posicao}
                  </div>

                  {/* Nome */}
                  <div>
                    <div className="font-semibold text-foreground">{p.candidato}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div
                        className={cn(
                          'flex items-center gap-1 text-xs',
                          p.tendencia.direcao === 'subindo'
                            ? 'text-emerald-500'
                            : p.tendencia.direcao === 'caindo'
                            ? 'text-red-500'
                            : 'text-muted-foreground'
                        )}
                      >
                        <TrendingUp
                          className={cn(
                            'w-3 h-3',
                            p.tendencia.direcao === 'caindo' && 'rotate-180'
                          )}
                        />
                        {p.tendencia.direcao === 'subindo' && 'Em alta'}
                        {p.tendencia.direcao === 'caindo' && 'Em queda'}
                        {p.tendencia.direcao === 'estavel' && 'Estável'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Métricas */}
                <div className="flex items-center gap-8">
                  {/* Intervalo de Confiança Visual */}
                  <div className="hidden md:block w-40">
                    <div className="relative h-2 bg-muted rounded-full">
                      <div
                        className="absolute h-full rounded-full opacity-50"
                        style={{
                          left: `${p.intervalo.inferior}%`,
                          width: `${p.intervalo.superior - p.intervalo.inferior}%`,
                          backgroundColor: p.cor,
                        }}
                      />
                      <div
                        className="absolute w-2 h-2 rounded-full -translate-x-1/2 top-0"
                        style={{
                          left: `${p.media}%`,
                          backgroundColor: p.cor,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>{p.intervalo.inferior.toFixed(1)}%</span>
                      <span>{p.intervalo.superior.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Probabilidade */}
                  <Tooltip>
                    <TooltipTrigger>
                      <div
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-sm font-semibold',
                          p.probVitoria >= 70
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : p.probVitoria >= 40
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {p.probVitoria}%
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      Probabilidade de vitória no 1º turno
                    </TooltipContent>
                  </Tooltip>

                  {/* Percentual */}
                  <div className="text-right min-w-[60px]">
                    <div className="text-2xl font-bold text-foreground number">
                      {p.media.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <strong className="text-foreground">Nota metodológica:</strong> As probabilidades
            são calculadas usando um modelo estatístico simplificado baseado na agregação de
            pesquisas. Não são previsões definitivas e devem ser interpretadas com cautela.
            Pesquisas eleitorais capturam um retrato do momento, não uma previsão do resultado.
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
