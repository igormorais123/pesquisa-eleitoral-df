import Dexie, { type Table } from 'dexie';
import type { Eleitor, Entrevista, RespostaEleitor, ResultadoEntrevista, Memoria } from '@/types';

// Interface para sessões de entrevista
export interface SessaoEntrevista {
  id: string;
  entrevistaId: string;
  titulo: string;
  status: 'em_andamento' | 'pausada' | 'concluida' | 'erro';
  progresso: number;
  totalAgentes: number;
  custoAtual: number;
  tokensInput: number;
  tokensOutput: number;
  respostas: RespostaEleitor[];
  resultado?: ResultadoEntrevista;
  iniciadaEm: string;
  atualizadaEm: string;
  finalizadaEm?: string;
}

// Interface para configurações do sistema
export interface Configuracao {
  chave: string;
  valor: unknown;
  atualizadoEm: string;
}

// Definição do banco de dados
export class BancoEleitoral extends Dexie {
  eleitores!: Table<Eleitor, string>;
  memorias!: Table<Memoria, string>;
  entrevistas!: Table<Entrevista, string>;
  sessoes!: Table<SessaoEntrevista, string>;
  configuracoes!: Table<Configuracao, string>;

  constructor() {
    super('PesquisaEleitoralDF');

    this.version(1).stores({
      eleitores: 'id, nome, regiao_administrativa, cluster_socioeconomico, orientacao_politica, genero, religiao, idade',
      memorias: 'id, eleitor_id, data, tema',
      entrevistas: 'id, titulo, status, criado_em',
      sessoes: 'id, entrevistaId, status, iniciadaEm',
      configuracoes: 'chave',
    });
  }
}

// Instância única do banco
export const db = new BancoEleitoral();

// Funções de utilidade para o banco

// Carregar eleitores do JSON inicial
export async function carregarEleitoresIniciais(eleitores: Eleitor[]): Promise<void> {
  const total = await db.eleitores.count();
  if (total === 0) {
    await db.eleitores.bulkAdd(eleitores);
    console.log(`${eleitores.length} eleitores carregados no banco local`);
  }
}

// Obter todos os eleitores
export async function obterEleitores(): Promise<Eleitor[]> {
  return db.eleitores.toArray();
}

// Obter eleitor por ID
export async function obterEleitorPorId(id: string): Promise<Eleitor | undefined> {
  return db.eleitores.get(id);
}

// Adicionar eleitores
export async function adicionarEleitores(eleitores: Eleitor[]): Promise<void> {
  await db.eleitores.bulkAdd(eleitores);
}

// Atualizar eleitor
export async function atualizarEleitor(id: string, dados: Partial<Eleitor>): Promise<void> {
  await db.eleitores.update(id, dados);
}

// Remover eleitor
export async function removerEleitor(id: string): Promise<void> {
  await db.eleitores.delete(id);
}

// Limpar banco
export async function limparBanco(): Promise<void> {
  await db.eleitores.clear();
  await db.memorias.clear();
  await db.entrevistas.clear();
  await db.sessoes.clear();
}

// Sessões
export async function salvarSessao(sessao: SessaoEntrevista): Promise<void> {
  await db.sessoes.put(sessao);
}

export async function obterSessao(id: string): Promise<SessaoEntrevista | undefined> {
  return db.sessoes.get(id);
}

export async function obterSessoes(): Promise<SessaoEntrevista[]> {
  return db.sessoes.orderBy('iniciadaEm').reverse().toArray();
}

// Entrevistas
export async function salvarEntrevista(entrevista: Entrevista): Promise<void> {
  await db.entrevistas.put(entrevista);
}

export async function obterEntrevistas(): Promise<Entrevista[]> {
  return db.entrevistas.orderBy('criado_em').reverse().toArray();
}

// Configurações
export async function obterConfiguracao<T>(chave: string, padrao: T): Promise<T> {
  const config = await db.configuracoes.get(chave);
  return config ? (config.valor as T) : padrao;
}

export async function salvarConfiguracao(chave: string, valor: unknown): Promise<void> {
  await db.configuracoes.put({
    chave,
    valor,
    atualizadoEm: new Date().toISOString(),
  });
}

// Exportar banco para backup
export async function exportarBanco(): Promise<object> {
  const eleitores = await db.eleitores.toArray();
  const memorias = await db.memorias.toArray();
  const entrevistas = await db.entrevistas.toArray();
  const sessoes = await db.sessoes.toArray();
  const configuracoes = await db.configuracoes.toArray();

  return {
    versao: 1,
    exportadoEm: new Date().toISOString(),
    dados: {
      eleitores,
      memorias,
      entrevistas,
      sessoes,
      configuracoes,
    },
  };
}

// Importar banco de backup
export async function importarBanco(backup: {
  dados: {
    eleitores?: Eleitor[];
    memorias?: Memoria[];
    entrevistas?: Entrevista[];
    sessoes?: SessaoEntrevista[];
    configuracoes?: Configuracao[];
  };
}): Promise<void> {
  await limparBanco();

  if (backup.dados.eleitores?.length) {
    await db.eleitores.bulkAdd(backup.dados.eleitores);
  }
  if (backup.dados.memorias?.length) {
    await db.memorias.bulkAdd(backup.dados.memorias);
  }
  if (backup.dados.entrevistas?.length) {
    await db.entrevistas.bulkAdd(backup.dados.entrevistas);
  }
  if (backup.dados.sessoes?.length) {
    await db.sessoes.bulkAdd(backup.dados.sessoes);
  }
  if (backup.dados.configuracoes?.length) {
    await db.configuracoes.bulkAdd(backup.dados.configuracoes);
  }
}

// Filtrar eleitores
export async function filtrarEleitores(filtros: {
  generos?: string[];
  clusters?: string[];
  regioes?: string[];
  orientacoes?: string[];
  religioes?: string[];
  idadeMin?: number;
  idadeMax?: number;
  busca?: string;
}): Promise<Eleitor[]> {
  let query = db.eleitores.toCollection();

  const eleitores = await query.toArray();

  return eleitores.filter((e) => {
    if (filtros.generos?.length && !filtros.generos.includes(e.genero)) return false;
    if (filtros.clusters?.length && !filtros.clusters.includes(e.cluster_socioeconomico)) return false;
    if (filtros.regioes?.length && !filtros.regioes.includes(e.regiao_administrativa)) return false;
    if (filtros.orientacoes?.length && !filtros.orientacoes.includes(e.orientacao_politica)) return false;
    if (filtros.religioes?.length && !filtros.religioes.includes(e.religiao)) return false;
    if (filtros.idadeMin && e.idade < filtros.idadeMin) return false;
    if (filtros.idadeMax && e.idade > filtros.idadeMax) return false;
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase();
      const campos = [e.nome, e.profissao, e.historia_resumida, e.regiao_administrativa].join(' ').toLowerCase();
      if (!campos.includes(busca)) return false;
    }
    return true;
  });
}
