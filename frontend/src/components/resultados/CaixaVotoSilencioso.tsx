'use client';

/**
 * Caixa Especial: Voto Silencioso
 * Identifica eleitores que votam mas não defendem publicamente
 * DIFERENCIAL do sistema
 * Pesquisa Eleitoral DF 2026
 */

import { useMemo, useState } from 'react';
import { EyeOff, Users, Quote, ChevronDown, ChevronUp, User, TrendingUp } from 'lucide-react';
import type { Eleitor } from '@/types';
import { detectarVotoSilencioso, type VotoSilencioso, type AnaliseVotoSilencioso } from '@/lib/analysis/voto-silencioso';
import { cn } from '@/lib/utils';

interface CaixaVotoSilenciosoProps {
  eleitores: Eleitor[];
}

export function CaixaVotoSilencioso({ eleitores }: CaixaVotoSilenciosoProps) {
  const [expandido, setExpandido] = useState(false);
  const [perfilSelecionado, setPerfilSelecionado] = useState<VotoSilencioso | null>(null);

  const analise = useMemo(() => {
    return detectarVotoSilencioso(eleitores);
  }, [eleitores]);

  if (analise.total_detectados === 0) {
    return (
      <div className="glass-card rounded-xl p-6 border-l-4 border-gray-500">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center">
            <EyeOff className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Voto Silencioso</h3>
            <p className="text-sm text-muted-foreground">Nenhum perfil detectado nesta amostra</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6 border-l-4 border-amber-500">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <EyeOff className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Voto Silencioso</h3>
            <p className="text-sm text-muted-foreground">
              Eleitores que votam, mas não defendem publicamente
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-3xl font-bold text-amber-400">{analise.total_detectados}</p>
          <p className="text-sm text-muted-foreground">
            {analise.percentual_amostra.toFixed(1)}% da amostra
          </p>
        </div>
      </div>

      {/* Perfil Típico */}
      <div className="bg-secondary/30 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <span className="font-medium text-sm">Perfil típico do voto silencioso:</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Classe</p>
            <p className="font-medium">{analise.perfil_tipico.classe_predominante}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Escolaridade</p>
            <p className="font-medium">{analise.perfil_tipico.escolaridade_predominante}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Faixa etária</p>
            <p className="font-medium">{analise.perfil_tipico.faixa_etaria_predominante}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Região</p>
            <p className="font-medium">{analise.perfil_tipico.regiao_predominante}</p>
          </div>
        </div>
      </div>

      {/* Características */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-500/10 rounded-lg p-4">
          <p className="text-green-400 font-medium mb-2">Concordam com economia</p>
          <p className="text-2xl font-bold">
            {analise.eleitores.filter(e => e.concorda_economia).length}
          </p>
          <p className="text-xs text-muted-foreground">
            {((analise.eleitores.filter(e => e.concorda_economia).length / analise.total_detectados) * 100).toFixed(0)}% do grupo
          </p>
        </div>
        <div className="bg-red-500/10 rounded-lg p-4">
          <p className="text-red-400 font-medium mb-2">Rejeitam pautas de costumes</p>
          <p className="text-2xl font-bold">
            {analise.eleitores.filter(e => e.rejeita_costumes).length}
          </p>
          <p className="text-xs text-muted-foreground">
            {((analise.eleitores.filter(e => e.rejeita_costumes).length / analise.total_detectados) * 100).toFixed(0)}% do grupo
          </p>
        </div>
      </div>

      {/* Citação Representativa */}
      {analise.eleitores[0] && (
        <div className="bg-secondary/50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Quote className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-foreground italic mb-2">
                {analise.eleitores[0].citacao_reveladora}
              </p>
              <p className="text-sm text-muted-foreground">
                — {analise.eleitores[0].agente_nome.split(' ')[0]}, {analise.eleitores[0].perfil_resumido}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botão Expandir */}
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full flex items-center justify-center gap-2 py-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
      >
        <Users className="w-4 h-4" />
        <span>{expandido ? 'Ocultar' : 'Ver'} todos os {analise.total_detectados} perfis</span>
        {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Lista expandida */}
      {expandido && (
        <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
          {analise.eleitores.map((voto) => (
            <div
              key={voto.agente_id}
              className={cn(
                'p-4 rounded-lg cursor-pointer transition-all',
                perfilSelecionado?.agente_id === voto.agente_id
                  ? 'bg-amber-500/20 border border-amber-500/50'
                  : 'bg-secondary/30 hover:bg-secondary/50'
              )}
              onClick={() => setPerfilSelecionado(
                perfilSelecionado?.agente_id === voto.agente_id ? null : voto
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{voto.agente_nome}</span>
                </div>
                <span className="text-sm px-2 py-1 rounded bg-amber-500/20 text-amber-400">
                  {voto.probabilidade_voto_escondido}% prob.
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-2">{voto.perfil_resumido}</p>

              {perfilSelecionado?.agente_id === voto.agente_id && (
                <div className="mt-3 pt-3 border-t border-border space-y-2">
                  <p className="text-sm italic text-foreground">{voto.citacao_reveladora}</p>
                  {voto.contradicoes_detectadas.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Contradições:</p>
                      <ul className="text-xs text-muted-foreground list-disc list-inside">
                        {voto.contradicoes_detectadas.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs text-amber-400 mt-2">{voto.interpretacao}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CaixaVotoSilencioso;
