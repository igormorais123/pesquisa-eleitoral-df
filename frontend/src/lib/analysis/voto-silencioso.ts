/**
 * Algoritmo de Detecção de Voto Silencioso
 * Identifica eleitores que votam mas não defendem publicamente
 * Pesquisa Eleitoral DF 2026
 */

import type { Eleitor } from '@/types';

export interface VotoSilencioso {
  agente_id: string;
  agente_nome: string;
  perfil_resumido: string;

  // Análise
  concorda_economia: boolean;
  rejeita_costumes: boolean;
  probabilidade_voto_escondido: number; // 0-100

  // Evidências
  citacao_reveladora: string;
  contradicoes_detectadas: string[];

  // Insight
  interpretacao: string;
}

export interface AnaliseVotoSilencioso {
  total_detectados: number;
  percentual_amostra: number;
  perfil_tipico: {
    classe_predominante: string;
    escolaridade_predominante: string;
    faixa_etaria_predominante: string;
    regiao_predominante: string;
  };
  eleitores: VotoSilencioso[];
}

/**
 * Detecta eleitores com comportamento de voto silencioso
 * Critérios:
 * - Orientação centro-direita ou direita
 * - Tolerância alta a nuances (indica pensamento mais complexo)
 * - Escolaridade superior
 * - Não é apoiador_forte de Bolsonaro (moderado ou neutro)
 */
export function detectarVotoSilencioso(eleitores: Eleitor[]): AnaliseVotoSilencioso {
  const votosSilenciosos: VotoSilencioso[] = [];

  for (const eleitor of eleitores) {
    const score = calcularScoreVotoSilencioso(eleitor);

    if (score.probabilidade >= 60) {
      votosSilenciosos.push({
        agente_id: eleitor.id,
        agente_nome: eleitor.nome,
        perfil_resumido: `${eleitor.profissao}, ${eleitor.idade} anos, ${eleitor.regiao_administrativa}`,
        concorda_economia: score.concordaEconomia,
        rejeita_costumes: score.rejeitaCostumes,
        probabilidade_voto_escondido: score.probabilidade,
        citacao_reveladora: gerarCitacaoRepresentativa(eleitor, score),
        contradicoes_detectadas: score.contradicoes,
        interpretacao: gerarInterpretacao(eleitor, score),
      });
    }
  }

  // Ordenar por probabilidade (maior primeiro)
  votosSilenciosos.sort((a, b) => b.probabilidade_voto_escondido - a.probabilidade_voto_escondido);

  // Calcular perfil típico
  const perfilTipico = calcularPerfilTipico(votosSilenciosos, eleitores);

  return {
    total_detectados: votosSilenciosos.length,
    percentual_amostra: (votosSilenciosos.length / eleitores.length) * 100,
    perfil_tipico: perfilTipico,
    eleitores: votosSilenciosos,
  };
}

interface ScoreVotoSilencioso {
  probabilidade: number;
  concordaEconomia: boolean;
  rejeitaCostumes: boolean;
  contradicoes: string[];
}

function calcularScoreVotoSilencioso(eleitor: Eleitor): ScoreVotoSilencioso {
  let score = 0;
  const contradicoes: string[] = [];

  // Orientação política centro-direita ou direita (mas não extrema)
  const orientacaoModerada = ['centro-direita', 'direita', 'centro'].includes(
    eleitor.orientacao_politica?.toLowerCase() ?? ''
  );
  if (orientacaoModerada) score += 15;

  // Posição sobre Bolsonaro: moderado ou neutro (não extremo)
  const posicao = eleitor.posicao_bolsonaro?.toLowerCase() ?? '';
  const naoExtremista = ['neutro', 'apoiador_moderado', 'critico_moderado'].includes(posicao);
  if (naoExtremista) score += 20;

  // Tolerância alta a nuances (indica pensamento complexo)
  if (eleitor.tolerancia_nuance === 'alta') {
    score += 15;
    contradicoes.push('Alta tolerância a nuances com posição política definida');
  }

  // Escolaridade superior (mais consciente de pressão social)
  const escolaridadeAlta = eleitor.escolaridade?.toLowerCase().includes('superior') ||
    eleitor.escolaridade?.toLowerCase().includes('pós');
  if (escolaridadeAlta) score += 15;

  // Classe média ou alta (tem mais a perder socialmente)
  const classeSocial = eleitor.cluster_socioeconomico?.toLowerCase() ?? '';
  if (classeSocial.includes('alta') || classeSocial.includes('media_alta') || classeSocial.includes('g1') || classeSocial.includes('g2')) {
    score += 10;
  }

  // Interesse político médio ou alto
  if (eleitor.interesse_politico === 'alto' || eleitor.interesse_politico === 'medio') {
    score += 10;
  }

  // Susceptibilidade baixa à desinformação (mais crítico)
  if ((eleitor.susceptibilidade_desinformacao ?? 5) < 5) {
    score += 10;
    contradicoes.push('Baixa susceptibilidade a desinformação com posição política firme');
  }

  // Estilo de decisão pragmático ou econômico
  const estiloDecisao = eleitor.estilo_decisao?.toLowerCase() ?? '';
  if (estiloDecisao.includes('pragmat') || estiloDecisao.includes('econom')) {
    score += 10;
    contradicoes.push('Decisão pragmática/econômica vs. pressão social');
  }

  // Vieses cognitivos: tribalismo baixo
  const vieses = eleitor.vieses_cognitivos ?? [];
  const temTribalismo = vieses.some(v => v.toLowerCase().includes('tribal'));
  if (!temTribalismo) {
    score += 5;
  }

  // Valores que podem conflitar
  const valores = eleitor.valores ?? [];
  const valoresLiberais = valores.some(v =>
    v.toLowerCase().includes('liberdade') ||
    v.toLowerCase().includes('tolerância') ||
    v.toLowerCase().includes('diversidade')
  );
  const valoresConservadores = valores.some(v =>
    v.toLowerCase().includes('família') ||
    v.toLowerCase().includes('tradição') ||
    v.toLowerCase().includes('ordem')
  );

  if (valoresLiberais && valoresConservadores) {
    contradicoes.push('Valores liberais e conservadores simultaneamente');
  }

  // Determinar concordância econômica e rejeição de costumes
  const concordaEconomia = orientacaoModerada &&
    (estiloDecisao.includes('econom') || estiloDecisao.includes('pragmat'));

  const rejeitaCostumes = eleitor.tolerancia_nuance === 'alta' || valoresLiberais;

  return {
    probabilidade: Math.min(score, 100),
    concordaEconomia,
    rejeitaCostumes,
    contradicoes,
  };
}

function gerarCitacaoRepresentativa(eleitor: Eleitor, score: ScoreVotoSilencioso): string {
  const citacoes = [
    `"Concordo com a economia, mas não vou ficar defendendo em rede social não. Tem coisa que não dá pra defender."`,
    `"Voto é secreto né? Então fico na minha. Cada um sabe o que faz."`,
    `"Na hora H, penso no meu bolso. Mas não fico pagando mico pra ninguém."`,
    `"Tenho amigos de todo tipo, não vou ficar brigando por político."`,
    `"Economia melhorou, mas aquelas declarações... prefiro nem comentar."`,
    `"Meu voto é uma coisa, o que eu posto no Instagram é outra."`,
    `"No trabalho ninguém sabe em quem eu voto. E vai continuar assim."`,
  ];

  // Selecionar citação baseada no hash do ID do eleitor
  const index = Math.abs(eleitor.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % citacoes.length;
  return citacoes[index];
}

function gerarInterpretacao(eleitor: Eleitor, score: ScoreVotoSilencioso): string {
  const interpretacoes = [];

  if (score.concordaEconomia) {
    interpretacoes.push('Prioriza questões econômicas na decisão de voto');
  }

  if (score.rejeitaCostumes) {
    interpretacoes.push('Desconforto com pautas extremas de costumes');
  }

  if (score.contradicoes.length > 0) {
    interpretacoes.push('Perfil com contradições internas que geram dissonância cognitiva');
  }

  const escolaridadeAlta = eleitor.escolaridade?.toLowerCase().includes('superior');
  if (escolaridadeAlta) {
    interpretacoes.push('Alta escolaridade aumenta consciência sobre pressão social');
  }

  return interpretacoes.join('. ') + '.';
}

function calcularPerfilTipico(
  votosSilenciosos: VotoSilencioso[],
  eleitores: Eleitor[]
): AnaliseVotoSilencioso['perfil_tipico'] {
  if (votosSilenciosos.length === 0) {
    return {
      classe_predominante: 'N/A',
      escolaridade_predominante: 'N/A',
      faixa_etaria_predominante: 'N/A',
      regiao_predominante: 'N/A',
    };
  }

  const ids = new Set(votosSilenciosos.map(v => v.agente_id));
  const eleitoresFiltrados = eleitores.filter(e => ids.has(e.id));

  // Contagem por classe
  const classes: Record<string, number> = {};
  const escolaridades: Record<string, number> = {};
  const faixas: Record<string, number> = {};
  const regioes: Record<string, number> = {};

  for (const e of eleitoresFiltrados) {
    const classe = e.cluster_socioeconomico || 'N/A';
    classes[classe] = (classes[classe] || 0) + 1;

    const escolaridade = e.escolaridade || 'N/A';
    escolaridades[escolaridade] = (escolaridades[escolaridade] || 0) + 1;

    const faixa = e.idade < 30 ? '18-29' : e.idade < 45 ? '30-44' : e.idade < 60 ? '45-59' : '60+';
    faixas[faixa] = (faixas[faixa] || 0) + 1;

    const regiao = e.regiao_administrativa || 'N/A';
    regioes[regiao] = (regioes[regiao] || 0) + 1;
  }

  const getMaisFrequente = (obj: Record<string, number>) => {
    const entries = Object.entries(obj);
    if (entries.length === 0) return 'N/A';
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  };

  return {
    classe_predominante: getMaisFrequente(classes),
    escolaridade_predominante: getMaisFrequente(escolaridades),
    faixa_etaria_predominante: getMaisFrequente(faixas),
    regiao_predominante: getMaisFrequente(regioes),
  };
}

export default detectarVotoSilencioso;
