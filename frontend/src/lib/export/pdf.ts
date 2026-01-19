/**
 * Funções de Exportação para PDF
 * Pesquisa Eleitoral DF 2026
 *
 * IMPORTANTE: Essas funções devem ser executadas apenas no client-side
 * pois usam jsPDF que depende do objeto window/document
 */

import type { Eleitor } from '@/types';
import type { SessaoEntrevista } from '@/lib/db/dexie';

// Importar dinamicamente para evitar erros de SSR
async function getJsPDF() {
  if (typeof window === 'undefined') {
    throw new Error('PDF export can only be used in the browser');
  }
  const jsPDF = (await import('jspdf')).default;
  const autoTable = (await import('jspdf-autotable')).default;
  return { jsPDF, autoTable };
}

// Cores do tema
const CORES = {
  primary: [99, 102, 241],      // Indigo
  secondary: [31, 41, 55],      // Gray-800
  success: [34, 197, 94],       // Green
  warning: [234, 179, 8],       // Yellow
  danger: [239, 68, 68],        // Red
  text: [255, 255, 255],        // White
  textMuted: [156, 163, 175],   // Gray-400
};

/**
 * Gera PDF com relatório de resultado da pesquisa
 */
export async function exportarResultadoPDF(
  sessao: SessaoEntrevista,
  relatorio?: unknown,
  nomeArquivo?: string
): Promise<void> {
  const { jsPDF, autoTable } = await getJsPDF();
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let y = 20;

  // === CAPA ===
  // Fundo escuro no topo
  doc.setFillColor(31, 41, 55);
  doc.rect(0, 0, pageWidth, 60, 'F');

  // Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Pesquisa Eleitoral', pageWidth / 2, 30, { align: 'center' });

  // Subtítulo
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(sessao.titulo || 'Pesquisa Eleitoral DF 2026', pageWidth / 2, 42, { align: 'center' });

  // Data
  doc.setFontSize(10);
  doc.setTextColor(156, 163, 175);
  const dataFormatada = new Date(sessao.finalizadaEm || sessao.iniciadaEm).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Gerado em: ${dataFormatada}`, pageWidth / 2, 52, { align: 'center' });

  y = 80;

  // === RESUMO EXECUTIVO ===
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Executivo', 20, y);
  y += 10;

  // Box de resumo
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(20, y, pageWidth - 40, 50, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);

  const resumoTexto = [
    `Total de Respondentes: ${sessao.respostas.length} de ${sessao.totalAgentes} planejados`,
    `Taxa de Conclusão: ${Math.round((sessao.respostas.length / sessao.totalAgentes) * 100)}%`,
    `Custo Total: R$ ${sessao.custoAtual.toFixed(2)}`,
    `Tokens Utilizados: ${(sessao.tokensInput + sessao.tokensOutput).toLocaleString('pt-BR')}`,
  ];

  resumoTexto.forEach((texto, i) => {
    doc.text(texto, 30, y + 10 + i * 10);
  });

  y += 60;

  // === MÉTRICAS EM CARDS ===
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Métricas da Pesquisa', 20, y);
  y += 10;

  // Grid de cards
  const cardWidth = (pageWidth - 60) / 3;
  const cards = [
    { label: 'Respondentes', valor: sessao.respostas.length.toString(), cor: CORES.primary },
    { label: 'Custo (R$)', valor: sessao.custoAtual.toFixed(2), cor: CORES.warning },
    { label: 'Tokens', valor: ((sessao.tokensInput + sessao.tokensOutput) / 1000).toFixed(1) + 'K', cor: CORES.success },
  ];

  cards.forEach((card, i) => {
    const x = 20 + i * (cardWidth + 10);

    // Borda colorida
    doc.setFillColor(card.cor[0], card.cor[1], card.cor[2]);
    doc.roundedRect(x, y, cardWidth, 35, 3, 3, 'F');

    // Conteúdo interno
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x + 2, y + 2, cardWidth - 4, 31, 2, 2, 'F');

    // Texto
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(card.label, x + cardWidth / 2, y + 12, { align: 'center' });

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(card.valor, x + cardWidth / 2, y + 27, { align: 'center' });
    doc.setFont('helvetica', 'normal');
  });

  y += 50;

  // === TABELA DE RESPOSTAS ===
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Respostas Coletadas', 20, y);
  y += 5;

  // Preparar dados da tabela
  const tabelaDados = sessao.respostas.slice(0, 20).map((r) => [
    r.eleitor_nome.substring(0, 25),
    r.respostas.length.toString(),
    r.tokens_usados.toString(),
    `R$ ${r.custo.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Eleitor', 'Respostas', 'Tokens', 'Custo']],
    body: tabelaDados,
    theme: 'striped',
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });

  // Se houver mais de 20 respostas, adicionar nota
  if (sessao.respostas.length > 20) {
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(`* Mostrando 20 de ${sessao.respostas.length} respostas. Exporte para Excel para ver todas.`, 20, finalY + 10);
  }

  // === RODAPÉ ===
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Pesquisa Eleitoral DF 2026 - Página ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Salvar
  const dataAtual = new Date().toISOString().split('T')[0];
  const arquivo = nomeArquivo || `relatorio-pesquisa-${sessao.id}-${dataAtual}.pdf`;
  doc.save(arquivo);
}

/**
 * Gera PDF com lista de eleitores
 */
export async function exportarEleitoresPDF(eleitores: Eleitor[], nomeArquivo?: string): Promise<void> {
  const { jsPDF, autoTable } = await getJsPDF();
  const doc = new jsPDF('landscape');
  const pageWidth = doc.internal.pageSize.width;
  let y = 20;

  // Título
  doc.setFillColor(31, 41, 55);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Lista de Eleitores Sintéticos', pageWidth / 2, 25, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total: ${eleitores.length} eleitores`, pageWidth / 2, 35, { align: 'center' });

  y = 50;

  // Tabela de eleitores
  const tabelaDados = eleitores.map((e) => [
    e.nome.substring(0, 30),
    e.idade.toString(),
    e.genero.substring(0, 1).toUpperCase(),
    e.regiao_administrativa.substring(0, 15),
    e.orientacao_politica.substring(0, 12),
    e.religiao.substring(0, 12),
    e.interesse_politico,
    `${e.susceptibilidade_desinformacao}/10`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Nome', 'Idade', 'Gên.', 'Região', 'Orientação', 'Religião', 'Interesse', 'Susc.']],
    body: tabelaDados,
    theme: 'grid',
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    margin: { left: 10, right: 10 },
  });

  // Rodapé
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Pesquisa Eleitoral DF 2026 - Página ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Salvar
  const dataAtual = new Date().toISOString().split('T')[0];
  const arquivo = nomeArquivo || `eleitores-df-${dataAtual}.pdf`;
  doc.save(arquivo);
}

/**
 * Gera PDF do relatório de inteligência política
 */
export async function exportarRelatorioInteligenciaPDF(
  sessao: SessaoEntrevista,
  relatorio: {
    sumarioExecutivo: {
      conclusaoPrincipal: string;
      nivelAlerta: string;
    };
    analiseEstrategica: {
      panoramaGeral: string;
      fortalezas: string[];
      vulnerabilidades: string[];
      oportunidades: string[];
      ameacas: string[];
    };
    votoSilencioso: {
      estimativaPercentual: number;
      perfilTipico: string;
    };
    pontosRuptura: Array<{
      grupo: string;
      eventoGatilho: string;
      probabilidadeMudanca: number;
    }>;
    recomendacoesEstrategicas: {
      curtoPrazo: string[];
      medioPrazo: string[];
      mensagensChave: string[];
      temasEvitar: string[];
    };
    conclusaoAnalitica: string;
  },
  nomeArquivo?: string
): Promise<void> {
  const { jsPDF } = await getJsPDF();
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let y = 20;

  // === CAPA ===
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, 80, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de', pageWidth / 2, 35, { align: 'center' });
  doc.text('Inteligência Política', pageWidth / 2, 50, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(sessao.titulo, pageWidth / 2, 68, { align: 'center' });

  y = 100;

  // === SUMÁRIO EXECUTIVO ===
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Sumário Executivo', 20, y);
  y += 15;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);

  const linhasSumario = doc.splitTextToSize(relatorio.sumarioExecutivo.conclusaoPrincipal, pageWidth - 40);
  doc.text(linhasSumario, 20, y);
  y += linhasSumario.length * 5 + 15;

  // === SWOT ===
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Análise Estratégica (SWOT)', 20, y);
  y += 10;

  // Fortalezas
  doc.setFillColor(34, 197, 94);
  doc.roundedRect(20, y, 80, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Fortalezas', 25, y + 6);
  y += 12;

  doc.setTextColor(75, 85, 99);
  doc.setFontSize(9);
  relatorio.analiseEstrategica.fortalezas.slice(0, 3).forEach((f) => {
    doc.text(`• ${f.substring(0, 70)}`, 25, y);
    y += 5;
  });
  y += 5;

  // Vulnerabilidades
  doc.setFillColor(239, 68, 68);
  doc.roundedRect(20, y, 80, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Vulnerabilidades', 25, y + 6);
  y += 12;

  doc.setTextColor(75, 85, 99);
  doc.setFontSize(9);
  relatorio.analiseEstrategica.vulnerabilidades.slice(0, 3).forEach((v) => {
    doc.text(`• ${v.substring(0, 70)}`, 25, y);
    y += 5;
  });
  y += 10;

  // === VOTO SILENCIOSO ===
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Voto Silencioso', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(`Estimativa: ~${relatorio.votoSilencioso.estimativaPercentual}% do eleitorado`, 25, y);
  y += 8;

  const linhasVoto = doc.splitTextToSize(relatorio.votoSilencioso.perfilTipico, pageWidth - 50);
  doc.text(linhasVoto, 25, y);
  y += linhasVoto.length * 5 + 10;

  // === PONTOS DE RUPTURA ===
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setTextColor(31, 41, 55);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Pontos de Ruptura', 20, y);
  y += 10;

  relatorio.pontosRuptura.slice(0, 3).forEach((ponto) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 85, 99);
    doc.text(`${ponto.grupo} (${ponto.probabilidadeMudanca}% chance)`, 25, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Gatilho: ${ponto.eventoGatilho.substring(0, 80)}`, 30, y);
    y += 8;
  });

  // === RECOMENDAÇÕES ===
  y += 5;
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Recomendações Estratégicas', 20, y);
  y += 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);

  doc.setFont('helvetica', 'bold');
  doc.text('Curto Prazo:', 25, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  relatorio.recomendacoesEstrategicas.curtoPrazo.slice(0, 2).forEach((r) => {
    doc.text(`• ${r.substring(0, 75)}`, 30, y);
    y += 5;
  });
  y += 3;

  doc.setFont('helvetica', 'bold');
  doc.text('Mensagens-Chave:', 25, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  relatorio.recomendacoesEstrategicas.mensagensChave.slice(0, 2).forEach((m) => {
    doc.text(`"${m.substring(0, 70)}"`, 30, y);
    y += 5;
  });

  // === CONCLUSÃO ===
  if (y > 250) {
    doc.addPage();
    y = 20;
  } else {
    y += 10;
  }

  doc.setTextColor(31, 41, 55);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Conclusão Analítica', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  const linhasConclusao = doc.splitTextToSize(relatorio.conclusaoAnalitica, pageWidth - 40);
  doc.text(linhasConclusao, 20, y);

  // === RODAPÉ ===
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Relatório de Inteligência - Pesquisa Eleitoral DF 2026 - Página ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Salvar
  const dataAtual = new Date().toISOString().split('T')[0];
  const arquivo = nomeArquivo || `relatorio-inteligencia-${sessao.id}-${dataAtual}.pdf`;
  doc.save(arquivo);
}
