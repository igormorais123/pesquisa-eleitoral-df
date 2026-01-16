import Dexie, { type Table } from 'dexie';
import type { Eleitor, Entrevista, RespostaEleitor, ResultadoEntrevista, Memoria, Parlamentar } from '@/types';

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
  // Vínculo com usuário logado
  usuarioId?: string;
  usuarioNome?: string;
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
  parlamentares!: Table<Parlamentar, string>;

  constructor() {
    super('PesquisaEleitoralDF');

    this.version(1).stores({
      eleitores: 'id, nome, regiao_administrativa, cluster_socioeconomico, orientacao_politica, genero, religiao, idade',
      memorias: 'id, eleitor_id, data, tema',
      entrevistas: 'id, titulo, status, criado_em',
      sessoes: 'id, entrevistaId, status, iniciadaEm',
      configuracoes: 'chave',
    });

    // Versão 2: Adiciona índice por usuário nas sessões
    this.version(2).stores({
      eleitores: 'id, nome, regiao_administrativa, cluster_socioeconomico, orientacao_politica, genero, religiao, idade',
      memorias: 'id, eleitor_id, data, tema',
      entrevistas: 'id, titulo, status, criado_em',
      sessoes: 'id, entrevistaId, status, iniciadaEm, usuarioId',
      configuracoes: 'chave',
    });

    // Versão 3: Adiciona tabela de parlamentares
    this.version(3).stores({
      eleitores: 'id, nome, regiao_administrativa, cluster_socioeconomico, orientacao_politica, genero, religiao, idade',
      memorias: 'id, eleitor_id, data, tema',
      entrevistas: 'id, titulo, status, criado_em',
      sessoes: 'id, entrevistaId, status, iniciadaEm, usuarioId',
      configuracoes: 'chave',
      parlamentares: 'id, nome, nome_parlamentar, casa_legislativa, partido, orientacao_politica, genero, cargo',
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
  await db.parlamentares.clear();
}

// ============================================
// PARLAMENTARES
// ============================================

// Carregar parlamentares do JSON inicial
export async function carregarParlamentaresIniciais(parlamentares: Parlamentar[]): Promise<void> {
  const total = await db.parlamentares.count();
  if (total === 0) {
    await db.parlamentares.bulkAdd(parlamentares);
    console.log(`${parlamentares.length} parlamentares carregados no banco local`);
  }
}

// Salvar parlamentares (substitui todos)
export async function salvarParlamentares(parlamentares: Parlamentar[]): Promise<void> {
  await db.parlamentares.clear();
  await db.parlamentares.bulkAdd(parlamentares);
  console.log(`${parlamentares.length} parlamentares salvos no banco local`);
}

// Carregar todos os parlamentares
export async function carregarParlamentares(): Promise<Parlamentar[]> {
  return db.parlamentares.toArray();
}

// Obter parlamentar por ID
export async function obterParlamentarPorId(id: string): Promise<Parlamentar | undefined> {
  return db.parlamentares.get(id);
}

// Obter parlamentares por casa legislativa
export async function obterParlamentaresPorCasa(casa: string): Promise<Parlamentar[]> {
  return db.parlamentares.where('casa_legislativa').equals(casa).toArray();
}

// Adicionar parlamentares
export async function adicionarParlamentares(parlamentares: Parlamentar[]): Promise<void> {
  await db.parlamentares.bulkAdd(parlamentares);
}

// Atualizar parlamentar
export async function atualizarParlamentar(id: string, dados: Partial<Parlamentar>): Promise<void> {
  await db.parlamentares.update(id, dados);
}

// Remover parlamentar
export async function removerParlamentar(id: string): Promise<void> {
  await db.parlamentares.delete(id);
}

// Limpar apenas parlamentares
export async function limparParlamentares(): Promise<void> {
  await db.parlamentares.clear();
}

// Contar parlamentares
export async function contarParlamentares(): Promise<number> {
  return db.parlamentares.count();
}

// Filtrar parlamentares
export async function filtrarParlamentares(filtros: {
  casas?: string[];
  partidos?: string[];
  generos?: string[];
  orientacoes?: string[];
  busca?: string;
}): Promise<Parlamentar[]> {
  const parlamentares = await db.parlamentares.toArray();

  return parlamentares.filter((p) => {
    if (filtros.casas?.length && !filtros.casas.includes(p.casa_legislativa)) return false;
    if (filtros.partidos?.length && !filtros.partidos.includes(p.partido)) return false;
    if (filtros.generos?.length && !filtros.generos.includes(p.genero)) return false;
    if (filtros.orientacoes?.length && !filtros.orientacoes.includes(p.orientacao_politica)) return false;
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase();
      const campos = [p.nome, p.nome_parlamentar, p.partido, p.base_eleitoral].join(' ').toLowerCase();
      if (!campos.includes(busca)) return false;
    }
    return true;
  });
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

// Obter sessões filtradas por usuário
export async function obterSessoesPorUsuario(usuarioId: string): Promise<SessaoEntrevista[]> {
  return db.sessoes
    .where('usuarioId')
    .equals(usuarioId)
    .reverse()
    .sortBy('iniciadaEm');
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
  const parlamentares = await db.parlamentares.toArray();

  return {
    versao: 3,
    exportadoEm: new Date().toISOString(),
    dados: {
      eleitores,
      memorias,
      entrevistas,
      sessoes,
      configuracoes,
      parlamentares,
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
    parlamentares?: Parlamentar[];
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
  if (backup.dados.parlamentares?.length) {
    await db.parlamentares.bulkAdd(backup.dados.parlamentares);
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
