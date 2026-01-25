'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  RefreshCw,
  Vote,
  FileText,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  TrendingUp,
  Building2,
  Landmark,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useVotacoesRecentesCamara,
  usePautasRecentes,
  useSugestoesPerguntasPautas,
  useDeputadosFederaisDF,
  useSenadoresEmExercicio,
} from '@/hooks/useDadosAbertos';

interface DadosTempoRealProps {
  className?: string;
}

export function DadosTempoReal({ className }: DadosTempoRealProps) {
  const [secaoExpandida, setSecaoExpandida] = useState<string | null>('votacoes');

  const {
    data: votacoesRecentes,
    isLoading: carregandoVotacoes,
    refetch: recarregarVotacoes,
  } = useVotacoesRecentesCamara();

  const {
    data: sugestoes,
    isLoading: carregandoSugestoes,
  } = useSugestoesPerguntasPautas();

  const {
    data: deputadosAPI,
    isLoading: carregandoDeputados,
  } = useDeputadosFederaisDF();

  const {
    data: senadoresAPI,
    isLoading: carregandoSenadores,
  } = useSenadoresEmExercicio();

  const toggleSecao = (secao: string) => {
    setSecaoExpandida(secaoExpandida === secao ? null : secao);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Dados em Tempo Real
        </h2>
        <button
          onClick={() => recarregarVotacoes()}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          title="Atualizar dados"
        >
          <RefreshCw className={cn('w-4 h-4', carregandoVotacoes && 'animate-spin')} />
        </button>
      </div>

      {/* Votações Recentes */}
      <div className="glass-card rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSecao('votacoes')}
          className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Vote className="w-5 h-5 text-green-400" />
            <span className="font-medium text-foreground">Votações Recentes</span>
            {votacoesRecentes && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                {votacoesRecentes.length}
              </span>
            )}
          </div>
          {secaoExpandida === 'votacoes' ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {secaoExpandida === 'votacoes' && (
          <div className="px-4 pb-4 space-y-3 max-h-64 overflow-y-auto">
            {carregandoVotacoes ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : votacoesRecentes && votacoesRecentes.length > 0 ? (
              votacoesRecentes.slice(0, 10).map((votacao, i) => (
                <div
                  key={votacao.id || i}
                  className="p-3 bg-secondary/50 rounded-lg space-y-1"
                >
                  <p className="text-sm text-foreground line-clamp-2">
                    {votacao.descricao || votacao.proposicaoObjeto || 'Votação'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {votacao.data
                        ? new Date(votacao.data).toLocaleDateString('pt-BR')
                        : 'Data não informada'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {votacao.siglaOrgao || 'Câmara'}
                    </span>
                  </div>
                  {votacao.aprovacao !== undefined && (
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        votacao.aprovacao > 0
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      )}
                    >
                      {votacao.aprovacao > 0 ? 'Aprovada' : 'Rejeitada'}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma votação recente encontrada
              </p>
            )}

            <a
              href="https://dadosabertos.camara.leg.br/swagger/api.html#api-Votacoes"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-xs text-primary hover:underline"
            >
              Ver mais na API da Câmara
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Sugestões de Perguntas */}
      <div className="glass-card rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSecao('sugestoes')}
          className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <span className="font-medium text-foreground">Sugestões de Perguntas</span>
          </div>
          {secaoExpandida === 'sugestoes' ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {secaoExpandida === 'sugestoes' && (
          <div className="px-4 pb-4 space-y-2">
            {carregandoSugestoes ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : sugestoes && sugestoes.length > 0 ? (
              sugestoes.slice(0, 8).map((sugestao, i) => (
                <div
                  key={i}
                  className="p-3 bg-secondary/50 rounded-lg text-sm text-foreground hover:bg-secondary cursor-pointer transition-colors"
                  title="Clique para copiar"
                  onClick={() => {
                    navigator.clipboard.writeText(sugestao);
                  }}
                >
                  &ldquo;{sugestao}&rdquo;
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma sugestão disponível
              </p>
            )}
          </div>
        )}
      </div>

      {/* Deputados do DF (API) */}
      <div className="glass-card rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSecao('deputados')}
          className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-green-400" />
            <span className="font-medium text-foreground">Deputados DF (API Câmara)</span>
            {deputadosAPI && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                {deputadosAPI.length}
              </span>
            )}
          </div>
          {secaoExpandida === 'deputados' ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {secaoExpandida === 'deputados' && (
          <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
            {carregandoDeputados ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : deputadosAPI && deputadosAPI.length > 0 ? (
              deputadosAPI.map((dep) => (
                <div
                  key={dep.id}
                  className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg"
                >
                  {dep.urlFoto && (
                    <Image
                      src={dep.urlFoto}
                      alt={dep.nome}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                      unoptimized
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {dep.nome}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dep.siglaPartido} • ID: {dep.id}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum deputado encontrado
              </p>
            )}
          </div>
        )}
      </div>

      {/* Senadores (API) */}
      <div className="glass-card rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSecao('senadores')}
          className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Landmark className="w-5 h-5 text-blue-400" />
            <span className="font-medium text-foreground">Senadores (API Senado)</span>
            {senadoresAPI && (
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                {senadoresAPI.length}
              </span>
            )}
          </div>
          {secaoExpandida === 'senadores' ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {secaoExpandida === 'senadores' && (
          <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
            {carregandoSenadores ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : senadoresAPI && senadoresAPI.length > 0 ? (
              senadoresAPI
                .filter((sen) => sen.IdentificacaoParlamentar?.UfParlamentar === 'DF')
                .map((sen) => (
                  <div
                    key={sen.IdentificacaoParlamentar?.CodigoParlamentar}
                    className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg"
                  >
                    {sen.IdentificacaoParlamentar?.UrlFotoParlamentar && (
                      <Image
                        src={sen.IdentificacaoParlamentar.UrlFotoParlamentar}
                        alt={sen.IdentificacaoParlamentar.NomeParlamentar}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                        unoptimized
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {sen.IdentificacaoParlamentar?.NomeParlamentar}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sen.IdentificacaoParlamentar?.SiglaPartidoParlamentar} •
                        Código: {sen.IdentificacaoParlamentar?.CodigoParlamentar}
                      </p>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum senador encontrado
              </p>
            )}
          </div>
        )}
      </div>

      {/* Aviso sobre CORS */}
      <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Alguns dados podem não carregar devido a restrições de CORS das APIs.
          Para acesso completo, configure um proxy ou use as APIs diretamente no backend.
        </p>
      </div>
    </div>
  );
}
