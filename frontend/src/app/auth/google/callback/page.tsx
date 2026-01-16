'use client';

// Prevenir pre-rendering estático
export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Vote } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/services/api';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [erro, setErro] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const processarCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setErro('Erro na autenticação com Google');
        toast.error('Erro na autenticação com Google');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      if (!code) {
        setErro('Código de autorização não recebido');
        toast.error('Código de autorização não recebido');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      try {
        const response = await api.post('/auth/google/callback', { code });
        const { access_token, usuario } = response.data;

        // Salvar autenticação
        setAuth(access_token, usuario);

        // Configurar header de autorização
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

        toast.success(`Bem-vindo, ${usuario.nome}!`);

        // Verificar se usuário está aprovado
        if (!usuario.aprovado && usuario.papel === 'leitor') {
          toast.info('Sua conta está aguardando aprovação do administrador');
        }

        router.push('/');
      } catch (error: any) {
        const mensagem = error.response?.data?.detail || 'Erro na autenticação';
        setErro(mensagem);
        toast.error(mensagem);
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    processarCallback();
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-pattern">
      <div className="glass-card rounded-2xl p-8 text-center max-w-md w-full mx-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
          <Vote className="w-8 h-8 text-primary" />
        </div>

        {erro ? (
          <>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Erro na Autenticação
            </h2>
            <p className="text-muted-foreground mb-4">{erro}</p>
            <p className="text-sm text-muted-foreground">
              Redirecionando para login...
            </p>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              Autenticando com Google
            </h2>
            <p className="text-muted-foreground">
              Aguarde enquanto processamos sua autenticação...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background bg-pattern">
          <div className="glass-card rounded-2xl p-8 text-center max-w-md w-full mx-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
