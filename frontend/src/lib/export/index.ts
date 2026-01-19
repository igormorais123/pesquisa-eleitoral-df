/**
 * Módulo de Exportação
 * Pesquisa Eleitoral DF 2026
 */

export {
  exportarEleitoresExcel,
  exportarResultadoExcel,
  exportarDadosCompletos,
} from './excel';

export { exportarEleitoresCSV } from './csv';

export {
  exportarResultadoPDF,
  exportarEleitoresPDF,
  exportarRelatorioInteligenciaPDF,
} from './pdf';

export {
  exportarEleitorMD,
  exportarEleitoresMD,
  exportarResultadoMD,
  exportarInsightsMD,
  exportarCandidatoMD,
  exportarCandidatosMD,
  exportarGraficosMD,
  gerarMarkdownEleitor,
  gerarMarkdownEleitores,
  gerarMarkdownResultado,
  gerarMarkdownInsights,
  gerarMarkdownCandidato,
  gerarMarkdownCandidatos,
  gerarMarkdownGrafico,
} from './markdown';
