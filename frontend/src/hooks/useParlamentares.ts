'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useParlamentaresStore } from '@/stores/parlamentares-store';
import { notify } from '@/stores/notifications-store';
import type { Parlamentar, CasaLegislativa } from '@/types';

export function useParlamentares() {
  const notifiedRef = useRef(false);
  const [carregandoLocal, setCarregandoLocal] = useState(true);

  const {
    parlamentares,
    parlamentaresFiltrados,
    parlamentarSelecionado,
    parlamentaresSelecionados,
    carregando,
    erro,
    filtros,
    filtrosAbertos,
    casaAtiva,
    estatisticas,
    setParlamentares,
    setCarregando,
    setErro,
    selecionarParlamentar,
    toggleSelecionarParaPesquisa,
    selecionarTodos,
    limparSelecao,
    selecionarPorFiltro,
    setFiltros,
    limparFiltros,
    toggleFiltros,
    setCasaAtiva,
    aplicarFiltros,
    calcularEstatisticas,
  } = useParlamentaresStore();

  // Carregar todos os parlamentares via fetch (para funcionar em produção)
  useEffect(() => {
    const carregarParlamentares = async () => {
      try {
        setCarregando(true);

        // Carregar dados de cada casa via fetch
        // Novos arquivos com todos os parlamentares do Congresso Nacional
        const [deputadosFederaisRes, senadoresRes, deputadosDistritaisRes] = await Promise.all([
          fetch('/data/banco-deputados-federais.json'),
          fetch('/data/banco-senadores.json'),
          fetch('/data/banco-deputados-distritais-df.json'),
        ]);

        const deputadosFederais = await deputadosFederaisRes.json();
        const senadores = await senadoresRes.json();
        const deputadosDistritais = await deputadosDistritaisRes.json();

        // Combinar todos os parlamentares de diferentes casas
        const todosParlamentares: Parlamentar[] = [
          ...(deputadosFederais as Parlamentar[]),
          ...(senadores as Parlamentar[]),
          ...(deputadosDistritais as Parlamentar[]),
        ];

        setParlamentares(todosParlamentares);

        // Notificar apenas uma vez quando carregar
        if (!notifiedRef.current && todosParlamentares.length > 0) {
          notifiedRef.current = true;
          notify.success(
            'Parlamentares carregados',
            `${todosParlamentares.length} perfis de parlamentares prontos para análise.`,
            { label: 'Ver parlamentares', href: '/parlamentares' }
          );
        }
      } catch (error) {
        setErro(error instanceof Error ? error.message : 'Erro ao carregar parlamentares');
      } finally {
        setCarregando(false);
        setCarregandoLocal(false);
      }
    };

    carregarParlamentares();
  }, [setParlamentares, setCarregando, setErro]);

  // Buscar parlamentar por ID
  const buscarParlamentarPorId = useCallback(
    (id: string): Parlamentar | undefined => {
      return parlamentares.find((p) => p.id === id);
    },
    [parlamentares]
  );

  // Contagem por casa legislativa
  const contagemPorCasa = {
    todas: parlamentares.length,
    camara_federal: parlamentares.filter((p) => p.casa_legislativa === 'camara_federal').length,
    senado: parlamentares.filter((p) => p.casa_legislativa === 'senado').length,
    cldf: parlamentares.filter((p) => p.casa_legislativa === 'cldf').length,
  };

  // Estatísticas completas
  const estatisticasCompletas = {
    total: parlamentares.length,
    filtrados: parlamentaresFiltrados.length,
    selecionados: parlamentaresSelecionados.length,
    mediaIdade: calcularMediaIdade(parlamentaresFiltrados),
    mediaVotos: calcularMediaVotos(parlamentaresFiltrados),

    // Por casa
    porCasa: contagemPorCasa,

    // Por UF (estado)
    porUf: calcularDistribuicao(parlamentaresFiltrados, 'uf'),

    // Demográficos
    porGenero: calcularDistribuicao(parlamentaresFiltrados, 'genero'),
    porCorRaca: calcularDistribuicao(parlamentaresFiltrados, 'cor_raca'),

    // Político
    porPartido: calcularDistribuicao(parlamentaresFiltrados, 'partido'),
    porOrientacao: calcularDistribuicao(parlamentaresFiltrados, 'orientacao_politica'),
    porBolsonaro: calcularDistribuicao(parlamentaresFiltrados, 'posicao_bolsonaro'),
    porLula: calcularDistribuicao(parlamentaresFiltrados, 'posicao_lula'),
    porRelacaoGoverno: calcularDistribuicao(parlamentaresFiltrados, 'relacao_governo_atual'),

    // Religião
    porReligiao: calcularDistribuicao(parlamentaresFiltrados, 'religiao'),

    // Temas de atuação
    porTemasAtuacao: calcularDistribuicaoArray(parlamentaresFiltrados, 'temas_atuacao'),

    // Estilos de comunicação
    porEstiloComunicacao: calcularDistribuicao(parlamentaresFiltrados, 'estilo_comunicacao'),

    // Valores e preocupações
    porValores: calcularDistribuicaoArray(parlamentaresFiltrados, 'valores'),
    porPreocupacoes: calcularDistribuicaoArray(parlamentaresFiltrados, 'preocupacoes'),
  };

  return {
    // Dados
    parlamentares,
    parlamentaresFiltrados,
    parlamentarSelecionado,
    parlamentaresSelecionados,
    estatisticas: estatisticasCompletas,
    contagemPorCasa,

    // Estado
    carregando: carregando || carregandoLocal,
    erro,

    // Filtros
    filtros,
    filtrosAbertos,
    casaAtiva,

    // Ações
    selecionarParlamentar,
    toggleSelecionarParaPesquisa,
    selecionarTodos,
    limparSelecao,
    selecionarPorFiltro,
    setFiltros,
    limparFiltros,
    toggleFiltros,
    setCasaAtiva,
    buscarParlamentarPorId,
  };
}

// Funções auxiliares
function calcularDistribuicao(
  parlamentares: Parlamentar[],
  campo: keyof Parlamentar
): Record<string, number> {
  const distribuicao: Record<string, number> = {};

  parlamentares.forEach((p) => {
    const valor = String(p[campo] || 'Não informado');
    distribuicao[valor] = (distribuicao[valor] || 0) + 1;
  });

  return distribuicao;
}

function calcularDistribuicaoArray(
  parlamentares: Parlamentar[],
  campo: keyof Parlamentar
): Record<string, number> {
  const distribuicao: Record<string, number> = {};

  parlamentares.forEach((p) => {
    const valores = p[campo] as string[] | undefined;
    if (valores && Array.isArray(valores)) {
      valores.forEach((v) => {
        distribuicao[v] = (distribuicao[v] || 0) + 1;
      });
    }
  });

  return distribuicao;
}

function calcularMediaIdade(parlamentares: Parlamentar[]): number {
  if (parlamentares.length === 0) return 0;
  const soma = parlamentares.reduce((acc, p) => acc + p.idade, 0);
  return Math.round(soma / parlamentares.length);
}

function calcularMediaVotos(parlamentares: Parlamentar[]): number {
  if (parlamentares.length === 0) return 0;
  const soma = parlamentares.reduce((acc, p) => acc + p.votos_eleicao, 0);
  return Math.round(soma / parlamentares.length);
}
