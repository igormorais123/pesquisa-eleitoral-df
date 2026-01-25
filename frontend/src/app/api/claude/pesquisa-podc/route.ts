import { NextRequest, NextResponse } from 'next/server';
import {
  chamarClaudeComRetry,
  LIMITE_CUSTO_SESSAO,
} from '@/lib/claude/client';
import {
  gerarPromptGestorPODCCompleto,
  gerarQuestionarioPODCCompleto,
  calcularIAD,
  classificarPerfilIAD,
  type RespostaPODCEstruturada,
} from '@/lib/claude/prompts-gestor';
import type { Gestor, Pergunta } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutos

// Configurações de tokens para respostas completas
const MAX_TOKENS_RESPOSTA = 4096; // Aumentado para respostas mais detalhadas
const RETRIES = 3;

interface RequestBody {
  gestor: Gestor;
  perguntas?: Pergunta[];
  pesquisaId?: string;
  custoAcumulado?: number;
  usarQuestionarioCompleto?: boolean;
}

interface RespostaBackend {
  sucesso: boolean;
  resposta: {
    gestor_id: string;
    gestor_nome: string;
    setor: string;
    nivel_hierarquico: string;
    modelo_usado: string;
    tokens_input: number;
    tokens_output: number;
    distribuicao_podc?: {
      planejar: number;
      organizar: number;
      dirigir: number;
      controlar: number;
    };
    distribuicao_ideal?: {
      planejar: number;
      organizar: number;
      dirigir: number;
      controlar: number;
    };
    horas_semanais?: {
      total: number;
      planejar: number;
      organizar: number;
      dirigir: number;
      controlar: number;
    };
    iad?: number;
    iad_classificacao?: string;
    ranking_importancia?: string[];
    fatores_limitantes?: string[];
    justificativa?: string;
    frequencia_atividades?: Record<string, Record<string, number>>;
    respostas_perguntas?: Array<{ pergunta_id: string; resposta: string | number }>;
    resposta_bruta: string;
  };
  custoReais: number;
  tokensInput: number;
  tokensOutput: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const {
      gestor,
      perguntas,
      pesquisaId,
      custoAcumulado = 0,
      usarQuestionarioCompleto = true,
    } = body;

    // Verificar limite de custo
    if (custoAcumulado >= LIMITE_CUSTO_SESSAO) {
      return NextResponse.json(
        { erro: 'Limite de custo da sessao atingido (R$ 100)' },
        { status: 429 }
      );
    }

    // Usar questionário completo se não forem fornecidas perguntas específicas
    const perguntasParaUsar = usarQuestionarioCompleto && (!perguntas || perguntas.length === 0)
      ? gerarQuestionarioPODCCompleto()
      : perguntas || [];

    // Gerar prompt completo para gestor PODC
    const prompt = gerarPromptGestorPODCCompleto(gestor, perguntasParaUsar);

    // Usar Sonnet para respostas (bom custo-benefício)
    const modelo = 'sonnet' as const;

    // Chamar Claude com limite de tokens aumentado
    const { conteudo, tokensInput, tokensOutput, custoReais } = await chamarClaudeComRetry(
      [{ role: 'user', content: prompt }],
      modelo,
      MAX_TOKENS_RESPOSTA,
      RETRIES
    );

    // Parsear resposta JSON estruturada
    let respostaParseada: Partial<RespostaPODCEstruturada> = {};
    let parseError: Error | null = null;

    try {
      // Tentar encontrar JSON na resposta
      const jsonMatch = conteudo.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        respostaParseada = JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      parseError = err as Error;
      console.error('Erro ao parsear resposta JSON:', err);
      console.log('Resposta bruta:', conteudo.substring(0, 500));
    }

    // Extrair e validar dados PODC
    const distribuicaoPodc = respostaParseada.distribuicao_podc || {
      planejar: 25,
      organizar: 25,
      dirigir: 25,
      controlar: 25,
    };

    // Normalizar distribuição para somar 100%
    const somaPodc = distribuicaoPodc.planejar + distribuicaoPodc.organizar +
      distribuicaoPodc.dirigir + distribuicaoPodc.controlar;
    if (Math.abs(somaPodc - 100) > 1) {
      const fator = 100 / somaPodc;
      distribuicaoPodc.planejar = Math.round(distribuicaoPodc.planejar * fator);
      distribuicaoPodc.organizar = Math.round(distribuicaoPodc.organizar * fator);
      distribuicaoPodc.dirigir = Math.round(distribuicaoPodc.dirigir * fator);
      distribuicaoPodc.controlar = 100 - distribuicaoPodc.planejar - distribuicaoPodc.organizar - distribuicaoPodc.dirigir;
    }

    // Calcular IAD
    const iad = calcularIAD(distribuicaoPodc);
    const iadClassificacao = classificarPerfilIAD(iad);

    // Montar resposta completa
    const resposta: RespostaBackend = {
      sucesso: true,
      resposta: {
        gestor_id: gestor.id,
        gestor_nome: gestor.nome,
        setor: gestor.setor || 'publico',
        nivel_hierarquico: gestor.nivel_hierarquico || 'tatico',
        modelo_usado: modelo,
        tokens_input: tokensInput,
        tokens_output: tokensOutput,
        distribuicao_podc: distribuicaoPodc,
        distribuicao_ideal: respostaParseada.distribuicao_ideal,
        horas_semanais: respostaParseada.horas_semanais,
        iad,
        iad_classificacao: iadClassificacao,
        ranking_importancia: respostaParseada.ranking_importancia,
        fatores_limitantes: respostaParseada.fatores_limitantes,
        justificativa: respostaParseada.justificativa,
        frequencia_atividades: respostaParseada.frequencia_atividades,
        respostas_perguntas: respostaParseada.respostas_perguntas,
        resposta_bruta: conteudo,
      },
      custoReais,
      tokensInput,
      tokensOutput,
    };

    // Se houver pesquisaId, salvar no backend (OBRIGATORIO para persistencia)
    let salvoNoBackend = false;
    let erroBackend: string | null = null;

    if (pesquisaId) {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const token = request.headers.get('authorization');

        console.log(`[PODC] Salvando resposta no backend: ${backendUrl}/api/v1/pesquisas-podc/${pesquisaId}/respostas/`);

        const saveResponse = await fetch(`${backendUrl}/api/v1/pesquisas-podc/${pesquisaId}/respostas/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: token } : {}),
          },
          body: JSON.stringify({
            pesquisa_id: pesquisaId,
            gestor: {
              id: gestor.id,
              nome: gestor.nome,
              setor: gestor.setor,
              nivel: gestor.nivel_hierarquico,
              cargo: gestor.cargo,
              instituicao: gestor.instituicao,
            },
            distribuicao_podc: distribuicaoPodc,
            distribuicao_ideal: respostaParseada.distribuicao_ideal,
            horas_semanais: respostaParseada.horas_semanais,
            frequencia_atividades: respostaParseada.frequencia_atividades,
            ranking_importancia: respostaParseada.ranking_importancia,
            fatores_limitantes: respostaParseada.fatores_limitantes,
            justificativa: respostaParseada.justificativa,
            respostas_perguntas: respostaParseada.respostas_perguntas,
            resposta_bruta: conteudo,
            tokens_input: tokensInput,
            tokens_output: tokensOutput,
            custo_reais: custoReais,
          }),
        });

        if (!saveResponse.ok) {
          const errorData = await saveResponse.json().catch(() => ({ detail: 'Erro desconhecido' }));
          erroBackend = `Erro ${saveResponse.status}: ${errorData.detail || JSON.stringify(errorData)}`;
          console.error('[PODC] Erro ao salvar no backend:', erroBackend);
        } else {
          salvoNoBackend = true;
          console.log('[PODC] Resposta salva com sucesso no backend');
        }
      } catch (saveError) {
        erroBackend = saveError instanceof Error ? saveError.message : 'Erro de conexao com o backend';
        console.error('[PODC] Erro ao salvar no backend:', saveError);
      }
    } else {
      erroBackend = 'pesquisaId nao fornecido - resposta nao sera persistida';
      console.warn('[PODC] AVISO:', erroBackend);
    }

    // Incluir status de salvamento na resposta
    return NextResponse.json({
      ...resposta,
      salvoNoBackend,
      erroBackend,
    });
  } catch (error) {
    console.error('Erro na pesquisa PODC:', error);
    return NextResponse.json(
      {
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro ao processar pesquisa PODC',
      },
      { status: 500 }
    );
  }
}
