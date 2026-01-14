'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, Vote, Users, BarChart3 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

const loginSchema = z.object({
  usuario: z.string().min(1, 'Digite o usuário'),
  senha: z.string().min(1, 'Digite a senha'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setCarregando(true);

    try {
      await login(data.usuario, data.senha);
      toast.success('Bem-vindo ao sistema!');
      router.push('/');
    } catch (error) {
      toast.error('Usuário ou senha incorretos');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background bg-pattern">
      {/* Lado esquerdo - Decorativo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-600/20 to-pink-600/20" />
        <div className="absolute inset-0 bg-gradient-subtle" />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
              <Vote className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-foreground mb-4">
              Pesquisa Eleitoral
              <span className="text-gradient block">DF 2026</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Sistema avançado de simulação de pesquisa eleitoral com agentes sintéticos para as eleições de Governador do Distrito Federal.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 backdrop-blur border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">400+ Eleitores Sintéticos</h3>
                <p className="text-sm text-muted-foreground">Perfis realistas e diversificados</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 backdrop-blur border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Análises Avançadas</h3>
                <p className="text-sm text-muted-foreground">Estatísticas e visualizações completas</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 backdrop-blur border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Vote className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Simulação em Tempo Real</h3>
                <p className="text-sm text-muted-foreground">Entrevistas com IA Claude</p>
              </div>
            </div>
          </div>
        </div>

        {/* Elementos decorativos */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl" />
      </div>

      {/* Lado direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Vote className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Pesquisa Eleitoral DF 2026
            </h1>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">Entrar no Sistema</h2>
              <p className="text-muted-foreground mt-2">
                Digite suas credenciais para acessar
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="usuario" className="text-sm font-medium text-foreground">
                  Usuário
                </label>
                <input
                  id="usuario"
                  type="text"
                  {...register('usuario')}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  placeholder="Digite seu usuário"
                />
                {errors.usuario && (
                  <p className="text-sm text-destructive">{errors.usuario.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="senha" className="text-sm font-medium text-foreground">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    type={mostrarSenha ? 'text' : 'password'}
                    {...register('senha')}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                    placeholder="Digite sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.senha && (
                  <p className="text-sm text-destructive">{errors.senha.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed btn-glow"
              >
                {carregando ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Entrar
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-center text-sm text-muted-foreground">
                Sistema desenvolvido para pesquisa eleitoral
                <br />
                <span className="text-primary">Professor Igor</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
