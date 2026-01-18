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
  Briefcase,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FiltrosGestor, SetorGestor, NivelHierarquico } from '@/types';

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

interface GestoresFiltersProps {
  filtros: FiltrosGestor;
  onFiltrosChange: (filtros: Partial<FiltrosGestor>) => void;
  onLimpar: () => void;
  setorAtivo: SetorGestor | 'todos';
  onSetorChange: (setor: SetorGestor | 'todos') => void;
  nivelAtivo: NivelHierarquico | 'todos';
  onNivelChange: (nivel: NivelHierarquico | 'todos') => void;
  totalGestores: number;
  totalFiltrados: number;
  contagemPorSetor: Record<SetorGestor | 'todos', number>;
  contagemPorNivel: Record<NivelHierarquico | 'todos', number>;
}

// Opções de Filtro

const SETORES = [
  { valor: 'publico', rotulo: 'Setor Público' },
  { valor: 'privado', rotulo: 'Setor Privado' },
];

const NIVEIS_HIERARQUICOS = [
  { valor: 'estrategico', rotulo: 'Estratégico' },
  { valor: 'tatico', rotulo: 'Tático' },
  { valor: 'operacional', rotulo: 'Operacional' },
];

const GENEROS = [
  { valor: 'masculino', rotulo: 'Masculino' },
  { valor: 'feminino', rotulo: 'Feminino' },
];

const TIPOS_ORGAO_PUBLICO = [
  { valor: 'federal', rotulo: 'Federal' },
  { valor: 'estadual', rotulo: 'Estadual' },
  { valor: 'municipal', rotulo: 'Municipal' },
  { valor: 'distrital', rotulo: 'Distrital' },
  { valor: 'autarquia', rotulo: 'Autarquia' },
  { valor: 'empresa_publica', rotulo: 'Empresa Pública' },
  { valor: 'sociedade_economia_mista', rotulo: 'Sociedade de Economia Mista' },
  { valor: 'fundacao', rotulo: 'Fundação' },
];

const SETORES_PRIVADOS = [
  { valor: 'tecnologia', rotulo: 'Tecnologia' },
  { valor: 'financeiro', rotulo: 'Financeiro' },
  { valor: 'industria', rotulo: 'Indústria' },
  { valor: 'comercio', rotulo: 'Comércio' },
  { valor: 'servicos', rotulo: 'Serviços' },
  { valor: 'agronegocio', rotulo: 'Agronegócio' },
  { valor: 'saude', rotulo: 'Saúde' },
  { valor: 'educacao', rotulo: 'Educação' },
  { valor: 'construcao', rotulo: 'Construção' },
  { valor: 'logistica', rotulo: 'Logística' },
  { valor: 'energia', rotulo: 'Energia' },
  { valor: 'consultoria', rotulo: 'Consultoria' },
];

const PORTES_EMPRESA = [
  { valor: 'micro', rotulo: 'Microempresa' },
  { valor: 'pequena', rotulo: 'Pequena Empresa' },
  { valor: 'media', rotulo: 'Média Empresa' },
  { valor: 'grande', rotulo: 'Grande Empresa' },
  { valor: 'multinacional', rotulo: 'Multinacional' },
];

const AREAS_ATUACAO = [
  { valor: 'administracao_geral', rotulo: 'Administração Geral' },
  { valor: 'financas', rotulo: 'Finanças' },
  { valor: 'recursos_humanos', rotulo: 'Recursos Humanos' },
  { valor: 'operacoes', rotulo: 'Operações' },
  { valor: 'marketing', rotulo: 'Marketing' },
  { valor: 'tecnologia_informacao', rotulo: 'TI' },
  { valor: 'juridico', rotulo: 'Jurídico' },
  { valor: 'comercial', rotulo: 'Comercial' },
  { valor: 'producao', rotulo: 'Produção' },
  { valor: 'logistica', rotulo: 'Logística' },
  { valor: 'qualidade', rotulo: 'Qualidade' },
  { valor: 'planejamento', rotulo: 'Planejamento' },
  { valor: 'controle', rotulo: 'Controle' },
  { valor: 'auditoria', rotulo: 'Auditoria' },
  { valor: 'projetos', rotulo: 'Projetos' },
  { valor: 'compliance', rotulo: 'Compliance' },
  { valor: 'saude_publica', rotulo: 'Saúde Pública' },
  { valor: 'educacao_publica', rotulo: 'Educação Pública' },
  { valor: 'seguranca_publica', rotulo: 'Segurança Pública' },
  { valor: 'meio_ambiente', rotulo: 'Meio Ambiente' },
  { valor: 'assistencia_social', rotulo: 'Assistência Social' },
  { valor: 'infraestrutura', rotulo: 'Infraestrutura' },
  { valor: 'cultura', rotulo: 'Cultura' },
  { valor: 'esporte', rotulo: 'Esporte' },
];

const ESTILOS_LIDERANCA = [
  { valor: 'autocratico', rotulo: 'Autocrático' },
  { valor: 'democratico', rotulo: 'Democrático' },
  { valor: 'liberal', rotulo: 'Liberal' },
  { valor: 'transformacional', rotulo: 'Transformacional' },
  { valor: 'transacional', rotulo: 'Transacional' },
  { valor: 'servidor', rotulo: 'Servidor' },
  { valor: 'situacional', rotulo: 'Situacional' },
  { valor: 'coaching', rotulo: 'Coaching' },
];

const FAIXAS_ETARIAS = [
  { valor: '25-34', rotulo: '25-34 anos' },
  { valor: '35-44', rotulo: '35-44 anos' },
  { valor: '45-54', rotulo: '45-54 anos' },
  { valor: '55-64', rotulo: '55-64 anos' },
  { valor: '65+', rotulo: '65+ anos' },
];

const LOCALIZACOES = [
  { valor: 'Brasília', rotulo: 'Brasília' },
  { valor: 'São Paulo', rotulo: 'São Paulo' },
  { valor: 'Rio de Janeiro', rotulo: 'Rio de Janeiro' },
  { valor: 'Belo Horizonte', rotulo: 'Belo Horizonte' },
  { valor: 'Curitiba', rotulo: 'Curitiba' },
  { valor: 'Porto Alegre', rotulo: 'Porto Alegre' },
  { valor: 'Salvador', rotulo: 'Salvador' },
  { valor: 'Recife', rotulo: 'Recife' },
  { valor: 'Fortaleza', rotulo: 'Fortaleza' },
  { valor: 'Goiânia', rotulo: 'Goiânia' },
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

// Componente de abas de setores
function SetoresTabs({
  setorAtivo,
  onSetorChange,
  contagem,
}: {
  setorAtivo: SetorGestor | 'todos';
  onSetorChange: (setor: SetorGestor | 'todos') => void;
  contagem: Record<SetorGestor | 'todos', number>;
}) {
  const setores = [
    { valor: 'todos' as const, rotulo: 'Todos', icone: Users, cor: 'text-primary' },
    { valor: 'publico' as const, rotulo: 'Público', icone: Building2, cor: 'text-blue-400' },
    { valor: 'privado' as const, rotulo: 'Privado', icone: Briefcase, cor: 'text-green-400' },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {setores.map(({ valor, rotulo, icone: Icone, cor }) => (
        <button
          key={valor}
          onClick={() => onSetorChange(valor)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
            setorAtivo === valor
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground'
          )}
        >
          <Icone className={cn('w-4 h-4', setorAtivo !== valor && cor)} />
          <span>{rotulo}</span>
          <span
            className={cn(
              'text-xs px-1.5 py-0.5 rounded-full',
              setorAtivo === valor ? 'bg-primary-foreground/20' : 'bg-background'
            )}
          >
            {contagem[valor]}
          </span>
        </button>
      ))}
    </div>
  );
}

// Componente de abas de níveis hierárquicos
function NiveisTabs({
  nivelAtivo,
  onNivelChange,
  contagem,
}: {
  nivelAtivo: NivelHierarquico | 'todos';
  onNivelChange: (nivel: NivelHierarquico | 'todos') => void;
  contagem: Record<NivelHierarquico | 'todos', number>;
}) {
  const niveis = [
    { valor: 'todos' as const, rotulo: 'Todos', cor: 'bg-gray-500' },
    { valor: 'estrategico' as const, rotulo: 'Estratégico', cor: 'bg-purple-500' },
    { valor: 'tatico' as const, rotulo: 'Tático', cor: 'bg-orange-500' },
    { valor: 'operacional' as const, rotulo: 'Operacional', cor: 'bg-cyan-500' },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {niveis.map(({ valor, rotulo, cor }) => (
        <button
          key={valor}
          onClick={() => onNivelChange(valor)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all',
            nivelAtivo === valor
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground'
          )}
        >
          <span className={cn('w-2 h-2 rounded-full', cor)} />
          <span>{rotulo}</span>
          <span
            className={cn(
              'text-xs px-1 py-0.5 rounded-full',
              nivelAtivo === valor ? 'bg-primary-foreground/20' : 'bg-background'
            )}
          >
            {contagem[valor]}
          </span>
        </button>
      ))}
    </div>
  );
}

export function GestoresFilters({
  filtros,
  onFiltrosChange,
  onLimpar,
  setorAtivo,
  onSetorChange,
  nivelAtivo,
  onNivelChange,
  totalGestores,
  totalFiltrados,
  contagemPorSetor,
  contagemPorNivel,
}: GestoresFiltersProps) {
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
    if (filtros.setores?.length) total += filtros.setores.length;
    if (filtros.niveis_hierarquicos?.length) total += filtros.niveis_hierarquicos.length;
    if (filtros.generos?.length) total += filtros.generos.length;
    if (filtros.areas_atuacao?.length) total += filtros.areas_atuacao.length;
    if (filtros.tipos_orgao?.length) total += filtros.tipos_orgao.length;
    if (filtros.setores_privados?.length) total += filtros.setores_privados.length;
    if (filtros.portes_empresa?.length) total += filtros.portes_empresa.length;
    if (filtros.faixas_etarias?.length) total += filtros.faixas_etarias.length;
    if (filtros.localizacoes?.length) total += filtros.localizacoes.length;
    if (filtros.estilos_lideranca?.length) total += filtros.estilos_lideranca.length;
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

      {/* Abas de Setor */}
      <SetoresTabs
        setorAtivo={setorAtivo}
        onSetorChange={onSetorChange}
        contagem={contagemPorSetor}
      />

      {/* Abas de Nível Hierárquico */}
      <NiveisTabs
        nivelAtivo={nivelAtivo}
        onNivelChange={onNivelChange}
        contagem={contagemPorNivel}
      />

      {/* Contador */}
      <div className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
        Mostrando <span className="text-foreground font-bold text-lg">{totalFiltrados}</span> de{' '}
        <span className="text-foreground font-medium">{totalGestores}</span> gestores
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
          placeholder="Buscar por nome, cargo, instituição..."
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
          titulo="Setor"
          opcoes={SETORES}
          selecionados={filtros.setores || []}
          onChange={(valores) => onFiltrosChange({ setores: valores as SetorGestor[] })}
          cor="bg-blue-500"
        />

        <FiltroGrupo
          titulo="Nível Hierárquico"
          opcoes={NIVEIS_HIERARQUICOS}
          selecionados={filtros.niveis_hierarquicos || []}
          onChange={(valores) => onFiltrosChange({ niveis_hierarquicos: valores as NivelHierarquico[] })}
          cor="bg-purple-500"
        />

        <FiltroGrupo
          titulo="Gênero"
          opcoes={GENEROS}
          selecionados={filtros.generos || []}
          onChange={(valores) => onFiltrosChange({ generos: valores as any })}
          cor="bg-pink-500"
        />

        <FiltroGrupo
          titulo="Faixa Etária"
          opcoes={FAIXAS_ETARIAS}
          selecionados={filtros.faixas_etarias || []}
          onChange={(valores) => onFiltrosChange({ faixas_etarias: valores })}
          cor="bg-amber-500"
        />
      </SecaoFiltros>

      {/* SEÇÃO: SETOR PÚBLICO */}
      {(setorAtivo === 'todos' || setorAtivo === 'publico') && (
        <SecaoFiltros titulo="🏛️ Setor Público" corBorda="border-blue-500/30">
          <FiltroGrupo
            titulo="Tipo de Órgão"
            opcoes={TIPOS_ORGAO_PUBLICO}
            selecionados={filtros.tipos_orgao || []}
            onChange={(valores) => onFiltrosChange({ tipos_orgao: valores as any })}
            cor="bg-blue-500"
          />
        </SecaoFiltros>
      )}

      {/* SEÇÃO: SETOR PRIVADO */}
      {(setorAtivo === 'todos' || setorAtivo === 'privado') && (
        <SecaoFiltros titulo="🏢 Setor Privado" corBorda="border-green-500/30">
          <FiltroGrupo
            titulo="Setor de Atuação"
            opcoes={SETORES_PRIVADOS}
            selecionados={filtros.setores_privados || []}
            onChange={(valores) => onFiltrosChange({ setores_privados: valores as any })}
            cor="bg-green-500"
          />

          <FiltroGrupo
            titulo="Porte da Empresa"
            opcoes={PORTES_EMPRESA}
            selecionados={filtros.portes_empresa || []}
            onChange={(valores) => onFiltrosChange({ portes_empresa: valores as any })}
            cor="bg-emerald-500"
          />
        </SecaoFiltros>
      )}

      {/* SEÇÃO: ATUAÇÃO PROFISSIONAL */}
      <SecaoFiltros titulo="📋 Atuação Profissional" corBorda="border-orange-500/30">
        <FiltroGrupo
          titulo="Área de Atuação"
          opcoes={AREAS_ATUACAO}
          selecionados={filtros.areas_atuacao || []}
          onChange={(valores) => onFiltrosChange({ areas_atuacao: valores as any })}
          cor="bg-orange-500"
        />

        <FiltroGrupo
          titulo="Estilo de Liderança"
          opcoes={ESTILOS_LIDERANCA}
          selecionados={filtros.estilos_lideranca || []}
          onChange={(valores) => onFiltrosChange({ estilos_lideranca: valores as any })}
          cor="bg-indigo-500"
        />
      </SecaoFiltros>

      {/* SEÇÃO: LOCALIZAÇÃO */}
      <SecaoFiltros titulo="📍 Localização" corBorda="border-teal-500/30">
        <FiltroGrupo
          titulo="Cidade"
          opcoes={LOCALIZACOES}
          selecionados={filtros.localizacoes || []}
          onChange={(valores) => onFiltrosChange({ localizacoes: valores })}
          cor="bg-teal-500"
        />
      </SecaoFiltros>
    </div>
  );
}
