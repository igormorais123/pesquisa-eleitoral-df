'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { useEleitoresStore } from '@/stores/eleitores-store';

// Tipos de filtro suportados para navegação
export type FilterType =
  | 'generos'
  | 'clusters'
  | 'regioes'
  | 'religioes'
  | 'orientacoes_politicas'
  | 'posicoes_bolsonaro'
  | 'faixas_etarias'
  | 'escolaridades'
  | 'ocupacoes_vinculos'
  | 'cores_racas'
  | 'faixas_renda'
  | 'estados_civis'
  | 'tem_filhos'
  | 'interesses_politicos'
  | 'estilos_decisao'
  | 'tolerancias_nuance'
  | 'meios_transporte'
  | 'susceptibilidade_desinformacao'
  | 'voto_facultativo'
  | 'conflito_identitario';

// Mapeamento de valores internos para valores legíveis (para exibição)
export const FILTER_LABELS: Record<FilterType, Record<string, string>> = {
  generos: {
    masculino: 'Masculino',
    feminino: 'Feminino',
  },
  clusters: {
    G1_alta: 'Classe Alta',
    G2_media_alta: 'Média-Alta',
    G3_media_baixa: 'Média-Baixa',
    G4_baixa: 'Classe Baixa',
  },
  orientacoes_politicas: {
    esquerda: 'Esquerda',
    'centro-esquerda': 'Centro-Esquerda',
    centro: 'Centro',
    'centro-direita': 'Centro-Direita',
    direita: 'Direita',
  },
  posicoes_bolsonaro: {
    apoiador_forte: 'Apoiador Forte',
    apoiador_moderado: 'Apoiador Moderado',
    neutro: 'Neutro',
    critico_moderado: 'Crítico Moderado',
    critico_forte: 'Crítico Forte',
  },
  religioes: {
    catolica: 'Católica',
    evangelica: 'Evangélica',
    espirita: 'Espírita',
    sem_religiao: 'Sem Religião',
    afro_brasileira: 'Afro-Brasileira',
    outras: 'Outras',
  },
  regioes: {},
  faixas_etarias: {
    '16-24': '16-24 anos',
    '25-34': '25-34 anos',
    '35-44': '35-44 anos',
    '45-54': '45-54 anos',
    '55-64': '55-64 anos',
    '65+': '65+ anos',
  },
  escolaridades: {
    fundamental_incompleto: 'Fund. Incompleto',
    fundamental_completo: 'Fund. Completo',
    medio_incompleto: 'Médio Incompleto',
    medio_completo_ou_sup_incompleto: 'Médio/Sup. Incompleto',
    superior_completo_ou_pos: 'Superior/Pós',
  },
  ocupacoes_vinculos: {
    clt: 'CLT',
    servidor_publico: 'Servidor Público',
    autonomo: 'Autônomo',
    empresario: 'Empresário',
    informal: 'Informal',
    desempregado: 'Desempregado',
    aposentado: 'Aposentado',
    estudante: 'Estudante',
  },
  cores_racas: {
    branca: 'Branca',
    parda: 'Parda',
    preta: 'Preta',
    amarela: 'Amarela',
    indigena: 'Indígena',
  },
  faixas_renda: {
    ate_1: 'Até 1 SM',
    mais_de_1_ate_2: '1-2 SM',
    mais_de_2_ate_5: '2-5 SM',
    mais_de_5_ate_10: '5-10 SM',
    mais_de_10: '+10 SM',
  },
  estados_civis: {
    solteiro: 'Solteiro(a)',
    casado: 'Casado(a)',
    divorciado: 'Divorciado(a)',
    viuvo: 'Viúvo(a)',
    'uniao_estavel': 'União Estável',
  },
  tem_filhos: {
    sim: 'Com Filhos',
    nao: 'Sem Filhos',
  },
  interesses_politicos: {
    baixo: 'Baixo',
    medio: 'Médio',
    alto: 'Alto',
  },
  estilos_decisao: {
    identitario: 'Identitário',
    pragmatico: 'Pragmático',
    moral: 'Moral',
    economico: 'Econômico',
    emocional: 'Emocional',
  },
  tolerancias_nuance: {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
  },
  meios_transporte: {
    carro_proprio: 'Carro Próprio',
    transporte_publico: 'Transporte Público',
    moto: 'Moto',
    bicicleta: 'Bicicleta',
    a_pe: 'A Pé',
    aplicativo: 'Aplicativo',
  },
  susceptibilidade_desinformacao: {
    '1-3': 'Baixa (1-3)',
    '4-6': 'Média (4-6)',
    '7-10': 'Alta (7-10)',
  },
  voto_facultativo: {
    sim: 'Voto Facultativo',
    nao: 'Voto Obrigatório',
  },
  conflito_identitario: {
    sim: 'Com Conflito',
    nao: 'Sem Conflito',
  },
};

// Hook para navegar para a página de eleitores com filtros
export function useFilterNavigation() {
  const router = useRouter();
  const setFiltros = useEleitoresStore((state) => state.setFiltros);
  const limparFiltros = useEleitoresStore((state) => state.limparFiltros);

  // Navega para eleitores com filtro específico
  const navigateWithFilter = useCallback(
    (filterType: FilterType, value: string | string[], clearOthers = true) => {
      if (clearOthers) {
        limparFiltros();
      }

      const values = Array.isArray(value) ? value : [value];
      // Usar type assertion para compatibilidade com os tipos específicos do store
      setFiltros({ [filterType]: values } as any);

      // Construir URL params para compartilhamento
      const params = new URLSearchParams();
      params.set('filtro', filterType);
      params.set('valor', values.join(','));

      router.push(`/eleitores?${params.toString()}`);
    },
    [router, setFiltros, limparFiltros]
  );

  // Navega para eleitores com múltiplos filtros
  const navigateWithFilters = useCallback(
    (filters: Partial<Record<FilterType, string[]>>, clearOthers = true) => {
      if (clearOthers) {
        limparFiltros();
      }

      // Usar type assertion para compatibilidade com os tipos específicos do store
      setFiltros(filters as any);

      // Construir URL params
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, values]) => {
        if (values && values.length > 0) {
          params.append(key, values.join(','));
        }
      });

      router.push(`/eleitores?${params.toString()}`);
    },
    [router, setFiltros, limparFiltros]
  );

  // Gera URL para filtro específico (sem navegar)
  const getFilterUrl = useCallback(
    (filterType: FilterType, value: string | string[]) => {
      const values = Array.isArray(value) ? value : [value];
      const params = new URLSearchParams();
      params.set('filtro', filterType);
      params.set('valor', values.join(','));
      return `/eleitores?${params.toString()}`;
    },
    []
  );

  return {
    navigateWithFilter,
    navigateWithFilters,
    getFilterUrl,
  };
}

// Hook para ler filtros da URL e aplicar
export function useUrlFilters() {
  const searchParams = useSearchParams();
  const setFiltros = useEleitoresStore((state) => state.setFiltros);
  const limparFiltros = useEleitoresStore((state) => state.limparFiltros);

  useEffect(() => {
    // Verificar se há filtros na URL
    const filtroParam = searchParams.get('filtro') as FilterType | null;
    const valorParam = searchParams.get('valor');

    if (filtroParam && valorParam) {
      limparFiltros();
      const valores = valorParam.split(',');
      setFiltros({ [filtroParam]: valores });
      return;
    }

    // Suporte para múltiplos filtros via params individuais
    const filtrosUrl: Partial<Record<FilterType, string[]>> = {};
    const filterTypes: FilterType[] = [
      'generos',
      'clusters',
      'regioes',
      'religioes',
      'orientacoes_politicas',
      'posicoes_bolsonaro',
      'faixas_etarias',
      'escolaridades',
      'ocupacoes_vinculos',
      'cores_racas',
      'faixas_renda',
      'estados_civis',
      'tem_filhos',
      'interesses_politicos',
      'estilos_decisao',
      'tolerancias_nuance',
      'meios_transporte',
      'susceptibilidade_desinformacao',
      'voto_facultativo',
      'conflito_identitario',
    ];

    let hasFilters = false;
    filterTypes.forEach((type) => {
      const value = searchParams.get(type);
      if (value) {
        filtrosUrl[type] = value.split(',');
        hasFilters = true;
      }
    });

    if (hasFilters) {
      limparFiltros();
      // Usar type assertion para compatibilidade com os tipos específicos do store
      setFiltros(filtrosUrl as any);
    }
  }, [searchParams, setFiltros, limparFiltros]);
}

// Helper para obter label legível de um valor de filtro
export function getFilterLabel(filterType: FilterType, value: string): string {
  return FILTER_LABELS[filterType]?.[value] || value;
}
