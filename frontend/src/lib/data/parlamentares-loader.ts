/**
 * Loader de Parlamentares
 *
 * Carrega parlamentares do IndexedDB se disponível,
 * senão carrega dos JSONs estáticos e salva no IndexedDB.
 */

import type { Parlamentar } from '@/types';
import {
  carregarParlamentares,
  salvarParlamentares,
  contarParlamentares,
} from '@/lib/db/dexie';

// Flag para controlar se já inicializou
let inicializado = false;
let carregando = false;

/**
 * Carrega parlamentares de uma casa específica do JSON
 */
async function carregarJsonPorCasa(casa: 'camara_federal' | 'senado' | 'cldf'): Promise<Parlamentar[]> {
  try {
    switch (casa) {
      case 'camara_federal': {
        const dados = await import('../../../../agentes/banco-deputados-federais-df.json');
        return dados.default as unknown as Parlamentar[];
      }
      case 'senado': {
        const dados = await import('../../../../agentes/banco-senadores-df.json');
        return dados.default as unknown as Parlamentar[];
      }
      case 'cldf': {
        const dados = await import('../../../../agentes/banco-deputados-distritais-df.json');
        return dados.default as unknown as Parlamentar[];
      }
      default:
        return [];
    }
  } catch (error) {
    console.error(`Erro ao carregar JSON de ${casa}:`, error);
    return [];
  }
}

/**
 * Carrega todos os parlamentares dos JSONs estáticos
 */
async function carregarTodosJsons(): Promise<Parlamentar[]> {
  const [camara, senado, cldf] = await Promise.all([
    carregarJsonPorCasa('camara_federal'),
    carregarJsonPorCasa('senado'),
    carregarJsonPorCasa('cldf'),
  ]);

  return [...camara, ...senado, ...cldf];
}

/**
 * Inicializa o banco de parlamentares
 *
 * - Se já existem dados no IndexedDB, usa eles
 * - Se não existem, carrega dos JSONs e salva no IndexedDB
 */
export async function inicializarParlamentares(): Promise<Parlamentar[]> {
  // Evitar múltiplas inicializações simultâneas
  if (carregando) {
    // Aguardar inicialização em andamento
    while (carregando) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return carregarParlamentares();
  }

  if (inicializado) {
    return carregarParlamentares();
  }

  carregando = true;

  try {
    // Verificar se já tem dados no IndexedDB
    const total = await contarParlamentares();

    if (total > 0) {
      console.log(`[ParlamentaresLoader] ${total} parlamentares encontrados no IndexedDB`);
      inicializado = true;
      return carregarParlamentares();
    }

    // Carregar dos JSONs e salvar no IndexedDB
    console.log('[ParlamentaresLoader] Carregando parlamentares dos JSONs...');
    const parlamentares = await carregarTodosJsons();

    if (parlamentares.length > 0) {
      await salvarParlamentares(parlamentares);
      console.log(`[ParlamentaresLoader] ${parlamentares.length} parlamentares salvos no IndexedDB`);
    }

    inicializado = true;
    return parlamentares;
  } catch (error) {
    console.error('[ParlamentaresLoader] Erro ao inicializar:', error);
    // Fallback: retornar dos JSONs sem salvar
    return carregarTodosJsons();
  } finally {
    carregando = false;
  }
}

/**
 * Força recarga dos JSONs (atualiza IndexedDB)
 */
export async function recarregarParlamentares(): Promise<Parlamentar[]> {
  console.log('[ParlamentaresLoader] Recarregando parlamentares dos JSONs...');

  const parlamentares = await carregarTodosJsons();

  if (parlamentares.length > 0) {
    await salvarParlamentares(parlamentares);
    console.log(`[ParlamentaresLoader] ${parlamentares.length} parlamentares atualizados no IndexedDB`);
  }

  return parlamentares;
}

/**
 * Obtém parlamentares do IndexedDB (sem reinicializar)
 */
export async function obterParlamentares(): Promise<Parlamentar[]> {
  if (!inicializado) {
    return inicializarParlamentares();
  }
  return carregarParlamentares();
}

/**
 * Obtém parlamentar por ID
 */
export async function obterParlamentarPorId(id: string): Promise<Parlamentar | undefined> {
  const parlamentares = await obterParlamentares();
  return parlamentares.find(p => p.id === id);
}

/**
 * Obtém parlamentares por casa legislativa
 */
export async function obterParlamentaresPorCasa(
  casa: 'camara_federal' | 'senado' | 'cldf'
): Promise<Parlamentar[]> {
  const parlamentares = await obterParlamentares();
  return parlamentares.filter(p => p.casa_legislativa === casa);
}

/**
 * Obtém contagem por casa
 */
export async function obterContagemPorCasa(): Promise<{
  total: number;
  camara_federal: number;
  senado: number;
  cldf: number;
}> {
  const parlamentares = await obterParlamentares();

  return {
    total: parlamentares.length,
    camara_federal: parlamentares.filter(p => p.casa_legislativa === 'camara_federal').length,
    senado: parlamentares.filter(p => p.casa_legislativa === 'senado').length,
    cldf: parlamentares.filter(p => p.casa_legislativa === 'cldf').length,
  };
}

/**
 * Verifica se o IndexedDB está disponível e inicializado
 */
export function estaInicializado(): boolean {
  return inicializado;
}

/**
 * Reset do estado (para testes)
 */
export function resetarEstado(): void {
  inicializado = false;
  carregando = false;
}
