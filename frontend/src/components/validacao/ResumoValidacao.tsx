'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from 'lucide-react';
import type { Eleitor } from '@/types';
import { calcularValidacaoEstatistica } from '@/services/validacao-estatistica';

interface ResumoValidacaoProps {
  eleitores: Eleitor[];
}

/**
 * Componente de card de resumo de validação estatística
 * para exibir no dashboard inicial
 */
export function ResumoValidacao({ eleitores }: ResumoValidacaoProps) {
  const validacao = useMemo(
    () => calcularValidacaoEstatistica(eleitores),
    [eleitores]
  );

  const corIndice =
    validacao.indiceConformidade >= 70
      ? 'text-green-400'
      : validacao.indiceConformidade >= 50
      ? 'text-yellow-400'
      : 'text-red-400';

  const bgIndice =
    validacao.indiceConformidade >= 70
      ? 'from-green-500/20 to-green-500/5'
      : validacao.indiceConformidade >= 50
      ? 'from-yellow-500/20 to-yellow-500/5'
      : 'from-red-500/20 to-red-500/5';

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header com gradiente */}
      <div className={`bg-gradient-to-r ${bgIndice} p-4 border-b border-border`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Validação Estatística</h3>
              <p className="text-xs text-muted-foreground">
                Comparação com dados oficiais (IBGE, CODEPLAN)
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Índice de Conformidade</p>
            <p className={`text-2xl font-bold ${corIndice}`}>
              {validacao.indiceConformidade.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Status por variável */}
      <div className="p-4">
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center p-2 rounded-lg bg-green-500/10">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-lg font-bold text-green-400">
                {validacao.variaveisOtimas}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">Ótimas</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-blue-500/10">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span className="text-lg font-bold text-blue-400">
                {validacao.variaveisBoas}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">Boas</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-yellow-500/10">
            <div className="flex items-center justify-center gap-1">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-lg font-bold text-yellow-400">
                {validacao.variaveisAtencao}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">Atenção</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-500/10">
            <div className="flex items-center justify-center gap-1">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-lg font-bold text-red-400">
                {validacao.variaveisCriticas}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">Críticas</p>
          </div>
        </div>

        {/* Principais vieses */}
        {validacao.principaisVieses.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Principais divergências:</p>
            <div className="space-y-1.5">
              {validacao.principaisVieses.slice(0, 3).map((vies) => (
                <div
                  key={`${vies.variavel}-${vies.categoria}`}
                  className="flex items-center justify-between text-xs bg-muted/10 rounded px-2 py-1.5"
                >
                  <span className="text-muted-foreground">
                    {vies.labelVariavel}: {vies.labelCategoria}
                  </span>
                  <span
                    className={`flex items-center gap-1 font-medium ${
                      vies.direcao === 'acima' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {vies.direcao === 'acima' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {vies.diferenca > 0 ? '+' : ''}
                    {vies.diferenca.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Link para página completa */}
        <Link
          href="/validacao"
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
        >
          Ver análise completa
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default ResumoValidacao;
