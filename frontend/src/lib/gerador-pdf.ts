/**
 * GERADOR DE RELATÓRIO EXECUTIVO EM PDF
 *
 * Sistema para gerar relatórios visuais e profissionais
 * de pesquisas eleitorais em formato PDF.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================
// TIPOS
// ============================================

export interface DadosRelatorio {
  // Metadados
  titulo: string;
  subtitulo?: string;
  dataGeracao: Date;
  responsavel?: string;
  organizacao?: string;

  // Resumo executivo
  resumoExecutivo: {
    conclusaoPrincipal: string;
    pontoChave1: string;
    pontoChave2: string;
    pontoChave3: string;
    recomendacaoFinal?: string;
  };

  // Métricas principais
  metricas: {
    totalEntrevistas: number;
    margemErro: number;
    confianca: number;
    dataInicio: Date;
    dataFim: Date;
  };

  // Intenção de voto
  intencaoVoto: {
    candidato: string;
    percentual: number;
    variacao?: number;
    cor?: string;
  }[];

  // Análise por segmento
  analiseSegmentos?: {
    segmento: string;
    candidatoLider: string;
    percentual: number;
  }[];

  // KPIs
  kpis?: {
    nome: string;
    valor: number;
    unidade: string;
    status: 'bom' | 'atencao' | 'critico';
  }[];

  // Alertas
  alertas?: {
    nivel: 'critico' | 'alto' | 'medio' | 'baixo';
    titulo: string;
    descricao: string;
  }[];

  // Análise de discurso
  temasDiscurso?: {
    tema: string;
    frequencia: number;
    sentimento: 'positivo' | 'neutro' | 'negativo';
  }[];

  // Regiões
  analiseRegional?: {
    regiao: string;
    candidatoLider: string;
    percentual: number;
    variacao?: number;
  }[];

  // Conclusões e recomendações
  conclusoes?: string[];
  recomendacoes?: string[];
}

// ============================================
// CORES E ESTILOS
// ============================================

const CORES = {
  primaria: [37, 99, 235] as [number, number, number],        // Azul
  secundaria: [100, 116, 139] as [number, number, number],    // Cinza
  sucesso: [34, 197, 94] as [number, number, number],         // Verde
  atencao: [234, 179, 8] as [number, number, number],         // Amarelo
  perigo: [239, 68, 68] as [number, number, number],          // Vermelho
  texto: [30, 41, 59] as [number, number, number],            // Escuro
  textoClaro: [100, 116, 139] as [number, number, number],    // Cinza
  fundo: [248, 250, 252] as [number, number, number],         // Claro
  branco: [255, 255, 255] as [number, number, number],
};

const CORES_CANDIDATOS = [
  [37, 99, 235],    // Azul
  [239, 68, 68],    // Vermelho
  [34, 197, 94],    // Verde
  [168, 85, 247],   // Roxo
  [249, 115, 22],   // Laranja
  [236, 72, 153],   // Rosa
  [20, 184, 166],   // Teal
  [234, 179, 8],    // Amarelo
];

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function formatarData(data: Date): string {
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function formatarPercentual(valor: number): string {
  return `${valor.toFixed(1)}%`;
}

function obterCorStatus(status: 'bom' | 'atencao' | 'critico'): [number, number, number] {
  switch (status) {
    case 'bom': return CORES.sucesso;
    case 'atencao': return CORES.atencao;
    case 'critico': return CORES.perigo;
  }
}

// ============================================
// GERADOR PRINCIPAL
// ============================================

export function gerarRelatorioPDF(dados: DadosRelatorio): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  let posY = 20;
  const margemEsquerda = 20;
  const margemDireita = 190;
  const larguraUtil = margemDireita - margemEsquerda;

  // ============================================
  // CAPA
  // ============================================

  // Logo/Header
  doc.setFillColor(...CORES.primaria);
  doc.rect(0, 0, 210, 60, 'F');

  doc.setTextColor(...CORES.branco);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(dados.titulo, 105, 30, { align: 'center' });

  if (dados.subtitulo) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(dados.subtitulo, 105, 42, { align: 'center' });
  }

  doc.setFontSize(10);
  doc.text(formatarData(dados.dataGeracao), 105, 52, { align: 'center' });

  posY = 75;

  // ============================================
  // MÉTRICAS PRINCIPAIS (Cards)
  // ============================================

  doc.setTextColor(...CORES.texto);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Metodologia', margemEsquerda, posY);
  posY += 8;

  // Desenhar cards de métricas
  const cardWidth = (larguraUtil - 15) / 4;
  const cardHeight = 25;
  const metricas = [
    { label: 'Entrevistas', valor: dados.metricas.totalEntrevistas.toString() },
    { label: 'Margem de Erro', valor: `±${dados.metricas.margemErro}%` },
    { label: 'Confiança', valor: `${dados.metricas.confianca}%` },
    { label: 'Período', valor: `${dados.metricas.dataInicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - ${dados.metricas.dataFim.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}` },
  ];

  metricas.forEach((m, i) => {
    const x = margemEsquerda + (cardWidth + 5) * i;

    // Fundo do card
    doc.setFillColor(...CORES.fundo);
    doc.roundedRect(x, posY, cardWidth, cardHeight, 2, 2, 'F');

    // Valor
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...CORES.primaria);
    doc.text(m.valor, x + cardWidth / 2, posY + 10, { align: 'center' });

    // Label
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...CORES.textoClaro);
    doc.text(m.label, x + cardWidth / 2, posY + 18, { align: 'center' });
  });

  posY += cardHeight + 15;

  // ============================================
  // RESUMO EXECUTIVO
  // ============================================

  doc.setFillColor(...CORES.primaria);
  doc.setDrawColor(...CORES.primaria);
  doc.roundedRect(margemEsquerda, posY, larguraUtil, 45, 3, 3, 'F');

  doc.setTextColor(...CORES.branco);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMO EXECUTIVO', margemEsquerda + 5, posY + 8);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const conclusaoLinhas = doc.splitTextToSize(dados.resumoExecutivo.conclusaoPrincipal, larguraUtil - 10);
  doc.text(conclusaoLinhas, margemEsquerda + 5, posY + 16);

  doc.setFontSize(9);
  const pontosChave = [
    `• ${dados.resumoExecutivo.pontoChave1}`,
    `• ${dados.resumoExecutivo.pontoChave2}`,
    `• ${dados.resumoExecutivo.pontoChave3}`,
  ];
  pontosChave.forEach((ponto, i) => {
    doc.text(ponto, margemEsquerda + 5, posY + 28 + (i * 5));
  });

  posY += 55;

  // ============================================
  // INTENÇÃO DE VOTO
  // ============================================

  doc.setTextColor(...CORES.texto);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Intenção de Voto', margemEsquerda, posY);
  posY += 8;

  // Tabela de intenção de voto
  const dadosTabela = dados.intencaoVoto.map((iv, i) => [
    iv.candidato,
    formatarPercentual(iv.percentual),
    iv.variacao !== undefined
      ? (iv.variacao > 0 ? `↑ +${iv.variacao.toFixed(1)}%` : iv.variacao < 0 ? `↓ ${iv.variacao.toFixed(1)}%` : '→ 0%')
      : '-'
  ]);

  autoTable(doc, {
    startY: posY,
    head: [['Candidato', 'Percentual', 'Variação']],
    body: dadosTabela,
    theme: 'striped',
    headStyles: {
      fillColor: CORES.primaria,
      textColor: CORES.branco,
      fontStyle: 'bold',
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 40, halign: 'center' }
    },
    styles: {
      fontSize: 10,
      cellPadding: 4
    },
    margin: { left: margemEsquerda, right: margemEsquerda }
  });

  // @ts-expect-error - jspdf-autotable adiciona esta propriedade
  posY = doc.lastAutoTable.finalY + 15;

  // Barra de percentual visual
  const barraY = posY;
  const barraAltura = 12;
  let barraX = margemEsquerda;

  dados.intencaoVoto.forEach((iv, i) => {
    const larguraBarra = (iv.percentual / 100) * larguraUtil;
    const cor = CORES_CANDIDATOS[i % CORES_CANDIDATOS.length] as [number, number, number];

    doc.setFillColor(...cor);
    doc.rect(barraX, barraY, larguraBarra, barraAltura, 'F');

    // Percentual na barra (se couber)
    if (larguraBarra > 20) {
      doc.setTextColor(...CORES.branco);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`${iv.percentual.toFixed(1)}%`, barraX + larguraBarra / 2, barraY + barraAltura / 2 + 2, { align: 'center' });
    }

    barraX += larguraBarra;
  });

  posY = barraY + barraAltura + 5;

  // Legenda
  let legendaX = margemEsquerda;
  dados.intencaoVoto.slice(0, 4).forEach((iv, i) => {
    const cor = CORES_CANDIDATOS[i % CORES_CANDIDATOS.length] as [number, number, number];
    doc.setFillColor(...cor);
    doc.rect(legendaX, posY, 8, 4, 'F');
    doc.setTextColor(...CORES.texto);
    doc.setFontSize(8);
    doc.text(iv.candidato, legendaX + 10, posY + 3);
    legendaX += 45;
  });

  posY += 15;

  // ============================================
  // NOVA PÁGINA - ANÁLISE DETALHADA
  // ============================================

  if (posY > 240) {
    doc.addPage();
    posY = 20;
  }

  // KPIs (se houver)
  if (dados.kpis && dados.kpis.length > 0) {
    doc.setTextColor(...CORES.texto);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Indicadores Chave', margemEsquerda, posY);
    posY += 8;

    const kpiWidth = (larguraUtil - 10) / 3;
    const kpiHeight = 30;

    dados.kpis.slice(0, 6).forEach((kpi, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = margemEsquerda + (kpiWidth + 5) * col;
      const y = posY + row * (kpiHeight + 5);

      // Fundo
      doc.setFillColor(...CORES.fundo);
      doc.roundedRect(x, y, kpiWidth, kpiHeight, 2, 2, 'F');

      // Indicador de status
      doc.setFillColor(...obterCorStatus(kpi.status));
      doc.rect(x, y, 3, kpiHeight, 'F');

      // Valor
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...CORES.texto);
      doc.text(`${kpi.valor}${kpi.unidade}`, x + kpiWidth / 2 + 2, y + 12, { align: 'center' });

      // Nome
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...CORES.textoClaro);
      doc.text(kpi.nome, x + kpiWidth / 2 + 2, y + 22, { align: 'center' });
    });

    posY += Math.ceil(dados.kpis.length / 3) * (kpiHeight + 5) + 15;
  }

  // Alertas (se houver)
  if (dados.alertas && dados.alertas.length > 0) {
    if (posY > 200) {
      doc.addPage();
      posY = 20;
    }

    doc.setTextColor(...CORES.texto);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Alertas e Riscos', margemEsquerda, posY);
    posY += 8;

    dados.alertas.slice(0, 5).forEach((alerta) => {
      const corAlerta = alerta.nivel === 'critico' ? CORES.perigo
        : alerta.nivel === 'alto' ? CORES.atencao
        : CORES.textoClaro;

      // Ícone de severidade
      doc.setFillColor(...(corAlerta as [number, number, number]));
      doc.circle(margemEsquerda + 3, posY + 4, 3, 'F');

      // Título
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...CORES.texto);
      doc.text(alerta.titulo, margemEsquerda + 10, posY + 5);

      // Descrição
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...CORES.textoClaro);
      const descLinhas = doc.splitTextToSize(alerta.descricao, larguraUtil - 15);
      doc.text(descLinhas, margemEsquerda + 10, posY + 11);

      posY += 8 + descLinhas.length * 4;
    });

    posY += 10;
  }

  // Análise Regional (se houver)
  if (dados.analiseRegional && dados.analiseRegional.length > 0) {
    if (posY > 200) {
      doc.addPage();
      posY = 20;
    }

    doc.setTextColor(...CORES.texto);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Análise Regional', margemEsquerda, posY);
    posY += 8;

    const dadosRegional = dados.analiseRegional.map(r => [
      r.regiao,
      r.candidatoLider,
      formatarPercentual(r.percentual),
      r.variacao !== undefined ? (r.variacao > 0 ? `+${r.variacao.toFixed(1)}%` : `${r.variacao.toFixed(1)}%`) : '-'
    ]);

    autoTable(doc, {
      startY: posY,
      head: [['Região', 'Líder', '%', 'Var.']],
      body: dadosRegional.slice(0, 10),
      theme: 'striped',
      headStyles: {
        fillColor: CORES.secundaria,
        textColor: CORES.branco,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      margin: { left: margemEsquerda, right: margemEsquerda }
    });

    // @ts-expect-error - jspdf-autotable adiciona esta propriedade
    posY = doc.lastAutoTable.finalY + 15;
  }

  // ============================================
  // PÁGINA FINAL - CONCLUSÕES E RECOMENDAÇÕES
  // ============================================

  if (posY > 180 || (dados.conclusoes && dados.conclusoes.length > 0) || (dados.recomendacoes && dados.recomendacoes.length > 0)) {
    doc.addPage();
    posY = 20;
  }

  // Conclusões
  if (dados.conclusoes && dados.conclusoes.length > 0) {
    doc.setTextColor(...CORES.texto);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Conclusões', margemEsquerda, posY);
    posY += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    dados.conclusoes.forEach((conclusao, i) => {
      doc.text(`${i + 1}. ${conclusao}`, margemEsquerda, posY);
      posY += 6;
    });

    posY += 10;
  }

  // Recomendações
  if (dados.recomendacoes && dados.recomendacoes.length > 0) {
    doc.setFillColor(...CORES.fundo);
    doc.roundedRect(margemEsquerda, posY, larguraUtil, 8 + dados.recomendacoes.length * 7, 3, 3, 'F');

    doc.setTextColor(...CORES.primaria);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Recomendações Estratégicas', margemEsquerda + 5, posY + 7);
    posY += 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...CORES.texto);
    dados.recomendacoes.forEach((rec, i) => {
      doc.text(`→ ${rec}`, margemEsquerda + 5, posY);
      posY += 6;
    });
  }

  // ============================================
  // RODAPÉ
  // ============================================

  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);

    // Linha separadora
    doc.setDrawColor(...CORES.textoClaro);
    doc.setLineWidth(0.3);
    doc.line(20, 282, 190, 282);

    // Texto do rodapé
    doc.setFontSize(8);
    doc.setTextColor(...CORES.textoClaro);
    doc.setFont('helvetica', 'normal');

    if (dados.organizacao) {
      doc.text(dados.organizacao, 20, 288);
    }

    doc.text(`Página ${i} de ${totalPaginas}`, 105, 288, { align: 'center' });

    doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 190, 288, { align: 'right' });
  }

  return doc;
}

// ============================================
// FUNÇÃO PARA DOWNLOAD
// ============================================

export function baixarRelatorioPDF(dados: DadosRelatorio, nomeArquivo?: string): void {
  const doc = gerarRelatorioPDF(dados);
  const nome = nomeArquivo || `relatorio-pesquisa-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(nome);
}

// ============================================
// FUNÇÃO PARA BLOB (para upload/email)
// ============================================

export function gerarRelatorioPDFBlob(dados: DadosRelatorio): Blob {
  const doc = gerarRelatorioPDF(dados);
  return doc.output('blob');
}

// ============================================
// FUNÇÃO PARA BASE64 (para preview)
// ============================================

export function gerarRelatorioPDFBase64(dados: DadosRelatorio): string {
  const doc = gerarRelatorioPDF(dados);
  return doc.output('datauristring');
}
