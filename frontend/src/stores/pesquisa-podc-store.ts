'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Gestor, Pergunta } from '@/types';

// Interface para distribuição PODC
export interface DistribuicaoPODC {
  planejar: number;
  organizar: number;
  dirigir: number;
  controlar: number;
}

// Interface para resposta estruturada do gestor (estatística)
export interface RespostaPODCEstruturada {
  gestor_id: string;
  gestor_nome: string;
  setor: 'publico' | 'privado';
  nivel_hierarquico: 'estrategico' | 'tatico' | 'operacional';
  cargo?: string;
  instituicao?: string;
  // Distribuição PODC (deve somar 100%)
  distribuicao_podc: DistribuicaoPODC;
  distribuicao_ideal?: DistribuicaoPODC;
  // Horas semanais
  horas_semanais?: {
    total: number;
    planejar: number;
    organizar: number;
    dirigir: number;
    controlar: number;
  };
  // IAD - Índice de Autonomia Decisória
  iad: number;
  iad_classificacao: string;
  // Outros dados
  ranking_importancia?: string[];
  fatores_limitantes?: string[];
  justificativa?: string;
  frequencia_atividades?: Record<string, Record<string, number>>;
  respostas_perguntas?: Array<{ pergunta_id: string; resposta: string | number }>;
  // Métricas
  tokens_input: number;
  tokens_output: number;
  custo_reais: number;
  resposta_bruta?: string;
}

// Interface legada para compatibilidade
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
  // Novos campos estruturados
  distribuicao_podc?: DistribuicaoPODC;
  iad?: number;
  iad_classificacao?: string;
}

export interface SessaoPODC {
  id: string;
  pesquisaIdBackend?: string; // ID da pesquisa no backend (persistência)
  titulo: string;
  status: 'pendente' | 'em_andamento' | 'pausada' | 'concluida' | 'erro';
  progresso: number;
  totalGestores: number;
  custoAtual: number;
  tokensInput: number;
  tokensOutput: number;
  respostas: RespostaGestor[];
  respostasEstruturadas: RespostaPODCEstruturada[]; // Respostas para análise estatística
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
  respostasEstruturadas: RespostaPODCEstruturada[];

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

  // Pesquisas do backend
  pesquisasBackend: Array<{
    id: string;
    titulo: string;
    status: string;
    total_gestores: number;
    total_respostas: number;
    custo_total: number;
    criado_em: string;
  }>;

  // Erros
  erro: string | null;
  carregandoBackend: boolean;

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
  adicionarRespostaEstruturada: (resposta: RespostaPODCEstruturada) => void;
  atualizarCusto: (custo: number, tokensIn: number, tokensOut: number) => void;
  finalizarExecucao: () => void;

  // Acoes - Backend
  criarPesquisaBackend: (token: string) => Promise<string | null>;
  carregarPesquisasBackend: (token: string) => Promise<void>;
  carregarRespostasPesquisa: (pesquisaId: string, token: string) => Promise<void>;
  setPesquisaIdBackend: (id: string) => void;

  // Acoes - Sessoes
  carregarSessoes: (sessoes: SessaoPODC[]) => void;
  selecionarSessao: (sessao: SessaoPODC | null) => void;

  // Reset
  reset: () => void;
  setErro: (erro: string | null) => void;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

const estadoInicial = {
  sessaoAtual: null,
  executando: false,
  pausado: false,
  progresso: 0,
  respostasRecebidas: [] as RespostaGestor[],
  respostasEstruturadas: [] as RespostaPODCEstruturada[],
  custoAtual: 0,
  tokensInput: 0,
  tokensOutput: 0,
  limiteCusto: 100,
  perguntas: [] as Pergunta[],
  titulo: '',
  gestoresSelecionados: [] as string[],
  sessoes: [] as SessaoPODC[],
  pesquisasBackend: [] as Array<{
    id: string;
    titulo: string;
    status: string;
    total_gestores: number;
    total_respostas: number;
    custo_total: number;
    criado_em: string;
  }>,
  erro: null as string | null,
  carregandoBackend: false,
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
        const { titulo, perguntas, gestoresSelecionados, sessaoAtual } = get();
        const sessaoId = `podc-${Date.now()}`;

        const novaSessao: SessaoPODC = {
          id: sessaoId,
          pesquisaIdBackend: sessaoAtual?.pesquisaIdBackend, // Preservar ID do backend se existir
          titulo: titulo || 'Pesquisa PODC',
          status: 'em_andamento',
          progresso: 0,
          totalGestores: gestoresSelecionados.length,
          custoAtual: 0,
          tokensInput: 0,
          tokensOutput: 0,
          respostas: [],
          respostasEstruturadas: [],
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
          respostasEstruturadas: [],
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

      // Adicionar resposta estruturada (para análise estatística)
      adicionarRespostaEstruturada: (resposta) => {
        set((state) => ({
          respostasEstruturadas: [...state.respostasEstruturadas, resposta],
          sessaoAtual: state.sessaoAtual
            ? {
                ...state.sessaoAtual,
                respostasEstruturadas: [...state.sessaoAtual.respostasEstruturadas, resposta],
                atualizadaEm: new Date().toISOString(),
              }
            : null,
        }));
      },

      // Backend - Criar pesquisa
      criarPesquisaBackend: async (token: string) => {
        const { titulo, gestoresSelecionados, perguntas } = get();

        try {
          set({ carregandoBackend: true, erro: null });

          const response = await fetch(`${BACKEND_URL}/api/v1/pesquisas-podc`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              titulo: titulo || 'Pesquisa PODC',
              descricao: `Pesquisa com ${gestoresSelecionados.length} gestores`,
              perguntas: perguntas.map((p, i) => ({
                id: p.id || `p${i + 1}`,
                texto: p.texto,
                tipo: p.tipo || 'escala',
                obrigatoria: true,
              })),
              gestores_ids: gestoresSelecionados,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Erro ao criar pesquisa no backend');
          }

          const data = await response.json();
          const pesquisaId = data.id;

          // Atualizar sessão com ID do backend
          set((state) => ({
            carregandoBackend: false,
            sessaoAtual: state.sessaoAtual
              ? { ...state.sessaoAtual, pesquisaIdBackend: pesquisaId }
              : null,
          }));

          return pesquisaId;
        } catch (error) {
          console.error('Erro ao criar pesquisa no backend:', error);
          set({
            carregandoBackend: false,
            erro: error instanceof Error ? error.message : 'Erro ao criar pesquisa',
          });
          return null;
        }
      },

      // Backend - Carregar pesquisas existentes
      carregarPesquisasBackend: async (token: string) => {
        try {
          set({ carregandoBackend: true, erro: null });

          const response = await fetch(`${BACKEND_URL}/api/v1/pesquisas-podc`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Erro ao carregar pesquisas do backend');
          }

          const data = await response.json();

          set({
            carregandoBackend: false,
            pesquisasBackend: data.pesquisas || [],
          });
        } catch (error) {
          console.error('Erro ao carregar pesquisas:', error);
          set({
            carregandoBackend: false,
            erro: error instanceof Error ? error.message : 'Erro ao carregar pesquisas',
          });
        }
      },

      // Backend - Carregar respostas de uma pesquisa
      carregarRespostasPesquisa: async (pesquisaId: string, token: string) => {
        try {
          set({ carregandoBackend: true, erro: null });

          const response = await fetch(
            `${BACKEND_URL}/api/v1/pesquisas-podc/${pesquisaId}/respostas`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error('Erro ao carregar respostas');
          }

          const data = await response.json();

          // Converter respostas do backend para formato do store
          const respostasEstruturadas: RespostaPODCEstruturada[] = (data.respostas || []).map(
            (r: Record<string, unknown>) => ({
              gestor_id: r.gestor_id as string,
              gestor_nome: r.gestor_nome as string,
              setor: r.gestor_setor as 'publico' | 'privado',
              nivel_hierarquico: r.gestor_nivel as 'estrategico' | 'tatico' | 'operacional',
              cargo: r.gestor_cargo as string | undefined,
              instituicao: r.gestor_instituicao as string | undefined,
              distribuicao_podc: {
                planejar: (r.podc_planejar as number) || 25,
                organizar: (r.podc_organizar as number) || 25,
                dirigir: (r.podc_dirigir as number) || 25,
                controlar: (r.podc_controlar as number) || 25,
              },
              distribuicao_ideal: r.podc_ideal_planejar
                ? {
                    planejar: (r.podc_ideal_planejar as number) || 25,
                    organizar: (r.podc_ideal_organizar as number) || 25,
                    dirigir: (r.podc_ideal_dirigir as number) || 25,
                    controlar: (r.podc_ideal_controlar as number) || 25,
                  }
                : undefined,
              iad: (r.iad as number) || 1,
              iad_classificacao: (r.iad_classificacao as string) || 'Equilibrado',
              ranking_importancia: r.ranking_importancia as string[] | undefined,
              fatores_limitantes: r.fatores_limitantes as string[] | undefined,
              justificativa: r.justificativa as string | undefined,
              tokens_input: (r.tokens_input as number) || 0,
              tokens_output: (r.tokens_output as number) || 0,
              custo_reais: (r.custo_reais as number) || 0,
            })
          );

          set({
            carregandoBackend: false,
            respostasEstruturadas,
          });
        } catch (error) {
          console.error('Erro ao carregar respostas:', error);
          set({
            carregandoBackend: false,
            erro: error instanceof Error ? error.message : 'Erro ao carregar respostas',
          });
        }
      },

      // Definir ID da pesquisa no backend
      setPesquisaIdBackend: (id: string) => {
        set((state) => ({
          sessaoAtual: state.sessaoAtual
            ? { ...state.sessaoAtual, pesquisaIdBackend: id }
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
