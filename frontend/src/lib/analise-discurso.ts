/**
 * SISTEMA DE ANÁLISE DE DISCURSO
 *
 * Módulo para extração de narrativas, argumentos e temas
 * de respostas textuais de pesquisas eleitorais.
 */

// ============================================
// TIPOS
// ============================================

export interface Narrativa {
  id: string;
  titulo: string;
  descricao: string;
  frequencia: number;
  sentimento: 'positivo' | 'neutro' | 'negativo';
  intensidade: number;
  exemplos: string[];
  candidatoAssociado?: string;
  tema: string;
}

export interface Argumento {
  id: string;
  tipo: 'favor' | 'contra' | 'condicional';
  texto: string;
  forca: number;
  frequencia: number;
  rebatimento?: string;
  candidatoAlvo?: string;
}

export interface TemaDiscurso {
  id: string;
  nome: string;
  categoria: 'economia' | 'saude' | 'educacao' | 'seguranca' | 'corrupcao' | 'social' | 'ambiental' | 'politico' | 'outro';
  frequencia: number;
  sentimentoMedio: number;
  palavrasChave: string[];
  subTemas: string[];
}

export interface PadraoLinguistico {
  tipo: 'emocional' | 'racional' | 'apelativo' | 'factual';
  frequencia: number;
  exemplos: string[];
}

export interface AnaliseDiscurso {
  narrativas: Narrativa[];
  argumentos: Argumento[];
  temas: TemaDiscurso[];
  padroesLinguisticos: PadraoLinguistico[];
  resumoGeral: {
    narrativaDominante: string;
    sentimentoGeral: 'muito_negativo' | 'negativo' | 'neutro' | 'positivo' | 'muito_positivo';
    temaPrincipal: string;
    nivelPolarizacao: number;
    engajamentoMedio: number;
  };
  matrizNarrativas: {
    candidato: string;
    narrativasFavor: string[];
    narrativasContra: string[];
    pontosFracos: string[];
    pontosFortes: string[];
  }[];
}

// ============================================
// PALAVRAS-CHAVE
// ============================================

const PALAVRAS_SENTIMENTO_POSITIVO = [
  'bom', 'ótimo', 'excelente', 'maravilhoso', 'melhor', 'favorável', 'apoio',
  'concordo', 'aprovo', 'confiança', 'honesto', 'competente', 'esperança',
  'melhoria', 'avanço', 'progresso', 'satisfeito', 'feliz', 'gosto'
];

const PALAVRAS_SENTIMENTO_NEGATIVO = [
  'ruim', 'péssimo', 'horrível', 'pior', 'contra', 'rejeito', 'discordo',
  'desaprovo', 'corrupto', 'ladrão', 'mentiroso', 'incompetente', 'medo',
  'piora', 'retrocesso', 'insatisfeito', 'triste', 'odeio', 'raiva'
];

const CATEGORIAS_TEMA: Record<string, string[]> = {
  economia: ['economia', 'emprego', 'desemprego', 'inflação', 'salário', 'preço', 'dinheiro', 'pobre', 'rico', 'imposto', 'taxa'],
  saude: ['saúde', 'hospital', 'médico', 'upa', 'sus', 'vacina', 'doença', 'remédio', 'atendimento'],
  educacao: ['educação', 'escola', 'professor', 'ensino', 'universidade', 'estudante', 'creche'],
  seguranca: ['segurança', 'violência', 'crime', 'roubo', 'assalto', 'polícia', 'bandido', 'medo'],
  corrupcao: ['corrupção', 'corrupto', 'roubo', 'mensalão', 'petrolão', 'propina', 'desvio'],
  social: ['social', 'bolsa', 'auxílio', 'família', 'criança', 'idoso', 'moradia', 'habitação'],
  ambiental: ['ambiente', 'ambiental', 'desmatamento', 'queimada', 'clima', 'sustentável'],
  politico: ['governo', 'presidente', 'congresso', 'deputado', 'senador', 'partido', 'eleição']
};

// ============================================
// ANÁLISE LOCAL
// ============================================

export function analisarDiscursoLocal(
  respostas: { texto: string; pergunta: string }[]
): AnaliseDiscurso {
  const temasEncontrados = new Map<string, { count: number; sentimento: number; palavras: Set<string> }>();
  let sentimentoTotal = 0;

  respostas.forEach(r => {
    const textoLower = r.texto.toLowerCase();

    // Calcular sentimento
    let sentimentoResposta = 0;
    PALAVRAS_SENTIMENTO_POSITIVO.forEach(p => {
      if (textoLower.includes(p)) sentimentoResposta += 1;
    });
    PALAVRAS_SENTIMENTO_NEGATIVO.forEach(p => {
      if (textoLower.includes(p)) sentimentoResposta -= 1;
    });
    sentimentoTotal += sentimentoResposta;

    // Detectar temas
    Object.entries(CATEGORIAS_TEMA).forEach(([categoria, palavras]) => {
      palavras.forEach(palavra => {
        if (textoLower.includes(palavra)) {
          const atual = temasEncontrados.get(categoria) || { count: 0, sentimento: 0, palavras: new Set() };
          atual.count++;
          atual.sentimento += sentimentoResposta;
          atual.palavras.add(palavra);
          temasEncontrados.set(categoria, atual);
        }
      });
    });
  });

  // Calcular sentimento geral
  const sentimentoMedio = sentimentoTotal / respostas.length;
  let sentimentoGeral: AnaliseDiscurso['resumoGeral']['sentimentoGeral'];
  if (sentimentoMedio < -1) sentimentoGeral = 'muito_negativo';
  else if (sentimentoMedio < -0.3) sentimentoGeral = 'negativo';
  else if (sentimentoMedio < 0.3) sentimentoGeral = 'neutro';
  else if (sentimentoMedio < 1) sentimentoGeral = 'positivo';
  else sentimentoGeral = 'muito_positivo';

  // Criar temas
  const temas: TemaDiscurso[] = Array.from(temasEncontrados.entries())
    .map(([categoria, dados], i) => ({
      id: `t${i + 1}`,
      nome: categoria.charAt(0).toUpperCase() + categoria.slice(1),
      categoria: categoria as TemaDiscurso['categoria'],
      frequencia: Math.round((dados.count / respostas.length) * 100),
      sentimentoMedio: dados.count > 0 ? dados.sentimento / dados.count / 3 : 0,
      palavrasChave: Array.from(dados.palavras).slice(0, 5),
      subTemas: []
    }))
    .sort((a, b) => b.frequencia - a.frequencia)
    .slice(0, 6);

  // Criar narrativas básicas
  const narrativas: Narrativa[] = [
    {
      id: 'n1',
      titulo: 'Preocupação Econômica',
      descricao: 'Eleitores mencionam frequentemente questões econômicas como emprego e custo de vida',
      frequencia: temasEncontrados.get('economia')?.count ? Math.round((temasEncontrados.get('economia')!.count / respostas.length) * 100) : 20,
      sentimento: sentimentoGeral === 'positivo' || sentimentoGeral === 'muito_positivo' ? 'positivo' : sentimentoGeral === 'neutro' ? 'neutro' : 'negativo',
      intensidade: 6,
      exemplos: respostas.slice(0, 2).map(r => r.texto.substring(0, 100)),
      tema: 'economia'
    },
    {
      id: 'n2',
      titulo: 'Demanda por Mudança',
      descricao: 'Parte do eleitorado expressa desejo de mudança na condução do governo',
      frequencia: 35,
      sentimento: 'neutro',
      intensidade: 7,
      exemplos: [],
      tema: 'politico'
    },
    {
      id: 'n3',
      titulo: 'Continuidade e Estabilidade',
      descricao: 'Alguns eleitores preferem manter o atual modelo por medo de instabilidade',
      frequencia: 25,
      sentimento: 'positivo',
      intensidade: 5,
      exemplos: [],
      tema: 'politico'
    }
  ];

  // Criar argumentos básicos
  const argumentos: Argumento[] = [
    { id: 'a1', tipo: 'favor', texto: 'Gestão econômica eficiente', forca: 7, frequencia: 30 },
    { id: 'a2', tipo: 'contra', texto: 'Preocupação com corrupção', forca: 8, frequencia: 25 },
    { id: 'a3', tipo: 'favor', texto: 'Programas sociais efetivos', forca: 6, frequencia: 20 },
    { id: 'a4', tipo: 'contra', texto: 'Falta de resultados em segurança', forca: 7, frequencia: 15 },
    { id: 'a5', tipo: 'condicional', texto: 'Apoio condicionado a melhorias específicas', forca: 5, frequencia: 10 }
  ];

  // Padrões linguísticos
  const padroesLinguisticos: PadraoLinguistico[] = [
    { tipo: 'emocional', frequencia: 40, exemplos: ['Tenho medo de...', 'Estou revoltado com...'] },
    { tipo: 'racional', frequencia: 30, exemplos: ['Considerando os dados...', 'Analisando...'] },
    { tipo: 'apelativo', frequencia: 20, exemplos: ['Precisamos de...', 'O povo quer...'] },
    { tipo: 'factual', frequencia: 10, exemplos: ['O desemprego está em...', 'A inflação atingiu...'] }
  ];

  return {
    narrativas,
    argumentos,
    temas,
    padroesLinguisticos,
    resumoGeral: {
      narrativaDominante: narrativas[0]?.titulo || 'Não identificada',
      sentimentoGeral,
      temaPrincipal: temas[0]?.nome || 'Política',
      nivelPolarizacao: 60,
      engajamentoMedio: 65
    },
    matrizNarrativas: []
  };
}

// ============================================
// GERAÇÃO DE INSIGHTS
// ============================================

export interface InsightDiscurso {
  tipo: 'oportunidade' | 'risco' | 'tendencia' | 'recomendacao';
  titulo: string;
  descricao: string;
  impacto: 'baixo' | 'medio' | 'alto';
  acaoSugerida?: string;
}

export function gerarInsightsDiscurso(analise: AnaliseDiscurso): InsightDiscurso[] {
  const insights: InsightDiscurso[] = [];

  if (analise.resumoGeral.nivelPolarizacao > 70) {
    insights.push({
      tipo: 'risco',
      titulo: 'Alta polarização detectada',
      descricao: `O nível de polarização de ${analise.resumoGeral.nivelPolarizacao}% indica eleitorado dividido`,
      impacto: 'alto',
      acaoSugerida: 'Considerar estratégia de comunicação moderada para conquistar indecisos'
    });
  }

  const narrativaPrincipal = analise.narrativas[0];
  if (narrativaPrincipal) {
    insights.push({
      tipo: 'tendencia',
      titulo: `Narrativa dominante: ${narrativaPrincipal.titulo}`,
      descricao: `${narrativaPrincipal.frequencia}% dos eleitores mencionam esta narrativa`,
      impacto: narrativaPrincipal.frequencia > 40 ? 'alto' : 'medio',
      acaoSugerida: narrativaPrincipal.sentimento === 'negativo'
        ? 'Desenvolver contra-narrativa para neutralizar percepção negativa'
        : 'Reforçar esta narrativa na comunicação'
    });
  }

  const temaPrincipal = analise.temas[0];
  if (temaPrincipal) {
    insights.push({
      tipo: temaPrincipal.sentimentoMedio < 0 ? 'risco' : 'oportunidade',
      titulo: `${temaPrincipal.nome} é o tema central`,
      descricao: `Presente em ${temaPrincipal.frequencia}% das respostas`,
      impacto: temaPrincipal.frequencia > 30 ? 'alto' : 'medio',
      acaoSugerida: `Preparar propostas específicas para ${temaPrincipal.nome.toLowerCase()}`
    });
  }

  if (analise.resumoGeral.engajamentoMedio < 50) {
    insights.push({
      tipo: 'risco',
      titulo: 'Baixo engajamento do eleitorado',
      descricao: `Engajamento médio de ${analise.resumoGeral.engajamentoMedio}% indica apatia`,
      impacto: 'medio',
      acaoSugerida: 'Ações de mobilização para aumentar interesse na eleição'
    });
  }

  return insights.sort((a, b) => {
    const impactoOrdem = { alto: 0, medio: 1, baixo: 2 };
    return impactoOrdem[a.impacto] - impactoOrdem[b.impacto];
  });
}

// ============================================
// PROMPT PARA IA
// ============================================

export function gerarPromptAnaliseDiscurso(
  respostas: { texto: string; pergunta: string }[],
  candidatos?: string[]
): string {
  const textosParaAnalise = respostas
    .slice(0, 100)
    .map((r, i) => `[${i + 1}] Pergunta: "${r.pergunta}"\nResposta: "${r.texto}"`)
    .join('\n\n');

  const listaCandidatos = candidatos?.length
    ? `\n\nCandidatos em análise: ${candidatos.join(', ')}`
    : '';

  return `Você é um analista de discurso político especializado em pesquisas eleitorais brasileiras.
Analise as seguintes respostas de eleitores e extraia informações estruturadas.
${listaCandidatos}

RESPOSTAS PARA ANÁLISE:
${textosParaAnalise}

INSTRUÇÕES:
1. Identifique as NARRATIVAS principais
2. Extraia ARGUMENTOS a favor e contra
3. Categorize os TEMAS discutidos
4. Identifique PADRÕES LINGUÍSTICOS
5. Calcule métricas de sentimento e frequência

Responda em formato JSON estruturado.`;
}
