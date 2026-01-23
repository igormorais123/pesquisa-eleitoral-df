/**
 * SERVIÇO DE VALIDAÇÃO ESTATÍSTICA
 *
 * Calcula as estatísticas da amostra de eleitores e compara com os dados oficiais
 * de referência para identificar divergências e vieses amostrais.
 */

import type { Eleitor } from '@/types';
import {
  mapaDadosReferencia,
  labelsVariaveis,
  labelsValores,
  type DadoReferencia,
} from '@/data/dados-referencia-oficiais';

// ============================================
// TIPOS
// ============================================

export interface DivergenciaEstatistica {
  variavel: string;
  labelVariavel: string;
  categoria: string;
  labelCategoria: string;
  valorAmostra: number;      // Percentual na amostra
  valorReferencia: number;   // Percentual oficial
  diferenca: number;         // Diferença (amostra - referência)
  diferencaAbsoluta: number; // Valor absoluto da diferença
  direcao: 'acima' | 'abaixo' | 'igual';
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  contagemAmostra: number;   // Número absoluto na amostra
  eleitoresParaCorrecao: number; // Quantos eleitores adicionar para corrigir
}

export interface ResumoValidacao {
  variavel: string;
  labelVariavel: string;
  fonte: string;
  ano: number;
  url: string;
  ambito: string;
  metodologia: string;
  confiabilidade: string;
  observacoes?: string;
  divergencias: DivergenciaEstatistica[];
  mediaDesvio: number;        // Média das diferenças absolutas
  maiorDivergencia: DivergenciaEstatistica | null;
  statusGeral: 'otimo' | 'bom' | 'atencao' | 'critico';
}

export interface ValidacaoCompleta {
  totalEleitores: number;
  resumos: ResumoValidacao[];
  indiceConformidade: number;  // 0-100, quanto maior melhor
  totalVariaveis: number;
  variaveisOtimas: number;
  variaveisBoas: number;
  variaveisAtencao: number;
  variaveisCriticas: number;
  principaisVieses: DivergenciaEstatistica[];
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

const normalizacaoCategorias: Record<string, Record<string, string>> = {
  escolaridade: {
    'superior_ou_pos': 'superior_completo_ou_pos',
  },
  religiao: {
    'outras': 'outras_religioes',
  },
  estado_civil: {
    'separado(a)': 'divorciado(a)',
  },
  posicao_bolsonaro: {
    'opositor_forte': 'critico_forte',
    'opositor_moderado': 'critico_moderado',
  },
  estilo_decisao: {
    'ideologico': 'identitario',
    'emocional_intuitivo': 'emocional',
    'racional_analitico': 'economico',
    'influenciavel': 'emocional',
    'racional': 'pragmatico',
  },
};

function normalizarCategoria(campo: string, valor: unknown): string {
  if (valor === null || valor === undefined || valor === '') {
    return 'nao_informado';
  }

  const texto = String(valor).trim();
  const mapa = normalizacaoCategorias[campo];
  if (!mapa) {
    return texto;
  }

  const textoNormalizado = texto.toLowerCase();
  return mapa[textoNormalizado] || texto;
}

/**
 * Calcula a distribuição percentual de uma variável categórica
 */
function calcularDistribuicao(
  eleitores: Eleitor[],
  campo: keyof Eleitor
): Record<string, { contagem: number; percentual: number }> {
  const total = eleitores.length;
  const contagem: Record<string, number> = {};

  eleitores.forEach((e) => {
    const valor = normalizarCategoria(String(campo), e[campo]);
    contagem[valor] = (contagem[valor] || 0) + 1;
  });

  const resultado: Record<string, { contagem: number; percentual: number }> = {};
  Object.entries(contagem).forEach(([key, count]) => {
    resultado[key] = {
      contagem: count,
      percentual: (count / total) * 100,
    };
  });

  return resultado;
}

/**
 * Calcula a distribuição de faixas etárias
 * Usa o campo faixa_etaria do eleitor (que já vem categorizado)
 */
function calcularDistribuicaoFaixaEtaria(
  eleitores: Eleitor[]
): Record<string, { contagem: number; percentual: number }> {
  const total = eleitores.length;
  const contagem: Record<string, number> = {};

  eleitores.forEach((e) => {
    // Usa o campo faixa_etaria se existir, senão calcula
    const faixa = (e as unknown as Record<string, unknown>).faixa_etaria as string || calcularFaixaEtaria(e.idade);
    contagem[faixa] = (contagem[faixa] || 0) + 1;
  });

  const resultado: Record<string, { contagem: number; percentual: number }> = {};
  Object.entries(contagem).forEach(([key, count]) => {
    resultado[key] = {
      contagem: count,
      percentual: (count / total) * 100,
    };
  });

  return resultado;
}

/**
 * Calcula a faixa etária baseado na idade (fallback)
 * Faixas: 16-24, 25-34, 35-44, 45-54, 55-64, 65+
 */
function calcularFaixaEtaria(idade: number): string {
  if (idade <= 24) return '16-24';
  if (idade <= 34) return '25-34';
  if (idade <= 44) return '35-44';
  if (idade <= 54) return '45-54';
  if (idade <= 64) return '55-64';
  return '65+';
}

/**
 * Calcula a distribuição de susceptibilidade à desinformação
 * Mapeia os valores do formato "baixa_1_3", "media_4_6", "alta_7_10" para 'baixa', 'media', 'alta'
 */
function calcularDistribuicaoSusceptibilidade(
  eleitores: Eleitor[]
): Record<string, { contagem: number; percentual: number }> {
  const total = eleitores.length;
  const contagem: Record<string, number> = { 'baixa': 0, 'media': 0, 'alta': 0 };

  eleitores.forEach((e) => {
    const valor = (e as unknown as Record<string, unknown>).susceptibilidade_desinformacao;
    if (typeof valor === 'string') {
      // Mapear valores do formato "baixa_1_3", "media_4_6", "alta_7_10"
      if (valor.startsWith('baixa') || valor === 'baixa') {
        contagem['baixa']++;
      } else if (valor.startsWith('media') || valor === 'media') {
        contagem['media']++;
      } else if (valor.startsWith('alta') || valor === 'alta') {
        contagem['alta']++;
      } else {
        contagem['media']++; // Valor padrão
      }
    } else if (typeof valor === 'number') {
      // Fallback para números (compatibilidade)
      if (valor <= 3) contagem['baixa']++;
      else if (valor <= 6) contagem['media']++;
      else contagem['alta']++;
    } else {
      contagem['media']++; // Valor padrão
    }
  });

  return {
    'baixa': { contagem: contagem['baixa'], percentual: (contagem['baixa'] / total) * 100 },
    'media': { contagem: contagem['media'], percentual: (contagem['media'] / total) * 100 },
    'alta': { contagem: contagem['alta'], percentual: (contagem['alta'] / total) * 100 },
  };
}

/**
 * Calcula a distribuição de meio de transporte
 * Mapeia valores do banco para os valores de referência:
 * - 'moto' -> 'motocicleta'
 * - Outros valores passam sem alteração
 */
function calcularDistribuicaoMeioTransporte(
  eleitores: Eleitor[]
): Record<string, { contagem: number; percentual: number }> {
  const total = eleitores.length;
  const contagem: Record<string, number> = {};

  // Mapeamento de valores do banco para valores de referência
  const mapeamento: Record<string, string> = {
    'moto': 'motocicleta',
    'van_pirata': 'onibus',  // Agrupa van pirata com ônibus
    'app': 'carro',          // Agrupa app com carro
    'carro_familia': 'carro', // Agrupa carro família com carro
  };

  eleitores.forEach((e) => {
    let valor = String((e as unknown as Record<string, unknown>).meio_transporte || 'nao_informado');
    // Aplicar mapeamento se existir
    valor = mapeamento[valor] || valor;
    contagem[valor] = (contagem[valor] || 0) + 1;
  });

  const resultado: Record<string, { contagem: number; percentual: number }> = {};
  Object.entries(contagem).forEach(([key, count]) => {
    resultado[key] = {
      contagem: count,
      percentual: (count / total) * 100,
    };
  });

  return resultado;
}

/**
 * Calcula a distribuição de orientação política
 * Mapeia valores do banco para os valores de referência:
 * - 'centro-direita' (com hífen) -> 'centro_direita'
 * - 'centro-esquerda' (com hífen) -> 'centro_esquerda'
 * - Outros valores passam sem alteração
 */
function calcularDistribuicaoOrientacaoPolitica(
  eleitores: Eleitor[]
): Record<string, { contagem: number; percentual: number }> {
  const total = eleitores.length;
  const contagem: Record<string, number> = {};

  // Mapeamento de valores do banco para valores de referência
  const mapeamento: Record<string, string> = {
    'centro-direita': 'centro_direita',
    'centro-esquerda': 'centro_esquerda',
  };

  eleitores.forEach((e) => {
    let valor = String((e as unknown as Record<string, unknown>).orientacao_politica || 'nao_informado');
    // Aplicar mapeamento se existir
    valor = mapeamento[valor] || valor;
    contagem[valor] = (contagem[valor] || 0) + 1;
  });

  const resultado: Record<string, { contagem: number; percentual: number }> = {};
  Object.entries(contagem).forEach(([key, count]) => {
    resultado[key] = {
      contagem: count,
      percentual: (count / total) * 100,
    };
  });

  return resultado;
}

/**
 * Calcula a distribuição de filhos por quantidade (0, 1, 2, 3, 4+)
 */
function calcularDistribuicaoFilhos(
  eleitores: Eleitor[]
): Record<string, { contagem: number; percentual: number }> {
  const total = eleitores.length;
  const contagem: Record<string, number> = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0 };

  eleitores.forEach((e) => {
    const numFilhos = e.filhos || 0;
    // Agrupa 4+ em '4'
    const categoria = numFilhos >= 4 ? '4' : String(numFilhos);
    contagem[categoria] = (contagem[categoria] || 0) + 1;
  });

  const resultado: Record<string, { contagem: number; percentual: number }> = {};
  Object.entries(contagem).forEach(([key, count]) => {
    resultado[key] = {
      contagem: count,
      percentual: (count / total) * 100,
    };
  });

  return resultado;
}

/**
 * Calcula a distribuição de tempo de deslocamento para trabalho
 */
function calcularDistribuicaoTempoDeslocamento(
  eleitores: Eleitor[]
): Record<string, { contagem: number; percentual: number }> {
  const total = eleitores.length;
  const contagem: Record<string, number> = {};

  eleitores.forEach((e) => {
    const valor = String((e as unknown as Record<string, unknown>).tempo_deslocamento_trabalho || 'nao_se_aplica');
    contagem[valor] = (contagem[valor] || 0) + 1;
  });

  const resultado: Record<string, { contagem: number; percentual: number }> = {};
  Object.entries(contagem).forEach(([key, count]) => {
    resultado[key] = {
      contagem: count,
      percentual: (count / total) * 100,
    };
  });

  return resultado;
}

/**
 * Calcula a distribuição de voto facultativo
 * Baseado na idade: 16-17 anos e 70+ anos = facultativo, resto = obrigatório
 */
function calcularDistribuicaoVotoFacultativo(
  eleitores: Eleitor[]
): Record<string, { contagem: number; percentual: number }> {
  const total = eleitores.length;
  let facultativo = 0;
  let obrigatorio = 0;

  eleitores.forEach((e) => {
    // Voto facultativo para menores de 18 e maiores de 70
    const votoFacultativo = (e as unknown as Record<string, unknown>).voto_facultativo;
    if (votoFacultativo === true || votoFacultativo === 'true') {
      facultativo++;
    } else if (votoFacultativo === false || votoFacultativo === 'false') {
      obrigatorio++;
    } else {
      // Calcular baseado na idade se o campo não existir
      const idade = e.idade || 35;
      if (idade < 18 || idade >= 70) {
        facultativo++;
      } else {
        obrigatorio++;
      }
    }
  });

  return {
    'true': { contagem: facultativo, percentual: (facultativo / total) * 100 },
    'false': { contagem: obrigatorio, percentual: (obrigatorio / total) * 100 },
  };
}

/**
 * Calcula a distribuição de conflito identitário
 */
function calcularDistribuicaoConflitoIdentitario(
  eleitores: Eleitor[]
): Record<string, { contagem: number; percentual: number }> {
  const total = eleitores.length;
  let comConflito = 0;
  let semConflito = 0;

  eleitores.forEach((e) => {
    const conflito = (e as unknown as Record<string, unknown>).conflito_identitario;
    if (conflito === true || conflito === 'true') {
      comConflito++;
    } else {
      semConflito++;
    }
  });

  return {
    'true': { contagem: comConflito, percentual: (comConflito / total) * 100 },
    'false': { contagem: semConflito, percentual: (semConflito / total) * 100 },
  };
}

/**
 * Calcula a distribuição de região administrativa
 */
function calcularDistribuicaoRegiaoAdministrativa(
  eleitores: Eleitor[]
): Record<string, { contagem: number; percentual: number }> {
  const total = eleitores.length;
  const contagem: Record<string, number> = {};

  eleitores.forEach((e) => {
    const valor = String((e as unknown as Record<string, unknown>).regiao_administrativa || 'Não informado');
    contagem[valor] = (contagem[valor] || 0) + 1;
  });

  const resultado: Record<string, { contagem: number; percentual: number }> = {};
  Object.entries(contagem).forEach(([key, count]) => {
    resultado[key] = {
      contagem: count,
      percentual: (count / total) * 100,
    };
  });

  return resultado;
}

/**
 * Calcula a distribuição de preocupações principais (campo array)
 * Conta a frequência de cada preocupação no total de menções
 * Mapeia valores dos eleitores para categorias de referência
 */
function calcularDistribuicaoPreocupacoes(
  eleitores: Eleitor[]
): Record<string, { contagem: number; percentual: number }> {
  // Mapeamento de valores do banco para categorias de referência
  const mapeamento: Record<string, string> = {
    'saúde': 'saude',
    'saude': 'saude',
    'segurança': 'seguranca',
    'seguranca': 'seguranca',
    'segurança pública': 'seguranca',
    'violência e criminalidade': 'seguranca',
    'violência': 'seguranca',
    'economia': 'economia',
    'custo de vida': 'economia',
    'inflação': 'economia',
    'crise econômica': 'economia',
    'corrupção': 'corrupcao',
    'corrupcao': 'corrupcao',
    'educação': 'educacao',
    'educacao': 'educacao',
    'desemprego': 'desemprego',
    'emprego': 'desemprego',
    'fome e miséria': 'economia',
    'desigualdade social': 'economia',
    'impostos altos': 'economia',
    'moradia': 'economia',
    'transporte público': 'economia',
  };

  const contagem: Record<string, number> = {
    'saude': 0,
    'seguranca': 0,
    'economia': 0,
    'corrupcao': 0,
    'educacao': 0,
    'desemprego': 0,
  };
  let totalMencoes = 0;

  eleitores.forEach((e) => {
    const preocupacoes = (e as unknown as Record<string, unknown>).preocupacoes;
    if (Array.isArray(preocupacoes)) {
      preocupacoes.forEach((p: unknown) => {
        const valorOriginal = String(p || '').toLowerCase().trim();
        const valorMapeado = mapeamento[valorOriginal] || null;
        if (valorMapeado && contagem[valorMapeado] !== undefined) {
          contagem[valorMapeado]++;
          totalMencoes++;
        }
      });
    }
  });

  const divisor = totalMencoes > 0 ? totalMencoes : 1;

  const resultado: Record<string, { contagem: number; percentual: number }> = {};
  Object.entries(contagem).forEach(([key, count]) => {
    resultado[key] = {
      contagem: count,
      percentual: (count / divisor) * 100,
    };
  });

  return resultado;
}

/**
 * Calcula a distribuição de valores principais (campo array)
 * Conta a frequência de cada valor no total de menções
 * Mapeia valores dos eleitores para categorias de referência
 */
function calcularDistribuicaoValores(
  eleitores: Eleitor[]
): Record<string, { contagem: number; percentual: number }> {
  // Mapeamento de valores do banco para categorias de referência
  const mapeamento: Record<string, string> = {
    'família': 'familia',
    'familia': 'familia',
    'trabalho': 'trabalho',
    'honestidade': 'trabalho',
    'segurança': 'seguranca',
    'seguranca': 'seguranca',
    'religião': 'religiao',
    'religiao': 'religiao',
    'fé e religião': 'religiao',
    'fé': 'religiao',
    'liberdade': 'liberdade',
    'democracia': 'liberdade',
    'igualdade': 'igualdade',
    'justiça': 'igualdade',
    'solidariedade': 'igualdade',
    'respeito': 'familia',
    'educação': 'trabalho',
    'saúde': 'seguranca',
    'ordem': 'seguranca',
    'meritocracia': 'trabalho',
  };

  const contagem: Record<string, number> = {
    'familia': 0,
    'trabalho': 0,
    'seguranca': 0,
    'religiao': 0,
    'liberdade': 0,
    'igualdade': 0,
  };
  let totalMencoes = 0;

  eleitores.forEach((e) => {
    const valores = (e as unknown as Record<string, unknown>).valores;
    if (Array.isArray(valores)) {
      valores.forEach((v: unknown) => {
        const valorOriginal = String(v || '').toLowerCase().trim();
        const valorMapeado = mapeamento[valorOriginal] || null;
        if (valorMapeado && contagem[valorMapeado] !== undefined) {
          contagem[valorMapeado]++;
          totalMencoes++;
        }
      });
    }
  });

  const divisor = totalMencoes > 0 ? totalMencoes : 1;

  const resultado: Record<string, { contagem: number; percentual: number }> = {};
  Object.entries(contagem).forEach(([key, count]) => {
    resultado[key] = {
      contagem: count,
      percentual: (count / divisor) * 100,
    };
  });

  return resultado;
}

/**
 * Calcula a distribuição de medos principais (campo array)
 * Conta a frequência de cada medo no total de menções
 * Mapeia valores dos eleitores para categorias de referência
 */
function calcularDistribuicaoMedos(
  eleitores: Eleitor[]
): Record<string, { contagem: number; percentual: number }> {
  // Mapeamento de valores do banco para categorias de referência
  const mapeamento: Record<string, string> = {
    'violência': 'violencia',
    'violencia': 'violencia',
    'desemprego': 'desemprego',
    'perder o emprego': 'desemprego',
    'não conseguir emprego': 'desemprego',
    'saúde': 'saude',
    'saude': 'saude',
    'doença': 'saude',
    'doença sem atendimento': 'saude',
    'economia': 'economia',
    'crise econômica': 'economia',
    'inflação': 'economia',
    'não conseguir pagar as contas': 'economia',
    'perder a casa': 'economia',
    'fome': 'economia',
    'corrupção': 'corrupcao',
    'corrupcao': 'corrupcao',
    'instabilidade política': 'instabilidade_politica',
    'instabilidade_politica': 'instabilidade_politica',
    'autoritarismo': 'instabilidade_politica',
    'desigualdade': 'economia',
    'filhos no crime': 'violencia',
  };

  const contagem: Record<string, number> = {
    'violencia': 0,
    'desemprego': 0,
    'saude': 0,
    'economia': 0,
    'corrupcao': 0,
    'instabilidade_politica': 0,
  };
  let totalMencoes = 0;

  eleitores.forEach((e) => {
    const medos = (e as unknown as Record<string, unknown>).medos;
    if (Array.isArray(medos)) {
      medos.forEach((m: unknown) => {
        const valorOriginal = String(m || '').toLowerCase().trim();
        const valorMapeado = mapeamento[valorOriginal] || null;
        if (valorMapeado && contagem[valorMapeado] !== undefined) {
          contagem[valorMapeado]++;
          totalMencoes++;
        }
      });
    }
  });

  const divisor = totalMencoes > 0 ? totalMencoes : 1;

  const resultado: Record<string, { contagem: number; percentual: number }> = {};
  Object.entries(contagem).forEach(([key, count]) => {
    resultado[key] = {
      contagem: count,
      percentual: (count / divisor) * 100,
    };
  });

  return resultado;
}

/**
 * Determina a severidade da divergência baseado no desvio
 */
function determinarSeveridade(diferencaAbsoluta: number): 'baixa' | 'media' | 'alta' | 'critica' {
  if (diferencaAbsoluta <= 3) return 'baixa';
  if (diferencaAbsoluta <= 7) return 'media';
  if (diferencaAbsoluta <= 15) return 'alta';
  return 'critica';
}

/**
 * Calcula quantos eleitores precisam ser adicionados para corrigir a amostra
 *
 * Fórmula: Se a amostra está sub-representada em uma categoria, calculamos
 * quantos eleitores dessa categoria precisam ser adicionados para que o
 * percentual atinja o valor de referência.
 *
 * Matemática: (contagemAtual + x) / (totalAtual + x) = refPercent / 100
 * Resolvendo: x = (refPercent * totalAtual - 100 * contagemAtual) / (100 - refPercent)
 */
function calcularEleitoresParaCorrecao(
  totalEleitores: number,
  contagemAmostra: number,
  valorReferencia: number,
  diferenca: number
): number {
  // Se a amostra está acima ou igual ao referência, não precisa adicionar
  if (diferenca >= -0.5) return 0;

  // Se o valor de referência é 100%, seria infinito (impossível)
  if (valorReferencia >= 100) return 0;

  // Se não há eleitores, não dá para calcular
  if (totalEleitores <= 0) return 0;

  // Calcula eleitores necessários
  const refDecimal = valorReferencia / 100;
  const eleitoresNecessarios =
    (refDecimal * totalEleitores - contagemAmostra) / (1 - refDecimal);

  // Retorna valor arredondado para cima (precisamos de pelo menos essa quantidade)
  return Math.max(0, Math.ceil(eleitoresNecessarios));
}

/**
 * Determina o status geral baseado na média de desvio
 */
function determinarStatusGeral(mediaDesvio: number): 'otimo' | 'bom' | 'atencao' | 'critico' {
  if (mediaDesvio <= 3) return 'otimo';
  if (mediaDesvio <= 7) return 'bom';
  if (mediaDesvio <= 12) return 'atencao';
  return 'critico';
}

/**
 * Obtém o label formatado para uma categoria
 */
function obterLabelCategoria(variavel: string, categoria: string): string {
  const labels = labelsValores[variavel];
  if (labels && labels[categoria]) {
    return labels[categoria];
  }
  // Formatar automaticamente
  return categoria
    .replace(/_/g, ' ')
    .replace(/\(|\)/g, '')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ============================================
// FUNÇÃO PRINCIPAL DE VALIDAÇÃO
// ============================================

/**
 * Calcula a validação estatística completa da amostra
 */
export function calcularValidacaoEstatistica(eleitores: Eleitor[]): ValidacaoCompleta {
  const resumos: ResumoValidacao[] = [];
  const todasDivergencias: DivergenciaEstatistica[] = [];

  // Lista de variáveis para validar
  const variaveisParaValidar: Array<{
    variavel: string;
    calcularDistribuicao: () => Record<string, { contagem: number; percentual: number }>;
  }> = [
    {
      variavel: 'genero',
      calcularDistribuicao: () => calcularDistribuicao(eleitores, 'genero'),
    },
    {
      variavel: 'cor_raca',
      calcularDistribuicao: () => calcularDistribuicao(eleitores, 'cor_raca'),
    },
    {
      variavel: 'faixa_etaria',
      calcularDistribuicao: () => calcularDistribuicaoFaixaEtaria(eleitores),
    },
    {
      variavel: 'cluster_socioeconomico',
      calcularDistribuicao: () => calcularDistribuicao(eleitores, 'cluster_socioeconomico'),
    },
    {
      variavel: 'escolaridade',
      calcularDistribuicao: () => calcularDistribuicao(eleitores, 'escolaridade'),
    },
    {
      variavel: 'ocupacao_vinculo',
      calcularDistribuicao: () => calcularDistribuicao(eleitores, 'ocupacao_vinculo'),
    },
    {
      variavel: 'renda_salarios_minimos',
      calcularDistribuicao: () => calcularDistribuicao(eleitores, 'renda_salarios_minimos'),
    },
    {
      variavel: 'religiao',
      calcularDistribuicao: () => calcularDistribuicao(eleitores, 'religiao'),
    },
    {
      variavel: 'estado_civil',
      calcularDistribuicao: () => calcularDistribuicao(eleitores, 'estado_civil'),
    },
    {
      variavel: 'orientacao_politica',
      calcularDistribuicao: () => calcularDistribuicaoOrientacaoPolitica(eleitores),
    },
    {
      variavel: 'interesse_politico',
      calcularDistribuicao: () => calcularDistribuicao(eleitores, 'interesse_politico'),
    },
    {
      variavel: 'posicao_bolsonaro',
      calcularDistribuicao: () => calcularDistribuicao(eleitores, 'posicao_bolsonaro'),
    },
    {
      variavel: 'estilo_decisao',
      calcularDistribuicao: () => calcularDistribuicao(eleitores, 'estilo_decisao'),
    },
    {
      variavel: 'tolerancia_nuance',
      calcularDistribuicao: () => calcularDistribuicao(eleitores, 'tolerancia_nuance'),
    },
    {
      variavel: 'filhos',
      calcularDistribuicao: () => calcularDistribuicaoFilhos(eleitores),
    },
    {
      variavel: 'meio_transporte',
      calcularDistribuicao: () => calcularDistribuicaoMeioTransporte(eleitores),
    },
    {
      variavel: 'susceptibilidade_desinformacao',
      calcularDistribuicao: () => calcularDistribuicaoSusceptibilidade(eleitores),
    },
    {
      variavel: 'tempo_deslocamento_trabalho',
      calcularDistribuicao: () => calcularDistribuicaoTempoDeslocamento(eleitores),
    },
    {
      variavel: 'voto_facultativo',
      calcularDistribuicao: () => calcularDistribuicaoVotoFacultativo(eleitores),
    },
    {
      variavel: 'conflito_identitario',
      calcularDistribuicao: () => calcularDistribuicaoConflitoIdentitario(eleitores),
    },
    {
      variavel: 'regiao_administrativa',
      calcularDistribuicao: () => calcularDistribuicaoRegiaoAdministrativa(eleitores),
    },
    {
      variavel: 'preocupacoes_principais',
      calcularDistribuicao: () => calcularDistribuicaoPreocupacoes(eleitores),
    },
    {
      variavel: 'valores_principais',
      calcularDistribuicao: () => calcularDistribuicaoValores(eleitores),
    },
    {
      variavel: 'medos_principais',
      calcularDistribuicao: () => calcularDistribuicaoMedos(eleitores),
    },
  ];

  variaveisParaValidar.forEach(({ variavel, calcularDistribuicao: calcularDist }) => {
    const dadoReferencia = mapaDadosReferencia[variavel];
    if (!dadoReferencia) return;

    const distribuicaoAmostra = calcularDist();
    const divergencias: DivergenciaEstatistica[] = [];

    // Comparar cada categoria
    Object.entries(dadoReferencia.valores).forEach(([categoria, valorReferencia]) => {
      const dadoAmostra = distribuicaoAmostra[categoria];
      const valorAmostra = dadoAmostra?.percentual || 0;
      const contagemAmostra = dadoAmostra?.contagem || 0;
      const diferenca = valorAmostra - valorReferencia;
      const diferencaAbsoluta = Math.abs(diferenca);

      const divergencia: DivergenciaEstatistica = {
        variavel,
        labelVariavel: labelsVariaveis[variavel] || variavel,
        categoria,
        labelCategoria: obterLabelCategoria(variavel, categoria),
        valorAmostra: Number(valorAmostra.toFixed(1)),
        valorReferencia,
        diferenca: Number(diferenca.toFixed(1)),
        diferencaAbsoluta: Number(diferencaAbsoluta.toFixed(1)),
        direcao: diferenca > 0.5 ? 'acima' : diferenca < -0.5 ? 'abaixo' : 'igual',
        severidade: determinarSeveridade(diferencaAbsoluta),
        contagemAmostra,
        eleitoresParaCorrecao: calcularEleitoresParaCorrecao(
          eleitores.length,
          contagemAmostra,
          valorReferencia,
          diferenca
        ),
      };

      divergencias.push(divergencia);
      todasDivergencias.push(divergencia);
    });

    // Calcular estatísticas do resumo
    const mediaDesvio =
      divergencias.length > 0
        ? divergencias.reduce((acc, d) => acc + d.diferencaAbsoluta, 0) / divergencias.length
        : 0;

    const maiorDivergencia = divergencias.reduce(
      (max, d) => (d.diferencaAbsoluta > (max?.diferencaAbsoluta || 0) ? d : max),
      null as DivergenciaEstatistica | null
    );

    resumos.push({
      variavel,
      labelVariavel: labelsVariaveis[variavel] || variavel,
      fonte: dadoReferencia.fonte,
      ano: dadoReferencia.ano,
      url: dadoReferencia.url,
      ambito: dadoReferencia.ambito,
      metodologia: dadoReferencia.metodologia,
      confiabilidade: dadoReferencia.confiabilidade,
      observacoes: dadoReferencia.observacoes,
      divergencias,
      mediaDesvio: Number(mediaDesvio.toFixed(1)),
      maiorDivergencia,
      statusGeral: determinarStatusGeral(mediaDesvio),
    });
  });

  // Calcular estatísticas gerais
  const variaveisOtimas = resumos.filter((r) => r.statusGeral === 'otimo').length;
  const variaveisBoas = resumos.filter((r) => r.statusGeral === 'bom').length;
  const variaveisAtencao = resumos.filter((r) => r.statusGeral === 'atencao').length;
  const variaveisCriticas = resumos.filter((r) => r.statusGeral === 'critico').length;

  // Calcular índice de conformidade (0-100)
  const pesosPorStatus = { otimo: 100, bom: 75, atencao: 40, critico: 10 };
  const somasPesos = resumos.reduce((acc, r) => acc + pesosPorStatus[r.statusGeral], 0);
  const indiceConformidade =
    resumos.length > 0 ? Number((somasPesos / resumos.length).toFixed(1)) : 0;

  // Identificar principais vieses (top 10 maiores divergências)
  const principaisVieses = todasDivergencias
    .filter((d) => d.diferencaAbsoluta > 3)
    .sort((a, b) => b.diferencaAbsoluta - a.diferencaAbsoluta)
    .slice(0, 10);

  return {
    totalEleitores: eleitores.length,
    resumos,
    indiceConformidade,
    totalVariaveis: resumos.length,
    variaveisOtimas,
    variaveisBoas,
    variaveisAtencao,
    variaveisCriticas,
    principaisVieses,
  };
}

// ============================================
// FUNÇÕES DE FORMATAÇÃO
// ============================================

/**
 * Formata a diferença com sinal e cor
 */
export function formatarDiferenca(diferenca: number): {
  texto: string;
  cor: string;
  icone: 'up' | 'down' | 'equal';
} {
  if (Math.abs(diferenca) <= 0.5) {
    return { texto: '=', cor: 'text-gray-500', icone: 'equal' };
  }
  if (diferenca > 0) {
    return { texto: `+${diferenca.toFixed(1)}%`, cor: 'text-green-500', icone: 'up' };
  }
  return { texto: `${diferenca.toFixed(1)}%`, cor: 'text-red-500', icone: 'down' };
}

/**
 * Retorna a cor baseada na severidade
 */
export function corPorSeveridade(severidade: string): string {
  switch (severidade) {
    case 'baixa':
      return 'text-green-500 bg-green-500/10';
    case 'media':
      return 'text-yellow-500 bg-yellow-500/10';
    case 'alta':
      return 'text-orange-500 bg-orange-500/10';
    case 'critica':
      return 'text-red-500 bg-red-500/10';
    default:
      return 'text-gray-500 bg-gray-500/10';
  }
}

/**
 * Retorna a cor baseada no status geral
 */
export function corPorStatus(status: string): string {
  switch (status) {
    case 'otimo':
      return 'text-green-500 bg-green-500/10 border-green-500/30';
    case 'bom':
      return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    case 'atencao':
      return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    case 'critico':
      return 'text-red-500 bg-red-500/10 border-red-500/30';
    default:
      return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
  }
}

/**
 * Retorna o emoji baseado no status
 */
export function emojiPorStatus(status: string): string {
  switch (status) {
    case 'otimo':
      return '✅';
    case 'bom':
      return '👍';
    case 'atencao':
      return '⚠️';
    case 'critico':
      return '🚨';
    default:
      return '❓';
  }
}
