/**
 * SERVIÇO DE MÉTRICAS ESTATÍSTICAS ACADÊMICAS
 *
 * Cálculos estatísticos para validação científica da amostra de eleitores.
 * Baseado em métodos de amostragem e inferência estatística.
 */

// ============================================
// TIPOS
// ============================================

export interface MetricasAmostra {
  // Tamanho da amostra
  n: number;

  // Margem de erro (para proporções)
  margemErro: number;
  margemErroPontos: number; // Em pontos percentuais

  // Nível de confiança
  nivelConfianca: number; // 95% = 0.95
  valorZ: number; // 1.96 para 95%

  // Erro amostral máximo
  erroAmostralMaximo: number;

  // Intervalo de confiança para proporção 50%
  intervaloConfianca: {
    inferior: number;
    superior: number;
  };

  // Poder estatístico (para detectar diferença de 5%)
  poderEstatistico: number;

  // Tamanho de efeito mínimo detectável
  tamanhoEfeitoMinimo: number;

  // População do DF para referência
  populacaoDF: number;
  populacaoEleitoresDF: number;

  // Fração amostral
  fracaoAmostral: number;

  // Fator de correção para população finita
  fatorCorrecaoPopFinita: number;
}

export interface TesteQuiQuadrado {
  estatisticaQui2: number;
  grausLiberdade: number;
  pValor: number;
  significativo: boolean; // p < 0.05
  interpretacao: string;
  vCramer: number; // Tamanho do efeito
}

export interface AnaliseDistribuicao {
  variavel: string;
  testeQui2: TesteQuiQuadrado;
  coeficienteContingencia: number;
  indiceAjuste: number; // Goodness of fit 0-100
}

export interface MetricasCompletas {
  amostra: MetricasAmostra;
  testesDistribuicao: AnaliseDistribuicao[];
  resumoGeral: {
    variaveisSignificativas: number;
    variaveisNaoSignificativas: number;
    ajusteGeralMedio: number;
    qualidadeAmostra: 'excelente' | 'boa' | 'regular' | 'insuficiente';
  };
}

// ============================================
// CONSTANTES ESTATÍSTICAS
// ============================================

// Valores críticos de Z para diferentes níveis de confiança
const VALORES_Z = {
  0.90: 1.645,
  0.95: 1.96,
  0.99: 2.576,
};

// População do DF (Censo 2022)
const POPULACAO_DF = 2817381;
const POPULACAO_ELEITORES_DF = 2155049; // TSE 2024

// Tabela de distribuição qui-quadrado (valores críticos para p=0.05)
const QUI2_CRITICO: Record<number, number> = {
  1: 3.841,
  2: 5.991,
  3: 7.815,
  4: 9.488,
  5: 11.070,
  6: 12.592,
  7: 14.067,
  8: 15.507,
  9: 16.919,
  10: 18.307,
  15: 24.996,
  20: 31.410,
  25: 37.652,
  30: 43.773,
};

// ============================================
// FUNÇÕES DE CÁLCULO
// ============================================

/**
 * Calcula a margem de erro para uma proporção amostral
 * ME = z * sqrt(p*(1-p)/n)
 *
 * Para o pior caso (máxima variância), usa p = 0.5
 */
function calcularMargemErro(n: number, nivelConfianca: number = 0.95, p: number = 0.5): number {
  const z = VALORES_Z[nivelConfianca as keyof typeof VALORES_Z] || 1.96;
  const variancia = p * (1 - p);
  const margemErro = z * Math.sqrt(variancia / n);
  return margemErro;
}

/**
 * Calcula o fator de correção para população finita
 * FCP = sqrt((N-n)/(N-1))
 *
 * Usado quando a fração amostral é > 5%
 */
function calcularFatorCorrecaoPopFinita(n: number, N: number): number {
  if (n >= N) return 0;
  return Math.sqrt((N - n) / (N - 1));
}

/**
 * Calcula o poder estatístico (1 - beta)
 * Para detectar uma diferença d com nível de significância alpha
 *
 * Aproximação usando a fórmula de Cohen
 */
function calcularPoderEstatistico(n: number, d: number = 0.05, alpha: number = 0.05): number {
  const z_alpha = 1.96; // Para alpha = 0.05 (bicaudal)
  const sigma = 0.5; // Desvio padrão para proporção (pior caso)

  // Calcula o z para o poder
  const z_power = (d * Math.sqrt(n)) / sigma - z_alpha;

  // Converte para probabilidade usando aproximação da distribuição normal
  const poder = normalCDF(z_power);

  return Math.min(Math.max(poder, 0), 1);
}

/**
 * Função de distribuição acumulada da normal padrão (aproximação)
 */
function normalCDF(z: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  z = Math.abs(z) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * z);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Calcula a estatística qui-quadrado para comparar distribuições
 * χ² = Σ (O - E)² / E
 *
 * O = frequência observada (amostra)
 * E = frequência esperada (referência)
 */
function calcularQuiQuadrado(
  observado: Record<string, number>,
  esperado: Record<string, number>,
  totalObservado: number
): { qui2: number; gl: number } {
  let qui2 = 0;
  let categorias = 0;

  Object.keys(esperado).forEach((categoria) => {
    const obs = observado[categoria] || 0;
    const esp = (esperado[categoria] / 100) * totalObservado;

    if (esp > 0) {
      qui2 += Math.pow(obs - esp, 2) / esp;
      categorias++;
    }
  });

  // Graus de liberdade = número de categorias - 1
  const gl = Math.max(categorias - 1, 1);

  return { qui2, gl };
}

/**
 * Calcula o p-valor aproximado para o teste qui-quadrado
 * Usando aproximação de Wilson-Hilferty
 */
function calcularPValorQuiQuadrado(qui2: number, gl: number): number {
  if (qui2 <= 0) return 1;
  if (gl <= 0) return 1;

  // Aproximação usando a distribuição qui-quadrado
  // Para valores grandes de gl, usa aproximação normal
  if (gl > 30) {
    const z = Math.pow(qui2 / gl, 1/3) - (1 - 2 / (9 * gl));
    const z_norm = z / Math.sqrt(2 / (9 * gl));
    return 1 - normalCDF(z_norm);
  }

  // Para gl pequeno, usa interpolação da tabela
  const critico = QUI2_CRITICO[gl] || QUI2_CRITICO[Math.min(gl, 30)];

  // Aproximação simples: se qui2 > crítico, p < 0.05
  if (qui2 > critico * 2) return 0.001;
  if (qui2 > critico * 1.5) return 0.01;
  if (qui2 > critico) return 0.03;
  if (qui2 > critico * 0.8) return 0.1;
  if (qui2 > critico * 0.5) return 0.3;
  return 0.5;
}

/**
 * Calcula o V de Cramér (tamanho do efeito para qui-quadrado)
 * V = sqrt(χ² / (n * (k-1)))
 *
 * k = min(linhas, colunas) - para tabela de contingência
 * Para teste de aderência, k = número de categorias
 */
function calcularVCramer(qui2: number, n: number, k: number): number {
  if (n <= 0 || k <= 1) return 0;
  return Math.sqrt(qui2 / (n * (k - 1)));
}

/**
 * Calcula o coeficiente de contingência
 * C = sqrt(χ² / (χ² + n))
 */
function calcularCoeficienteContingencia(qui2: number, n: number): number {
  if (n <= 0) return 0;
  return Math.sqrt(qui2 / (qui2 + n));
}

/**
 * Calcula o tamanho de efeito mínimo detectável
 * Para um dado n e poder de 80%
 */
function calcularTamanhoEfeitoMinimo(n: number, poder: number = 0.8): number {
  const z_alpha = 1.96;
  const z_beta = 0.84; // Para poder de 80%

  // d = (z_alpha + z_beta) * sigma / sqrt(n)
  const sigma = 0.5; // Pior caso para proporções
  const d = (z_alpha + z_beta) * sigma / Math.sqrt(n);

  return d;
}

// ============================================
// FUNÇÕES PRINCIPAIS
// ============================================

/**
 * Calcula todas as métricas da amostra
 */
export function calcularMetricasAmostra(n: number): MetricasAmostra {
  const nivelConfianca = 0.95;
  const valorZ = VALORES_Z[nivelConfianca];

  // Margem de erro
  const margemErro = calcularMargemErro(n, nivelConfianca);
  const margemErroPontos = margemErro * 100;

  // Fator de correção para população finita
  const fracaoAmostral = n / POPULACAO_ELEITORES_DF;
  const fatorCorrecaoPopFinita = calcularFatorCorrecaoPopFinita(n, POPULACAO_ELEITORES_DF);

  // Margem de erro corrigida (se fração > 5%)
  const margemErroCorrigida = fracaoAmostral > 0.05
    ? margemErro * fatorCorrecaoPopFinita
    : margemErro;

  // Intervalo de confiança para p = 50% (pior caso)
  const intervaloConfianca = {
    inferior: Math.max(0, 0.5 - margemErroCorrigida) * 100,
    superior: Math.min(1, 0.5 + margemErroCorrigida) * 100,
  };

  // Poder estatístico para detectar diferença de 5%
  const poderEstatistico = calcularPoderEstatistico(n, 0.05);

  // Tamanho de efeito mínimo detectável
  const tamanhoEfeitoMinimo = calcularTamanhoEfeitoMinimo(n);

  // Erro amostral máximo
  const erroAmostralMaximo = margemErroPontos;

  return {
    n,
    margemErro: margemErroCorrigida,
    margemErroPontos: margemErroCorrigida * 100,
    nivelConfianca,
    valorZ,
    erroAmostralMaximo,
    intervaloConfianca,
    poderEstatistico,
    tamanhoEfeitoMinimo: tamanhoEfeitoMinimo * 100,
    populacaoDF: POPULACAO_DF,
    populacaoEleitoresDF: POPULACAO_ELEITORES_DF,
    fracaoAmostral,
    fatorCorrecaoPopFinita,
  };
}

/**
 * Realiza o teste qui-quadrado para uma variável
 */
export function realizarTesteQuiQuadrado(
  variavel: string,
  observado: Record<string, number>,
  esperado: Record<string, number>,
  totalObservado: number
): AnaliseDistribuicao {
  const { qui2, gl } = calcularQuiQuadrado(observado, esperado, totalObservado);
  const pValor = calcularPValorQuiQuadrado(qui2, gl);
  const numCategorias = Object.keys(esperado).length;
  const vCramer = calcularVCramer(qui2, totalObservado, numCategorias);
  const coefContingencia = calcularCoeficienteContingencia(qui2, totalObservado);

  // Determinar significância
  const significativo = pValor < 0.05;

  // Interpretação do V de Cramér
  let interpretacao = '';
  if (vCramer < 0.1) {
    interpretacao = 'Diferença desprezível - amostra representa bem a população';
  } else if (vCramer < 0.3) {
    interpretacao = 'Diferença pequena - amostra é aceitável';
  } else if (vCramer < 0.5) {
    interpretacao = 'Diferença moderada - considerar ajustes';
  } else {
    interpretacao = 'Diferença grande - amostra pode ter viés significativo';
  }

  // Índice de ajuste (inverso do V de Cramér, normalizado 0-100)
  const indiceAjuste = Math.max(0, (1 - vCramer) * 100);

  return {
    variavel,
    testeQui2: {
      estatisticaQui2: Number(qui2.toFixed(2)),
      grausLiberdade: gl,
      pValor: Number(pValor.toFixed(4)),
      significativo,
      interpretacao,
      vCramer: Number(vCramer.toFixed(3)),
    },
    coeficienteContingencia: Number(coefContingencia.toFixed(3)),
    indiceAjuste: Number(indiceAjuste.toFixed(1)),
  };
}

/**
 * Calcula todas as métricas completas
 */
export function calcularMetricasCompletas(
  n: number,
  distribuicoes: Array<{
    variavel: string;
    observado: Record<string, number>;
    esperado: Record<string, number>;
  }>
): MetricasCompletas {
  // Métricas da amostra
  const amostra = calcularMetricasAmostra(n);

  // Testes de distribuição para cada variável
  const testesDistribuicao = distribuicoes.map(({ variavel, observado, esperado }) =>
    realizarTesteQuiQuadrado(variavel, observado, esperado, n)
  );

  // Resumo geral
  const variaveisSignificativas = testesDistribuicao.filter((t) => t.testeQui2.significativo).length;
  const variaveisNaoSignificativas = testesDistribuicao.length - variaveisSignificativas;

  const ajusteGeralMedio =
    testesDistribuicao.length > 0
      ? testesDistribuicao.reduce((acc, t) => acc + t.indiceAjuste, 0) / testesDistribuicao.length
      : 100;

  // Qualidade da amostra baseada no ajuste médio
  let qualidadeAmostra: 'excelente' | 'boa' | 'regular' | 'insuficiente';
  if (ajusteGeralMedio >= 90) {
    qualidadeAmostra = 'excelente';
  } else if (ajusteGeralMedio >= 75) {
    qualidadeAmostra = 'boa';
  } else if (ajusteGeralMedio >= 60) {
    qualidadeAmostra = 'regular';
  } else {
    qualidadeAmostra = 'insuficiente';
  }

  return {
    amostra,
    testesDistribuicao,
    resumoGeral: {
      variaveisSignificativas,
      variaveisNaoSignificativas,
      ajusteGeralMedio: Number(ajusteGeralMedio.toFixed(1)),
      qualidadeAmostra,
    },
  };
}

/**
 * Formata o p-valor para exibição
 */
export function formatarPValor(p: number): string {
  if (p < 0.001) return '< 0.001';
  if (p < 0.01) return '< 0.01';
  if (p < 0.05) return '< 0.05';
  return p.toFixed(3);
}

/**
 * Interpreta o tamanho de efeito (V de Cramér)
 */
export function interpretarTamanhoEfeito(v: number): string {
  if (v < 0.1) return 'Negligenciável';
  if (v < 0.3) return 'Pequeno';
  if (v < 0.5) return 'Médio';
  return 'Grande';
}

/**
 * Retorna a cor baseada na qualidade
 */
export function corPorQualidade(qualidade: string): string {
  switch (qualidade) {
    case 'excelente':
      return 'text-green-500';
    case 'boa':
      return 'text-blue-500';
    case 'regular':
      return 'text-yellow-500';
    case 'insuficiente':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}
