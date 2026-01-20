'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import { cn, gerarIniciais, gerarCorDoNome } from '@/lib/utils';
import {
  MapPin,
  Briefcase,
  Church,
  Vote,
  User,
  AlertTriangle,
  CheckSquare,
  Square,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import type { Eleitor } from '@/types';

interface AgenteCardProps {
  eleitor: Eleitor;
  selecionado?: boolean;
  onToggleSelecao?: (id: string) => void;
  compacto?: boolean;
  mobileFriendly?: boolean;
}

const CORES_CLUSTER = {
  G1_alta: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30',
  G2_media_alta: 'bg-lime-100 dark:bg-lime-500/20 text-lime-700 dark:text-lime-400 border-lime-300 dark:border-lime-500/30',
  G3_media_baixa: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500/30',
  G4_baixa: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-500/30',
};

const CORES_ORIENTACAO = {
  esquerda: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
  'centro-esquerda': 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400',
  centro: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400',
  'centro-direita': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
  direita: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400',
};

const LABELS_CLUSTER = {
  G1_alta: 'Alta',
  G2_media_alta: 'Média-Alta',
  G3_media_baixa: 'Média-Baixa',
  G4_baixa: 'Baixa',
};

export const AgenteCard = memo(function AgenteCard({
  eleitor,
  selecionado = false,
  onToggleSelecao,
  compacto = false,
  mobileFriendly = true,
}: AgenteCardProps) {
  const iniciais = gerarIniciais(eleitor.nome);
  const corAvatar = gerarCorDoNome(eleitor.nome);

  // Modo compacto para listas
  if (compacto) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-secondary/50 active:bg-secondary/70',
          selecionado ? 'bg-primary/10 border-primary' : 'border-border'
        )}
        onClick={() => onToggleSelecao?.(eleitor.id)}
      >
        {/* Avatar */}
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white flex-shrink-0',
            corAvatar
          )}
        >
          {iniciais}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{eleitor.nome}</p>
          <p className="text-xs text-muted-foreground truncate">
            {eleitor.idade} anos • {eleitor.regiao_administrativa}
          </p>
        </div>

        {/* Checkbox ou Seta de navegação */}
        {onToggleSelecao ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelecao(eleitor.id);
            }}
            className="text-muted-foreground hover:text-primary min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
          >
            {selecionado ? (
              <CheckSquare className="w-5 h-5 text-primary" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
        ) : (
          <Link
            href={`/eleitores/${eleitor.id}`}
            className="text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-xl p-3 sm:p-4 hover:shadow-lg hover:border-primary/20 transition-all group cursor-pointer',
        selecionado && 'ring-2 ring-primary'
      )}
      onClick={() => {
        // Navegar para o perfil se não houver função de seleção
        if (!onToggleSelecao) {
          window.location.href = `/eleitores/${eleitor.id}`;
        }
      }}
    >
      {/* Header - Mobile optimized */}
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Avatar - Menor em mobile */}
        <div
          className={cn(
            'w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center text-base sm:text-lg font-bold text-white flex-shrink-0',
            corAvatar
          )}
        >
          {iniciais}
        </div>

        {/* Info básica */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{eleitor.nome}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {eleitor.idade} anos • {eleitor.genero === 'masculino' ? 'M' : 'F'}
                <span className="hidden sm:inline"> • {eleitor.cor_raca}</span>
              </p>
            </div>
            {/* ID oculto em mobile para economizar espaço */}
            <span className="hidden sm:inline text-xs text-muted-foreground bg-muted px-2 py-1 rounded flex-shrink-0">
              {eleitor.id}
            </span>
          </div>

          {/* Localização e Cluster - Compacto em mobile */}
          <div className="flex items-center gap-2 mt-1 sm:mt-2 flex-wrap">
            <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-none">{eleitor.regiao_administrativa}</span>
            </div>
            <span
              className={cn(
                'text-xs px-1.5 sm:px-2 py-0.5 rounded-full border',
                CORES_CLUSTER[eleitor.cluster_socioeconomico]
              )}
            >
              {LABELS_CLUSTER[eleitor.cluster_socioeconomico]}
            </span>
          </div>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-border my-2 sm:my-3" />

      {/* Detalhes - Mais compactos em mobile */}
      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">
            {eleitor.profissao}
            <span className="hidden sm:inline"> • {eleitor.renda_salarios_minimos.replace(/_/g, ' ')} SM</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Church className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">{eleitor.religiao}</span>
        </div>

        <div className="flex items-center gap-2">
          <Vote className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
          <span
            className={cn(
              'text-xs px-1.5 sm:px-2 py-0.5 rounded',
              CORES_ORIENTACAO[eleitor.orientacao_politica]
            )}
          >
            {eleitor.orientacao_politica}
          </span>
          <span className="text-xs text-muted-foreground truncate hidden sm:inline">
            • {eleitor.posicao_bolsonaro.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Susceptibilidade - Simplificado em mobile */}
      {eleitor.susceptibilidade_desinformacao && (
        <div className="mt-2 sm:mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span className="hidden sm:inline">Susceptibilidade</span>
            </span>
            <span className="text-foreground">{eleitor.susceptibilidade_desinformacao}/10</span>
          </div>
          <div className="h-1 sm:h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                eleitor.susceptibilidade_desinformacao <= 3
                  ? 'bg-green-500'
                  : eleitor.susceptibilidade_desinformacao <= 6
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              )}
              style={{ width: `${eleitor.susceptibilidade_desinformacao * 10}%` }}
            />
          </div>
        </div>
      )}

      {/* História - Oculta em mobile pequeno */}
      <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hidden xs:block">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {eleitor.historia_resumida}
        </p>
      </div>

      {/* Ações - Botões maiores para touch */}
      <div className="flex items-center gap-2 mt-3 sm:mt-4">
        <Link
          href={`/eleitores/${eleitor.id}`}
          className="flex-1 text-center text-xs sm:text-sm py-2.5 sm:py-2 px-3 rounded-lg bg-muted hover:bg-muted/80 active:bg-muted/70 text-foreground transition-colors min-h-[40px] sm:min-h-[36px] flex items-center justify-center"
        >
          Ver Perfil
        </Link>
        {onToggleSelecao && (
          <button
            onClick={() => onToggleSelecao(eleitor.id)}
            className={cn(
              'py-2.5 sm:py-2 px-3 rounded-lg text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 sm:gap-2 min-h-[40px] sm:min-h-[36px]',
              selecionado
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80 active:bg-muted/70 text-foreground'
            )}
          >
            {selecionado ? (
              <>
                <CheckSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Selecionado</span>
              </>
            ) : (
              <>
                <Square className="w-4 h-4" />
                <span className="hidden sm:inline">Selecionar</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
});
