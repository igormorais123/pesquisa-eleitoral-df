'use client';

import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IndicadorDivergenciaProps {
  diferenca: number;
  tamanho?: 'sm' | 'md';
  mostrarZero?: boolean;
}

/**
 * Componente compacto para mostrar a divergência de uma variável
 * em relação aos dados oficiais de referência.
 *
 * Verde com + = amostra acima da referência
 * Vermelho com - = amostra abaixo da referência
 * Cinza = igual (diferença ≤ 0.5%)
 */
export function IndicadorDivergencia({
  diferenca,
  tamanho = 'sm',
  mostrarZero = false,
}: IndicadorDivergenciaProps) {
  const isIgual = Math.abs(diferenca) <= 0.5;
  const isPositivo = diferenca > 0.5;

  if (isIgual && !mostrarZero) {
    return null;
  }

  const classes = {
    sm: 'text-xs px-1.5 py-0.5 gap-0.5',
    md: 'text-sm px-2 py-1 gap-1',
  };

  const iconeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  };

  if (isIgual) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded font-medium',
          'text-gray-400 bg-gray-500/10',
          classes[tamanho]
        )}
        title="Igual ao dado oficial (diferença ≤ 0,5%)"
      >
        <Minus className={iconeClasses[tamanho]} />
        <span>=</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded font-medium',
        isPositivo ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10',
        classes[tamanho]
      )}
      title={`Diferença de ${diferenca > 0 ? '+' : ''}${diferenca.toFixed(1)}% em relação ao dado oficial`}
    >
      {isPositivo ? (
        <ArrowUpRight className={iconeClasses[tamanho]} />
      ) : (
        <ArrowDownRight className={iconeClasses[tamanho]} />
      )}
      <span>{diferenca > 0 ? '+' : ''}{diferenca.toFixed(1)}%</span>
    </span>
  );
}

/**
 * Badge compacto para mostrar ao lado de estatísticas no dashboard
 */
export function BadgeDivergencia({
  diferenca,
  className,
}: {
  diferenca: number;
  className?: string;
}) {
  const isIgual = Math.abs(diferenca) <= 0.5;
  const isPositivo = diferenca > 0.5;

  if (isIgual) {
    return (
      <span
        className={cn('text-[10px] text-gray-500', className)}
        title="Conforme dado oficial"
      >
        ≈
      </span>
    );
  }

  return (
    <span
      className={cn(
        'text-[10px] font-medium',
        isPositivo ? 'text-green-400' : 'text-red-400',
        className
      )}
      title={`Diferença de ${diferenca > 0 ? '+' : ''}${diferenca.toFixed(1)}% vs dado oficial`}
    >
      {diferenca > 0 ? '+' : ''}{diferenca.toFixed(1)}%
    </span>
  );
}

export default IndicadorDivergencia;
