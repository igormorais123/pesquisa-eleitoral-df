import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Toaster } from 'sonner';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pesquisa Eleitoral DF 2026 - Sistema de Agentes Sintéticos',
  description: 'Sistema de simulação de pesquisa eleitoral com agentes sintéticos para eleições de Governador do Distrito Federal 2026',
  keywords: ['pesquisa eleitoral', 'Distrito Federal', 'eleições 2026', 'governador', 'agentes sintéticos'],
  authors: [{ name: 'Professor Igor' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            theme="dark"
          />
        </Providers>
      </body>
    </html>
  );
}
