import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tipos de provedores de IA
export type ProvedorIA =
  | 'anthropic'
  | 'openai'
  | 'google'
  | 'deepseek'
  | 'groq'
  | 'mistral'
  | 'cohere'
  | 'together'
  | 'openrouter'
  | 'ollama'
  | 'lmstudio';

// Tipos de tarefas que usam IA
export type TipoTarefa =
  | 'entrevistas'      // Rodar entrevistas com eleitores
  | 'analise'          // Análise de dados e resultados
  | 'relatorios'       // Geração de relatórios
  | 'insights'         // Geração de insights
  | 'gerarEleitor'     // Gerar novos eleitores sintéticos
  | 'backend';         // Operações gerais do backend

// Categoria de velocidade/qualidade do modelo
export type CategoriaModelo = 'premium' | 'balanceado' | 'economico' | 'gratuito' | 'local';

// Interface para um modelo de IA
export interface ModeloIA {
  id: string;
  nome: string;
  provedor: ProvedorIA;
  versao: string;
  descricao: string;
  precoInput: number; // por milhão de tokens em USD
  precoOutput: number; // por milhão de tokens em USD
  contextoMaximo: number; // tokens
  gratuito: boolean;
  tierGratuito?: string; // Descrição do tier gratuito se houver
  urlApi: string;
  urlDocs: string;
  caracteristicas: string[];
  categoria: CategoriaModelo;
  velocidade: 'lento' | 'medio' | 'rapido' | 'ultra-rapido';
  recomendadoPara: TipoTarefa[];
}

// ========================================
// CATÁLOGO COMPLETO DE MODELOS DE IA
// ========================================
export const CATALOGO_MODELOS: ModeloIA[] = [
  // ==================== ANTHROPIC CLAUDE ====================
  {
    id: 'claude-opus-4.5',
    nome: 'Claude Opus 4.5',
    provedor: 'anthropic',
    versao: '4.5',
    descricao: 'O mais inteligente - raciocínio complexo, análise profunda, criatividade',
    precoInput: 5.00,
    precoOutput: 25.00,
    contextoMaximo: 200000,
    gratuito: false,
    urlApi: 'https://console.anthropic.com/account/keys',
    urlDocs: 'https://docs.anthropic.com/claude/reference',
    caracteristicas: ['Raciocínio avançado', 'Análise complexa', 'Visão', 'Código', 'Criativo'],
    categoria: 'premium',
    velocidade: 'lento',
    recomendadoPara: ['analise', 'relatorios', 'insights'],
  },
  {
    id: 'claude-sonnet-4.5',
    nome: 'Claude Sonnet 4.5',
    provedor: 'anthropic',
    versao: '4.5',
    descricao: 'Equilibrado - ótima relação custo/benefício para maioria das tarefas',
    precoInput: 3.00,
    precoOutput: 15.00,
    contextoMaximo: 200000,
    gratuito: false,
    urlApi: 'https://console.anthropic.com/account/keys',
    urlDocs: 'https://docs.anthropic.com/claude/reference',
    caracteristicas: ['Equilibrado', 'Versátil', 'Visão', 'Código'],
    categoria: 'balanceado',
    velocidade: 'medio',
    recomendadoPara: ['entrevistas', 'analise', 'relatorios', 'gerarEleitor'],
  },
  {
    id: 'claude-sonnet-4',
    nome: 'Claude Sonnet 4',
    provedor: 'anthropic',
    versao: '4.0',
    descricao: 'Versão anterior do Sonnet - mais barato e ainda muito capaz',
    precoInput: 2.00,
    precoOutput: 10.00,
    contextoMaximo: 200000,
    gratuito: false,
    urlApi: 'https://console.anthropic.com/account/keys',
    urlDocs: 'https://docs.anthropic.com/claude/reference',
    caracteristicas: ['Bom custo-benefício', 'Versátil', 'Código'],
    categoria: 'balanceado',
    velocidade: 'medio',
    recomendadoPara: ['entrevistas', 'backend'],
  },
  {
    id: 'claude-haiku-4.5',
    nome: 'Claude Haiku 4.5',
    provedor: 'anthropic',
    versao: '4.5',
    descricao: 'Rápido e econômico - ideal para tarefas simples e alto volume',
    precoInput: 1.00,
    precoOutput: 5.00,
    contextoMaximo: 200000,
    gratuito: false,
    urlApi: 'https://console.anthropic.com/account/keys',
    urlDocs: 'https://docs.anthropic.com/claude/reference',
    caracteristicas: ['Rápido', 'Econômico', 'Visão', 'Alto volume'],
    categoria: 'economico',
    velocidade: 'rapido',
    recomendadoPara: ['entrevistas', 'backend'],
  },
  {
    id: 'claude-haiku-3.5',
    nome: 'Claude Haiku 3.5',
    provedor: 'anthropic',
    versao: '3.5',
    descricao: 'Ultra econômico - excelente para entrevistas em massa',
    precoInput: 0.25,
    precoOutput: 1.25,
    contextoMaximo: 200000,
    gratuito: false,
    urlApi: 'https://console.anthropic.com/account/keys',
    urlDocs: 'https://docs.anthropic.com/claude/reference',
    caracteristicas: ['Ultra econômico', 'Rápido', 'Alto volume'],
    categoria: 'economico',
    velocidade: 'rapido',
    recomendadoPara: ['entrevistas', 'backend'],
  },

  // ==================== OPENAI GPT ====================
  {
    id: 'gpt-4o',
    nome: 'GPT-4o',
    provedor: 'openai',
    versao: '4o',
    descricao: 'Flagship da OpenAI - multimodal com visão, áudio e texto',
    precoInput: 2.50,
    precoOutput: 10.00,
    contextoMaximo: 128000,
    gratuito: false,
    urlApi: 'https://platform.openai.com/api-keys',
    urlDocs: 'https://platform.openai.com/docs/api-reference',
    caracteristicas: ['Multimodal', 'Visão', 'Áudio', 'Alta qualidade'],
    categoria: 'premium',
    velocidade: 'medio',
    recomendadoPara: ['analise', 'relatorios', 'insights'],
  },
  {
    id: 'gpt-4o-mini',
    nome: 'GPT-4o Mini',
    provedor: 'openai',
    versao: '4o-mini',
    descricao: 'Versão econômica - 93% mais barato com boa qualidade',
    precoInput: 0.15,
    precoOutput: 0.60,
    contextoMaximo: 128000,
    gratuito: false,
    urlApi: 'https://platform.openai.com/api-keys',
    urlDocs: 'https://platform.openai.com/docs/api-reference',
    caracteristicas: ['Econômico', 'Multimodal', 'Visão', 'Rápido'],
    categoria: 'economico',
    velocidade: 'rapido',
    recomendadoPara: ['entrevistas', 'backend', 'gerarEleitor'],
  },
  {
    id: 'gpt-4.1',
    nome: 'GPT-4.1',
    provedor: 'openai',
    versao: '4.1',
    descricao: 'Modelo mais recente - contexto de 1M tokens',
    precoInput: 2.00,
    precoOutput: 8.00,
    contextoMaximo: 1000000,
    gratuito: false,
    urlApi: 'https://platform.openai.com/api-keys',
    urlDocs: 'https://platform.openai.com/docs/api-reference',
    caracteristicas: ['Contexto 1M', 'Código', 'Raciocínio'],
    categoria: 'premium',
    velocidade: 'medio',
    recomendadoPara: ['analise', 'relatorios'],
  },
  {
    id: 'gpt-4.1-mini',
    nome: 'GPT-4.1 Mini',
    provedor: 'openai',
    versao: '4.1-mini',
    descricao: 'Versão mini do GPT-4.1 - bom para tarefas simples',
    precoInput: 0.40,
    precoOutput: 1.60,
    contextoMaximo: 1000000,
    gratuito: false,
    urlApi: 'https://platform.openai.com/api-keys',
    urlDocs: 'https://platform.openai.com/docs/api-reference',
    caracteristicas: ['Contexto 1M', 'Econômico', 'Rápido'],
    categoria: 'economico',
    velocidade: 'rapido',
    recomendadoPara: ['entrevistas', 'backend'],
  },

  // ==================== GOOGLE GEMINI ====================
  {
    id: 'gemini-2.5-pro',
    nome: 'Gemini 2.5 Pro',
    provedor: 'google',
    versao: '2.5-pro',
    descricao: 'Flagship do Google - excelente para código e raciocínio',
    precoInput: 1.25,
    precoOutput: 5.00,
    contextoMaximo: 1000000,
    gratuito: false,
    tierGratuito: '1000 req/dia grátis',
    urlApi: 'https://aistudio.google.com/app/apikey',
    urlDocs: 'https://ai.google.dev/docs',
    caracteristicas: ['Contexto 1M', 'Código', 'Multimodal', 'Grounding'],
    categoria: 'balanceado',
    velocidade: 'medio',
    recomendadoPara: ['analise', 'relatorios', 'insights'],
  },
  {
    id: 'gemini-2.5-flash',
    nome: 'Gemini 2.5 Flash',
    provedor: 'google',
    versao: '2.5-flash',
    descricao: 'Rápido e econômico - ótimo para alto volume',
    precoInput: 0.075,
    precoOutput: 0.30,
    contextoMaximo: 1000000,
    gratuito: false,
    tierGratuito: '1000 req/dia grátis',
    urlApi: 'https://aistudio.google.com/app/apikey',
    urlDocs: 'https://ai.google.dev/docs',
    caracteristicas: ['Ultra rápido', 'Econômico', 'Contexto 1M'],
    categoria: 'economico',
    velocidade: 'ultra-rapido',
    recomendadoPara: ['entrevistas', 'backend', 'gerarEleitor'],
  },
  {
    id: 'gemini-2.5-flash-lite',
    nome: 'Gemini 2.5 Flash-Lite',
    provedor: 'google',
    versao: '2.5-flash-lite',
    descricao: 'O mais econômico do Gemini - ideal para testes',
    precoInput: 0.04,
    precoOutput: 0.15,
    contextoMaximo: 1000000,
    gratuito: false,
    tierGratuito: '1000 req/dia grátis',
    urlApi: 'https://aistudio.google.com/app/apikey',
    urlDocs: 'https://ai.google.dev/docs',
    caracteristicas: ['Mais barato', 'Alto volume', 'Testes'],
    categoria: 'economico',
    velocidade: 'ultra-rapido',
    recomendadoPara: ['entrevistas', 'backend'],
  },

  // ==================== DEEPSEEK ====================
  {
    id: 'deepseek-v3.2',
    nome: 'DeepSeek V3.2',
    provedor: 'deepseek',
    versao: '3.2',
    descricao: 'Alta qualidade chinês - 95% mais barato que GPT-4',
    precoInput: 0.28,
    precoOutput: 0.42,
    contextoMaximo: 128000,
    gratuito: false,
    tierGratuito: '5M tokens grátis ao cadastrar',
    urlApi: 'https://platform.deepseek.com/api_keys',
    urlDocs: 'https://api-docs.deepseek.com',
    caracteristicas: ['Ultra econômico', 'Alta qualidade', 'Código', 'Raciocínio'],
    categoria: 'economico',
    velocidade: 'rapido',
    recomendadoPara: ['entrevistas', 'analise', 'gerarEleitor'],
  },
  {
    id: 'deepseek-r1',
    nome: 'DeepSeek R1 Reasoner',
    provedor: 'deepseek',
    versao: 'r1',
    descricao: 'Modelo de raciocínio - equivalente ao o1 por 1/100 do preço',
    precoInput: 0.28,
    precoOutput: 0.42,
    contextoMaximo: 128000,
    gratuito: false,
    tierGratuito: '5M tokens grátis ao cadastrar',
    urlApi: 'https://platform.deepseek.com/api_keys',
    urlDocs: 'https://api-docs.deepseek.com',
    caracteristicas: ['Raciocínio avançado', 'Chain-of-Thought', 'Ultra econômico'],
    categoria: 'economico',
    velocidade: 'medio',
    recomendadoPara: ['analise', 'insights'],
  },
  {
    id: 'deepseek-r1-distill-70b',
    nome: 'DeepSeek R1 Distill 70B',
    provedor: 'deepseek',
    versao: 'r1-distill-70b',
    descricao: 'Versão destilada do R1 - O MAIS BARATO do mercado!',
    precoInput: 0.03,
    precoOutput: 0.14,
    contextoMaximo: 128000,
    gratuito: false,
    tierGratuito: '5M tokens grátis ao cadastrar',
    urlApi: 'https://platform.deepseek.com/api_keys',
    urlDocs: 'https://api-docs.deepseek.com',
    caracteristicas: ['O mais barato', 'Raciocínio', 'Alto volume'],
    categoria: 'economico',
    velocidade: 'rapido',
    recomendadoPara: ['entrevistas', 'backend'],
  },

  // ==================== GROQ (ULTRA RÁPIDO) ====================
  {
    id: 'groq-llama3.3-70b',
    nome: 'Llama 3.3 70B (Groq)',
    provedor: 'groq',
    versao: 'llama-3.3-70b',
    descricao: 'Llama 3.3 no hardware Groq - extremamente rápido!',
    precoInput: 0.59,
    precoOutput: 0.79,
    contextoMaximo: 128000,
    gratuito: false,
    tierGratuito: '1000 req/dia grátis, 6000 tokens/min',
    urlApi: 'https://console.groq.com/keys',
    urlDocs: 'https://console.groq.com/docs',
    caracteristicas: ['Ultra rápido', 'Alta qualidade', 'Tier gratuito'],
    categoria: 'balanceado',
    velocidade: 'ultra-rapido',
    recomendadoPara: ['entrevistas', 'backend'],
  },
  {
    id: 'groq-llama3.1-8b',
    nome: 'Llama 3.1 8B (Groq)',
    provedor: 'groq',
    versao: 'llama-3.1-8b',
    descricao: 'Modelo leve no Groq - perfeito para testes rápidos',
    precoInput: 0.05,
    precoOutput: 0.08,
    contextoMaximo: 128000,
    gratuito: false,
    tierGratuito: '14400 req/dia grátis!',
    urlApi: 'https://console.groq.com/keys',
    urlDocs: 'https://console.groq.com/docs',
    caracteristicas: ['Mais rápido', 'Quase gratuito', 'Alto volume'],
    categoria: 'economico',
    velocidade: 'ultra-rapido',
    recomendadoPara: ['entrevistas', 'backend', 'gerarEleitor'],
  },
  {
    id: 'groq-mixtral-8x7b',
    nome: 'Mixtral 8x7B (Groq)',
    provedor: 'groq',
    versao: 'mixtral-8x7b',
    descricao: 'Mixtral no Groq - ótimo equilíbrio velocidade/qualidade',
    precoInput: 0.24,
    precoOutput: 0.24,
    contextoMaximo: 32000,
    gratuito: false,
    tierGratuito: '14400 req/dia grátis!',
    urlApi: 'https://console.groq.com/keys',
    urlDocs: 'https://console.groq.com/docs',
    caracteristicas: ['Rápido', 'Versátil', 'MoE'],
    categoria: 'economico',
    velocidade: 'ultra-rapido',
    recomendadoPara: ['entrevistas', 'backend'],
  },
  {
    id: 'groq-gemma2-9b',
    nome: 'Gemma 2 9B (Groq)',
    provedor: 'groq',
    versao: 'gemma2-9b',
    descricao: 'Gemma 2 do Google no Groq - compacto e eficiente',
    precoInput: 0.20,
    precoOutput: 0.20,
    contextoMaximo: 8192,
    gratuito: false,
    tierGratuito: '14400 req/dia grátis!',
    urlApi: 'https://console.groq.com/keys',
    urlDocs: 'https://console.groq.com/docs',
    caracteristicas: ['Compacto', 'Eficiente', 'Google'],
    categoria: 'economico',
    velocidade: 'ultra-rapido',
    recomendadoPara: ['entrevistas', 'backend'],
  },

  // ==================== MISTRAL ====================
  {
    id: 'mistral-large',
    nome: 'Mistral Large 2',
    provedor: 'mistral',
    versao: 'large-2',
    descricao: 'Flagship da Mistral - ótimo para tarefas complexas',
    precoInput: 2.00,
    precoOutput: 6.00,
    contextoMaximo: 128000,
    gratuito: false,
    tierGratuito: '1 bilhão tokens/mês grátis!',
    urlApi: 'https://console.mistral.ai/api-keys/',
    urlDocs: 'https://docs.mistral.ai',
    caracteristicas: ['Alta qualidade', 'Multilíngue', 'Código'],
    categoria: 'premium',
    velocidade: 'medio',
    recomendadoPara: ['analise', 'relatorios'],
  },
  {
    id: 'mistral-small',
    nome: 'Mistral Small',
    provedor: 'mistral',
    versao: 'small',
    descricao: 'Modelo rápido da Mistral - bom custo-benefício',
    precoInput: 0.20,
    precoOutput: 0.60,
    contextoMaximo: 128000,
    gratuito: false,
    tierGratuito: '1 bilhão tokens/mês grátis!',
    urlApi: 'https://console.mistral.ai/api-keys/',
    urlDocs: 'https://docs.mistral.ai',
    caracteristicas: ['Rápido', 'Econômico', 'Versátil'],
    categoria: 'economico',
    velocidade: 'rapido',
    recomendadoPara: ['entrevistas', 'backend'],
  },
  {
    id: 'mistral-nemo',
    nome: 'Mistral Nemo',
    provedor: 'mistral',
    versao: 'nemo',
    descricao: 'Modelo leve open-source - ótimo para testes',
    precoInput: 0.15,
    precoOutput: 0.15,
    contextoMaximo: 128000,
    gratuito: false,
    tierGratuito: '1 bilhão tokens/mês grátis!',
    urlApi: 'https://console.mistral.ai/api-keys/',
    urlDocs: 'https://docs.mistral.ai',
    caracteristicas: ['Leve', 'Open-source', 'Testes'],
    categoria: 'economico',
    velocidade: 'rapido',
    recomendadoPara: ['entrevistas', 'backend', 'gerarEleitor'],
  },
  {
    id: 'codestral',
    nome: 'Codestral',
    provedor: 'mistral',
    versao: 'codestral',
    descricao: 'Especializado em código - 80+ linguagens',
    precoInput: 0.20,
    precoOutput: 0.60,
    contextoMaximo: 32000,
    gratuito: false,
    tierGratuito: '1 bilhão tokens/mês grátis!',
    urlApi: 'https://console.mistral.ai/api-keys/',
    urlDocs: 'https://docs.mistral.ai',
    caracteristicas: ['Código', 'Multi-linguagem', 'Especializado'],
    categoria: 'economico',
    velocidade: 'rapido',
    recomendadoPara: ['backend'],
  },

  // ==================== COHERE ====================
  {
    id: 'cohere-command-r-plus',
    nome: 'Command R+',
    provedor: 'cohere',
    versao: 'command-r-plus',
    descricao: 'Modelo premium da Cohere - RAG e análise',
    precoInput: 2.50,
    precoOutput: 10.00,
    contextoMaximo: 128000,
    gratuito: false,
    tierGratuito: '1000 req/mês grátis',
    urlApi: 'https://dashboard.cohere.com/api-keys',
    urlDocs: 'https://docs.cohere.com',
    caracteristicas: ['RAG', 'Análise', 'Multilíngue'],
    categoria: 'premium',
    velocidade: 'medio',
    recomendadoPara: ['analise', 'relatorios'],
  },
  {
    id: 'cohere-command-r',
    nome: 'Command R',
    provedor: 'cohere',
    versao: 'command-r',
    descricao: 'Versão econômica - excelente para RAG',
    precoInput: 0.15,
    precoOutput: 0.60,
    contextoMaximo: 128000,
    gratuito: false,
    tierGratuito: '1000 req/mês grátis',
    urlApi: 'https://dashboard.cohere.com/api-keys',
    urlDocs: 'https://docs.cohere.com',
    caracteristicas: ['Econômico', 'RAG', 'Pesquisa'],
    categoria: 'economico',
    velocidade: 'rapido',
    recomendadoPara: ['entrevistas', 'backend'],
  },

  // ==================== TOGETHER AI ====================
  {
    id: 'together-llama3.3-70b',
    nome: 'Llama 3.3 70B (Together)',
    provedor: 'together',
    versao: 'llama-3.3-70b',
    descricao: 'Llama 3.3 via Together - $25 créditos grátis',
    precoInput: 0.88,
    precoOutput: 0.88,
    contextoMaximo: 128000,
    gratuito: false,
    tierGratuito: '$25 créditos grátis ao cadastrar',
    urlApi: 'https://api.together.xyz/settings/api-keys',
    urlDocs: 'https://docs.together.ai',
    caracteristicas: ['Alta qualidade', 'Créditos grátis', 'Open-source'],
    categoria: 'balanceado',
    velocidade: 'rapido',
    recomendadoPara: ['entrevistas', 'analise'],
  },
  {
    id: 'together-qwen2.5-72b',
    nome: 'Qwen 2.5 72B (Together)',
    provedor: 'together',
    versao: 'qwen-2.5-72b',
    descricao: 'Qwen 2.5 da Alibaba - excelente em chinês e inglês',
    precoInput: 0.90,
    precoOutput: 0.90,
    contextoMaximo: 128000,
    gratuito: false,
    tierGratuito: '$25 créditos grátis ao cadastrar',
    urlApi: 'https://api.together.xyz/settings/api-keys',
    urlDocs: 'https://docs.together.ai',
    caracteristicas: ['Multilíngue', 'Alta qualidade', 'Código'],
    categoria: 'balanceado',
    velocidade: 'rapido',
    recomendadoPara: ['entrevistas', 'analise'],
  },
  {
    id: 'together-mixtral-8x22b',
    nome: 'Mixtral 8x22B (Together)',
    provedor: 'together',
    versao: 'mixtral-8x22b',
    descricao: 'Mixtral grande - ótimo para tarefas complexas',
    precoInput: 0.60,
    precoOutput: 0.60,
    contextoMaximo: 65536,
    gratuito: false,
    tierGratuito: '$25 créditos grátis ao cadastrar',
    urlApi: 'https://api.together.xyz/settings/api-keys',
    urlDocs: 'https://docs.together.ai',
    caracteristicas: ['MoE', 'Eficiente', 'Versátil'],
    categoria: 'economico',
    velocidade: 'rapido',
    recomendadoPara: ['entrevistas', 'backend'],
  },

  // ==================== OPENROUTER (AGREGADOR) ====================
  {
    id: 'openrouter-auto',
    nome: 'OpenRouter Auto',
    provedor: 'openrouter',
    versao: 'auto',
    descricao: 'Seleção automática do melhor modelo disponível',
    precoInput: 0.00,
    precoOutput: 0.00,
    contextoMaximo: 128000,
    gratuito: true,
    tierGratuito: 'Modelos gratuitos disponíveis',
    urlApi: 'https://openrouter.ai/keys',
    urlDocs: 'https://openrouter.ai/docs',
    caracteristicas: ['400+ modelos', 'Automático', 'Fallback'],
    categoria: 'gratuito',
    velocidade: 'medio',
    recomendadoPara: ['entrevistas', 'backend'],
  },
  {
    id: 'openrouter-free-llama',
    nome: 'Llama 3 8B (OpenRouter Free)',
    provedor: 'openrouter',
    versao: 'llama-3-8b-free',
    descricao: '100% gratuito via OpenRouter - rate limited',
    precoInput: 0.00,
    precoOutput: 0.00,
    contextoMaximo: 8192,
    gratuito: true,
    tierGratuito: 'Gratuito com rate limit',
    urlApi: 'https://openrouter.ai/keys',
    urlDocs: 'https://openrouter.ai/docs',
    caracteristicas: ['Gratuito', 'Llama 3', 'Testes'],
    categoria: 'gratuito',
    velocidade: 'medio',
    recomendadoPara: ['entrevistas', 'backend'],
  },
  {
    id: 'openrouter-free-gemma',
    nome: 'Gemma 2 9B (OpenRouter Free)',
    provedor: 'openrouter',
    versao: 'gemma-2-9b-free',
    descricao: '100% gratuito via OpenRouter - Google Gemma',
    precoInput: 0.00,
    precoOutput: 0.00,
    contextoMaximo: 8192,
    gratuito: true,
    tierGratuito: 'Gratuito com rate limit',
    urlApi: 'https://openrouter.ai/keys',
    urlDocs: 'https://openrouter.ai/docs',
    caracteristicas: ['Gratuito', 'Google', 'Compacto'],
    categoria: 'gratuito',
    velocidade: 'medio',
    recomendadoPara: ['entrevistas', 'backend'],
  },

  // ==================== OLLAMA (LOCAL/GRATUITO) ====================
  {
    id: 'ollama-llama3.3',
    nome: 'Llama 3.3 70B (Local)',
    provedor: 'ollama',
    versao: '3.3-70b',
    descricao: 'Último Llama da Meta - precisa de 48GB+ RAM',
    precoInput: 0,
    precoOutput: 0,
    contextoMaximo: 128000,
    gratuito: true,
    urlApi: 'https://ollama.ai/download',
    urlDocs: 'https://ollama.ai/library/llama3.3',
    caracteristicas: ['Gratuito', 'Local', 'Alta qualidade', 'Privado'],
    categoria: 'local',
    velocidade: 'lento',
    recomendadoPara: ['analise', 'relatorios'],
  },
  {
    id: 'ollama-llama3.2-8b',
    nome: 'Llama 3.2 8B (Local)',
    provedor: 'ollama',
    versao: '3.2-8b',
    descricao: 'Modelo leve da Meta - roda em 8GB RAM',
    precoInput: 0,
    precoOutput: 0,
    contextoMaximo: 128000,
    gratuito: true,
    urlApi: 'https://ollama.ai/download',
    urlDocs: 'https://ollama.ai/library/llama3.2',
    caracteristicas: ['Gratuito', 'Local', 'Leve', '8GB RAM'],
    categoria: 'local',
    velocidade: 'medio',
    recomendadoPara: ['entrevistas', 'backend', 'gerarEleitor'],
  },
  {
    id: 'ollama-mistral-7b',
    nome: 'Mistral 7B (Local)',
    provedor: 'ollama',
    versao: '7b',
    descricao: 'Modelo leve da Mistral - rápido localmente',
    precoInput: 0,
    precoOutput: 0,
    contextoMaximo: 32000,
    gratuito: true,
    urlApi: 'https://ollama.ai/download',
    urlDocs: 'https://ollama.ai/library/mistral',
    caracteristicas: ['Gratuito', 'Leve', 'Rápido', 'Local'],
    categoria: 'local',
    velocidade: 'rapido',
    recomendadoPara: ['entrevistas', 'backend'],
  },
  {
    id: 'ollama-qwen2.5-7b',
    nome: 'Qwen 2.5 7B (Local)',
    provedor: 'ollama',
    versao: '2.5-7b',
    descricao: 'Modelo chinês da Alibaba - multilíngue',
    precoInput: 0,
    precoOutput: 0,
    contextoMaximo: 128000,
    gratuito: true,
    urlApi: 'https://ollama.ai/download',
    urlDocs: 'https://ollama.ai/library/qwen2.5',
    caracteristicas: ['Gratuito', 'Multilíngue', 'Código', 'Local'],
    categoria: 'local',
    velocidade: 'rapido',
    recomendadoPara: ['entrevistas', 'backend', 'gerarEleitor'],
  },
  {
    id: 'ollama-deepseek-r1',
    nome: 'DeepSeek R1 (Local)',
    provedor: 'ollama',
    versao: 'r1-local',
    descricao: 'DeepSeek R1 local - raciocínio avançado gratuito',
    precoInput: 0,
    precoOutput: 0,
    contextoMaximo: 64000,
    gratuito: true,
    urlApi: 'https://ollama.ai/download',
    urlDocs: 'https://ollama.ai/library/deepseek-r1',
    caracteristicas: ['Gratuito', 'Raciocínio', 'Local', 'Chain-of-Thought'],
    categoria: 'local',
    velocidade: 'lento',
    recomendadoPara: ['analise', 'insights'],
  },
  {
    id: 'ollama-gemma2-9b',
    nome: 'Gemma 2 9B (Local)',
    provedor: 'ollama',
    versao: 'gemma2-9b',
    descricao: 'Gemma 2 do Google - compacto e eficiente',
    precoInput: 0,
    precoOutput: 0,
    contextoMaximo: 8192,
    gratuito: true,
    urlApi: 'https://ollama.ai/download',
    urlDocs: 'https://ollama.ai/library/gemma2',
    caracteristicas: ['Gratuito', 'Google', 'Compacto', 'Eficiente'],
    categoria: 'local',
    velocidade: 'rapido',
    recomendadoPara: ['entrevistas', 'backend'],
  },
  {
    id: 'ollama-phi4',
    nome: 'Phi-4 (Local)',
    provedor: 'ollama',
    versao: 'phi-4',
    descricao: 'Modelo da Microsoft - surpreendentemente capaz',
    precoInput: 0,
    precoOutput: 0,
    contextoMaximo: 16384,
    gratuito: true,
    urlApi: 'https://ollama.ai/download',
    urlDocs: 'https://ollama.ai/library/phi4',
    caracteristicas: ['Gratuito', 'Microsoft', 'Compacto', 'Código'],
    categoria: 'local',
    velocidade: 'rapido',
    recomendadoPara: ['entrevistas', 'backend', 'gerarEleitor'],
  },

  // ==================== LM STUDIO (LOCAL) ====================
  {
    id: 'lmstudio-local',
    nome: 'LM Studio (Qualquer Modelo)',
    provedor: 'lmstudio',
    versao: 'local',
    descricao: 'Rode qualquer modelo GGUF localmente via LM Studio',
    precoInput: 0,
    precoOutput: 0,
    contextoMaximo: 128000,
    gratuito: true,
    urlApi: 'https://lmstudio.ai/download',
    urlDocs: 'https://lmstudio.ai/docs',
    caracteristicas: ['Gratuito', 'Qualquer modelo', 'GUI', 'Local'],
    categoria: 'local',
    velocidade: 'medio',
    recomendadoPara: ['entrevistas', 'analise', 'backend', 'gerarEleitor'],
  },
];

// ========================================
// INFORMAÇÕES DOS PROVEDORES
// ========================================
export const INFO_PROVEDORES: Record<ProvedorIA, {
  nome: string;
  urlCadastro: string;
  urlPricing: string;
  descricao: string;
  cor: string;
  tierGratuito?: string;
  temTierGratuito: boolean;
}> = {
  anthropic: {
    nome: 'Anthropic',
    urlCadastro: 'https://console.anthropic.com/account/keys',
    urlPricing: 'https://www.anthropic.com/pricing',
    descricao: 'Criadores do Claude - foco em segurança e utilidade',
    cor: 'from-orange-500 to-amber-500',
    temTierGratuito: false,
  },
  openai: {
    nome: 'OpenAI',
    urlCadastro: 'https://platform.openai.com/api-keys',
    urlPricing: 'https://openai.com/api/pricing/',
    descricao: 'Criadores do ChatGPT e GPT-4',
    cor: 'from-green-500 to-emerald-500',
    temTierGratuito: false,
  },
  google: {
    nome: 'Google',
    urlCadastro: 'https://aistudio.google.com/app/apikey',
    urlPricing: 'https://ai.google.dev/pricing',
    descricao: 'Gemini com integração Google Search',
    cor: 'from-blue-500 to-cyan-500',
    tierGratuito: '1000 req/dia grátis',
    temTierGratuito: true,
  },
  deepseek: {
    nome: 'DeepSeek',
    urlCadastro: 'https://platform.deepseek.com/api_keys',
    urlPricing: 'https://api-docs.deepseek.com/quick_start/pricing',
    descricao: 'IA chinesa - preços imbatíveis',
    cor: 'from-purple-500 to-pink-500',
    tierGratuito: '5M tokens grátis ao cadastrar',
    temTierGratuito: true,
  },
  groq: {
    nome: 'Groq',
    urlCadastro: 'https://console.groq.com/keys',
    urlPricing: 'https://groq.com/pricing',
    descricao: 'Hardware LPU - o mais rápido do mundo',
    cor: 'from-red-500 to-orange-500',
    tierGratuito: '14400 req/dia grátis!',
    temTierGratuito: true,
  },
  mistral: {
    nome: 'Mistral AI',
    urlCadastro: 'https://console.mistral.ai/api-keys/',
    urlPricing: 'https://mistral.ai/pricing/',
    descricao: 'IA francesa - 1 bilhão tokens/mês grátis',
    cor: 'from-indigo-500 to-violet-500',
    tierGratuito: '1 bilhão tokens/mês grátis!',
    temTierGratuito: true,
  },
  cohere: {
    nome: 'Cohere',
    urlCadastro: 'https://dashboard.cohere.com/api-keys',
    urlPricing: 'https://cohere.com/pricing',
    descricao: 'Especializado em RAG e embeddings',
    cor: 'from-teal-500 to-green-500',
    tierGratuito: '1000 req/mês grátis',
    temTierGratuito: true,
  },
  together: {
    nome: 'Together AI',
    urlCadastro: 'https://api.together.xyz/settings/api-keys',
    urlPricing: 'https://www.together.ai/pricing',
    descricao: 'Plataforma open-source - $25 créditos grátis',
    cor: 'from-yellow-500 to-orange-500',
    tierGratuito: '$25 créditos grátis',
    temTierGratuito: true,
  },
  openrouter: {
    nome: 'OpenRouter',
    urlCadastro: 'https://openrouter.ai/keys',
    urlPricing: 'https://openrouter.ai/pricing',
    descricao: 'Agregador - acesso a 400+ modelos',
    cor: 'from-pink-500 to-rose-500',
    tierGratuito: 'Modelos gratuitos disponíveis',
    temTierGratuito: true,
  },
  ollama: {
    nome: 'Ollama',
    urlCadastro: 'https://ollama.ai/download',
    urlPricing: 'https://ollama.ai',
    descricao: '100% gratuito - rode IA localmente',
    cor: 'from-gray-500 to-slate-500',
    tierGratuito: '100% gratuito sempre',
    temTierGratuito: true,
  },
  lmstudio: {
    nome: 'LM Studio',
    urlCadastro: 'https://lmstudio.ai/download',
    urlPricing: 'https://lmstudio.ai',
    descricao: 'GUI para rodar modelos locais',
    cor: 'from-cyan-500 to-blue-500',
    tierGratuito: '100% gratuito sempre',
    temTierGratuito: true,
  },
};

// ========================================
// INTERFACE PARA CHAVES DE API
// ========================================
export interface ChavesAPI {
  anthropic?: string;
  openai?: string;
  google?: string;
  deepseek?: string;
  groq?: string;
  mistral?: string;
  cohere?: string;
  together?: string;
  openrouter?: string;
  ollamaUrl?: string;
  lmstudioUrl?: string;
}

// ========================================
// CONFIGURAÇÃO POR TIPO DE TAREFA
// ========================================
export interface ConfiguracaoTarefas {
  entrevistas: string;      // ID do modelo para entrevistas
  analise: string;          // ID do modelo para análise
  relatorios: string;       // ID do modelo para relatórios
  insights: string;         // ID do modelo para insights
  gerarEleitor: string;     // ID do modelo para gerar eleitores
  backend: string;          // ID do modelo para operações backend
}

export const CONFIGURACAO_TAREFAS_PADRAO: ConfiguracaoTarefas = {
  entrevistas: 'claude-haiku-3.5',
  analise: 'claude-sonnet-4.5',
  relatorios: 'claude-sonnet-4.5',
  insights: 'claude-opus-4.5',
  gerarEleitor: 'gpt-4o-mini',
  backend: 'claude-haiku-4.5',
};

export const DESCRICAO_TAREFAS: Record<TipoTarefa, {
  nome: string;
  descricao: string;
  icone: string;
  recomendacao: string;
}> = {
  entrevistas: {
    nome: 'Entrevistas',
    descricao: 'Rodar entrevistas com eleitores sintéticos',
    icone: '🎤',
    recomendacao: 'Use modelos rápidos e econômicos (Haiku, GPT-4o Mini, Groq)',
  },
  analise: {
    nome: 'Análise',
    descricao: 'Análise de dados e resultados de pesquisas',
    icone: '📊',
    recomendacao: 'Use modelos equilibrados (Sonnet, Gemini Pro)',
  },
  relatorios: {
    nome: 'Relatórios',
    descricao: 'Geração de relatórios detalhados',
    icone: '📝',
    recomendacao: 'Use modelos com boa escrita (Sonnet, Claude)',
  },
  insights: {
    nome: 'Insights',
    descricao: 'Geração de insights e descobertas',
    icone: '💡',
    recomendacao: 'Use modelos premium para insights profundos (Opus, GPT-4o)',
  },
  gerarEleitor: {
    nome: 'Gerar Eleitores',
    descricao: 'Criar novos perfis de eleitores sintéticos',
    icone: '👤',
    recomendacao: 'Use modelos criativos e econômicos',
  },
  backend: {
    nome: 'Backend',
    descricao: 'Operações gerais do sistema',
    icone: '⚙️',
    recomendacao: 'Use modelos rápidos e econômicos',
  },
};

// ========================================
// STORE PRINCIPAL
// ========================================
interface ModelosIAState {
  // Modelo padrão selecionado
  modeloPadrao: string;

  // Configuração por tipo de tarefa
  configuracaoTarefas: ConfiguracaoTarefas;

  // Chaves de API
  chavesAPI: ChavesAPI;

  // URLs para serviços locais
  ollamaUrl: string;
  lmstudioUrl: string;

  // Ações
  setModeloPadrao: (modeloId: string) => void;
  setModeloParaTarefa: (tarefa: TipoTarefa, modeloId: string) => void;
  setChaveAPI: (provedor: ProvedorIA, chave: string) => void;
  removerChaveAPI: (provedor: ProvedorIA) => void;
  setOllamaUrl: (url: string) => void;
  setLmstudioUrl: (url: string) => void;

  // Getters
  getModeloPadrao: () => ModeloIA | undefined;
  getModeloParaTarefa: (tarefa: TipoTarefa) => ModeloIA | undefined;
  temChaveConfigurada: (provedor: ProvedorIA) => boolean;
  getModelosDisponiveis: () => ModeloIA[];
  getModelosPorCategoria: (categoria: CategoriaModelo) => ModeloIA[];
  getModelosGratuitos: () => ModeloIA[];
  getModelosRecomendados: (tarefa: TipoTarefa) => ModeloIA[];
}

export const useModelosIAStore = create<ModelosIAState>()(
  persist(
    (set, get) => ({
      modeloPadrao: 'claude-sonnet-4.5',
      configuracaoTarefas: CONFIGURACAO_TAREFAS_PADRAO,
      chavesAPI: {},
      ollamaUrl: 'http://localhost:11434',
      lmstudioUrl: 'http://localhost:1234',

      setModeloPadrao: (modeloId) => {
        set({ modeloPadrao: modeloId });
      },

      setModeloParaTarefa: (tarefa, modeloId) => {
        set((state) => ({
          configuracaoTarefas: {
            ...state.configuracaoTarefas,
            [tarefa]: modeloId,
          },
        }));
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
          if (provedor === 'ollama') {
            delete novasChaves.ollamaUrl;
          } else if (provedor === 'lmstudio') {
            delete novasChaves.lmstudioUrl;
          } else {
            delete novasChaves[provedor as keyof ChavesAPI];
          }
          return { chavesAPI: novasChaves };
        });
      },

      setOllamaUrl: (url) => {
        set({ ollamaUrl: url });
      },

      setLmstudioUrl: (url) => {
        set({ lmstudioUrl: url });
      },

      getModeloPadrao: () => {
        const { modeloPadrao } = get();
        return CATALOGO_MODELOS.find((m) => m.id === modeloPadrao);
      },

      getModeloParaTarefa: (tarefa) => {
        const { configuracaoTarefas } = get();
        const modeloId = configuracaoTarefas[tarefa];
        return CATALOGO_MODELOS.find((m) => m.id === modeloId);
      },

      temChaveConfigurada: (provedor) => {
        const { chavesAPI } = get();
        if (provedor === 'ollama' || provedor === 'lmstudio') {
          return true; // Locais não precisam de chave
        }
        return !!chavesAPI[provedor as keyof ChavesAPI];
      },

      getModelosDisponiveis: () => {
        const { chavesAPI } = get();
        return CATALOGO_MODELOS.filter((modelo) => {
          if (modelo.gratuito) return true;
          if (modelo.provedor === 'ollama' || modelo.provedor === 'lmstudio') return true;
          return !!chavesAPI[modelo.provedor as keyof ChavesAPI];
        });
      },

      getModelosPorCategoria: (categoria) => {
        return CATALOGO_MODELOS.filter((m) => m.categoria === categoria);
      },

      getModelosGratuitos: () => {
        return CATALOGO_MODELOS.filter((m) => m.gratuito || m.tierGratuito);
      },

      getModelosRecomendados: (tarefa) => {
        return CATALOGO_MODELOS.filter((m) => m.recomendadoPara.includes(tarefa));
      },
    }),
    {
      name: 'pesquisa-eleitoral-modelos-ia-v2',
    }
  )
);

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================

// Calcular custo estimado com margem de segurança
export function calcularCustoEstimado(
  modelo: ModeloIA,
  tokensInput: number,
  tokensOutput: number,
  margemSeguranca: number = 1.2 // 20% de margem
): { custoBase: number; custoComMargem: number } {
  if (modelo.gratuito) {
    return { custoBase: 0, custoComMargem: 0 };
  }
  const custoInput = (tokensInput / 1_000_000) * modelo.precoInput;
  const custoOutput = (tokensOutput / 1_000_000) * modelo.precoOutput;
  const custoBase = custoInput + custoOutput;
  return {
    custoBase,
    custoComMargem: custoBase * margemSeguranca,
  };
}

// Estimar custo para N entrevistas
export function estimarCustoEntrevistas(
  modelo: ModeloIA,
  numEntrevistas: number,
  perguntasPorEntrevista: number = 10,
  tokensInputPorPergunta: number = 500,
  tokensOutputPorPergunta: number = 1000
): { custoBase: number; custoComMargem: number; custoPorEntrevista: number } {
  const totalInput = numEntrevistas * perguntasPorEntrevista * tokensInputPorPergunta;
  const totalOutput = numEntrevistas * perguntasPorEntrevista * tokensOutputPorPergunta;
  const { custoBase, custoComMargem } = calcularCustoEstimado(modelo, totalInput, totalOutput);
  return {
    custoBase,
    custoComMargem,
    custoPorEntrevista: custoComMargem / numEntrevistas,
  };
}

// Converter USD para BRL
export function usdParaBrl(usd: number, taxa: number = 5.5): number {
  return usd * taxa;
}

// Formatar preço
export function formatarPreco(usd: number, mostrarBrl: boolean = true): string {
  if (usd === 0) return 'Grátis';
  const formatUsd = `$${usd.toFixed(4)}`;
  if (mostrarBrl) {
    const brl = usdParaBrl(usd);
    return `${formatUsd} (~R$${brl.toFixed(2)})`;
  }
  return formatUsd;
}

// Obter modelos ordenados por preço
export function getModelosOrdenadosPorPreco(asc: boolean = true): ModeloIA[] {
  return [...CATALOGO_MODELOS].sort((a, b) => {
    const precoA = a.precoInput + a.precoOutput;
    const precoB = b.precoInput + b.precoOutput;
    return asc ? precoA - precoB : precoB - precoA;
  });
}

// Obter modelo mais barato para uma tarefa
export function getModeloMaisBaratoParaTarefa(tarefa: TipoTarefa): ModeloIA | undefined {
  const recomendados = CATALOGO_MODELOS.filter((m) => m.recomendadoPara.includes(tarefa));
  return recomendados.sort((a, b) => (a.precoInput + a.precoOutput) - (b.precoInput + b.precoOutput))[0];
}
