'use client';

import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEleitoresStore } from '@/stores/eleitores-store';
import { db, carregarEleitoresIniciais, filtrarEleitores } from '@/lib/db/dexie';
import type { Eleitor } from '@/types';
import eleitoresIniciais from '@/data/eleitores-df-400.json';

export function useEleitores() {
  const queryClient = useQueryClient();
  const {
    eleitores,
    eleitoresFiltrados,
    eleitorSelecionado,
    eleitoresSelecionados,
    carregando,
    erro,
    filtros,
    filtrosAbertos,
    setEleitores,
    setCarregando,
    setErro,
    selecionarEleitor,
    toggleSelecionarParaEntrevista,
    selecionarTodos,
    limparSelecao,
    selecionarPorFiltro,
    setFiltros,
    limparFiltros,
    toggleFiltros,
    aplicarFiltros,
    adicionarEleitores,
    removerEleitor,
  } = useEleitoresStore();

  // Query para carregar eleitores do IndexedDB
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['eleitores'],
    queryFn: async () => {
      // Verificar se já existem eleitores no banco
      const total = await db.eleitores.count();

      if (total === 0) {
        // Carregar eleitores iniciais do JSON
        const eleitoresComTimestamp = (eleitoresIniciais as Eleitor[]).map((e) => ({
          ...e,
          criado_em: e.criado_em || new Date().toISOString(),
          atualizado_em: e.atualizado_em || new Date().toISOString(),
        }));
        await carregarEleitoresIniciais(eleitoresComTimestamp);
      }

      // Retornar todos os eleitores
      return db.eleitores.toArray();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Atualizar store quando dados carregarem
  useEffect(() => {
    if (data) {
      setEleitores(data);
      aplicarFiltros();
    }
  }, [data, setEleitores, aplicarFiltros]);

  useEffect(() => {
    setCarregando(isLoading);
  }, [isLoading, setCarregando]);

  useEffect(() => {
    if (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao carregar eleitores');
    }
  }, [error, setErro]);

  // Mutation para adicionar eleitores
  const mutationAdicionar = useMutation({
    mutationFn: async (novosEleitores: Eleitor[]) => {
      await db.eleitores.bulkAdd(novosEleitores);
      return novosEleitores;
    },
    onSuccess: (novosEleitores) => {
      adicionarEleitores(novosEleitores);
      queryClient.invalidateQueries({ queryKey: ['eleitores'] });
    },
  });

  // Mutation para remover eleitor
  const mutationRemover = useMutation({
    mutationFn: async (id: string) => {
      await db.eleitores.delete(id);
      return id;
    },
    onSuccess: (id) => {
      removerEleitor(id);
      queryClient.invalidateQueries({ queryKey: ['eleitores'] });
    },
  });

  // Buscar eleitor por ID
  const buscarEleitorPorId = useCallback(async (id: string): Promise<Eleitor | undefined> => {
    return db.eleitores.get(id);
  }, []);

  // Estatísticas
  const estatisticas = {
    total: eleitores.length,
    filtrados: eleitoresFiltrados.length,
    selecionados: eleitoresSelecionados.length,
    porGenero: calcularDistribuicao(eleitoresFiltrados, 'genero'),
    porCluster: calcularDistribuicao(eleitoresFiltrados, 'cluster_socioeconomico'),
    porOrientacao: calcularDistribuicao(eleitoresFiltrados, 'orientacao_politica'),
    porReligiao: calcularDistribuicao(eleitoresFiltrados, 'religiao'),
    porRegiao: calcularDistribuicao(eleitoresFiltrados, 'regiao_administrativa'),
    mediaIdade: calcularMediaIdade(eleitoresFiltrados),
  };

  return {
    // Dados
    eleitores,
    eleitoresFiltrados,
    eleitorSelecionado,
    eleitoresSelecionados,
    estatisticas,

    // Estado
    carregando: carregando || isLoading,
    erro,

    // Filtros
    filtros,
    filtrosAbertos,

    // Ações
    recarregar: refetch,
    selecionarEleitor,
    toggleSelecionarParaEntrevista,
    selecionarTodos,
    limparSelecao,
    selecionarPorFiltro,
    setFiltros,
    limparFiltros,
    toggleFiltros,
    buscarEleitorPorId,

    // Mutations
    adicionarEleitores: mutationAdicionar.mutate,
    removerEleitor: mutationRemover.mutate,
    adicionandoEleitores: mutationAdicionar.isPending,
    removendoEleitor: mutationRemover.isPending,
  };
}

// Funções auxiliares
function calcularDistribuicao(
  eleitores: Eleitor[],
  campo: keyof Eleitor
): Record<string, number> {
  const distribuicao: Record<string, number> = {};

  eleitores.forEach((e) => {
    const valor = String(e[campo] || 'Não informado');
    distribuicao[valor] = (distribuicao[valor] || 0) + 1;
  });

  return distribuicao;
}

function calcularMediaIdade(eleitores: Eleitor[]): number {
  if (eleitores.length === 0) return 0;
  const soma = eleitores.reduce((acc, e) => acc + e.idade, 0);
  return soma / eleitores.length;
}
