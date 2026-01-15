'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Entrevista, Pergunta, RespostaEleitor } from '@/types';
import type { SessaoEntrevista } from '@/lib/db/dexie';

interface EntrevistasState {
  // Entrevista atual
  entrevistaAtual: Partial<Entrevista> | null;
  perguntas: Pergunta[];

  // Execução
  sessaoAtual: SessaoEntrevista | null;
  executando: boolean;
  pausado: boolean;
  progresso: number;
  respostasRecebidas: RespostaEleitor[];

  // Custos
  custoAtual: number;
  tokensInput: number;
  tokensOutput: number;
  limiteCusto: number;

  // Histórico
  sessoes: SessaoEntrevista[];

  // Erros
  erro: string | null;

  // Ações - Configuração
  novaEntrevista: () => void;
  setTitulo: (titulo: string) => void;
  setDescricao: (descricao: string) => void;
  adicionarPergunta: (pergunta: Omit<Pergunta, 'id'>) => void;
  removerPergunta: (id: string) => void;
  atualizarPergunta: (id: string, dados: Partial<Pergunta>) => void;
  reordenarPerguntas: (ids: string[]) => void;
  setPerguntas: (perguntas: Pergunta[]) => void;

  // Ações - Execução
  iniciarExecucao: (entrevistaId: string, eleitoresIds: string[]) => void;
  pausarExecucao: () => void;
  retormarExecucao: () => void;
  cancelarExecucao: () => void;
  atualizarProgresso: (progresso: number) => void;
  adicionarResposta: (resposta: RespostaEleitor) => void;
  atualizarCusto: (custo: number, tokensIn: number, tokensOut: number) => void;
  finalizarExecucao: () => void;

  // Ações - Sessões
  carregarSessoes: (sessoes: SessaoEntrevista[]) => void;
  selecionarSessao: (sessao: SessaoEntrevista | null) => void;

  // Erros
  setErro: (erro: string | null) => void;
}

export const useEntrevistasStore = create<EntrevistasState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      entrevistaAtual: null,
      perguntas: [],
      sessaoAtual: null,
      executando: false,
      pausado: false,
      progresso: 0,
      respostasRecebidas: [],
      custoAtual: 0,
      tokensInput: 0,
      tokensOutput: 0,
      limiteCusto: 100, // R$ 100 por padrão
      sessoes: [],
      erro: null,

      // Configuração
      novaEntrevista: () => {
        set({
          entrevistaAtual: {
            titulo: '',
            descricao: '',
            tipo: 'mista',
            perguntas: [],
            status: 'rascunho',
            criado_em: new Date().toISOString(),
          },
          perguntas: [],
          erro: null,
        });
      },

      setTitulo: (titulo) => {
        set((state) => ({
          entrevistaAtual: state.entrevistaAtual
            ? { ...state.entrevistaAtual, titulo }
            : null,
        }));
      },

      setDescricao: (descricao) => {
        set((state) => ({
          entrevistaAtual: state.entrevistaAtual
            ? { ...state.entrevistaAtual, descricao }
            : null,
        }));
      },

      adicionarPergunta: (pergunta) => {
        const id = `p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        set((state) => ({
          perguntas: [...state.perguntas, { ...pergunta, id }],
        }));
      },

      removerPergunta: (id) => {
        set((state) => ({
          perguntas: state.perguntas.filter((p) => p.id !== id),
        }));
      },

      atualizarPergunta: (id, dados) => {
        set((state) => ({
          perguntas: state.perguntas.map((p) =>
            p.id === id ? { ...p, ...dados } : p
          ),
        }));
      },

      reordenarPerguntas: (ids) => {
        const { perguntas } = get();
        const perguntasReordenadas = ids
          .map((id) => perguntas.find((p) => p.id === id))
          .filter(Boolean) as Pergunta[];
        set({ perguntas: perguntasReordenadas });
      },

      setPerguntas: (perguntas) => {
        set({ perguntas });
      },

      // Execução
      iniciarExecucao: (entrevistaId, eleitoresIds) => {
        const sessaoId = `s-${Date.now()}`;
        const { entrevistaAtual, perguntas } = get();

        const novaSessao: SessaoEntrevista = {
          id: sessaoId,
          entrevistaId,
          titulo: entrevistaAtual?.titulo || 'Sem título',
          status: 'em_andamento',
          progresso: 0,
          totalAgentes: eleitoresIds.length,
          custoAtual: 0,
          tokensInput: 0,
          tokensOutput: 0,
          respostas: [],
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

      retormarExecucao: () => {
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

      // Sessões
      carregarSessoes: (sessoes) => set({ sessoes }),

      selecionarSessao: (sessao) => set({ sessaoAtual: sessao }),

      // Erros
      setErro: (erro) => set({ erro }),
    }),
    {
      name: 'entrevistas-store',
      partialize: (state) => ({
        entrevistaAtual: state.entrevistaAtual,
        perguntas: state.perguntas,
        limiteCusto: state.limiteCusto,
      }),
    }
  )
);
