'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, LogIn, Users, BarChart3,
  Zap, Shield, Brain, Database, FileText,
  TrendingUp, Map, MessageSquare, CheckCircle2,
  ArrowRight, Sparkles, Globe, Lock
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/services/api';

const loginSchema = z.object({
  usuario: z.string().min(1, 'Digite o email ou usuário'),
  senha: z.string().min(1, 'Digite a senha'),
});

type LoginForm = z.infer<typeof loginSchema>;

// Módulos do sistema com preços
const modulos = [
  {
    nome: 'Módulo Eleitores',
    descricao: 'Base de 1000+ eleitores sintéticos com 60+ atributos',
    preco: 'R$ 2.990',
    features: ['Perfis demográficos completos', 'Dados socioeconômicos', 'Orientação política'],
    icon: Users,
    cor: 'from-cyan-500 to-blue-600',
    popular: false
  },
  {
    nome: 'Módulo Pesquisas',
    descricao: 'Entrevistas automatizadas com IA Claude',
    preco: 'R$ 4.990',
    features: ['Simulação em tempo real', 'Respostas contextualizadas', 'Análise de sentimento'],
    icon: MessageSquare,
    cor: 'from-emerald-500 to-teal-600',
    popular: true
  },
  {
    nome: 'Módulo Analytics',
    descricao: 'Dashboards avançados e relatórios executivos',
    preco: 'R$ 3.490',
    features: ['Gráficos interativos', 'Exportação PDF/Excel', 'Insights automáticos'],
    icon: BarChart3,
    cor: 'from-amber-500 to-orange-600',
    popular: false
  },
  {
    nome: 'Pacote Completo',
    descricao: 'Todos os módulos + suporte prioritário',
    preco: 'R$ 8.990',
    features: ['Acesso total', 'API dedicada', 'Suporte 24/7'],
    icon: Sparkles,
    cor: 'from-violet-500 to-purple-600',
    popular: false
  }
];

// Funcionalidades principais
const funcionalidades = [
  { icon: Users, titulo: '1000+ Agentes', desc: 'Eleitores sintéticos realistas' },
  { icon: Brain, titulo: 'IA Claude', desc: 'Respostas inteligentes' },
  { icon: Map, titulo: 'Mapa DF', desc: 'Visualização geográfica' },
  { icon: TrendingUp, titulo: 'Projeções', desc: 'Cenários eleitorais' },
  { icon: Shield, titulo: 'Validação', desc: 'Metodologia científica' },
  { icon: FileText, titulo: 'Relatórios', desc: 'Exportação completa' },
];

// Estatísticas do sistema
const stats = [
  { valor: '1.247', label: 'Eleitores Cadastrados', icon: Users },
  { valor: '60+', label: 'Atributos por Perfil', icon: Database },
  { valor: '31', label: 'Regiões do DF', icon: Map },
  { valor: '99.2%', label: 'Precisão Estatística', icon: TrendingUp },
];

export default function LoginPage() {
  const router = useRouter();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [carregandoGoogle, setCarregandoGoogle] = useState(false);
  const [moduloAtivo, setModuloAtivo] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-rotate modules
  useEffect(() => {
    const interval = setInterval(() => {
      setModuloAtivo((prev) => (prev + 1) % modulos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
      toast.error('Email/usuário ou senha incorretos');
    } finally {
      setCarregando(false);
    }
  };

  const handleGoogleLogin = async () => {
    setCarregandoGoogle(true);
    try {
      const response = await api.get('/auth/google/url');
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Login com Google não está disponível no momento');
      setCarregandoGoogle(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0a0a0f] text-white overflow-hidden relative">
      {/* Cursor glow effect */}
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.07), transparent 80%)`,
        }}
      />

      {/* Grid pattern background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[100px]" />

      {/* ============ LADO ESQUERDO - SHOWCASE DO PRODUTO ============ */}
      <div className="hidden lg:flex lg:w-3/5 relative z-10 p-8 xl:p-12">
        <div className="w-full max-w-4xl mx-auto flex flex-col">

          {/* Header com Logo e Créditos */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Pesquisa Eleitoral DF</h1>
                <p className="text-xs text-zinc-500 font-mono">2026 • Sistema Inteligente</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Produzido por</p>
              <p className="text-sm font-semibold text-zinc-300">Igor Morais Vasconcelos</p>
              <p className="text-[10px] text-zinc-600">© 2024-2026 Todos os direitos reservados</p>
            </div>
          </motion.div>

          {/* Título Principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
              Simulação Eleitoral com
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Inteligência Artificial
              </span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-xl">
              Plataforma profissional para pesquisa eleitoral utilizando agentes sintéticos
              e IA Claude para simular cenários das eleições 2026 no Distrito Federal.
            </p>
          </motion.div>

          {/* Stats em linha */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat, i) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 backdrop-blur-sm">
                <stat.icon className="w-5 h-5 text-zinc-500 mb-2" />
                <p className="text-2xl font-bold font-mono text-white">{stat.valor}</p>
                <p className="text-xs text-zinc-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Funcionalidades Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              Funcionalidades do Sistema
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {funcionalidades.map((func, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(59, 130, 246, 0.5)' }}
                  className="group bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:bg-zinc-900/50"
                >
                  <func.icon className="w-6 h-6 text-blue-400 mb-2 group-hover:text-cyan-400 transition-colors" />
                  <p className="font-semibold text-sm text-white">{func.titulo}</p>
                  <p className="text-xs text-zinc-500">{func.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Módulos e Preços */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex-1"
          >
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              Planos e Módulos
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {modulos.map((modulo, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setModuloAtivo(i)}
                  className={`relative bg-zinc-900/40 border rounded-xl p-5 cursor-pointer transition-all duration-300 ${
                    moduloAtivo === i
                      ? 'border-blue-500/50 shadow-lg shadow-blue-500/10'
                      : 'border-zinc-800/50 hover:border-zinc-700'
                  }`}
                >
                  {modulo.popular && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-[10px] font-bold px-2 py-1 rounded-full text-white">
                      POPULAR
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${modulo.cor} flex items-center justify-center mb-3`}>
                    <modulo.icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-bold text-white mb-1">{modulo.nome}</h4>
                  <p className="text-xs text-zinc-500 mb-3">{modulo.descricao}</p>
                  <p className="text-2xl font-bold font-mono text-white mb-3">{modulo.preco}</p>
                  <ul className="space-y-1">
                    {modulo.features.map((feat, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-zinc-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Footer do showcase */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 pt-6 border-t border-zinc-800/50 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Shield className="w-4 h-4" />
                <span>Dados Seguros</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Zap className="w-4 h-4" />
                <span>Processamento Rápido</span>
              </div>
            </div>
            <p className="text-[10px] text-zinc-600">v2.0.0 • Build 2026.01</p>
          </motion.div>
        </div>
      </div>

      {/* ============ LADO DIREITO - LOGIN ============ */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 lg:p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Pesquisa Eleitoral DF 2026</h1>
            <p className="text-xs text-zinc-500 mt-1">Produzido por Igor Morais Vasconcelos</p>
          </div>

          {/* Card de Login */}
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Acessar Sistema</h2>
              <p className="text-zinc-500 mt-2 text-sm">
                Entre com suas credenciais para continuar
              </p>
            </div>

            {/* Botão Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={carregandoGoogle}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-medium transition-all flex items-center justify-center gap-3 mb-6 disabled:opacity-50 shadow-lg shadow-white/5"
            >
              {carregandoGoogle ? (
                <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span>Continuar com Google</span>
            </button>

            {/* Divisor */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-zinc-900/60 text-zinc-500">ou entre com email</span>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="usuario" className="text-sm font-medium text-zinc-300">
                  Email ou Usuário
                </label>
                <input
                  id="usuario"
                  type="text"
                  {...register('usuario')}
                  className="w-full px-4 py-3.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-white placeholder:text-zinc-600 font-mono text-sm"
                  placeholder="seu@email.com"
                />
                {errors.usuario && (
                  <p className="text-sm text-red-400">{errors.usuario.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="senha" className="text-sm font-medium text-zinc-300">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    type={mostrarSenha ? 'text' : 'password'}
                    {...register('senha')}
                    className="w-full px-4 py-3.5 pr-12 rounded-xl bg-zinc-800/50 border border-zinc-700/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-white placeholder:text-zinc-600 font-mono text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.senha && (
                  <p className="text-sm text-red-400">{errors.senha.message}</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={carregando}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
              >
                {carregando ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Entrar</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Link Cadastro */}
            <div className="mt-6 pt-6 border-t border-zinc-800/50">
              <p className="text-center text-sm text-zinc-500">
                Não tem uma conta?{' '}
                <Link href="/cadastro" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Cadastre-se gratuitamente
                </Link>
              </p>
            </div>

            {/* Demo Access */}
            <div className="mt-4 p-3 rounded-xl bg-zinc-800/30 border border-zinc-700/30">
              <p className="text-xs text-zinc-500 text-center">
                <span className="text-zinc-400 font-medium">Acesso Demo:</span> admin / admin123
              </p>
            </div>
          </div>

          {/* Mobile Footer */}
          <div className="lg:hidden mt-6 text-center">
            <p className="text-[10px] text-zinc-600">
              © 2024-2026 Igor Morais Vasconcelos • Todos os direitos reservados
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
