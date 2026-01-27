'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export default function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { autenticado, token, verificarToken } = useAuthStore();
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-white/50">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!autenticado) {
    return null;
  }

  // Layout limpo para o hub - sem sidebar
  return <>{children}</>;
}
