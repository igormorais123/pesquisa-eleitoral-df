import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Se houve erro no OAuth
  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent('Erro na autenticação com Google')}`
    );
  }

  // Se não tem código
  if (!code) {
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent('Código de autorização não recebido')}`
    );
  }

  // Redireciona para página que vai processar o código
  return NextResponse.redirect(
    `${baseUrl}/auth/google/callback?code=${encodeURIComponent(code)}`
  );
}
