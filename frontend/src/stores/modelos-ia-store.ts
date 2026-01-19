import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tipos de provedores de IA
export type ProvedorIA = 'anthropic' | 'openai' | 'google' | 'deepseek' | 'ollama';

// Interface para um modelo de IA
export interface ModeloIA {
  id: string;
  nome: string;
  provedor: ProvedorIA;
  versao: string;
  descricao: string;
  precoInput: number; // por milhão de tokens
  precoOutput: number; // por milhão de tokens
  contextoMaximo: number; // tokens
  gratuito: boolean;
  urlApi: string;
  urlDocs: string;
  caracteristicas: string[];
}

// Catálogo de modelos de IA disponíveis (preços em USD por milhão de tokens)
export const CATALOGO_MODELOS: ModeloIA[] = [
  // ========== ANTHROPIC CLAUDE ==========
  {
    id: 'claude-opus-4.5',
    nome: 'Claude Opus 4.5',
    provedor: 'anthropic',
    versao: '4.5',
    descricao: 'Modelo mais inteligente da Anthropic - raciocínio complexo e análise profunda',
    precoInput: 5.00,
    precoOutput: 25.00,
    contextoMaximo: 200000,
    gratuito: false,
    urlApi: 'https://console.anthropic.com/account/keys',
    urlDocs: 'https://docs.anthropic.com/claude/reference',
    caracteristicas: ['Raciocínio avançado', 'Análise complexa', 'Visão', 'Código'],
  },
  {
    id: 'claude-sonnet-4.5',
    nome: 'Claude Sonnet 4.5',
    provedor: 'anthropic',
    versao: '4.5',
    descricao: 'Modelo equilibrado - ótima relação custo/benefício para a maioria das tarefas',
    precoInput: 3.00,
    precoOutput: 15.00,
    contextoMaximo: 200000,
    gratuito: false,
    urlApi: 'https://console.anthropic.com/account/keys',
    urlDocs: 'https://docs.anthropic.com/claude/reference',
    caracteristicas: ['Equilibrado', 'Versátil', 'Visão', 'Código'],
  },
  {
    id: 'claude-haiku-4.5',
    nome: 'Claude Haiku 4.5',
    provedor: 'anthropic',
    versao: '4.5',
    descricao: 'Modelo rápido e econômico - ideal para tarefas simples e alto volume',
    precoInput: 1.00,
    precoOutput: 5.00,
    contextoMaximo: 200000,
    gratuito: false,
    urlApi: 'https://console.anthropic.com/account/keys',
    urlDocs: 'https://docs.anthropic.com/claude/reference',
    caracteristicas: ['Rápido', 'Econômico', 'Visão', 'Código'],
  },
  {
    id: 'claude-haiku-3',
    nome: 'Claude Haiku 3',
    provedor: 'anthropic',
    versao: '3.0',
    descricao: 'Versão anterior mais barata - boa para tarefas básicas',
    precoInput: 0.25,
    precoOutput: 1.25,
    contextoMaximo: 200000,
    gratuito: false,
    urlApi: 'https://console.anthropic.com/account/keys',
    urlDocs: 'https://docs.anthropic.com/claude/reference',
    caracteristicas: ['Ultra econômico', 'Rápido', 'Tarefas básicas'],
  },

  // ========== OPENAI GPT ==========
  {
    id: 'gpt-4o',
    nome: 'GPT-4o',
    provedor: 'openai',
    versao: '4o',
    descricao: 'Modelo principal da OpenAI - multimodal com visão, áudio e texto',
    precoInput: 2.50,
    precoOutput: 10.00,
    contextoMaximo: 128000,
    gratuito: false,
    urlApi: 'https://platform.openai.com/api-keys',
    urlDocs: 'https://platform.openai.com/docs/api-reference',
    caracteristicas: ['Multimodal', 'Visão', 'Áudio', 'Alta qualidade'],
  },
  {
    id: 'gpt-4o-mini',
    nome: 'GPT-4o Mini',
    provedor: 'openai',
    versao: '4o-mini',
    descricao: 'Versão econômica do GPT-4o - 93% mais barato com boa qualidade',
    precoInput: 0.15,
    precoOutput: 0.60,
    contextoMaximo: 128000,
    gratuito: false,
    urlApi: 'https://platform.openai.com/api-keys',
    urlDocs: 'https://platform.openai.com/docs/api-reference',
    caracteristicas: ['Econômico', 'Multimodal', 'Visão', 'Rápido'],
  },
  {
    id: 'gpt-4.1',
    nome: 'GPT-4.1',
    provedor: 'openai',
    versao: '4.1',
    descricao: 'Modelo mais recente com contexto de 1M tokens',
    precoInput: 2.00,
    precoOutput: 8.00,
    contextoMaximo: 1000000,
    gratuito: false,
    urlApi: 'https://platform.openai.com/api-keys',
    urlDocs: 'https://platform.openai.com/docs/api-reference',
    caracteristicas: ['Contexto 1M', 'Código', 'Raciocínio'],
  },

  // ========== GOOGLE GEMINI ==========
  {
    id: 'gemini-2.5-pro',
    nome: 'Gemini 2.5 Pro',
    provedor: 'google',
    versao: '2.5',
    descricao: 'Modelo flagship do Google - excelente para código e raciocínio',
    precoInput: 1.25,
    precoOutput: 5.00,
    contextoMaximo: 1000000,
    gratuito: false,
    urlApi: 'https://aistudio.google.com/app/apikey',
    urlDocs: 'https://ai.google.dev/docs',
    caracteristicas: ['Contexto 1M', 'Código', 'Multimodal', 'Grounding'],
  },
  {
    id: 'gemini-2.5-flash',
    nome: 'Gemini 2.5 Flash',
    provedor: 'google',
    versao: '2.5-flash',
    descricao: 'Versão rápida e econômica do Gemini',
    precoInput: 0.075,
    precoOutput: 0.30,
    contextoMaximo: 1000000,
    gratuito: false,
    urlApi: 'https://aistudio.google.com/app/apikey',
    urlDocs: 'https://ai.google.dev/docs',
    caracteristicas: ['Ultra rápido', 'Econômico', 'Contexto 1M'],
  },
  {
    id: 'gemini-2.5-flash-lite',
    nome: 'Gemini 2.5 Flash-Lite',
    provedor: 'google',
    versao: '2.5-flash-lite',
    descricao: 'Versão mais econômica do Gemini - ideal para alto volume',
    precoInput: 0.10,
    precoOutput: 0.40,
    contextoMaximo: 1000000,
    gratuito: false,
    urlApi: 'https://aistudio.google.com/app/apikey',
    urlDocs: 'https://ai.google.dev/docs',
    caracteristicas: ['Mais barato', 'Alto volume', 'Rápido'],
  },

  // ========== DEEPSEEK ==========
  {
    id: 'deepseek-v3.2',
    nome: 'DeepSeek V3.2',
    provedor: 'deepseek',
    versao: '3.2',
    descricao: 'Modelo chinês de alta qualidade - 95% mais barato que GPT-4',
    precoInput: 0.28,
    precoOutput: 0.42,
    contextoMaximo: 128000,
    gratuito: false,
    urlApi: 'https://platform.deepseek.com/api_keys',
    urlDocs: 'https://api-docs.deepseek.com',
    caracteristicas: ['Ultra econômico', 'Alta qualidade', 'Código', 'Raciocínio'],
  },
  {
    id: 'deepseek-r1',
    nome: 'DeepSeek R1 Reasoner',
    provedor: 'deepseek',
    versao: 'r1',
    descricao: 'Modelo de raciocínio - equivalente ao o1 por fração do preço',
    precoInput: 0.28,
    precoOutput: 0.42,
    contextoMaximo: 128000,
    gratuito: false,
    urlApi: 'https://platform.deepseek.com/api_keys',
    urlDocs: 'https://api-docs.deepseek.com',
    caracteristicas: ['Raciocínio avançado', 'Chain-of-Thought', 'Ultra econômico'],
  },
  {
    id: 'deepseek-r1-distill-70b',
    nome: 'DeepSeek R1 Distill 70B',
    provedor: 'deepseek',
    versao: 'r1-distill',
    descricao: 'Versão destilada do R1 - o mais barato do mercado',
    precoInput: 0.03,
    precoOutput: 0.14,
    contextoMaximo: 128000,
    gratuito: false,
    urlApi: 'https://platform.deepseek.com/api_keys',
    urlDocs: 'https://api-docs.deepseek.com',
    caracteristicas: ['O mais barato', 'Raciocínio', 'Econômico'],
  },

  // ========== OLLAMA (LOCAL/GRATUITO) ==========
  {
    id: 'ollama-llama3.2',
    nome: 'Llama 3.2 (Ollama)',
    provedor: 'ollama',
    versao: '3.2',
    descricao: 'Modelo da Meta rodando localmente - 100% gratuito',
    precoInput: 0,
    precoOutput: 0,
    contextoMaximo: 128000,
    gratuito: true,
    urlApi: 'https://ollama.ai/download',
    urlDocs: 'https://ollama.ai/library/llama3.2',
    caracteristicas: ['Gratuito', 'Local', 'Privacidade', 'Código aberto'],
  },
  {
    id: 'ollama-mistral',
    nome: 'Mistral 7B (Ollama)',
    provedor: 'ollama',
    versao: '7b',
    descricao: 'Modelo leve da Mistral AI rodando localmente',
    precoInput: 0,
    precoOutput: 0,
    contextoMaximo: 32000,
    gratuito: true,
    urlApi: 'https://ollama.ai/download',
    urlDocs: 'https://ollama.ai/library/mistral',
    caracteristicas: ['Gratuito', 'Leve', 'Rápido', 'Local'],
  },
  {
    id: 'ollama-qwen2.5',
    nome: 'Qwen 2.5 (Ollama)',
    provedor: 'ollama',
    versao: '2.5',
    descricao: 'Modelo chinês de alta qualidade da Alibaba - gratuito',
    precoInput: 0,
    precoOutput: 0,
    contextoMaximo: 128000,
    gratuito: true,
    urlApi: 'https://ollama.ai/download',
    urlDocs: 'https://ollama.ai/library/qwen2.5',
    caracteristicas: ['Gratuito', 'Alta qualidade', 'Multilíngue', 'Local'],
  },
  {
    id: 'ollama-deepseek-r1',
    nome: 'DeepSeek R1 (Ollama)',
    provedor: 'ollama',
    versao: 'r1-local',
    descricao: 'DeepSeek R1 rodando localmente via Ollama',
    precoInput: 0,
    precoOutput: 0,
    contextoMaximo: 64000,
    gratuito: true,
    urlApi: 'https://ollama.ai/download',
    urlDocs: 'https://ollama.ai/library/deepseek-r1',
    caracteristicas: ['Gratuito', 'Raciocínio', 'Local', 'Sem limite'],
  },
];

// Informações dos provedores
export const INFO_PROVEDORES: Record<ProvedorIA, {
  nome: string;
  urlCadastro: string;
  urlPricing: string;
  descricao: string;
  cor: string;
}> = {
  anthropic: {
    nome: 'Anthropic',
    urlCadastro: 'https://console.anthropic.com/account/keys',
    urlPricing: 'https://www.anthropic.com/pricing',
    descricao: 'Criadores do Claude - foco em segurança e utilidade',
    cor: 'from-orange-500 to-amber-500',
  },
  openai: {
    nome: 'OpenAI',
    urlCadastro: 'https://platform.openai.com/api-keys',
    urlPricing: 'https://openai.com/api/pricing/',
    descricao: 'Criadores do ChatGPT e GPT-4',
    cor: 'from-green-500 to-emerald-500',
  },
  google: {
    nome: 'Google',
    urlCadastro: 'https://aistudio.google.com/app/apikey',
    urlPricing: 'https://ai.google.dev/pricing',
    descricao: 'Google AI com Gemini - integração com Google Search',
    cor: 'from-blue-500 to-cyan-500',
  },
  deepseek: {
    nome: 'DeepSeek',
    urlCadastro: 'https://platform.deepseek.com/api_keys',
    urlPricing: 'https://api-docs.deepseek.com/quick_start/pricing',
    descricao: 'IA chinesa de alta qualidade - preços muito baixos',
    cor: 'from-purple-500 to-pink-500',
  },
  ollama: {
    nome: 'Ollama (Local)',
    urlCadastro: 'https://ollama.ai/download',
    urlPricing: 'https://ollama.ai',
    descricao: 'Rode modelos localmente - 100% gratuito e privado',
    cor: 'from-gray-500 to-slate-500',
  },
};

// Interface para chaves de API salvas
export interface ChavesAPI {
  anthropic?: string;
  openai?: string;
  google?: string;
  deepseek?: string;
  ollamaUrl?: string;
}

// Interface da store
interface ModelosIAState {
  modeloSelecionado: string;
  chavesAPI: ChavesAPI;
  setModeloSelecionado: (modeloId: string) => void;
  setChaveAPI: (provedor: ProvedorIA, chave: string) => void;
  removerChaveAPI: (provedor: ProvedorIA) => void;
  getModeloAtual: () => ModeloIA | undefined;
  temChaveConfigurada: (provedor: ProvedorIA) => boolean;
}

export const useModelosIAStore = create<ModelosIAState>()(
  persist(
    (set, get) => ({
      modeloSelecionado: 'claude-sonnet-4.5', // Padrão
      chavesAPI: {},

      setModeloSelecionado: (modeloId) => {
        set({ modeloSelecionado: modeloId });
      },

      setChaveAPI: (provedor, chave) => {
        set((state) => ({
          chavesAPI: {
            ...state.chavesAPI,
            [provedor]: chave,
          },
        }));
      },

      removerChaveAPI: (provedor) => {
        set((state) => {
          const novasChaves = { ...state.chavesAPI };
          delete novasChaves[provedor];
          return { chavesAPI: novasChaves };
        });
      },

      getModeloAtual: () => {
        const { modeloSelecionado } = get();
        return CATALOGO_MODELOS.find((m) => m.id === modeloSelecionado);
      },

      temChaveConfigurada: (provedor) => {
        const { chavesAPI } = get();
        if (provedor === 'ollama') {
          return true; // Ollama não precisa de chave
        }
        return !!chavesAPI[provedor];
      },
    }),
    {
      name: 'pesquisa-eleitoral-modelos-ia',
    }
  )
);

// Função utilitária para calcular custo estimado
export function calcularCustoEstimado(
  modelo: ModeloIA,
  tokensInput: number,
  tokensOutput: number
): number {
  const custoInput = (tokensInput / 1_000_000) * modelo.precoInput;
  const custoOutput = (tokensOutput / 1_000_000) * modelo.precoOutput;
  return custoInput + custoOutput;
}

// Função para converter USD para BRL (taxa aproximada)
export function usdParaBrl(usd: number, taxa: number = 5.5): number {
  return usd * taxa;
}
