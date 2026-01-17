/**
 * Extrator Inteligente de Dados
 *
 * Sistema que usa IA para extrair informações quantitativas e estruturadas
 * de respostas textuais longas, transformando em dados para visualização.
 */

// Tipos de indicadores que podem ser extraídos
export type TipoIndicador =
  | 'sentimento'      // -100 a +100
  | 'certeza'         // 0 a 100%
  | 'intensidade'     // 0 a 10
  | 'risco'           // baixo, médio, alto, crítico
  | 'prioridade'      // 1 a 5
  | 'probabilidade'   // 0 a 100%
  | 'satisfacao'      // 0 a 10
  | 'engajamento'     // 0 a 100
  | 'polarizacao'     // 0 a 100
  | 'volatilidade';   // 0 a 100

export interface IndicadorExtraido {
  tipo: TipoIndicador;
  valor: number;
  rotulo: string;
  confianca: number; // 0-1
  justificativa: string;
}

export interface CategoriaExtraida {
  nome: string;
  frequencia: number;
  percentual: number;
  sentimento: number; // -1 a 1
  palavrasChave: string[];
  exemplos: string[];
}

export interface InsightExtraido {
  tipo: 'descoberta' | 'alerta' | 'oportunidade' | 'risco' | 'tendencia';
  titulo: string;
  descricao: string;
  relevancia: 'alta' | 'media' | 'baixa';
  acaoSugerida: string;
  dadosSuporteQuantitativo: {
    metrica: string;
    valor: number | string;
    comparacao?: string;
  }[];
}

export interface ResultadoExtracaoIA {
  // Indicadores principais (números para dashboards)
  indicadores: IndicadorExtraido[];

  // Categorização automática das respostas
  categorias: CategoriaExtraida[];

  // Insights acionáveis
  insights: InsightExtraido[];

  // Resumo executivo
  resumoExecutivo: {
    conclusaoPrincipal: string;
    pontoChave1: string;
    pontoChave2: string;
    pontoChave3: string;
    alertaCritico?: string;
  };

  // Dados para gráficos específicos
  dadosGraficos: {
    distribuicaoSentimento: { categoria: string; valor: number; cor: string }[];
    topTemas: { tema: string; frequencia: number; sentimento: number }[];
    indicadoresChave: { nome: string; valor: number; meta?: number; status: 'bom' | 'atencao' | 'critico' }[];
    evolucaoTemporal?: { periodo: string; valor: number }[];
  };

  // Metadados
  totalRespostasAnalisadas: number;
  confiancaGeral: number;
  tempoProcessamentoMs: number;
}

// Prompt para extração de dados estruturados
export function gerarPromptExtracao(
  respostas: { texto: string; pergunta: string; eleitor?: { regiao?: string; orientacao?: string } }[],
  contexto: { tipoPesquisa: string; objetivo: string }
): string {
  const respostasFormatadas = respostas.slice(0, 50).map((r, i) =>
    `[${i + 1}] Pergunta: "${r.pergunta}"\nResposta: "${r.texto.substring(0, 500)}${r.texto.length > 500 ? '...' : ''}"\nPerfil: ${r.eleitor?.regiao || 'N/A'} | ${r.eleitor?.orientacao || 'N/A'}`
  ).join('\n\n');

  return `Você é um analista de dados especializado em pesquisas eleitorais. Analise as respostas abaixo e extraia DADOS QUANTITATIVOS e ESTRUTURADOS.

CONTEXTO DA PESQUISA:
- Tipo: ${contexto.tipoPesquisa}
- Objetivo: ${contexto.objetivo}

RESPOSTAS A ANALISAR (${respostas.length} total, mostrando ${Math.min(50, respostas.length)}):
${respostasFormatadas}

TAREFA: Extraia e retorne um JSON com a seguinte estrutura:

{
  "indicadores": [
    {
      "tipo": "sentimento",
      "valor": <número de -100 a +100, onde -100 é muito negativo e +100 muito positivo>,
      "rotulo": "<rótulo descritivo>",
      "confianca": <0 a 1>,
      "justificativa": "<breve explicação>"
    },
    {
      "tipo": "certeza",
      "valor": <0 a 100, percentual de respostas com posição definida>,
      "rotulo": "<ex: Eleitores Decididos>",
      "confianca": <0 a 1>,
      "justificativa": "<breve>"
    },
    {
      "tipo": "risco",
      "valor": <1=baixo, 2=médio, 3=alto, 4=crítico>,
      "rotulo": "<descrição do risco principal>",
      "confianca": <0 a 1>,
      "justificativa": "<breve>"
    },
    {
      "tipo": "volatilidade",
      "valor": <0 a 100, quão instável está o eleitorado>,
      "rotulo": "<ex: Volatilidade Alta>",
      "confianca": <0 a 1>,
      "justificativa": "<breve>"
    }
  ],

  "categorias": [
    {
      "nome": "<categoria principal identificada>",
      "frequencia": <número de menções>,
      "percentual": <0-100>,
      "sentimento": <-1 a 1>,
      "palavrasChave": ["palavra1", "palavra2"],
      "exemplos": ["trecho de resposta exemplo"]
    }
  ],

  "insights": [
    {
      "tipo": "descoberta|alerta|oportunidade|risco|tendencia",
      "titulo": "<título curto e impactante>",
      "descricao": "<2-3 frases explicando>",
      "relevancia": "alta|media|baixa",
      "acaoSugerida": "<o que fazer com esta informação>",
      "dadosSuporteQuantitativo": [
        {"metrica": "nome", "valor": 123, "comparacao": "vs X"}
      ]
    }
  ],

  "resumoExecutivo": {
    "conclusaoPrincipal": "<1 frase com a conclusão mais importante>",
    "pontoChave1": "<ponto crucial 1>",
    "pontoChave2": "<ponto crucial 2>",
    "pontoChave3": "<ponto crucial 3>",
    "alertaCritico": "<se houver algo urgente a reportar>"
  },

  "dadosGraficos": {
    "distribuicaoSentimento": [
      {"categoria": "Positivo", "valor": <percentual>, "cor": "#22c55e"},
      {"categoria": "Neutro", "valor": <percentual>, "cor": "#94a3b8"},
      {"categoria": "Negativo", "valor": <percentual>, "cor": "#ef4444"}
    ],
    "topTemas": [
      {"tema": "<tema>", "frequencia": <número>, "sentimento": <-1 a 1>}
    ],
    "indicadoresChave": [
      {"nome": "Taxa de Decisão", "valor": <0-100>, "meta": 70, "status": "bom|atencao|critico"},
      {"nome": "Satisfação Geral", "valor": <0-10>, "meta": 6, "status": "bom|atencao|critico"},
      {"nome": "Intenção de Mudança", "valor": <0-100>, "status": "bom|atencao|critico"}
    ]
  },

  "totalRespostasAnalisadas": ${respostas.length},
  "confiancaGeral": <0 a 1, sua confiança na análise>
}

REGRAS CRÍTICAS:
1. TODOS os valores numéricos devem estar dentro dos ranges especificados
2. Use APENAS dados das respostas, não invente
3. Se não houver dados suficientes, use confiança baixa
4. Priorize INSIGHTS ACIONÁVEIS, não descrições genéricas
5. O resumoExecutivo deve ser DIRETO e ÚTIL para decisões

Retorne APENAS o JSON, sem texto adicional.`;
}

// Prompt para síntese de relatório existente
export function gerarPromptSintese(
  relatorioCompleto: string,
  metadados: { titulo: string; dataGeracao: string; totalEntrevistas: number }
): string {
  return `Você é um analista político sênior. Sintetize este relatório em INDICADORES VISUAIS e DADOS QUANTITATIVOS.

RELATÓRIO A SINTETIZAR:
Título: ${metadados.titulo}
Data: ${metadados.dataGeracao}
Total de Entrevistas: ${metadados.totalEntrevistas}

CONTEÚDO:
${relatorioCompleto.substring(0, 15000)}${relatorioCompleto.length > 15000 ? '\n[...TRUNCADO...]' : ''}

TAREFA: Transforme TODA informação possível em números e indicadores visuais.

Retorne um JSON com:

{
  "scorecardExecutivo": {
    "notaGeral": <0-10>,
    "tendencia": "subindo|estavel|caindo",
    "nivelAlerta": "verde|amarelo|vermelho",
    "mensagemChave": "<1 frase impactante>"
  },

  "kpis": [
    {
      "nome": "<nome do KPI>",
      "valor": <número>,
      "unidade": "%" | "pontos" | "índice",
      "variacao": <número positivo ou negativo>,
      "meta": <número opcional>,
      "status": "acima|dentro|abaixo",
      "icone": "trending-up|trending-down|minus|alert|check"
    }
  ],

  "alertas": [
    {
      "tipo": "critico|atencao|info",
      "titulo": "<título curto>",
      "descricao": "<1-2 frases>",
      "metricaAssociada": {"nome": "X", "valor": Y}
    }
  ],

  "matrizRisco": [
    {
      "fator": "<fator de risco>",
      "probabilidade": <1-5>,
      "impacto": <1-5>,
      "scoreRisco": <1-25>,
      "mitigacao": "<sugestão>"
    }
  ],

  "comparativos": [
    {
      "dimensao": "<ex: Por Região>",
      "dados": [
        {"grupo": "<nome>", "valor": <número>, "destaque": true|false}
      ]
    }
  ],

  "conclusoes": {
    "principal": "<conclusão principal em 1 frase>",
    "secundarias": ["<conclusão 2>", "<conclusão 3>"],
    "recomendacoes": ["<ação 1>", "<ação 2>", "<ação 3>"],
    "proximosPassos": ["<passo 1>", "<passo 2>"]
  },

  "metricasDerivadas": [
    {
      "nome": "<métrica calculada>",
      "formula": "<como foi calculada>",
      "valor": <número>,
      "interpretacao": "<o que significa>"
    }
  ]
}

REGRAS:
1. MAXIMIZE a conversão de texto em números
2. Todo achado deve ter um NÚMERO associado
3. Use cores/status para facilitar visualização rápida
4. Priorize o que é ACIONÁVEL
5. Seja OBJETIVO e DIRETO

Retorne APENAS o JSON.`;
}

// Parser de resposta da IA
export function parsearRespostaExtracaoIA(resposta: string): ResultadoExtracaoIA | null {
  try {
    // Tentar extrair JSON da resposta
    const jsonMatch = resposta.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const dados = JSON.parse(jsonMatch[0]);

    // Validar estrutura mínima
    if (!dados.indicadores || !dados.resumoExecutivo) {
      console.error('Estrutura inválida na resposta da IA');
      return null;
    }

    return {
      indicadores: dados.indicadores || [],
      categorias: dados.categorias || [],
      insights: dados.insights || [],
      resumoExecutivo: dados.resumoExecutivo,
      dadosGraficos: dados.dadosGraficos || {
        distribuicaoSentimento: [],
        topTemas: [],
        indicadoresChave: [],
      },
      totalRespostasAnalisadas: dados.totalRespostasAnalisadas || 0,
      confiancaGeral: dados.confiancaGeral || 0.5,
      tempoProcessamentoMs: 0,
    };
  } catch (error) {
    console.error('Erro ao parsear resposta de extração:', error);
    return null;
  }
}

// Tipos para síntese
export interface ResultadoSinteseIA {
  scorecardExecutivo: {
    notaGeral: number;
    tendencia: 'subindo' | 'estavel' | 'caindo';
    nivelAlerta: 'verde' | 'amarelo' | 'vermelho';
    mensagemChave: string;
  };

  kpis: {
    nome: string;
    valor: number;
    unidade: string;
    variacao?: number;
    meta?: number;
    status: 'acima' | 'dentro' | 'abaixo';
    icone: string;
  }[];

  alertas: {
    tipo: 'critico' | 'atencao' | 'info';
    titulo: string;
    descricao: string;
    metricaAssociada?: { nome: string; valor: number };
  }[];

  matrizRisco: {
    fator: string;
    probabilidade: number;
    impacto: number;
    scoreRisco: number;
    mitigacao: string;
  }[];

  comparativos: {
    dimensao: string;
    dados: { grupo: string; valor: number; destaque: boolean }[];
  }[];

  conclusoes: {
    principal: string;
    secundarias: string[];
    recomendacoes: string[];
    proximosPassos: string[];
  };

  metricasDerivadas: {
    nome: string;
    formula: string;
    valor: number;
    interpretacao: string;
  }[];
}

export function parsearRespostaSinteseIA(resposta: string): ResultadoSinteseIA | null {
  try {
    const jsonMatch = resposta.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const dados = JSON.parse(jsonMatch[0]);

    if (!dados.scorecardExecutivo || !dados.conclusoes) {
      return null;
    }

    return dados as ResultadoSinteseIA;
  } catch (error) {
    console.error('Erro ao parsear síntese:', error);
    return null;
  }
}

// Função para calcular indicadores localmente (fallback sem IA)
export function calcularIndicadoresLocalmente(
  respostas: { texto: string; sentimento?: string; valor?: number }[]
): Partial<ResultadoExtracaoIA> {
  const total = respostas.length;
  if (total === 0) {
    return {
      indicadores: [],
      categorias: [],
      insights: [],
    };
  }

  // Análise de sentimento básica por palavras-chave
  const palavrasPositivas = ['bom', 'ótimo', 'excelente', 'concordo', 'apoio', 'sim', 'favorável', 'aprovado'];
  const palavrasNegativas = ['ruim', 'péssimo', 'discordo', 'não', 'contra', 'rejeito', 'reprovado', 'medo'];

  let positivos = 0;
  let negativos = 0;
  let neutros = 0;

  respostas.forEach(r => {
    const texto = r.texto.toLowerCase();
    const temPositivo = palavrasPositivas.some(p => texto.includes(p));
    const temNegativo = palavrasNegativas.some(p => texto.includes(p));

    if (temPositivo && !temNegativo) positivos++;
    else if (temNegativo && !temPositivo) negativos++;
    else neutros++;
  });

  const sentimentoMedio = ((positivos - negativos) / total) * 100;

  return {
    indicadores: [
      {
        tipo: 'sentimento',
        valor: Math.round(sentimentoMedio),
        rotulo: sentimentoMedio > 20 ? 'Positivo' : sentimentoMedio < -20 ? 'Negativo' : 'Neutro',
        confianca: 0.6,
        justificativa: 'Calculado por análise de palavras-chave',
      },
    ],
    dadosGraficos: {
      distribuicaoSentimento: [
        { categoria: 'Positivo', valor: Math.round((positivos / total) * 100), cor: '#22c55e' },
        { categoria: 'Neutro', valor: Math.round((neutros / total) * 100), cor: '#94a3b8' },
        { categoria: 'Negativo', valor: Math.round((negativos / total) * 100), cor: '#ef4444' },
      ],
      topTemas: [],
      indicadoresChave: [],
    },
    totalRespostasAnalisadas: total,
    confiancaGeral: 0.5,
    tempoProcessamentoMs: 10,
  };
}
