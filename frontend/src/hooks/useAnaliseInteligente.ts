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

  // Ações
  extrairDados: (respostas: RespostaParaAnalise[], contexto: { tipoPesquisa: string; objetivo: string }) => Promise<void>;
  sintetizarRelatorio: (relatorio: string, metadados: { titulo: string; dataGeracao: string; totalEntrevistas: number }) => Promise<void>;
  analisarCompleto: (
    respostas: RespostaParaAnalise[],
    relatorio: string,
    contexto: { tipoPesquisa: string; objetivo: string; titulo: string; dataGeracao: string }
  ) => Promise<void>;
  limpar: () => void;
}

export function useAnaliseInteligente(): UseAnaliseInteligenteReturn {
  const [extracao, setExtracao] = useState<ResultadoExtracaoIA | null>(null);
  const [sintese, setSintese] = useState<ResultadoSinteseIA | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const extrairDados = useCallback(async (
    respostas: RespostaParaAnalise[],
    contexto: { tipoPesquisa: string; objetivo: string }
  ) => {
    setCarregando(true);
    setErro(null);

    try {
      const response = await fetch('/api/claude/extrair-dados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respostas,
          contexto,
          usarIA: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.erro || 'Erro na extração de dados');
      }

      const data = await response.json();
      if (data.sucesso && data.resultado) {
        setExtracao(data.resultado);
      } else {
        throw new Error('Resposta inválida da API de extração');
      }
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro desconhecido na extração';
      setErro(mensagem);
      console.error('Erro na extração:', err);
    } finally {
      setCarregando(false);
    }
  }, []);

  const sintetizarRelatorio = useCallback(async (
    relatorio: string,
    metadados: { titulo: string; dataGeracao: string; totalEntrevistas: number }
  ) => {
    setCarregando(true);
    setErro(null);

    try {
      const response = await fetch('/api/claude/sintetizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relatorio,
          metadados,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.erro || 'Erro na síntese do relatório');
      }

      const data = await response.json();
      if (data.sucesso && data.resultado) {
        setSintese(data.resultado);
      } else {
        throw new Error('Resposta inválida da API de síntese');
      }
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro desconhecido na síntese';
      setErro(mensagem);
      console.error('Erro na síntese:', err);
    } finally {
      setCarregando(false);
    }
  }, []);

  const analisarCompleto = useCallback(async (
    respostas: RespostaParaAnalise[],
    relatorio: string,
    contexto: { tipoPesquisa: string; objetivo: string; titulo: string; dataGeracao: string }
  ) => {
    setCarregando(true);
    setErro(null);

    try {
      // Executar extração e síntese em paralelo
      const [extracaoResponse, sinteseResponse] = await Promise.all([
        fetch('/api/claude/extrair-dados', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            respostas,
            contexto: {
              tipoPesquisa: contexto.tipoPesquisa,
              objetivo: contexto.objetivo,
            },
            usarIA: true,
          }),
        }),
        fetch('/api/claude/sintetizar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            relatorio,
            metadados: {
              titulo: contexto.titulo,
              dataGeracao: contexto.dataGeracao,
              totalEntrevistas: respostas.length,
            },
          }),
        }),
      ]);

      // Processar extração
      if (extracaoResponse.ok) {
        const extracaoData = await extracaoResponse.json();
        if (extracaoData.sucesso && extracaoData.resultado) {
          setExtracao(extracaoData.resultado);
        }
      }

      // Processar síntese
      if (sinteseResponse.ok) {
        const sinteseData = await sinteseResponse.json();
        if (sinteseData.sucesso && sinteseData.resultado) {
          setSintese(sinteseData.resultado);
        }
      }

      // Verificar erros
      if (!extracaoResponse.ok && !sinteseResponse.ok) {
        throw new Error('Ambas as análises falharam');
      }
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro desconhecido na análise';
      setErro(mensagem);
      console.error('Erro na análise completa:', err);
    } finally {
      setCarregando(false);
    }
  }, []);

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

export default useAnaliseInteligente;
