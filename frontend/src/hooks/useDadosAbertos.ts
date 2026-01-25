'use client';

import { useQuery } from '@tanstack/react-query';
import {
  camaraAPI,
  senadoAPI,
  buscarHistoricoVotacoesDeputado,
  buscarResumoDespesasDeputado,
  buscarPautasEmVotacao,
  gerarSugestoesPerguntasPautas,
} from '@/services/dados-abertos';

/**
 * Hook para buscar deputados federais do DF via API da Câmara
 */
export function useDeputadosFederaisDF() {
  return useQuery({
    queryKey: ['deputados-federais-df'],
    queryFn: () => camaraAPI.listarDeputados({ siglaUf: 'DF' }),
    staleTime: 60 * 60 * 1000, // 1 hora
  });
}

/**
 * Hook para buscar detalhes de um deputado
 */
export function useDeputadoDetalhes(id: number | null) {
  return useQuery({
    queryKey: ['deputado-detalhes', id],
    queryFn: () => (id ? camaraAPI.obterDeputado(id) : null),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
}

/**
 * Hook para buscar despesas de um deputado
 */
export function useDespesasDeputado(id: number | null, ano?: number) {
  return useQuery({
    queryKey: ['despesas-deputado', id, ano],
    queryFn: () =>
      id
        ? buscarResumoDespesasDeputado(id, ano || new Date().getFullYear())
        : null,
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
}

/**
 * Hook para buscar histórico de votações de um deputado
 */
export function useVotacoesDeputado(id: number | null) {
  return useQuery({
    queryKey: ['votacoes-deputado', id],
    queryFn: () => {
      if (!id) return null;
      const umAnoAtras = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      const hoje = new Date().toISOString().split('T')[0];
      return buscarHistoricoVotacoesDeputado(id, umAnoAtras, hoje);
    },
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 hora
  });
}

/**
 * Hook para buscar senadores em exercício
 */
export function useSenadoresEmExercicio() {
  return useQuery({
    queryKey: ['senadores-exercicio'],
    queryFn: () => senadoAPI.listarSenadoresEmExercicio(),
    staleTime: 60 * 60 * 1000, // 1 hora
  });
}

/**
 * Hook para buscar detalhes de um senador
 */
export function useSenadorDetalhes(codigo: number | null) {
  return useQuery({
    queryKey: ['senador-detalhes', codigo],
    queryFn: () => (codigo ? senadoAPI.obterSenador(codigo) : null),
    enabled: !!codigo,
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
}

/**
 * Hook para buscar votações de um senador
 */
export function useVotacoesSenador(codigo: number | null, ano?: number) {
  return useQuery({
    queryKey: ['votacoes-senador', codigo, ano],
    queryFn: () =>
      codigo ? senadoAPI.listarVotacoesSenador(codigo, ano) : null,
    enabled: !!codigo,
    staleTime: 60 * 60 * 1000, // 1 hora
  });
}

/**
 * Hook para buscar pautas em votação recentes
 */
export function usePautasRecentes() {
  return useQuery({
    queryKey: ['pautas-recentes'],
    queryFn: () => buscarPautasEmVotacao(),
    staleTime: 15 * 60 * 1000, // 15 minutos
    refetchInterval: 15 * 60 * 1000, // Atualiza a cada 15 minutos
  });
}

/**
 * Hook para gerar sugestões de perguntas baseadas em pautas
 */
export function useSugestoesPerguntasPautas() {
  return useQuery({
    queryKey: ['sugestoes-perguntas-pautas'],
    queryFn: () => gerarSugestoesPerguntasPautas(),
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
}

/**
 * Hook para buscar agenda do plenário do Senado
 */
export function useAgendaPlenarioSenado(data?: string) {
  return useQuery({
    queryKey: ['agenda-plenario-senado', data],
    queryFn: () => senadoAPI.obterAgendaPlenario(data),
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
}

/**
 * Hook para buscar comissões do Senado
 */
export function useComissoesSenado() {
  return useQuery({
    queryKey: ['comissoes-senado'],
    queryFn: () => senadoAPI.listarComissoes(),
    staleTime: 24 * 60 * 60 * 1000, // 24 horas
  });
}

/**
 * Hook para buscar órgãos da Câmara
 */
export function useOrgaosCamara() {
  return useQuery({
    queryKey: ['orgaos-camara'],
    queryFn: () => camaraAPI.listarOrgaos(),
    staleTime: 24 * 60 * 60 * 1000, // 24 horas
  });
}

/**
 * Hook para buscar votações recentes da Câmara
 */
export function useVotacoesRecentesCamara() {
  return useQuery({
    queryKey: ['votacoes-recentes-camara'],
    queryFn: async () => {
      const hoje = new Date().toISOString().split('T')[0];
      const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      return camaraAPI.listarVotacoes({
        dataInicio: seteDiasAtras,
        dataFim: hoje,
        ordem: 'DESC',
      });
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
    refetchInterval: 15 * 60 * 1000, // Atualiza a cada 15 minutos
  });
}

/**
 * Hook para buscar proposições em tramitação
 */
export function useProposicoesEmTramitacao(siglasTipo?: string[]) {
  return useQuery({
    queryKey: ['proposicoes-tramitacao', siglasTipo],
    queryFn: async () => {
      const tipos = siglasTipo || ['PL', 'PEC', 'PLP'];
      const proposicoes = await Promise.all(
        tipos.map((tipo) =>
          camaraAPI.listarProposicoes({
            siglaTipo: tipo,
            tramitacaoSenado: false,
          })
        )
      );
      return proposicoes.flat();
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
}
