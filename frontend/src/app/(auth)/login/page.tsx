'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Eye, EyeOff, LogIn, Users, BarChart3,
  Brain, Database, FileText, TrendingUp, Map,
  MessageSquare, CheckCircle2, ArrowRight,
  Globe, Lock, Landmark, Building2, UserCircle,
  Target, Sparkles, History, Settings, CheckSquare,
  Play, Zap, Shield, Award, Clock, LineChart
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/services/api';

const loginSchema = z.object({
  usuario: z.string().min(1, 'Digite o email ou usuário'),
  senha: z.string().min(1, 'Digite a senha'),
});

type LoginForm = z.infer<typeof loginSchema>;

// Todas as funcionalidades do sistema
const funcionalidades = [
  {
    categoria: 'Base de Dados',
    items: [
      { icon: Users, nome: 'Eleitores Sintéticos', desc: '1000+ perfis com 60 atributos' },
      { icon: Landmark, nome: 'Parlamentares', desc: 'Deputados e Senadores do DF' },
      { icon: Building2, nome: 'Gestores Públicos', desc: 'Gestores e autoridades' },
      { icon: UserCircle, nome: 'Candidatos 2026', desc: 'Perfis dos candidatos' },
    ]
  },
  {
    categoria: 'Pesquisa & Análise',
    items: [
      { icon: MessageSquare, nome: 'Entrevistas com IA', desc: 'Simulação em tempo real' },
      { icon: Target, nome: 'Cenários Eleitorais', desc: 'Projeções e simulações' },
      { icon: FileText, nome: 'Templates', desc: 'Modelos de perguntas' },
      { icon: CheckSquare, nome: 'Validação', desc: 'Metodologia científica' },
    ]
  },
  {
    categoria: 'Visualização',
    items: [
      { icon: BarChart3, nome: 'Resultados', desc: 'Dashboards interativos' },
      { icon: Map, nome: 'Mapa de Calor', desc: 'Visualização geográfica' },
      { icon: TrendingUp, nome: 'Analytics', desc: 'Análises avançadas' },
      { icon: History, nome: 'Histórico', desc: 'Pesquisas anteriores' },
    ]
  },
  {
    categoria: 'Recursos IA',
    items: [
      { icon: Brain, nome: 'Claude AI', desc: 'Inteligência artificial' },
      { icon: Sparkles, nome: 'Gerador de Mensagens', desc: 'Comunicação política' },
      { icon: Database, nome: 'Gerar Agentes', desc: 'Criar novos perfis' },
      { icon: Settings, nome: 'Configurações', desc: 'Personalização do sistema' },
    ]
  },
];

// Estatísticas do sistema
const stats = [
  { valor: '1.247', label: 'Eleitores', icon: Users },
  { valor: '60+', label: 'Atributos', icon: Database },
  { valor: '31', label: 'Regiões DF', icon: Map },
  { valor: '16', label: 'Módulos', icon: Zap },
];

// Diferenciais
const diferenciais = [
  { icon: Brain, titulo: 'IA Claude Opus', desc: 'Respostas ultra-realistas' },
  { icon: Shield, titulo: 'Metodologia Científica', desc: 'Validação estatística' },
  { icon: Clock, titulo: 'Tempo Real', desc: 'Simulações instantâneas' },
  { icon: LineChart, titulo: 'Insights Automáticos', desc: 'Análises inteligentes' },
];

export default function LoginPage() {
  const router = useRouter();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [carregandoGoogle, setCarregandoGoogle] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState(0);
  const login = useAuthStore((state) => state.login);

  // Auto-rotate categorias
  useEffect(() => {
    const interval = setInterval(() => {
      setCategoriaAtiva((prev) => (prev + 1) % funcionalidades.length);
    }, 4000);
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
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

      {/* ============ LADO ESQUERDO - SHOWCASE COMPLETO ============ */}
      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

        {/* Orbs decorativos */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col w-full p-10 xl:p-14">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Pesquisa Eleitoral DF</h1>
                <p className="text-blue-200 text-sm">Sistema de Simulação 2026</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-xs">Desenvolvido por</p>
              <p className="text-white font-semibold">Igor Morais Vasconcelos</p>
            </div>
          </motion.div>

          {/* Título Principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-10"
          >
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Plataforma Completa para
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-cyan-200 to-white">
                Pesquisa Eleitoral com IA
              </span>
            </h2>
            <p className="mt-4 text-lg text-blue-100 max-w-xl">
              Simule cenários eleitorais com mais de 1000 eleitores sintéticos usando
              inteligência artificial Claude para respostas ultra-realistas.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 grid grid-cols-4 gap-4"
          >
            {stats.map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <stat.icon className="w-5 h-5 text-blue-200 mb-2" />
                <p className="text-2xl font-bold text-white">{stat.valor}</p>
                <p className="text-xs text-blue-200">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Funcionalidades - Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex-1"
          >
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-yellow-300" />
              <h3 className="text-white font-semibold">Funcionalidades do Sistema</h3>
            </div>

            {/* Tabs de categorias */}
            <div className="flex gap-2 mb-4">
              {funcionalidades.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => setCategoriaAtiva(i)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    categoriaAtiva === i
                      ? 'bg-white text-indigo-700 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {cat.categoria}
                </button>
              ))}
            </div>

            {/* Grid de funcionalidades */}
            <div className="grid grid-cols-2 gap-3">
              {funcionalidades[categoriaAtiva].items.map((item, i) => (
                <motion.div
                  key={`${categoriaAtiva}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{item.nome}</p>
                    <p className="text-blue-200 text-xs">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Diferenciais */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 grid grid-cols-4 gap-3"
          >
            {diferenciais.map((dif, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                  <dif.icon className="w-6 h-6 text-cyan-300" />
                </div>
                <p className="text-white text-xs font-medium">{dif.titulo}</p>
                <p className="text-blue-300 text-[10px]">{dif.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between"
          >
            <p className="text-blue-200 text-xs">© 2024-2026 Igor Morais Vasconcelos</p>
            <p className="text-blue-200 text-xs">Todos os direitos reservados</p>
          </motion.div>
        </div>
      </div>

      {/* ============ LADO DIREITO - LOGIN ============ */}
      <div className="w-full lg:w-[42%] flex items-center justify-center p-6 lg:p-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pesquisa Eleitoral DF</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sistema de Simulação 2026</p>
          </div>

          {/* Card de Login */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Entrar no Sistema</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                Acesse sua conta para continuar
              </p>
            </div>

            {/* Botão Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={carregandoGoogle}
              className="w-full py-3.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-medium transition-all flex items-center justify-center gap-3 border-2 border-slate-200 dark:border-slate-700 mb-6 disabled:opacity-50 shadow-sm"
            >
              {carregandoGoogle ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
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
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white dark:bg-slate-900 text-slate-400">ou entre com email</span>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="usuario" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email ou Usuário
                </label>
                <input
                  id="usuario"
                  type="text"
                  {...register('usuario')}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                  placeholder="seu@email.com"
                />
                {errors.usuario && (
                  <p className="text-sm text-red-500">{errors.usuario.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="senha" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    type={mostrarSenha ? 'text' : 'password'}
                    {...register('senha')}
                    className="w-full px-4 py-3.5 pr-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.senha && (
                  <p className="text-sm text-red-500">{errors.senha.message}</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={carregando}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
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
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                Não tem uma conta?{' '}
                <Link href="/cadastro" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold transition-colors">
                  Cadastre-se
                </Link>
              </p>
            </div>

            {/* Demo Access */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 border border-blue-100 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Play className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">Acesso Demo</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-mono bg-white dark:bg-slate-700 px-2 py-1 rounded text-blue-600 dark:text-blue-300">admin</span>
                {' / '}
                <span className="font-mono bg-white dark:bg-slate-700 px-2 py-1 rounded text-blue-600 dark:text-blue-300">admin123</span>
              </p>
            </div>
          </div>

          {/* Footer Mobile */}
          <div className="lg:hidden mt-6 text-center">
            <p className="text-xs text-slate-400">
              © 2024-2026 Igor Morais Vasconcelos
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
