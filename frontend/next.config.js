/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Configuracao para API externa
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/:path*`,
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
