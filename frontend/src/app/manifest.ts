import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'INTEIA - Inteligência Estratégica',
    short_name: 'INTEIA',
    description: 'Sistema de inteligência artificial para pesquisa eleitoral e análise estratégica',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#d69e2e',
    orientation: 'any',
    icons: [
      {
        src: '/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  };
}
