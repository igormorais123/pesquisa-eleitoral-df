'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Search,
  Building2,
  Landmark,
  Users,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FiltrosParlamentar, CasaLegislativa } from '@/types';

// Hook de debounce
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

interface FiltrosParlamentarExtendido extends FiltrosParlamentar {
  estilos_comunicacao?: string[];
  formacoes?: string[];
  regioes?: string[];
}

interface ParlamentaresFiltersProps {
  filtros: FiltrosParlamentarExtendido;
  onFiltrosChange: (filtros: Partial<FiltrosParlamentarExtendido>) => void;
  onLimpar: () => void;
  casaAtiva: CasaLegislativa | 'todas';
  onCasaChange: (casa: CasaLegislativa | 'todas') => void;
  totalParlamentares: number;
  totalFiltrados: number;
  contagemPorCasa: Record<CasaLegislativa | 'todas', number>;
}

// Opções de Filtro

// Todos os estados brasileiros
const ESTADOS_UF = [
  { valor: 'AC', rotulo: 'Acre (AC)' },
  { valor: 'AL', rotulo: 'Alagoas (AL)' },
  { valor: 'AM', rotulo: 'Amazonas (AM)' },
  { valor: 'AP', rotulo: 'Amapá (AP)' },
  { valor: 'BA', rotulo: 'Bahia (BA)' },
  { valor: 'CE', rotulo: 'Ceará (CE)' },
  { valor: 'DF', rotulo: 'Distrito Federal (DF)' },
  { valor: 'ES', rotulo: 'Espírito Santo (ES)' },
  { valor: 'GO', rotulo: 'Goiás (GO)' },
  { valor: 'MA', rotulo: 'Maranhão (MA)' },
  { valor: 'MG', rotulo: 'Minas Gerais (MG)' },
  { valor: 'MS', rotulo: 'Mato Grosso do Sul (MS)' },
  { valor: 'MT', rotulo: 'Mato Grosso (MT)' },
  { valor: 'PA', rotulo: 'Pará (PA)' },
  { valor: 'PB', rotulo: 'Paraíba (PB)' },
  { valor: 'PE', rotulo: 'Pernambuco (PE)' },
  { valor: 'PI', rotulo: 'Piauí (PI)' },
  { valor: 'PR', rotulo: 'Paraná (PR)' },
  { valor: 'RJ', rotulo: 'Rio de Janeiro (RJ)' },
  { valor: 'RN', rotulo: 'Rio Grande do Norte (RN)' },
  { valor: 'RO', rotulo: 'Rondônia (RO)' },
  { valor: 'RR', rotulo: 'Roraima (RR)' },
  { valor: 'RS', rotulo: 'Rio Grande do Sul (RS)' },
  { valor: 'SC', rotulo: 'Santa Catarina (SC)' },
  { valor: 'SE', rotulo: 'Sergipe (SE)' },
  { valor: 'SP', rotulo: 'São Paulo (SP)' },
  { valor: 'TO', rotulo: 'Tocantins (TO)' },
];

const PARTIDOS = [
  { valor: 'PL', rotulo: 'PL' },
  { valor: 'PT', rotulo: 'PT' },
  { valor: 'REPUBLICANOS', rotulo: 'Republicanos' },
  { valor: 'MDB', rotulo: 'MDB' },
  { valor: 'PSD', rotulo: 'PSD' },
  { valor: 'PSB', rotulo: 'PSB' },
  { valor: 'PDT', rotulo: 'PDT' },
  { valor: 'PSOL', rotulo: 'PSOL' },
  { valor: 'PSDB', rotulo: 'PSDB' },
  { valor: 'UNIÃO', rotulo: 'União Brasil' },
  { valor: 'PP', rotulo: 'PP' },
  { valor: 'PV', rotulo: 'PV' },
  { valor: 'AVANTE', rotulo: 'Avante' },
  { valor: 'PRD', rotulo: 'PRD' },
  { valor: 'NOVO', rotulo: 'Novo' },
  { valor: 'PODE', rotulo: 'Podemos' },
  { valor: 'CIDADANIA', rotulo: 'Cidadania' },
  { valor: 'SOLIDARIEDADE', rotulo: 'Solidariedade' },
  { valor: 'PCdoB', rotulo: 'PCdoB' },
  { valor: 'REDE', rotulo: 'Rede' },
];

const GENEROS = [
  { valor: 'masculino', rotulo: 'Masculino' },
  { valor: 'feminino', rotulo: 'Feminino' },
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
  { valor: 'opositor_moderado', rotulo: 'Opositor Moderado' },
  { valor: 'opositor_forte', rotulo: 'Opositor Forte' },
];

const POSICOES_LULA = [
  { valor: 'apoiador_forte', rotulo: 'Apoiador Forte' },
  { valor: 'apoiador_moderado', rotulo: 'Apoiador Moderado' },
  { valor: 'neutro', rotulo: 'Neutro' },
  { valor: 'critico_moderado', rotulo: 'Crítico Moderado' },
  { valor: 'opositor_moderado', rotulo: 'Opositor Moderado' },
  { valor: 'opositor_forte', rotulo: 'Opositor Forte' },
];

const RELIGIOES = [
  { valor: 'catolica', rotulo: 'Católica' },
  { valor: 'evangelica', rotulo: 'Evangélica' },
  { valor: 'espirita', rotulo: 'Espírita' },
  { valor: 'sem_religiao', rotulo: 'Sem Religião' },
  { valor: 'umbanda_candomble', rotulo: 'Umbanda/Candomblé' },
  { valor: 'nao_declarada', rotulo: 'Não Declarada' },
];

const RELACOES_GOVERNO = [
  { valor: 'base_aliada', rotulo: 'Base Aliada' },
  { valor: 'situacao', rotulo: 'Situação' },
  { valor: 'aliado_situacional', rotulo: 'Aliado Situacional' },
  { valor: 'aliado_com_ressalvas', rotulo: 'Aliado com Ressalvas' },
  { valor: 'centrao', rotulo: 'Centrão' },
  { valor: 'independente', rotulo: 'Independente' },
  { valor: 'oposicao_moderada', rotulo: 'Oposição Moderada' },
  { valor: 'oposicao_forte', rotulo: 'Oposição Forte' },
];

const TEMAS_ATUACAO = [
  { valor: 'Segurança', rotulo: 'Segurança' },
  { valor: 'Educação', rotulo: 'Educação' },
  { valor: 'Saúde', rotulo: 'Saúde' },
  { valor: 'Economia', rotulo: 'Economia' },
  { valor: 'Meio ambiente', rotulo: 'Meio Ambiente' },
  { valor: 'Direitos humanos', rotulo: 'Direitos Humanos' },
  { valor: 'Trabalho', rotulo: 'Trabalho' },
  { valor: 'Agricultura', rotulo: 'Agricultura' },
  { valor: 'Cultura', rotulo: 'Cultura' },
  { valor: 'Esporte', rotulo: 'Esporte' },
  { valor: 'Transporte', rotulo: 'Transporte' },
  { valor: 'Habitação', rotulo: 'Habitação' },
];

const ESTILOS_COMUNICACAO = [
  { valor: 'combativo', rotulo: 'Combativo' },
  { valor: 'articulado', rotulo: 'Articulado' },
  { valor: 'popular', rotulo: 'Popular' },
  { valor: 'tecnico', rotulo: 'Técnico' },
  { valor: 'religioso', rotulo: 'Religioso' },
  { valor: 'emotivo', rotulo: 'Emotivo' },
  { valor: 'moderado', rotulo: 'Moderado' },
  { valor: 'agressivo', rotulo: 'Agressivo' },
  { valor: 'conciliador', rotulo: 'Conciliador' },
  { valor: 'didatico', rotulo: 'Didático' },
  { valor: 'assertivo', rotulo: 'Assertivo' },
];

// Bancadas Temáticas
const BANCADAS_TEMATICAS = [
  { valor: 'ruralista', rotulo: 'Bancada Ruralista (Agro)' },
  { valor: 'evangelica', rotulo: 'Bancada Evangélica' },
  { valor: 'bala', rotulo: 'Bancada da Bala (Segurança)' },
  { valor: 'sindical', rotulo: 'Bancada Sindical' },
  { valor: 'feminina', rotulo: 'Bancada Feminina' },
  { valor: 'ambientalista', rotulo: 'Bancada Ambientalista' },
  { valor: 'empresarial', rotulo: 'Bancada Empresarial' },
  { valor: 'saude', rotulo: 'Bancada da Saúde' },
  { valor: 'educacao', rotulo: 'Bancada da Educação' },
  { valor: 'lgbtqia', rotulo: 'Bancada LGBTQIA+' },
  { valor: 'indigena', rotulo: 'Bancada Indígena' },
  { valor: 'negra', rotulo: 'Bancada Negra' },
];

// Regiões do Brasil
const REGIOES = [
  { valor: 'Norte', rotulo: 'Norte' },
  { valor: 'Nordeste', rotulo: 'Nordeste' },
  { valor: 'Centro-Oeste', rotulo: 'Centro-Oeste' },
  { valor: 'Sudeste', rotulo: 'Sudeste' },
  { valor: 'Sul', rotulo: 'Sul' },
];

// Componente de grupo de filtro
function FiltroGrupo({
  titulo,
  opcoes,
  selecionados,
  onChange,
  cor,
}: {
  titulo: string;
  opcoes: { valor: string; rotulo: string }[];
  selecionados: string[];
  onChange: (valores: string[]) => void;
  cor?: string;
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
        <span className="flex items-center gap-2">
          {cor && <span className={`w-2 h-2 rounded-full ${cor}`} />}
          {titulo}
          {selecionados.length > 0 && (
            <span className="ml-1 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
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
        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-2">
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

// Seção de Filtros Agrupada
function SecaoFiltros({
  titulo,
  children,
  corBorda,
}: {
  titulo: string;
  children: React.ReactNode;
  corBorda?: string;
}) {
  const [expandida, setExpandida] = useState(true);

  return (
    <div className={`rounded-lg border ${corBorda || 'border-border'} p-3 mb-4`}>
      <button
        onClick={() => setExpandida(!expandida)}
        className="flex items-center justify-between w-full text-sm font-semibold text-foreground mb-2"
      >
        <span>{titulo}</span>
        {expandida ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {expandida && <div className="space-y-3">{children}</div>}
    </div>
  );
}

// Componente de abas de casas legislativas
function CasasTabs({
  casaAtiva,
  onCasaChange,
  contagem,
}: {
  casaAtiva: CasaLegislativa | 'todas';
  onCasaChange: (casa: CasaLegislativa | 'todas') => void;
  contagem: Record<CasaLegislativa | 'todas', number>;
}) {
  const casas = [
    { valor: 'todas' as const, rotulo: 'Todas', icone: Users, cor: 'text-primary' },
    { valor: 'camara_federal' as const, rotulo: 'Câmara', icone: Building2, cor: 'text-green-400' },
    { valor: 'senado' as const, rotulo: 'Senado', icone: Landmark, cor: 'text-blue-400' },
    { valor: 'cldf' as const, rotulo: 'CLDF', icone: Building2, cor: 'text-yellow-400' },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {casas.map(({ valor, rotulo, icone: Icone, cor }) => (
        <button
          key={valor}
          onClick={() => onCasaChange(valor)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
            casaAtiva === valor
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground'
          )}
        >
          <Icone className={cn('w-4 h-4', casaAtiva !== valor && cor)} />
          <span>{rotulo}</span>
          <span
            className={cn(
              'text-xs px-1.5 py-0.5 rounded-full',
              casaAtiva === valor ? 'bg-primary-foreground/20' : 'bg-background'
            )}
          >
            {contagem[valor]}
          </span>
        </button>
      ))}
    </div>
  );
}

export function ParlamentaresFilters({
  filtros,
  onFiltrosChange,
  onLimpar,
  casaAtiva,
  onCasaChange,
  totalParlamentares,
  totalFiltrados,
  contagemPorCasa,
}: ParlamentaresFiltersProps) {
  const [buscaLocal, setBuscaLocal] = useState(filtros.busca || '');
  const buscaDebounced = useDebounce(buscaLocal, 300);

  useEffect(() => {
    if (buscaDebounced !== filtros.busca) {
      onFiltrosChange({ busca: buscaDebounced });
    }
  }, [buscaDebounced, filtros.busca, onFiltrosChange]);

  useEffect(() => {
    if (filtros.busca !== buscaLocal && filtros.busca === '') {
      setBuscaLocal('');
    }
  }, [filtros.busca]);

  const contarFiltrosAtivos = useCallback(() => {
    let total = 0;
    if (filtros.busca?.length) total++;
    if (filtros.ufs?.length) total += filtros.ufs.length;
    if (filtros.regioes?.length) total += filtros.regioes.length;
    if (filtros.partidos?.length) total += filtros.partidos.length;
    if (filtros.generos?.length) total += filtros.generos.length;
    if (filtros.orientacoes_politicas?.length) total += filtros.orientacoes_politicas.length;
    if (filtros.posicoes_bolsonaro?.length) total += filtros.posicoes_bolsonaro.length;
    if (filtros.posicoes_lula?.length) total += filtros.posicoes_lula.length;
    if (filtros.religioes?.length) total += filtros.religioes.length;
    if (filtros.temas_atuacao?.length) total += filtros.temas_atuacao.length;
    if (filtros.relacoes_governo?.length) total += filtros.relacoes_governo.length;
    if (filtros.estilos_comunicacao?.length) total += filtros.estilos_comunicacao.length;
    if (filtros.bancadas_tematicas?.length) total += filtros.bancadas_tematicas.length;
    return total;
  }, [filtros]);

  const totalFiltrosAtivos = contarFiltrosAtivos();

  return (
    <div className="space-y-4 h-full overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-background pb-2 z-10">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Filtros</h2>
          {totalFiltrosAtivos > 0 && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
              {totalFiltrosAtivos}
            </span>
          )}
        </div>
        {totalFiltrosAtivos > 0 && (
          <button
            onClick={onLimpar}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Limpar tudo
          </button>
        )}
      </div>

      {/* Abas de Casas Legislativas */}
      <CasasTabs
        casaAtiva={casaAtiva}
        onCasaChange={onCasaChange}
        contagem={contagemPorCasa}
      />

      {/* Contador */}
      <div className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
        Mostrando <span className="text-foreground font-bold text-lg">{totalFiltrados}</span> de{' '}
        <span className="text-foreground font-medium">{totalParlamentares}</span> parlamentares
        {totalFiltrosAtivos > 0 && (
          <span className="block text-xs mt-1 text-primary">
            {totalFiltrosAtivos} filtro(s) ativo(s)
          </span>
        )}
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome, partido, tema..."
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

      {/* SEÇÃO: DADOS BÁSICOS */}
      <SecaoFiltros titulo="👤 Dados Básicos" corBorda="border-blue-500/30">
        <FiltroGrupo
          titulo="Estado (UF)"
          opcoes={ESTADOS_UF}
          selecionados={filtros.ufs || []}
          onChange={(valores) => onFiltrosChange({ ufs: valores })}
          cor="bg-emerald-500"
        />

        <FiltroGrupo
          titulo="Partido"
          opcoes={PARTIDOS}
          selecionados={filtros.partidos || []}
          onChange={(valores) => onFiltrosChange({ partidos: valores })}
          cor="bg-blue-500"
        />

        <FiltroGrupo
          titulo="Gênero"
          opcoes={GENEROS}
          selecionados={filtros.generos || []}
          onChange={(valores) => onFiltrosChange({ generos: valores as any })}
          cor="bg-pink-500"
        />

        <FiltroGrupo
          titulo="Religião"
          opcoes={RELIGIOES}
          selecionados={filtros.religioes || []}
          onChange={(valores) => onFiltrosChange({ religioes: valores })}
          cor="bg-purple-500"
        />
      </SecaoFiltros>

      {/* SEÇÃO: PERFIL POLÍTICO */}
      <SecaoFiltros titulo="🗳️ Perfil Político" corBorda="border-red-500/30">
        <FiltroGrupo
          titulo="Orientação Política"
          opcoes={ORIENTACOES}
          selecionados={filtros.orientacoes_politicas || []}
          onChange={(valores) => onFiltrosChange({ orientacoes_politicas: valores as any })}
          cor="bg-red-500"
        />

        <FiltroGrupo
          titulo="Posição sobre Bolsonaro"
          opcoes={POSICOES_BOLSONARO}
          selecionados={filtros.posicoes_bolsonaro || []}
          onChange={(valores) => onFiltrosChange({ posicoes_bolsonaro: valores as any })}
          cor="bg-yellow-600"
        />

        <FiltroGrupo
          titulo="Posição sobre Lula"
          opcoes={POSICOES_LULA}
          selecionados={filtros.posicoes_lula || []}
          onChange={(valores) => onFiltrosChange({ posicoes_lula: valores as any })}
          cor="bg-red-600"
        />

        <FiltroGrupo
          titulo="Relação com Governo"
          opcoes={RELACOES_GOVERNO}
          selecionados={filtros.relacoes_governo || []}
          onChange={(valores) => onFiltrosChange({ relacoes_governo: valores as any })}
          cor="bg-indigo-500"
        />
      </SecaoFiltros>

      {/* SEÇÃO: BANCADAS TEMÁTICAS */}
      <SecaoFiltros titulo="🏛️ Bancadas Temáticas" corBorda="border-orange-500/30">
        <FiltroGrupo
          titulo="Bancadas"
          opcoes={BANCADAS_TEMATICAS}
          selecionados={filtros.bancadas_tematicas || []}
          onChange={(valores) => onFiltrosChange({ bancadas_tematicas: valores as any })}
          cor="bg-orange-500"
        />

        <FiltroGrupo
          titulo="Região do Brasil"
          opcoes={REGIOES}
          selecionados={filtros.regioes || []}
          onChange={(valores) => onFiltrosChange({ regioes: valores })}
          cor="bg-teal-500"
        />
      </SecaoFiltros>

      {/* SEÇÃO: ATUAÇÃO */}
      <SecaoFiltros titulo="📋 Atuação Parlamentar" corBorda="border-green-500/30">
        <FiltroGrupo
          titulo="Temas de Atuação"
          opcoes={TEMAS_ATUACAO}
          selecionados={filtros.temas_atuacao || []}
          onChange={(valores) => onFiltrosChange({ temas_atuacao: valores })}
          cor="bg-green-500"
        />

        <FiltroGrupo
          titulo="Estilo de Comunicação"
          opcoes={ESTILOS_COMUNICACAO}
          selecionados={filtros.estilos_comunicacao || []}
          onChange={(valores) => onFiltrosChange({ estilos_comunicacao: valores })}
          cor="bg-cyan-500"
        />
      </SecaoFiltros>
    </div>
  );
}
