// ============================================
// SISTEMA DE CLASSIFICAÇÃO INTELIGENTE DE PERGUNTAS
// ============================================

import type { Pergunta, TipoPergunta, Candidato } from '@/types';

// Tipos de resposta esperados
export type TipoRespostaEsperada =
  | 'sim_nao'
  | 'escolha_unica'
  | 'multipla_escolha'
  | 'escala_numerica'
  | 'ranking'
  | 'nome_candidato'
  | 'texto_curto'
  | 'texto_longo'
  | 'percentual'
  | 'lista';

export interface ClassificacaoPergunta {
  tipo: TipoPergunta;
  tipoResposta: TipoRespostaEsperada;
  formatoResposta: string;
  graficoRecomendado: TipoGrafico;
  opcoes?: string[];
  escalaMin?: number;
  escalaMax?: number;
  isMultipla?: boolean;
  candidatosEnvolvidos?: string[];
}

export type TipoGrafico =
  | 'pizza'
  | 'barras_horizontal'
  | 'barras_vertical'
  | 'donut'
  | 'gauge'
  | 'wordcloud'
  | 'escala_likert'
  | 'ranking_barras'
  | 'treemap'
  | 'stacked_bar'
  | 'radar'
  | 'funil';

// Palavras-chave para classificação automática
const PALAVRAS_SIM_NAO = [
  'você votaria', 'votaria em', 'concorda', 'discorda', 'aprova', 'desaprova',
  'é a favor', 'é contra', 'apoia', 'rejeita', 'sim ou não', 'sim/não',
  'considera', 'acredita', 'pretende', 'planeja', 'vai votar', 'você é',
  'você tem', 'conhece', 'já ouviu', 'sabe quem', 'aceita', 'tolera'
];

const PALAVRAS_ESCOLHA_CANDIDATO = [
  'em quem votaria', 'qual candidato', 'votaria em qual', 'seu candidato',
  'escolheria entre', 'entre estes candidatos', 'qual destes', 'primeiro turno',
  'segundo turno', 'votaria para', 'governador', 'senador', 'deputado',
  'presidente', 'prefeito', 'vereador', 'intenção de voto'
];

const PALAVRAS_ESCALA = [
  'de 0 a 10', 'de 1 a 10', 'nota de', 'quanto você', 'qual o grau',
  'em uma escala', 'avalie', 'dê uma nota', 'classifique', 'nível de',
  'intensidade', 'probabilidade'
];

const PALAVRAS_MULTIPLA = [
  'quais são', 'quais os', 'cite', 'mencione', 'liste', 'principais',
  'mais importantes', 'três mais', 'dois mais', 'selecione', 'escolha'
];

const PALAVRAS_RANKING = [
  'em ordem de', 'ordene', 'ranking', 'classificação', 'priorize',
  'do mais ao menos', 'do maior ao menor', 'primeiro a último'
];

const PALAVRAS_REJEICAO = [
  'não votaria', 'jamais votaria', 'de jeito nenhum', 'rejeita', 'rejeição',
  'nunca', 'em hipótese alguma', 'recusaria'
];

/**
 * Classifica automaticamente uma pergunta baseado no texto e tipo
 */
export function classificarPergunta(
  pergunta: Pergunta,
  candidatos?: Candidato[]
): ClassificacaoPergunta {
  const textoLower = pergunta.texto.toLowerCase();

  // Se já tem tipo definido, usa ele
  if (pergunta.tipo === 'sim_nao') {
    return {
      tipo: 'sim_nao',
      tipoResposta: 'sim_nao',
      formatoResposta: 'SIM ou NÃO (uma palavra)',
      graficoRecomendado: 'pizza',
      opcoes: ['Sim', 'Não']
    };
  }

  if (pergunta.tipo === 'escala') {
    return {
      tipo: 'escala',
      tipoResposta: 'escala_numerica',
      formatoResposta: `Número de ${pergunta.escala_min || 0} a ${pergunta.escala_max || 10}`,
      graficoRecomendado: 'escala_likert',
      escalaMin: pergunta.escala_min || 0,
      escalaMax: pergunta.escala_max || 10
    };
  }

  if (pergunta.tipo === 'multipla_escolha' && pergunta.opcoes) {
    // Verifica se são candidatos
    const temCandidatos = candidatos && candidatos.some(c =>
      pergunta.opcoes?.some(o =>
        o.toLowerCase().includes(c.nome_urna.toLowerCase()) ||
        o.toLowerCase().includes(c.nome.toLowerCase())
      )
    );

    if (temCandidatos || detectarPerguntaCandidato(textoLower)) {
      return {
        tipo: 'multipla_escolha',
        tipoResposta: 'nome_candidato',
        formatoResposta: 'Apenas o NOME do candidato escolhido',
        graficoRecomendado: 'barras_horizontal',
        opcoes: pergunta.opcoes,
        candidatosEnvolvidos: pergunta.opcoes
      };
    }

    return {
      tipo: 'multipla_escolha',
      tipoResposta: 'escolha_unica',
      formatoResposta: `Uma das opções: ${pergunta.opcoes.join(', ')}`,
      graficoRecomendado: 'pizza',
      opcoes: pergunta.opcoes
    };
  }

  // Classificação automática baseada no texto

  // Verifica se é sobre candidatos
  if (detectarPerguntaCandidato(textoLower) && candidatos && candidatos.length > 0) {
    const opcoesCandidatos = extrairCandidatosDaPergunta(textoLower, candidatos);
    return {
      tipo: 'multipla_escolha',
      tipoResposta: 'nome_candidato',
      formatoResposta: 'Apenas o NOME do candidato escolhido (ou "Indeciso", "Branco/Nulo")',
      graficoRecomendado: 'barras_horizontal',
      opcoes: opcoesCandidatos.length > 0 ? opcoesCandidatos : candidatos.map(c => c.nome_urna),
      candidatosEnvolvidos: opcoesCandidatos.length > 0 ? opcoesCandidatos : candidatos.map(c => c.nome_urna)
    };
  }

  // Verifica se é sim/não
  if (detectarSimNao(textoLower)) {
    return {
      tipo: 'sim_nao',
      tipoResposta: 'sim_nao',
      formatoResposta: 'SIM ou NÃO (uma palavra)',
      graficoRecomendado: 'pizza',
      opcoes: ['Sim', 'Não']
    };
  }

  // Verifica se é escala
  if (detectarEscala(textoLower)) {
    const escala = extrairEscala(textoLower);
    return {
      tipo: 'escala',
      tipoResposta: 'escala_numerica',
      formatoResposta: `Apenas um NÚMERO de ${escala.min} a ${escala.max}`,
      graficoRecomendado: 'escala_likert',
      escalaMin: escala.min,
      escalaMax: escala.max
    };
  }

  // Verifica se é ranking
  if (detectarRanking(textoLower)) {
    return {
      tipo: 'aberta',
      tipoResposta: 'ranking',
      formatoResposta: 'Lista ordenada separada por vírgulas',
      graficoRecomendado: 'ranking_barras'
    };
  }

  // Verifica se é múltipla seleção
  if (detectarMultipla(textoLower)) {
    return {
      tipo: 'aberta',
      tipoResposta: 'lista',
      formatoResposta: 'Lista de itens separados por vírgulas',
      graficoRecomendado: 'treemap',
      isMultipla: true
    };
  }

  // Pergunta aberta padrão
  const ehCurta = textoLower.length < 50 ||
    textoLower.includes('qual') ||
    textoLower.includes('quem') ||
    textoLower.includes('onde');

  return {
    tipo: 'aberta',
    tipoResposta: ehCurta ? 'texto_curto' : 'texto_longo',
    formatoResposta: ehCurta ? 'Resposta curta e direta (1-2 frases)' : 'Resposta livre',
    graficoRecomendado: 'wordcloud'
  };
}

/**
 * Detecta se a pergunta é sobre escolha de candidatos
 */
function detectarPerguntaCandidato(texto: string): boolean {
  return PALAVRAS_ESCOLHA_CANDIDATO.some(p => texto.includes(p));
}

/**
 * Detecta se a pergunta é sim/não
 */
function detectarSimNao(texto: string): boolean {
  return PALAVRAS_SIM_NAO.some(p => texto.includes(p)) ||
    texto.endsWith('?') && (
      texto.includes(' ou ') ||
      texto.startsWith('você ') ||
      texto.startsWith('voce ')
    );
}

/**
 * Detecta se a pergunta é de escala
 */
function detectarEscala(texto: string): boolean {
  return PALAVRAS_ESCALA.some(p => texto.includes(p)) ||
    /de\s+\d+\s+a\s+\d+/i.test(texto) ||
    /nota\s*(de)?\s*\d+/i.test(texto);
}

/**
 * Extrai os limites da escala do texto
 */
function extrairEscala(texto: string): { min: number; max: number } {
  const match = texto.match(/de\s+(\d+)\s+a\s+(\d+)/i);
  if (match) {
    return { min: parseInt(match[1]), max: parseInt(match[2]) };
  }
  return { min: 0, max: 10 };
}

/**
 * Detecta se a pergunta é de múltipla escolha
 */
function detectarMultipla(texto: string): boolean {
  return PALAVRAS_MULTIPLA.some(p => texto.includes(p));
}

/**
 * Detecta se a pergunta é de ranking
 */
function detectarRanking(texto: string): boolean {
  return PALAVRAS_RANKING.some(p => texto.includes(p));
}

/**
 * Extrai nomes de candidatos mencionados na pergunta
 */
function extrairCandidatosDaPergunta(texto: string, candidatos: Candidato[]): string[] {
  const encontrados: string[] = [];

  for (const candidato of candidatos) {
    if (texto.includes(candidato.nome_urna.toLowerCase()) ||
        texto.includes(candidato.nome.toLowerCase())) {
      encontrados.push(candidato.nome_urna);
    }
  }

  return encontrados;
}

// ============================================
// PARSER DE RESPOSTAS
// ============================================

export interface RespostaParseada {
  valorPrincipal: string | number | string[];
  valorNormalizado: string | number | string[];
  tipo: TipoRespostaEsperada;
  confianca: number; // 0-100
  textoOriginal: string;
}

/**
 * Extrai o valor da resposta baseado na classificação
 */
export function parsearResposta(
  respostaTexto: string,
  classificacao: ClassificacaoPergunta,
  respostaEstruturada?: { escala?: number; opcao?: string; ranking?: string[] }
): RespostaParseada {
  const textoLimpo = respostaTexto.trim();
  const textoLower = textoLimpo.toLowerCase();

  switch (classificacao.tipoResposta) {
    case 'sim_nao':
      return parsearSimNao(textoLower, textoLimpo);

    case 'nome_candidato':
    case 'escolha_unica':
      return parsearEscolha(textoLower, textoLimpo, classificacao.opcoes || [], respostaEstruturada?.opcao);

    case 'escala_numerica':
      return parsearEscala(textoLower, textoLimpo, respostaEstruturada?.escala);

    case 'ranking':
      return parsearRanking(textoLimpo, respostaEstruturada?.ranking);

    case 'lista':
    case 'multipla_escolha':
      return parsearLista(textoLimpo);

    case 'texto_curto':
      return parsearTextoCurto(textoLimpo);

    case 'texto_longo':
    default:
      return {
        valorPrincipal: textoLimpo,
        valorNormalizado: textoLimpo,
        tipo: 'texto_longo',
        confianca: 100,
        textoOriginal: textoLimpo
      };
  }
}

function parsearSimNao(textoLower: string, textoOriginal: string): RespostaParseada {
  // Detecta SIM
  const patternSim = /^(sim|s|yes|claro|com certeza|certamente|óbvio|obviamente|concordo|apoio|aprovo|votaria|voto|aceito)/i;
  const patternNao = /^(não|nao|n|no|nunca|jamais|de jeito nenhum|discordo|rejeito|desaprovo|não votaria|nao votaria|recuso|negativo)/i;

  if (patternSim.test(textoLower) || textoLower.startsWith('sim')) {
    return {
      valorPrincipal: 'Sim',
      valorNormalizado: 'sim',
      tipo: 'sim_nao',
      confianca: 95,
      textoOriginal
    };
  }

  if (patternNao.test(textoLower) || textoLower.startsWith('não') || textoLower.startsWith('nao')) {
    return {
      valorPrincipal: 'Não',
      valorNormalizado: 'nao',
      tipo: 'sim_nao',
      confianca: 95,
      textoOriginal
    };
  }

  // Tenta inferir do contexto
  const palavrasPositivas = ['favor', 'apoio', 'concordo', 'bom', 'ótimo', 'excelente', 'aprovo'];
  const palavrasNegativas = ['contra', 'rejeito', 'discordo', 'ruim', 'péssimo', 'horrível', 'desaprovo'];

  const temPositiva = palavrasPositivas.some(p => textoLower.includes(p));
  const temNegativa = palavrasNegativas.some(p => textoLower.includes(p));

  if (temPositiva && !temNegativa) {
    return {
      valorPrincipal: 'Sim',
      valorNormalizado: 'sim',
      tipo: 'sim_nao',
      confianca: 70,
      textoOriginal
    };
  }

  if (temNegativa && !temPositiva) {
    return {
      valorPrincipal: 'Não',
      valorNormalizado: 'nao',
      tipo: 'sim_nao',
      confianca: 70,
      textoOriginal
    };
  }

  // Indeciso
  return {
    valorPrincipal: 'Indeciso',
    valorNormalizado: 'indeciso',
    tipo: 'sim_nao',
    confianca: 50,
    textoOriginal
  };
}

function parsearEscolha(
  textoLower: string,
  textoOriginal: string,
  opcoes: string[],
  opcaoEstruturada?: string
): RespostaParseada {
  // Se tem resposta estruturada, usa ela
  if (opcaoEstruturada) {
    return {
      valorPrincipal: opcaoEstruturada,
      valorNormalizado: opcaoEstruturada.toLowerCase().trim(),
      tipo: 'escolha_unica',
      confianca: 100,
      textoOriginal
    };
  }

  // Procura correspondência exata primeiro
  for (const opcao of opcoes) {
    if (textoLower === opcao.toLowerCase() ||
        textoLower.startsWith(opcao.toLowerCase())) {
      return {
        valorPrincipal: opcao,
        valorNormalizado: opcao.toLowerCase().trim(),
        tipo: 'escolha_unica',
        confianca: 95,
        textoOriginal
      };
    }
  }

  // Procura menção da opção no texto
  for (const opcao of opcoes) {
    const opcaoLower = opcao.toLowerCase();
    // Divide em palavras para match parcial
    const palavrasOpcao = opcaoLower.split(/\s+/);
    const todasPalavrasPresentes = palavrasOpcao.length > 1
      ? palavrasOpcao.every(p => p.length > 2 && textoLower.includes(p))
      : textoLower.includes(opcaoLower);

    if (todasPalavrasPresentes) {
      return {
        valorPrincipal: opcao,
        valorNormalizado: opcao.toLowerCase().trim(),
        tipo: 'escolha_unica',
        confianca: 80,
        textoOriginal
      };
    }
  }

  // Verifica indecisos e brancos/nulos
  const indeciso = /indeciso|não sei|nao sei|ainda não|ainda nao|pensando|decidindo/i.test(textoLower);
  const brancoNulo = /branco|nulo|nenhum|ninguém|ninguem/i.test(textoLower);

  if (indeciso) {
    return {
      valorPrincipal: 'Indeciso',
      valorNormalizado: 'indeciso',
      tipo: 'escolha_unica',
      confianca: 85,
      textoOriginal
    };
  }

  if (brancoNulo) {
    return {
      valorPrincipal: 'Branco/Nulo',
      valorNormalizado: 'branco_nulo',
      tipo: 'escolha_unica',
      confianca: 85,
      textoOriginal
    };
  }

  // Não conseguiu identificar - retorna o texto original
  return {
    valorPrincipal: textoOriginal.split(/[.,!?]/)[0].trim(),
    valorNormalizado: textoOriginal.split(/[.,!?]/)[0].trim().toLowerCase(),
    tipo: 'escolha_unica',
    confianca: 40,
    textoOriginal
  };
}

function parsearEscala(
  textoLower: string,
  textoOriginal: string,
  valorEstruturado?: number
): RespostaParseada {
  // Se tem valor estruturado, usa
  if (valorEstruturado !== undefined) {
    return {
      valorPrincipal: valorEstruturado,
      valorNormalizado: valorEstruturado,
      tipo: 'escala_numerica',
      confianca: 100,
      textoOriginal
    };
  }

  // Procura números no texto
  const matchNumero = textoOriginal.match(/\b(\d+([.,]\d+)?)\b/);
  if (matchNumero) {
    const valor = parseFloat(matchNumero[1].replace(',', '.'));
    return {
      valorPrincipal: valor,
      valorNormalizado: valor,
      tipo: 'escala_numerica',
      confianca: 90,
      textoOriginal
    };
  }

  // Tenta inferir de palavras
  const mapaValores: Record<string, number> = {
    'zero': 0, 'um': 1, 'dois': 2, 'três': 3, 'tres': 3, 'quatro': 4,
    'cinco': 5, 'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10,
    'péssimo': 1, 'pessimo': 1, 'ruim': 3, 'regular': 5, 'médio': 5, 'medio': 5,
    'bom': 7, 'ótimo': 9, 'otimo': 9, 'excelente': 10
  };

  for (const [palavra, valor] of Object.entries(mapaValores)) {
    if (textoLower.includes(palavra)) {
      return {
        valorPrincipal: valor,
        valorNormalizado: valor,
        tipo: 'escala_numerica',
        confianca: 70,
        textoOriginal
      };
    }
  }

  // Não encontrou - retorna 5 como neutro
  return {
    valorPrincipal: 5,
    valorNormalizado: 5,
    tipo: 'escala_numerica',
    confianca: 30,
    textoOriginal
  };
}

function parsearRanking(
  textoOriginal: string,
  rankingEstruturado?: string[]
): RespostaParseada {
  if (rankingEstruturado && rankingEstruturado.length > 0) {
    return {
      valorPrincipal: rankingEstruturado,
      valorNormalizado: rankingEstruturado.map(r => r.toLowerCase().trim()),
      tipo: 'ranking',
      confianca: 100,
      textoOriginal
    };
  }

  // Tenta extrair lista do texto
  // Padrões: "1. item, 2. item" ou "primeiro: item, segundo: item" ou "item, item, item"
  const items: string[] = [];

  // Pattern numérico: 1. item, 2) item, 1- item
  const patternNumerico = /(?:\d+[.):\-]\s*)([^,\n\d]+)/g;
  let match;
  while ((match = patternNumerico.exec(textoOriginal)) !== null) {
    items.push(match[1].trim());
  }

  if (items.length === 0) {
    // Tenta separar por vírgulas
    items.push(...textoOriginal.split(/[,;]/).map(i => i.trim()).filter(i => i.length > 0));
  }

  return {
    valorPrincipal: items,
    valorNormalizado: items.map(i => i.toLowerCase()),
    tipo: 'ranking',
    confianca: items.length > 0 ? 75 : 30,
    textoOriginal
  };
}

function parsearLista(textoOriginal: string): RespostaParseada {
  // Divide por vírgulas, ponto e vírgula, ou quebras de linha
  const items = textoOriginal
    .split(/[,;\n]/)
    .map(i => i.trim())
    .filter(i => i.length > 2);

  return {
    valorPrincipal: items,
    valorNormalizado: items.map(i => i.toLowerCase()),
    tipo: 'lista',
    confianca: items.length > 0 ? 80 : 50,
    textoOriginal
  };
}

function parsearTextoCurto(textoOriginal: string): RespostaParseada {
  // Pega apenas a primeira frase
  const primeiraFrase = textoOriginal.split(/[.!?]/)[0].trim();

  return {
    valorPrincipal: primeiraFrase || textoOriginal,
    valorNormalizado: (primeiraFrase || textoOriginal).toLowerCase(),
    tipo: 'texto_curto',
    confianca: 100,
    textoOriginal
  };
}

// ============================================
// AGREGAÇÃO DE RESPOSTAS PARA GRÁFICOS
// ============================================

export interface DadosAgregados {
  tipo: TipoRespostaEsperada;
  graficoRecomendado: TipoGrafico;
  dados: DadoAgregado[];
  total: number;
  metadados: {
    perguntaTexto: string;
    opcoes?: string[];
    escalaMin?: number;
    escalaMax?: number;
  };
}

export interface DadoAgregado {
  label: string;
  valor: number;
  percentual: number;
  cor?: string;
  detalhes?: Record<string, unknown>;
}

/**
 * Agrega respostas parseadas para visualização em gráficos
 */
export function agregarRespostas(
  respostas: RespostaParseada[],
  classificacao: ClassificacaoPergunta,
  perguntaTexto: string
): DadosAgregados {
  const contagem: Record<string, number> = {};
  const total = respostas.length;

  for (const resposta of respostas) {
    let chave: string;

    if (Array.isArray(resposta.valorPrincipal)) {
      // Para listas/rankings, conta cada item
      for (const item of resposta.valorPrincipal) {
        chave = String(item);
        contagem[chave] = (contagem[chave] || 0) + 1;
      }
    } else {
      chave = String(resposta.valorPrincipal);
      contagem[chave] = (contagem[chave] || 0) + 1;
    }
  }

  // Converte para array ordenado
  const dados: DadoAgregado[] = Object.entries(contagem)
    .map(([label, valor]) => ({
      label,
      valor,
      percentual: (valor / total) * 100,
      cor: gerarCorParaLabel(label, classificacao)
    }))
    .sort((a, b) => b.valor - a.valor);

  return {
    tipo: classificacao.tipoResposta,
    graficoRecomendado: classificacao.graficoRecomendado,
    dados,
    total,
    metadados: {
      perguntaTexto,
      opcoes: classificacao.opcoes,
      escalaMin: classificacao.escalaMin,
      escalaMax: classificacao.escalaMax
    }
  };
}

/**
 * Gera cores para as categorias
 */
function gerarCorParaLabel(label: string, classificacao: ClassificacaoPergunta): string {
  const labelLower = label.toLowerCase();

  // Cores para sim/não
  if (classificacao.tipoResposta === 'sim_nao') {
    if (labelLower === 'sim') return '#22c55e'; // verde
    if (labelLower === 'não' || labelLower === 'nao') return '#ef4444'; // vermelho
    return '#94a3b8'; // cinza para indeciso
  }

  // Cores para candidatos/opções
  const coresPadrao = [
    '#3b82f6', // azul
    '#ef4444', // vermelho
    '#22c55e', // verde
    '#f59e0b', // amarelo
    '#8b5cf6', // roxo
    '#ec4899', // rosa
    '#06b6d4', // ciano
    '#f97316', // laranja
    '#84cc16', // lime
    '#6366f1', // indigo
  ];

  // Cores especiais
  if (labelLower.includes('indeciso')) return '#94a3b8';
  if (labelLower.includes('branco') || labelLower.includes('nulo')) return '#e2e8f0';

  // Usa hash do label para gerar índice consistente
  const hash = label.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return coresPadrao[hash % coresPadrao.length];
}

/**
 * Calcula estatísticas para respostas de escala
 */
export function calcularEstatisticasEscala(respostas: RespostaParseada[]): {
  media: number;
  mediana: number;
  moda: number;
  desvioPadrao: number;
  distribuicao: Record<number, number>;
} {
  const valores = respostas
    .map(r => typeof r.valorPrincipal === 'number' ? r.valorPrincipal : 0)
    .filter(v => !isNaN(v));

  if (valores.length === 0) {
    return { media: 0, mediana: 0, moda: 0, desvioPadrao: 0, distribuicao: {} };
  }

  // Média
  const soma = valores.reduce((a, b) => a + b, 0);
  const media = soma / valores.length;

  // Mediana
  const ordenados = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(ordenados.length / 2);
  const mediana = ordenados.length % 2 === 0
    ? (ordenados[meio - 1] + ordenados[meio]) / 2
    : ordenados[meio];

  // Moda
  const frequencia: Record<number, number> = {};
  for (const v of valores) {
    frequencia[v] = (frequencia[v] || 0) + 1;
  }
  const moda = Number(Object.entries(frequencia).sort((a, b) => b[1] - a[1])[0][0]);

  // Desvio padrão
  const varianciaSoma = valores.reduce((acc, v) => acc + Math.pow(v - media, 2), 0);
  const desvioPadrao = Math.sqrt(varianciaSoma / valores.length);

  return {
    media: Math.round(media * 100) / 100,
    mediana,
    moda,
    desvioPadrao: Math.round(desvioPadrao * 100) / 100,
    distribuicao: frequencia
  };
}
