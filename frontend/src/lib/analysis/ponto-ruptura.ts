/**
 * Algoritmo de Detecção de Ponto de Ruptura
 * Identifica o que faria cada eleitor mudar de lado
 * Pesquisa Eleitoral DF 2026
 */

import type { Eleitor } from '@/types';

export interface PontoRuptura {
  agente_id: string;
  agente_nome: string;
  perfil_resumido: string;
  orientacao_atual: string;

  // Análise
  linhas_vermelhas: string[];
  gatilho_mudanca: string;
  probabilidade_ruptura: number; // 0-100

  // Evidências
  citacao_reveladora: string;
  valores_em_conflito: string[];

  // Insight
  vulnerabilidade: 'alta' | 'media' | 'baixa';
  estrategia_persuasao?: string;
}

export interface LinhaVermelhaAgrupada {
  linha_vermelha: string;
  quantidade: number;
  percentual: number;
  citacao_exemplo: string;
}

export interface AnalisePontoRuptura {
  total_analisados: number;

  // Por grupo político
  apoiadores_bolsonaro: {
    total: number;
    linhas_vermelhas: LinhaVermelhaAgrupada[];
    vulnerabilidade_media: number;
  };

  oposicao: {
    total: number;
    linhas_vermelhas: LinhaVermelhaAgrupada[];
    vulnerabilidade_media: number;
  };

  indecisos: {
    total: number;
    linhas_vermelhas: LinhaVermelhaAgrupada[];
    vulnerabilidade_media: number;
  };

  eleitores: PontoRuptura[];
}

// Linhas vermelhas predefinidas por perfil
const LINHAS_VERMELHAS_DIREITA = [
  { gatilho: 'Aumento de impostos sobre patrimônio/renda', peso: 0.9, perfis: ['empresario', 'autonomo', 'alto'] },
  { gatilho: 'Desemprego ou falência do negócio', peso: 0.85, perfis: ['empresario', 'autonomo', 'clt'] },
  { gatilho: 'Aumento da criminalidade no bairro', peso: 0.8, perfis: ['todos'] },
  { gatilho: 'Escândalo de corrupção envolvendo aliados', peso: 0.7, perfis: ['alta_escolaridade'] },
  { gatilho: 'Perda de benefícios ou programas sociais', peso: 0.75, perfis: ['baixa_renda'] },
  { gatilho: 'Ataque direto à liberdade religiosa', peso: 0.85, perfis: ['evangelico', 'catolico'] },
  { gatilho: 'Inflação descontrolada', peso: 0.9, perfis: ['todos'] },
];

const LINHAS_VERMELHAS_ESQUERDA = [
  { gatilho: 'Escândalo de corrupção do candidato', peso: 0.9, perfis: ['alta_escolaridade'] },
  { gatilho: 'Aumento da violência e insegurança', peso: 0.8, perfis: ['periferia'] },
  { gatilho: 'Desemprego persistente', peso: 0.85, perfis: ['todos'] },
  { gatilho: 'Perda de direitos trabalhistas', peso: 0.9, perfis: ['clt', 'servidor'] },
  { gatilho: 'Ataque a programas sociais (Bolsa Família, etc)', peso: 0.95, perfis: ['baixa_renda'] },
  { gatilho: 'Censura ou ataque à imprensa', peso: 0.7, perfis: ['alta_escolaridade'] },
  { gatilho: 'Retrocesso em direitos das minorias', peso: 0.8, perfis: ['jovem', 'alta_escolaridade'] },
];

const LINHAS_VERMELHAS_CENTRO = [
  { gatilho: 'Extremismo de qualquer lado', peso: 0.9, perfis: ['todos'] },
  { gatilho: 'Instabilidade econômica', peso: 0.85, perfis: ['todos'] },
  { gatilho: 'Polarização excessiva', peso: 0.8, perfis: ['alta_escolaridade'] },
  { gatilho: 'Escândalos de corrupção', peso: 0.9, perfis: ['todos'] },
  { gatilho: 'Ameaça às instituições democráticas', peso: 0.85, perfis: ['alta_escolaridade'] },
];

/**
 * Analisa pontos de ruptura de todos os eleitores
 */
export function analisarPontosRuptura(eleitores: Eleitor[]): AnalisePontoRuptura {
  const pontosRuptura: PontoRuptura[] = [];

  for (const eleitor of eleitores) {
    const analise = analisarEleitor(eleitor);
    pontosRuptura.push(analise);
  }

  // Agrupar por orientação política
  const apoiadores = pontosRuptura.filter(p =>
    p.orientacao_atual.toLowerCase().includes('direita') ||
    p.orientacao_atual.toLowerCase().includes('apoiador')
  );

  const oposicao = pontosRuptura.filter(p =>
    p.orientacao_atual.toLowerCase().includes('esquerda') ||
    p.orientacao_atual.toLowerCase().includes('critico')
  );

  const indecisos = pontosRuptura.filter(p =>
    p.orientacao_atual.toLowerCase().includes('centro') ||
    p.orientacao_atual.toLowerCase().includes('neutro')
  );

  return {
    total_analisados: eleitores.length,
    apoiadores_bolsonaro: {
      total: apoiadores.length,
      linhas_vermelhas: agruparLinhasVermelhas(apoiadores),
      vulnerabilidade_media: calcularVulnerabilidadeMedia(apoiadores),
    },
    oposicao: {
      total: oposicao.length,
      linhas_vermelhas: agruparLinhasVermelhas(oposicao),
      vulnerabilidade_media: calcularVulnerabilidadeMedia(oposicao),
    },
    indecisos: {
      total: indecisos.length,
      linhas_vermelhas: agruparLinhasVermelhas(indecisos),
      vulnerabilidade_media: calcularVulnerabilidadeMedia(indecisos),
    },
    eleitores: pontosRuptura,
  };
}

function analisarEleitor(eleitor: Eleitor): PontoRuptura {
  const orientacao = eleitor.orientacao_politica?.toLowerCase() ?? 'centro';
  const posicao = eleitor.posicao_bolsonaro?.toLowerCase() ?? 'neutro';

  // Determinar orientação combinada
  let orientacaoAtual = 'Centro/Neutro';
  if (orientacao.includes('direita') || posicao.includes('apoiador')) {
    orientacaoAtual = 'Direita/Apoiador';
  } else if (orientacao.includes('esquerda') || posicao.includes('critico')) {
    orientacaoAtual = 'Esquerda/Oposição';
  }

  // Selecionar linhas vermelhas relevantes
  let linhasRelevantes = LINHAS_VERMELHAS_CENTRO;
  if (orientacaoAtual.includes('Direita')) {
    linhasRelevantes = LINHAS_VERMELHAS_DIREITA;
  } else if (orientacaoAtual.includes('Esquerda')) {
    linhasRelevantes = LINHAS_VERMELHAS_ESQUERDA;
  }

  // Calcular pontuação de cada linha vermelha para este eleitor
  const linhasComScore = linhasRelevantes.map(linha => ({
    ...linha,
    score: calcularScoreLinha(eleitor, linha),
  }));

  // Ordenar por score e pegar as top 3
  linhasComScore.sort((a, b) => b.score - a.score);
  const topLinhas = linhasComScore.slice(0, 3);

  // Calcular probabilidade de ruptura
  const probabilidadeRuptura = calcularProbabilidadeRuptura(eleitor);

  // Determinar vulnerabilidade
  let vulnerabilidade: 'alta' | 'media' | 'baixa' = 'baixa';
  if (probabilidadeRuptura >= 70) vulnerabilidade = 'alta';
  else if (probabilidadeRuptura >= 40) vulnerabilidade = 'media';

  // Valores em conflito
  const valoresConflito = identificarValoresConflito(eleitor);

  return {
    agente_id: eleitor.id,
    agente_nome: eleitor.nome,
    perfil_resumido: `${eleitor.profissao}, ${eleitor.idade} anos, ${eleitor.regiao_administrativa}`,
    orientacao_atual: orientacaoAtual,
    linhas_vermelhas: topLinhas.map(l => l.gatilho),
    gatilho_mudanca: topLinhas[0]?.gatilho ?? 'Não identificado',
    probabilidade_ruptura: probabilidadeRuptura,
    citacao_reveladora: gerarCitacaoRuptura(eleitor, topLinhas[0]?.gatilho ?? ''),
    valores_em_conflito: valoresConflito,
    vulnerabilidade,
    estrategia_persuasao: gerarEstrategia(eleitor, topLinhas[0]?.gatilho ?? '', vulnerabilidade),
  };
}

function calcularScoreLinha(
  eleitor: Eleitor,
  linha: { gatilho: string; peso: number; perfis: string[] }
): number {
  let score = linha.peso * 100;

  // Ajustar por perfil
  for (const perfil of linha.perfis) {
    if (perfil === 'todos') continue;

    if (perfil === 'empresario' && eleitor.ocupacao_vinculo?.toLowerCase().includes('empresar')) {
      score += 10;
    }
    if (perfil === 'autonomo' && eleitor.ocupacao_vinculo?.toLowerCase().includes('auton')) {
      score += 10;
    }
    if (perfil === 'clt' && eleitor.ocupacao_vinculo?.toLowerCase().includes('clt')) {
      score += 10;
    }
    if (perfil === 'servidor' && eleitor.ocupacao_vinculo?.toLowerCase().includes('servidor')) {
      score += 10;
    }
    if (perfil === 'alta_escolaridade' &&
        (eleitor.escolaridade?.toLowerCase().includes('superior') ||
         eleitor.escolaridade?.toLowerCase().includes('pós'))) {
      score += 10;
    }
    if (perfil === 'baixa_renda' &&
        eleitor.renda_salarios_minimos?.toLowerCase().includes('até')) {
      score += 15;
    }
    if (perfil === 'evangelico' && eleitor.religiao?.toLowerCase().includes('evangel')) {
      score += 15;
    }
    if (perfil === 'catolico' && eleitor.religiao?.toLowerCase().includes('catol')) {
      score += 10;
    }
    if (perfil === 'periferia' &&
        ['ceilândia', 'samambaia', 'recanto', 'santa maria', 'estrutural'].some(
          r => eleitor.regiao_administrativa?.toLowerCase().includes(r)
        )) {
      score += 10;
    }
    if (perfil === 'jovem' && eleitor.idade < 35) {
      score += 10;
    }
  }

  // Ajustar por medos do eleitor
  const medos = eleitor.medos ?? [];
  for (const medo of medos) {
    const medoLower = medo.toLowerCase();
    if (linha.gatilho.toLowerCase().includes('desemprego') && medoLower.includes('desemprego')) {
      score += 20;
    }
    if (linha.gatilho.toLowerCase().includes('violência') && medoLower.includes('violência')) {
      score += 20;
    }
    if (linha.gatilho.toLowerCase().includes('corrupção') && medoLower.includes('corrupção')) {
      score += 20;
    }
    if (linha.gatilho.toLowerCase().includes('inflação') && medoLower.includes('economia')) {
      score += 15;
    }
  }

  return Math.min(score, 100);
}

function calcularProbabilidadeRuptura(eleitor: Eleitor): number {
  let prob = 30; // Base

  // Tolerância a nuances alta = mais flexível
  if (eleitor.tolerancia_nuance === 'alta') prob += 20;
  else if (eleitor.tolerancia_nuance === 'media') prob += 10;

  // Interesse político baixo = mais volátil
  if (eleitor.interesse_politico === 'baixo') prob += 15;

  // Posição moderada = mais suscetível a mudar
  const posicao = eleitor.posicao_bolsonaro?.toLowerCase() ?? '';
  if (posicao.includes('moderado') || posicao.includes('neutro')) {
    prob += 20;
  }

  // Orientação centro = mais flexível
  const orientacao = eleitor.orientacao_politica?.toLowerCase() ?? '';
  if (orientacao === 'centro') {
    prob += 15;
  }

  // Estilo pragmático = muda por resultado
  if (eleitor.estilo_decisao?.toLowerCase().includes('pragmat')) {
    prob += 10;
  }

  // Susceptibilidade alta = mais influenciável
  if ((eleitor.susceptibilidade_desinformacao ?? 5) > 7) {
    prob += 10;
  }

  return Math.min(prob, 100);
}

function identificarValoresConflito(eleitor: Eleitor): string[] {
  const conflitos: string[] = [];
  const valores = eleitor.valores ?? [];
  const medos = eleitor.medos ?? [];

  // Conflito família vs economia
  const temFamilia = valores.some(v => v.toLowerCase().includes('família'));
  const temEconomia = valores.some(v => v.toLowerCase().includes('econom') || v.toLowerCase().includes('trabalho'));
  if (temFamilia && temEconomia) {
    conflitos.push('Família vs. Necessidades econômicas');
  }

  // Conflito segurança vs liberdade
  const temSeguranca = valores.some(v => v.toLowerCase().includes('segurança')) ||
    medos.some(m => m.toLowerCase().includes('violência'));
  const temLiberdade = valores.some(v => v.toLowerCase().includes('liberdade'));
  if (temSeguranca && temLiberdade) {
    conflitos.push('Segurança vs. Liberdade individual');
  }

  // Conflito tradição vs mudança
  const temTradicao = valores.some(v => v.toLowerCase().includes('tradição') || v.toLowerCase().includes('conserv'));
  const temMudanca = valores.some(v => v.toLowerCase().includes('mudança') || v.toLowerCase().includes('progresso'));
  if (temTradicao && temMudanca) {
    conflitos.push('Tradição vs. Progresso');
  }

  return conflitos;
}

function gerarCitacaoRuptura(eleitor: Eleitor, gatilho: string): string {
  const citacoesPorGatilho: Record<string, string[]> = {
    'impostos': [
      '"Se mexer no meu patrimônio, acabou. Não tem conversa."',
      '"Imposto é roubo. Se aumentar, mudo de lado na hora."',
    ],
    'desemprego': [
      '"Se eu perder meu emprego, ele perde meu voto. Simples assim."',
      '"No dia que eu quebrar, esqueço qualquer lealdade política."',
    ],
    'corrupção': [
      '"Não vou defender corrupto de novo. Já aprendi a lição."',
      '"Se roubar, é fora. Não importa de que lado."',
    ],
    'violência': [
      '"Se a violência continuar aumentando, vou votar em quem resolver."',
      '"Bandido na rua é bandido na rua. Quem resolver, leva meu voto."',
    ],
    'inflação': [
      '"Se o dinheiro não comprar mais nada, não tem papo."',
      '"Meu bolso decide meu voto. Se apertar, mudo."',
    ],
    'direitos': [
      '"Mexer nos meus direitos é linha vermelha."',
      '"Não abro mão das conquistas. Quem ameaçar, perde meu voto."',
    ],
  };

  // Encontrar citação mais relevante
  for (const [key, citacoes] of Object.entries(citacoesPorGatilho)) {
    if (gatilho.toLowerCase().includes(key)) {
      const index = Math.abs(eleitor.id.charCodeAt(0)) % citacoes.length;
      return citacoes[index];
    }
  }

  return '"Cada um tem seu limite. O meu você não quer descobrir."';
}

function gerarEstrategia(
  eleitor: Eleitor,
  gatilho: string,
  vulnerabilidade: 'alta' | 'media' | 'baixa'
): string {
  if (vulnerabilidade === 'baixa') {
    return 'Eleitor com convicções sólidas. Difícil persuasão direta.';
  }

  const estrategias: string[] = [];

  if (gatilho.includes('econom') || gatilho.includes('imposto') || gatilho.includes('desemprego')) {
    estrategias.push('Enfatizar propostas econômicas concretas e realistas');
  }

  if (gatilho.includes('corrupção')) {
    estrategias.push('Destacar transparência e histórico limpo');
  }

  if (gatilho.includes('violência') || gatilho.includes('segurança')) {
    estrategias.push('Apresentar plano de segurança com resultados mensuráveis');
  }

  if (eleitor.estilo_decisao?.toLowerCase().includes('emocional')) {
    estrategias.push('Usar narrativas e histórias pessoais');
  }

  if (eleitor.estilo_decisao?.toLowerCase().includes('pragmat')) {
    estrategias.push('Focar em dados e resultados comprovados');
  }

  return estrategias.join('. ') || 'Abordagem personalizada necessária.';
}

function agruparLinhasVermelhas(pontos: PontoRuptura[]): LinhaVermelhaAgrupada[] {
  const contagem: Record<string, { quantidade: number; citacoes: string[] }> = {};

  for (const ponto of pontos) {
    for (const linha of ponto.linhas_vermelhas) {
      if (!contagem[linha]) {
        contagem[linha] = { quantidade: 0, citacoes: [] };
      }
      contagem[linha].quantidade++;
      if (contagem[linha].citacoes.length < 3) {
        contagem[linha].citacoes.push(ponto.citacao_reveladora);
      }
    }
  }

  const total = pontos.length || 1;

  return Object.entries(contagem)
    .map(([linha, { quantidade, citacoes }]) => ({
      linha_vermelha: linha,
      quantidade,
      percentual: (quantidade / total) * 100,
      citacao_exemplo: citacoes[0] ?? '',
    }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5);
}

function calcularVulnerabilidadeMedia(pontos: PontoRuptura[]): number {
  if (pontos.length === 0) return 0;

  const soma = pontos.reduce((acc, p) => acc + p.probabilidade_ruptura, 0);
  return soma / pontos.length;
}

export default analisarPontosRuptura;
