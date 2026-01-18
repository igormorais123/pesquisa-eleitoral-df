/**
 * Serviço de Analytics Local
 * Calcula métricas e análises a partir dos dados do Dexie (IndexedDB)
 * Pesquisa Eleitoral DF 2026
 */

import { db, type SessaoEntrevista } from '@/lib/db/dexie';

// ============================================
// TIPOS
// ============================================

export interface DashboardLocal {
  totalPesquisas: number;
  totalPesquisasConcluidas: number;
  totalRespostas: number;
  totalEleitoresUnicos: number;
  custoAtual: number;
  tokensEntrada: number;
  tokensSaida: number;
  mediaRespostasPorPesquisa: number;
  mediaCustoPorPesquisa: number;
  mediaTempoExecucao: number;
  sentimentos: Record<string, number>;
}

export interface SegmentacaoLocal {
  nome: string;
  total: number;
  percentual: number;
  sentimentos: Record<string, number>;
}

export interface TendenciaLocal {
  periodo: string;
  pesquisas: number;
  respostas: number;
  custo: number;
}

export interface InsightLocal {
  id: string;
  tipo: 'destaque' | 'alerta' | 'tendencia' | 'correlacao' | 'descoberta';
  titulo: string;
  descricao: string;
  relevancia: 'alta' | 'media' | 'baixa';
  dados?: Record<string, number | string>;
}

export interface PalavraFrequente {
  palavra: string;
  frequencia: number;
}

// ============================================
// FUNÇÕES DE CÁLCULO
// ============================================

/**
 * Calcula dashboard com métricas globais
 */
export async function calcularDashboard(): Promise<DashboardLocal> {
  const sessoes = await db.sessoes.toArray();

  const concluidas = sessoes.filter((s) => s.status === 'concluida');
  const totalRespostas = sessoes.reduce((acc, s) => acc + (s.respostas?.length || 0), 0);
  const custoAtual = sessoes.reduce((acc, s) => acc + (s.custoAtual || 0), 0);
  const tokensEntrada = sessoes.reduce((acc, s) => acc + (s.tokensInput || 0), 0);
  const tokensSaida = sessoes.reduce((acc, s) => acc + (s.tokensOutput || 0), 0);

  // Eleitores únicos
  const eleitoresIds = new Set<string>();
  sessoes.forEach((s) => {
    s.respostas?.forEach((r) => {
      eleitoresIds.add(r.eleitor_id);
    });
  });

  // Tempo médio de execução
  const temposExecucao = sessoes
    .filter((s) => s.finalizadaEm && s.iniciadaEm)
    .map((s) => {
      const inicio = new Date(s.iniciadaEm).getTime();
      const fim = new Date(s.finalizadaEm!).getTime();
      return (fim - inicio) / 1000;
    });
  const mediaTempoExecucao = temposExecucao.length > 0
    ? temposExecucao.reduce((a, b) => a + b, 0) / temposExecucao.length
    : 0;

  // Sentimentos acumulados
  const sentimentos: Record<string, number> = { positivo: 0, negativo: 0, neutro: 0, misto: 0 };
  sessoes.forEach((s) => {
    s.respostas?.forEach((r) => {
      r.respostas?.forEach((resp) => {
        const texto = String(resp.resposta).toLowerCase();
        if (texto.includes('ótimo') || texto.includes('bom') || texto.includes('excelente') || texto.includes('apoio')) {
          sentimentos.positivo++;
        } else if (texto.includes('ruim') || texto.includes('péssimo') || texto.includes('horrível') || texto.includes('contra')) {
          sentimentos.negativo++;
        } else if (texto.includes('depende') || texto.includes('talvez') || texto.includes('parcialmente')) {
          sentimentos.misto++;
        } else {
          sentimentos.neutro++;
        }
      });
    });
  });

  return {
    totalPesquisas: sessoes.length,
    totalPesquisasConcluidas: concluidas.length,
    totalRespostas,
    totalEleitoresUnicos: eleitoresIds.size,
    custoAtual,
    tokensEntrada,
    tokensSaida,
    mediaRespostasPorPesquisa: sessoes.length > 0 ? totalRespostas / sessoes.length : 0,
    mediaCustoPorPesquisa: sessoes.length > 0 ? custoAtual / sessoes.length : 0,
    mediaTempoExecucao,
    sentimentos,
  };
}

/**
 * Calcula segmentação por uma dimensão
 */
export async function calcularSegmentacao(
  dimensao: 'cluster' | 'regiao' | 'orientacao' | 'genero' | 'religiao' | 'faixaEtaria'
): Promise<SegmentacaoLocal[]> {
  const sessoes = await db.sessoes.toArray();
  const eleitores = await db.eleitores.toArray();
  const eleitoresMap = new Map(eleitores.map((e) => [e.id, e]));

  const segmentos: Record<string, { total: number; sentimentos: Record<string, number> }> = {};

  sessoes.forEach((s) => {
    s.respostas?.forEach((r) => {
      const eleitor = eleitoresMap.get(r.eleitor_id);
      if (!eleitor) return;

      let valor: string;
      switch (dimensao) {
        case 'cluster':
          valor = eleitor.cluster_socioeconomico || 'Não informado';
          break;
        case 'regiao':
          valor = eleitor.regiao_administrativa || 'Não informado';
          break;
        case 'orientacao':
          valor = eleitor.orientacao_politica || 'Não informado';
          break;
        case 'genero':
          valor = eleitor.genero || 'Não informado';
          break;
        case 'religiao':
          valor = eleitor.religiao || 'Não informado';
          break;
        case 'faixaEtaria':
          if (eleitor.idade < 30) valor = '18-29';
          else if (eleitor.idade < 45) valor = '30-44';
          else if (eleitor.idade < 60) valor = '45-59';
          else valor = '60+';
          break;
        default:
          valor = 'Não informado';
      }

      if (!segmentos[valor]) {
        segmentos[valor] = { total: 0, sentimentos: { positivo: 0, negativo: 0, neutro: 0, misto: 0 } };
      }
      segmentos[valor].total++;

      // Classificar sentimento
      r.respostas?.forEach((resp) => {
        const texto = String(resp.resposta).toLowerCase();
        if (texto.includes('ótimo') || texto.includes('bom') || texto.includes('apoio')) {
          segmentos[valor].sentimentos.positivo++;
        } else if (texto.includes('ruim') || texto.includes('péssimo') || texto.includes('contra')) {
          segmentos[valor].sentimentos.negativo++;
        } else {
          segmentos[valor].sentimentos.neutro++;
        }
      });
    });
  });

  const totalGeral = Object.values(segmentos).reduce((acc, s) => acc + s.total, 0);

  return Object.entries(segmentos)
    .map(([nome, dados]) => ({
      nome,
      total: dados.total,
      percentual: totalGeral > 0 ? Math.round((dados.total / totalGeral) * 100) : 0,
      sentimentos: dados.sentimentos,
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Calcula tendências temporais
 */
export async function calcularTendencias(): Promise<TendenciaLocal[]> {
  const sessoes = await db.sessoes.toArray();

  const porMes: Record<string, { pesquisas: number; respostas: number; custo: number }> = {};

  sessoes.forEach((s) => {
    if (!s.iniciadaEm) return;
    const data = new Date(s.iniciadaEm);
    const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;

    if (!porMes[chave]) {
      porMes[chave] = { pesquisas: 0, respostas: 0, custo: 0 };
    }
    porMes[chave].pesquisas++;
    porMes[chave].respostas += s.respostas?.length || 0;
    porMes[chave].custo += s.custoAtual || 0;
  });

  return Object.entries(porMes)
    .map(([periodo, dados]) => ({ periodo, ...dados }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}

/**
 * Gera insights automáticos
 */
export async function gerarInsights(): Promise<InsightLocal[]> {
  const dashboard = await calcularDashboard();
  const segCluster = await calcularSegmentacao('cluster');
  const segRegiao = await calcularSegmentacao('regiao');
  const segOrientacao = await calcularSegmentacao('orientacao');

  const insights: InsightLocal[] = [];

  // Insight: Total de pesquisas
  if (dashboard.totalPesquisas > 0) {
    insights.push({
      id: 'total-pesquisas',
      tipo: 'destaque',
      titulo: `${dashboard.totalPesquisas} pesquisas realizadas`,
      descricao: `Com ${dashboard.totalRespostas} respostas de ${dashboard.totalEleitoresUnicos} eleitores únicos`,
      relevancia: 'alta',
      dados: { pesquisas: dashboard.totalPesquisas, respostas: dashboard.totalRespostas },
    });
  }

  // Insight: Custo total
  if (dashboard.custoAtual > 0) {
    insights.push({
      id: 'custo-total',
      tipo: 'descoberta',
      titulo: `Custo total: R$ ${dashboard.custoAtual.toFixed(2)}`,
      descricao: `Média de R$ ${dashboard.mediaCustoPorPesquisa.toFixed(2)} por pesquisa`,
      relevancia: 'media',
      dados: { custo: dashboard.custoAtual },
    });
  }

  // Insight: Região mais representada
  if (segRegiao.length > 0) {
    const top = segRegiao[0];
    insights.push({
      id: 'regiao-top',
      tipo: 'descoberta',
      titulo: `${top.nome} lidera com ${top.percentual}%`,
      descricao: `Região com maior número de participantes nas pesquisas`,
      relevancia: 'media',
      dados: { regiao: top.nome, percentual: top.percentual },
    });
  }

  // Insight: Orientação política predominante
  if (segOrientacao.length > 0) {
    const top = segOrientacao[0];
    if (top.percentual > 30) {
      insights.push({
        id: 'orientacao-dominante',
        tipo: 'alerta',
        titulo: `Orientação ${top.nome} predomina`,
        descricao: `${top.percentual}% dos participantes se identificam como ${top.nome}`,
        relevancia: 'alta',
        dados: { orientacao: top.nome, percentual: top.percentual },
      });
    }
  }

  // Insight: Sentimento geral
  const totalSentimentos = Object.values(dashboard.sentimentos).reduce((a, b) => a + b, 0);
  if (totalSentimentos > 0) {
    const percentPositivo = Math.round((dashboard.sentimentos.positivo / totalSentimentos) * 100);
    const percentNegativo = Math.round((dashboard.sentimentos.negativo / totalSentimentos) * 100);

    if (percentPositivo > 50) {
      insights.push({
        id: 'sentimento-positivo',
        tipo: 'destaque',
        titulo: `${percentPositivo}% de sentimento positivo`,
        descricao: 'A maioria das respostas expressa opiniões favoráveis',
        relevancia: 'alta',
        dados: { positivo: percentPositivo, negativo: percentNegativo },
      });
    } else if (percentNegativo > 50) {
      insights.push({
        id: 'sentimento-negativo',
        tipo: 'alerta',
        titulo: `${percentNegativo}% de sentimento negativo`,
        descricao: 'A maioria das respostas expressa insatisfação',
        relevancia: 'alta',
        dados: { positivo: percentPositivo, negativo: percentNegativo },
      });
    }
  }

  // Insight: Tokens consumidos
  const tokensTotal = dashboard.tokensEntrada + dashboard.tokensSaida;
  if (tokensTotal > 0) {
    insights.push({
      id: 'tokens-consumidos',
      tipo: 'descoberta',
      titulo: `${formatarNumero(tokensTotal)} tokens consumidos`,
      descricao: `${formatarNumero(dashboard.tokensEntrada)} entrada + ${formatarNumero(dashboard.tokensSaida)} saída`,
      relevancia: 'baixa',
      dados: { entrada: dashboard.tokensEntrada, saida: dashboard.tokensSaida },
    });
  }

  return insights;
}

/**
 * Extrai palavras mais frequentes das respostas
 */
export async function extrairPalavrasFrequentes(limite = 30): Promise<PalavraFrequente[]> {
  const sessoes = await db.sessoes.toArray();

  const contagem: Record<string, number> = {};
  const stopwords = new Set([
    'de', 'da', 'do', 'das', 'dos', 'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas',
    'e', 'é', 'em', 'no', 'na', 'nos', 'nas', 'por', 'para', 'com', 'sem', 'que',
    'se', 'não', 'sim', 'mas', 'ou', 'como', 'mais', 'muito', 'também', 'já',
    'foi', 'ser', 'ter', 'está', 'são', 'tem', 'isso', 'esse', 'essa', 'isso',
    'ele', 'ela', 'eles', 'elas', 'eu', 'você', 'nós', 'vocês', 'meu', 'minha',
  ]);

  sessoes.forEach((s) => {
    s.respostas?.forEach((r) => {
      r.respostas?.forEach((resp) => {
        const texto = String(resp.resposta).toLowerCase();
        const palavras = texto.match(/[a-záàâãéêíóôõúç]+/gi) || [];

        palavras.forEach((p) => {
          if (p.length > 3 && !stopwords.has(p)) {
            contagem[p] = (contagem[p] || 0) + 1;
          }
        });
      });
    });
  });

  return Object.entries(contagem)
    .map(([palavra, frequencia]) => ({ palavra, frequencia }))
    .sort((a, b) => b.frequencia - a.frequencia)
    .slice(0, limite);
}

// ============================================
// UTILITÁRIOS
// ============================================

function formatarNumero(valor: number): string {
  if (valor >= 1000000) return `${(valor / 1000000).toFixed(1)}M`;
  if (valor >= 1000) return `${(valor / 1000).toFixed(1)}k`;
  return valor.toString();
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}
