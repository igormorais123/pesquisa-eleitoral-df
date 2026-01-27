/**
 * Endpoint de debug para verificar headers recebidos
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Pegar todos os headers
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Verificar Authorization específico
  const auth = request.headers.get('authorization');
  const authCaps = request.headers.get('Authorization');

  return NextResponse.json({
    message: 'Debug endpoint',
    authorization: auth,
    Authorization: authCaps,
    allHeaders: headers,
    url: request.url,
    method: request.method,
  });
}
