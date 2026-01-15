'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEleitoresStore } from '@/stores/eleitores-store';
import { notify } from '@/stores/notifications-store';
import { db, carregarEleitoresIniciais, filtrarEleitores } from '@/lib/db/dexie';
import type { Eleitor } from '@/types';
import eleitoresIniciais from '@/data/eleitores-df-400.json';

export function useEleitores() {
  const queryClient = useQueryClient();
  const notifiedRef = useRef(false);
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

      // Notificar apenas uma vez quando carregar
      if (!notifiedRef.current && data.length > 0) {
        notifiedRef.current = true;
        notify.success(
          'Eleitores carregados',
          `${data.length} perfis de eleitores prontos para análise.`,
          { label: 'Ver eleitores', href: '/eleitores' }
        );
      }
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
      notify.success(
        'Eleitores adicionados',
        `${novosEleitores.length} novo${novosEleitores.length > 1 ? 's' : ''} eleitor${novosEleitores.length > 1 ? 'es' : ''} adicionado${novosEleitores.length > 1 ? 's' : ''} com sucesso.`
      );
    },
    onError: () => {
      notify.error(
        'Erro ao adicionar',
        'Não foi possível adicionar os eleitores. Tente novamente.'
      );
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
      notify.info('Eleitor removido', 'O eleitor foi removido da base de dados.');
    },
    onError: () => {
      notify.error(
        'Erro ao remover',
        'Não foi possível remover o eleitor. Tente novamente.'
      );
    },
  });

  // Buscar eleitor por ID
  const buscarEleitorPorId = useCallback(async (id: string): Promise<Eleitor | undefined> => {
    return db.eleitores.get(id);
  }, []);

  // Estatísticas completas
  const estatisticas = {
    total: eleitores.length,
    filtrados: eleitoresFiltrados.length,
    selecionados: eleitoresSelecionados.length,
    mediaIdade: calcularMediaIdade(eleitoresFiltrados),

    // Demográficos
    porGenero: calcularDistribuicao(eleitoresFiltrados, 'genero'),
    porCorRaca: calcularDistribuicao(eleitoresFiltrados, 'cor_raca'),
    porRegiao: calcularDistribuicao(eleitoresFiltrados, 'regiao_administrativa'),

    // Socioeconômicos
    porCluster: calcularDistribuicao(eleitoresFiltrados, 'cluster_socioeconomico'),
    porEscolaridade: calcularDistribuicao(eleitoresFiltrados, 'escolaridade'),
    porOcupacao: calcularDistribuicao(eleitoresFiltrados, 'ocupacao_vinculo'),
    porRenda: calcularDistribuicao(eleitoresFiltrados, 'renda_salarios_minimos'),
    porTransporte: calcularDistribuicao(eleitoresFiltrados, 'meio_transporte'),

    // Vida pessoal
    porEstadoCivil: calcularDistribuicao(eleitoresFiltrados, 'estado_civil'),
    porReligiao: calcularDistribuicao(eleitoresFiltrados, 'religiao'),
    comFilhos: eleitoresFiltrados.filter((e) => e.filhos > 0).length,
    semFilhos: eleitoresFiltrados.filter((e) => e.filhos === 0).length,

    // Político
    porOrientacao: calcularDistribuicao(eleitoresFiltrados, 'orientacao_politica'),
    porBolsonaro: calcularDistribuicao(eleitoresFiltrados, 'posicao_bolsonaro'),
    porInteresse: calcularDistribuicao(eleitoresFiltrados, 'interesse_politico'),

    // Psicológico
    porEstiloDecisao: calcularDistribuicao(eleitoresFiltrados, 'estilo_decisao'),
    porTolerancia: calcularDistribuicao(eleitoresFiltrados, 'tolerancia_nuance'),
    porVieses: calcularDistribuicaoArray(eleitoresFiltrados, 'vieses_cognitivos'),

    // Informação
    porFontes: calcularDistribuicaoArray(eleitoresFiltrados, 'fontes_informacao'),
    porSusceptibilidade: calcularSusceptibilidade(eleitoresFiltrados),

    // Valores e preocupações
    porValores: calcularDistribuicaoArray(eleitoresFiltrados, 'valores'),
    porPreocupacoes: calcularDistribuicaoArray(eleitoresFiltrados, 'preocupacoes'),
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

function calcularDistribuicaoArray(
  eleitores: Eleitor[],
  campo: keyof Eleitor
): Record<string, number> {
  const distribuicao: Record<string, number> = {};

  eleitores.forEach((e) => {
    const valores = e[campo] as string[] | undefined;
    if (valores && Array.isArray(valores)) {
      valores.forEach((v) => {
        distribuicao[v] = (distribuicao[v] || 0) + 1;
      });
    }
  });

  return distribuicao;
}

function calcularMediaIdade(eleitores: Eleitor[]): number {
  if (eleitores.length === 0) return 0;
  const soma = eleitores.reduce((acc, e) => acc + e.idade, 0);
  return soma / eleitores.length;
}

function calcularSusceptibilidade(eleitores: Eleitor[]): Record<string, number> {
  const baixa = eleitores.filter((e) => (e.susceptibilidade_desinformacao || 0) <= 3).length;
  const media = eleitores.filter((e) => {
    const s = e.susceptibilidade_desinformacao || 0;
    return s > 3 && s <= 6;
  }).length;
  const alta = eleitores.filter((e) => (e.susceptibilidade_desinformacao || 0) > 6).length;

  return { 'Baixa (1-3)': baixa, 'Média (4-6)': media, 'Alta (7-10)': alta };
}
