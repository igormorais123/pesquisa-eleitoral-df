'use client';

import { memo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import {
  Building2,
  Vote,
  Users,
  CheckSquare,
  Square,
  ChevronRight,
  Landmark,
  Award,
  Calendar,
  MapPin,
} from 'lucide-react';
import type { Parlamentar, CasaLegislativa } from '@/types';

interface ParlamentarCardProps {
  parlamentar: Parlamentar;
  selecionado?: boolean;
  onToggleSelecao?: (id: string) => void;
  compacto?: boolean;
}

const CORES_CASA: Record<CasaLegislativa, string> = {
  camara_federal: 'bg-green-500/20 text-green-400 border-green-500/30',
  senado: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  cldf: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const LABELS_CASA: Record<CasaLegislativa, string> = {
  camara_federal: 'Câmara Federal',
  senado: 'Senado',
  cldf: 'CLDF',
};

const CORES_ORIENTACAO = {
  esquerda: 'bg-red-500/20 text-red-400',
  'centro-esquerda': 'bg-orange-500/20 text-orange-400',
  centro: 'bg-purple-500/20 text-purple-400',
  'centro-direita': 'bg-blue-500/20 text-blue-400',
  direita: 'bg-indigo-500/20 text-indigo-400',
};

const CORES_RELACAO_GOVERNO = {
  base_aliada: 'bg-green-500/20 text-green-400',
  independente: 'bg-gray-500/20 text-gray-400',
  oposicao_moderada: 'bg-orange-500/20 text-orange-400',
  oposicao_forte: 'bg-red-500/20 text-red-400',
};

const LABELS_RELACAO_GOVERNO = {
  base_aliada: 'Base Aliada',
  independente: 'Independente',
  oposicao_moderada: 'Oposição Moderada',
  oposicao_forte: 'Oposição',
};

export const ParlamentarCard = memo(function ParlamentarCard({
  parlamentar,
  selecionado = false,
  onToggleSelecao,
  compacto = false,
}: ParlamentarCardProps) {
  const p = parlamentar;

  // Formatar número de votos
  const votosFormatados = new Intl.NumberFormat('pt-BR').format(p.votos_eleicao);

  // Modo compacto para listas
  if (compacto) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-secondary/50 active:bg-secondary/70',
          selecionado ? 'bg-primary/10 border-primary' : 'border-border'
        )}
        onClick={() => onToggleSelecao?.(p.id)}
      >
        {/* Foto */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-secondary">
          {p.foto_url ? (
            <ImageWithFallback
              src={p.foto_url}
              fallbackSrc={p.foto_url_alternativa}
              fallbackElement={
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Users className="w-6 h-6" />
                </div>
              }
              alt={p.nome_parlamentar}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Users className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{p.nome_parlamentar}</p>
          <p className="text-xs text-muted-foreground truncate">
            {p.partido} {p.uf && `• ${p.uf}`} • {p.cargo}
          </p>
        </div>

        {/* Casa legislativa badge */}
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full border hidden sm:inline',
            CORES_CASA[p.casa_legislativa]
          )}
        >
          {LABELS_CASA[p.casa_legislativa]}
        </span>

        {/* Checkbox ou Seta */}
        {onToggleSelecao ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelecao(p.id);
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
            href={`/parlamentares/${p.id}`}
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
        'glass-card rounded-xl p-3 sm:p-4 hover:shadow-primary-glow/50 transition-all group cursor-pointer',
        selecionado && 'ring-2 ring-primary'
      )}
      onClick={() => {
        // Navegar para o perfil se não houver função de seleção
        if (!onToggleSelecao) {
          window.location.href = `/parlamentares/${p.id}`;
        }
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Foto */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-secondary">
          {p.foto_url ? (
            <ImageWithFallback
              src={p.foto_url}
              fallbackSrc={p.foto_url_alternativa}
              fallbackElement={
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Users className="w-8 h-8" />
                </div>
              }
              alt={p.nome_parlamentar}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 64px, 80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Users className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Info básica */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                {p.nome_parlamentar}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {p.nome}
              </p>
            </div>
          </div>

          {/* Partido, UF e Casa */}
          <div className="flex items-center gap-2 mt-1 sm:mt-2 flex-wrap">
            <span className="text-sm font-bold text-primary">{p.partido}</span>
            {p.uf && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                {p.uf}
              </span>
            )}
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full border',
                CORES_CASA[p.casa_legislativa]
              )}
            >
              {LABELS_CASA[p.casa_legislativa]}
            </span>
          </div>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-border my-2 sm:my-3" />

      {/* Detalhes */}
      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
        {/* Cargo */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Landmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate capitalize">{p.cargo.replace(/_/g, ' ')}</span>
        </div>

        {/* Base eleitoral */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">{p.base_eleitoral}</span>
        </div>

        {/* Votos */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Vote className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>{votosFormatados} votos</span>
        </div>

        {/* Orientação Política e Relação com Governo */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded',
              CORES_ORIENTACAO[p.orientacao_politica]
            )}
          >
            {p.orientacao_politica.replace('-', ' ')}
          </span>
          {p.relacao_governo_atual && (
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded',
                CORES_RELACAO_GOVERNO[p.relacao_governo_atual]
              )}
            >
              {LABELS_RELACAO_GOVERNO[p.relacao_governo_atual]}
            </span>
          )}
        </div>
      </div>

      {/* Temas de atuação */}
      {p.temas_atuacao && p.temas_atuacao.length > 0 && (
        <div className="mt-2 sm:mt-3">
          <p className="text-xs text-muted-foreground mb-1">Temas de atuação:</p>
          <div className="flex flex-wrap gap-1">
            {p.temas_atuacao.slice(0, 3).map((tema, i) => (
              <span
                key={i}
                className="text-xs bg-secondary px-2 py-0.5 rounded-full text-foreground"
              >
                {tema}
              </span>
            ))}
            {p.temas_atuacao.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{p.temas_atuacao.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* História resumida */}
      <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-secondary/50 rounded-lg hidden xs:block">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {p.historia_resumida}
        </p>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 mt-3 sm:mt-4">
        <Link
          href={`/parlamentares/${p.id}`}
          className="flex-1 text-center text-xs sm:text-sm py-2.5 sm:py-2 px-3 rounded-lg bg-secondary hover:bg-secondary/80 active:bg-secondary/70 text-foreground transition-colors min-h-[40px] sm:min-h-[36px] flex items-center justify-center"
        >
          Ver Perfil
        </Link>
        {onToggleSelecao && (
          <button
            onClick={() => onToggleSelecao(p.id)}
            className={cn(
              'py-2.5 sm:py-2 px-3 rounded-lg text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 sm:gap-2 min-h-[40px] sm:min-h-[36px]',
              selecionado
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80 active:bg-secondary/70 text-foreground'
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
