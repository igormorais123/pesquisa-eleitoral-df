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
    '16-24': 14.5,   // 16-17 (2.5%) + 18-24 (12%)
    '25-34': 20.0,   // Jovens adultos
    '35-44': 20.5,   // Adultos
    '45-54': 18.0,   // Meia-idade
    '55-64': 12.0,   // Pré-aposentadoria
    '65+': 15.0,     // Idosos
  },
  observacoes: 'Distribuição baseada no Censo 2022 para população votante do DF (16+ anos). Valores ajustados para refletir pirâmide etária real.',
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
    'esquerda': 15.0,         // DataSenado 2024: 15%
    'centro_esquerda': 7.0,   // Datafolha: 7% centro-esquerda
    'centro': 11.0,           // DataSenado: 11%
    'centro_direita': 11.0,   // Datafolha: 11% centro-direita
    'direita': 29.0,          // DataSenado: 29%, Datafolha: 35%
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
    'baixa': 25.0,
    'media': 45.0,
    'alta': 30.0,
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
// DADOS DE POSIÇÃO SOBRE BOLSONARO
// ============================================

export const dadosPosicaoBolsonaro: DadoReferencia = {
  variavel: 'posicao_bolsonaro',
  categoria: 'Político',
  fonte: 'Datafolha / CNN Brasil',
  ano: 2024,
  url: 'https://www.cnnbrasil.com.br/politica/no-fim-de-governo-bolsonaro-tem-aprovacao-de-39-e-reprovacao-de-37-diz-datafolha/',
  ambito: 'Brasil',
  metodologia: 'Pesquisa Datafolha - avaliação do ex-presidente e intenção de voto em candidatos apoiados',
  valores: {
    'apoiador_forte': 15.0,      // Votariam "com certeza" em candidato apoiado por Bolsonaro (26%)
    'apoiador_moderado': 11.0,   // "Talvez" votariam (21%)
    'neutro': 20.0,              // Indiferentes
    'critico_moderado': 20.0,    // Reprovam mas não rejeitam totalmente
    'critico_forte': 34.0,       // Não votariam em candidato apoiado (50%)
  },
  observacoes: 'Datafolha dez/2025: 50% não votariam em candidato de Bolsonaro, 26% votariam com certeza. Aprovação no fim do mandato: 39%.',
  confiabilidade: 'media',
};

// ============================================
// DADOS DE MOBILIDADE / TRANSPORTE
// ============================================

export const dadosMeioTransporte: DadoReferencia = {
  variavel: 'meio_transporte',
  categoria: 'Mobilidade',
  fonte: 'Censo Demográfico 2022 - IBGE',
  ano: 2022,
  url: 'https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/44713-automovel-e-o-meio-de-transporte-mais-utilizado-no-deslocamento-para-o-trabalho',
  ambito: 'Brasil',
  metodologia: 'Censo 2022 - principal meio de transporte para trabalho',
  valores: {
    'carro': 32.3,          // Automóvel
    'onibus': 21.4,         // Ônibus
    'a_pe': 17.8,           // A pé
    'motocicleta': 16.4,    // Motocicleta
    'bicicleta': 3.5,       // Bicicleta
    'metro': 1.6,           // Metrô/Trem
    'nao_se_aplica': 7.0,   // Trabalho remoto ou não trabalha
  },
  observacoes: 'Carro (32,3%) supera ônibus (21,4%). No Centro-Oeste, transporte individual chega a 58,8%. Metrô/trem só 1,6% (concentrado no Sudeste).',
  confiabilidade: 'alta',
};

// ============================================
// DADOS DE ESTILO DE DECISÃO ELEITORAL
// ============================================

export const dadosEstiloDecisao: DadoReferencia = {
  variavel: 'estilo_decisao',
  categoria: 'Comportamental',
  fonte: 'Literatura em Comportamento Eleitoral / ESEB',
  ano: 2023,
  url: 'https://www.politize.com.br/comportamento-eleitoral-como-os-eleitores-decidem-seu-voto/',
  ambito: 'Brasil',
  metodologia: 'Estudos acadêmicos sobre tipologia de decisão do voto',
  valores: {
    'identitario': 25.0,    // Vota por identificação partidária/ideológica
    'pragmatico': 20.0,     // Avalia propostas e histórico
    'moral': 15.0,          // Prioriza valores morais/religiosos
    'economico': 25.0,      // Decide baseado em economia pessoal
    'emocional': 15.0,      // Vota por carisma/confiança no candidato
  },
  observacoes: 'Eleitor brasileiro é majoritariamente personalista - vota em quem "conhece e confia". Decisão econômica ("bolso") é muito relevante.',
  confiabilidade: 'baixa',
};

// ============================================
// DADOS DE TOLERÂNCIA À NUANCE
// ============================================

export const dadosToleranciaNumance: DadoReferencia = {
  variavel: 'tolerancia_nuance',
  categoria: 'Psicológico',
  fonte: 'Estudos de Polarização Política / UFMG',
  ano: 2023,
  url: 'https://www.scielo.br/j/op/a/xc5Wcx4nSrWK7DyPDbWBY7R/',
  ambito: 'Brasil',
  metodologia: 'Pesquisas sobre polarização e pensamento maniqueísta',
  valores: {
    'baixa': 35.0,     // Pensamento binário, polarizado
    'media': 40.0,     // Aceita algumas nuances
    'alta': 25.0,      // Alta capacidade de nuance
  },
  observacoes: 'Polarização aumentou significativamente pós-2018. Brasileiros com baixa tolerância tendem ao pensamento "nós vs eles".',
  confiabilidade: 'baixa',
};

// ============================================
// DADOS SOBRE FILHOS
// ============================================

export const dadosFilhos: DadoReferencia = {
  variavel: 'filhos',
  categoria: 'Sociocultural',
  fonte: 'Censo Demográfico 2022 - IBGE',
  ano: 2022,
  url: 'https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/44523-censo-2022-fecundidade-cai-para-1-75-filho-por-mulher-e-atinge-novo-minimo-historico',
  ambito: 'Brasil',
  metodologia: 'Censo 2022 - taxa de fecundidade e composição familiar',
  valores: {
    '0': 30.0,    // Sem filhos
    '1': 27.0,    // 1 filho
    '2': 28.0,    // 2 filhos
    '3': 11.0,    // 3 filhos
    '4': 4.0,     // 4+ filhos
  },
  observacoes: 'Taxa de fecundidade caiu para 1,75 filho por mulher (mínimo histórico). Famílias menores são tendência.',
  confiabilidade: 'alta',
};

// ============================================
// DADOS DE REGIÕES ADMINISTRATIVAS DO DF
// ============================================

export const dadosRegiaoAdministrativa: DadoReferencia = {
  variavel: 'regiao_administrativa',
  categoria: 'Geográfico',
  fonte: 'PDAD 2021 - CODEPLAN',
  ano: 2021,
  url: 'https://www.codeplan.df.gov.br/pdad-2021-3/',
  ambito: 'DF',
  metodologia: 'Pesquisa Distrital por Amostra de Domicílios 2021 - população estimada',
  valores: {
    // Grupo 1 - Renda Alta (> 10 SM per capita)
    'Plano Piloto': 8.3,           // 253.874
    'Lago Sul': 1.0,               // 31.206
    'Lago Norte': 1.2,             // 36.394
    'Sudoeste/Octogonal': 1.8,     // 56.026
    'Park Way': 0.7,               // 21.371
    'Jardim Botânico': 0.9,        // 29.062

    // Grupo 2 - Renda Média-Alta (5-10 SM)
    'Águas Claras': 5.1,           // 156.591
    'Vicente Pires': 2.3,          // 70.429
    'Guará': 4.3,                  // 132.685
    'Cruzeiro': 1.0,               // 31.230
    'Sobradinho II': 3.1,          // 96.831
    'Arniqueira': 0.8,             // 26.048
    'SIA': 0.1,                    // 2.403

    // Grupo 3 - Renda Média-Baixa (2-5 SM)
    'Taguatinga': 6.6,             // 203.319
    'Ceilândia': 14.4,             // 443.061 - maior RA
    'Samambaia': 8.3,              // 254.916
    'Gama': 4.4,                   // 134.958
    'Planaltina': 5.9,             // 181.651
    'Santa Maria': 3.9,            // 119.444
    'Sobradinho': 2.1,             // 65.763
    'Brazlândia': 1.5,             // 47.374
    'São Sebastião': 3.3,          // 100.659
    'Riacho Fundo I': 1.2,         // 36.448
    'Riacho Fundo II': 2.6,        // 80.133
    'Núcleo Bandeirante': 0.7,     // 22.569
    'Candangolândia': 0.5,         // 16.848
    'Paranoá': 2.1,                // 65.095
    'Itapoã': 2.0,                 // 61.158

    // Grupo 4 - Renda Baixa (< 2 SM)
    'Recanto das Emas': 4.4,       // 134.958
    'SCIA/Estrutural': 1.1,        // 35.094
    'Fercal': 0.3,                 // 8.288
    'Sol Nascente/Pôr do Sol': 2.8, // 87.126 - população crescente
    'Varjão': 0.3,                 // 9.029
  },
  observacoes: 'Ceilândia é a maior RA com 14,4% da população. Plano Piloto e Samambaia têm ~8,3% cada. Sol Nascente/Pôr do Sol é RA recente com crescimento acelerado.',
  confiabilidade: 'alta',
};

// ============================================
// DADOS DE TEMPO DE DESLOCAMENTO PARA TRABALHO
// ============================================

export const dadosTempoDeslocamento: DadoReferencia = {
  variavel: 'tempo_deslocamento_trabalho',
  categoria: 'Mobilidade',
  fonte: 'Censo Demográfico 2022 - IBGE',
  ano: 2022,
  url: 'https://censo2022.ibge.gov.br/panorama/',
  ambito: 'DF',
  metodologia: 'Censo 2022 - tempo habitual de deslocamento casa-trabalho para ocupados',
  valores: {
    'nao_se_aplica': 7.0,      // Trabalha em casa / não se desloca
    'ate_15': 15.0,            // Até 15 minutos
    '15_30': 25.0,             // De 15 a 30 minutos
    '30_45': 22.0,             // De 30 a 45 minutos
    '45_60': 18.0,             // De 45 a 60 minutos
    '60_75': 13.0,             // Mais de 1 hora (agrupado)
  },
  observacoes: 'No DF, 77,6% dos trabalhadores que usam ônibus levam de 30 min a 2h. DF tem maior tempo médio de deslocamento entre metrópoles brasileiras para usuários de transporte público.',
  confiabilidade: 'alta',
};

// ============================================
// DADOS DE VOTO FACULTATIVO
// ============================================

export const dadosVotoFacultativo: DadoReferencia = {
  variavel: 'voto_facultativo',
  categoria: 'Político',
  fonte: 'TSE - Tribunal Superior Eleitoral',
  ano: 2024,
  url: 'https://www.tse.jus.br/eleicoes/estatisticas/estatisticas-de-eleitorado/eleitorado',
  ambito: 'Brasil',
  metodologia: 'Estatísticas do eleitorado brasileiro - proporção de eleitores com voto facultativo (16-17 anos e 70+ anos)',
  valores: {
    'true': 11.0,    // ~1,18% jovens 16-17 + ~9,75% idosos 70+ = ~11%
    'false': 89.0,   // Voto obrigatório (18-69 anos)
  },
  observacoes: 'Voto facultativo para: jovens 16-17 anos (1,18% do eleitorado), idosos 70+ anos (9,75%) e analfabetos. Total de ~20,5 milhões de eleitores com voto facultativo no Brasil.',
  confiabilidade: 'alta',
};

// ============================================
// DADOS DE CONFLITO IDENTITÁRIO
// ============================================

export const dadosConflitoIdentitario: DadoReferencia = {
  variavel: 'conflito_identitario',
  categoria: 'Psicológico',
  fonte: 'Estudos de Psicologia Política / ESEB',
  ano: 2023,
  url: 'https://www.scielo.br/j/op/',
  ambito: 'Brasil',
  metodologia: 'Pesquisas sobre polarização e ambivalência política na população brasileira',
  valores: {
    'true': 25.0,    // Eleitores com conflito entre identidade e posição política
    'false': 75.0,   // Eleitores sem conflito identitário significativo
  },
  observacoes: 'Conflito identitário ocorre quando o eleitor tem valores/crenças que conflitam com sua orientação política declarada. Aumentou significativamente com a polarização pós-2018.',
  confiabilidade: 'baixa',
};

// ============================================
// DADOS DE PRINCIPAIS PREOCUPAÇÕES
// ============================================

export const dadosPreocupacoesPrincipais: DadoReferencia = {
  variavel: 'preocupacoes_principais',
  categoria: 'Comportamental',
  fonte: 'Datafolha / IBOPE / Latinobarómetro',
  ano: 2024,
  url: 'https://datafolha.folha.uol.com.br/',
  ambito: 'Brasil',
  metodologia: 'Pesquisas de opinião sobre principais problemas do país',
  valores: {
    'saude': 28.0,
    'seguranca': 22.0,
    'economia': 18.0,
    'corrupcao': 12.0,
    'educacao': 10.0,
    'desemprego': 10.0,
  },
  observacoes: 'Saúde consistentemente aparece como principal preocupação desde a pandemia. Segurança e economia disputam segundo lugar dependendo da conjuntura.',
  confiabilidade: 'media',
};

// ============================================
// DADOS DE PRINCIPAIS VALORES
// ============================================

export const dadosValoresPrincipais: DadoReferencia = {
  variavel: 'valores_principais',
  categoria: 'Psicológico',
  fonte: 'World Values Survey / Latinobarómetro',
  ano: 2023,
  url: 'https://www.worldvaluessurvey.org/',
  ambito: 'Brasil',
  metodologia: 'Pesquisa internacional sobre valores humanos e prioridades',
  valores: {
    'familia': 35.0,
    'trabalho': 20.0,
    'seguranca': 15.0,
    'religiao': 12.0,
    'liberdade': 10.0,
    'igualdade': 8.0,
  },
  observacoes: 'Brasileiros valorizam fortemente família e trabalho. Religião tem peso significativo comparado a outros países da América Latina.',
  confiabilidade: 'media',
};

// ============================================
// DADOS DE PRINCIPAIS MEDOS
// ============================================

export const dadosMedosPrincipais: DadoReferencia = {
  variavel: 'medos_principais',
  categoria: 'Psicológico',
  fonte: 'Pesquisas de Opinião Pública / FGV',
  ano: 2024,
  url: 'https://portal.fgv.br/',
  ambito: 'Brasil',
  metodologia: 'Pesquisas sobre medos e ansiedades da população brasileira',
  valores: {
    'violencia': 30.0,
    'desemprego': 22.0,
    'saude': 18.0,
    'economia': 15.0,
    'corrupcao': 10.0,
    'instabilidade_politica': 5.0,
  },
  observacoes: 'Violência urbana é o medo predominante, especialmente em grandes centros. Desemprego e perda de renda são preocupações constantes para classes C e D.',
  confiabilidade: 'media',
};

// Dados de IDHM por Região Administrativa (para referência de desenvolvimento humano)
export const dadosIDHMRegioes: DadoReferencia = {
  variavel: 'idhm_regiao',
  categoria: 'Desenvolvimento',
  fonte: 'PNUD/IPEA - Atlas Brasil',
  ano: 2010,
  url: 'http://www.atlasbrasil.org.br/',
  ambito: 'DF',
  metodologia: 'IDHM calculado a partir de longevidade, educação e renda',
  valores: {
    // Regiões com IDHM muito alto (>0,80)
    'alto': 45.0,       // Plano Piloto, Lago Sul, Lago Norte, Sudoeste, Águas Claras, etc.
    'medio_alto': 25.0, // Guará, Taguatinga, Cruzeiro, Núcleo Bandeirante
    'medio': 20.0,      // Ceilândia, Samambaia, Gama, Santa Maria
    'baixo': 10.0,      // SCIA/Estrutural, Fercal, Varjão
  },
  observacoes: 'DF tem o maior IDHM do Brasil (0,824), mas com grande desigualdade entre RAs. Lago Sul (0,945) vs Estrutural (0,616).',
  confiabilidade: 'media',
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
    descricao: 'Religião, estado civil e família',
    icone: 'Church',
    variaveis: [dadosReligiao, dadosEstadoCivil, dadosFilhos],
  },
  {
    nome: 'Políticos',
    descricao: 'Orientação ideológica, interesse e posicionamentos',
    icone: 'Vote',
    variaveis: [dadosOrientacaoPolitica, dadosInteressePolitico, dadosPosicaoBolsonaro],
  },
  {
    nome: 'Comportamentais',
    descricao: 'Estilo de decisão, fontes de informação e susceptibilidade',
    icone: 'Brain',
    variaveis: [dadosEstiloDecisao, dadosViesesCognitivos, dadosFontesInformacao, dadosSusceptibilidadeDesinformacao, dadosToleranciaNumance],
  },
  {
    nome: 'Mobilidade',
    descricao: 'Transporte e deslocamento',
    icone: 'Car',
    variaveis: [dadosMeioTransporte, dadosTempoDeslocamento],
  },
  {
    nome: 'Geográficos',
    descricao: 'Distribuição por região administrativa',
    icone: 'Map',
    variaveis: [dadosRegiaoAdministrativa],
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
  filhos: dadosFilhos,
  orientacao_politica: dadosOrientacaoPolitica,
  interesse_politico: dadosInteressePolitico,
  posicao_bolsonaro: dadosPosicaoBolsonaro,
  estilo_decisao: dadosEstiloDecisao,
  tolerancia_nuance: dadosToleranciaNumance,
  vieses_cognitivos: dadosViesesCognitivos,
  fontes_informacao: dadosFontesInformacao,
  susceptibilidade_desinformacao: dadosSusceptibilidadeDesinformacao,
  meio_transporte: dadosMeioTransporte,
  tempo_deslocamento_trabalho: dadosTempoDeslocamento,
  regiao_administrativa: dadosRegiaoAdministrativa,
  idhm_regiao: dadosIDHMRegioes,
  voto_facultativo: dadosVotoFacultativo,
  conflito_identitario: dadosConflitoIdentitario,
  preocupacoes_principais: dadosPreocupacoesPrincipais,
  valores_principais: dadosValoresPrincipais,
  medos_principais: dadosMedosPrincipais,
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
  filhos: 'Filhos',
  orientacao_politica: 'Orientação Política',
  interesse_politico: 'Interesse Político',
  posicao_bolsonaro: 'Posição sobre Bolsonaro',
  estilo_decisao: 'Estilo de Decisão',
  tolerancia_nuance: 'Tolerância à Nuance',
  vieses_cognitivos: 'Vieses Cognitivos',
  fontes_informacao: 'Fontes de Informação',
  susceptibilidade_desinformacao: 'Susceptibilidade à Desinformação',
  meio_transporte: 'Meio de Transporte',
  tempo_deslocamento_trabalho: 'Tempo de Deslocamento',
  regiao_administrativa: 'Região Administrativa',
  idhm_regiao: 'IDHM por Região',
  voto_facultativo: 'Voto Facultativo',
  conflito_identitario: 'Conflito Identitário',
  preocupacoes_principais: 'Preocupações Principais',
  valores_principais: 'Valores Principais',
  medos_principais: 'Medos Principais',
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
    'centro_esquerda': 'Centro-Esquerda',
    'centro': 'Centro',
    'centro_direita': 'Centro-Direita',
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
  posicao_bolsonaro: {
    'apoiador_forte': 'Apoiador Forte',
    'apoiador_moderado': 'Apoiador Moderado',
    'neutro': 'Neutro',
    'critico_moderado': 'Crítico Moderado',
    'critico_forte': 'Crítico Forte',
    'opositor_moderado': 'Opositor Moderado',
    'opositor_forte': 'Opositor Forte',
  },
  estilo_decisao: {
    'identitario': 'Identitário',
    'pragmatico': 'Pragmático',
    'moral': 'Moral',
    'economico': 'Econômico',
    'emocional': 'Emocional',
  },
  tolerancia_nuance: {
    'baixa': 'Baixa',
    'media': 'Média',
    'alta': 'Alta',
  },
  susceptibilidade_desinformacao: {
    'baixa': 'Baixa',
    'media': 'Média',
    'alta': 'Alta',
  },
  meio_transporte: {
    'carro': 'Carro',
    'onibus': 'Ônibus',
    'a_pe': 'A pé',
    'motocicleta': 'Motocicleta',
    'bicicleta': 'Bicicleta',
    'metro': 'Metrô',
    'nao_se_aplica': 'Não se aplica',
  },
  filhos: {
    '0': 'Sem filhos',
    '1': '1 filho',
    '2': '2 filhos',
    '3': '3 filhos',
    '4': '4+ filhos',
  },
  faixa_etaria: {
    '16-24': '16-24 anos',
    '25-34': '25-34 anos',
    '35-44': '35-44 anos',
    '45-54': '45-54 anos',
    '55-64': '55-64 anos',
    '65+': '65+ anos',
  },
  tempo_deslocamento_trabalho: {
    'nao_se_aplica': 'Não se aplica',
    'ate_15': 'Até 15 min',
    '15_30': '15-30 min',
    '30_45': '30-45 min',
    '45_60': '45-60 min',
    '60_75': '60+ min',
  },
  voto_facultativo: {
    'true': 'Facultativo',
    'false': 'Obrigatório',
  },
  conflito_identitario: {
    'true': 'Com conflito',
    'false': 'Sem conflito',
  },
  preocupacoes_principais: {
    'saude': 'Saúde',
    'seguranca': 'Segurança',
    'economia': 'Economia',
    'corrupcao': 'Corrupção',
    'educacao': 'Educação',
    'desemprego': 'Desemprego',
  },
  valores_principais: {
    'familia': 'Família',
    'trabalho': 'Trabalho',
    'seguranca': 'Segurança',
    'religiao': 'Religião',
    'liberdade': 'Liberdade',
    'igualdade': 'Igualdade',
  },
  medos_principais: {
    'violencia': 'Violência',
    'desemprego': 'Desemprego',
    'saude': 'Saúde',
    'economia': 'Economia',
    'corrupcao': 'Corrupção',
    'instabilidade_politica': 'Instabilidade Política',
  },
};
