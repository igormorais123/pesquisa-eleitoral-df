'use client';

/**
 * Componente de Correlações Automáticas
 * Calcula e exibe 20+ correlações entre atributos dos eleitores
 * Pesquisa Eleitoral DF 2026
 */

import { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Filter,
  BarChart2,
} from 'lucide-react';
import type { Eleitor } from '@/types';
import { cn } from '@/lib/utils';
import { correlacaoPearson } from '@/lib/analysis';

interface CorrelacaoItem {
  id: string;
  atributo1: string;
  atributo2: string;
  label1: string;
  label2: string;
  valor: number;
  significancia: 'forte' | 'moderada' | 'fraca' | 'nenhuma';
  direcao: 'positiva' | 'negativa' | 'neutra';
  interpretacao: string;
}

interface CorrelacoesAutomaticasProps {
  eleitores: Eleitor[];
  minCorrelacao?: number;
}

// Mapeamentos de atributos para valores numéricos
const MAPEAMENTOS = {
  orientacao_politica: {
    esquerda: 1,
    'centro-esquerda': 2,
    centro: 3,
    'centro-direita': 4,
    direita: 5,
  },
  posicao_bolsonaro: {
    critico_forte: 1,
    critico_moderado: 2,
    neutro: 3,
    apoiador_moderado: 4,
    apoiador_forte: 5,
  },
  interesse_politico: {
    baixo: 1,
    medio: 2,
    alto: 3,
  },
  cluster_socioeconomico: {
    G4_baixa: 1,
    G3_media_baixa: 2,
    G2_media_alta: 3,
    G1_alta: 4,
  },
  tolerancia_nuance: {
    baixa: 1,
    media: 2,
    alta: 3,
  },
  estilo_decisao: {
    emocional: 1,
    identitario: 2,
    moral: 3,
    pragmatico: 4,
    economico: 5,
  },
  escolaridade: {
    fundamental_ou_sem_instrucao: 1,
    medio_completo_ou_sup_incompleto: 2,
    superior_completo_ou_pos: 3,
  },
};

// Labels amigáveis para atributos
const LABELS = {
  idade: 'Idade',
  orientacao_politica: 'Orientação Política',
  posicao_bolsonaro: 'Posição Bolsonaro',
  interesse_politico: 'Interesse Político',
  cluster_socioeconomico: 'Classe Social',
  tolerancia_nuance: 'Tolerância a Nuances',
  susceptibilidade_desinformacao: 'Susc. Desinformação',
  filhos: 'Número de Filhos',
  estilo_decisao: 'Estilo de Decisão',
  escolaridade: 'Escolaridade',
};

// Pares de correlação a calcular
const PARES_CORRELACAO = [
  ['idade', 'orientacao_politica'],
  ['idade', 'posicao_bolsonaro'],
  ['idade', 'interesse_politico'],
  ['idade', 'cluster_socioeconomico'],
  ['idade', 'susceptibilidade_desinformacao'],
  ['idade', 'tolerancia_nuance'],
  ['orientacao_politica', 'posicao_bolsonaro'],
  ['orientacao_politica', 'interesse_politico'],
  ['orientacao_politica', 'cluster_socioeconomico'],
  ['orientacao_politica', 'escolaridade'],
  ['orientacao_politica', 'tolerancia_nuance'],
  ['posicao_bolsonaro', 'cluster_socioeconomico'],
  ['posicao_bolsonaro', 'interesse_politico'],
  ['posicao_bolsonaro', 'escolaridade'],
  ['posicao_bolsonaro', 'susceptibilidade_desinformacao'],
  ['interesse_politico', 'tolerancia_nuance'],
  ['interesse_politico', 'susceptibilidade_desinformacao'],
  ['interesse_politico', 'escolaridade'],
  ['cluster_socioeconomico', 'escolaridade'],
  ['cluster_socioeconomico', 'tolerancia_nuance'],
  ['cluster_socioeconomico', 'susceptibilidade_desinformacao'],
  ['escolaridade', 'tolerancia_nuance'],
  ['escolaridade', 'susceptibilidade_desinformacao'],
  ['filhos', 'idade'],
  ['filhos', 'orientacao_politica'],
  ['estilo_decisao', 'orientacao_politica'],
  ['estilo_decisao', 'interesse_politico'],
  ['estilo_decisao', 'tolerancia_nuance'],
];

// Extrair valor numérico de um eleitor para um atributo
function extrairValor(eleitor: Eleitor, atributo: string): number {
  const valor = eleitor[atributo as keyof Eleitor];

  if (typeof valor === 'number') {
    return valor;
  }

  if (typeof valor === 'string') {
    const mapeamento = MAPEAMENTOS[atributo as keyof typeof MAPEAMENTOS];
    if (mapeamento) {
      return (mapeamento as Record<string, number>)[valor] ?? 0;
    }
  }

  return 0;
}

// Classificar correlação
function classificarCorrelacao(valor: number): {
  significancia: 'forte' | 'moderada' | 'fraca' | 'nenhuma';
  direcao: 'positiva' | 'negativa' | 'neutra';
} {
  const abs = Math.abs(valor);
  let significancia: 'forte' | 'moderada' | 'fraca' | 'nenhuma';

  if (abs >= 0.7) significancia = 'forte';
  else if (abs >= 0.4) significancia = 'moderada';
  else if (abs >= 0.2) significancia = 'fraca';
  else significancia = 'nenhuma';

  let direcao: 'positiva' | 'negativa' | 'neutra';
  if (valor >= 0.1) direcao = 'positiva';
  else if (valor <= -0.1) direcao = 'negativa';
  else direcao = 'neutra';

  return { significancia, direcao };
}

// Gerar interpretação da correlação
function gerarInterpretacao(
  label1: string,
  label2: string,
  valor: number,
  significancia: string,
  direcao: string
): string {
  if (significancia === 'nenhuma') {
    return `Não há correlação significativa entre ${label1} e ${label2}.`;
  }

  const forca = significancia === 'forte' ? 'forte' : significancia === 'moderada' ? 'moderada' : 'fraca';
  const sentido = direcao === 'positiva' ? 'direta' : 'inversa';

  if (direcao === 'positiva') {
    return `${label1} e ${label2} têm correlação ${forca} ${sentido}: quando um aumenta, o outro tende a aumentar também.`;
  } else {
    return `${label1} e ${label2} têm correlação ${forca} ${sentido}: quando um aumenta, o outro tende a diminuir.`;
  }
}

export function CorrelacoesAutomaticas({
  eleitores,
  minCorrelacao = 0.1,
}: CorrelacoesAutomaticasProps) {
  const [filtroSignificancia, setFiltroSignificancia] = useState<string>('todas');
  const [filtroDirecao, setFiltroDirecao] = useState<string>('todas');
  const [expandido, setExpandido] = useState<Record<string, boolean>>({});

  // Calcular todas as correlações
  const correlacoes = useMemo((): CorrelacaoItem[] => {
    const resultado: CorrelacaoItem[] = [];

    PARES_CORRELACAO.forEach(([attr1, attr2]) => {
      // Extrair vetores de valores
      const vetor1 = eleitores.map((e) => extrairValor(e, attr1));
      const vetor2 = eleitores.map((e) => extrairValor(e, attr2));

      // Calcular correlação
      const valor = correlacaoPearson(vetor1, vetor2);

      // Classificar
      const { significancia, direcao } = classificarCorrelacao(valor);

      // Labels
      const label1 = LABELS[attr1 as keyof typeof LABELS] || attr1;
      const label2 = LABELS[attr2 as keyof typeof LABELS] || attr2;

      resultado.push({
        id: `${attr1}-${attr2}`,
        atributo1: attr1,
        atributo2: attr2,
        label1,
        label2,
        valor,
        significancia,
        direcao,
        interpretacao: gerarInterpretacao(label1, label2, valor, significancia, direcao),
      });
    });

    // Ordenar por valor absoluto (mais fortes primeiro)
    return resultado.sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor));
  }, [eleitores]);

  // Filtrar correlações
  const correlacoesFiltradas = useMemo(() => {
    return correlacoes.filter((c) => {
      // Filtro de valor mínimo
      if (Math.abs(c.valor) < minCorrelacao) return false;

      // Filtro de significância
      if (filtroSignificancia !== 'todas' && c.significancia !== filtroSignificancia) {
        return false;
      }

      // Filtro de direção
      if (filtroDirecao !== 'todas' && c.direcao !== filtroDirecao) {
        return false;
      }

      return true;
    });
  }, [correlacoes, minCorrelacao, filtroSignificancia, filtroDirecao]);

  // Estatísticas resumidas
  const stats = useMemo(() => {
    const fortes = correlacoes.filter((c) => c.significancia === 'forte').length;
    const moderadas = correlacoes.filter((c) => c.significancia === 'moderada').length;
    const fracas = correlacoes.filter((c) => c.significancia === 'fraca').length;
    const positivas = correlacoes.filter((c) => c.direcao === 'positiva').length;
    const negativas = correlacoes.filter((c) => c.direcao === 'negativa').length;

    return { fortes, moderadas, fracas, positivas, negativas, total: correlacoes.length };
  }, [correlacoes]);

  const toggleExpandido = (id: string) => {
    setExpandido((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="glass-card rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{stats.fortes}</p>
          <p className="text-xs text-muted-foreground">Fortes</p>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">{stats.moderadas}</p>
          <p className="text-xs text-muted-foreground">Moderadas</p>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.positivas}</p>
          <p className="text-xs text-muted-foreground">Positivas</p>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{stats.negativas}</p>
          <p className="text-xs text-muted-foreground">Negativas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtrar:</span>
        </div>

        <select
          value={filtroSignificancia}
          onChange={(e) => setFiltroSignificancia(e.target.value)}
          className="px-3 py-1.5 bg-secondary text-foreground rounded-lg text-sm border border-border"
        >
          <option value="todas">Todas significâncias</option>
          <option value="forte">Forte</option>
          <option value="moderada">Moderada</option>
          <option value="fraca">Fraca</option>
        </select>

        <select
          value={filtroDirecao}
          onChange={(e) => setFiltroDirecao(e.target.value)}
          className="px-3 py-1.5 bg-secondary text-foreground rounded-lg text-sm border border-border"
        >
          <option value="todas">Todas direções</option>
          <option value="positiva">Positiva</option>
          <option value="negativa">Negativa</option>
        </select>

        <span className="text-xs text-muted-foreground ml-auto">
          Exibindo {correlacoesFiltradas.length} de {correlacoes.length}
        </span>
      </div>

      {/* Lista de correlações */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {correlacoesFiltradas.map((corr) => (
          <div
            key={corr.id}
            className={cn(
              'glass-card rounded-lg overflow-hidden transition-all',
              corr.significancia === 'forte' && 'border-l-4 border-green-500',
              corr.significancia === 'moderada' && 'border-l-4 border-yellow-500',
              corr.significancia === 'fraca' && 'border-l-4 border-gray-500'
            )}
          >
            {/* Header */}
            <button
              onClick={() => toggleExpandido(corr.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Ícone de direção */}
                {corr.direcao === 'positiva' ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : corr.direcao === 'negativa' ? (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                ) : (
                  <Minus className="w-5 h-5 text-gray-400" />
                )}

                {/* Atributos */}
                <div className="text-left">
                  <p className="font-medium text-foreground">
                    {corr.label1} × {corr.label2}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    Correlação {corr.significancia}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Valor */}
                <div
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-bold',
                    corr.valor >= 0.4 && 'bg-green-500/20 text-green-400',
                    corr.valor <= -0.4 && 'bg-red-500/20 text-red-400',
                    corr.valor > -0.4 && corr.valor < 0.4 && 'bg-gray-500/20 text-gray-400'
                  )}
                >
                  {corr.valor >= 0 ? '+' : ''}{corr.valor.toFixed(3)}
                </div>

                {expandido[corr.id] ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Conteúdo expandido */}
            {expandido[corr.id] && (
              <div className="p-4 pt-0 border-t border-border">
                {/* Barra visual */}
                <div className="mb-3">
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all',
                        corr.valor >= 0 ? 'bg-green-500' : 'bg-red-500'
                      )}
                      style={{
                        width: `${Math.abs(corr.valor) * 100}%`,
                        marginLeft: corr.valor < 0 ? `${100 - Math.abs(corr.valor) * 100}%` : '0',
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>-1.0</span>
                    <span>0</span>
                    <span>+1.0</span>
                  </div>
                </div>

                {/* Interpretação */}
                <p className="text-sm text-muted-foreground">{corr.interpretacao}</p>

                {/* Metadados */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2 py-0.5 bg-secondary rounded text-xs text-muted-foreground">
                    Pearson r = {corr.valor.toFixed(4)}
                  </span>
                  <span className="px-2 py-0.5 bg-secondary rounded text-xs text-muted-foreground">
                    n = {eleitores.length}
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-xs',
                      corr.significancia === 'forte' && 'bg-green-500/20 text-green-400',
                      corr.significancia === 'moderada' && 'bg-yellow-500/20 text-yellow-400',
                      corr.significancia === 'fraca' && 'bg-gray-500/20 text-gray-400'
                    )}
                  >
                    {corr.significancia}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}

        {correlacoesFiltradas.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma correlação encontrada com os filtros selecionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CorrelacoesAutomaticas;
