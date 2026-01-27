/**
 * API Route: /api/v1/auth/login
 *
 * Proxy para o backend FastAPI.
 * Autentica no backend para garantir que o usuario existe no banco.
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://pesquisa-eleitoral-df-1.onrender.com';

interface LoginRequest {
  usuario: string;
  senha: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { usuario, senha } = body;

    // Validar campos obrigatorios
    if (!usuario || !senha) {
      return NextResponse.json(
        { detail: 'Usuario e senha sao obrigatorios' },
        { status: 400 }
      );
    }

    // Fazer proxy para o backend
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usuario, senha }),
    });

    const data = await response.json();

    // Retornar resposta do backend
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { detail: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
