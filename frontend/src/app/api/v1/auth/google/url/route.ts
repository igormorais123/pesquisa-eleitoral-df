import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/callback/google`;

  // Se não tem Client ID configurado, retorna erro
  if (!clientId) {
    return NextResponse.json(
      { error: 'Login com Google não está configurado' },
      { status: 503 }
    );
  }

  // Monta a URL de autorização do Google
  const scope = encodeURIComponent('openid email profile');
  const responseType = 'code';
  const accessType = 'offline';
  const prompt = 'consent';

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', responseType);
  googleAuthUrl.searchParams.set('scope', scope);
  googleAuthUrl.searchParams.set('access_type', accessType);
  googleAuthUrl.searchParams.set('prompt', prompt);

  return NextResponse.json({ url: googleAuthUrl.toString() });
}
