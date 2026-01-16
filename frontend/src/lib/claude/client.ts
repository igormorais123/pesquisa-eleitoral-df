import Anthropic from '@anthropic-ai/sdk';

// Cliente do Anthropic
let clienteAnthropic: Anthropic | null = null;

export function obterClienteAnthropic(): Anthropic {
  if (!clienteAnthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY não configurada');
    }
    clienteAnthropic = new Anthropic({ apiKey });
  }
  return clienteAnthropic;
}

// Tipos para resposta estruturada - Formato Robusto
export interface RespostaAgente {
  agente_id: string;
  modelo_usado: 'opus' | 'sonnet' | 'haiku';
  tokens_input: number;
  tokens_output: number;
  // Formato legado (mantido para compatibilidade)
  chain_of_thought: {
    etapa1_atencao: {
      prestou_atencao: boolean;
      motivo: string;
    };
    etapa2_vies: {
      confirma_crencas: boolean;
      ameaca_valores: boolean;
      medos_ativados: string[];
    };
    etapa3_emocional: {
      sentimento: 'seguranca' | 'ameaca' | 'raiva' | 'indiferenca' | 'esperanca' | 'medo' | 'desprezo' | 'desconfianca';
      intensidade: number;
    };
    etapa4_decisao: {
      muda_voto: boolean;
      aumenta_cinismo: boolean;
    };
  };
  resposta_texto: string;
  resposta_estruturada?: {
    escala?: number;
    opcao?: string;
    ranking?: string[];
  };
  // Novo formato robusto (opcional para compatibilidade)
  raciocinio?: {
    atencao: {
      prestou_atencao: boolean;
      motivo: string;
      relevancia_pessoal: string;
    };
    processamento: {
      confirma_crencas: boolean;
      ameaca_valores: boolean;
      medos_ativados: string[];
      vieses_em_acao: string[];
    };
    emocional: {
      sentimento_primario: 'raiva' | 'medo' | 'esperanca' | 'desprezo' | 'indiferenca' | 'desconfianca' | 'seguranca';
      sentimento_secundario?: string;
      intensidade: number;
      pensamento_interno: string;
    };
    social: {
      alinhado_com_grupo: boolean;
      diria_publicamente: boolean;
    };
  };
  resposta_completa?: {
    texto: string;
    tom: 'direto' | 'evasivo' | 'agressivo' | 'indiferente' | 'entusiasmado' | 'desconfiado';
    certeza: number;
  };
  meta?: {
    muda_intencao_voto: boolean;
    aumenta_cinismo: boolean;
    engajamento: 'alto' | 'medio' | 'baixo';
  };
}

// Modelos disponíveis
export const MODELOS = {
  opus: 'claude-opus-4-5-20251101',      // Apenas para insights/relatorios
  sonnet: 'claude-sonnet-4-5-20250929',  // Sonnet 4.5 para entrevistas
  haiku: 'claude-3-5-haiku-20241022',
} as const;

// Modelo padrao para cada tipo de tarefa
export const MODELO_ENTREVISTAS = 'sonnet';  // Sonnet 4.5 para TODAS as entrevistas
export const MODELO_INSIGHTS = 'opus';       // Opus 4.5 para insights e relatorios

// Custos por modelo (USD por 1M tokens)
export const CUSTOS_MODELOS = {
  opus: { input: 15.0, output: 75.0 },
  sonnet: { input: 3.0, output: 15.0 },
  haiku: { input: 0.25, output: 1.25 },
};

// IMPORTANTE: Para estimativas usamos preco Opus (margem de seguranca)
export const CUSTO_ESTIMATIVA = CUSTOS_MODELOS.opus;

// Taxa de conversão USD -> BRL
export const TAXA_USD_BRL = 6.0;

// Calcular custo em reais
export function calcularCustoReais(
  modelo: 'opus' | 'sonnet' | 'haiku',
  tokensInput: number,
  tokensOutput: number
): number {
  const custos = CUSTOS_MODELOS[modelo];
  const custoUSD =
    (tokensInput / 1_000_000) * custos.input +
    (tokensOutput / 1_000_000) * custos.output;
  return custoUSD * TAXA_USD_BRL;
}

// Limite de segurança
export const LIMITE_CUSTO_SESSAO = 100.0; // R$ 100 por sessão

// Chamar Claude com retry
export async function chamarClaudeComRetry(
  mensagens: Array<{ role: 'user' | 'assistant'; content: string }>,
  modelo: 'opus' | 'sonnet' | 'haiku' = 'sonnet',
  maxTokens: number = 2000,
  tentativas: number = 3
): Promise<{
  conteudo: string;
  tokensInput: number;
  tokensOutput: number;
  custoReais: number;
}> {
  const cliente = obterClienteAnthropic();
  const modeloId = MODELOS[modelo];

  for (let i = 0; i < tentativas; i++) {
    try {
      const resposta = await cliente.messages.create({
        model: modeloId,
        max_tokens: maxTokens,
        messages: mensagens,
      });

      const tokensInput = resposta.usage.input_tokens;
      const tokensOutput = resposta.usage.output_tokens;
      const custoReais = calcularCustoReais(modelo, tokensInput, tokensOutput);

      const conteudo = resposta.content[0].type === 'text'
        ? resposta.content[0].text
        : '';

      return {
        conteudo,
        tokensInput,
        tokensOutput,
        custoReais,
      };
    } catch (error) {
      console.error(`Tentativa ${i + 1} falhou:`, error);
      if (i === tentativas - 1) throw error;
      // Backoff exponencial
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }

  throw new Error('Todas as tentativas falharam');
}

// Determinar modelo para tarefa
export function selecionarModelo(
  tarefa: 'entrevista' | 'insights' = 'entrevista'
): 'opus' | 'sonnet' | 'haiku' {
  // Opus 4.5 APENAS para insights e relatorios
  if (tarefa === 'insights') {
    return MODELO_INSIGHTS;
  }

  // Sonnet 4.5 para TODAS as entrevistas (abertas, fechadas, longas, curtas)
  return MODELO_ENTREVISTAS;
}

// Mantido para compatibilidade - sempre retorna Sonnet 4.5 para entrevistas
export function selecionarModeloPergunta(
  _tipoPergunta: string,
  _eleitorComplexo: boolean
): 'opus' | 'sonnet' | 'haiku' {
  // Sonnet 4.5 para TODAS as entrevistas independente do tipo
  return MODELO_ENTREVISTAS;
}
