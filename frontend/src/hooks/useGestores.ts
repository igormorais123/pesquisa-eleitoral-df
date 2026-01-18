'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useGestoresStore } from '@/stores/gestores-store';
import { notify } from '@/stores/notifications-store';
import type { Gestor, SetorGestor, NivelHierarquico } from '@/types';

export function useGestores() {
  const notifiedRef = useRef(false);
  const [carregandoLocal, setCarregandoLocal] = useState(true);

  const {
    gestores,
    gestoresFiltrados,
    gestorSelecionado,
    gestoresSelecionados,
    carregando,
    erro,
    filtros,
    filtrosAbertos,
    setorAtivo,
    nivelAtivo,
    estatisticas,
    setGestores,
    setCarregando,
    setErro,
    selecionarGestor,
    toggleSelecionarParaPesquisa,
    selecionarTodos,
    limparSelecao,
    selecionarPorFiltro,
    setFiltros,
    limparFiltros,
    toggleFiltros,
    setSetorAtivo,
    setNivelAtivo,
    aplicarFiltros,
    calcularEstatisticas,
  } = useGestoresStore();

  // Carregar todos os gestores via fetch
  useEffect(() => {
    const carregarGestores = async () => {
      try {
        setCarregando(true);

        // Carregar dados dos gestores
        const res = await fetch('/data/banco-gestores.json');
        const data = await res.json();
        const todosGestores: Gestor[] = data.gestores || [];

        setGestores(todosGestores);

        // Notificar apenas uma vez quando carregar
        if (!notifiedRef.current && todosGestores.length > 0) {
          notifiedRef.current = true;
          notify.success(
            'Gestores carregados',
            `${todosGestores.length} perfis de gestores prontos para análise.`,
            { label: 'Ver gestores', href: '/gestores' }
          );
        }
      } catch (error) {
        setErro(error instanceof Error ? error.message : 'Erro ao carregar gestores');
      } finally {
        setCarregando(false);
        setCarregandoLocal(false);
      }
    };

    carregarGestores();
  }, [setGestores, setCarregando, setErro]);

  // Buscar gestor por ID
  const buscarGestorPorId = useCallback(
    (id: string): Gestor | undefined => {
      return gestores.find((g) => g.id === id);
    },
    [gestores]
  );

  // Contagem por setor
  const contagemPorSetor: Record<SetorGestor | 'todos', number> = {
    todos: gestores.length,
    publico: gestores.filter((g) => g.setor === 'publico').length,
    privado: gestores.filter((g) => g.setor === 'privado').length,
  };

  // Contagem por nível hierárquico
  const contagemPorNivel: Record<NivelHierarquico | 'todos', number> = {
    todos: gestoresFiltrados.length,
    estrategico: gestoresFiltrados.filter((g) => g.nivel_hierarquico === 'estrategico').length,
    tatico: gestoresFiltrados.filter((g) => g.nivel_hierarquico === 'tatico').length,
    operacional: gestoresFiltrados.filter((g) => g.nivel_hierarquico === 'operacional').length,
  };

  // Estatísticas completas
  const estatisticasCompletas = {
    total: gestores.length,
    filtrados: gestoresFiltrados.length,
    selecionados: gestoresSelecionados.length,
    mediaIdade: calcularMediaIdade(gestoresFiltrados),

    // Por setor
    porSetor: contagemPorSetor,

    // Por nível hierárquico
    porNivel: contagemPorNivel,

    // Demográficos
    porGenero: calcularDistribuicao(gestoresFiltrados, 'genero'),

    // PODC médio
    mediaPODC: calcularMediaPODC(gestoresFiltrados),

    // IAD médio
    mediaIAD: calcularMediaIAD(gestoresFiltrados),

    // Por área de atuação
    porArea: calcularDistribuicao(gestoresFiltrados, 'area_atuacao'),

    // Por estilo de liderança
    porEstiloLideranca: calcularDistribuicao(gestoresFiltrados, 'estilo_lideranca'),

    // Por localização
    porLocalizacao: calcularDistribuicaoLocalizacao(gestoresFiltrados),

    // Específicos do setor público
    porTipoOrgao: calcularDistribuicao(
      gestoresFiltrados.filter((g) => g.setor === 'publico'),
      'tipo_orgao'
    ),

    // Específicos do setor privado
    porSetorPrivado: calcularDistribuicao(
      gestoresFiltrados.filter((g) => g.setor === 'privado'),
      'setor_privado'
    ),
    porPorteEmpresa: calcularDistribuicao(
      gestoresFiltrados.filter((g) => g.setor === 'privado'),
      'porte_empresa'
    ),

    // Desafios cotidianos
    porDesafios: calcularDistribuicaoArray(gestoresFiltrados, 'desafios_cotidianos'),
  };

  return {
    // Dados
    gestores,
    gestoresFiltrados,
    gestorSelecionado,
    gestoresSelecionados,
    estatisticas: estatisticasCompletas,
    contagemPorSetor,
    contagemPorNivel,

    // Estado
    carregando: carregando || carregandoLocal,
    erro,

    // Filtros
    filtros,
    filtrosAbertos,
    setorAtivo,
    nivelAtivo,

    // Ações
    selecionarGestor,
    toggleSelecionarParaPesquisa,
    selecionarTodos,
    limparSelecao,
    selecionarPorFiltro,
    setFiltros,
    limparFiltros,
    toggleFiltros,
    setSetorAtivo,
    setNivelAtivo,
    buscarGestorPorId,
  };
}

// Funções auxiliares
function calcularDistribuicao(
  gestores: Gestor[],
  campo: keyof Gestor
): Record<string, number> {
  const distribuicao: Record<string, number> = {};

  gestores.forEach((g) => {
    const valor = String(g[campo] || 'Não informado');
    distribuicao[valor] = (distribuicao[valor] || 0) + 1;
  });

  return distribuicao;
}

function calcularDistribuicaoArray(
  gestores: Gestor[],
  campo: keyof Gestor
): Record<string, number> {
  const distribuicao: Record<string, number> = {};

  gestores.forEach((g) => {
    const valores = g[campo] as string[] | undefined;
    if (valores && Array.isArray(valores)) {
      valores.forEach((v) => {
        distribuicao[v] = (distribuicao[v] || 0) + 1;
      });
    }
  });

  return distribuicao;
}

function calcularDistribuicaoLocalizacao(gestores: Gestor[]): Record<string, number> {
  const distribuicao: Record<string, number> = {};

  gestores.forEach((g) => {
    // Pegar só a cidade (antes da vírgula)
    const cidade = g.localizacao.split(',')[0].trim();
    distribuicao[cidade] = (distribuicao[cidade] || 0) + 1;
  });

  return distribuicao;
}

function calcularMediaIdade(gestores: Gestor[]): number {
  if (gestores.length === 0) return 0;
  const soma = gestores.reduce((acc, g) => acc + g.idade, 0);
  return Math.round(soma / gestores.length);
}

function calcularMediaPODC(gestores: Gestor[]): {
  planejar: number;
  organizar: number;
  dirigir: number;
  controlar: number;
} {
  if (gestores.length === 0) {
    return { planejar: 0, organizar: 0, dirigir: 0, controlar: 0 };
  }

  const soma = gestores.reduce(
    (acc, g) => ({
      planejar: acc.planejar + g.distribuicao_podc.planejar,
      organizar: acc.organizar + g.distribuicao_podc.organizar,
      dirigir: acc.dirigir + g.distribuicao_podc.dirigir,
      controlar: acc.controlar + g.distribuicao_podc.controlar,
    }),
    { planejar: 0, organizar: 0, dirigir: 0, controlar: 0 }
  );

  return {
    planejar: Math.round((soma.planejar / gestores.length) * 10) / 10,
    organizar: Math.round((soma.organizar / gestores.length) * 10) / 10,
    dirigir: Math.round((soma.dirigir / gestores.length) * 10) / 10,
    controlar: Math.round((soma.controlar / gestores.length) * 10) / 10,
  };
}

function calcularMediaIAD(gestores: Gestor[]): number {
  if (gestores.length === 0) return 0;

  const soma = gestores.reduce((acc, g) => {
    const { planejar, organizar, dirigir, controlar } = g.distribuicao_podc;
    const iad = (planejar + organizar) / (dirigir + controlar);
    return acc + iad;
  }, 0);

  return Math.round((soma / gestores.length) * 100) / 100;
}
