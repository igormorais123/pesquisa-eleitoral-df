'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { InteiaFooter } from '@/components/branding';
import { useAuthStore } from '@/stores/auth-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import { useSyncSessoes } from '@/hooks/use-sync-sessoes';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { autenticado, token, verificarToken } = useAuthStore();
  const { recolhido } = useSidebarStore();
  const [verificando, setVerificando] = useState(true);

  // Hook de sincronização - carrega sessões do servidor automaticamente após login
  const { carregando: sincronizando, sessoesCarregadas } = useSyncSessoes();

  useEffect(() => {
    const verificar = async () => {
      // Se já está autenticado e tem token, não precisa verificar API
      if (autenticado && token) {
        setVerificando(false);
        return;
      }

      // Se tem token mas não está marcado como autenticado, verifica
      if (token) {
        const valido = await verificarToken();
        if (!valido) {
          router.push('/login');
        }
      } else {
        // Sem token, redireciona para login
        router.push('/login');
      }
      setVerificando(false);
    };

    verificar();
  }, [autenticado, token, verificarToken, router]);

  if (verificando) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!autenticado) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background visual - adapta ao tema */}
      {/* Modo escuro: gradientes âmbar sutis sobre slate escuro */}
      {/* Modo claro: gradientes âmbar sutis sobre fundo claro */}
      <div className="fixed inset-0 bg-gradient-to-b from-amber-900/5 via-background to-background pointer-events-none dark:from-amber-900/5" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-r from-amber-600/5 to-amber-500/5 rounded-full blur-[200px] pointer-events-none" />

      <Sidebar />
      {/* Em mobile (< lg): sem margin, conteúdo ocupa tela toda */}
      {/* Em desktop (lg+): margin-left baseado no estado recolhido */}
      <div
        className={cn(
          'relative transition-all duration-300',
          recolhido ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        <Header />
        {/* Main content - Padding extra no bottom para mobile nav */}
        <main className="relative p-4 sm:p-6 min-h-[calc(100vh-4rem)] pb-20 lg:pb-6">
          {children}
        </main>
        {/* Footer INTEIA */}
        <InteiaFooter variant="minimal" />
      </div>

      {/* Mobile Navigation - Visível apenas em mobile */}
      <MobileNav />
    </div>
  );
}
