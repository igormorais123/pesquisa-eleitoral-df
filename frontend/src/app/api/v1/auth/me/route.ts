/**
 * API Route: /api/v1/auth/me
 *
 * Retorna dados do usuario autenticado.
 * Valida o token JWT no header Authorization.
 */

// Forcar rota dinamica (usa request.headers)
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Configuracoes de autenticacao
const SECRET_KEY = process.env.SECRET_KEY || 'chave-secreta-padrao-desenvolvimento';
const ALGORITHM = 'HS256';

interface TokenPayload {
  sub: string;
  nome: string;
  papel: string;
  tipo: string;
  iat: number;
  exp: number;
}

async function verificarToken(token: string): Promise<TokenPayload | null> {
  try {
    const encoder = new TextEncoder();
    const secretKey = encoder.encode(SECRET_KEY);

    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: [ALGORITHM],
    });

    return payload as unknown as TokenPayload;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return null;
  }
}

function extrairToken(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  const partes = authHeader.split(' ');
  if (partes.length !== 2 || partes[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return partes[1];
}

export async function GET(request: NextRequest) {
  try {
    // Extrair token do header Authorization
    const authHeader = request.headers.get('Authorization');
    const token = extrairToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { detail: 'Token nao fornecido' },
        { status: 401, headers: { 'WWW-Authenticate': 'Bearer' } }
      );
    }

    // Verificar e decodificar token
    const payload = await verificarToken(token);

    if (!payload) {
      return NextResponse.json(
        { detail: 'Token invalido ou expirado' },
        { status: 401, headers: { 'WWW-Authenticate': 'Bearer' } }
      );
    }

    // Retornar dados do usuario
    return NextResponse.json({
      id: payload.sub,
      usuario: payload.sub,
      nome: payload.nome,
      papel: payload.papel,
    });
  } catch (error) {
    console.error('Erro ao obter usuario:', error);
    return NextResponse.json(
      { detail: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
