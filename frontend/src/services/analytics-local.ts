/**
 * Serviço de Analytics Local
 * Calcula métricas e análises a partir dos dados do Dexie (IndexedDB)
 *
 * Este serviço substitui a API remota para calcular analytics localmente
 */

import { db, type SessaoEntrevista } from '@/lib/db/dexie';
import type { Eleitor, RespostaEleitor, Distribuicao } from '@/types';

// ============================================
// TIPOS
// ============================================

export interface DashboardLocal {
  totalPesquisas: number;
  totalPesquisasConcluidas: number;
  totalRespostas: number;
  totalEleitoresUnicos: number;
  custoTotal: number;
  tokensEntrada: number;
  tokensSaida: number;
  mediaRespostasPorPesquisa: number;
  mediaCustoPorPesquisa: number;
  tempoMedioResposta: number;
  atualizadoEm: string;
}

export interface SentimentoAnalise {
  tipo: 'positivo' | 'negativo' | 'neutro' | 'misto';
  total: number;
  percentual: number;
  cor: string;
}

export interface SegmentoAnalise {
  nome: string;
  valor: string;
  total: number;
  percentual: number;
  sentimentoPositivo: number;
  sentimentoNegativo: number;
  sentimentoNeutro: number;
  cor: string;
}

export interface TendenciaLocal {
  periodo: string;
  pesquisas: number;
  respostas: number;
  custo: number;
  tokens: number;
}

export interface InsightLocal {
  id: string;
  tipo: 'destaque' | 'alerta' | 'tendencia' | 'correlacao' | 'descoberta';
  titulo: string;
  descricao: string;
  valor?: string | number;
  relevancia: 'alta' | 'media' | 'baixa';
  dados?: Record<string, number | string>;
  icone?: string;
}

export interface AnalyticsPorPergunta {
  perguntaId: string;
  perguntaTexto: string;
  totalRespostas: number;
  respostasAgrupadas: {
    resposta: string;
    total: number;
    percentual: number;
  }[];
  palavrasFrequentes: { palavra: string; contagem: number }[];
}

export interface AnalyticsCompleto {
  dashboard: DashboardLocal;
  sentimentos: SentimentoAnalise[];
  porCluster: SegmentoAnalise[];
  porRegiao: SegmentoAnalise[];
  porOrientacao: SegmentoAnalise[];
  porGenero: SegmentoAnalise[];
  porReligiao: SegmentoAnalise[];
  porFaixaEtaria: SegmentoAnalise[];
  tendencias: TendenciaLocal[];
  insights: InsightLocal[];
  porPergunta: AnalyticsPorPergunta[];
  sessoes: SessaoEntrevista[];
}

// ============================================
// CORES
// ============================================

const CORES_CLUSTER: Record<string, string> = {
  'G1_alta': '#10b981',
  'G2_media_alta': '#3b82f6',
  'G3_media_baixa': '#f59e0b',
  'G4_baixa': '#ef4444',
};

const CORES_ORIENTACAO: Record<string, string> = {
  'esquerda': '#dc2626',
  'centro-esquerda': '#f97316',
  'centro': '#8b5cf6',
  'centro-direita': '#3b82f6',
  'direita': '#1d4ed8',
};

const CORES_SENTIMENTO: Record<string, string> = {
  'positivo': '#22c55e',
  'negativo': '#ef4444',
  'neutro': '#6b7280',
  'misto': '#f59e0b',
};

const CORES_GENERO: Record<string, string> = {
  'masculino': '#3b82f6',
  'feminino': '#ec4899',
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function extrairPalavrasFrequentes(textos: string[], topN = 20): { palavra: string; contagem: number }[] {
  const stopwords = new Set([
    'de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não',
    'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi',
    'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito',
    'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso',
    'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'quem',
    'nas', 'me', 'esse', 'eles', 'estão', 'você', 'tinha', 'foram', 'essa', 'num',
    'nem', 'suas', 'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'elas', 'havia',
    'seja', 'qual', 'será', 'nós', 'tenho', 'lhe', 'deles', 'essas', 'esses', 'pelas',
    'este', 'fosse', 'dele', 'acho', 'sobre', 'porque', 'então', 'vai', 'pode',
    'precisa', 'deve', 'ter', 'ser', 'fazer', 'gente', 'coisa', 'coisas', 'pessoas',
  ]);

  const contagem: Record<string, number> = {};

  textos.forEach((texto) => {
    if (!texto) return;
    const palavras = texto
      .toLowerCase()
      .replace(/[^\p{L}\s]/gu, '')
      .split(/\s+/)
      .filter((p) => p.length > 3 && !stopwords.has(p));

    palavras.forEach((palavra) => {
      contagem[palavra] = (contagem[palavra] || 0) + 1;
    });
  });

  return Object.entries(contagem)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .map(([palavra, cont]) => ({ palavra, contagem: cont }));
}

function calcularFaixaEtaria(idade: number): string {
  if (idade < 25) return '18-24';
  if (idade < 35) return '25-34';
  if (idade < 45) return '35-44';
  if (idade < 55) return '45-54';
  if (idade < 65) return '55-64';
  return '65+';
}

function formatarCluster(cluster: string): string {
  const mapa: Record<string, string> = {
    'G1_alta': 'Classe Alta (A/B)',
    'G2_media_alta': 'Classe Média-Alta',
    'G3_media_baixa': 'Classe Média-Baixa',
    'G4_baixa': 'Classe Baixa (D/E)',
  };
  return mapa[cluster] || cluster;
}

function formatarOrientacao(orientacao: string): string {
  const mapa: Record<string, string> = {
    'esquerda': 'Esquerda',
    'centro-esquerda': 'Centro-Esquerda',
    'centro': 'Centro',
    'centro-direita': 'Centro-Direita',
    'direita': 'Direita',
  };
  return mapa[orientacao] || orientacao;
}

// ============================================
// SERVIÇO PRINCIPAL
// ============================================

/**
 * Obtém analytics completo a partir dos dados locais
 */
export async function obterAnalyticsLocal(usuarioId?: string): Promise<AnalyticsCompleto> {
  // Buscar sessões
  let sessoes = await db.sessoes.toArray();

  // Filtrar por usuário se necessário
  if (usuarioId) {
    sessoes = sessoes.filter((s) => !s.usuarioId || s.usuarioId === usuarioId);
  }

  // Filtrar apenas concluídas
  const sessoesConcluidas = sessoes.filter((s) => s.status === 'concluida');

  // Buscar eleitores para enriquecer dados
  const eleitores = await db.eleitores.toArray();
  const eleitoresMap = new Map<string, Eleitor>(eleitores.map((e) => [e.id, e]));

  // Calcular dashboard
  const dashboard = calcularDashboard(sessoes, sessoesConcluidas);

  // Coletar todas as respostas com perfil do eleitor
  const respostasEnriquecidas = coletarRespostasEnriquecidas(sessoesConcluidas, eleitoresMap);

  // Calcular sentimentos
  const sentimentos = calcularSentimentos(respostasEnriquecidas);

  // Calcular por segmento
  const porCluster = calcularPorSegmento(respostasEnriquecidas, 'cluster', CORES_CLUSTER);
  const porRegiao = calcularPorSegmento(respostasEnriquecidas, 'regiao');
  const porOrientacao = calcularPorSegmento(respostasEnriquecidas, 'orientacao', CORES_ORIENTACAO);
  const porGenero = calcularPorSegmento(respostasEnriquecidas, 'genero', CORES_GENERO);
  const porReligiao = calcularPorSegmento(respostasEnriquecidas, 'religiao');
  const porFaixaEtaria = calcularPorSegmento(respostasEnriquecidas, 'faixa_etaria');

  // Calcular tendências temporais
  const tendencias = calcularTendencias(sessoesConcluidas);

  // Calcular por pergunta
  const porPergunta = calcularPorPergunta(sessoesConcluidas);

  // Gerar insights
  const insights = gerarInsights(dashboard, sentimentos, porCluster, porOrientacao, respostasEnriquecidas, tendencias);

  return {
    dashboard,
    sentimentos,
    porCluster,
    porRegiao,
    porOrientacao,
    porGenero,
    porReligiao,
    porFaixaEtaria,
    tendencias,
    insights,
    porPergunta,
    sessoes: sessoesConcluidas,
  };
}

interface RespostaEnriquecida {
  eleitorId: string;
  eleitorNome: string;
  resposta: string;
  perguntaId: string;
  sentimento?: string;
  cluster?: string;
  regiao?: string;
  orientacao?: string;
  genero?: string;
  religiao?: string;
  faixaEtaria?: string;
  custo: number;
  tokens: number;
}

function coletarRespostasEnriquecidas(
  sessoes: SessaoEntrevista[],
  eleitoresMap: Map<string, Eleitor>
): RespostaEnriquecida[] {
  const respostas: RespostaEnriquecida[] = [];

  sessoes.forEach((sessao) => {
    sessao.respostas.forEach((resposta) => {
      const eleitor = eleitoresMap.get(resposta.eleitor_id);

      resposta.respostas.forEach((r) => {
        const textoResposta = typeof r.resposta === 'string'
          ? r.resposta
          : Array.isArray(r.resposta)
            ? r.resposta.join(', ')
            : String(r.resposta);

        respostas.push({
          eleitorId: resposta.eleitor_id,
          eleitorNome: resposta.eleitor_nome,
          resposta: textoResposta,
          perguntaId: r.pergunta_id,
          sentimento: analisarSentimento(textoResposta),
          cluster: eleitor?.cluster_socioeconomico,
          regiao: eleitor?.regiao_administrativa,
          orientacao: eleitor?.orientacao_politica,
          genero: eleitor?.genero,
          religiao: eleitor?.religiao,
          faixaEtaria: eleitor ? calcularFaixaEtaria(eleitor.idade) : undefined,
          custo: resposta.custo,
          tokens: resposta.tokens_usados,
        });
      });
    });
  });

  return respostas;
}

function analisarSentimento(texto: string): string {
  const textoLower = texto.toLowerCase();

  const palavrasPositivas = [
    'bom', 'ótimo', 'excelente', 'maravilhoso', 'fantástico', 'adorei', 'gostei',
    'satisfeito', 'feliz', 'apoio', 'concordo', 'aprovo', 'positivo', 'esperança',
    'melhor', 'sucesso', 'progresso', 'benefício', 'favorável', 'importante',
  ];

  const palavrasNegativas = [
    'ruim', 'péssimo', 'horrível', 'terrível', 'odiei', 'detestei', 'insatisfeito',
    'triste', 'raiva', 'discordo', 'reprovo', 'negativo', 'medo', 'pior',
    'fracasso', 'problema', 'prejuízo', 'desfavorável', 'preocupado', 'corrupção',
  ];

  let scorePositivo = 0;
  let scoreNegativo = 0;

  palavrasPositivas.forEach((palavra) => {
    if (textoLower.includes(palavra)) scorePositivo++;
  });

  palavrasNegativas.forEach((palavra) => {
    if (textoLower.includes(palavra)) scoreNegativo++;
  });

  if (scorePositivo > scoreNegativo + 1) return 'positivo';
  if (scoreNegativo > scorePositivo + 1) return 'negativo';
  if (scorePositivo > 0 && scoreNegativo > 0) return 'misto';
  return 'neutro';
}

function calcularDashboard(
  todasSessoes: SessaoEntrevista[],
  sessoesConcluidas: SessaoEntrevista[]
): DashboardLocal {
  const totalRespostas = sessoesConcluidas.reduce((acc, s) => acc + s.respostas.length, 0);
  const custoTotal = sessoesConcluidas.reduce((acc, s) => acc + s.custoAtual, 0);
  const tokensEntrada = sessoesConcluidas.reduce((acc, s) => acc + s.tokensInput, 0);
  const tokensSaida = sessoesConcluidas.reduce((acc, s) => acc + s.tokensOutput, 0);

  // Eleitores únicos
  const eleitoresUnicos = new Set<string>();
  sessoesConcluidas.forEach((s) => {
    s.respostas.forEach((r) => eleitoresUnicos.add(r.eleitor_id));
  });

  // Tempo médio de resposta
  let tempoTotal = 0;
  let contagemTempo = 0;
  sessoesConcluidas.forEach((s) => {
    s.respostas.forEach((r) => {
      if (r.tempo_resposta_ms > 0) {
        tempoTotal += r.tempo_resposta_ms;
        contagemTempo++;
      }
    });
  });

  return {
    totalPesquisas: todasSessoes.length,
    totalPesquisasConcluidas: sessoesConcluidas.length,
    totalRespostas,
    totalEleitoresUnicos: eleitoresUnicos.size,
    custoTotal,
    tokensEntrada,
    tokensSaida,
    mediaRespostasPorPesquisa: sessoesConcluidas.length > 0
      ? totalRespostas / sessoesConcluidas.length
      : 0,
    mediaCustoPorPesquisa: sessoesConcluidas.length > 0
      ? custoTotal / sessoesConcluidas.length
      : 0,
    tempoMedioResposta: contagemTempo > 0 ? tempoTotal / contagemTempo : 0,
    atualizadoEm: new Date().toISOString(),
  };
}

function calcularSentimentos(respostas: RespostaEnriquecida[]): SentimentoAnalise[] {
  const contagem: Record<string, number> = {
    positivo: 0,
    negativo: 0,
    neutro: 0,
    misto: 0,
  };

  respostas.forEach((r) => {
    if (r.sentimento) {
      contagem[r.sentimento] = (contagem[r.sentimento] || 0) + 1;
    }
  });

  const total = respostas.length || 1;

  return Object.entries(contagem).map(([tipo, count]) => ({
    tipo: tipo as 'positivo' | 'negativo' | 'neutro' | 'misto',
    total: count,
    percentual: (count / total) * 100,
    cor: CORES_SENTIMENTO[tipo] || '#6b7280',
  }));
}

function calcularPorSegmento(
  respostas: RespostaEnriquecida[],
  campo: 'cluster' | 'regiao' | 'orientacao' | 'genero' | 'religiao' | 'faixa_etaria',
  cores?: Record<string, string>
): SegmentoAnalise[] {
  const grupos: Record<string, {
    total: number;
    positivo: number;
    negativo: number;
    neutro: number;
  }> = {};

  respostas.forEach((r) => {
    let valor = '';
    switch (campo) {
      case 'cluster': valor = r.cluster || 'Não informado'; break;
      case 'regiao': valor = r.regiao || 'Não informada'; break;
      case 'orientacao': valor = r.orientacao || 'Não informada'; break;
      case 'genero': valor = r.genero || 'Não informado'; break;
      case 'religiao': valor = r.religiao || 'Não informada'; break;
      case 'faixa_etaria': valor = r.faixaEtaria || 'Não informada'; break;
    }

    if (!grupos[valor]) {
      grupos[valor] = { total: 0, positivo: 0, negativo: 0, neutro: 0 };
    }

    grupos[valor].total++;
    if (r.sentimento === 'positivo') grupos[valor].positivo++;
    else if (r.sentimento === 'negativo') grupos[valor].negativo++;
    else grupos[valor].neutro++;
  });

  const totalGeral = respostas.length || 1;
  const coresPadrao = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return Object.entries(grupos)
    .map(([valor, dados], i) => ({
      nome: campo,
      valor: campo === 'cluster' ? formatarCluster(valor) :
             campo === 'orientacao' ? formatarOrientacao(valor) : valor,
      total: dados.total,
      percentual: (dados.total / totalGeral) * 100,
      sentimentoPositivo: dados.positivo,
      sentimentoNegativo: dados.negativo,
      sentimentoNeutro: dados.neutro,
      cor: cores?.[valor] || coresPadrao[i % coresPadrao.length],
    }))
    .sort((a, b) => b.total - a.total);
}

function calcularTendencias(sessoes: SessaoEntrevista[]): TendenciaLocal[] {
  const porMes: Record<string, {
    pesquisas: number;
    respostas: number;
    custo: number;
    tokens: number;
  }> = {};

  sessoes.forEach((s) => {
    const data = new Date(s.finalizadaEm || s.iniciadaEm);
    const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;

    if (!porMes[chave]) {
      porMes[chave] = { pesquisas: 0, respostas: 0, custo: 0, tokens: 0 };
    }

    porMes[chave].pesquisas++;
    porMes[chave].respostas += s.respostas.length;
    porMes[chave].custo += s.custoAtual;
    porMes[chave].tokens += s.tokensInput + s.tokensOutput;
  });

  return Object.entries(porMes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([periodo, dados]) => ({
      periodo,
      ...dados,
    }));
}

function calcularPorPergunta(sessoes: SessaoEntrevista[]): AnalyticsPorPergunta[] {
  const perguntas: Record<string, {
    texto: string;
    respostas: string[];
    contagem: Record<string, number>;
  }> = {};

  sessoes.forEach((sessao) => {
    sessao.respostas.forEach((resposta) => {
      resposta.respostas.forEach((r) => {
        if (!perguntas[r.pergunta_id]) {
          perguntas[r.pergunta_id] = { texto: r.pergunta_id, respostas: [], contagem: {} };
        }

        const textoResposta = typeof r.resposta === 'string'
          ? r.resposta
          : Array.isArray(r.resposta)
            ? r.resposta.join(', ')
            : String(r.resposta);

        perguntas[r.pergunta_id].respostas.push(textoResposta);

        // Para respostas curtas, agrupar
        if (textoResposta.length < 100) {
          const chave = textoResposta.toLowerCase().trim();
          perguntas[r.pergunta_id].contagem[chave] =
            (perguntas[r.pergunta_id].contagem[chave] || 0) + 1;
        }
      });
    });
  });

  return Object.entries(perguntas).map(([id, dados]) => {
    const total = dados.respostas.length || 1;

    return {
      perguntaId: id,
      perguntaTexto: dados.texto,
      totalRespostas: dados.respostas.length,
      respostasAgrupadas: Object.entries(dados.contagem)
        .map(([resposta, count]) => ({
          resposta,
          total: count,
          percentual: (count / total) * 100,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10),
      palavrasFrequentes: extrairPalavrasFrequentes(dados.respostas),
    };
  });
}

function gerarInsights(
  dashboard: DashboardLocal,
  sentimentos: SentimentoAnalise[],
  porCluster: SegmentoAnalise[],
  porOrientacao: SegmentoAnalise[],
  respostas: RespostaEnriquecida[],
  tendencias: TendenciaLocal[]
): InsightLocal[] {
  const insights: InsightLocal[] = [];

  // Insight 1: Volume de dados
  if (dashboard.totalPesquisasConcluidas > 0) {
    insights.push({
      id: 'volume',
      tipo: 'destaque',
      titulo: 'Base de Dados',
      descricao: `${dashboard.totalPesquisasConcluidas} pesquisas concluídas com ${dashboard.totalRespostas} respostas de ${dashboard.totalEleitoresUnicos} eleitores únicos.`,
      valor: dashboard.totalRespostas,
      relevancia: 'media',
    });
  }

  // Insight 2: Sentimento predominante
  const sentimentoTop = sentimentos.reduce((a, b) => a.total > b.total ? a : b);
  if (sentimentoTop.total > 0) {
    insights.push({
      id: 'sentimento-geral',
      tipo: sentimentoTop.tipo === 'negativo' ? 'alerta' : 'destaque',
      titulo: 'Sentimento Predominante',
      descricao: `${sentimentoTop.percentual.toFixed(0)}% das respostas têm sentimento ${sentimentoTop.tipo}.`,
      valor: `${sentimentoTop.percentual.toFixed(0)}%`,
      relevancia: sentimentoTop.tipo === 'negativo' ? 'alta' : 'media',
    });
  }

  // Insight 3: Polarização política
  const esquerda = porOrientacao.filter(o => o.valor.toLowerCase().includes('esquerda'));
  const direita = porOrientacao.filter(o => o.valor.toLowerCase().includes('direita'));
  const totalEsq = esquerda.reduce((acc, o) => acc + o.total, 0);
  const totalDir = direita.reduce((acc, o) => acc + o.total, 0);
  const totalPol = respostas.length || 1;

  if (totalEsq + totalDir > totalPol * 0.5) {
    insights.push({
      id: 'polarizacao',
      tipo: 'alerta',
      titulo: 'Polarização Política',
      descricao: `${(((totalEsq + totalDir) / totalPol) * 100).toFixed(0)}% das respostas vêm de eleitores de esquerda ou direita. Baixa representação do centro.`,
      valor: `${(((totalEsq + totalDir) / totalPol) * 100).toFixed(0)}%`,
      relevancia: 'alta',
      dados: { esquerda: totalEsq, direita: totalDir },
    });
  }

  // Insight 4: Classe social predominante
  if (porCluster.length > 0) {
    const clusterTop = porCluster[0];
    if (clusterTop.percentual > 30) {
      insights.push({
        id: 'classe-predominante',
        tipo: 'destaque',
        titulo: 'Classe Social Predominante',
        descricao: `${clusterTop.percentual.toFixed(0)}% das respostas são de eleitores da ${clusterTop.valor}.`,
        valor: `${clusterTop.percentual.toFixed(0)}%`,
        relevancia: 'baixa',
      });
    }
  }

  // Insight 5: Custo
  if (dashboard.custoTotal > 0) {
    const custoPorResposta = dashboard.custoTotal / (dashboard.totalRespostas || 1);
    insights.push({
      id: 'custo-medio',
      tipo: 'tendencia',
      titulo: 'Eficiência de Custo',
      descricao: `Custo médio de R$ ${custoPorResposta.toFixed(4)} por resposta e R$ ${dashboard.mediaCustoPorPesquisa.toFixed(2)} por pesquisa.`,
      valor: `R$ ${custoPorResposta.toFixed(4)}`,
      relevancia: 'baixa',
    });
  }

  // Insight 6: Tendência de crescimento
  if (tendencias.length >= 2) {
    const ultima = tendencias[tendencias.length - 1];
    const penultima = tendencias[tendencias.length - 2];
    const crescimento = ultima.respostas - penultima.respostas;
    const crescimentoPct = (crescimento / (penultima.respostas || 1)) * 100;

    if (Math.abs(crescimentoPct) > 20) {
      insights.push({
        id: 'tendencia-volume',
        tipo: 'tendencia',
        titulo: crescimentoPct > 0 ? 'Crescimento no Volume' : 'Queda no Volume',
        descricao: `${Math.abs(crescimentoPct).toFixed(0)}% de ${crescimentoPct > 0 ? 'aumento' : 'queda'} em respostas entre ${penultima.periodo} e ${ultima.periodo}.`,
        valor: `${crescimentoPct > 0 ? '+' : ''}${crescimentoPct.toFixed(0)}%`,
        relevancia: 'media',
      });
    }
  }

  // Insight 7: Correlação cluster x sentimento
  const clusterNegativo = porCluster.find(c =>
    c.sentimentoNegativo > c.sentimentoPositivo * 1.5
  );
  if (clusterNegativo) {
    insights.push({
      id: 'correlacao-cluster-sentimento',
      tipo: 'correlacao',
      titulo: 'Insatisfação por Classe',
      descricao: `Eleitores da ${clusterNegativo.valor} demonstram mais sentimentos negativos (${clusterNegativo.sentimentoNegativo} negativos vs ${clusterNegativo.sentimentoPositivo} positivos).`,
      relevancia: 'alta',
    });
  }

  // Insight 8: Palavras frequentes
  const todasRespostas = respostas.map(r => r.resposta);
  const palavrasTop = extrairPalavrasFrequentes(todasRespostas, 5);
  if (palavrasTop.length > 0) {
    insights.push({
      id: 'palavras-chave',
      tipo: 'descoberta',
      titulo: 'Temas Mais Mencionados',
      descricao: `Palavras mais frequentes: ${palavrasTop.map(p => p.palavra).join(', ')}.`,
      relevancia: 'media',
      dados: Object.fromEntries(palavrasTop.map(p => [p.palavra, p.contagem])),
    });
  }

  // Ordenar por relevância
  const ordemRelevancia = { alta: 0, media: 1, baixa: 2 };
  insights.sort((a, b) => ordemRelevancia[a.relevancia] - ordemRelevancia[b.relevancia]);

  return insights;
}

// ============================================
// UTILITÁRIOS DE FORMATAÇÃO
// ============================================

export function formatarNumero(valor: number): string {
  if (valor >= 1000000) {
    return `${(valor / 1000000).toFixed(1)}M`;
  }
  if (valor >= 1000) {
    return `${(valor / 1000).toFixed(1)}k`;
  }
  return valor.toLocaleString('pt-BR');
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

export function formatarTokens(valor: number): string {
  if (valor >= 1000000) {
    return `${(valor / 1000000).toFixed(2)}M`;
  }
  if (valor >= 1000) {
    return `${(valor / 1000).toFixed(1)}k`;
  }
  return valor.toString();
}
