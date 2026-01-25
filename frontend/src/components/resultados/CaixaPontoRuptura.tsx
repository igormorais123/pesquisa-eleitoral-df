'use client';

/**
 * Caixa Especial: Ponto de Ruptura
 * Identifica o que faria cada eleitor mudar de lado
 * DIFERENCIAL do sistema
 * Pesquisa Eleitoral DF 2026
 */

import { useMemo, useState } from 'react';
import { HeartCrack, AlertTriangle, Users, Quote, ChevronDown, ChevronUp, Shield, Target } from 'lucide-react';
import type { Eleitor } from '@/types';
import { analisarPontosRuptura, type AnalisePontoRuptura, type PontoRuptura } from '@/lib/analysis/ponto-ruptura';
import { cn } from '@/lib/utils';

interface CaixaPontoRupturaProps {
  eleitores: Eleitor[];
}

type GrupoPolitico = 'apoiadores' | 'oposicao' | 'indecisos';

export function CaixaPontoRuptura({ eleitores }: CaixaPontoRupturaProps) {
  const [grupoSelecionado, setGrupoSelecionado] = useState<GrupoPolitico>('apoiadores');
  const [expandido, setExpandido] = useState(false);
  const [perfilSelecionado, setPerfilSelecionado] = useState<PontoRuptura | null>(null);

  const analise = useMemo(() => {
    return analisarPontosRuptura(eleitores);
  }, [eleitores]);

  const grupoAtual = grupoSelecionado === 'apoiadores'
    ? analise.apoiadores_bolsonaro
    : grupoSelecionado === 'oposicao'
    ? analise.oposicao
    : analise.indecisos;

  const eleitoresGrupo = analise.eleitores.filter(e => {
    if (grupoSelecionado === 'apoiadores') {
      return e.orientacao_atual.includes('Direita');
    } else if (grupoSelecionado === 'oposicao') {
      return e.orientacao_atual.includes('Esquerda');
    } else {
      return e.orientacao_atual.includes('Centro');
    }
  });

  const coresGrupo: Record<GrupoPolitico, { bg: string; text: string; border: string }> = {
    apoiadores: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
    oposicao: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' },
    indecisos: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500' },
  };

  const cores = coresGrupo[grupoSelecionado];

  return (
    <div className={cn('glass-card rounded-xl p-6 border-l-4', cores.border)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', cores.bg)}>
            <HeartCrack className={cn('w-6 h-6', cores.text)} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Pontos de Ruptura</h3>
            <p className="text-sm text-muted-foreground">
              O que faria cada perfil mudar de lado
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className={cn('text-3xl font-bold', cores.text)}>{analise.total_analisados}</p>
          <p className="text-sm text-muted-foreground">eleitores analisados</p>
        </div>
      </div>

      {/* Seletor de grupo */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setGrupoSelecionado('apoiadores')}
          className={cn(
            'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
            grupoSelecionado === 'apoiadores'
              ? 'bg-blue-500 text-white'
              : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
          )}
        >
          <span className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            Apoiadores ({analise.apoiadores_bolsonaro.total})
          </span>
        </button>
        <button
          onClick={() => setGrupoSelecionado('oposicao')}
          className={cn(
            'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
            grupoSelecionado === 'oposicao'
              ? 'bg-red-500 text-white'
              : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
          )}
        >
          <span className="flex items-center justify-center gap-2">
            <Target className="w-4 h-4" />
            Oposição ({analise.oposicao.total})
          </span>
        </button>
        <button
          onClick={() => setGrupoSelecionado('indecisos')}
          className={cn(
            'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
            grupoSelecionado === 'indecisos'
              ? 'bg-gray-500 text-white'
              : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
          )}
        >
          <span className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            Indecisos ({analise.indecisos.total})
          </span>
        </button>
      </div>

      {/* Vulnerabilidade média */}
      <div className={cn('rounded-lg p-4 mb-6', cores.bg)}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Vulnerabilidade média do grupo</p>
            <p className={cn('text-2xl font-bold', cores.text)}>
              {grupoAtual.vulnerabilidade_media.toFixed(0)}%
            </p>
          </div>
          <div className="w-24 h-24 relative">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-secondary"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${grupoAtual.vulnerabilidade_media}, 100`}
                className={cores.text}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <AlertTriangle className={cn('w-6 h-6', cores.text)} />
            </div>
          </div>
        </div>
      </div>

      {/* Linhas Vermelhas do grupo */}
      <div className="mb-6">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <AlertTriangle className={cn('w-4 h-4', cores.text)} />
          Principais linhas vermelhas
        </h4>
        <div className="space-y-3">
          {grupoAtual.linhas_vermelhas.slice(0, 3).map((linha, index) => (
            <div key={index} className="bg-secondary/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{linha.linha_vermelha}</span>
                <span className={cn('text-sm font-bold', cores.text)}>
                  {linha.percentual.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
                <div
                  className={cn('h-full rounded-full transition-all', cores.bg.replace('/20', ''))}
                  style={{ width: `${linha.percentual}%` }}
                />
              </div>
              {linha.citacao_exemplo && (
                <p className="text-xs text-muted-foreground italic">
                  {linha.citacao_exemplo}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Botão Expandir */}
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full flex items-center justify-center gap-2 py-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
      >
        <Users className="w-4 h-4" />
        <span>{expandido ? 'Ocultar' : 'Ver'} análise individual ({eleitoresGrupo.length} eleitores)</span>
        {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Lista expandida */}
      {expandido && (
        <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
          {eleitoresGrupo.slice(0, 50).map((ponto) => (
            <div
              key={ponto.agente_id}
              className={cn(
                'p-4 rounded-lg cursor-pointer transition-all',
                perfilSelecionado?.agente_id === ponto.agente_id
                  ? cn(cores.bg, 'border', cores.border.replace('border-', 'border-'))
                  : 'bg-secondary/30 hover:bg-secondary/50'
              )}
              onClick={() => setPerfilSelecionado(
                perfilSelecionado?.agente_id === ponto.agente_id ? null : ponto
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{ponto.agente_nome}</span>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded',
                    ponto.vulnerabilidade === 'alta' ? 'bg-red-500/20 text-red-400' :
                    ponto.vulnerabilidade === 'media' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  )}>
                    {ponto.vulnerabilidade}
                  </span>
                </div>
                <span className={cn('text-sm font-bold', cores.text)}>
                  {ponto.probabilidade_ruptura}%
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-2">{ponto.perfil_resumido}</p>

              {/* Gatilho principal */}
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span className="text-xs text-amber-400">{ponto.gatilho_mudanca}</span>
              </div>

              {perfilSelecionado?.agente_id === ponto.agente_id && (
                <div className="mt-3 pt-3 border-t border-border space-y-3">
                  {/* Citação */}
                  <div className="flex items-start gap-2">
                    <Quote className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                    <p className="text-sm italic">{ponto.citacao_reveladora}</p>
                  </div>

                  {/* Linhas vermelhas */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Todas as linhas vermelhas:</p>
                    <ul className="text-xs text-muted-foreground list-disc list-inside">
                      {ponto.linhas_vermelhas.map((l, i) => (
                        <li key={i}>{l}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Valores em conflito */}
                  {ponto.valores_em_conflito.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Valores em conflito:</p>
                      <div className="flex flex-wrap gap-1">
                        {ponto.valores_em_conflito.map((v, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estratégia */}
                  {ponto.estrategia_persuasao && (
                    <div className={cn('p-2 rounded text-xs', cores.bg)}>
                      <p className="font-medium mb-1">Estratégia de persuasão:</p>
                      <p>{ponto.estrategia_persuasao}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CaixaPontoRuptura;
