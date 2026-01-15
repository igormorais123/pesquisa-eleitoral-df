/**
 * HOOK DE DIVERGÊNCIAS ESTATÍSTICAS
 *
 * Calcula as divergências entre a amostra e os dados oficiais
 * para uso direto nos gráficos do dashboard.
 */

import { useMemo } from 'react';
import type { Eleitor } from '@/types';
import { mapaDadosReferencia } from '@/data/dados-referencia-oficiais';

export interface DivergenciaSimples {
  categoria: string;
  valorAmostra: number;
  valorReferencia: number;
  diferenca: number;
  fonte: string;
  ano: number;
  url: string;
}

export interface MapaDivergencias {
  [variavel: string]: {
    [categoria: string]: DivergenciaSimples;
  };
}

/**
 * Calcula a distribuição percentual de uma variável
 */
function calcularDistribuicao(
  eleitores: Eleitor[],
  campo: keyof Eleitor
): Record<string, number> {
  const total = eleitores.length;
  const contagem: Record<string, number> = {};

  eleitores.forEach((e) => {
    const valor = String(e[campo] || 'nao_informado');
    contagem[valor] = (contagem[valor] || 0) + 1;
  });

  const resultado: Record<string, number> = {};
  Object.entries(contagem).forEach(([key, count]) => {
    resultado[key] = (count / total) * 100;
  });

  return resultado;
}

/**
 * Calcula distribuição de faixas etárias
 */
function calcularFaixaEtaria(eleitores: Eleitor[]): Record<string, number> {
  const total = eleitores.length;
  const faixas = [
    { nome: '16-24', min: 16, max: 24 },
    { nome: '25-34', min: 25, max: 34 },
    { nome: '35-44', min: 35, max: 44 },
    { nome: '45-54', min: 45, max: 54 },
    { nome: '55-64', min: 55, max: 64 },
    { nome: '65+', min: 65, max: 200 },
  ];

  const resultado: Record<string, number> = {};
  faixas.forEach(({ nome, min, max }) => {
    const count = eleitores.filter((e) => e.idade >= min && e.idade <= max).length;
    resultado[nome] = (count / total) * 100;
  });

  return resultado;
}

/**
 * Hook que retorna o mapa de divergências para todas as variáveis
 */
export function useDivergencias(eleitores: Eleitor[]): MapaDivergencias {
  return useMemo(() => {
    const mapa: MapaDivergencias = {};

    // Lista de variáveis para calcular
    const variaveis: Array<{
      nome: string;
      campo?: keyof Eleitor;
      calculoCustom?: () => Record<string, number>;
    }> = [
      { nome: 'genero', campo: 'genero' },
      { nome: 'cor_raca', campo: 'cor_raca' },
      { nome: 'faixa_etaria', calculoCustom: () => calcularFaixaEtaria(eleitores) },
      { nome: 'cluster_socioeconomico', campo: 'cluster_socioeconomico' },
      { nome: 'escolaridade', campo: 'escolaridade' },
      { nome: 'ocupacao_vinculo', campo: 'ocupacao_vinculo' },
      { nome: 'renda_salarios_minimos', campo: 'renda_salarios_minimos' },
      { nome: 'religiao', campo: 'religiao' },
      { nome: 'estado_civil', campo: 'estado_civil' },
      { nome: 'orientacao_politica', campo: 'orientacao_politica' },
      { nome: 'interesse_politico', campo: 'interesse_politico' },
      { nome: 'posicao_bolsonaro', campo: 'posicao_bolsonaro' },
      { nome: 'estilo_decisao', campo: 'estilo_decisao' },
      { nome: 'tolerancia_nuance', campo: 'tolerancia_nuance' },
      { nome: 'meio_transporte', campo: 'meio_transporte' },
    ];

    variaveis.forEach(({ nome, campo, calculoCustom }) => {
      const dadoRef = mapaDadosReferencia[nome];
      if (!dadoRef) return;

      const distribuicaoAmostra = calculoCustom
        ? calculoCustom()
        : campo
        ? calcularDistribuicao(eleitores, campo)
        : {};

      mapa[nome] = {};

      Object.entries(dadoRef.valores).forEach(([categoria, valorRef]) => {
        const valorAmostra = distribuicaoAmostra[categoria] || 0;
        mapa[nome][categoria] = {
          categoria,
          valorAmostra: Number(valorAmostra.toFixed(1)),
          valorReferencia: valorRef,
          diferenca: Number((valorAmostra - valorRef).toFixed(1)),
          fonte: dadoRef.fonte,
          ano: dadoRef.ano,
          url: dadoRef.url,
        };
      });
    });

    return mapa;
  }, [eleitores]);
}

/**
 * Retorna a divergência para uma categoria específica
 */
export function getDivergencia(
  mapa: MapaDivergencias,
  variavel: string,
  categoria: string
): DivergenciaSimples | null {
  return mapa[variavel]?.[categoria] || null;
}

/**
 * Formata a divergência como texto com sinal
 */
export function formatarDivergenciaTexto(diferenca: number): string {
  if (Math.abs(diferenca) <= 0.5) return '≈';
  return `${diferenca > 0 ? '+' : ''}${diferenca.toFixed(1)}%`;
}

/**
 * Retorna a cor CSS baseada na divergência
 */
export function corDivergencia(diferenca: number): string {
  if (Math.abs(diferenca) <= 0.5) return '#6b7280'; // gray
  if (diferenca > 0) return '#22c55e'; // green
  return '#ef4444'; // red
}

export default useDivergencias;
