'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, BarChart3, Loader2, AlertCircle, RefreshCw, Play, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardConsolidado } from './DashboardConsolidado';
import { useAnaliseInteligente } from '@/hooks/useAnaliseInteligente';

interface RespostaEntrevista {
  texto: string;
  pergunta: string;
  eleitorId?: string;
  eleitorNome?: string;
  regiao?: string;
  orientacao?: string;
  cluster?: string;
}

interface AnalisadorInteligenteProps {
  respostas?: RespostaEntrevista[];
  relatorioTexto?: string;
  titulo?: string;
  autoAnalisar?: boolean;
}

export function AnalisadorInteligente({
  respostas = [],
  relatorioTexto = '',
  titulo = 'Pesquisa Eleitoral',
  autoAnalisar = false,
}: AnalisadorInteligenteProps) {
  const {
    extracao,
    sintese,
    carregando,
    erro,
    extrairDados,
    sintetizarRelatorio,
    analisarCompleto,
    limpar,
  } = useAnaliseInteligente();

  const [modoAnalise, setModoAnalise] = useState<'respostas' | 'relatorio'>('respostas');
  const [jaAnalisou, setJaAnalisou] = useState(false);

  // Auto análise na montagem
  useEffect(() => {
    if (autoAnalisar && !jaAnalisou && respostas.length > 0) {
      handleAnalisar();
      setJaAnalisou(true);
    }
  }, [autoAnalisar, respostas.length, jaAnalisou]);

  const handleAnalisar = async () => {
    if (modoAnalise === 'respostas' && respostas.length > 0) {
      // Formatar respostas para a API
      const respostasFormatadas = respostas.map(r => ({
        texto: r.texto,
        pergunta: r.pergunta,
        eleitor: {
          regiao: r.regiao,
          orientacao: r.orientacao,
          cluster: r.cluster,
        },
      }));

      await extrairDados(respostasFormatadas, true);
    } else if (modoAnalise === 'relatorio' && relatorioTexto.length > 100) {
      await sintetizarRelatorio(relatorioTexto, {
        titulo,
        totalEntrevistas: respostas.length,
      });
    } else if (respostas.length > 0) {
      // Análise completa
      const respostasFormatadas = respostas.map(r => ({
        texto: r.texto,
        pergunta: r.pergunta,
        eleitor: {
          regiao: r.regiao,
          orientacao: r.orientacao,
          cluster: r.cluster,
        },
      }));

      await analisarCompleto(respostasFormatadas, relatorioTexto);
    }
  };

  const temDadosParaAnalisar = respostas.length > 0 || relatorioTexto.length > 100;
  const temResultados = extracao || sintese;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Análise Inteligente com IA</h2>
              <p className="text-sm text-muted-foreground">
                Transforme respostas textuais em dados quantitativos e visualizações
              </p>
            </div>
          </div>

          {temResultados && (
            <button
              onClick={limpar}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-accent"
            >
              <RefreshCw className="w-4 h-4" />
              Limpar
            </button>
          )}
        </div>

        {/* Seletor de modo */}
        {!temResultados && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setModoAnalise('respostas')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                modoAnalise === 'respostas'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              <BarChart3 className="w-4 h-4" />
              Analisar Respostas ({respostas.length})
            </button>
            <button
              onClick={() => setModoAnalise('relatorio')}
              disabled={relatorioTexto.length < 100}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                modoAnalise === 'relatorio'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80',
                relatorioTexto.length < 100 && 'opacity-50 cursor-not-allowed'
              )}
            >
              <FileText className="w-4 h-4" />
              Sintetizar Relatório
            </button>
          </div>
        )}

        {/* Info sobre o que será analisado */}
        {!temResultados && !carregando && (
          <div className="p-4 rounded-lg bg-muted/50 mb-4">
            {modoAnalise === 'respostas' ? (
              <div className="text-sm">
                <p className="font-medium mb-2">O que será analisado:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• {respostas.length} respostas de entrevistas</li>
                  <li>• Extração de sentimento e indicadores</li>
                  <li>• Identificação de temas e categorias</li>
                  <li>• Geração de insights acionáveis</li>
                </ul>
              </div>
            ) : (
              <div className="text-sm">
                <p className="font-medium mb-2">O que será sintetizado:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Relatório de {relatorioTexto.length} caracteres</li>
                  <li>• Extração de KPIs e métricas</li>
                  <li>• Identificação de alertas e riscos</li>
                  <li>• Geração de conclusões e recomendações</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Botão de análise */}
        {!temResultados && (
          <button
            onClick={handleAnalisar}
            disabled={carregando || !temDadosParaAnalisar}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all',
              carregando || !temDadosParaAnalisar
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-gradient-to-r from-primary to-purple-600 text-white hover:opacity-90'
            )}
          >
            {carregando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analisando com IA...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Analisar com Inteligência Artificial
              </>
            )}
          </button>
        )}

        {/* Erro */}
        {erro && (
          <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-500">Erro na análise</p>
              <p className="text-sm text-muted-foreground mt-1">{erro}</p>
            </div>
          </div>
        )}
      </div>

      {/* Dashboard de Resultados */}
      {(temResultados || carregando) && (
        <DashboardConsolidado
          extracao={extracao}
          sintese={sintese}
          carregando={carregando}
          erro={erro}
          onRecarregar={handleAnalisar}
        />
      )}

      {/* Dica quando não tem dados */}
      {!temDadosParaAnalisar && !carregando && (
        <div className="text-center py-8 text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum dado disponível para análise.</p>
          <p className="text-sm mt-2">Execute entrevistas ou gere um relatório primeiro.</p>
        </div>
      )}
    </div>
  );
}
