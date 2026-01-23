/**
 * API Route: /api/v1/auth/login
 *
 * Endpoint de autenticacao para o sistema.
 * Implementa a mesma logica do backend FastAPI.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

// Configuracoes de autenticacao
const DEFAULT_SECRET_KEY = 'chave-secreta-padrao-desenvolvimento';
const SECRET_KEY = process.env.SECRET_KEY || DEFAULT_SECRET_KEY;
const ALGORITHM = 'HS256';
const ACCESS_TOKEN_EXPIRE_MINUTES = parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '60', 10);
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:8000';

// Usuario de teste (mesmo do backend)
// Hash da senha "professorigor" - deve ser igual ao backend
const SENHA_HASH_TESTE = '$2b$12$J6KfB1mVkGLAXyksmR6w6eh.C3fQGRuSMOxsoDeYoVweShfhJy22y';

const USUARIO_TESTE = {
  id: 'user-001',
  usuario: 'professorigor',
  nome: 'Professor Igor',
  email: 'professorigor@exemplo.com',
  papel: 'admin',
  senha_hash: SENHA_HASH_TESTE,
  ativo: true,
};

interface LoginRequest {
  usuario: string;
  senha: string;
}

async function autenticarUsuario(usuario: string, senha: string): Promise<typeof USUARIO_TESTE | null> {
  // Verifica se o usuario existe
  if (usuario !== USUARIO_TESTE.usuario) {
    return null;
  }

  // Verifica a senha usando bcrypt
  const senhaValida = await bcrypt.compare(senha, USUARIO_TESTE.senha_hash);

  if (senhaValida) {
    return USUARIO_TESTE;
  }

  return null;
}

async function criarTokenAcesso(dados: { sub: string; nome: string; papel: string }): Promise<string> {
  const encoder = new TextEncoder();
  const secretKey = encoder.encode(SECRET_KEY);

  const agora = Math.floor(Date.now() / 1000);
  const expiracao = agora + (ACCESS_TOKEN_EXPIRE_MINUTES * 60);

  const token = await new SignJWT({
    ...dados,
    tipo: 'access',
    iat: agora,
  })
    .setProtectedHeader({ alg: ALGORITHM })
    .setExpirationTime(expiracao)
    .sign(secretKey);

  return token;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { usuario, senha } = body;

    if (IS_PRODUCTION) {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha }),
        cache: 'no-store',
      });

      const data = await response.json();
      const headers = new Headers();
      const wwwAuth = response.headers.get('WWW-Authenticate');
      if (wwwAuth) {
        headers.set('WWW-Authenticate', wwwAuth);
      }

      return NextResponse.json(data, { status: response.status, headers });
    }

    // Validar campos obrigatorios
    if (!usuario || !senha) {
      return NextResponse.json(
        { detail: 'Usuario e senha sao obrigatorios' },
        { status: 400 }
      );
    }

    // Autenticar usuario
    const usuarioAutenticado = await autenticarUsuario(usuario, senha);

    if (!usuarioAutenticado) {
      return NextResponse.json(
        { detail: 'Usuario ou senha incorretos' },
        { status: 401, headers: { 'WWW-Authenticate': 'Bearer' } }
      );
    }

    // Criar token JWT
    const token = await criarTokenAcesso({
      sub: usuarioAutenticado.id,
      nome: usuarioAutenticado.nome,
      papel: usuarioAutenticado.papel,
    });

    // Retornar resposta de login
    return NextResponse.json({
      access_token: token,
      token_type: 'bearer',
      expires_in: ACCESS_TOKEN_EXPIRE_MINUTES * 60,
      usuario: {
        id: usuarioAutenticado.id,
        usuario: usuarioAutenticado.usuario,
        nome: usuarioAutenticado.nome,
        papel: usuarioAutenticado.papel,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { detail: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
