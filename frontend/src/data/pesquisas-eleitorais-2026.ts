/**
 * Dados de Pesquisas Eleitorais 2026 - Fontes Oficiais
 *
 * Agregação de pesquisas registradas no TSE para eleições presidenciais.
 * Atualizado: Janeiro 2026
 *
 * Fontes:
 * - TSE (Tribunal Superior Eleitoral)
 * - Quaest/Genial
 * - Datafolha
 * - AtlasIntel
 * - Paraná Pesquisas
 * - Ipsos-Ipec
 * - Meio/Ideia
 */

export interface Pesquisa {
  id: string;
  instituto: string;
  contratante: string;
  dataInicio: string;
  dataFim: string;
  publicacao: string;
  entrevistados: number;
  margemErro: number;
  confianca: number;
  registroTSE: string;
  metodologia: 'presencial' | 'telefonica' | 'online' | 'mista';
  abrangencia: 'nacional' | 'regional';
  primeiroTurno: ResultadoPrimeiroTurno[];
  segundoTurno: ResultadoSegundoTurno[];
  rejeicao?: ResultadoRejeicao[];
  avaliacaoGoverno?: AvaliacaoGoverno;
}

export interface ResultadoPrimeiroTurno {
  candidato: string;
  partido: string;
  percentual: number;
  cor: string;
}

export interface ResultadoSegundoTurno {
  cenario: string;
  candidato1: { nome: string; partido: string; percentual: number };
  candidato2: { nome: string; partido: string; percentual: number };
  brancoNulo: number;
  naoSabe: number;
}

export interface ResultadoRejeicao {
  candidato: string;
  partido: string;
  percentual: number;
}

export interface AvaliacaoGoverno {
  otimoBom: number;
  regular: number;
  ruimPessimo: number;
  naoSabe: number;
  aprovacao: number;
  desaprovacao: number;
}

export interface PesquisaGovernador {
  id: string;
  estado: string;
  sigla: string;
  instituto: string;
  dataPublicacao: string;
  entrevistados: number;
  margemErro: number;
  candidatos: {
    nome: string;
    partido: string;
    percentual: number;
    cor: string;
  }[];
  aprovacaoGovernador?: {
    nome: string;
    aprovacao: number;
    desaprovacao: number;
  };
}

// Cores dos partidos/candidatos
export const CORES_CANDIDATOS: Record<string, string> = {
  'Lula': '#E31C23',
  'Flávio Bolsonaro': '#1E3A8A',
  'Tarcísio de Freitas': '#059669',
  'Michelle Bolsonaro': '#7C3AED',
  'Ratinho Junior': '#F59E0B',
  'Ronaldo Caiado': '#3B82F6',
  'Romeu Zema': '#EC4899',
  'Eduardo Leite': '#06B6D4',
  'Ciro Gomes': '#10B981',
  'Jair Bolsonaro': '#1E40AF',
  'Aldo Rebelo': '#6B7280',
  'Renan Santos': '#8B5CF6',
  'Fernando Haddad': '#DC2626',
  'Guilherme Boulos': '#7C2D12',
  'Geraldo Alckmin': '#2563EB',
  'Ricardo Nunes': '#0891B2',
};

export const CORES_PARTIDOS: Record<string, string> = {
  'PT': '#E31C23',
  'PL': '#1E3A8A',
  'Republicanos': '#059669',
  'PSD': '#F59E0B',
  'União Brasil': '#3B82F6',
  'Novo': '#EC4899',
  'PSOL': '#7C2D12',
  'PSB': '#2563EB',
  'MDB': '#0891B2',
  'PDT': '#10B981',
  'DC': '#6B7280',
};

// Dados completos das pesquisas (fontes oficiais verificadas)
export const PESQUISAS_2026: Pesquisa[] = [
  // QUAEST - Janeiro 2026
  {
    id: 'quaest-jan-2026',
    instituto: 'Quaest',
    contratante: 'Banco Genial S.A.',
    dataInicio: '2026-01-08',
    dataFim: '2026-01-11',
    publicacao: '2026-01-13',
    entrevistados: 2004,
    margemErro: 2,
    confianca: 95,
    registroTSE: 'BR-00835/2026',
    metodologia: 'presencial',
    abrangencia: 'nacional',
    primeiroTurno: [
      { candidato: 'Lula', partido: 'PT', percentual: 36, cor: CORES_CANDIDATOS['Lula'] },
      { candidato: 'Flávio Bolsonaro', partido: 'PL', percentual: 23, cor: CORES_CANDIDATOS['Flávio Bolsonaro'] },
      { candidato: 'Tarcísio de Freitas', partido: 'Republicanos', percentual: 9, cor: CORES_CANDIDATOS['Tarcísio de Freitas'] },
      { candidato: 'Ratinho Junior', partido: 'PSD', percentual: 7, cor: CORES_CANDIDATOS['Ratinho Junior'] },
      { candidato: 'Ronaldo Caiado', partido: 'União Brasil', percentual: 3, cor: CORES_CANDIDATOS['Ronaldo Caiado'] },
      { candidato: 'Romeu Zema', partido: 'Novo', percentual: 2, cor: CORES_CANDIDATOS['Romeu Zema'] },
      { candidato: 'Renan Santos', partido: 'Missão', percentual: 1, cor: CORES_CANDIDATOS['Renan Santos'] },
      { candidato: 'Aldo Rebelo', partido: 'DC', percentual: 1, cor: CORES_CANDIDATOS['Aldo Rebelo'] },
    ],
    segundoTurno: [
      {
        cenario: 'Lula x Flávio Bolsonaro',
        candidato1: { nome: 'Lula', partido: 'PT', percentual: 44 },
        candidato2: { nome: 'Flávio Bolsonaro', partido: 'PL', percentual: 38 },
        brancoNulo: 12,
        naoSabe: 6,
      },
      {
        cenario: 'Lula x Tarcísio',
        candidato1: { nome: 'Lula', partido: 'PT', percentual: 45 },
        candidato2: { nome: 'Tarcísio de Freitas', partido: 'Republicanos', percentual: 39 },
        brancoNulo: 10,
        naoSabe: 6,
      },
      {
        cenario: 'Lula x Ratinho Jr',
        candidato1: { nome: 'Lula', partido: 'PT', percentual: 43 },
        candidato2: { nome: 'Ratinho Junior', partido: 'PSD', percentual: 36 },
        brancoNulo: 14,
        naoSabe: 7,
      },
      {
        cenario: 'Lula x Caiado',
        candidato1: { nome: 'Lula', partido: 'PT', percentual: 44 },
        candidato2: { nome: 'Ronaldo Caiado', partido: 'União Brasil', percentual: 33 },
        brancoNulo: 15,
        naoSabe: 8,
      },
      {
        cenario: 'Lula x Zema',
        candidato1: { nome: 'Lula', partido: 'PT', percentual: 46 },
        candidato2: { nome: 'Romeu Zema', partido: 'Novo', percentual: 31 },
        brancoNulo: 15,
        naoSabe: 8,
      },
    ],
    rejeicao: [
      { candidato: 'Lula', partido: 'PT', percentual: 56 },
      { candidato: 'Flávio Bolsonaro', partido: 'PL', percentual: 55 },
      { candidato: 'Michelle Bolsonaro', partido: 'PL', percentual: 52 },
      { candidato: 'Tarcísio de Freitas', partido: 'Republicanos', percentual: 38 },
      { candidato: 'Ronaldo Caiado', partido: 'União Brasil', percentual: 35 },
      { candidato: 'Ratinho Junior', partido: 'PSD', percentual: 34 },
      { candidato: 'Romeu Zema', partido: 'Novo', percentual: 33 },
    ],
    avaliacaoGoverno: {
      otimoBom: 32,
      regular: 27,
      ruimPessimo: 39,
      naoSabe: 2,
      aprovacao: 47,
      desaprovacao: 49,
    },
  },

  // MEIO/IDEIA - Janeiro 2026
  {
    id: 'meio-ideia-jan-2026',
    instituto: 'Ideia',
    contratante: 'Meio',
    dataInicio: '2026-01-08',
    dataFim: '2026-01-12',
    publicacao: '2026-01-14',
    entrevistados: 2000,
    margemErro: 2.2,
    confianca: 95,
    registroTSE: 'BR-06731/2026',
    metodologia: 'telefonica',
    abrangencia: 'nacional',
    primeiroTurno: [
      { candidato: 'Lula', partido: 'PT', percentual: 40.2, cor: CORES_CANDIDATOS['Lula'] },
      { candidato: 'Tarcísio de Freitas', partido: 'Republicanos', percentual: 32.7, cor: CORES_CANDIDATOS['Tarcísio de Freitas'] },
      { candidato: 'Ratinho Junior', partido: 'PSD', percentual: 5.7, cor: CORES_CANDIDATOS['Ratinho Junior'] },
      { candidato: 'Eduardo Leite', partido: 'PSD', percentual: 4.5, cor: CORES_CANDIDATOS['Eduardo Leite'] },
      { candidato: 'Ronaldo Caiado', partido: 'União Brasil', percentual: 3.8, cor: CORES_CANDIDATOS['Ronaldo Caiado'] },
      { candidato: 'Romeu Zema', partido: 'Novo', percentual: 2.9, cor: CORES_CANDIDATOS['Romeu Zema'] },
    ],
    segundoTurno: [
      {
        cenario: 'Lula x Tarcísio',
        candidato1: { nome: 'Lula', partido: 'PT', percentual: 44.4 },
        candidato2: { nome: 'Tarcísio de Freitas', partido: 'Republicanos', percentual: 42.1 },
        brancoNulo: 8,
        naoSabe: 5.5,
      },
      {
        cenario: 'Lula x Michelle',
        candidato1: { nome: 'Lula', partido: 'PT', percentual: 46 },
        candidato2: { nome: 'Michelle Bolsonaro', partido: 'PL', percentual: 39 },
        brancoNulo: 9,
        naoSabe: 6,
      },
      {
        cenario: 'Lula x Flávio Bolsonaro',
        candidato1: { nome: 'Lula', partido: 'PT', percentual: 46.2 },
        candidato2: { nome: 'Flávio Bolsonaro', partido: 'PL', percentual: 36 },
        brancoNulo: 11,
        naoSabe: 6.8,
      },
    ],
    rejeicao: [
      { candidato: 'Lula', partido: 'PT', percentual: 40.8 },
      { candidato: 'Flávio Bolsonaro', partido: 'PL', percentual: 30 },
      { candidato: 'Michelle Bolsonaro', partido: 'PL', percentual: 26.1 },
      { candidato: 'Tarcísio de Freitas', partido: 'Republicanos', percentual: 16.2 },
      { candidato: 'Romeu Zema', partido: 'Novo', percentual: 12.8 },
      { candidato: 'Ratinho Junior', partido: 'PSD', percentual: 12.5 },
      { candidato: 'Eduardo Leite', partido: 'PSD', percentual: 12.1 },
      { candidato: 'Ronaldo Caiado', partido: 'União Brasil', percentual: 10.5 },
    ],
  },

  // DATAFOLHA - Dezembro 2025
  {
    id: 'datafolha-dez-2025',
    instituto: 'Datafolha',
    contratante: 'Folha de São Paulo / TV Globo',
    dataInicio: '2025-12-02',
    dataFim: '2025-12-04',
    publicacao: '2025-12-05',
    entrevistados: 2002,
    margemErro: 2,
    confianca: 95,
    registroTSE: 'BR-09182/2025',
    metodologia: 'presencial',
    abrangencia: 'nacional',
    primeiroTurno: [
      { candidato: 'Lula', partido: 'PT', percentual: 41, cor: CORES_CANDIDATOS['Lula'] },
      { candidato: 'Flávio Bolsonaro', partido: 'PL', percentual: 18, cor: CORES_CANDIDATOS['Flávio Bolsonaro'] },
      { candidato: 'Ratinho Junior', partido: 'PSD', percentual: 12, cor: CORES_CANDIDATOS['Ratinho Junior'] },
      { candidato: 'Ronaldo Caiado', partido: 'União Brasil', percentual: 7, cor: CORES_CANDIDATOS['Ronaldo Caiado'] },
      { candidato: 'Romeu Zema', partido: 'Novo', percentual: 6, cor: CORES_CANDIDATOS['Romeu Zema'] },
      { candidato: 'Tarcísio de Freitas', partido: 'Republicanos', percentual: 5, cor: CORES_CANDIDATOS['Tarcísio de Freitas'] },
    ],
    segundoTurno: [
      {
        cenario: 'Lula x Flávio Bolsonaro',
        candidato1: { nome: 'Lula', partido: 'PT', percentual: 51 },
        candidato2: { nome: 'Flávio Bolsonaro', partido: 'PL', percentual: 36 },
        brancoNulo: 9,
        naoSabe: 4,
      },
    ],
    avaliacaoGoverno: {
      otimoBom: 32,
      regular: 28,
      ruimPessimo: 38,
      naoSabe: 2,
      aprovacao: 47,
      desaprovacao: 49,
    },
  },

  // ATLAS INTEL - Dezembro 2025
  {
    id: 'atlasintel-dez-2025',
    instituto: 'AtlasIntel',
    contratante: 'Bloomberg',
    dataInicio: '2025-12-15',
    dataFim: '2025-12-18',
    publicacao: '2025-12-18',
    entrevistados: 2500,
    margemErro: 2,
    confianca: 95,
    registroTSE: 'BR-09401/2025',
    metodologia: 'online',
    abrangencia: 'nacional',
    primeiroTurno: [
      { candidato: 'Lula', partido: 'PT', percentual: 44.1, cor: CORES_CANDIDATOS['Lula'] },
      { candidato: 'Tarcísio de Freitas', partido: 'Republicanos', percentual: 33.1, cor: CORES_CANDIDATOS['Tarcísio de Freitas'] },
      { candidato: 'Ronaldo Caiado', partido: 'União Brasil', percentual: 4.7, cor: CORES_CANDIDATOS['Ronaldo Caiado'] },
      { candidato: 'Ratinho Junior', partido: 'PSD', percentual: 4.2, cor: CORES_CANDIDATOS['Ratinho Junior'] },
      { candidato: 'Romeu Zema', partido: 'Novo', percentual: 3.8, cor: CORES_CANDIDATOS['Romeu Zema'] },
    ],
    segundoTurno: [
      {
        cenario: 'Lula x Tarcísio',
        candidato1: { nome: 'Lula', partido: 'PT', percentual: 48.8 },
        candidato2: { nome: 'Tarcísio de Freitas', partido: 'Republicanos', percentual: 42.5 },
        brancoNulo: 5,
        naoSabe: 3.7,
      },
      {
        cenario: 'Lula x Flávio Bolsonaro',
        candidato1: { nome: 'Lula', partido: 'PT', percentual: 48.1 },
        candidato2: { nome: 'Flávio Bolsonaro', partido: 'PL', percentual: 29.3 },
        brancoNulo: 14,
        naoSabe: 8.6,
      },
    ],
  },

  // PARANÁ PESQUISAS - Dezembro 2025
  {
    id: 'parana-pesquisas-dez-2025',
    instituto: 'Paraná Pesquisas',
    contratante: 'Paraná Pesquisas',
    dataInicio: '2025-12-18',
    dataFim: '2025-12-22',
    publicacao: '2025-12-23',
    entrevistados: 2020,
    margemErro: 2.2,
    confianca: 95,
    registroTSE: 'BR-09455/2025',
    metodologia: 'telefonica',
    abrangencia: 'nacional',
    primeiroTurno: [
      { candidato: 'Lula', partido: 'PT', percentual: 36.9, cor: CORES_CANDIDATOS['Lula'] },
      { candidato: 'Jair Bolsonaro', partido: 'PL', percentual: 31.3, cor: CORES_CANDIDATOS['Jair Bolsonaro'] },
      { candidato: 'Tarcísio de Freitas', partido: 'Republicanos', percentual: 8.5, cor: CORES_CANDIDATOS['Tarcísio de Freitas'] },
      { candidato: 'Ronaldo Caiado', partido: 'União Brasil', percentual: 5.2, cor: CORES_CANDIDATOS['Ronaldo Caiado'] },
      { candidato: 'Romeu Zema', partido: 'Novo', percentual: 3.8, cor: CORES_CANDIDATOS['Romeu Zema'] },
    ],
    segundoTurno: [
      {
        cenario: 'Lula x Flávio Bolsonaro',
        candidato1: { nome: 'Lula', partido: 'PT', percentual: 44.1 },
        candidato2: { nome: 'Flávio Bolsonaro', partido: 'PL', percentual: 41 },
        brancoNulo: 10,
        naoSabe: 4.9,
      },
    ],
    rejeicao: [
      { candidato: 'Flávio Bolsonaro', partido: 'PL', percentual: 51.8 },
      { candidato: 'Jair Bolsonaro', partido: 'PL', percentual: 50 },
      { candidato: 'Lula', partido: 'PT', percentual: 48.6 },
      { candidato: 'Michelle Bolsonaro', partido: 'PL', percentual: 47.9 },
      { candidato: 'Tarcísio de Freitas', partido: 'Republicanos', percentual: 38.8 },
    ],
  },

  // QUAEST - Dezembro 2025
  {
    id: 'quaest-dez-2025',
    instituto: 'Quaest',
    contratante: 'Banco Genial S.A.',
    dataInicio: '2025-12-11',
    dataFim: '2025-12-14',
    publicacao: '2025-12-16',
    entrevistados: 2004,
    margemErro: 2,
    confianca: 95,
    registroTSE: 'BR-09301/2025',
    metodologia: 'presencial',
    abrangencia: 'nacional',
    primeiroTurno: [
      { candidato: 'Lula', partido: 'PT', percentual: 38, cor: CORES_CANDIDATOS['Lula'] },
      { candidato: 'Flávio Bolsonaro', partido: 'PL', percentual: 21, cor: CORES_CANDIDATOS['Flávio Bolsonaro'] },
      { candidato: 'Tarcísio de Freitas', partido: 'Republicanos', percentual: 10, cor: CORES_CANDIDATOS['Tarcísio de Freitas'] },
      { candidato: 'Ratinho Junior', partido: 'PSD', percentual: 6, cor: CORES_CANDIDATOS['Ratinho Junior'] },
      { candidato: 'Ronaldo Caiado', partido: 'União Brasil', percentual: 4, cor: CORES_CANDIDATOS['Ronaldo Caiado'] },
    ],
    segundoTurno: [
      {
        cenario: 'Lula x Flávio Bolsonaro',
        candidato1: { nome: 'Lula', partido: 'PT', percentual: 46 },
        candidato2: { nome: 'Flávio Bolsonaro', partido: 'PL', percentual: 36 },
        brancoNulo: 12,
        naoSabe: 6,
      },
      {
        cenario: 'Lula x Tarcísio',
        candidato1: { nome: 'Lula', partido: 'PT', percentual: 45 },
        candidato2: { nome: 'Tarcísio de Freitas', partido: 'Republicanos', percentual: 35 },
        brancoNulo: 13,
        naoSabe: 7,
      },
    ],
    avaliacaoGoverno: {
      otimoBom: 34,
      regular: 25,
      ruimPessimo: 38,
      naoSabe: 3,
      aprovacao: 48,
      desaprovacao: 48,
    },
  },

  // IPSOS/IPEC - Dezembro 2025
  {
    id: 'ipsos-ipec-dez-2025',
    instituto: 'Ipsos/Ipec',
    contratante: 'Ipsos',
    dataInicio: '2025-12-05',
    dataFim: '2025-12-08',
    publicacao: '2025-12-10',
    entrevistados: 2000,
    margemErro: 2,
    confianca: 95,
    registroTSE: 'BR-09215/2025',
    metodologia: 'presencial',
    abrangencia: 'nacional',
    primeiroTurno: [
      { candidato: 'Lula', partido: 'PT', percentual: 39, cor: CORES_CANDIDATOS['Lula'] },
      { candidato: 'Flávio Bolsonaro', partido: 'PL', percentual: 20, cor: CORES_CANDIDATOS['Flávio Bolsonaro'] },
      { candidato: 'Tarcísio de Freitas', partido: 'Republicanos', percentual: 11, cor: CORES_CANDIDATOS['Tarcísio de Freitas'] },
      { candidato: 'Michelle Bolsonaro', partido: 'PL', percentual: 8, cor: CORES_CANDIDATOS['Michelle Bolsonaro'] },
      { candidato: 'Ratinho Junior', partido: 'PSD', percentual: 5, cor: CORES_CANDIDATOS['Ratinho Junior'] },
      { candidato: 'Ronaldo Caiado', partido: 'União Brasil', percentual: 4, cor: CORES_CANDIDATOS['Ronaldo Caiado'] },
    ],
    segundoTurno: [
      {
        cenario: 'Lula x Flávio Bolsonaro',
        candidato1: { nome: 'Lula', partido: 'PT', percentual: 47 },
        candidato2: { nome: 'Flávio Bolsonaro', partido: 'PL', percentual: 37 },
        brancoNulo: 10,
        naoSabe: 6,
      },
      {
        cenario: 'Lula x Tarcísio',
        candidato1: { nome: 'Lula', partido: 'PT', percentual: 46 },
        candidato2: { nome: 'Tarcísio de Freitas', partido: 'Republicanos', percentual: 38 },
        brancoNulo: 10,
        naoSabe: 6,
      },
    ],
    rejeicao: [
      { candidato: 'Lula', partido: 'PT', percentual: 44 },
      { candidato: 'Flávio Bolsonaro', partido: 'PL', percentual: 35 },
      { candidato: 'Eduardo Leite', partido: 'PSD', percentual: 32 },
      { candidato: 'Michelle Bolsonaro', partido: 'PL', percentual: 30 },
      { candidato: 'Ratinho Junior', partido: 'PSD', percentual: 13 },
      { candidato: 'Romeu Zema', partido: 'Novo', percentual: 13 },
      { candidato: 'Tarcísio de Freitas', partido: 'Republicanos', percentual: 11 },
      { candidato: 'Ronaldo Caiado', partido: 'União Brasil', percentual: 10 },
    ],
  },
];

// Dados de pesquisas para governadores
export const PESQUISAS_GOVERNADORES: PesquisaGovernador[] = [
  // SÃO PAULO
  {
    id: 'sp-parana-out-2025',
    estado: 'São Paulo',
    sigla: 'SP',
    instituto: 'Paraná Pesquisas',
    dataPublicacao: '2025-10-14',
    entrevistados: 1680,
    margemErro: 2.4,
    candidatos: [
      { nome: 'Tarcísio de Freitas', partido: 'Republicanos', percentual: 50.1, cor: CORES_CANDIDATOS['Tarcísio de Freitas'] },
      { nome: 'Fernando Haddad', partido: 'PT', percentual: 25.1, cor: CORES_CANDIDATOS['Fernando Haddad'] },
      { nome: 'Erika Hilton', partido: 'PSOL', percentual: 8.8, cor: CORES_PARTIDOS['PSOL'] },
      { nome: 'Guilherme Boulos', partido: 'PSOL', percentual: 1.1, cor: CORES_CANDIDATOS['Guilherme Boulos'] },
    ],
    aprovacaoGovernador: {
      nome: 'Tarcísio de Freitas',
      aprovacao: 67.4,
      desaprovacao: 19.1,
    },
  },
];

// Avaliação do Governo Lula - Série Histórica
export const AVALIACAO_GOVERNO_HISTORICO = [
  { data: '2025-10-01', aprovacao: 46, desaprovacao: 50, regular: 28 },
  { data: '2025-11-01', aprovacao: 47, desaprovacao: 49, regular: 27 },
  { data: '2025-12-01', aprovacao: 48, desaprovacao: 48, regular: 25 },
  { data: '2026-01-13', aprovacao: 47, desaprovacao: 49, regular: 27 },
];

// Avaliação regional
export const AVALIACAO_REGIONAL = {
  nordeste: { aprovacao: 67, desaprovacao: 30 },
  sudeste: { aprovacao: 40, desaprovacao: 56 },
  sul: { aprovacao: 32, desaprovacao: 64 },
  centroOeste: { aprovacao: 38, desaprovacao: 58 },
  norte: { aprovacao: 52, desaprovacao: 44 },
};

// ========== FUNÇÕES DE CÁLCULO ==========

export function calcularMediaPonderada(pesquisas: Pesquisa[], candidato: string): number {
  let somaPercentuais = 0;
  let somaEntrevistados = 0;

  pesquisas.forEach((p) => {
    const resultado = p.primeiroTurno.find((r) => r.candidato === candidato);
    if (resultado) {
      somaPercentuais += resultado.percentual * p.entrevistados;
      somaEntrevistados += p.entrevistados;
    }
  });

  return somaEntrevistados > 0 ? somaPercentuais / somaEntrevistados : 0;
}

export function calcularIntervaloConfianca(
  media: number,
  pesquisas: Pesquisa[]
): { inferior: number; superior: number } {
  let somaMargens = 0;
  let count = 0;

  pesquisas.forEach((p) => {
    somaMargens += p.margemErro;
    count++;
  });

  const margemMedia = count > 0 ? somaMargens / count : 2;

  return {
    inferior: Math.max(0, media - margemMedia),
    superior: Math.min(100, media + margemMedia),
  };
}

export function calcularTendencia(
  pesquisas: Pesquisa[],
  candidato: string
): { inclinacao: number; direcao: 'subindo' | 'estavel' | 'caindo' } {
  const pontos = pesquisas
    .map((p) => {
      const resultado = p.primeiroTurno.find((r) => r.candidato === candidato);
      if (!resultado) return null;
      return {
        data: new Date(p.publicacao).getTime(),
        percentual: resultado.percentual,
      };
    })
    .filter(Boolean) as { data: number; percentual: number }[];

  if (pontos.length < 2) return { inclinacao: 0, direcao: 'estavel' };

  pontos.sort((a, b) => a.data - b.data);

  const n = pontos.length;
  const sumX = pontos.reduce((acc, p) => acc + p.data, 0);
  const sumY = pontos.reduce((acc, p) => acc + p.percentual, 0);
  const sumXY = pontos.reduce((acc, p) => acc + p.data * p.percentual, 0);
  const sumX2 = pontos.reduce((acc, p) => acc + p.data * p.data, 0);

  const inclinacao = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const inclinacaoSemanal = inclinacao * (7 * 24 * 60 * 60 * 1000);

  let direcao: 'subindo' | 'estavel' | 'caindo' = 'estavel';
  if (inclinacaoSemanal > 0.5) direcao = 'subindo';
  else if (inclinacaoSemanal < -0.5) direcao = 'caindo';

  return { inclinacao: inclinacaoSemanal, direcao };
}

export function calcularProbabilidadeVitoria(
  mediaCandidate: number,
  margemErro: number,
  distanciaSegundo: number
): number {
  const z = distanciaSegundo / (margemErro * Math.sqrt(2));

  const cdf = (x: number) => {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);
    const t = 1 / (1 + p * x);
    const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return 0.5 * (1 + sign * y);
  };

  return Math.round(cdf(z) * 100);
}

export function gerarSerieTemporalCandidato(
  pesquisas: Pesquisa[],
  candidato: string
): { data: string; percentual: number; instituto: string; margemErro: number }[] {
  return pesquisas
    .map((p) => {
      const resultado = p.primeiroTurno.find((r) => r.candidato === candidato);
      if (!resultado) return null;
      return {
        data: p.publicacao,
        percentual: resultado.percentual,
        instituto: p.instituto,
        margemErro: p.margemErro,
      };
    })
    .filter(Boolean) as { data: string; percentual: number; instituto: string; margemErro: number }[];
}

export function calcularRejeicaoMedia(pesquisas: Pesquisa[], candidato: string): number {
  const valores: number[] = [];

  pesquisas.forEach((p) => {
    if (p.rejeicao) {
      const r = p.rejeicao.find((x) => x.candidato === candidato);
      if (r) valores.push(r.percentual);
    }
  });

  return valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
}

export function obterUltimaAvaliacaoGoverno(): AvaliacaoGoverno | null {
  const pesquisaComAvaliacao = PESQUISAS_2026.find((p) => p.avaliacaoGoverno);
  return pesquisaComAvaliacao?.avaliacaoGoverno || null;
}
