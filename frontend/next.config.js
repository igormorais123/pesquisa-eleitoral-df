/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Configuracao para API externa
  // Usa NEXT_PUBLIC_BACKEND_URL (apenas o host) para evitar duplicação de /api/v1
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
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
