'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/stores/auth-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { autenticado, verificarToken } = useAuthStore();
  const { recolhido } = useSidebarStore();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const verificar = async () => {
      const valido = await verificarToken();
      if (!valido) {
        router.push('/login');
      }
      setVerificando(false);
    };

    verificar();
  }, [verificarToken, router]);

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
    <div className="min-h-screen bg-background bg-pattern">
      <Sidebar />
      {/* Em mobile (< lg): sem margin, conteúdo ocupa tela toda */}
      {/* Em desktop (lg+): margin-left baseado no estado recolhido */}
      <div
        className={cn(
          'transition-all duration-300',
          recolhido ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        <Header />
        <main className="p-4 sm:p-6 bg-gradient-subtle min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
