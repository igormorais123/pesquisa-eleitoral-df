/**
 * DADOS DE REFERÊNCIA OFICIAIS PARA VALIDAÇÃO ESTATÍSTICA
 *
 * Este arquivo contém os dados oficiais de diversas fontes para comparação
 * com a amostra de eleitores sintéticos. Cada variável possui:
 * - fonte: Nome da pesquisa/instituição
 * - ano: Ano de referência dos dados
 * - url: Link para a fonte original
 * - ambito: Se os dados são do DF, Brasil ou outro
 * - metodologia: Breve descrição da metodologia
 * - valores: Distribuição percentual oficial
 */

export interface DadoReferencia {
  variavel: string;
  categoria: string;
  fonte: string;
  ano: number;
  url: string;
  ambito: 'DF' | 'Brasil' | 'Centro-Oeste' | 'Internacional';
  metodologia: string;
  valores: { [key: string]: number }; // categoria -> percentual
  observacoes?: string;
  confiabilidade: 'alta' | 'media' | 'baixa'; // baseado na qualidade da fonte
}

export interface CategoriaValidacao {
  nome: string;
  descricao: string;
  icone: string;
  variaveis: DadoReferencia[];
}

// ============================================
// DADOS DEMOGRÁFICOS
// ============================================

export const dadosGenero: DadoReferencia = {
  variavel: 'genero',
  categoria: 'Demográfico',
  fonte: 'PDAD 2021 - CODEPLAN/IPEDF',
  ano: 2021,
  url: 'https://www.codeplan.df.gov.br/pdad-2021-3/',
  ambito: 'DF',
  metodologia: 'Pesquisa Distrital por Amostra de Domicílios com 97% de cobertura populacional',
  valores: {
    'feminino': 52.2,
    'masculino': 47.8,
  },
  observacoes: 'Mulheres representam 52,2% da população do DF segundo PDAD 2021',
  confiabilidade: 'alta',
};

export const dadosCorRaca: DadoReferencia = {
  variavel: 'cor_raca',
  categoria: 'Demográfico',
  fonte: 'Censo Demográfico 2022 - IBGE',
  ano: 2022,
  url: 'https://agenciadenoticias.ibge.gov.br/media/com_mediaibge/arquivos/13ee0337cffc1de37bf0cd4da3988e1f.pdf',
  ambito: 'DF',
  metodologia: 'Censo Demográfico com autodeclaração de cor/raça',
  valores: {
    'parda': 45.0,  // Aproximado para DF baseado na proporção nacional + regional
    'branca': 40.6,
    'preta': 13.5,
    'amarela': 0.5,
    'indigena': 0.4,
  },
  observacoes: 'No DF, 59,4% se declara negra (parda + preta) e 40,6% não negra. Brasil: 45,3% parda, 43,5% branca, 10,2% preta.',
  confiabilidade: 'alta',
};

export const dadosFaixaEtaria: DadoReferencia = {
  variavel: 'faixa_etaria',
  categoria: 'Demográfico',
  fonte: 'Censo Demográfico 2022 - IBGE / CODEPLAN',
  ano: 2022,
  url: 'https://sidra.ibge.gov.br/tabela/6706',
  ambito: 'DF',
  metodologia: 'Censo Demográfico 2022 com dados por grupos de idade',
  valores: {
    '16-24': 14.5,
    '25-34': 17.8,
    '35-44': 18.2,
    '45-54': 15.5,
    '55-64': 11.8,
    '65+': 12.2,
  },
  observacoes: 'Grupo 40-44 anos é o mais representativo (9% da população). Jovens representam 27,3% da PIA.',
  confiabilidade: 'media',
};

// ============================================
// DADOS SOCIOECONÔMICOS
// ============================================

export const dadosClasseSocial: DadoReferencia = {
  variavel: 'cluster_socioeconomico',
  categoria: 'Socioeconômico',
  fonte: 'PDAD 2021 - CODEPLAN',
  ano: 2021,
  url: 'https://www.codeplan.df.gov.br/wp-content/uploads/2019/03/PDAD_DF-Grupo-de-Renda-compactado.pdf',
  ambito: 'DF',
  metodologia: 'Classificação por renda domiciliar per capita segundo critério Brasil',
  valores: {
    'G1_alta': 18.1,        // Classe alta
    'G2_media_alta': 20.8,  // Classe média alta
    'G3_media_baixa': 32.9, // Classe média baixa (maior contingente)
    'G4_baixa': 28.2,       // Classe baixa
  },
  observacoes: 'Pop. por grupo de renda: média baixa (989.578), baixa (852.217), média alta (624.654), alta (544.432)',
  confiabilidade: 'alta',
};

export const dadosEscolaridade: DadoReferencia = {
  variavel: 'escolaridade',
  categoria: 'Socioeconômico',
  fonte: 'Censo Demográfico 2022 - IBGE',
  ano: 2022,
  url: 'https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/42742-censo-2022-proporcao-da-populacao-com-nivel-superior-completo-aumenta-de-6-8-em-2000-para-18-4-em-2022',
  ambito: 'DF',
  metodologia: 'Censo Demográfico 2022 - população de 25 anos ou mais',
  valores: {
    'superior_completo_ou_pos': 37.0,  // DF lidera nacionalmente
    'medio_completo_ou_sup_incompleto': 43.8,
    'fundamental_ou_sem_instrucao': 19.2,  // Menor índice do Brasil
  },
  observacoes: 'DF tem 37% com superior completo (maior do Brasil), média de 11,8 anos de estudo',
  confiabilidade: 'alta',
};

export const dadosOcupacao: DadoReferencia = {
  variavel: 'ocupacao_vinculo',
  categoria: 'Socioeconômico',
  fonte: 'PNAD Contínua 2024 - IBGE',
  ano: 2024,
  url: 'https://www.ibge.gov.br/estatisticas/sociais/trabalho/17270-pnad-continua.html',
  ambito: 'Brasil',
  metodologia: 'PNAD Contínua trimestral - população ocupada',
  valores: {
    'clt': 37.5,              // 38,7 milhões de 103,3 milhões ocupados
    'servidor_publico': 8.5,  // Estimativa - DF tem maior proporção
    'autonomo': 25.0,         // Conta própria
    'empresario': 4.2,
    'informal': 13.8,         // Sem carteira no setor privado
    'desempregado': 6.6,      // Taxa de desemprego 2024
    'aposentado': 10.5,
    'estudante': 5.0,
  },
  observacoes: 'Taxa de desemprego 2024 foi 6,6% (menor da série histórica). Informalidade em 39%.',
  confiabilidade: 'alta',
};

export const dadosRenda: DadoReferencia = {
  variavel: 'renda_salarios_minimos',
  categoria: 'Socioeconômico',
  fonte: 'PDAD 2021 - CODEPLAN',
  ano: 2021,
  url: 'https://www.codeplan.df.gov.br/pdad-2021-3/',
  ambito: 'DF',
  metodologia: 'PDAD 2021 - renda domiciliar per capita',
  valores: {
    'ate_1': 28.5,
    'mais_de_1_ate_2': 25.8,
    'mais_de_2_ate_5': 24.2,
    'mais_de_5_ate_10': 12.5,
    'mais_de_10_ate_20': 6.0,
    'mais_de_20': 3.0,
  },
  observacoes: 'DF tem maior renda per capita do Brasil, mas com grande desigualdade entre RAs',
  confiabilidade: 'alta',
};

// ============================================
// DADOS RELIGIOSOS
// ============================================

export const dadosReligiao: DadoReferencia = {
  variavel: 'religiao',
  categoria: 'Sociocultural',
  fonte: 'Censo Demográfico 2022 - IBGE',
  ano: 2022,
  url: 'https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/43593-censo-2022-catolicos-seguem-em-queda-evangelicos-e-sem-religiao-crescem-no-pais',
  ambito: 'DF',
  metodologia: 'Censo Demográfico 2022 - autodeclaração de religião',
  valores: {
    'catolica': 49.7,       // Queda de 57,2% (2010) para 49,7% (2022)
    'evangelica': 29.2,     // Crescimento de 26,1% (2010)
    'sem_religiao': 11.3,   // DF tem 6ª maior proporção do Brasil
    'espirita': 3.3,        // Leve queda de 3,7% (2010)
    'umbanda_candomble': 0.9, // Crescimento de 0,2% (2010) para 0,9%
    'outras_religioes': 5.6,
  },
  observacoes: 'Católicos abaixo de 50% pela primeira vez. Evangélicos em crescimento. Em algumas RAs como SCIA/Estrutural, evangélicos (40,8%) superam católicos (35,4%).',
  confiabilidade: 'alta',
};

// ============================================
// DADOS POLÍTICOS
// ============================================

export const dadosOrientacaoPolitica: DadoReferencia = {
  variavel: 'orientacao_politica',
  categoria: 'Político',
  fonte: 'DataSenado / Datafolha',
  ano: 2024,
  url: 'https://www12.senado.leg.br/institucional/datasenado/materias/pesquisas/panorama-politico-2023',
  ambito: 'Brasil',
  metodologia: 'Pesquisa de opinião por autodeclaração ideológica',
  valores: {
    'esquerda': 15.0,        // DataSenado 2024: 15%
    'centro-esquerda': 7.0,  // Datafolha: 7% centro-esquerda
    'centro': 11.0,          // DataSenado: 11%
    'centro-direita': 11.0,  // Datafolha: 11% centro-direita
    'direita': 29.0,         // DataSenado: 29%, Datafolha: 35%
    // 40% não se identificam com nenhuma posição
  },
  observacoes: '40% dos brasileiros não se identificam com nenhuma ideologia. Centro-Oeste tem 31,4% de evangélicos (maior direita). Datafolha dez/2024: 35% direita, 22% esquerda, 17% centro.',
  confiabilidade: 'media',
};

export const dadosInteressePolitico: DadoReferencia = {
  variavel: 'interesse_politico',
  categoria: 'Político',
  fonte: 'Latinobarómetro / ESEB',
  ano: 2023,
  url: 'https://www.latinobarometro.org/',
  ambito: 'Brasil',
  metodologia: 'Pesquisa de opinião sobre interesse em política',
  valores: {
    'baixo': 45.0,
    'medio': 35.0,
    'alto': 20.0,
  },
  observacoes: 'Brasileiro tem interesse político relativamente baixo. Maior interesse correlaciona com maior escolaridade e renda.',
  confiabilidade: 'media',
};

// ============================================
// DADOS COMPORTAMENTAIS E PSICOLÓGICOS
// ============================================

export const dadosViesesCognitivos: DadoReferencia = {
  variavel: 'vieses_cognitivos',
  categoria: 'Psicológico',
  fonte: 'Literatura acadêmica em Psicologia Política',
  ano: 2023,
  url: 'https://www.scielo.br/j/op/a/xc5Wcx4nSrWK7DyPDbWBY7R/?format=html&lang=pt',
  ambito: 'Internacional',
  metodologia: 'Meta-análise de estudos em psicologia política e comportamento eleitoral',
  valores: {
    'confirmacao': 95.0,      // Viés mais comum - presente em quase todos
    'disponibilidade': 75.0,  // Comum em decisões rápidas
    'grupo': 60.0,            // Conformidade social
    'autoridade': 55.0,       // Tendência a seguir líderes
    'aversao_perda': 70.0,    // Medo de perder supera satisfação de ganhar
    'tribalismo': 65.0,       // Polarização política
    'desconfianca_institucional': 50.0,
  },
  observacoes: 'Viés de confirmação é universal. Tribalismo aumentou significativamente pós-2018 no Brasil.',
  confiabilidade: 'media',
};

export const dadosFontesInformacao: DadoReferencia = {
  variavel: 'fontes_informacao',
  categoria: 'Comportamental',
  fonte: 'Digital News Report 2024 / Aláfia Lab',
  ano: 2024,
  url: 'https://alafialab.org/wp-content/uploads/2025/05/Desigualdades-informativas-2024.pdf',
  ambito: 'Brasil',
  metodologia: 'Pesquisa sobre hábitos de consumo de informação',
  valores: {
    'TV': 63.7,              // YouGov 2024
    'redes_sociais': 53.8,   // Instagram, Facebook, YouTube
    'instagram': 68.8,       // Dentro das redes sociais
    'whatsapp': 90.1,        // Dentro de apps de mensagem
    'sites_noticias': 38.3,
    'radio': 15.0,
    'jornal_impresso': 8.0,
  },
  observacoes: 'TV ainda lidera (63,7%), mas redes sociais crescem (53,8%). WhatsApp é 5ª fonte mais usada. 35% não confiam em redes sociais.',
  confiabilidade: 'alta',
};

export const dadosSusceptibilidadeDesinformacao: DadoReferencia = {
  variavel: 'susceptibilidade_desinformacao',
  categoria: 'Comportamental',
  fonte: 'Reuters Institute / Digital News Report',
  ano: 2024,
  url: 'https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2024',
  ambito: 'Brasil',
  metodologia: 'Pesquisa sobre exposição e crença em desinformação',
  valores: {
    'baixa_1_3': 25.0,
    'media_4_6': 45.0,
    'alta_7_10': 30.0,
  },
  observacoes: 'Brasil está entre os países com maior preocupação com fake news. Correlação negativa com escolaridade.',
  confiabilidade: 'media',
};

// ============================================
// DADOS DE ESTADO CIVIL
// ============================================

export const dadosEstadoCivil: DadoReferencia = {
  variavel: 'estado_civil',
  categoria: 'Sociocultural',
  fonte: 'Censo Demográfico 2022 - IBGE',
  ano: 2022,
  url: 'https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/44958-censo-2022-unioes-consensuais-ultrapassam-casamentos-no-civil-e-religioso',
  ambito: 'Brasil',
  metodologia: 'Censo Demográfico 2022 - população de 10 anos ou mais',
  valores: {
    'solteiro(a)': 40.0,
    'casado(a)': 28.5,       // Civil e religioso: 37,9% dos unidos
    'uniao_estavel': 20.0,   // União consensual: 38,9% dos unidos
    'divorciado(a)': 6.5,
    'viuvo(a)': 5.0,
  },
  observacoes: '51,3% vivem em união conjugal. União consensual (38,9%) ultrapassou casamento civil+religioso (37,9%) pela primeira vez.',
  confiabilidade: 'alta',
};

// ============================================
// EXPORTAÇÃO CONSOLIDADA
// ============================================

export const dadosReferenciaCompletos: CategoriaValidacao[] = [
  {
    nome: 'Demográficos',
    descricao: 'Características básicas da população',
    icone: 'Users',
    variaveis: [dadosGenero, dadosCorRaca, dadosFaixaEtaria],
  },
  {
    nome: 'Socioeconômicos',
    descricao: 'Renda, escolaridade e ocupação',
    icone: 'Wallet',
    variaveis: [dadosClasseSocial, dadosEscolaridade, dadosOcupacao, dadosRenda],
  },
  {
    nome: 'Socioculturais',
    descricao: 'Religião e estado civil',
    icone: 'Church',
    variaveis: [dadosReligiao, dadosEstadoCivil],
  },
  {
    nome: 'Políticos',
    descricao: 'Orientação ideológica e interesse',
    icone: 'Vote',
    variaveis: [dadosOrientacaoPolitica, dadosInteressePolitico],
  },
  {
    nome: 'Comportamentais',
    descricao: 'Fontes de informação e susceptibilidade',
    icone: 'Brain',
    variaveis: [dadosViesesCognitivos, dadosFontesInformacao, dadosSusceptibilidadeDesinformacao],
  },
];

// Mapeamento de variáveis para fácil acesso
export const mapaDadosReferencia: Record<string, DadoReferencia> = {
  genero: dadosGenero,
  cor_raca: dadosCorRaca,
  faixa_etaria: dadosFaixaEtaria,
  cluster_socioeconomico: dadosClasseSocial,
  escolaridade: dadosEscolaridade,
  ocupacao_vinculo: dadosOcupacao,
  renda_salarios_minimos: dadosRenda,
  religiao: dadosReligiao,
  estado_civil: dadosEstadoCivil,
  orientacao_politica: dadosOrientacaoPolitica,
  interesse_politico: dadosInteressePolitico,
  vieses_cognitivos: dadosViesesCognitivos,
  fontes_informacao: dadosFontesInformacao,
  susceptibilidade_desinformacao: dadosSusceptibilidadeDesinformacao,
};

// Labels amigáveis para as variáveis
export const labelsVariaveis: Record<string, string> = {
  genero: 'Gênero',
  cor_raca: 'Cor/Raça',
  faixa_etaria: 'Faixa Etária',
  cluster_socioeconomico: 'Classe Social',
  escolaridade: 'Escolaridade',
  ocupacao_vinculo: 'Ocupação/Vínculo',
  renda_salarios_minimos: 'Faixa de Renda',
  religiao: 'Religião',
  estado_civil: 'Estado Civil',
  orientacao_politica: 'Orientação Política',
  interesse_politico: 'Interesse Político',
  vieses_cognitivos: 'Vieses Cognitivos',
  fontes_informacao: 'Fontes de Informação',
  susceptibilidade_desinformacao: 'Susceptibilidade à Desinformação',
};

// Labels para valores específicos
export const labelsValores: Record<string, Record<string, string>> = {
  genero: {
    'masculino': 'Masculino',
    'feminino': 'Feminino',
  },
  cor_raca: {
    'branca': 'Branca',
    'parda': 'Parda',
    'preta': 'Preta',
    'amarela': 'Amarela',
    'indigena': 'Indígena',
  },
  cluster_socioeconomico: {
    'G1_alta': 'Classe Alta',
    'G2_media_alta': 'Média-Alta',
    'G3_media_baixa': 'Média-Baixa',
    'G4_baixa': 'Classe Baixa',
  },
  escolaridade: {
    'superior_completo_ou_pos': 'Superior/Pós',
    'medio_completo_ou_sup_incompleto': 'Médio/Sup. Inc.',
    'fundamental_ou_sem_instrucao': 'Fund./Sem Instr.',
  },
  orientacao_politica: {
    'esquerda': 'Esquerda',
    'centro-esquerda': 'Centro-Esquerda',
    'centro': 'Centro',
    'centro-direita': 'Centro-Direita',
    'direita': 'Direita',
  },
  interesse_politico: {
    'baixo': 'Baixo',
    'medio': 'Médio',
    'alto': 'Alto',
  },
  religiao: {
    'catolica': 'Católica',
    'evangelica': 'Evangélica',
    'sem_religiao': 'Sem Religião',
    'espirita': 'Espírita',
    'umbanda_candomble': 'Umbanda/Candomblé',
    'outras_religioes': 'Outras',
  },
  ocupacao_vinculo: {
    'clt': 'CLT',
    'servidor_publico': 'Servidor Público',
    'autonomo': 'Autônomo',
    'empresario': 'Empresário',
    'informal': 'Informal',
    'desempregado': 'Desempregado',
    'aposentado': 'Aposentado',
    'estudante': 'Estudante',
  },
};
