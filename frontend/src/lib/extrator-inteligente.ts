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

export interface Indicador {
  tipo: TipoIndicador;
  valor: number;
  rotulo: string;
  confianca: number; // 0 a 100
  justificativa?: string;
}

export interface CategoriaExtraida {
  nome: string;
  frequencia: number;
  percentual: number;
  sentimento?: 'positivo' | 'neutro' | 'negativo';
  exemplos?: string[];
}

export interface InsightExtraido {
  tipo: 'oportunidade' | 'risco' | 'tendencia' | 'alerta' | 'destaque';
  titulo: string;
  descricao: string;
  impacto: 'baixo' | 'medio' | 'alto' | 'critico';
  acao?: string;
  dados?: Record<string, number | string>;
}

export interface ResultadoExtracaoIA {
  indicadores: Indicador[];
  categorias: CategoriaExtraida[];
  insights: InsightExtraido[];
  resumoExecutivo: {
    conclusaoPrincipal: string;
    pontoChave1: string;
    pontoChave2: string;
    pontoChave3: string;
  };
  dadosGraficos: {
    distribuicaoSentimento: { categoria: string; valor: number; cor: string }[];
    topTemas: { tema: string; frequencia: number; sentimento: number }[];
    indicadoresChave: { nome: string; valor: number; meta?: number; variacao?: number }[];
  };
  totalRespostasAnalisadas: number;
  confiancaGeral: number;
  tempoProcessamentoMs: number;
}

// Sistema de síntese de relatórios
export interface KPISintetizado {
  nome: string;
  valor: number | string;
  unidade?: string;
  variacao?: number;
  status: 'bom' | 'atencao' | 'critico';
  descricao?: string;
}

export interface AlertaSintetizado {
  tipo: 'critico' | 'atencao' | 'info' | 'sucesso';
  titulo: string;
  descricao: string;
  metrica?: { nome: string; valor: number | string };
}

export interface RiscoSintetizado {
  fator: string;
  probabilidade: number; // 0-100
  impacto: number; // 0-100
  score: number; // probabilidade * impacto / 100
  mitigacao?: string;
}

export interface ResultadoSinteseIA {
  scorecard: {
    notaGeral: number; // 0-10
    tendencia: 'subindo' | 'estavel' | 'descendo';
    nivelAlerta: 'verde' | 'amarelo' | 'laranja' | 'vermelho';
    resumoUmaLinha: string;
  };
  kpis: KPISintetizado[];
  alertas: AlertaSintetizado[];
  riscos: RiscoSintetizado[];
  distribuicaoSentimento: { categoria: string; percentual: number; cor: string }[];
  temasPrincipais: { tema: string; mencoes: number; sentimento: 'positivo' | 'neutro' | 'negativo' }[];
  conclusoes: string[];
  recomendacoes: string[];
}

// Prompt para extração de dados
export function gerarPromptExtracao(
  respostas: { texto: string; pergunta: string; eleitor?: { regiao?: string; orientacao?: string; cluster?: string } }[],
  contexto?: { tipoPesquisa?: string; objetivo?: string }
): string {
  const respostasTexto = respostas.map((r, i) =>
    `[R${i + 1}] Pergunta: "${r.pergunta}"\nResposta: "${r.texto}"${r.eleitor ? `\nPerfil: ${r.eleitor.regiao || ''} | ${r.eleitor.orientacao || ''} | ${r.eleitor.cluster || ''}` : ''}`
  ).join('\n\n');

  return `Você é um analista de pesquisa eleitoral especializado em extrair dados quantitativos de respostas qualitativas.

CONTEXTO: ${contexto?.tipoPesquisa || 'Pesquisa Eleitoral'} - ${contexto?.objetivo || 'Análise de opinião pública'}

RESPOSTAS PARA ANÁLISE (${respostas.length} total):
${respostasTexto}

TAREFA: Analise TODAS as respostas e extraia dados estruturados seguindo EXATAMENTE este formato JSON:

{
  "indicadores": [
    {
      "tipo": "sentimento",
      "valor": <número de -100 a +100>,
      "rotulo": "<Muito Negativo|Negativo|Neutro|Positivo|Muito Positivo>",
      "confianca": <0 a 100>,
      "justificativa": "<breve explicação>"
    },
    {
      "tipo": "certeza",
      "valor": <0 a 100>,
      "rotulo": "<Incertos|Divididos|Decididos|Muito Decididos>",
      "confianca": <0 a 100>
    },
    {
      "tipo": "volatilidade",
      "valor": <0 a 100>,
      "rotulo": "<Estável|Moderada|Alta|Muito Alta>",
      "confianca": <0 a 100>
    }
  ],
  "categorias": [
    {
      "nome": "<tema ou categoria identificada>",
      "frequencia": <quantidade de menções>,
      "percentual": <% das respostas>,
      "sentimento": "<positivo|neutro|negativo>"
    }
  ],
  "insights": [
    {
      "tipo": "<oportunidade|risco|tendencia|alerta|destaque>",
      "titulo": "<título curto>",
      "descricao": "<descrição em 1-2 frases>",
      "impacto": "<baixo|medio|alto|critico>",
      "acao": "<ação recomendada>"
    }
  ],
  "resumoExecutivo": {
    "conclusaoPrincipal": "<conclusão principal em 1 frase>",
    "pontoChave1": "<ponto chave 1>",
    "pontoChave2": "<ponto chave 2>",
    "pontoChave3": "<ponto chave 3>"
  },
  "dadosGraficos": {
    "distribuicaoSentimento": [
      {"categoria": "Positivo", "valor": <número>, "cor": "#22c55e"},
      {"categoria": "Neutro", "valor": <número>, "cor": "#94a3b8"},
      {"categoria": "Negativo", "valor": <número>, "cor": "#ef4444"}
    ],
    "topTemas": [
      {"tema": "<tema>", "frequencia": <número>, "sentimento": <-100 a +100>}
    ],
    "indicadoresChave": [
      {"nome": "<indicador>", "valor": <número>, "meta": <número opcional>, "variacao": <número opcional>}
    ]
  }
}

REGRAS IMPORTANTES:
1. Analise TODAS as ${respostas.length} respostas
2. Use números PRECISOS baseados nas respostas reais
3. Identifique padrões e tendências
4. Extraia temas recorrentes
5. Calcule percentuais corretos
6. Responda APENAS com o JSON, sem texto adicional`;
}

// Prompt para síntese de relatórios
export function gerarPromptSintese(
  relatorio: string,
  metadados?: { titulo?: string; dataGeracao?: string; totalEntrevistas?: number }
): string {
  return `Você é um analista executivo especializado em transformar relatórios longos em dashboards visuais e KPIs acionáveis.

RELATÓRIO PARA SÍNTESE:
${relatorio.substring(0, 15000)}${relatorio.length > 15000 ? '...[truncado]' : ''}

METADADOS: ${metadados?.titulo || 'Pesquisa Eleitoral'} | ${metadados?.dataGeracao || new Date().toISOString()} | ${metadados?.totalEntrevistas || 'N/A'} entrevistas

TAREFA: Sintetize este relatório em um dashboard executivo seguindo EXATAMENTE este formato JSON:

{
  "scorecard": {
    "notaGeral": <0 a 10, média ponderada do desempenho>,
    "tendencia": "<subindo|estavel|descendo>",
    "nivelAlerta": "<verde|amarelo|laranja|vermelho>",
    "resumoUmaLinha": "<resumo executivo em UMA linha>"
  },
  "kpis": [
    {
      "nome": "<nome do KPI>",
      "valor": <número ou texto>,
      "unidade": "<% | pontos | etc>",
      "variacao": <número opcional, variação percentual>,
      "status": "<bom|atencao|critico>",
      "descricao": "<explicação curta>"
    }
  ],
  "alertas": [
    {
      "tipo": "<critico|atencao|info|sucesso>",
      "titulo": "<título do alerta>",
      "descricao": "<descrição curta>",
      "metrica": {"nome": "<nome>", "valor": <valor>}
    }
  ],
  "riscos": [
    {
      "fator": "<fator de risco>",
      "probabilidade": <0 a 100>,
      "impacto": <0 a 100>,
      "score": <probabilidade * impacto / 100>,
      "mitigacao": "<como mitigar>"
    }
  ],
  "distribuicaoSentimento": [
    {"categoria": "Favorável", "percentual": <número>, "cor": "#22c55e"},
    {"categoria": "Neutro", "percentual": <número>, "cor": "#f59e0b"},
    {"categoria": "Desfavorável", "percentual": <número>, "cor": "#ef4444"}
  ],
  "temasPrincipais": [
    {"tema": "<tema>", "mencoes": <número>, "sentimento": "<positivo|neutro|negativo>"}
  ],
  "conclusoes": [
    "<conclusão 1>",
    "<conclusão 2>",
    "<conclusão 3>"
  ],
  "recomendacoes": [
    "<recomendação 1>",
    "<recomendação 2>",
    "<recomendação 3>"
  ]
}

REGRAS:
1. Extraia NÚMEROS CONCRETOS do relatório
2. Transforme texto em métricas quantitativas
3. Identifique riscos e oportunidades
4. Priorize informações acionáveis
5. Use cores semânticas (verde=bom, amarelo=atenção, vermelho=crítico)
6. Responda APENAS com o JSON, sem texto adicional`;
}

// Parser da resposta da IA
export function parsearRespostaExtracaoIA(resposta: string): ResultadoExtracaoIA | null {
  try {
    // Tentar extrair JSON da resposta
    const jsonMatch = resposta.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const dados = JSON.parse(jsonMatch[0]);

    // Validar estrutura básica
    if (!dados.indicadores || !Array.isArray(dados.indicadores)) {
      return null;
    }

    return {
      indicadores: dados.indicadores || [],
      categorias: dados.categorias || [],
      insights: dados.insights || [],
      resumoExecutivo: dados.resumoExecutivo || {
        conclusaoPrincipal: 'Análise em processamento',
        pontoChave1: '',
        pontoChave2: '',
        pontoChave3: ''
      },
      dadosGraficos: dados.dadosGraficos || {
        distribuicaoSentimento: [],
        topTemas: [],
        indicadoresChave: []
      },
      totalRespostasAnalisadas: dados.totalRespostasAnalisadas || 0,
      confiancaGeral: dados.confiancaGeral || 70,
      tempoProcessamentoMs: 0
    };
  } catch (error) {
    console.error('Erro ao parsear resposta de extração:', error);
    return null;
  }
}

export function parsearRespostaSinteseIA(resposta: string): ResultadoSinteseIA | null {
  try {
    const jsonMatch = resposta.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const dados = JSON.parse(jsonMatch[0]);

    if (!dados.scorecard) return null;

    return {
      scorecard: dados.scorecard,
      kpis: dados.kpis || [],
      alertas: dados.alertas || [],
      riscos: dados.riscos || [],
      distribuicaoSentimento: dados.distribuicaoSentimento || [],
      temasPrincipais: dados.temasPrincipais || [],
      conclusoes: dados.conclusoes || [],
      recomendacoes: dados.recomendacoes || []
    };
  } catch (error) {
    console.error('Erro ao parsear resposta de síntese:', error);
    return null;
  }
}

// Funções de extração local (sem IA, para fallback)
export function calcularIndicadoresLocalmente(
  respostas: { texto: string; pergunta: string }[]
): ResultadoExtracaoIA {
  const inicio = Date.now();

  // Palavras-chave para análise de sentimento
  const palavrasPositivas = ['bom', 'ótimo', 'excelente', 'concordo', 'sim', 'apoio', 'favor', 'melhor', 'gosto', 'aprovo'];
  const palavrasNegativas = ['ruim', 'péssimo', 'não', 'discordo', 'contra', 'pior', 'rejeito', 'nunca', 'jamais', 'medo'];

  let sentimentoTotal = 0;
  let positivos = 0;
  let negativos = 0;
  let neutros = 0;

  respostas.forEach(r => {
    const texto = r.texto.toLowerCase();
    const posScore = palavrasPositivas.filter(p => texto.includes(p)).length;
    const negScore = palavrasNegativas.filter(p => texto.includes(p)).length;

    if (posScore > negScore) {
      positivos++;
      sentimentoTotal += 50;
    } else if (negScore > posScore) {
      negativos++;
      sentimentoTotal -= 50;
    } else {
      neutros++;
    }
  });

  const total = respostas.length || 1;

  return {
    indicadores: [
      {
        tipo: 'sentimento',
        valor: Math.round(sentimentoTotal / total),
        rotulo: sentimentoTotal > 20 ? 'Positivo' : sentimentoTotal < -20 ? 'Negativo' : 'Neutro',
        confianca: 60,
        justificativa: 'Calculado por análise de palavras-chave'
      }
    ],
    categorias: [],
    insights: [],
    resumoExecutivo: {
      conclusaoPrincipal: 'Análise realizada localmente sem IA',
      pontoChave1: `${respostas.length} respostas processadas`,
      pontoChave2: 'Análise por palavras-chave',
      pontoChave3: 'Para análise mais profunda, habilite IA'
    },
    dadosGraficos: {
      distribuicaoSentimento: [
        { categoria: 'Positivo', valor: Math.round(positivos / total * 100), cor: '#22c55e' },
        { categoria: 'Neutro', valor: Math.round(neutros / total * 100), cor: '#94a3b8' },
        { categoria: 'Negativo', valor: Math.round(negativos / total * 100), cor: '#ef4444' }
      ],
      topTemas: [],
      indicadoresChave: []
    },
    totalRespostasAnalisadas: respostas.length,
    confiancaGeral: 50,
    tempoProcessamentoMs: Date.now() - inicio
  };
}
