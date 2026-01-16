'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Entrevista, Pergunta, RespostaEleitor } from '@/types';
import type { SessaoEntrevista } from '@/lib/db/dexie';
import {
  criarPesquisa,
  registrarResposta,
  iniciarPesquisa,
  pausarPesquisa,
  finalizarPesquisa,
  atualizarProgresso,
  PesquisaCreate,
  RespostaCreate,
} from '@/services/pesquisas-api';

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

  // Persistência no backend
  pesquisaIdBackend: string | null;
  perguntasIdMap: Record<string, string>; // mapa local -> backend
  salvandoNoBackend: boolean;

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

  // Ações - Persistência no Backend
  criarPesquisaNoBackend: (eleitoresIds: string[]) => Promise<string | null>;
  salvarRespostaNoBackend: (resposta: RespostaEleitor, perguntaIdLocal: string, eleitorPerfil?: Record<string, unknown>) => Promise<boolean>;
  sincronizarProgressoBackend: () => Promise<void>;
  finalizarPesquisaNoBackend: (erro?: string) => Promise<boolean>;
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
      pesquisaIdBackend: null,
      perguntasIdMap: {},
      salvandoNoBackend: false,

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
            : { titulo, tipo: 'mista', perguntas: [], status: 'rascunho', criado_em: new Date().toISOString() },
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

      // Persistência no Backend
      criarPesquisaNoBackend: async (eleitoresIds) => {
        const { entrevistaAtual, perguntas, limiteCusto } = get();

        if (!entrevistaAtual?.titulo || perguntas.length === 0) {
          console.error('Entrevista sem título ou perguntas');
          return null;
        }

        try {
          set({ salvandoNoBackend: true });

          const dadosPesquisa: PesquisaCreate = {
            titulo: entrevistaAtual.titulo,
            descricao: entrevistaAtual.descricao,
            tipo: (entrevistaAtual.tipo as 'quantitativa' | 'qualitativa' | 'mista') || 'mista',
            perguntas: perguntas.map((p, index) => ({
              texto: p.texto,
              tipo: p.tipo as 'aberta' | 'aberta_longa' | 'escala_likert' | 'multipla_escolha' | 'sim_nao' | 'ranking',
              ordem: index,
              obrigatoria: p.obrigatoria ?? true,
              opcoes: p.opcoes,
              escala_min: p.escala_min,
              escala_max: p.escala_max,
            })),
            eleitores_ids: eleitoresIds,
            limite_custo: limiteCusto,
            usar_opus_complexas: true,
            batch_size: 10,
          };

          const pesquisa = await criarPesquisa(dadosPesquisa);

          // Criar mapa de IDs de perguntas (local -> backend)
          const perguntasIdMap: Record<string, string> = {};
          pesquisa.perguntas.forEach((pBackend, index) => {
            if (perguntas[index]) {
              perguntasIdMap[perguntas[index].id] = pBackend.id!;
            }
          });

          // Marcar pesquisa como iniciada
          await iniciarPesquisa(pesquisa.id);

          set({
            pesquisaIdBackend: pesquisa.id,
            perguntasIdMap,
            salvandoNoBackend: false,
          });

          console.log('Pesquisa criada no backend:', pesquisa.id);
          return pesquisa.id;
        } catch (error) {
          console.error('Erro ao criar pesquisa no backend:', error);
          set({ salvandoNoBackend: false });
          return null;
        }
      },

      salvarRespostaNoBackend: async (resposta, perguntaIdLocal, eleitorPerfil) => {
        const { pesquisaIdBackend, perguntasIdMap } = get();

        if (!pesquisaIdBackend) {
          console.warn('Sem pesquisa no backend para salvar resposta');
          return false;
        }

        const perguntaIdBackend = perguntasIdMap[perguntaIdLocal];
        if (!perguntaIdBackend) {
          console.warn('Pergunta não encontrada no mapa:', perguntaIdLocal);
          return false;
        }

        try {
          const dadosResposta: RespostaCreate = {
            pesquisa_id: pesquisaIdBackend,
            pergunta_id: perguntaIdBackend,
            eleitor_id: resposta.eleitor_id,
            eleitor_nome: resposta.eleitor_nome,
            eleitor_perfil: eleitorPerfil,
            resposta_texto: resposta.resposta_texto,
            resposta_valor: resposta.resposta_valor,
            fluxo_cognitivo: resposta.fluxo_cognitivo as Record<string, unknown>,
            sentimento: resposta.fluxo_cognitivo?.emocional?.sentimento_dominante,
            intensidade_sentimento: resposta.fluxo_cognitivo?.emocional?.intensidade,
            modelo_usado: resposta.modelo_usado || 'claude-sonnet-4-20250514',
            tokens_entrada: resposta.tokens_entrada || 0,
            tokens_saida: resposta.tokens_saida || 0,
            custo_reais: resposta.custo_reais || 0,
            tempo_resposta_ms: resposta.tempo_resposta_ms || 0,
          };

          await registrarResposta(pesquisaIdBackend, dadosResposta);
          return true;
        } catch (error) {
          console.error('Erro ao salvar resposta no backend:', error);
          return false;
        }
      },

      sincronizarProgressoBackend: async () => {
        const { pesquisaIdBackend, progresso, respostasRecebidas, sessaoAtual } = get();

        if (!pesquisaIdBackend) return;

        try {
          const eleitoresProcessados = sessaoAtual
            ? Math.floor((progresso / 100) * sessaoAtual.totalAgentes)
            : respostasRecebidas.length;

          await atualizarProgresso(pesquisaIdBackend, progresso, eleitoresProcessados);
        } catch (error) {
          console.error('Erro ao sincronizar progresso:', error);
        }
      },

      finalizarPesquisaNoBackend: async (erro) => {
        const { pesquisaIdBackend } = get();

        if (!pesquisaIdBackend) return false;

        try {
          await finalizarPesquisa(pesquisaIdBackend, erro);
          set({
            pesquisaIdBackend: null,
            perguntasIdMap: {},
          });
          return true;
        } catch (error) {
          console.error('Erro ao finalizar pesquisa no backend:', error);
          return false;
        }
      },
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
