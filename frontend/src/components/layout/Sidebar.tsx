'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Users,
  MessageSquare,
  BarChart3,
  Home,
  FileText,
  Upload,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  History,
  X,
  CheckSquare,
  Shield,
  Landmark,
  UserCircle,
  Target,
  Map,
  Building2,
  Globe,
  Settings,
  Zap,
} from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebar-store';
import { useAuthStore } from '@/stores/auth-store';
import { useEffect } from 'react';

const menuItems = [
  {
    titulo: 'Início',
    href: '/',
    icone: Home,
    descricao: 'Visão geral do sistema',
    cor: 'blue',
  },
  {
    titulo: 'Admin Usuários',
    href: '/admin/usuarios',
    icone: Shield,
    descricao: 'Gerenciar e aprovar usuários',
    adminOnly: true,
    cor: 'red',
  },
  {
    titulo: 'Validação',
    href: '/validacao',
    icone: CheckSquare,
    descricao: 'Validação estatística',
    cor: 'emerald',
  },
  {
    titulo: 'Eleitores',
    href: '/eleitores',
    icone: Users,
    descricao: 'Gerenciar agentes sintéticos',
    cor: 'cyan',
  },
  {
    titulo: 'Parlamentares',
    href: '/parlamentares',
    icone: Landmark,
    descricao: 'Deputados e senadores do DF',
    cor: 'violet',
  },
  {
    titulo: 'Gestores',
    href: '/gestores',
    icone: Building2,
    descricao: 'Gestores publicos e privados',
    cor: 'amber',
  },
  {
    titulo: 'Candidatos',
    href: '/candidatos',
    icone: UserCircle,
    descricao: 'Candidatos às eleições 2026',
    cor: 'pink',
  },
  {
    titulo: 'Cenários',
    href: '/cenarios',
    icone: Target,
    descricao: 'Simulador de cenários eleitorais',
    cor: 'orange',
  },
  {
    titulo: 'Templates',
    href: '/templates',
    icone: FileText,
    descricao: 'Modelos de perguntas prontos',
    cor: 'teal',
  },
  {
    titulo: 'Entrevistas',
    href: '/entrevistas',
    icone: MessageSquare,
    descricao: 'Criar e executar pesquisas',
    cor: 'blue',
  },
  {
    titulo: 'Resultados',
    href: '/resultados',
    icone: BarChart3,
    descricao: 'Análises e visualizações',
    cor: 'emerald',
  },
  {
    titulo: 'Mapa',
    href: '/mapa',
    icone: Map,
    descricao: 'Mapa de calor por região',
    cor: 'cyan',
  },
  {
    titulo: 'Analytics',
    href: '/analytics',
    icone: TrendingUp,
    descricao: 'Análises globais e correlações',
    cor: 'violet',
  },
  {
    titulo: 'Mensagens',
    href: '/mensagens',
    icone: Sparkles,
    descricao: 'Gerador de mensagens com IA',
    cor: 'amber',
  },
  {
    titulo: 'Histórico',
    href: '/historico',
    icone: History,
    descricao: 'Pesquisas anteriores',
    cor: 'zinc',
  },
  {
    titulo: 'Configurações',
    href: '/configuracoes',
    icone: Settings,
    descricao: 'Preferências do sistema',
    cor: 'zinc',
  },
];

const acoesRapidas = [
  {
    titulo: 'Upload Eleitores',
    href: '/eleitores/upload',
    icone: Upload,
    cor: 'cyan',
  },
  {
    titulo: 'Gerar Agentes',
    href: '/eleitores/gerar',
    icone: Sparkles,
    cor: 'violet',
  },
];

const getCorClasses = (cor: string, ativo: boolean) => {
  const cores: Record<string, { ativo: string; hover: string; icon: string }> = {
    blue: {
      ativo: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      hover: 'hover:bg-blue-500/10 hover:text-blue-400',
      icon: 'text-blue-400',
    },
    cyan: {
      ativo: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      hover: 'hover:bg-cyan-500/10 hover:text-cyan-400',
      icon: 'text-cyan-400',
    },
    emerald: {
      ativo: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      hover: 'hover:bg-emerald-500/10 hover:text-emerald-400',
      icon: 'text-emerald-400',
    },
    violet: {
      ativo: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
      hover: 'hover:bg-violet-500/10 hover:text-violet-400',
      icon: 'text-violet-400',
    },
    amber: {
      ativo: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      hover: 'hover:bg-amber-500/10 hover:text-amber-400',
      icon: 'text-amber-400',
    },
    pink: {
      ativo: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      hover: 'hover:bg-pink-500/10 hover:text-pink-400',
      icon: 'text-pink-400',
    },
    orange: {
      ativo: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      hover: 'hover:bg-orange-500/10 hover:text-orange-400',
      icon: 'text-orange-400',
    },
    teal: {
      ativo: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      hover: 'hover:bg-teal-500/10 hover:text-teal-400',
      icon: 'text-teal-400',
    },
    red: {
      ativo: 'bg-red-500/20 text-red-400 border-red-500/30',
      hover: 'hover:bg-red-500/10 hover:text-red-400',
      icon: 'text-red-400',
    },
    zinc: {
      ativo: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
      hover: 'hover:bg-zinc-500/10 hover:text-zinc-300',
      icon: 'text-zinc-400',
    },
  };

  return cores[cor] || cores.blue;
};

export function Sidebar() {
  const pathname = usePathname();
  const { mobileAberto, recolhido, fecharMobile, toggleRecolhido } = useSidebarStore();
  const usuario = useAuthStore((state) => state.usuario);
  const isAdmin = usuario?.papel === 'admin';

  useEffect(() => {
    fecharMobile();
  }, [pathname, fecharMobile]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        fecharMobile();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fecharMobile]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-zinc-800/50">
        <Link href="/" className="flex items-center gap-3" onClick={fecharMobile}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
            <Globe className="w-5 h-5 text-white" />
          </div>
          {!recolhido && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="overflow-hidden"
            >
              <h1 className="font-bold text-white text-sm">Pesquisa Eleitoral</h1>
              <p className="text-[10px] text-zinc-500 font-mono">DF 2026 • v2.0</p>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Menu Principal */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
        {!recolhido && (
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-3 mb-2">
            Menu Principal
          </p>
        )}

        {menuItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item, index) => {
            const ativo = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icone = item.icone;
            const corClasses = getCorClasses(item.cor, ativo);

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <Link
                  href={item.href}
                  onClick={fecharMobile}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                    ativo
                      ? `${corClasses.ativo} border`
                      : `text-zinc-400 ${corClasses.hover} border border-transparent`
                  )}
                  title={recolhido ? item.titulo : undefined}
                >
                  {ativo && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-current rounded-r-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icone
                    className={cn(
                      'w-5 h-5 flex-shrink-0 transition-colors',
                      ativo ? corClasses.icon : `text-zinc-500 group-hover:${corClasses.icon}`
                    )}
                  />
                  {!recolhido && (
                    <div className="overflow-hidden flex-1">
                      <span className="block text-sm font-medium">{item.titulo}</span>
                      <span className={cn(
                        'block text-[10px] truncate',
                        ativo ? 'opacity-70' : 'text-zinc-600'
                      )}>
                        {item.descricao}
                      </span>
                    </div>
                  )}
                  {ativo && !recolhido && (
                    <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                  )}
                </Link>
              </motion.div>
            );
          })}

        {/* Ações Rápidas */}
        {!recolhido && (
          <>
            <div className="pt-4 pb-2">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-3">
                Ações Rápidas
              </p>
            </div>

            {acoesRapidas.map((acao, index) => {
              const Icone = acao.icone;
              const corClasses = getCorClasses(acao.cor, false);

              return (
                <motion.div
                  key={acao.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <Link
                    href={acao.href}
                    onClick={fecharMobile}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-xl transition-all group',
                      'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700/50'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                      'bg-zinc-800/50 group-hover:bg-zinc-700/50'
                    )}>
                      <Icone className={cn('w-4 h-4', corClasses.icon)} />
                    </div>
                    <span className="text-sm">{acao.titulo}</span>
                    <Zap className="w-3 h-3 ml-auto text-zinc-600 group-hover:text-amber-400 transition-colors" />
                  </Link>
                </motion.div>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer da Sidebar */}
      <div className="p-3 border-t border-zinc-800/50">
        {/* Status do Sistema */}
        {!recolhido && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-zinc-800/30 border border-zinc-700/30">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-zinc-400">Sistema Online</span>
            </div>
          </div>
        )}

        {/* Botão Recolher */}
        <button
          onClick={toggleRecolhido}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all',
            'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border border-zinc-800/50 hover:border-zinc-700/50'
          )}
        >
          {recolhido ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Recolher Menu</span>
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex fixed left-0 top-0 z-40 h-screen transition-all duration-300 flex-col',
          'bg-zinc-900/80 backdrop-blur-xl border-r border-zinc-800/50',
          recolhido ? 'w-20' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileAberto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={fecharMobile}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 z-50 h-screen w-72 flex flex-col transition-transform duration-300 ease-out',
          'bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800/50',
          mobileAberto ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={fecharMobile}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-zinc-800/50 transition-colors"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
