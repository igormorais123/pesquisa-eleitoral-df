/**
 * Proxy para API de Sessões do Backend
 *
 * Redireciona requisições para o backend real no Render
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://pesquisa-eleitoral-df-1.onrender.com';

export async function GET(request: NextRequest) {
  try {
    // Pegar header de autorização (pode vir como 'authorization' ou 'Authorization')
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${BACKEND_URL}/api/v1/sessoes/${searchParams ? `?${searchParams}` : ''}`;

    console.log('[API Sessoes] GET proxy para:', url);
    console.log('[API Sessoes] Auth header presente:', !!authHeader);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const data = await response.json();

    console.log('[API Sessoes] Resposta status:', response.status);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Sessoes] Erro no proxy GET:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar sessões do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/v1/sessoes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Sessoes] Erro no proxy POST:', error);
    return NextResponse.json(
      { error: 'Erro ao criar sessão no servidor' },
      { status: 500 }
    );
  }
}
