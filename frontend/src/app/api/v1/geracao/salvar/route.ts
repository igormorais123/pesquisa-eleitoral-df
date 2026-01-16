/**
 * API Route: /api/v1/geracao/salvar
 *
 * Proxy para salvar eleitores gerados no backend FastAPI.
 * Esta rota recebe os eleitores do frontend e os envia para o backend
 * para persistência no arquivo banco-eleitores-df.json.
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SECRET_KEY = process.env.SECRET_KEY || 'chave-secreta-padrao-desenvolvimento';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

interface SalvarEleitoresRequest {
  eleitores: Record<string, unknown>[];
  modo_corretivo?: boolean;
  divergencias_corrigidas?: string[];
}

/**
 * Verifica o token JWT do usuário
 */
async function verificarToken(request: NextRequest): Promise<{ valid: boolean; error?: string }> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Token não fornecido' };
  }

  const token = authHeader.substring(7);

  try {
    const encoder = new TextEncoder();
    const secretKey = encoder.encode(SECRET_KEY);
    await jwtVerify(token, secretKey);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Token inválido ou expirado' };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const auth = await verificarToken(request);
    if (!auth.valid) {
      return NextResponse.json(
        { erro: auth.error },
        { status: 401 }
      );
    }

    const body: SalvarEleitoresRequest = await request.json();

    if (!body.eleitores || !Array.isArray(body.eleitores)) {
      return NextResponse.json(
        { erro: 'Lista de eleitores é obrigatória' },
        { status: 400 }
      );
    }

    // Extrair token para passar ao backend
    const authHeader = request.headers.get('authorization');

    // Fazer requisição ao backend FastAPI
    const backendResponse = await fetch(`${BACKEND_URL}/api/v1/geracao/salvar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: JSON.stringify({
        eleitores: body.eleitores,
        modo_corretivo: body.modo_corretivo || false,
        divergencias_corrigidas: body.divergencias_corrigidas || [],
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('Erro do backend:', errorData);
      return NextResponse.json(
        {
          erro: errorData.detail || 'Erro ao salvar eleitores no backend',
          detalhes: errorData,
        },
        { status: backendResponse.status }
      );
    }

    const resultado = await backendResponse.json();

    return NextResponse.json({
      sucesso: resultado.sucesso,
      total_recebidos: resultado.total_recebidos,
      total_salvos: resultado.total_salvos,
      total_erros: resultado.total_erros,
      erros: resultado.erros || [],
      ids_criados: resultado.ids_criados || [],
      total_eleitores_banco: resultado.total_eleitores_banco,
    });
  } catch (error) {
    console.error('Erro ao salvar eleitores:', error);

    // Se o backend não estiver disponível, tentar salvar localmente
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        {
          erro: 'Backend não disponível. Os eleitores serão salvos apenas localmente.',
          backend_indisponivel: true,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { erro: error instanceof Error ? error.message : 'Erro ao salvar eleitores' },
      { status: 500 }
    );
  }
}
