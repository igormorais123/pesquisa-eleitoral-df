'use client';

import { X, FilterX, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FILTER_LABELS, FilterType } from '@/hooks/useFilterNavigation';

interface FiltrosAtivosProps {
  filtros: Record<string, any>;
  onRemoverFiltro: (tipo: string, valor?: string) => void;
  onLimparTodos: () => void;
  totalFiltrados: number;
  totalGeral: number;
}

// Mapeamento de tipos de filtro para nomes legíveis
const NOMES_FILTROS: Record<string, string> = {
  generos: 'Gênero',
  clusters: 'Classe',
  regioes: 'Região',
  religioes: 'Religião',
  orientacoes_politicas: 'Orientação',
  posicoes_bolsonaro: 'Posição Bolsonaro',
  faixas_etarias: 'Idade',
  escolaridades: 'Escolaridade',
  ocupacoes_vinculos: 'Ocupação',
  cores_racas: 'Cor/Raça',
  faixas_renda: 'Renda',
  estados_civis: 'Estado Civil',
  tem_filhos: 'Filhos',
  interesses_politicos: 'Interesse',
  estilos_decisao: 'Decisão',
  tolerancias_nuance: 'Tolerância',
  meios_transporte: 'Transporte',
  susceptibilidade_desinformacao: 'Susceptibilidade',
  busca: 'Busca',
};

// Cores para diferentes tipos de filtro
const CORES_FILTROS: Record<string, string> = {
  generos: 'from-pink-500/20 to-purple-500/20 border-pink-500/30',
  clusters: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30',
  regioes: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
  religioes: 'from-purple-500/20 to-violet-500/20 border-purple-500/30',
  orientacoes_politicas: 'from-red-500/20 to-orange-500/20 border-red-500/30',
  posicoes_bolsonaro: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
  faixas_etarias: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  escolaridades: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
  ocupacoes_vinculos: 'from-violet-500/20 to-purple-500/20 border-violet-500/30',
  cores_racas: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
  faixas_renda: 'from-yellow-500/20 to-lime-500/20 border-yellow-500/30',
  estados_civis: 'from-rose-500/20 to-pink-500/20 border-rose-500/30',
  tem_filhos: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
  interesses_politicos: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30',
  estilos_decisao: 'from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/30',
  tolerancias_nuance: 'from-sky-500/20 to-cyan-500/20 border-sky-500/30',
  meios_transporte: 'from-slate-500/20 to-gray-500/20 border-slate-500/30',
  susceptibilidade_desinformacao: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
  busca: 'from-gray-500/20 to-slate-500/20 border-gray-500/30',
};

function getValorLegivel(tipo: string, valor: string): string {
  const labels = FILTER_LABELS[tipo as FilterType];
  if (labels && labels[valor]) {
    return labels[valor];
  }
  // Formata valores que não estão no mapeamento
  return valor
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function FiltrosAtivos({
  filtros,
  onRemoverFiltro,
  onLimparTodos,
  totalFiltrados,
  totalGeral,
}: FiltrosAtivosProps) {
  // Filtra apenas filtros com valores
  const filtrosComValor = Object.entries(filtros).filter(([_, valor]) => {
    if (Array.isArray(valor)) return valor.length > 0;
    if (typeof valor === 'string') return valor.length > 0;
    return false;
  });

  if (filtrosComValor.length === 0) {
    return null;
  }

  const percentual = ((totalFiltrados / totalGeral) * 100).toFixed(1);

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Header com resumo */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-muted-foreground">Filtrando</span>
            <span className="font-bold text-foreground">{totalFiltrados}</span>
            <span className="text-muted-foreground">de {totalGeral}</span>
            <span className="text-xs text-primary font-medium">({percentual}%)</span>
          </div>
        </div>

        <button
          onClick={onLimparTodos}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
            'bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300',
            'transition-all duration-200 hover:scale-105'
          )}
        >
          <FilterX className="w-3.5 h-3.5" />
          Limpar filtros
        </button>
      </div>

      {/* Badges de filtros */}
      <div className="flex flex-wrap gap-2">
        {filtrosComValor.map(([tipo, valores]) => {
          const valoresArray = Array.isArray(valores) ? valores : [valores];
          const corClasse = CORES_FILTROS[tipo] || 'from-gray-500/20 to-slate-500/20 border-gray-500/30';

          return valoresArray.map((valor) => (
            <div
              key={`${tipo}-${valor}`}
              className={cn(
                'group flex items-center gap-2 px-3 py-1.5 rounded-full',
                'bg-gradient-to-r border backdrop-blur-sm',
                'animate-in zoom-in-95 duration-200',
                'hover:scale-105 transition-transform',
                corClasse
              )}
            >
              <span className="text-xs text-muted-foreground">
                {NOMES_FILTROS[tipo] || tipo}:
              </span>
              <span className="text-sm font-medium text-foreground">
                {getValorLegivel(tipo, valor)}
              </span>
              <button
                onClick={() => onRemoverFiltro(tipo, valor)}
                className={cn(
                  'w-4 h-4 rounded-full flex items-center justify-center',
                  'bg-white/10 hover:bg-white/20 text-foreground/70 hover:text-foreground',
                  'transition-all duration-200',
                  'opacity-60 group-hover:opacity-100'
                )}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ));
        })}
      </div>
    </div>
  );
}
