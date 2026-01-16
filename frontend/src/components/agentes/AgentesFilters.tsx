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

// ============================================
// OPÇÕES DE FILTRO - TODAS AS CATEGORIAS
// ============================================

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

// ============================================
// NOVOS FILTROS ADICIONADOS
// ============================================

const CORES_RACAS = [
  { valor: 'branca', rotulo: 'Branca' },
  { valor: 'parda', rotulo: 'Parda' },
  { valor: 'preta', rotulo: 'Preta' },
  { valor: 'amarela', rotulo: 'Amarela' },
  { valor: 'indigena', rotulo: 'Indígena' },
];

const ESCOLARIDADES = [
  { valor: 'fundamental_incompleto', rotulo: 'Fundamental Incompleto' },
  { valor: 'fundamental_completo', rotulo: 'Fundamental Completo' },
  { valor: 'medio_incompleto', rotulo: 'Médio Incompleto' },
  { valor: 'medio_completo_ou_sup_incompleto', rotulo: 'Médio Completo / Superior Incompleto' },
  { valor: 'superior_completo_ou_pos', rotulo: 'Superior Completo / Pós-Graduação' },
];

const OCUPACOES_VINCULOS = [
  { valor: 'clt', rotulo: 'CLT (Carteira Assinada)' },
  { valor: 'servidor_publico', rotulo: 'Servidor Público' },
  { valor: 'autonomo', rotulo: 'Autônomo' },
  { valor: 'empresario', rotulo: 'Empresário' },
  { valor: 'informal', rotulo: 'Informal' },
  { valor: 'desempregado', rotulo: 'Desempregado' },
  { valor: 'aposentado', rotulo: 'Aposentado' },
  { valor: 'estudante', rotulo: 'Estudante' },
];

const FAIXAS_RENDA = [
  { valor: 'ate_1', rotulo: 'Até 1 salário mínimo' },
  { valor: 'mais_de_1_ate_2', rotulo: '1 a 2 salários' },
  { valor: 'mais_de_2_ate_5', rotulo: '2 a 5 salários' },
  { valor: 'mais_de_5_ate_10', rotulo: '5 a 10 salários' },
  { valor: 'mais_de_10', rotulo: 'Mais de 10 salários' },
];

const ESTADOS_CIVIS = [
  { valor: 'solteiro(a)', rotulo: 'Solteiro(a)' },
  { valor: 'casado(a)', rotulo: 'Casado(a)' },
  { valor: 'uniao_estavel', rotulo: 'União Estável' },
  { valor: 'divorciado(a)', rotulo: 'Divorciado(a)' },
  { valor: 'viuvo(a)', rotulo: 'Viúvo(a)' },
];

const TEM_FILHOS = [
  { valor: 'sim', rotulo: 'Tem filhos' },
  { valor: 'nao', rotulo: 'Não tem filhos' },
];

const INTERESSES_POLITICOS = [
  { valor: 'baixo', rotulo: 'Baixo' },
  { valor: 'medio', rotulo: 'Médio' },
  { valor: 'alto', rotulo: 'Alto' },
];

const ESTILOS_DECISAO = [
  { valor: 'identitario', rotulo: 'Identitário' },
  { valor: 'pragmatico', rotulo: 'Pragmático' },
  { valor: 'moral', rotulo: 'Moral' },
  { valor: 'economico', rotulo: 'Econômico' },
  { valor: 'emocional', rotulo: 'Emocional' },
];

const TOLERANCIAS_NUANCE = [
  { valor: 'baixa', rotulo: 'Baixa' },
  { valor: 'media', rotulo: 'Média' },
  { valor: 'alta', rotulo: 'Alta' },
];

const VIESES_COGNITIVOS = [
  { valor: 'confirmacao', rotulo: 'Viés de Confirmação' },
  { valor: 'disponibilidade', rotulo: 'Viés de Disponibilidade' },
  { valor: 'aversao_perda', rotulo: 'Aversão à Perda' },
  { valor: 'tribalismo', rotulo: 'Tribalismo' },
];

const FONTES_INFORMACAO = [
  { valor: 'Jornal Nacional', rotulo: 'Jornal Nacional' },
  { valor: 'SBT Brasil', rotulo: 'SBT Brasil' },
  { valor: 'Instagram', rotulo: 'Instagram' },
  { valor: 'WhatsApp (grupos de família/igreja)', rotulo: 'WhatsApp (família/igreja)' },
  { valor: 'WhatsApp (grupos de trabalho)', rotulo: 'WhatsApp (trabalho)' },
  { valor: 'TikTok', rotulo: 'TikTok' },
  { valor: 'YouTube', rotulo: 'YouTube' },
  { valor: 'Twitter/X', rotulo: 'Twitter/X' },
  { valor: 'Folha', rotulo: 'Folha' },
  { valor: 'G1', rotulo: 'G1' },
  { valor: 'UOL', rotulo: 'UOL' },
  { valor: 'Rádio', rotulo: 'Rádio' },
];

const SUSCEPTIBILIDADE_DESINFORMACAO = [
  { valor: '1-3', rotulo: 'Baixa (1-3)' },
  { valor: '4-6', rotulo: 'Média (4-6)' },
  { valor: '7-10', rotulo: 'Alta (7-10)' },
];

const VOTO_FACULTATIVO = [
  { valor: 'sim', rotulo: 'Voto facultativo (16-17 ou 70+)' },
  { valor: 'nao', rotulo: 'Voto obrigatório' },
];

const CONFLITO_IDENTITARIO = [
  { valor: 'sim', rotulo: 'Com conflito identitário' },
  { valor: 'nao', rotulo: 'Sem conflito identitário' },
];

const MEIOS_TRANSPORTE = [
  { valor: 'onibus', rotulo: 'Ônibus' },
  { valor: 'metro', rotulo: 'Metrô' },
  { valor: 'carro_proprio', rotulo: 'Carro Próprio' },
  { valor: 'moto', rotulo: 'Moto' },
  { valor: 'bicicleta', rotulo: 'Bicicleta' },
  { valor: 'aplicativo', rotulo: 'Aplicativo (Uber/99)' },
  { valor: 'a_pe', rotulo: 'A pé' },
  { valor: 'nao_se_aplica', rotulo: 'Não se aplica' },
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

  // Calcular total de filtros ativos
  const contarFiltrosAtivos = () => {
    let total = 0;
    if (filtros.busca?.length) total++;
    if (filtros.generos?.length) total += filtros.generos.length;
    if (filtros.clusters?.length) total += filtros.clusters.length;
    if (filtros.orientacoes_politicas?.length) total += filtros.orientacoes_politicas.length;
    if (filtros.posicoes_bolsonaro?.length) total += filtros.posicoes_bolsonaro.length;
    if (filtros.religioes?.length) total += filtros.religioes.length;
    if (filtros.faixas_etarias?.length) total += filtros.faixas_etarias.length;
    if (filtros.regioes?.length) total += filtros.regioes.length;
    if ((filtros as any).cores_racas?.length) total += (filtros as any).cores_racas.length;
    if (filtros.escolaridades?.length) total += filtros.escolaridades.length;
    if (filtros.ocupacoes_vinculos?.length) total += filtros.ocupacoes_vinculos.length;
    if ((filtros as any).faixas_renda?.length) total += (filtros as any).faixas_renda.length;
    if ((filtros as any).estados_civis?.length) total += (filtros as any).estados_civis.length;
    if ((filtros as any).tem_filhos?.length) total += (filtros as any).tem_filhos.length;
    if ((filtros as any).interesses_politicos?.length) total += (filtros as any).interesses_politicos.length;
    if ((filtros as any).estilos_decisao?.length) total += (filtros as any).estilos_decisao.length;
    if ((filtros as any).tolerancias_nuance?.length) total += (filtros as any).tolerancias_nuance.length;
    if ((filtros as any).vieses_cognitivos?.length) total += (filtros as any).vieses_cognitivos.length;
    if ((filtros as any).fontes_informacao?.length) total += (filtros as any).fontes_informacao.length;
    if ((filtros as any).susceptibilidade_desinformacao?.length) total += (filtros as any).susceptibilidade_desinformacao.length;
    if ((filtros as any).voto_facultativo?.length) total += (filtros as any).voto_facultativo.length;
    if ((filtros as any).conflito_identitario?.length) total += (filtros as any).conflito_identitario.length;
    if ((filtros as any).meios_transporte?.length) total += (filtros as any).meios_transporte.length;
    return total;
  };

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

      {/* Contador */}
      <div className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
        Mostrando <span className="text-foreground font-bold text-lg">{totalFiltrados}</span> de{' '}
        <span className="text-foreground font-medium">{totalEleitores}</span> eleitores
        {totalFiltrosAtivos > 0 && (
          <span className="block text-xs mt-1 text-primary">
            {totalFiltrosAtivos} filtro(s) ativo(s)
          </span>
        )}
      </div>

      {/* Busca com debounce */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome, profissão, história..."
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

      {/* ============================================ */}
      {/* SEÇÃO: DADOS DEMOGRÁFICOS */}
      {/* ============================================ */}
      <SecaoFiltros titulo="📊 Dados Demográficos" corBorda="border-blue-500/30">
        <FiltroGrupo
          titulo="Gênero"
          opcoes={GENEROS}
          selecionados={filtros.generos || []}
          onChange={(valores) => onFiltrosChange({ generos: valores as Genero[] })}
          cor="bg-pink-500"
        />

        <FiltroGrupo
          titulo="Faixa Etária"
          opcoes={FAIXAS_ETARIAS}
          selecionados={filtros.faixas_etarias || []}
          onChange={(valores) => onFiltrosChange({ faixas_etarias: valores })}
          cor="bg-amber-500"
        />

        <FiltroGrupo
          titulo="Cor/Raça"
          opcoes={CORES_RACAS}
          selecionados={(filtros as any).cores_racas || []}
          onChange={(valores) => onFiltrosChange({ cores_racas: valores } as any)}
          cor="bg-orange-500"
        />

        <FiltroGrupo
          titulo="Região Administrativa"
          opcoes={REGIOES.map((r) => ({ valor: r, rotulo: r }))}
          selecionados={filtros.regioes || []}
          onChange={(valores) => onFiltrosChange({ regioes: valores })}
          cor="bg-cyan-500"
        />
      </SecaoFiltros>

      {/* ============================================ */}
      {/* SEÇÃO: SITUAÇÃO SOCIOECONÔMICA */}
      {/* ============================================ */}
      <SecaoFiltros titulo="💼 Situação Socioeconômica" corBorda="border-green-500/30">
        <FiltroGrupo
          titulo="Classe Social"
          opcoes={CLUSTERS}
          selecionados={filtros.clusters || []}
          onChange={(valores) => onFiltrosChange({ clusters: valores as ClusterSocioeconomico[] })}
          cor="bg-emerald-500"
        />

        <FiltroGrupo
          titulo="Escolaridade"
          opcoes={ESCOLARIDADES}
          selecionados={filtros.escolaridades || []}
          onChange={(valores) => onFiltrosChange({ escolaridades: valores })}
          cor="bg-blue-500"
        />

        <FiltroGrupo
          titulo="Ocupação/Vínculo"
          opcoes={OCUPACOES_VINCULOS}
          selecionados={filtros.ocupacoes_vinculos || []}
          onChange={(valores) => onFiltrosChange({ ocupacoes_vinculos: valores as any })}
          cor="bg-violet-500"
        />

        <FiltroGrupo
          titulo="Faixa de Renda"
          opcoes={FAIXAS_RENDA}
          selecionados={(filtros as any).faixas_renda || []}
          onChange={(valores) => onFiltrosChange({ faixas_renda: valores } as any)}
          cor="bg-yellow-500"
        />

        <FiltroGrupo
          titulo="Meio de Transporte"
          opcoes={MEIOS_TRANSPORTE}
          selecionados={(filtros as any).meios_transporte || []}
          onChange={(valores) => onFiltrosChange({ meios_transporte: valores } as any)}
          cor="bg-slate-500"
        />
      </SecaoFiltros>

      {/* ============================================ */}
      {/* SEÇÃO: VIDA PESSOAL */}
      {/* ============================================ */}
      <SecaoFiltros titulo="👨‍👩‍👧‍👦 Vida Pessoal" corBorda="border-pink-500/30">
        <FiltroGrupo
          titulo="Estado Civil"
          opcoes={ESTADOS_CIVIS}
          selecionados={(filtros as any).estados_civis || []}
          onChange={(valores) => onFiltrosChange({ estados_civis: valores } as any)}
          cor="bg-rose-500"
        />

        <FiltroGrupo
          titulo="Filhos"
          opcoes={TEM_FILHOS}
          selecionados={(filtros as any).tem_filhos || []}
          onChange={(valores) => onFiltrosChange({ tem_filhos: valores } as any)}
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

      {/* ============================================ */}
      {/* SEÇÃO: PERFIL POLÍTICO */}
      {/* ============================================ */}
      <SecaoFiltros titulo="🗳️ Perfil Político" corBorda="border-red-500/30">
        <FiltroGrupo
          titulo="Orientação Política"
          opcoes={ORIENTACOES}
          selecionados={filtros.orientacoes_politicas || []}
          onChange={(valores) => onFiltrosChange({ orientacoes_politicas: valores as OrientacaoPolitica[] })}
          cor="bg-red-500"
        />

        <FiltroGrupo
          titulo="Posição sobre Bolsonaro"
          opcoes={POSICOES_BOLSONARO}
          selecionados={filtros.posicoes_bolsonaro || []}
          onChange={(valores) => onFiltrosChange({ posicoes_bolsonaro: valores as PosicaoBolsonaro[] })}
          cor="bg-yellow-600"
        />

        <FiltroGrupo
          titulo="Interesse Político"
          opcoes={INTERESSES_POLITICOS}
          selecionados={(filtros as any).interesses_politicos || []}
          onChange={(valores) => onFiltrosChange({ interesses_politicos: valores } as any)}
          cor="bg-indigo-500"
        />

        <FiltroGrupo
          titulo="Voto Facultativo"
          opcoes={VOTO_FACULTATIVO}
          selecionados={(filtros as any).voto_facultativo || []}
          onChange={(valores) => onFiltrosChange({ voto_facultativo: valores } as any)}
          cor="bg-teal-500"
        />
      </SecaoFiltros>

      {/* ============================================ */}
      {/* SEÇÃO: PERFIL PSICOLÓGICO */}
      {/* ============================================ */}
      <SecaoFiltros titulo="🧠 Perfil Psicológico" corBorda="border-purple-500/30">
        <FiltroGrupo
          titulo="Estilo de Decisão"
          opcoes={ESTILOS_DECISAO}
          selecionados={(filtros as any).estilos_decisao || []}
          onChange={(valores) => onFiltrosChange({ estilos_decisao: valores } as any)}
          cor="bg-fuchsia-500"
        />

        <FiltroGrupo
          titulo="Tolerância à Nuance"
          opcoes={TOLERANCIAS_NUANCE}
          selecionados={(filtros as any).tolerancias_nuance || []}
          onChange={(valores) => onFiltrosChange({ tolerancias_nuance: valores } as any)}
          cor="bg-sky-500"
        />

        <FiltroGrupo
          titulo="Vieses Cognitivos"
          opcoes={VIESES_COGNITIVOS}
          selecionados={(filtros as any).vieses_cognitivos || []}
          onChange={(valores) => onFiltrosChange({ vieses_cognitivos: valores } as any)}
          cor="bg-amber-600"
        />

        <FiltroGrupo
          titulo="Conflito Identitário"
          opcoes={CONFLITO_IDENTITARIO}
          selecionados={(filtros as any).conflito_identitario || []}
          onChange={(valores) => onFiltrosChange({ conflito_identitario: valores } as any)}
          cor="bg-red-600"
        />
      </SecaoFiltros>

      {/* ============================================ */}
      {/* SEÇÃO: FONTES DE INFORMAÇÃO */}
      {/* ============================================ */}
      <SecaoFiltros titulo="📱 Informação e Mídia" corBorda="border-cyan-500/30">
        <FiltroGrupo
          titulo="Fontes de Informação"
          opcoes={FONTES_INFORMACAO}
          selecionados={(filtros as any).fontes_informacao || []}
          onChange={(valores) => onFiltrosChange({ fontes_informacao: valores } as any)}
          cor="bg-cyan-600"
        />

        <FiltroGrupo
          titulo="Susceptibilidade à Desinformação"
          opcoes={SUSCEPTIBILIDADE_DESINFORMACAO}
          selecionados={(filtros as any).susceptibilidade_desinformacao || []}
          onChange={(valores) => onFiltrosChange({ susceptibilidade_desinformacao: valores } as any)}
          cor="bg-orange-600"
        />
      </SecaoFiltros>
    </div>
  );
}
