/**
 * Módulo de Análise Estatística
 * Pesquisa Eleitoral DF 2026
 */

export {
  // Estatísticas descritivas
  media,
  mediana,
  moda,
  variancia,
  desvioPadrao,
  quartis,
  iqr,

  // Correlações
  correlacaoPearson,
  correlacaoSpearman,
  matrizCorrelacao,

  // Frequências
  tabelaFrequencia,
  frequenciaRelativa,
  histograma,

  // Testes
  chiQuadrado,
  tabelaContingencia,

  // Sentimento
  analisarSentimento,
  analisarSentimentoAgregado,

  // Agregações
  agruparEContar,
  agruparEMedia,
  crossTab,
} from './statistics';
