/**
 * Dados de Pesquisas Eleitorais 2026 - Fontes Oficiais
 *
 * Agregação de pesquisas registradas no TSE para eleições presidenciais.
 * Atualizado: Janeiro 2026
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
  percentual: number;
}

export interface AvaliacaoGoverno {
  otimo: number;
  bom: number;
  regular: number;
  ruim: number;
  pessimo: number;
  naoSabe: number;
}

// Cores dos partidos/candidatos
export const CORES_CANDIDATOS: Record<string, string> = {
  'Lula': '#E31C23',           // PT - Vermelho
  'Flávio Bolsonaro': '#1E3A8A', // PL - Azul escuro
  'Tarcísio de Freitas': '#059669', // Republicanos - Verde
  'Michelle Bolsonaro': '#7C3AED', // PL - Roxo
  'Ratinho Junior': '#F59E0B',    // PSD - Laranja
  'Ronaldo Caiado': '#3B82F6',    // União Brasil - Azul
  'Romeu Zema': '#EC4899',        // Novo - Rosa
  'Eduardo Leite': '#06B6D4',     // PSD - Cyan
  'Ciro Gomes': '#10B981',        // PDT - Verde claro
  'Jair Bolsonaro': '#1E40AF',    // PL - Azul
};

// Dados das pesquisas (fontes oficiais verificadas)
export const PESQUISAS_2026: Pesquisa[] = [
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
    ],
    segundoTurno: [
      {
        cenario: 'Lula x Flávio',
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
        cenario: 'Lula x Ratinho',
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
    avaliacaoGoverno: {
      otimo: 10,
      bom: 22,
      regular: 28,
      ruim: 15,
      pessimo: 23,
      naoSabe: 2,
    },
  },
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
      { candidato: 'Flávio Bolsonaro', partido: 'PL', percentual: 22, cor: CORES_CANDIDATOS['Flávio Bolsonaro'] },
      { candidato: 'Michelle Bolsonaro', partido: 'PL', percentual: 29, cor: CORES_CANDIDATOS['Michelle Bolsonaro'] },
      { candidato: 'Ratinho Junior', partido: 'PSD', percentual: 5.7, cor: CORES_CANDIDATOS['Ratinho Junior'] },
      { candidato: 'Eduardo Leite', partido: 'PSD', percentual: 4.5, cor: CORES_CANDIDATOS['Eduardo Leite'] },
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
        cenario: 'Lula x Flávio',
        candidato1: { nome: 'Lula', partido: 'PT', percentual: 46.2 },
        candidato2: { nome: 'Flávio Bolsonaro', partido: 'PL', percentual: 36 },
        brancoNulo: 11,
        naoSabe: 6.8,
      },
    ],
  },
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
        cenario: 'Lula x Flávio',
        candidato1: { nome: 'Lula', partido: 'PT', percentual: 51 },
        candidato2: { nome: 'Flávio Bolsonaro', partido: 'PL', percentual: 36 },
        brancoNulo: 9,
        naoSabe: 4,
      },
    ],
    avaliacaoGoverno: {
      otimo: 9,
      bom: 23,
      regular: 28,
      ruim: 13,
      pessimo: 25,
      naoSabe: 2,
    },
  },
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
        cenario: 'Lula x Flávio',
        candidato1: { nome: 'Lula', partido: 'PT', percentual: 44.1 },
        candidato2: { nome: 'Flávio Bolsonaro', partido: 'PL', percentual: 41 },
        brancoNulo: 10,
        naoSabe: 4.9,
      },
    ],
  },
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
        cenario: 'Lula x Flávio',
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
  },
];

// Função para calcular média ponderada por tamanho da amostra
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

// Calcular intervalo de confiança agregado
export function calcularIntervaloConfianca(
  media: number,
  pesquisas: Pesquisa[]
): { inferior: number; superior: number } {
  // Usando média das margens de erro ponderada
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

// Tendência temporal (regressão linear simples)
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

  // Ordenar por data
  pontos.sort((a, b) => a.data - b.data);

  // Regressão linear simples
  const n = pontos.length;
  const sumX = pontos.reduce((acc, p) => acc + p.data, 0);
  const sumY = pontos.reduce((acc, p) => acc + p.percentual, 0);
  const sumXY = pontos.reduce((acc, p) => acc + p.data * p.percentual, 0);
  const sumX2 = pontos.reduce((acc, p) => acc + p.data * p.data, 0);

  const inclinacao = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Normalizar para pontos por semana
  const inclinacaoSemanal = inclinacao * (7 * 24 * 60 * 60 * 1000);

  let direcao: 'subindo' | 'estavel' | 'caindo' = 'estavel';
  if (inclinacaoSemanal > 0.5) direcao = 'subindo';
  else if (inclinacaoSemanal < -0.5) direcao = 'caindo';

  return { inclinacao: inclinacaoSemanal, direcao };
}

// Probabilidade de vitória (modelo simplificado)
export function calcularProbabilidadeVitoria(
  mediaCandidate: number,
  margemErro: number,
  distanciaSegundo: number
): number {
  // Usando distribuição normal aproximada
  const z = distanciaSegundo / (margemErro * Math.sqrt(2));

  // Aproximação da função de distribuição cumulativa normal
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

// Dados de série temporal para gráficos
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
