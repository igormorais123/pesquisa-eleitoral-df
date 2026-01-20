'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { useAuthStore } from '@/stores/auth-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import { cn } from '@/lib/utils';
import { Globe, Shield, Zap } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { autenticado, token, verificarToken } = useAuthStore();
  const { recolhido } = useSidebarStore();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const verificar = async () => {
      if (autenticado && token) {
        setVerificando(false);
        return;
      }

      if (token) {
        const valido = await verificarToken();
        if (!valido) {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
      setVerificando(false);
    };

    verificar();
  }, [autenticado, token, verificarToken, router]);

  if (verificando) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid opacity-30 dark:opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6 relative z-10"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/25">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-blue-400 animate-ping opacity-20" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-foreground font-semibold text-lg">Carregando Sistema</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!autenticado) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background pattern */}
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-30 dark:opacity-50" />
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/3 rounded-full blur-[120px] pointer-events-none" />

      <Sidebar />

      <div
        className={cn(
          'transition-all duration-300 flex flex-col min-h-screen',
          recolhido ? 'lg:ml-16' : 'lg:ml-56'
        )}
      >
        <Header />

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Footer com créditos */}
        <footer className="hidden lg:block border-t border-border bg-card/50 backdrop-blur-sm relative z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Créditos */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/30 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Produzido por</p>
                    <p className="text-sm font-semibold text-foreground">Igor Morais Vasconcelos</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-border" />
                <p className="text-xs text-muted-foreground">
                  2024-2026 Todos os direitos reservados
                </p>
              </div>

              {/* Status e Info */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span>Sistema Online</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Dados Seguros</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>v2.0.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
