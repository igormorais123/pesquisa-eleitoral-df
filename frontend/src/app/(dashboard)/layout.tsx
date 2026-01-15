'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { useAuthStore } from '@/stores/auth-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { autenticado, verificarToken } = useAuthStore();
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
      {/* Sidebar - Oculta em mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:ml-64 transition-all duration-300">
        <Header />
        {/* Main content - Padding extra no bottom para mobile nav */}
        <main className="p-4 sm:p-6 bg-gradient-subtle min-h-[calc(100vh-4rem)] pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Navigation - Visível apenas em mobile */}
      <MobileNav />
    </div>
  );
}
