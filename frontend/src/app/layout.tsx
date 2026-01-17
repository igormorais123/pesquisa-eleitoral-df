import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { Toaster } from 'sonner';
import { Providers } from './providers';

// Usando font-family do sistema para evitar erros de fetch durante build
const fontClass = 'font-sans';

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
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('pesquisa-eleitoral-theme');
                  var parsed = stored ? JSON.parse(stored) : null;
                  var theme = parsed?.state?.theme || 'dark';
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);
                } catch(e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${fontClass} antialiased bg-background text-foreground`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            theme="system"
          />
        </Providers>
      </body>
    </html>
  );
}
