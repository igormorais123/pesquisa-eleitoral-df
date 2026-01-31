/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Configuracao para API externa
  // Usa NEXT_PUBLIC_BACKEND_URL (apenas o host, sem /api/v1) para evitar duplicação de path
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    return [
      // Relatório INTEIA - rewrite para arquivos estáticos
      {
        source: '/inteia',
        destination: '/relatorio-inteia/index.html',
      },
      {
        source: '/inteia/',
        destination: '/relatorio-inteia/index.html',
      },
      // Auth routes - sempre proxy para o backend
      {
        source: '/api/v1/auth/:path*',
        destination: `${backendUrl}/api/v1/auth/:path*`,
      },
      // Cenários eleitorais (simulação, rejeição)
      {
        source: '/api/v1/cenarios/:path*',
        destination: `${backendUrl}/api/v1/cenarios/:path*`,
      },
      {
        source: '/api/v1/cenarios',
        destination: `${backendUrl}/api/v1/cenarios`,
      },
      // Templates de perguntas
      {
        source: '/api/v1/templates/:path*',
        destination: `${backendUrl}/api/v1/templates/:path*`,
      },
      {
        source: '/api/v1/templates',
        destination: `${backendUrl}/api/v1/templates`,
      },
      // Outras rotas da API
      {
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
      // Usuarios (admin)
      {
        source: '/api/v1/usuarios',
        destination: `${backendUrl}/api/v1/usuarios`,
      },
      {
        source: '/api/v1/usuarios/:path*',
        destination: `${backendUrl}/api/v1/usuarios/:path*`,
      },
      // Dados usuarios Google
      {
        source: '/api/v1/dados-usuarios',
        destination: `${backendUrl}/api/v1/dados-usuarios`,
      },
      {
        source: '/api/v1/dados-usuarios/:path*',
        destination: `${backendUrl}/api/v1/dados-usuarios/:path*`,
      },
    ];
  },

  // Otimizacoes de imagem
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.camara.leg.br',
        pathname: '/internet/deputado/**',
      },
      {
        protocol: 'https',
        hostname: 'www.senado.leg.br',
        pathname: '/senadores/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Server Actions agora são estáveis no Next.js 14
};

module.exports = nextConfig;
// deploy trigger Wed Jan 28 14:27:03 -03 2026
// deploy trigger qui, 29 de jan de 2026 08:16:48
