// ============================================
// TIPOS PRINCIPAIS DO SISTEMA
// ============================================

// Tipos básicos de enumeração
export type Genero = 'masculino' | 'feminino';

export type ClusterSocioeconomico = 'G1_alta' | 'G2_media_alta' | 'G3_media_baixa' | 'G4_baixa';

export type OrientacaoPolitica = 'esquerda' | 'centro-esquerda' | 'centro' | 'centro-direita' | 'direita';

export type PosicaoBolsonaro = 'apoiador_forte' | 'apoiador_moderado' | 'neutro' | 'critico_moderado' | 'critico_forte';

export type InteressePolitico = 'baixo' | 'medio' | 'alto';

export type ToleranciaNuance = 'baixa' | 'media' | 'alta';

export type EstiloDecisao = 'identitario' | 'pragmatico' | 'moral' | 'economico' | 'emocional';

export type OcupacaoVinculo = 'clt' | 'servidor_publico' | 'autonomo' | 'empresario' | 'informal' | 'desempregado' | 'aposentado' | 'estudante';

export type ImpactoEmocional = 'baixo' | 'medio' | 'alto' | 'muito_alto';

export type TemaMemoria = 'educacao' | 'saude' | 'seguranca' | 'economia' | 'politica' | 'familia' | 'trabalho' | 'religiao' | 'outro';

// ============================================
// ELEITOR
// ============================================

export interface Eleitor {
  id: string;
  nome: string;
  idade: number;
  genero: Genero;
  cor_raca: string;
  regiao_administrativa: string;
  local_referencia?: string;
  cluster_socioeconomico: ClusterSocioeconomico;
  escolaridade: string;
  profissao: string;
  ocupacao_vinculo: OcupacaoVinculo;
  renda_salarios_minimos: string;
  religiao: string;
  estado_civil: string;
  filhos: number;
  orientacao_politica: OrientacaoPolitica;
  posicao_bolsonaro: PosicaoBolsonaro;
  interesse_politico: InteressePolitico;
  tolerancia_nuance?: ToleranciaNuance;
  estilo_decisao?: EstiloDecisao;
  valores: string[];
  preocupacoes: string[];
  medos?: string[];
  fontes_informacao?: string[];
  vieses_cognitivos?: string[];
  susceptibilidade_desinformacao?: number;
  meio_transporte?: string;
  tempo_deslocamento_trabalho?: string;
  voto_facultativo?: boolean;
  conflito_identitario?: boolean;
  historia_resumida: string;
  instrucao_comportamental?: string;
  observacao_territorial?: string;
  avatar_url?: string;
  memorias?: Memoria[];
  criado_em: string;
  atualizado_em: string;
}

export interface EleitorResumo {
  id: string;
  nome: string;
  idade: number;
  genero: Genero;
  regiao_administrativa: string;
  cluster_socioeconomico: ClusterSocioeconomico;
  profissao: string;
  orientacao_politica: OrientacaoPolitica;
  religiao: string;
  avatar_url?: string;
}

export interface FiltrosEleitor {
  pagina?: number;
  por_pagina?: number;
  busca?: string;
  generos?: Genero[];
  clusters?: ClusterSocioeconomico[];
  regioes?: string[];
  faixas_etarias?: string[];
  religioes?: string[];
  orientacoes_politicas?: OrientacaoPolitica[];
  posicoes_bolsonaro?: PosicaoBolsonaro[];
  escolaridades?: string[];
  profissoes?: string[];
  ocupacoes_vinculos?: OcupacaoVinculo[];
  valores?: string[];
  preocupacoes?: string[];
  ordenar_por?: string;
  ordem?: 'asc' | 'desc';
}

// ============================================
// MEMÓRIA
// ============================================

export interface Memoria {
  id: string;
  eleitor_id: string;
  data: string;
  evento: string;
  impacto_emocional: ImpactoEmocional;
  tema: TemaMemoria;
  criado_em: string;
  atualizado_em: string;
}

export interface CriarMemoriaDTO {
  eleitor_id: string;
  data: string;
  evento: string;
  impacto_emocional: ImpactoEmocional;
  tema: TemaMemoria;
}

export interface AtualizarMemoriaDTO {
  data?: string;
  evento?: string;
  impacto_emocional?: ImpactoEmocional;
  tema?: TemaMemoria;
}

// ============================================
// ENTREVISTA
// ============================================

export type TipoEntrevista = 'quantitativa' | 'qualitativa' | 'mista';
export type StatusEntrevista = 'rascunho' | 'executando' | 'concluida' | 'erro';
export type TipoPergunta = 'aberta' | 'escala' | 'multipla_escolha' | 'sim_nao';

export interface Pergunta {
  id: string;
  texto: string;
  tipo: TipoPergunta;
  opcoes?: string[];
  obrigatoria: boolean;
  escala_min?: number;
  escala_max?: number;
  escala_rotulos?: string[];
}

export interface Entrevista {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: TipoEntrevista;
  perguntas: Pergunta[];
  filtros_aplicados: FiltrosEleitor;
  total_eleitores: number;
  status: StatusEntrevista;
  custo_estimado: number;
  custo_real?: number;
  tokens_entrada?: number;
  tokens_saida?: number;
  modelo_usado?: string;
  progresso?: number;
  erro_mensagem?: string;
  criado_em: string;
  iniciado_em?: string;
  finalizado_em?: string;
}

export interface CriarEntrevistaDTO {
  titulo: string;
  descricao?: string;
  tipo: TipoEntrevista;
  perguntas: Omit<Pergunta, 'id'>[];
  filtros: FiltrosEleitor;
}

export interface RespostaEleitor {
  eleitor_id: string;
  eleitor_nome: string;
  respostas: {
    pergunta_id: string;
    resposta: string | number | string[];
  }[];
  tokens_usados: number;
  custo: number;
  tempo_resposta_ms: number;
}

// ============================================
// RESULTADO
// ============================================

export interface Correlacao {
  variavel1: string;
  variavel2: string;
  coeficiente: number;
  tipo: 'pearson' | 'spearman';
  significativo: boolean;
  p_valor: number;
}

export interface Distribuicao {
  categoria: string;
  contagem: number;
  percentual: number;
  subcategorias?: Distribuicao[];
}

export interface PalavraFrequente {
  palavra: string;
  contagem: number;
  percentual: number;
}

export interface Tema {
  nome: string;
  contagem: number;
  percentual: number;
  palavras_chave: string[];
  sentimento_medio: number;
}

export interface Citacao {
  texto: string;
  eleitor_id: string;
  eleitor_nome: string;
  tema?: string;
  sentimento: 'positivo' | 'negativo' | 'neutro';
}

export interface Insight {
  tipo: 'destaque' | 'alerta' | 'tendencia' | 'correlacao';
  titulo: string;
  descricao: string;
  relevancia: number; // 0-100
  dados_suporte?: Record<string, unknown>;
}

export interface ResultadoEntrevista {
  entrevista_id: string;
  total_respostas: number;
  custo_total: number;
  tempo_execucao_segundos: number;

  // Estatísticas quantitativas
  estatisticas?: {
    medias: Record<string, number>;
    medianas: Record<string, number>;
    modas: Record<string, string | number>;
    desvios_padrao: Record<string, number>;
    variancias: Record<string, number>;
    minimos: Record<string, number>;
    maximos: Record<string, number>;
    correlacoes: Correlacao[];
    distribuicoes: Distribuicao[];
    crosstabs: Record<string, Distribuicao[]>;
  };

  // Análise qualitativa
  analise_texto?: {
    sentimento_geral: 'positivo' | 'negativo' | 'neutro' | 'misto';
    proporcao_sentimentos: {
      positivo: number;
      negativo: number;
      neutro: number;
    };
    palavras_frequentes: PalavraFrequente[];
    temas_principais: Tema[];
    citacoes_representativas: Citacao[];
  };

  // Respostas individuais
  respostas: RespostaEleitor[];

  // Insights e conclusões
  insights: Insight[];
  conclusoes: string[];
  implicacoes_politicas?: string[];
}

// ============================================
// ESTATÍSTICAS GERAIS
// ============================================

export interface EstatisticasEleitores {
  total: number;
  por_genero: Distribuicao[];
  por_cluster: Distribuicao[];
  por_regiao: Distribuicao[];
  por_religiao: Distribuicao[];
  por_orientacao_politica: Distribuicao[];
  por_faixa_etaria: Distribuicao[];
  por_escolaridade: Distribuicao[];
  media_idade: number;
}

// ============================================
// GERAÇÃO DE ELEITORES
// ============================================

export interface ConfiguracaoGeracao {
  quantidade: number;
  regiao?: string;
  cluster?: ClusterSocioeconomico;
  usar_claude_para_historias: boolean;
  seed?: number;
}

export interface ResultadoGeracao {
  total_gerado: number;
  eleitores: Eleitor[];
  custo_total: number;
  tempo_geracao_segundos: number;
}

// ============================================
// CUSTO E TOKENS
// ============================================

export interface CalculoCusto {
  tokens_entrada: number;
  tokens_saida: number;
  modelo: string;
  custo_entrada: number;
  custo_saida: number;
  custo_total: number;
}

export const PRECOS_MODELOS = {
  'claude-opus-4-5-20251101': {
    entrada: 15, // USD por 1M tokens
    saida: 75,
  },
  'claude-sonnet-4-5-20250929': {
    entrada: 3,
    saida: 15,
  },
  'claude-sonnet-4-20250514': {
    entrada: 3,
    saida: 15,
  },
  'claude-3-5-haiku-20241022': {
    entrada: 0.25,
    saida: 1.25,
  },
} as const;

// ============================================
// CONFIGURAÇÕES DO SISTEMA
// ============================================

export interface ConfiguracoesSistema {
  regioes_administrativas: string[];
  clusters: { valor: ClusterSocioeconomico; rotulo: string }[];
  religioes: string[];
  faixas_etarias: { valor: string; min: number; max: number }[];
  orientacoes_politicas: { valor: OrientacaoPolitica; rotulo: string }[];
  posicoes_bolsonaro: { valor: PosicaoBolsonaro; rotulo: string }[];
  escolaridades: string[];
  valores_possiveis: string[];
  preocupacoes_possiveis: string[];
}

// ============================================
// PARLAMENTARES
// ============================================

export type CasaLegislativa = 'camara_federal' | 'senado' | 'cldf';

export type CargoParlamentar = 'deputado_federal' | 'deputada_federal' | 'senador' | 'senadora' | 'deputado_distrital' | 'deputada_distrital';

export type RelacaoGoverno = 'base_aliada' | 'independente' | 'oposicao_moderada' | 'oposicao_forte';

export type PosicaoLula = 'apoiador_forte' | 'apoiador_moderado' | 'neutro' | 'critico_moderado' | 'opositor_moderado' | 'opositor_forte';

export type EstiloComunicacao = 'combativo' | 'articulado' | 'popular' | 'tecnico' | 'religioso' | 'emotivo' | 'institucional' | 'conservador' | 'pragmatico' | 'didatico' | 'militante' | 'sindicalista' | 'assertivo' | 'autoritario' | 'conciliador' | 'digital' | 'firme';

export interface RedesSociais {
  twitter?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
}

export interface Parlamentar {
  id: string;
  nome: string;
  nome_parlamentar: string;
  idade: number;
  data_nascimento: string;
  genero: Genero;
  cor_raca: string;
  naturalidade: string;
  uf_nascimento: string;
  casa_legislativa: CasaLegislativa;
  cargo: CargoParlamentar;
  partido: string;
  numero_partido: number;
  mandato_inicio: string;
  mandato_fim: string;
  legislatura: number;
  votos_eleicao: number;
  foto_url: string;
  formacao_academica: string[];
  profissao_anterior: string;
  carreira_profissional: string;
  historico_politico: string[];
  comissoes_atuais: string[];
  liderancas?: string[];
  frentes_parlamentares?: string[];
  temas_atuacao: string[];
  projetos_lei_destaque?: string[];
  base_eleitoral: string;
  religiao: string;
  estado_civil: string;
  filhos: number;
  orientacao_politica: OrientacaoPolitica;
  posicao_bolsonaro: PosicaoBolsonaro;
  posicao_lula?: PosicaoLula;
  interesse_politico: InteressePolitico;
  tolerancia_nuance?: ToleranciaNuance;
  estilo_decisao?: EstiloDecisao;
  estilo_comunicacao: EstiloComunicacao;
  valores: string[];
  preocupacoes: string[];
  medos?: string[];
  vieses_cognitivos?: string[];
  fontes_informacao?: string[];
  aliancas_politicas?: string[];
  relacao_governo_atual?: RelacaoGoverno;
  email_contato?: string;
  telefone_gabinete?: string;
  gabinete_localizacao?: string;
  redes_sociais?: RedesSociais;
  historia_resumida: string;
  instrucao_comportamental: string;
  criado_em: string;
  atualizado_em: string;
}

export interface ParlamentarResumo {
  id: string;
  nome: string;
  nome_parlamentar: string;
  idade: number;
  genero: Genero;
  casa_legislativa: CasaLegislativa;
  cargo: CargoParlamentar;
  partido: string;
  foto_url: string;
  orientacao_politica: OrientacaoPolitica;
  base_eleitoral: string;
}

export interface FiltrosParlamentar {
  pagina?: number;
  por_pagina?: number;
  busca?: string;
  casas_legislativas?: CasaLegislativa[];
  partidos?: string[];
  generos?: Genero[];
  orientacoes_politicas?: OrientacaoPolitica[];
  posicoes_bolsonaro?: PosicaoBolsonaro[];
  posicoes_lula?: PosicaoLula[];
  religioes?: string[];
  temas_atuacao?: string[];
  relacoes_governo?: RelacaoGoverno[];
  ordenar_por?: string;
  ordem?: 'asc' | 'desc';
}

export interface EstatisticasParlamentares {
  total: number;
  por_casa: { casa: CasaLegislativa; contagem: number; percentual: number }[];
  por_partido: { partido: string; contagem: number; percentual: number }[];
  por_genero: { genero: Genero; contagem: number; percentual: number }[];
  por_orientacao_politica: { orientacao: OrientacaoPolitica; contagem: number; percentual: number }[];
  por_posicao_bolsonaro: { posicao: PosicaoBolsonaro; contagem: number; percentual: number }[];
  por_relacao_governo: { relacao: RelacaoGoverno; contagem: number; percentual: number }[];
  media_idade: number;
  media_votos: number;
}

// ============================================
// PESQUISA PARLAMENTAR
// ============================================

export type TipoPesquisaParlamentar = 'votacao' | 'opiniao' | 'posicionamento' | 'analise_comportamental';

export interface PerguntaParlamentar {
  id: string;
  texto: string;
  tipo: 'aberta' | 'escala' | 'multipla_escolha' | 'sim_nao' | 'ranking';
  opcoes?: string[];
  obrigatoria: boolean;
  contexto_parlamentar?: string; // Contexto específico para o parlamentar responder
  escala_min?: number;
  escala_max?: number;
  escala_rotulos?: string[];
}

export interface PesquisaParlamentar {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: TipoPesquisaParlamentar;
  perguntas: PerguntaParlamentar[];
  filtros_aplicados: FiltrosParlamentar;
  casa_legislativa?: CasaLegislativa; // Filtro específico por casa
  total_parlamentares: number;
  status: 'rascunho' | 'executando' | 'concluida' | 'erro';
  custo_estimado: number;
  custo_real?: number;
  progresso?: number;
  criado_em: string;
  iniciado_em?: string;
  finalizado_em?: string;
}

export interface RespostaParlamentar {
  parlamentar_id: string;
  parlamentar_nome: string;
  partido: string;
  casa_legislativa: CasaLegislativa;
  respostas: {
    pergunta_id: string;
    resposta: string | number | string[];
  }[];
  justificativa?: string; // Justificativa do parlamentar para sua resposta
  tokens_usados: number;
  custo: number;
  tempo_resposta_ms: number;
}

export interface ResultadoPesquisaParlamentar {
  pesquisa_id: string;
  total_respostas: number;
  custo_total: number;

  // Análise por casa legislativa
  analise_por_casa?: {
    casa: CasaLegislativa;
    total: number;
    distribuicao_respostas: Record<string, number>;
  }[];

  // Análise por partido
  analise_por_partido?: {
    partido: string;
    total: number;
    distribuicao_respostas: Record<string, number>;
  }[];

  // Análise por orientação política
  analise_por_orientacao?: {
    orientacao: OrientacaoPolitica;
    total: number;
    distribuicao_respostas: Record<string, number>;
  }[];

  // Respostas individuais
  respostas: RespostaParlamentar[];

  // Insights específicos para parlamentares
  insights: {
    tipo: 'consenso' | 'divisao' | 'tendencia' | 'anomalia';
    titulo: string;
    descricao: string;
    relevancia: number;
  }[];
}
