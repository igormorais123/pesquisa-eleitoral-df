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
  ExternalLink,
  Shield,
} from 'lucide-react';
import type { Eleitor } from '@/types';
import { calcularValidacaoEstatistica } from '@/services/validacao-estatistica';

interface ResumoValidacaoProps {
  eleitores: Eleitor[];
}

/**
 * Componente de anel de progresso circular
 */
function AnelProgresso({
  valor,
  tamanho = 80,
  espessura = 8,
}: {
  valor: number;
  tamanho?: number;
  espessura?: number;
}) {
  const raio = (tamanho - espessura) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const offset = circunferencia - (valor / 100) * circunferencia;

  const cor =
    valor >= 70 ? '#22c55e' : valor >= 50 ? '#eab308' : '#ef4444';

  return (
    <div className="relative" style={{ width: tamanho, height: tamanho }}>
      <svg
        className="transform -rotate-90"
        width={tamanho}
        height={tamanho}
      >
        {/* Background circle */}
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          fill="none"
          stroke="currentColor"
          strokeWidth={espessura}
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          fill="none"
          stroke={cor}
          strokeWidth={espessura}
          strokeDasharray={circunferencia}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold" style={{ color: cor }}>
          {valor.toFixed(0)}%
        </span>
        <span className="text-[8px] text-muted-foreground uppercase tracking-wide">
          Conformidade
        </span>
      </div>
    </div>
  );
}

/**
 * Mini barra de status das variáveis
 */
function BarraStatusVariaveis({
  otimas,
  boas,
  atencao,
  criticas,
  total,
}: {
  otimas: number;
  boas: number;
  atencao: number;
  criticas: number;
  total: number;
}) {
  const pctOtimas = (otimas / total) * 100;
  const pctBoas = (boas / total) * 100;
  const pctAtencao = (atencao / total) * 100;
  const pctCriticas = (criticas / total) * 100;

  return (
    <div className="w-full">
      <div className="h-2 rounded-full overflow-hidden flex bg-muted/20">
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: `${pctOtimas}%` }}
        />
        <div
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${pctBoas}%` }}
        />
        <div
          className="h-full bg-yellow-500 transition-all duration-500"
          style={{ width: `${pctAtencao}%` }}
        />
        <div
          className="h-full bg-red-500 transition-all duration-500"
          style={{ width: `${pctCriticas}%` }}
        />
      </div>
    </div>
  );
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

  const bgIndice =
    validacao.indiceConformidade >= 70
      ? 'from-green-500/10 to-transparent'
      : validacao.indiceConformidade >= 50
      ? 'from-yellow-500/10 to-transparent'
      : 'from-red-500/10 to-transparent';

  const statusGeral =
    validacao.indiceConformidade >= 70
      ? { texto: 'Excelente', cor: 'text-green-400', bg: 'bg-green-500/10' }
      : validacao.indiceConformidade >= 50
      ? { texto: 'Adequada', cor: 'text-yellow-400', bg: 'bg-yellow-500/10' }
      : { texto: 'Necessita Ajustes', cor: 'text-red-400', bg: 'bg-red-500/10' };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header com gradiente */}
      <div className={`bg-gradient-to-br ${bgIndice} p-4`}>
        <div className="flex items-start gap-4">
          {/* Anel de progresso */}
          <AnelProgresso valor={validacao.indiceConformidade} />

          {/* Informações */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">Validade Estatística</h3>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2">
              IBGE · CODEPLAN · DataSenado · Datafolha
            </p>
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusGeral.bg} ${statusGeral.cor}`}>
              <CheckCircle2 className="w-3 h-3" />
              {statusGeral.texto}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de progresso por status */}
      <div className="px-4 pt-3">
        <BarraStatusVariaveis
          otimas={validacao.variaveisOtimas}
          boas={validacao.variaveisBoas}
          atencao={validacao.variaveisAtencao}
          criticas={validacao.variaveisCriticas}
          total={validacao.totalVariaveis}
        />
        <div className="flex justify-between mt-1.5 text-[9px] text-muted-foreground">
          <span>{validacao.totalVariaveis} variáveis analisadas</span>
          <span>{validacao.variaveisOtimas + validacao.variaveisBoas} em conformidade</span>
        </div>
      </div>

      {/* Status por variável */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-1.5 rounded-lg bg-green-500/10">
            <span className="text-sm font-bold text-green-400">
              {validacao.variaveisOtimas}
            </span>
            <p className="text-[9px] text-muted-foreground">Ótimas</p>
          </div>
          <div className="text-center p-1.5 rounded-lg bg-blue-500/10">
            <span className="text-sm font-bold text-blue-400">
              {validacao.variaveisBoas}
            </span>
            <p className="text-[9px] text-muted-foreground">Boas</p>
          </div>
          <div className="text-center p-1.5 rounded-lg bg-yellow-500/10">
            <span className="text-sm font-bold text-yellow-400">
              {validacao.variaveisAtencao}
            </span>
            <p className="text-[9px] text-muted-foreground">Atenção</p>
          </div>
          <div className="text-center p-1.5 rounded-lg bg-red-500/10">
            <span className="text-sm font-bold text-red-400">
              {validacao.variaveisCriticas}
            </span>
            <p className="text-[9px] text-muted-foreground">Críticas</p>
          </div>
        </div>
      </div>

      {/* Principais vieses */}
      {validacao.principaisVieses.length > 0 && (
        <div className="px-4 pb-3">
          <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider">
            Principais divergências
          </p>
          <div className="space-y-1">
            {validacao.principaisVieses.slice(0, 3).map((vies) => (
              <Link
                key={`${vies.variavel}-${vies.categoria}`}
                href={`/eleitores/gerar?corrigir=${vies.variavel}&categoria=${vies.categoria}&quantidade=${vies.eleitoresParaCorrecao}`}
                className="flex items-center justify-between text-[11px] bg-muted/5 rounded px-2 py-1 hover:bg-muted/10 transition-colors"
              >
                <span className="text-muted-foreground truncate flex-1">
                  {vies.labelVariavel}: <span className="text-foreground">{vies.labelCategoria}</span>
                </span>
                <span
                  className={`flex items-center gap-0.5 font-semibold ml-2 ${
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
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Link para página completa */}
      <div className="px-4 pb-4">
        <Link
          href="/validacao"
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-medium"
        >
          Ver análise completa
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default ResumoValidacao;
