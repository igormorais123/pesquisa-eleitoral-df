'use client';

import { memo } from 'react';
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
} from 'lucide-react';
import type { Eleitor } from '@/types';

interface AgenteCardProps {
  eleitor: Eleitor;
  selecionado?: boolean;
  onToggleSelecao?: (id: string) => void;
  compacto?: boolean;
}

const CORES_CLUSTER = {
  G1_alta: 'bg-green-500/20 text-green-400 border-green-500/30',
  G2_media_alta: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  G3_media_baixa: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  G4_baixa: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const CORES_ORIENTACAO = {
  esquerda: 'bg-red-500/20 text-red-400',
  'centro-esquerda': 'bg-orange-500/20 text-orange-400',
  centro: 'bg-purple-500/20 text-purple-400',
  'centro-direita': 'bg-blue-500/20 text-blue-400',
  direita: 'bg-indigo-500/20 text-indigo-400',
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
}: AgenteCardProps) {
  const iniciais = gerarIniciais(eleitor.nome);
  const corAvatar = gerarCorDoNome(eleitor.nome);

  if (compacto) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-secondary/50',
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

        {/* Checkbox */}
        {onToggleSelecao && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelecao(eleitor.id);
            }}
            className="text-muted-foreground hover:text-primary"
          >
            {selecionado ? (
              <CheckSquare className="w-5 h-5 text-primary" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'glass-card rounded-xl p-4 hover:shadow-primary-glow/50 transition-all',
        selecionado && 'ring-2 ring-primary'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className={cn(
            'w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0',
            corAvatar
          )}
        >
          {iniciais}
        </div>

        {/* Info básica */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground truncate">{eleitor.nome}</h3>
              <p className="text-sm text-muted-foreground">
                {eleitor.idade} anos • {eleitor.genero === 'masculino' ? 'Masculino' : 'Feminino'} •{' '}
                {eleitor.cor_raca}
              </p>
            </div>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
              {eleitor.id}
            </span>
          </div>

          {/* Localização e Cluster */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{eleitor.regiao_administrativa}</span>
            </div>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full border',
                CORES_CLUSTER[eleitor.cluster_socioeconomico]
              )}
            >
              {LABELS_CLUSTER[eleitor.cluster_socioeconomico]}
            </span>
          </div>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-border my-3" />

      {/* Detalhes */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Briefcase className="w-4 h-4" />
          <span className="truncate">
            {eleitor.profissao} • {eleitor.renda_salarios_minimos.replace(/_/g, ' ')} SM
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Church className="w-4 h-4" />
          <span>{eleitor.religiao}</span>
        </div>

        <div className="flex items-center gap-2">
          <Vote className="w-4 h-4 text-muted-foreground" />
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded',
              CORES_ORIENTACAO[eleitor.orientacao_politica]
            )}
          >
            {eleitor.orientacao_politica}
          </span>
          <span className="text-xs text-muted-foreground">
            • {eleitor.posicao_bolsonaro.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Susceptibilidade */}
      {eleitor.susceptibilidade_desinformacao && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Susceptibilidade
            </span>
            <span className="text-foreground">{eleitor.susceptibilidade_desinformacao}/10</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
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

      {/* História */}
      <div className="mt-3 p-3 bg-secondary/50 rounded-lg">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {eleitor.historia_resumida}
        </p>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 mt-4">
        <Link
          href={`/eleitores/${eleitor.id}`}
          className="flex-1 text-center text-sm py-2 px-3 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
        >
          Ver Perfil
        </Link>
        {onToggleSelecao && (
          <button
            onClick={() => onToggleSelecao(eleitor.id)}
            className={cn(
              'py-2 px-3 rounded-lg text-sm transition-colors flex items-center gap-2',
              selecionado
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80 text-foreground'
            )}
          >
            {selecionado ? (
              <>
                <CheckSquare className="w-4 h-4" />
                Selecionado
              </>
            ) : (
              <>
                <Square className="w-4 h-4" />
                Selecionar
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
});
