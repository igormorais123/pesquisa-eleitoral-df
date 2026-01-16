'use client';

import { useState, useMemo } from 'react';
import { FileDown, Loader2, FileText, Table2 } from 'lucide-react';
import type { Eleitor } from '@/types';
import { calcularValidacaoEstatistica, type ValidacaoCompleta } from '@/services/validacao-estatistica';

interface ExportarRelatorioProps {
  eleitores: Eleitor[];
}

/**
 * Gera o conteúdo do relatório em formato Markdown
 */
function gerarRelatorioMarkdown(validacao: ValidacaoCompleta): string {
  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  let md = `# Relatório de Validação Estatística
## Pesquisa Eleitoral DF 2026

**Data de geração:** ${dataAtual}
**Total de eleitores na amostra:** ${validacao.totalEleitores}

---

## Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Índice de Conformidade | ${validacao.indiceConformidade.toFixed(1)}% |
| Variáveis Analisadas | ${validacao.totalVariaveis} |
| Variáveis Ótimas (≤3% desvio) | ${validacao.variaveisOtimas} |
| Variáveis Boas (3-7% desvio) | ${validacao.variaveisBoas} |
| Variáveis com Atenção (7-12% desvio) | ${validacao.variaveisAtencao} |
| Variáveis Críticas (>12% desvio) | ${validacao.variaveisCriticas} |

---

## Principais Vieses Identificados

`;

  if (validacao.principaisVieses.length > 0) {
    md += `| Variável | Categoria | Amostra | Referência | Diferença |
|----------|-----------|---------|------------|-----------|
`;
    validacao.principaisVieses.forEach((v) => {
      const sinal = v.diferenca > 0 ? '+' : '';
      md += `| ${v.labelVariavel} | ${v.labelCategoria} | ${v.valorAmostra}% | ${v.valorReferencia}% | ${sinal}${v.diferenca}% |
`;
    });
  } else {
    md += `*Nenhum viés significativo identificado.*
`;
  }

  md += `
---

## Análise Detalhada por Variável

`;

  validacao.resumos.forEach((resumo) => {
    const statusEmoji =
      resumo.statusGeral === 'otimo' ? '✅' :
      resumo.statusGeral === 'bom' ? '👍' :
      resumo.statusGeral === 'atencao' ? '⚠️' : '🚨';

    md += `### ${statusEmoji} ${resumo.labelVariavel}

- **Fonte:** ${resumo.fonte}
- **Ano:** ${resumo.ano}
- **Âmbito:** ${resumo.ambito}
- **Confiabilidade:** ${resumo.confiabilidade}
- **Desvio médio:** ${resumo.mediaDesvio.toFixed(1)}%
- **Status:** ${resumo.statusGeral.toUpperCase()}

**Link:** [${resumo.fonte}](${resumo.url})

`;

    if (resumo.observacoes) {
      md += `> ${resumo.observacoes}

`;
    }

    md += `| Categoria | Amostra | Referência | Diferença | Status |
|-----------|---------|------------|-----------|--------|
`;
    resumo.divergencias.forEach((d) => {
      const sinal = d.diferenca > 0 ? '+' : '';
      const statusCat =
        d.severidade === 'baixa' ? '🟢' :
        d.severidade === 'media' ? '🟡' :
        d.severidade === 'alta' ? '🟠' : '🔴';
      md += `| ${d.labelCategoria} | ${d.valorAmostra}% (n=${d.contagemAmostra}) | ${d.valorReferencia}% | ${sinal}${d.diferenca}% | ${statusCat} |
`;
    });

    md += `
`;
  });

  md += `---

## Metodologia

Esta validação compara a distribuição das variáveis na amostra de ${validacao.totalEleitores} eleitores sintéticos com dados oficiais de fontes como:

- **IBGE** - Instituto Brasileiro de Geografia e Estatística (Censo 2022)
- **CODEPLAN/IPEDF** - Companhia de Planejamento do DF (PDAD 2021)
- **DataSenado/Datafolha** - Pesquisas de opinião pública
- **Latinobarómetro/ESEB** - Estudos eleitorais
- **Literatura acadêmica** - Psicologia política e comportamento eleitoral

### Critérios de Classificação

| Status | Desvio Médio | Interpretação |
|--------|--------------|---------------|
| Ótimo | ≤ 3% | Excelente representatividade |
| Bom | 3-7% | Boa representatividade |
| Atenção | 7-12% | Viés moderado - avaliar impacto |
| Crítico | > 12% | Viés significativo - necessita ajuste |

### Limitações

1. Algumas variáveis utilizam dados nacionais por falta de dados específicos do DF
2. Variáveis psicológicas baseiam-se em literatura acadêmica internacional
3. A amostra de 1000 eleitores tem margem de erro estatística inerente

---

*Relatório gerado automaticamente pelo Sistema de Pesquisa Eleitoral DF 2026*
`;

  return md;
}

/**
 * Gera o conteúdo do relatório em formato CSV
 */
function gerarRelatorioCSV(validacao: ValidacaoCompleta): string {
  let csv = 'Variável,Categoria,Amostra (%),Referência (%),Diferença (%),Contagem,Severidade,Fonte,Ano,URL\n';

  validacao.resumos.forEach((resumo) => {
    resumo.divergencias.forEach((d) => {
      csv += `"${d.labelVariavel}","${d.labelCategoria}",${d.valorAmostra},${d.valorReferencia},${d.diferenca},${d.contagemAmostra},"${d.severidade}","${resumo.fonte}",${resumo.ano},"${resumo.url}"\n`;
    });
  });

  return csv;
}

/**
 * Faz o download de um arquivo
 */
function downloadArquivo(conteudo: string, nomeArquivo: string, tipo: string) {
  const blob = new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ExportarRelatorio({ eleitores }: ExportarRelatorioProps) {
  const [exportando, setExportando] = useState<'md' | 'csv' | null>(null);

  const validacao = useMemo(
    () => calcularValidacaoEstatistica(eleitores),
    [eleitores]
  );

  const exportarMarkdown = async () => {
    setExportando('md');
    try {
      const conteudo = gerarRelatorioMarkdown(validacao);
      const dataHoje = new Date().toISOString().split('T')[0];
      downloadArquivo(conteudo, `relatorio-validacao-${dataHoje}.md`, 'text/markdown');
    } finally {
      setExportando(null);
    }
  };

  const exportarCSV = async () => {
    setExportando('csv');
    try {
      const conteudo = gerarRelatorioCSV(validacao);
      const dataHoje = new Date().toISOString().split('T')[0];
      downloadArquivo(conteudo, `validacao-estatistica-${dataHoje}.csv`, 'text/csv');
    } finally {
      setExportando(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportarMarkdown}
        disabled={exportando !== null}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium disabled:opacity-50"
      >
        {exportando === 'md' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        Relatório (MD)
      </button>
      <button
        onClick={exportarCSV}
        disabled={exportando !== null}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors text-sm font-medium disabled:opacity-50"
      >
        {exportando === 'csv' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Table2 className="w-4 h-4" />
        )}
        Dados (CSV)
      </button>
    </div>
  );
}

export default ExportarRelatorio;
