import type { Eleitor } from '@/types';

type Coluna = {
  chave: keyof Eleitor | 'valores' | 'preocupacoes' | 'vieses_cognitivos' | 'medos' | 'fontes_informacao' | 'memorias';
  rotulo: string;
};

const colunas: Coluna[] = [
  { chave: 'id', rotulo: 'id' },
  { chave: 'nome', rotulo: 'nome' },
  { chave: 'idade', rotulo: 'idade' },
  { chave: 'genero', rotulo: 'genero' },
  { chave: 'cor_raca', rotulo: 'cor_raca' },
  { chave: 'regiao_administrativa', rotulo: 'regiao_administrativa' },
  { chave: 'local_referencia', rotulo: 'local_referencia' },
  { chave: 'cluster_socioeconomico', rotulo: 'cluster_socioeconomico' },
  { chave: 'escolaridade', rotulo: 'escolaridade' },
  { chave: 'profissao', rotulo: 'profissao' },
  { chave: 'ocupacao_vinculo', rotulo: 'ocupacao_vinculo' },
  { chave: 'renda_salarios_minimos', rotulo: 'renda_salarios_minimos' },
  { chave: 'religiao', rotulo: 'religiao' },
  { chave: 'estado_civil', rotulo: 'estado_civil' },
  { chave: 'filhos', rotulo: 'filhos' },
  { chave: 'orientacao_politica', rotulo: 'orientacao_politica' },
  { chave: 'posicao_bolsonaro', rotulo: 'posicao_bolsonaro' },
  { chave: 'interesse_politico', rotulo: 'interesse_politico' },
  { chave: 'tolerancia_nuance', rotulo: 'tolerancia_nuance' },
  { chave: 'estilo_decisao', rotulo: 'estilo_decisao' },
  { chave: 'valores', rotulo: 'valores' },
  { chave: 'preocupacoes', rotulo: 'preocupacoes' },
  { chave: 'vieses_cognitivos', rotulo: 'vieses_cognitivos' },
  { chave: 'medos', rotulo: 'medos' },
  { chave: 'fontes_informacao', rotulo: 'fontes_informacao' },
  { chave: 'susceptibilidade_desinformacao', rotulo: 'susceptibilidade_desinformacao' },
  { chave: 'meio_transporte', rotulo: 'meio_transporte' },
  { chave: 'tempo_deslocamento_trabalho', rotulo: 'tempo_deslocamento_trabalho' },
  { chave: 'voto_facultativo', rotulo: 'voto_facultativo' },
  { chave: 'conflito_identitario', rotulo: 'conflito_identitario' },
  { chave: 'historia_resumida', rotulo: 'historia_resumida' },
  { chave: 'instrucao_comportamental', rotulo: 'instrucao_comportamental' },
  { chave: 'observacao_territorial', rotulo: 'observacao_territorial' },
  { chave: 'avatar_url', rotulo: 'avatar_url' },
  { chave: 'memorias', rotulo: 'memorias' },
  { chave: 'criado_em', rotulo: 'criado_em' },
  { chave: 'atualizado_em', rotulo: 'atualizado_em' },
];

function normalizarValor(valor: unknown): string {
  if (valor === null || valor === undefined) {
    return '';
  }
  if (Array.isArray(valor)) {
    return JSON.stringify(valor);
  }
  if (typeof valor === 'object') {
    return JSON.stringify(valor);
  }
  return String(valor);
}

function escaparCsv(valor: string): string {
  const precisaEscapar = /[",\n\r]/.test(valor);
  if (!precisaEscapar) {
    return valor;
  }
  return `"${valor.replace(/"/g, '""')}"`;
}

export function exportarEleitoresCSV(eleitores: Eleitor[]) {
  const cabecalho = colunas.map((coluna) => escaparCsv(coluna.rotulo)).join(',');

  const linhas = eleitores.map((eleitor) => {
    const valores = colunas.map((coluna) => {
      const valor = normalizarValor((eleitor as unknown as Record<string, unknown>)[coluna.chave]);
      return escaparCsv(valor);
    });
    return valores.join(',');
  });

  const conteudo = [cabecalho, ...linhas].join('\n');
  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `eleitores_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}
