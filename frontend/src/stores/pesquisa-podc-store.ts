'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Gestor, Pergunta } from '@/types';

export interface RespostaGestor {
  gestor_id: string;
  gestor_nome: string;
  setor: 'publico' | 'privado';
  nivel_hierarquico: 'estrategico' | 'tatico' | 'operacional';
  respostas: {
    pergunta_id: string;
    pergunta_texto: string;
    resposta: string;
    podc_reflexao?: {
      funcao_mais_relevante?: string;
      distribuicao_ideal?: {
        planejar: number;
        organizar: number;
        dirigir: number;
        controlar: number;
      };
    };
  }[];
  tokens_usados: number;
  custo: number;
  tempo_resposta_ms: number;
}

export interface SessaoPODC {
  id: string;
  titulo: string;
  status: 'em_andamento' | 'pausada' | 'concluida' | 'erro';
  progresso: number;
  totalGestores: number;
  custoAtual: number;
  tokensInput: number;
  tokensOutput: number;
  respostas: RespostaGestor[];
  perguntas: Pergunta[];
  gestoresSelecionados: string[];
  iniciadaEm: string;
  atualizadaEm: string;
  finalizadaEm?: string;
}

interface PesquisaPODCState {
  // Sessao atual
  sessaoAtual: SessaoPODC | null;
  executando: boolean;
  pausado: boolean;
  progresso: number;
  respostasRecebidas: RespostaGestor[];

  // Custos
  custoAtual: number;
  tokensInput: number;
  tokensOutput: number;
  limiteCusto: number;

  // Perguntas configuradas
  perguntas: Pergunta[];
  titulo: string;

  // Gestores selecionados
  gestoresSelecionados: string[];

  // Historico
  sessoes: SessaoPODC[];

  // Erros
  erro: string | null;

  // Acoes - Configuracao
  setTitulo: (titulo: string) => void;
  setPerguntas: (perguntas: Pergunta[]) => void;
  setGestoresSelecionados: (ids: string[]) => void;

  // Acoes - Execucao
  iniciarExecucao: () => void;
  pausarExecucao: () => void;
  retomarExecucao: () => void;
  cancelarExecucao: () => void;
  atualizarProgresso: (progresso: number) => void;
  adicionarResposta: (resposta: RespostaGestor) => void;
  atualizarCusto: (custo: number, tokensIn: number, tokensOut: number) => void;
  finalizarExecucao: () => void;

  // Acoes - Sessoes
  carregarSessoes: (sessoes: SessaoPODC[]) => void;
  selecionarSessao: (sessao: SessaoPODC | null) => void;

  // Reset
  reset: () => void;
  setErro: (erro: string | null) => void;
}

const estadoInicial = {
  sessaoAtual: null,
  executando: false,
  pausado: false,
  progresso: 0,
  respostasRecebidas: [],
  custoAtual: 0,
  tokensInput: 0,
  tokensOutput: 0,
  limiteCusto: 100,
  perguntas: [],
  titulo: '',
  gestoresSelecionados: [],
  sessoes: [],
  erro: null,
};

export const usePesquisaPODCStore = create<PesquisaPODCState>()(
  persist(
    (set, get) => ({
      ...estadoInicial,

      // Configuracao
      setTitulo: (titulo) => set({ titulo }),
      setPerguntas: (perguntas) => set({ perguntas }),
      setGestoresSelecionados: (ids) => set({ gestoresSelecionados: ids }),

      // Execucao
      iniciarExecucao: () => {
        const { titulo, perguntas, gestoresSelecionados } = get();
        const sessaoId = `podc-${Date.now()}`;

        const novaSessao: SessaoPODC = {
          id: sessaoId,
          titulo: titulo || 'Pesquisa PODC',
          status: 'em_andamento',
          progresso: 0,
          totalGestores: gestoresSelecionados.length,
          custoAtual: 0,
          tokensInput: 0,
          tokensOutput: 0,
          respostas: [],
          perguntas,
          gestoresSelecionados,
          iniciadaEm: new Date().toISOString(),
          atualizadaEm: new Date().toISOString(),
        };

        set({
          sessaoAtual: novaSessao,
          executando: true,
          pausado: false,
          progresso: 0,
          respostasRecebidas: [],
          custoAtual: 0,
          tokensInput: 0,
          tokensOutput: 0,
          erro: null,
        });
      },

      pausarExecucao: () => {
        set((state) => ({
          pausado: true,
          sessaoAtual: state.sessaoAtual
            ? { ...state.sessaoAtual, status: 'pausada', atualizadaEm: new Date().toISOString() }
            : null,
        }));
      },

      retomarExecucao: () => {
        set((state) => ({
          pausado: false,
          sessaoAtual: state.sessaoAtual
            ? { ...state.sessaoAtual, status: 'em_andamento', atualizadaEm: new Date().toISOString() }
            : null,
        }));
      },

      cancelarExecucao: () => {
        set((state) => ({
          executando: false,
          pausado: false,
          sessaoAtual: state.sessaoAtual
            ? { ...state.sessaoAtual, status: 'erro', atualizadaEm: new Date().toISOString() }
            : null,
        }));
      },

      atualizarProgresso: (progresso) => {
        set((state) => ({
          progresso,
          sessaoAtual: state.sessaoAtual
            ? { ...state.sessaoAtual, progresso, atualizadaEm: new Date().toISOString() }
            : null,
        }));
      },

      adicionarResposta: (resposta) => {
        set((state) => ({
          respostasRecebidas: [...state.respostasRecebidas, resposta],
          sessaoAtual: state.sessaoAtual
            ? {
                ...state.sessaoAtual,
                respostas: [...state.sessaoAtual.respostas, resposta],
                atualizadaEm: new Date().toISOString(),
              }
            : null,
        }));
      },

      atualizarCusto: (custo, tokensIn, tokensOut) => {
        set((state) => ({
          custoAtual: state.custoAtual + custo,
          tokensInput: state.tokensInput + tokensIn,
          tokensOutput: state.tokensOutput + tokensOut,
          sessaoAtual: state.sessaoAtual
            ? {
                ...state.sessaoAtual,
                custoAtual: state.sessaoAtual.custoAtual + custo,
                tokensInput: state.sessaoAtual.tokensInput + tokensIn,
                tokensOutput: state.sessaoAtual.tokensOutput + tokensOut,
                atualizadaEm: new Date().toISOString(),
              }
            : null,
        }));
      },

      finalizarExecucao: () => {
        set((state) => ({
          executando: false,
          sessaoAtual: state.sessaoAtual
            ? {
                ...state.sessaoAtual,
                status: 'concluida',
                finalizadaEm: new Date().toISOString(),
                atualizadaEm: new Date().toISOString(),
              }
            : null,
        }));
      },

      // Sessoes
      carregarSessoes: (sessoes) => set({ sessoes }),
      selecionarSessao: (sessao) => set({ sessaoAtual: sessao }),

      // Reset
      reset: () => set(estadoInicial),
      setErro: (erro) => set({ erro }),
    }),
    {
      name: 'pesquisa-podc-store',
      partialize: (state) => ({
        perguntas: state.perguntas,
        titulo: state.titulo,
        gestoresSelecionados: state.gestoresSelecionados,
        limiteCusto: state.limiteCusto,
        sessaoAtual: state.sessaoAtual,
        respostasRecebidas: state.respostasRecebidas,
        executando: state.executando,
        pausado: state.pausado,
        progresso: state.progresso,
        custoAtual: state.custoAtual,
        tokensInput: state.tokensInput,
        tokensOutput: state.tokensOutput,
        sessoes: state.sessoes,
      }),
    }
  )
);
