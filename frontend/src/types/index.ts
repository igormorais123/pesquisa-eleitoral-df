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

// Big Five Personality Model
export interface BigFivePersonality {
  abertura: number;        // 1-10: Abertura a experiências
  conscienciosidade: number; // 1-10: Conscienciosidade/Organização
  extroversao: number;     // 1-10: Extroversão
  amabilidade: number;     // 1-10: Amabilidade/Agradabilidade
  neuroticismo: number;    // 1-10: Neuroticismo/Instabilidade emocional
}

export type MotivacaoPrimaria = 'ideologia' | 'poder' | 'servico' | 'fama' | 'dinheiro' | 'corporativismo';

export type EstiloLideranca = 'autoritario' | 'democratico' | 'laissez_faire' | 'carismatico' | 'servical' | 'pragmatico';

export type NivelEngajamento = 'muito_baixo' | 'baixo' | 'medio' | 'alto' | 'muito_alto';

export type NivelInfluencia = 'muito_baixa' | 'baixa' | 'media' | 'alta' | 'muito_alta';

export type TomMidia = 'muito_positivo' | 'positivo' | 'neutro' | 'negativo' | 'muito_negativo' | 'polarizado' | 'muito_polarizado';

export type NivelResiliencia = 'baixa' | 'media' | 'alta' | 'muito_alta';

export interface VotacoesImportantes {
  reforma_tributaria?: 'a_favor' | 'contra' | 'abstencao';
  marco_temporal?: 'a_favor' | 'contra' | 'abstencao';
  aborto_legal?: 'a_favor' | 'contra' | 'abstencao';
  posse_armas?: 'a_favor' | 'contra' | 'abstencao';
  reforma_trabalhista?: 'a_favor' | 'contra' | 'abstencao';
  reforma_administrativa?: 'a_favor' | 'contra' | 'abstencao';
  casamento_homoafetivo?: 'a_favor' | 'contra' | 'abstencao';
  legalizacao_aborto?: 'a_favor' | 'contra' | 'abstencao';
  excludente_ilicitude?: 'a_favor' | 'contra' | 'abstencao';
  reducao_maioridade?: 'a_favor' | 'contra' | 'abstencao';
  autonomia_bc?: 'a_favor' | 'contra' | 'abstencao';
  [key: string]: 'a_favor' | 'contra' | 'abstencao' | undefined;
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

  // ============================================
  // NOVOS CAMPOS - DADOS BIOGRÁFICOS EXPANDIDOS
  // ============================================
  signo?: string;
  local_residencia_atual?: string;
  patrimonio_declarado?: number;
  evolucao_patrimonial_percentual?: number;
  escolaridade_nivel?: 'medio' | 'superior' | 'pos_graduacao' | 'mestrado' | 'doutorado';
  universidades?: string[];
  idiomas?: string[];
  hobbies?: string[];

  // ============================================
  // ATUAÇÃO PARLAMENTAR
  // ============================================
  taxa_presenca_plenario?: number;
  total_projetos_autoria?: number;
  projetos_aprovados?: number;
  projetos_em_tramitacao?: number;
  votacoes_importantes?: VotacoesImportantes;
  gastos_gabinete_mensal?: number;
  viagens_oficiais_ano?: number;
  assessores_quantidade?: number;

  // ============================================
  // PROCESSOS E INTEGRIDADE
  // ============================================
  processos_judiciais?: string[];
  processos_tse?: string[];
  investigacoes_em_curso?: string[];
  condenacoes?: string[];
  ficha_limpa?: boolean;

  // ============================================
  // PERFIL DIGITAL E MÍDIA
  // ============================================
  seguidores_total?: number;
  engajamento_redes?: NivelEngajamento;
  mencoes_midia_mes?: number;
  tom_cobertura_midia?: TomMidia;
  fake_news_associadas?: boolean;
  influencia_digital?: NivelInfluencia;

  // ============================================
  // PERFIL PSICOLÓGICO (INFERIDO)
  // ============================================
  big_five?: BigFivePersonality;
  motivacao_primaria?: MotivacaoPrimaria;
  estilo_lideranca?: EstiloLideranca;
  nivel_carisma?: number; // 1-10
  inteligencia_emocional?: number; // 1-10
  resiliencia_crises?: NivelResiliencia;
  tendencia_populismo?: number; // 1-10

  // ============================================
  // RELAÇÕES E INFLUÊNCIA
  // ============================================
  influencia_no_partido?: number; // 1-10
  capital_politico?: 'baixo' | 'medio' | 'alto' | 'muito_alto';
  rede_apoiadores_chave?: string[];
  adversarios_politicos?: string[];
  mentores_politicos?: string[];
  apadrinhados?: string[];

  // ============================================
  // CONTROVÉRSIAS
  // ============================================
  controversias_principais?: string[];
  declaracoes_polemicas?: string[];
  escandalos?: string[];
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

// ============================================
// CANDIDATOS
// ============================================

export type CargoPretendido = 'governador' | 'vice_governador' | 'senador' | 'deputado_federal' | 'deputado_distrital';

export type StatusCandidatura = 'pre_candidato' | 'candidato_oficial' | 'indeferido' | 'desistente';

export interface RedesSociaisCandidato {
  twitter?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
}

export interface EleicaoAnterior {
  ano: number;
  cargo: string;
  resultado: 'eleito' | 'nao_eleito' | 'segundo_turno';
  votos?: number;
  percentual?: number;
}

export interface Candidato {
  id: string;
  nome: string;
  nome_urna: string;
  partido: string;
  numero_partido?: number;
  cargo_pretendido: CargoPretendido;
  status_candidatura: StatusCandidatura;
  coligacao?: string;
  vice_ou_suplentes?: string;
  foto_url?: string;
  cor_campanha?: string;
  slogan?: string;
  idade?: number;
  data_nascimento?: string;
  genero?: Genero;
  naturalidade?: string;
  profissao?: string;
  cargo_atual?: string;
  historico_politico: string[];
  biografia?: string;
  propostas_principais: string[];
  areas_foco: string[];
  redes_sociais?: RedesSociaisCandidato;
  site_campanha?: string;
  orientacao_politica?: OrientacaoPolitica;
  posicao_bolsonaro?: PosicaoBolsonaro;
  posicao_lula?: PosicaoLula;
  eleicoes_anteriores: EleicaoAnterior[];
  votos_ultima_eleicao?: number;
  pontos_fortes: string[];
  pontos_fracos: string[];
  controversias: string[];
  rejeicao_estimada?: number;
  conhecimento_estimado?: number;
  ativo: boolean;
  ordem_exibicao?: number;
  criado_em: string;
  atualizado_em: string;
}

export interface CandidatoResumo {
  id: string;
  nome: string;
  nome_urna: string;
  partido: string;
  numero_partido?: number;
  cargo_pretendido: CargoPretendido;
  foto_url?: string;
  cor_campanha?: string;
  status_candidatura: StatusCandidatura;
  ativo: boolean;
}

export interface FiltrosCandidato {
  pagina?: number;
  por_pagina?: number;
  busca_texto?: string;
  partidos?: string[];
  cargos?: CargoPretendido[];
  status?: StatusCandidatura[];
  orientacoes_politicas?: OrientacaoPolitica[];
  generos?: Genero[];
  apenas_ativos?: boolean;
  ordenar_por?: string;
  ordem?: 'asc' | 'desc';
}

export interface CandidatoListResponse {
  candidatos: Candidato[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

export interface EstatisticasCandidatos {
  total: number;
  por_cargo: { cargo: string; quantidade: number; percentual: number }[];
  por_partido: { partido: string; quantidade: number; percentual: number }[];
  por_genero: { genero: string; quantidade: number; percentual: number }[];
  por_orientacao_politica: { orientacao: string; quantidade: number; percentual: number }[];
  por_status: { status: string; quantidade: number }[];
}

export interface CriarCandidatoDTO {
  nome: string;
  nome_urna: string;
  partido: string;
  cargo_pretendido: CargoPretendido;
  numero_partido?: number;
  status_candidatura?: StatusCandidatura;
  coligacao?: string;
  vice_ou_suplentes?: string;
  foto_url?: string;
  cor_campanha?: string;
  slogan?: string;
  idade?: number;
  data_nascimento?: string;
  genero?: Genero;
  naturalidade?: string;
  profissao?: string;
  cargo_atual?: string;
  historico_politico?: string[];
  biografia?: string;
  propostas_principais?: string[];
  areas_foco?: string[];
  redes_sociais?: RedesSociaisCandidato;
  site_campanha?: string;
  orientacao_politica?: OrientacaoPolitica;
  posicao_bolsonaro?: string;
  posicao_lula?: string;
  pontos_fortes?: string[];
  pontos_fracos?: string[];
}

export interface AtualizarCandidatoDTO {
  nome?: string;
  nome_urna?: string;
  partido?: string;
  cargo_pretendido?: CargoPretendido;
  numero_partido?: number;
  status_candidatura?: StatusCandidatura;
  coligacao?: string;
  vice_ou_suplentes?: string;
  foto_url?: string;
  cor_campanha?: string;
  slogan?: string;
  idade?: number;
  data_nascimento?: string;
  genero?: Genero;
  naturalidade?: string;
  profissao?: string;
  cargo_atual?: string;
  historico_politico?: string[];
  biografia?: string;
  propostas_principais?: string[];
  areas_foco?: string[];
  redes_sociais?: RedesSociaisCandidato;
  site_campanha?: string;
  orientacao_politica?: OrientacaoPolitica;
  posicao_bolsonaro?: string;
  posicao_lula?: string;
  pontos_fortes?: string[];
  pontos_fracos?: string[];
  ativo?: boolean;
  ordem_exibicao?: number;
}

// ============================================
// CENÁRIOS ELEITORAIS
// ============================================

export type StatusCenario = 'rascunho' | 'executando' | 'concluido' | 'erro';

export interface CenarioEleitoral {
  id: string;
  nome: string;
  descricao?: string;
  turno: 1 | 2;
  cargo: CargoPretendido;
  candidatos_ids: string[];
  incluir_indecisos: boolean;
  incluir_brancos_nulos: boolean;
  amostra_tamanho: number;
  filtros_eleitores?: Record<string, any>;
  status: StatusCenario;
  resultados?: ResultadoCandidatoCenario[];
  indecisos_percentual?: number;
  brancos_nulos_percentual?: number;
  margem_erro?: number;
  nivel_confianca: number;
  total_eleitores_simulados?: number;
  custo_simulacao?: number;
  tempo_execucao_segundos?: number;
  modelo_ia_usado?: string;
  ativo: boolean;
  criado_por?: string;
  criado_em: string;
  atualizado_em: string;
  executado_em?: string;
}

export interface ResultadoCandidatoCenario {
  candidato_id: string;
  candidato_nome: string;
  candidato_nome_urna: string;
  partido: string;
  votos: number;
  percentual: number;
  percentual_validos: number;
  cor_campanha?: string;
  foto_url?: string;
  variacao?: number;
}

export interface ResultadoCenario {
  cenario_id: string;
  turno: number;
  cargo: string;
  resultados: ResultadoCandidatoCenario[];
  indecisos: number;
  indecisos_percentual: number;
  brancos_nulos: number;
  brancos_nulos_percentual: number;
  total_eleitores: number;
  total_votos_validos: number;
  margem_erro: number;
  nivel_confianca: number;
  haveria_segundo_turno?: boolean;
  candidatos_segundo_turno?: string[];
  tempo_execucao_segundos: number;
  modelo_usado: string;
  executado_em: string;
}

export interface CriarCenarioDTO {
  nome: string;
  descricao?: string;
  turno: 1 | 2;
  cargo: CargoPretendido;
  candidatos_ids: string[];
  incluir_indecisos?: boolean;
  incluir_brancos_nulos?: boolean;
  amostra_tamanho?: number;
  filtros_eleitores?: Record<string, any>;
}

export interface FiltrosCenario {
  pagina?: number;
  por_pagina?: number;
  busca_texto?: string;
  cargos?: CargoPretendido[];
  turnos?: number[];
  status?: StatusCenario[];
  apenas_ativos?: boolean;
  ordenar_por?: string;
  ordem?: 'asc' | 'desc';
}

// ============================================
// ANÁLISE DE REJEIÇÃO
// ============================================

export interface AnaliseRejeicaoCandidato {
  candidato_id: string;
  candidato_nome: string;
  candidato_nome_urna: string;
  partido: string;
  taxa_rejeicao: number;
  taxa_rejeicao_forte: number;
  total_rejeitadores: number;
  principais_motivos: string[];
  perfil_rejeitadores: {
    por_orientacao: Record<string, number>;
    por_cluster: Record<string, number>;
    por_genero: Record<string, number>;
    por_regiao: Record<string, number>;
  };
  foto_url?: string;
  cor_campanha?: string;
}

export interface ResultadoAnaliseRejeicao {
  candidatos: AnaliseRejeicaoCandidato[];
  ranking_menor_rejeicao: string[];
  insights: string[];
  total_eleitores_analisados: number;
  executado_em: string;
}

// ============================================
// TEMPLATES DE PERGUNTAS ELEITORAIS
// ============================================

export type CategoriaTemplate =
  | 'intencao_voto'
  | 'rejeicao'
  | 'avaliacao'
  | 'temas'
  | 'perfil'
  | 'conhecimento'
  | 'completa';

export interface PerguntaTemplate {
  id: string;
  texto: string;
  tipo: TipoPergunta;
  obrigatoria: boolean;
  opcoes?: string[];
  opcoes_dinamicas?: boolean;
  multipla_selecao?: boolean;
  incluir_opcoes_extras?: string[];
  limite_opcoes?: number;
  escala_min?: number;
  escala_max?: number;
  escala_rotulos?: string[];
}

export interface TemplatePerguntas {
  id: string;
  nome: string;
  descricao: string;
  categoria: CategoriaTemplate;
  cargo?: CargoPretendido | null;
  icone: string;
  cor: string;
  perguntas: PerguntaTemplate[];
}

export interface CategoriaTemplateInfo {
  id: CategoriaTemplate;
  nome: string;
  descricao: string;
}

export interface TemplatesData {
  metadados: {
    versao: string;
    data_criacao: string;
    descricao: string;
    total_templates: number;
    total_perguntas: number;
  };
  templates: TemplatePerguntas[];
  categorias: CategoriaTemplateInfo[];
}

// ============================================
// MAPA DE CALOR - REGIÕES ADMINISTRATIVAS
// ============================================

export interface DadosRegiaoAdministrativa {
  codigo: string;
  nome: string;
  sigla: string;
  populacao_estimada: number;
  zona_eleitoral: number[];
  coordenadas: {
    latitude: number;
    longitude: number;
  };
  cluster_predominante: ClusterSocioeconomico;
  caracteristicas: string[];
}

export interface DadosMapaCalor {
  regiao: string;
  valor: number;
  percentual: number;
  candidato_lider?: string;
  candidato_lider_percentual?: number;
  total_eleitores: number;
  detalhes?: Record<string, number>;
}

export interface ResultadoMapaCalor {
  tipo: 'intencao_voto' | 'rejeicao' | 'avaliacao' | 'comparativo';
  dados: DadosMapaCalor[];
  legenda: {
    titulo: string;
    min: number;
    max: number;
    unidade: string;
  };
  filtros_aplicados: Record<string, any>;
  executado_em: string;
}

// ============================================
// ANÁLISE DE SWING VOTERS
// ============================================

export type CategoriaSwingVoter =
  | 'indeciso_total'
  | 'baixa_conviccao'
  | 'susceptivel_mudanca'
  | 'volatil';

export interface SwingVoter {
  eleitor_id: string;
  eleitor_nome: string;
  regiao_administrativa: string;
  cluster_socioeconomico: ClusterSocioeconomico;
  orientacao_politica: OrientacaoPolitica;
  idade: number;
  genero: Genero;
  categoria: CategoriaSwingVoter;
  score_indecisao: number; // 0-100
  candidato_inclinacao?: string;
  fatores_influencia: string[];
  susceptibilidade_campanha: number; // 0-100
  principais_preocupacoes: string[];
}

export interface PerfilSwingVoters {
  total: number;
  percentual_eleitorado: number;
  por_categoria: {
    categoria: CategoriaSwingVoter;
    quantidade: number;
    percentual: number;
  }[];
  por_regiao: {
    regiao: string;
    quantidade: number;
    percentual: number;
  }[];
  por_cluster: {
    cluster: ClusterSocioeconomico;
    quantidade: number;
    percentual: number;
  }[];
  por_orientacao: {
    orientacao: OrientacaoPolitica;
    quantidade: number;
    percentual: number;
  }[];
  por_faixa_etaria: {
    faixa: string;
    quantidade: number;
    percentual: number;
  }[];
  media_idade: number;
  distribuicao_genero: {
    genero: Genero;
    quantidade: number;
    percentual: number;
  }[];
}

export interface FatorInfluencia {
  fator: string;
  peso: number; // 0-100
  descricao: string;
  eleitores_afetados: number;
}

export interface PotencialConversao {
  candidato_origem?: string;
  candidato_destino: string;
  quantidade_eleitores: number;
  percentual: number;
  facilidade_conversao: 'facil' | 'moderada' | 'dificil';
  fatores_chave: string[];
}

export interface ResultadoAnaliseSwingVoters {
  perfil: PerfilSwingVoters;
  swing_voters: SwingVoter[];
  fatores_influencia: FatorInfluencia[];
  potencial_conversao: PotencialConversao[];
  insights: string[];
  recomendacoes_campanha: string[];
  executado_em: string;
}

// ============================================
// COMPARATIVO HISTÓRICO
// ============================================

export interface PontoHistorico {
  data: string;
  valor: number;
  margem_erro?: number;
  amostra?: number;
  fonte?: string;
}

export interface SerieHistorica {
  candidato_id: string;
  candidato_nome: string;
  partido: string;
  cor: string;
  pontos: PontoHistorico[];
}

export interface EventoRelevante {
  data: string;
  titulo: string;
  descricao: string;
  impacto: 'positivo' | 'negativo' | 'neutro';
  candidatos_afetados?: string[];
}

export interface ComparativoHistorico {
  periodo_inicio: string;
  periodo_fim: string;
  tipo: 'intencao_voto' | 'rejeicao' | 'avaliacao';
  series: SerieHistorica[];
  eventos: EventoRelevante[];
  tendencias: {
    candidato_id: string;
    tendencia: 'subindo' | 'estavel' | 'descendo';
    variacao_periodo: number;
  }[];
  insights: string[];
}
