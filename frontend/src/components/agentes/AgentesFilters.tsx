'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Search,
} from 'lucide-react';
import type { FiltrosEleitor, Genero, ClusterSocioeconomico, OrientacaoPolitica, PosicaoBolsonaro } from '@/types';

// Hook de debounce para otimizar buscas
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface AgentesFiltersProps {
  filtros: FiltrosEleitor;
  onFiltrosChange: (filtros: Partial<FiltrosEleitor>) => void;
  onLimpar: () => void;
  totalEleitores: number;
  totalFiltrados: number;
}

// Opções de filtro
const GENEROS = [
  { valor: 'masculino', rotulo: 'Masculino' },
  { valor: 'feminino', rotulo: 'Feminino' },
];

const CLUSTERS = [
  { valor: 'G1_alta', rotulo: 'G1 - Alta Renda' },
  { valor: 'G2_media_alta', rotulo: 'G2 - Média-Alta' },
  { valor: 'G3_media_baixa', rotulo: 'G3 - Média-Baixa' },
  { valor: 'G4_baixa', rotulo: 'G4 - Baixa Renda' },
];

const ORIENTACOES = [
  { valor: 'esquerda', rotulo: 'Esquerda' },
  { valor: 'centro-esquerda', rotulo: 'Centro-Esquerda' },
  { valor: 'centro', rotulo: 'Centro' },
  { valor: 'centro-direita', rotulo: 'Centro-Direita' },
  { valor: 'direita', rotulo: 'Direita' },
];

const POSICOES_BOLSONARO = [
  { valor: 'apoiador_forte', rotulo: 'Apoiador Forte' },
  { valor: 'apoiador_moderado', rotulo: 'Apoiador Moderado' },
  { valor: 'neutro', rotulo: 'Neutro' },
  { valor: 'critico_moderado', rotulo: 'Crítico Moderado' },
  { valor: 'critico_forte', rotulo: 'Crítico Forte' },
];

const RELIGIOES = [
  { valor: 'catolica', rotulo: 'Católica' },
  { valor: 'evangelica', rotulo: 'Evangélica' },
  { valor: 'espirita', rotulo: 'Espírita' },
  { valor: 'sem_religiao', rotulo: 'Sem Religião' },
  { valor: 'umbanda_candomble', rotulo: 'Umbanda/Candomblé' },
  { valor: 'outras', rotulo: 'Outras' },
];

const FAIXAS_ETARIAS = [
  { valor: '16-24', rotulo: '16-24 anos' },
  { valor: '25-34', rotulo: '25-34 anos' },
  { valor: '35-44', rotulo: '35-44 anos' },
  { valor: '45-54', rotulo: '45-54 anos' },
  { valor: '55-64', rotulo: '55-64 anos' },
  { valor: '65+', rotulo: '65+ anos' },
];

const REGIOES = [
  'Ceilândia',
  'Taguatinga',
  'Samambaia',
  'Plano Piloto',
  'Águas Claras',
  'Recanto das Emas',
  'Gama',
  'Santa Maria',
  'Sobradinho',
  'São Sebastião',
  'Planaltina',
  'Vicente Pires',
  'Guará',
  'Paranoá',
  'Riacho Fundo',
  'Brazlândia',
  'Lago Sul',
  'Lago Norte',
  'Sudoeste/Octogonal',
  'Cruzeiro',
];

// Componente de grupo de filtro
function FiltroGrupo({
  titulo,
  opcoes,
  selecionados,
  onChange,
}: {
  titulo: string;
  opcoes: { valor: string; rotulo: string }[];
  selecionados: string[];
  onChange: (valores: string[]) => void;
}) {
  const [expandido, setExpandido] = useState(selecionados.length > 0);

  const toggleOpcao = (valor: string) => {
    if (selecionados.includes(valor)) {
      onChange(selecionados.filter((v) => v !== valor));
    } else {
      onChange([...selecionados, valor]);
    }
  };

  return (
    <div className="border-b border-border pb-4">
      <button
        onClick={() => setExpandido(!expandido)}
        className="flex items-center justify-between w-full text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        <span>
          {titulo}
          {selecionados.length > 0 && (
            <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              {selecionados.length}
            </span>
          )}
        </span>
        {expandido ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {expandido && (
        <div className="mt-3 space-y-2">
          {opcoes.map((opcao) => (
            <label
              key={opcao.valor}
              className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <input
                type="checkbox"
                checked={selecionados.includes(opcao.valor)}
                onChange={() => toggleOpcao(opcao.valor)}
                className="rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-0"
              />
              <span>{opcao.rotulo}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export function AgentesFilters({
  filtros,
  onFiltrosChange,
  onLimpar,
  totalEleitores,
  totalFiltrados,
}: AgentesFiltersProps) {
  // Estado local para input de busca (atualiza imediatamente na UI)
  const [buscaLocal, setBuscaLocal] = useState(filtros.busca || '');

  // Debounce de 300ms para evitar filtrar a cada keystroke
  const buscaDebounced = useDebounce(buscaLocal, 300);

  // Aplica o filtro de busca apenas quando o valor debounced muda
  useEffect(() => {
    if (buscaDebounced !== filtros.busca) {
      onFiltrosChange({ busca: buscaDebounced });
    }
  }, [buscaDebounced, filtros.busca, onFiltrosChange]);

  // Sincroniza estado local quando filtros externos mudam (ex: limpar)
  useEffect(() => {
    if (filtros.busca !== buscaLocal && filtros.busca === '') {
      setBuscaLocal('');
    }
  }, [filtros.busca]);

  const temFiltros =
    (filtros.busca?.length || 0) > 0 ||
    (filtros.generos?.length || 0) > 0 ||
    (filtros.clusters?.length || 0) > 0 ||
    (filtros.orientacoes_politicas?.length || 0) > 0 ||
    (filtros.posicoes_bolsonaro?.length || 0) > 0 ||
    (filtros.religioes?.length || 0) > 0 ||
    (filtros.faixas_etarias?.length || 0) > 0 ||
    (filtros.regioes?.length || 0) > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Filtros</h2>
        </div>
        {temFiltros && (
          <button
            onClick={onLimpar}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Limpar
          </button>
        )}
      </div>

      {/* Contador */}
      <div className="text-sm text-muted-foreground">
        Mostrando <span className="text-foreground font-medium">{totalFiltrados}</span> de{' '}
        <span className="text-foreground font-medium">{totalEleitores}</span> eleitores
      </div>

      {/* Busca com debounce */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome, profissão..."
          value={buscaLocal}
          onChange={(e) => setBuscaLocal(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
        {buscaLocal && (
          <button
            onClick={() => {
              setBuscaLocal('');
              onFiltrosChange({ busca: '' });
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Grupos de Filtro */}
      <div className="space-y-4">
        <FiltroGrupo
          titulo="Gênero"
          opcoes={GENEROS}
          selecionados={filtros.generos || []}
          onChange={(valores) => onFiltrosChange({ generos: valores as Genero[] })}
        />

        <FiltroGrupo
          titulo="Classe Social"
          opcoes={CLUSTERS}
          selecionados={filtros.clusters || []}
          onChange={(valores) => onFiltrosChange({ clusters: valores as ClusterSocioeconomico[] })}
        />

        <FiltroGrupo
          titulo="Orientação Política"
          opcoes={ORIENTACOES}
          selecionados={filtros.orientacoes_politicas || []}
          onChange={(valores) => onFiltrosChange({ orientacoes_politicas: valores as OrientacaoPolitica[] })}
        />

        <FiltroGrupo
          titulo="Posição sobre Bolsonaro"
          opcoes={POSICOES_BOLSONARO}
          selecionados={filtros.posicoes_bolsonaro || []}
          onChange={(valores) => onFiltrosChange({ posicoes_bolsonaro: valores as PosicaoBolsonaro[] })}
        />

        <FiltroGrupo
          titulo="Religião"
          opcoes={RELIGIOES}
          selecionados={filtros.religioes || []}
          onChange={(valores) => onFiltrosChange({ religioes: valores })}
        />

        <FiltroGrupo
          titulo="Faixa Etária"
          opcoes={FAIXAS_ETARIAS}
          selecionados={filtros.faixas_etarias || []}
          onChange={(valores) => onFiltrosChange({ faixas_etarias: valores })}
        />

        <FiltroGrupo
          titulo="Região Administrativa"
          opcoes={REGIOES.map((r) => ({ valor: r, rotulo: r }))}
          selecionados={filtros.regioes || []}
          onChange={(valores) => onFiltrosChange({ regioes: valores })}
        />
      </div>
    </div>
  );
}
