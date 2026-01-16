'use client';

/**
 * Componente de Heatmap para Correlações
 * Pesquisa Eleitoral DF 2026
 */

import { useMemo } from 'react';
import type { Eleitor } from '@/types';

interface HeatmapProps {
  dados: number[][];
  labelsColunas: string[];
  labelsLinhas: string[];
  titulo?: string;
  altura?: number;
}

interface CorrelacaoHeatmapProps {
  eleitores: Eleitor[];
  altura?: number;
}

// Cores para o heatmap (de negativo para positivo)
function getCorrelacaoCor(valor: number): string {
  // Valor vai de -1 a 1
  if (valor >= 0.7) return '#22c55e';      // Verde forte
  if (valor >= 0.4) return '#86efac';      // Verde claro
  if (valor >= 0.1) return '#bbf7d0';      // Verde muito claro
  if (valor >= -0.1) return '#f3f4f6';     // Cinza neutro
  if (valor >= -0.4) return '#fecaca';     // Vermelho claro
  if (valor >= -0.7) return '#f87171';     // Vermelho médio
  return '#dc2626';                          // Vermelho forte
}

// Calcular correlação de Pearson
function calcularCorrelacao(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0 || n !== y.length) return 0;

  const mediaX = x.reduce((a, b) => a + b, 0) / n;
  const mediaY = y.reduce((a, b) => a + b, 0) / n;

  let numerador = 0;
  let denominadorX = 0;
  let denominadorY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - mediaX;
    const diffY = y[i] - mediaY;
    numerador += diffX * diffY;
    denominadorX += diffX * diffX;
    denominadorY += diffY * diffY;
  }

  const denominador = Math.sqrt(denominadorX * denominadorY);
  if (denominador === 0) return 0;

  return numerador / denominador;
}

// Componente base do Heatmap
export function Heatmap({
  dados,
  labelsColunas,
  labelsLinhas,
  titulo,
  altura = 400,
}: HeatmapProps) {
  const celularTamanho = Math.min(
    50,
    Math.floor((altura - 60) / labelsLinhas.length)
  );

  return (
    <div className="overflow-x-auto">
      {titulo && (
        <h4 className="text-sm font-medium text-muted-foreground mb-4">{titulo}</h4>
      )}

      <div className="inline-block">
        {/* Cabeçalho */}
        <div className="flex">
          <div style={{ width: 120 }} />
          {labelsColunas.map((label, i) => (
            <div
              key={i}
              style={{ width: celularTamanho }}
              className="text-center text-xs text-muted-foreground truncate px-1 -rotate-45 origin-left h-16 flex items-end justify-start"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Linhas */}
        {labelsLinhas.map((labelLinha, i) => (
          <div key={i} className="flex items-center">
            <div
              style={{ width: 120 }}
              className="text-xs text-muted-foreground truncate pr-2 text-right"
            >
              {labelLinha}
            </div>
            {dados[i]?.map((valor, j) => (
              <div
                key={j}
                style={{
                  width: celularTamanho,
                  height: celularTamanho,
                  backgroundColor: getCorrelacaoCor(valor),
                }}
                className="border border-secondary/50 flex items-center justify-center text-xs font-medium transition-all hover:scale-110 hover:z-10 cursor-default"
                title={`${labelLinha} x ${labelsColunas[j]}: ${valor.toFixed(2)}`}
              >
                <span className="text-secondary-foreground/80 text-[10px]">
                  {valor.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        ))}

        {/* Legenda */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc2626' }} />
            <span>-1</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f3f4f6' }} />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }} />
            <span>+1</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mapeamentos para converter atributos em valores numéricos
const MAPEAMENTOS_NUMERICOS = {
  orientacao_politica: {
    esquerda: 1,
    'centro-esquerda': 2,
    centro: 3,
    'centro-direita': 4,
    direita: 5,
  },
  posicao_bolsonaro: {
    critico_forte: 1,
    critico_moderado: 2,
    neutro: 3,
    apoiador_moderado: 4,
    apoiador_forte: 5,
  },
  interesse_politico: {
    baixo: 1,
    medio: 2,
    alto: 3,
  },
  cluster_socioeconomico: {
    G4_baixa: 1,
    G3_media_baixa: 2,
    G2_media_alta: 3,
    G1_alta: 4,
  },
  tolerancia_nuance: {
    baixa: 1,
    media: 2,
    alta: 3,
  },
};

// Componente de Heatmap de Correlações de Eleitores
export function CorrelacaoHeatmap({ eleitores, altura = 400 }: CorrelacaoHeatmapProps) {
  // Extrair valores numéricos dos eleitores
  const dadosCorrelacao = useMemo(() => {
    const atributos = [
      'idade',
      'orientacao_politica',
      'posicao_bolsonaro',
      'interesse_politico',
      'cluster_socioeconomico',
      'susceptibilidade_desinformacao',
    ];

    const labels = [
      'Idade',
      'Orientação',
      'Pos. Bolsonaro',
      'Interesse Pol.',
      'Classe Social',
      'Susc. Desinfo.',
    ];

    // Extrair vetores numéricos para cada atributo
    const vetores: Record<string, number[]> = {};

    atributos.forEach((attr) => {
      vetores[attr] = eleitores.map((e) => {
        const valor = e[attr as keyof Eleitor];

        if (typeof valor === 'number') {
          return valor;
        }

        if (typeof valor === 'string') {
          const mapeamento = MAPEAMENTOS_NUMERICOS[attr as keyof typeof MAPEAMENTOS_NUMERICOS];
          if (mapeamento) {
            return mapeamento[valor as keyof typeof mapeamento] ?? 0;
          }
        }

        return 0;
      });
    });

    // Calcular matriz de correlação
    const matriz: number[][] = [];

    atributos.forEach((attr1) => {
      const linha: number[] = [];
      atributos.forEach((attr2) => {
        const correlacao = calcularCorrelacao(vetores[attr1], vetores[attr2]);
        linha.push(correlacao);
      });
      matriz.push(linha);
    });

    return { matriz, labels };
  }, [eleitores]);

  return (
    <Heatmap
      dados={dadosCorrelacao.matriz}
      labelsColunas={dadosCorrelacao.labels}
      labelsLinhas={dadosCorrelacao.labels}
      altura={altura}
    />
  );
}

// Heatmap de Região x Orientação Política
export function RegiaoOrientacaoHeatmap({ eleitores, altura = 350 }: CorrelacaoHeatmapProps) {
  const dados = useMemo(() => {
    const regioes = Array.from(new Set(eleitores.map((e) => e.regiao_administrativa))).slice(0, 10);
    const orientacoes = ['esquerda', 'centro-esquerda', 'centro', 'centro-direita', 'direita'];
    const labelsOrientacoes = ['Esquerda', 'Centro-Esq.', 'Centro', 'Centro-Dir.', 'Direita'];

    const matriz: number[][] = [];

    regioes.forEach((regiao) => {
      const linha: number[] = [];
      const eleitoresRegiao = eleitores.filter((e) => e.regiao_administrativa === regiao);
      const totalRegiao = eleitoresRegiao.length;

      orientacoes.forEach((orientacao) => {
        const count = eleitoresRegiao.filter((e) => e.orientacao_politica === orientacao).length;
        // Normalizar entre 0 e 1
        linha.push(totalRegiao > 0 ? count / totalRegiao : 0);
      });

      matriz.push(linha);
    });

    return { matriz, regioes, labelsOrientacoes };
  }, [eleitores]);

  return (
    <Heatmap
      dados={dados.matriz}
      labelsColunas={dados.labelsOrientacoes}
      labelsLinhas={dados.regioes}
      altura={altura}
    />
  );
}

export default Heatmap;
