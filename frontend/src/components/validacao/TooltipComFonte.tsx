'use client';

import { ExternalLink } from 'lucide-react';
import type { DadoReferencia } from '@/data/dados-referencia-oficiais';

interface TooltipComFonteProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  dadoReferencia?: DadoReferencia;
  campoCategoria?: string; // Campo original para mapear categoria
  categoriaMap?: Record<string, string>; // Mapa de label -> categoria original
}

/**
 * Formata a divergência como texto com sinal e cor
 */
function formatarDivergencia(diferenca: number): { texto: string; cor: string } {
  if (Math.abs(diferenca) < 0.5) {
    return { texto: '≈0%', cor: '#6b7280' };
  }
  const sinal = diferenca > 0 ? '+' : '';
  const cor = diferenca > 0 ? '#22c55e' : '#ef4444';
  return { texto: `${sinal}${diferenca.toFixed(1)}%`, cor };
}

/**
 * Tooltip customizado que mostra divergência e fonte oficial
 */
export function TooltipComFonte({
  active,
  payload,
  label,
  dadoReferencia,
  campoCategoria,
  categoriaMap,
}: TooltipComFonteProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const dados = payload[0]?.payload;
  const valor = dados?.valor || payload[0]?.value || 0;
  const percentual = dados?.percentual || ((valor / 400) * 100).toFixed(1);

  // Encontrar valor de referência
  let valorReferencia: number | null = null;
  let divergencia: { texto: string; cor: string } | null = null;

  if (dadoReferencia) {
    // Tentar encontrar a categoria correspondente
    const categoriaOriginal = categoriaMap?.[label || ''] || dados?.categoriaOriginal;

    if (categoriaOriginal && dadoReferencia.valores[categoriaOriginal] !== undefined) {
      valorReferencia = dadoReferencia.valores[categoriaOriginal];
      const diferenca = Number(percentual) - valorReferencia;
      divergencia = formatarDivergencia(diferenca);
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl min-w-[200px]">
      <p className="text-sm font-semibold text-white mb-2 border-b border-gray-700 pb-2">
        {label || dados?.nome}
      </p>

      {/* Valores da amostra */}
      <div className="space-y-1 mb-2">
        <p className="text-xs text-blue-400 flex justify-between">
          <span>Amostra:</span>
          <span className="font-bold">{valor} ({percentual}%)</span>
        </p>

        {/* Valor de referência */}
        {valorReferencia !== null && (
          <p className="text-xs text-gray-400 flex justify-between">
            <span>Referência:</span>
            <span className="font-bold">{valorReferencia.toFixed(1)}%</span>
          </p>
        )}

        {/* Divergência */}
        {divergencia && (
          <p className="text-xs flex justify-between mt-1 pt-1 border-t border-gray-700">
            <span className="text-gray-400">Divergência:</span>
            <span className="font-bold" style={{ color: divergencia.cor }}>
              {divergencia.texto}
            </span>
          </p>
        )}
      </div>

      {/* Fonte */}
      {dadoReferencia && (
        <div className="pt-2 border-t border-gray-700">
          <p className="text-[10px] text-gray-500 mb-1">
            Ref: {dadoReferencia.fonte} ({dadoReferencia.ano})
          </p>
          <a
            href={dadoReferencia.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-primary hover:underline flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            Ver fonte oficial <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      )}
    </div>
  );
}

/**
 * Componente de badge de divergência para exibir junto aos labels dos gráficos
 */
export function BadgeDivergenciaGrafico({
  valorAmostra,
  valorReferencia,
  tamanho = 'sm',
}: {
  valorAmostra: number;
  valorReferencia: number;
  tamanho?: 'xs' | 'sm' | 'md';
}) {
  const diferenca = valorAmostra - valorReferencia;
  const { texto, cor } = formatarDivergencia(diferenca);

  const tamanhos = {
    xs: 'text-[9px] px-1 py-0.5',
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
  };

  return (
    <span
      className={`rounded font-medium ${tamanhos[tamanho]}`}
      style={{
        color: cor,
        backgroundColor: `${cor}15`,
        border: `1px solid ${cor}30`,
      }}
    >
      {texto}
    </span>
  );
}

export default TooltipComFonte;
