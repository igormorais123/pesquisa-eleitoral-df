/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Configuracao para API externa
  // Nota: rotas de auth (/api/v1/auth/*) sao tratadas localmente pelo Next.js
  // Outras rotas podem ser redirecionadas para backend externo se configurado
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    // Se nao houver backend externo configurado, nao faz rewrites
    if (!backendUrl || backendUrl === 'http://localhost:8000') {
      return [];
    }

    return [
      {
        // Rewrite apenas para rotas que NAO sao auth (auth eh tratado localmente)
        source: '/api/v1/eleitores/:path*',
        destination: `${backendUrl}/api/v1/eleitores/:path*`,
      },
      {
        source: '/api/v1/entrevistas/:path*',
        destination: `${backendUrl}/api/v1/entrevistas/:path*`,
      },
      {
        source: '/api/v1/resultados/:path*',
        destination: `${backendUrl}/api/v1/resultados/:path*`,
      },
      {
        source: '/api/v1/memorias/:path*',
        destination: `${backendUrl}/api/v1/memorias/:path*`,
      },
      {
        source: '/api/v1/geracao/:path*',
        destination: `${backendUrl}/api/v1/geracao/:path*`,
      },
    ];
  },

  // Otimizacoes de imagem
  images: {
    domains: ['localhost', 'api.dicebear.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Server Actions agora são estáveis no Next.js 14

  // Output standalone para Docker
  output: 'standalone',
};

module.exports = nextConfig;
