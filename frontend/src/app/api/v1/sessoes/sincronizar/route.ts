/**
 * Proxy para Sincronização de Sessões
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://pesquisa-eleitoral-df-1.onrender.com';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/v1/sessoes/sincronizar`, {
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
    console.error('[API Sessoes] Erro no proxy sincronizar:', error);
    return NextResponse.json(
      { error: 'Erro ao sincronizar sessões' },
      { status: 500 }
    );
  }
}
