/**
 * EXPORTAÇÃO MARKDOWN
 *
 * Exporta dados em formato Markdown otimizado para:
 * - Alimentar outras IAs (Claude, GPT, etc.)
 * - Documentação e relatórios
 * - Versionamento em Git
 * - Leitura humana
 */

import type { Eleitor, Candidato, RespostaEntrevista } from '@/types';
import type { SessaoEntrevista } from '@/lib/db/dexie';

// ============================================
// HELPERS
// ============================================

function formatarData(data: string | Date): string {
  const d = new Date(data);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarArray(arr: unknown[] | undefined): string {
  if (!arr || arr.length === 0) return '_Não informado_';
  return arr.map(item => `- ${item}`).join('\n');
}

function formatarLista(arr: unknown[] | undefined): string {
  if (!arr || arr.length === 0) return '_Não informado_';
  return arr.join(', ');
}

function baixarMarkdown(conteudo: string, nomeArquivo: string): void {
  const blob = new Blob([conteudo], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${nomeArquivo}_${new Date().toISOString().slice(0, 10)}.md`;
  link.click();
  URL.revokeObjectURL(url);
}

// ============================================
// EXPORTAR ELEITOR INDIVIDUAL
// ============================================

export function gerarMarkdownEleitor(eleitor: Eleitor): string {
  return `# Perfil do Eleitor: ${eleitor.nome}

## Informações Básicas

| Campo | Valor |
|-------|-------|
| **ID** | ${eleitor.id} |
| **Nome** | ${eleitor.nome} |
| **Idade** | ${eleitor.idade} anos |
| **Gênero** | ${eleitor.genero} |
| **Cor/Raça** | ${eleitor.cor_raca} |
| **Estado Civil** | ${eleitor.estado_civil} |
| **Filhos** | ${eleitor.filhos || 0} |
| **Religião** | ${eleitor.religiao} |

## Localização e Socioeconômico

| Campo | Valor |
|-------|-------|
| **Região Administrativa** | ${eleitor.regiao_administrativa} |
| **Local de Referência** | ${eleitor.local_referencia || '_Não informado_'} |
| **Cluster Socioeconômico** | ${eleitor.cluster_socioeconomico} |
| **Escolaridade** | ${eleitor.escolaridade} |
| **Profissão** | ${eleitor.profissao} |
| **Vínculo** | ${eleitor.ocupacao_vinculo} |
| **Renda** | ${eleitor.renda_salarios_minimos} salários mínimos |
| **Meio de Transporte** | ${eleitor.meio_transporte || '_Não informado_'} |
| **Tempo Deslocamento** | ${eleitor.tempo_deslocamento_trabalho || '_Não informado_'} |

## Perfil Político

| Campo | Valor |
|-------|-------|
| **Orientação Política** | ${eleitor.orientacao_politica} |
| **Posição sobre Bolsonaro** | ${eleitor.posicao_bolsonaro} |
| **Interesse Político** | ${eleitor.interesse_politico} |
| **Estilo de Decisão** | ${eleitor.estilo_decisao || '_Não informado_'} |
| **Tolerância à Nuance** | ${eleitor.tolerancia_nuance || '_Não informado_'} |
| **Voto Facultativo** | ${eleitor.voto_facultativo ? 'Sim' : 'Não'} |
| **Conflito Identitário** | ${eleitor.conflito_identitario ? 'Sim' : 'Não'} |

## Valores

${formatarArray(eleitor.valores)}

## Preocupações

${formatarArray(eleitor.preocupacoes)}

## Medos

${formatarArray(eleitor.medos)}

## Vieses Cognitivos

${formatarArray(eleitor.vieses_cognitivos)}

## Fontes de Informação

${formatarArray(eleitor.fontes_informacao)}

## Susceptibilidade à Desinformação

**Nível:** ${eleitor.susceptibilidade_desinformacao || 'Não informado'}/10

## História de Vida

${eleitor.historia_resumida}

## Instrução Comportamental

${eleitor.instrucao_comportamental || '_Não definida_'}

## Observação Territorial

${eleitor.observacao_territorial || '_Não definida_'}

---

*Gerado em ${formatarData(new Date())}*
`;
}

export function exportarEleitorMD(eleitor: Eleitor): void {
  const conteudo = gerarMarkdownEleitor(eleitor);
  baixarMarkdown(conteudo, `eleitor_${eleitor.nome.replace(/\s+/g, '_')}`);
}

// ============================================
// EXPORTAR LISTA DE ELEITORES
// ============================================

export function gerarMarkdownEleitores(eleitores: Eleitor[], titulo?: string): string {
  const tituloDoc = titulo || 'Lista de Eleitores Sintéticos';

  // Estatísticas
  const estatisticas = calcularEstatisticasEleitores(eleitores);

  let md = `# ${tituloDoc}

> **Total:** ${eleitores.length} eleitores
> **Gerado em:** ${formatarData(new Date())}

## Resumo Estatístico

### Por Gênero
${Object.entries(estatisticas.porGenero).map(([k, v]) => `- **${k}:** ${v} (${((v / eleitores.length) * 100).toFixed(1)}%)`).join('\n')}

### Por Cluster Socioeconômico
${Object.entries(estatisticas.porCluster).map(([k, v]) => `- **${k}:** ${v} (${((v / eleitores.length) * 100).toFixed(1)}%)`).join('\n')}

### Por Orientação Política
${Object.entries(estatisticas.porOrientacao).map(([k, v]) => `- **${k}:** ${v} (${((v / eleitores.length) * 100).toFixed(1)}%)`).join('\n')}

### Por Posição sobre Bolsonaro
${Object.entries(estatisticas.porBolsonaro).map(([k, v]) => `- **${k}:** ${v} (${((v / eleitores.length) * 100).toFixed(1)}%)`).join('\n')}

### Por Religião
${Object.entries(estatisticas.porReligiao).map(([k, v]) => `- **${k}:** ${v} (${((v / eleitores.length) * 100).toFixed(1)}%)`).join('\n')}

### Por Região Administrativa (Top 10)
${Object.entries(estatisticas.porRegiao).slice(0, 10).map(([k, v]) => `- **${k}:** ${v} (${((v / eleitores.length) * 100).toFixed(1)}%)`).join('\n')}

---

## Lista Detalhada

`;

  eleitores.forEach((eleitor, index) => {
    md += `### ${index + 1}. ${eleitor.nome}

| Campo | Valor |
|-------|-------|
| Idade | ${eleitor.idade} anos |
| Gênero | ${eleitor.genero} |
| Região | ${eleitor.regiao_administrativa} |
| Cluster | ${eleitor.cluster_socioeconomico} |
| Orientação | ${eleitor.orientacao_politica} |
| Bolsonaro | ${eleitor.posicao_bolsonaro} |
| Profissão | ${eleitor.profissao} |
| Religião | ${eleitor.religiao} |

**Valores:** ${formatarLista(eleitor.valores)}

**Preocupações:** ${formatarLista(eleitor.preocupacoes)}

**História:** ${eleitor.historia_resumida.slice(0, 200)}${eleitor.historia_resumida.length > 200 ? '...' : ''}

---

`;
  });

  return md;
}

export function exportarEleitoresMD(eleitores: Eleitor[], titulo?: string): void {
  const conteudo = gerarMarkdownEleitores(eleitores, titulo);
  baixarMarkdown(conteudo, 'eleitores');
}

// ============================================
// EXPORTAR RESULTADO DE ENTREVISTA
// ============================================

export function gerarMarkdownResultado(sessao: SessaoEntrevista): string {
  const respostas = sessao.respostas || [];

  let md = `# Resultado da Pesquisa

## Informações da Sessão

| Campo | Valor |
|-------|-------|
| **ID da Sessão** | ${sessao.id} |
| **Título** | ${sessao.titulo || 'Pesquisa sem título'} |
| **Status** | ${sessao.status} |
| **Início** | ${formatarData(sessao.criado_em)} |
| **Eleitores Entrevistados** | ${sessao.eleitores_ids.length} |
| **Respostas Coletadas** | ${respostas.length} |

## Resumo Executivo

${sessao.resumo || '_Resumo não disponível_'}

---

## Respostas Detalhadas

`;

  respostas.forEach((resposta, index) => {
    md += `### Resposta ${index + 1}

**Eleitor:** ${resposta.eleitor_nome || resposta.eleitor_id}

**Pergunta:** ${resposta.pergunta_texto}

**Resposta:** ${resposta.resposta_texto}

**Tom:** ${resposta.tom || '_Não classificado_'} | **Certeza:** ${resposta.certeza || '_N/A_'}/10

${resposta.raciocinio ? `
**Raciocínio do Eleitor:**
- Atenção: ${resposta.raciocinio.atencao?.motivo || '_N/A_'}
- Sentimento: ${resposta.raciocinio.emocional?.sentimento_primario || '_N/A_'} (intensidade ${resposta.raciocinio.emocional?.intensidade || '_N/A_'})
- Vieses Ativados: ${resposta.raciocinio.processamento?.vieses_em_acao?.join(', ') || '_Nenhum_'}
` : ''}

---

`;
  });

  return md;
}

export function exportarResultadoMD(sessao: SessaoEntrevista): void {
  const conteudo = gerarMarkdownResultado(sessao);
  baixarMarkdown(conteudo, `pesquisa_${sessao.id}`);
}

// ============================================
// EXPORTAR INSIGHTS
// ============================================

export interface InsightData {
  tipo: string;
  titulo: string;
  descricao: string;
  relevancia: number;
  dados_suporte?: Record<string, unknown>;
}

export interface InsightsCompleto {
  insights: InsightData[];
  voto_silencioso?: {
    identificados: string[];
    percentual_estimado: number;
    perfil_tipico: string;
  };
  pontos_ruptura?: Array<{
    grupo: string;
    evento_gatilho: string;
    probabilidade_mudanca: number;
  }>;
  conclusoes?: string[];
  implicacoes_politicas?: string[];
}

export function gerarMarkdownInsights(insights: InsightsCompleto, contexto?: string): string {
  let md = `# Insights de Pesquisa Eleitoral

> Gerado em ${formatarData(new Date())}
${contexto ? `\n> Contexto: ${contexto}\n` : ''}

---

## Principais Descobertas

`;

  insights.insights
    .sort((a, b) => b.relevancia - a.relevancia)
    .forEach((insight, index) => {
      const icone = insight.tipo === 'alerta' ? '⚠️' : insight.tipo === 'destaque' ? '⭐' : insight.tipo === 'tendencia' ? '📈' : '🔗';
      md += `### ${icone} ${index + 1}. ${insight.titulo}

**Tipo:** ${insight.tipo} | **Relevância:** ${insight.relevancia}/100

${insight.descricao}

${insight.dados_suporte ? `\`\`\`json\n${JSON.stringify(insight.dados_suporte, null, 2)}\n\`\`\`` : ''}

---

`;
    });

  if (insights.voto_silencioso) {
    md += `## 🤫 Voto Silencioso

**Percentual Estimado:** ${insights.voto_silencioso.percentual_estimado}%

**Perfil Típico:** ${insights.voto_silencioso.perfil_tipico}

**Grupos Identificados:**
${insights.voto_silencioso.identificados.map(g => `- ${g}`).join('\n')}

---

`;
  }

  if (insights.pontos_ruptura && insights.pontos_ruptura.length > 0) {
    md += `## 💥 Pontos de Ruptura

`;
    insights.pontos_ruptura.forEach(pr => {
      md += `### ${pr.grupo}

**Evento Gatilho:** ${pr.evento_gatilho}

**Probabilidade de Mudança:** ${pr.probabilidade_mudanca}%

---

`;
    });
  }

  if (insights.conclusoes && insights.conclusoes.length > 0) {
    md += `## 📋 Conclusões

${insights.conclusoes.map((c, i) => `${i + 1}. ${c}`).join('\n')}

---

`;
  }

  if (insights.implicacoes_politicas && insights.implicacoes_politicas.length > 0) {
    md += `## 🎯 Implicações Políticas

${insights.implicacoes_politicas.map((c, i) => `${i + 1}. ${c}`).join('\n')}

`;
  }

  return md;
}

export function exportarInsightsMD(insights: InsightsCompleto, contexto?: string): void {
  const conteudo = gerarMarkdownInsights(insights, contexto);
  baixarMarkdown(conteudo, 'insights_pesquisa');
}

// ============================================
// EXPORTAR CANDIDATOS
// ============================================

export function gerarMarkdownCandidato(candidato: Candidato): string {
  return `# ${candidato.nome_urna || candidato.nome}

## Informações Básicas

| Campo | Valor |
|-------|-------|
| **Nome Completo** | ${candidato.nome} |
| **Nome de Urna** | ${candidato.nome_urna || '_N/A_'} |
| **Cargo Pretendido** | ${candidato.cargo_pretendido} |
| **Status** | ${candidato.status_candidatura} |
| **Partido** | ${candidato.partido} (${candidato.numero_partido || '_N/A_'}) |
| **Coligação** | ${candidato.coligacao || '_N/A_'} |
| **Idade** | ${candidato.idade || '_N/A_'} anos |
| **Gênero** | ${candidato.genero || '_N/A_'} |
| **Profissão** | ${candidato.profissao || '_N/A_'} |
| **Cargo Atual** | ${candidato.cargo_atual || '_N/A_'} |

## Perfil Político

| Campo | Valor |
|-------|-------|
| **Orientação Política** | ${candidato.orientacao_politica || '_N/A_'} |
| **Posição sobre Bolsonaro** | ${candidato.posicao_bolsonaro || '_N/A_'} |
| **Posição sobre Lula** | ${candidato.posicao_lula || '_N/A_'} |

## Biografia

${candidato.biografia || '_Não disponível_'}

## Histórico Político

${candidato.historico_politico?.length > 0 ? candidato.historico_politico.map(h => `- ${h}`).join('\n') : '_Não disponível_'}

## Propostas Principais

${candidato.propostas_principais?.length > 0 ? candidato.propostas_principais.map(p => `- ${p}`).join('\n') : '_Não disponível_'}

## Áreas de Foco

${candidato.areas_foco?.length > 0 ? candidato.areas_foco.map(a => `- ${a}`).join('\n') : '_Não disponível_'}

## Análise SWOT

### Pontos Fortes
${candidato.pontos_fortes?.length > 0 ? candidato.pontos_fortes.map(p => `- ${p}`).join('\n') : '_Não identificados_'}

### Pontos Fracos
${candidato.pontos_fracos?.length > 0 ? candidato.pontos_fracos.map(p => `- ${p}`).join('\n') : '_Não identificados_'}

### Controvérsias
${candidato.controversias?.length > 0 ? candidato.controversias.map(c => `- ${c}`).join('\n') : '_Nenhuma registrada_'}

## Métricas

| Métrica | Valor |
|---------|-------|
| **Conhecimento Estimado** | ${candidato.conhecimento_estimado || 0}% |
| **Rejeição Estimada** | ${candidato.rejeicao_estimada || 0}% |
| **Votos Última Eleição** | ${candidato.votos_ultima_eleicao?.toLocaleString() || '_N/A_'} |

## Eleições Anteriores

${candidato.eleicoes_anteriores?.length > 0 ? candidato.eleicoes_anteriores.map(e => `- **${e.ano}** - ${e.cargo}: ${e.resultado} (${e.votos?.toLocaleString()} votos, ${e.percentual}%)`).join('\n') : '_Sem histórico_'}

---

*Atualizado em ${formatarData(candidato.atualizado_em)}*
`;
}

export function exportarCandidatoMD(candidato: Candidato): void {
  const conteudo = gerarMarkdownCandidato(candidato);
  baixarMarkdown(conteudo, `candidato_${candidato.nome.replace(/\s+/g, '_')}`);
}

export function gerarMarkdownCandidatos(candidatos: Candidato[], titulo?: string): string {
  const tituloDoc = titulo || 'Candidatos do Distrito Federal 2026';

  let md = `# ${tituloDoc}

> **Total:** ${candidatos.length} candidatos
> **Gerado em:** ${formatarData(new Date())}

## Resumo por Cargo

`;

  const porCargo: Record<string, Candidato[]> = {};
  candidatos.forEach(c => {
    if (!porCargo[c.cargo_pretendido]) porCargo[c.cargo_pretendido] = [];
    porCargo[c.cargo_pretendido].push(c);
  });

  Object.entries(porCargo).forEach(([cargo, lista]) => {
    md += `### ${cargo.replace(/_/g, ' ').toUpperCase()} (${lista.length})

| Nome | Partido | Status | Orientação |
|------|---------|--------|------------|
${lista.map(c => `| ${c.nome_urna || c.nome} | ${c.partido} | ${c.status_candidatura} | ${c.orientacao_politica || '_N/A_'} |`).join('\n')}

---

`;
  });

  md += `## Detalhamento

`;

  candidatos.forEach((candidato, index) => {
    md += `### ${index + 1}. ${candidato.nome_urna || candidato.nome} (${candidato.partido})

**Cargo:** ${candidato.cargo_pretendido} | **Status:** ${candidato.status_candidatura}

${candidato.biografia ? `**Bio:** ${candidato.biografia.slice(0, 200)}...` : ''}

**Propostas:** ${candidato.propostas_principais?.slice(0, 3).join('; ') || '_Não disponível_'}

---

`;
  });

  return md;
}

export function exportarCandidatosMD(candidatos: Candidato[], titulo?: string): void {
  const conteudo = gerarMarkdownCandidatos(candidatos, titulo);
  baixarMarkdown(conteudo, 'candidatos_df');
}

// ============================================
// EXPORTAR GRÁFICOS COMO MD (DADOS TABULARES)
// ============================================

export interface DadoGrafico {
  nome: string;
  valor: number;
  percentual?: string | number;
}

export function gerarMarkdownGrafico(titulo: string, dados: DadoGrafico[], tipo?: string): string {
  let md = `## ${titulo}

`;

  if (tipo === 'tabela' || dados.length > 10) {
    md += `| Categoria | Valor | Percentual |
|-----------|-------|------------|
${dados.map(d => `| ${d.nome} | ${d.valor} | ${d.percentual || '-'}% |`).join('\n')}
`;
  } else {
    md += dados.map(d => `- **${d.nome}:** ${d.valor} (${d.percentual || '-'}%)`).join('\n');
  }

  md += '\n';
  return md;
}

export function exportarGraficosMD(graficos: Array<{ titulo: string; dados: DadoGrafico[] }>, tituloGeral?: string): void {
  let md = `# ${tituloGeral || 'Visualização de Dados'}

> Gerado em ${formatarData(new Date())}

---

`;

  graficos.forEach(g => {
    md += gerarMarkdownGrafico(g.titulo, g.dados);
    md += '\n---\n\n';
  });

  baixarMarkdown(md, 'graficos_dados');
}

// ============================================
// HELPERS INTERNOS
// ============================================

function calcularEstatisticasEleitores(eleitores: Eleitor[]) {
  const contarPorCampo = (campo: keyof Eleitor) => {
    const contagem: Record<string, number> = {};
    eleitores.forEach(e => {
      const valor = String((e as unknown as Record<string, unknown>)[campo] || 'Não informado');
      contagem[valor] = (contagem[valor] || 0) + 1;
    });
    return Object.entries(contagem)
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {} as Record<string, number>);
  };

  return {
    porGenero: contarPorCampo('genero'),
    porCluster: contarPorCampo('cluster_socioeconomico'),
    porOrientacao: contarPorCampo('orientacao_politica'),
    porBolsonaro: contarPorCampo('posicao_bolsonaro'),
    porReligiao: contarPorCampo('religiao'),
    porRegiao: contarPorCampo('regiao_administrativa'),
  };
}
