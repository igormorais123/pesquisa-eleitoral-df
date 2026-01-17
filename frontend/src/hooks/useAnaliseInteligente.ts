'use client';

import { useState, useCallback } from 'react';
import type { ResultadoExtracaoIA, ResultadoSinteseIA } from '@/lib/extrator-inteligente';

interface RespostaParaAnalise {
  texto: string;
  pergunta: string;
  eleitor?: {
    regiao?: string;
    orientacao?: string;
    cluster?: string;
  };
}

interface UseAnaliseInteligenteReturn {
  // Estados
  extracao: ResultadoExtracaoIA | null;
  sintese: ResultadoSinteseIA | null;
  carregando: boolean;
  erro: string | null;

  // Métodos
  extrairDados: (respostas: RespostaParaAnalise[], usarIA?: boolean) => Promise<ResultadoExtracaoIA | null>;
  sintetizarRelatorio: (relatorio: string, metadados?: { titulo?: string; dataGeracao?: string; totalEntrevistas?: number }) => Promise<ResultadoSinteseIA | null>;
  analisarCompleto: (respostas: RespostaParaAnalise[], relatorio?: string) => Promise<void>;
  limpar: () => void;
}

export function useAnaliseInteligente(): UseAnaliseInteligenteReturn {
  const [extracao, setExtracao] = useState<ResultadoExtracaoIA | null>(null);
  const [sintese, setSintese] = useState<ResultadoSinteseIA | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const extrairDados = useCallback(async (
    respostas: RespostaParaAnalise[],
    usarIA: boolean = true
  ): Promise<ResultadoExtracaoIA | null> => {
    setCarregando(true);
    setErro(null);

    try {
      const response = await fetch('/api/claude/extrair-dados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respostas, usarIA }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || 'Erro na extração de dados');
      }

      setExtracao(data.resultado);
      return data.resultado;
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
      setErro(mensagem);
      return null;
    } finally {
      setCarregando(false);
    }
  }, []);

  const sintetizarRelatorio = useCallback(async (
    relatorio: string,
    metadados?: { titulo?: string; dataGeracao?: string; totalEntrevistas?: number }
  ): Promise<ResultadoSinteseIA | null> => {
    setCarregando(true);
    setErro(null);

    try {
      const response = await fetch('/api/claude/sintetizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relatorio, metadados }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || 'Erro na síntese');
      }

      setSintese(data.resultado);
      return data.resultado;
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
      setErro(mensagem);
      return null;
    } finally {
      setCarregando(false);
    }
  }, []);

  const analisarCompleto = useCallback(async (
    respostas: RespostaParaAnalise[],
    relatorio?: string
  ): Promise<void> => {
    setCarregando(true);
    setErro(null);

    try {
      // Extrai dados das respostas
      const resultadoExtracao = await extrairDados(respostas, true);

      // Se tem relatório, sintetiza também
      if (relatorio && relatorio.length > 100) {
        await sintetizarRelatorio(relatorio, {
          totalEntrevistas: respostas.length,
        });
      }
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro na análise completa';
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }, [extrairDados, sintetizarRelatorio]);

  const limpar = useCallback(() => {
    setExtracao(null);
    setSintese(null);
    setErro(null);
  }, []);

  return {
    extracao,
    sintese,
    carregando,
    erro,
    extrairDados,
    sintetizarRelatorio,
    analisarCompleto,
    limpar,
  };
}
