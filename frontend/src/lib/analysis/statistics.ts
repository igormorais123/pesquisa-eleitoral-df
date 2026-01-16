/**
 * Biblioteca de Análise Estatística
 * Pesquisa Eleitoral DF 2026
 */

// ============================================
// ESTATÍSTICAS DESCRITIVAS
// ============================================

/**
 * Calcular média
 */
export function media(valores: number[]): number {
  if (valores.length === 0) return 0;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

/**
 * Calcular mediana
 */
export function mediana(valores: number[]): number {
  if (valores.length === 0) return 0;

  const ordenados = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(ordenados.length / 2);

  if (ordenados.length % 2 === 0) {
    return (ordenados[meio - 1] + ordenados[meio]) / 2;
  }

  return ordenados[meio];
}

/**
 * Calcular moda
 */
export function moda<T>(valores: T[]): T | null {
  if (valores.length === 0) return null;

  const frequencia: Map<T, number> = new Map();
  let maxFreq = 0;
  let valorModa: T | null = null;

  for (const valor of valores) {
    const freq = (frequencia.get(valor) || 0) + 1;
    frequencia.set(valor, freq);

    if (freq > maxFreq) {
      maxFreq = freq;
      valorModa = valor;
    }
  }

  return valorModa;
}

/**
 * Calcular variância
 */
export function variancia(valores: number[]): number {
  if (valores.length === 0) return 0;

  const med = media(valores);
  const somaQuadrados = valores.reduce((acc, val) => acc + Math.pow(val - med, 2), 0);

  return somaQuadrados / valores.length;
}

/**
 * Calcular desvio padrão
 */
export function desvioPadrao(valores: number[]): number {
  return Math.sqrt(variancia(valores));
}

/**
 * Calcular quartis (Q1, Q2, Q3)
 */
export function quartis(valores: number[]): { q1: number; q2: number; q3: number } {
  if (valores.length === 0) return { q1: 0, q2: 0, q3: 0 };

  const ordenados = [...valores].sort((a, b) => a - b);
  const n = ordenados.length;

  const q1Index = Math.floor(n * 0.25);
  const q2Index = Math.floor(n * 0.5);
  const q3Index = Math.floor(n * 0.75);

  return {
    q1: ordenados[q1Index],
    q2: ordenados[q2Index],
    q3: ordenados[q3Index],
  };
}

/**
 * Calcular intervalo interquartil (IQR)
 */
export function iqr(valores: number[]): number {
  const q = quartis(valores);
  return q.q3 - q.q1;
}

// ============================================
// CORRELAÇÕES
// ============================================

/**
 * Correlação de Pearson
 */
export function correlacaoPearson(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0 || n !== y.length) return 0;

  const mediaX = media(x);
  const mediaY = media(y);

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

/**
 * Correlação de Spearman (baseada em ranks)
 */
export function correlacaoSpearman(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0 || n !== y.length) return 0;

  // Calcular ranks
  const rankX = calcularRanks(x);
  const rankY = calcularRanks(y);

  // Usar Pearson nos ranks
  return correlacaoPearson(rankX, rankY);
}

function calcularRanks(valores: number[]): number[] {
  const indexados = valores.map((val, idx) => ({ val, idx }));
  indexados.sort((a, b) => a.val - b.val);

  const ranks = new Array(valores.length);
  for (let i = 0; i < indexados.length; i++) {
    ranks[indexados[i].idx] = i + 1;
  }

  return ranks;
}

/**
 * Matriz de correlação
 */
export function matrizCorrelacao(variaveis: number[][]): number[][] {
  const n = variaveis.length;
  const matriz: number[][] = [];

  for (let i = 0; i < n; i++) {
    const linha: number[] = [];
    for (let j = 0; j < n; j++) {
      linha.push(correlacaoPearson(variaveis[i], variaveis[j]));
    }
    matriz.push(linha);
  }

  return matriz;
}

// ============================================
// DISTRIBUIÇÃO DE FREQUÊNCIA
// ============================================

/**
 * Tabela de frequência
 */
export function tabelaFrequencia<T>(valores: T[]): Map<T, number> {
  const frequencia: Map<T, number> = new Map();

  for (const valor of valores) {
    frequencia.set(valor, (frequencia.get(valor) || 0) + 1);
  }

  return frequencia;
}

/**
 * Frequência relativa (percentual)
 */
export function frequenciaRelativa<T>(valores: T[]): Map<T, number> {
  const freq = tabelaFrequencia(valores);
  const total = valores.length;

  const relativa: Map<T, number> = new Map();

  freq.forEach((count, key) => {
    relativa.set(key, (count / total) * 100);
  });

  return relativa;
}

/**
 * Histograma (para valores numéricos)
 */
export function histograma(
  valores: number[],
  numBins: number = 10
): { min: number; max: number; count: number }[] {
  if (valores.length === 0) return [];

  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const binWidth = (max - min) / numBins;

  const bins: { min: number; max: number; count: number }[] = [];

  for (let i = 0; i < numBins; i++) {
    bins.push({
      min: min + i * binWidth,
      max: min + (i + 1) * binWidth,
      count: 0,
    });
  }

  for (const valor of valores) {
    const binIndex = Math.min(Math.floor((valor - min) / binWidth), numBins - 1);
    bins[binIndex].count++;
  }

  return bins;
}

// ============================================
// TESTES ESTATÍSTICOS SIMPLES
// ============================================

/**
 * Teste Chi-Quadrado de independência (simplificado)
 */
export function chiQuadrado(observado: number[][], esperado: number[][]): number {
  let chi2 = 0;

  for (let i = 0; i < observado.length; i++) {
    for (let j = 0; j < observado[i].length; j++) {
      if (esperado[i][j] > 0) {
        chi2 += Math.pow(observado[i][j] - esperado[i][j], 2) / esperado[i][j];
      }
    }
  }

  return chi2;
}

/**
 * Tabela de contingência
 */
export function tabelaContingencia<T, U>(
  valoresX: T[],
  valoresY: U[]
): { tabela: number[][]; labelsX: T[]; labelsY: U[] } {
  const labelsX = Array.from(new Set(valoresX));
  const labelsY = Array.from(new Set(valoresY));

  const tabela: number[][] = labelsX.map(() => labelsY.map(() => 0));

  for (let i = 0; i < valoresX.length; i++) {
    const idxX = labelsX.indexOf(valoresX[i]);
    const idxY = labelsY.indexOf(valoresY[i]);
    tabela[idxX][idxY]++;
  }

  return { tabela, labelsX, labelsY };
}

// ============================================
// ANÁLISE DE SENTIMENTO SIMPLES
// ============================================

const PALAVRAS_POSITIVAS = new Set([
  'bom', 'ótimo', 'excelente', 'positivo', 'favor', 'concordo', 'apoio',
  'melhor', 'feliz', 'satisfeito', 'confiança', 'esperança', 'progresso',
  'desenvolvimento', 'crescimento', 'sucesso', 'vitória', 'conquista',
]);

const PALAVRAS_NEGATIVAS = new Set([
  'ruim', 'péssimo', 'horrível', 'negativo', 'contra', 'discordo', 'rejeito',
  'pior', 'triste', 'insatisfeito', 'desconfiança', 'medo', 'crise',
  'problema', 'fracasso', 'derrota', 'perda', 'corrupção', 'violência',
]);

/**
 * Análise de sentimento simples
 */
export function analisarSentimento(texto: string): {
  score: number;
  classificacao: 'positivo' | 'negativo' | 'neutro';
  positivas: number;
  negativas: number;
} {
  const palavras = texto
    .toLowerCase()
    .replace(/[^\w\sáàãâéêíóôõúç]/g, ' ')
    .split(/\s+/)
    .filter((p) => p.length > 2);

  let positivas = 0;
  let negativas = 0;

  for (const palavra of palavras) {
    const palavraNorm = palavra.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (PALAVRAS_POSITIVAS.has(palavraNorm) || PALAVRAS_POSITIVAS.has(palavra)) {
      positivas++;
    } else if (PALAVRAS_NEGATIVAS.has(palavraNorm) || PALAVRAS_NEGATIVAS.has(palavra)) {
      negativas++;
    }
  }

  const score = positivas - negativas;
  let classificacao: 'positivo' | 'negativo' | 'neutro' = 'neutro';

  if (score > 0) classificacao = 'positivo';
  else if (score < 0) classificacao = 'negativo';

  return { score, classificacao, positivas, negativas };
}

/**
 * Análise de sentimento agregada
 */
export function analisarSentimentoAgregado(textos: string[]): {
  totalPositivo: number;
  totalNegativo: number;
  totalNeutro: number;
  scoreMedia: number;
} {
  let totalPositivo = 0;
  let totalNegativo = 0;
  let totalNeutro = 0;
  let somaScores = 0;

  for (const texto of textos) {
    const resultado = analisarSentimento(texto);
    somaScores += resultado.score;

    if (resultado.classificacao === 'positivo') totalPositivo++;
    else if (resultado.classificacao === 'negativo') totalNegativo++;
    else totalNeutro++;
  }

  return {
    totalPositivo,
    totalNegativo,
    totalNeutro,
    scoreMedia: textos.length > 0 ? somaScores / textos.length : 0,
  };
}

// ============================================
// AGREGAÇÕES
// ============================================

/**
 * Agrupar por campo e contar
 */
export function agruparEContar<T, K extends keyof T>(
  items: T[],
  campo: K
): Record<string, number> {
  const resultado: Record<string, number> = {};

  for (const item of items) {
    const valor = String(item[campo]);
    resultado[valor] = (resultado[valor] || 0) + 1;
  }

  return resultado;
}

/**
 * Agrupar por campo e calcular média de outro campo
 */
export function agruparEMedia<T>(
  items: T[],
  campoGrupo: keyof T,
  campoValor: keyof T
): Record<string, number> {
  const grupos: Record<string, number[]> = {};

  for (const item of items) {
    const grupo = String(item[campoGrupo]);
    const valor = Number(item[campoValor]) || 0;

    if (!grupos[grupo]) grupos[grupo] = [];
    grupos[grupo].push(valor);
  }

  const resultado: Record<string, number> = {};
  for (const [grupo, valores] of Object.entries(grupos)) {
    resultado[grupo] = media(valores);
  }

  return resultado;
}

/**
 * Cross-tabulation (tabulação cruzada)
 */
export function crossTab<T>(
  items: T[],
  campo1: keyof T,
  campo2: keyof T
): { tabela: Record<string, Record<string, number>>; labels1: string[]; labels2: string[] } {
  const tabela: Record<string, Record<string, number>> = {};
  const labels1Set = new Set<string>();
  const labels2Set = new Set<string>();

  for (const item of items) {
    const val1 = String(item[campo1]);
    const val2 = String(item[campo2]);

    labels1Set.add(val1);
    labels2Set.add(val2);

    if (!tabela[val1]) tabela[val1] = {};
    tabela[val1][val2] = (tabela[val1][val2] || 0) + 1;
  }

  return {
    tabela,
    labels1: Array.from(labels1Set),
    labels2: Array.from(labels2Set),
  };
}
