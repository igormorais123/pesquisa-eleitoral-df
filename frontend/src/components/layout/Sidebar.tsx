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
    cor: 'slate',
  },
  {
    titulo: 'Configurações',
    href: '/configuracoes',
    icone: Settings,
    descricao: 'Preferências do sistema',
    cor: 'slate',
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
  const cores: Record<string, { ativo: string; hover: string; icon: string; iconActive: string }> = {
    blue: {
      ativo: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
      hover: 'hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-300',
      icon: 'text-blue-600 dark:text-blue-400',
      iconActive: 'text-blue-700 dark:text-blue-300',
    },
    cyan: {
      ativo: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30',
      hover: 'hover:bg-cyan-50 dark:hover:bg-cyan-500/10 hover:text-cyan-700 dark:hover:text-cyan-300',
      icon: 'text-cyan-600 dark:text-cyan-400',
      iconActive: 'text-cyan-700 dark:text-cyan-300',
    },
    emerald: {
      ativo: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
      hover: 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300',
      icon: 'text-emerald-600 dark:text-emerald-400',
      iconActive: 'text-emerald-700 dark:text-emerald-300',
    },
    violet: {
      ativo: 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-500/30',
      hover: 'hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-700 dark:hover:text-violet-300',
      icon: 'text-violet-600 dark:text-violet-400',
      iconActive: 'text-violet-700 dark:text-violet-300',
    },
    amber: {
      ativo: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
      hover: 'hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300',
      icon: 'text-amber-600 dark:text-amber-400',
      iconActive: 'text-amber-700 dark:text-amber-300',
    },
    pink: {
      ativo: 'bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-500/30',
      hover: 'hover:bg-pink-50 dark:hover:bg-pink-500/10 hover:text-pink-700 dark:hover:text-pink-300',
      icon: 'text-pink-600 dark:text-pink-400',
      iconActive: 'text-pink-700 dark:text-pink-300',
    },
    orange: {
      ativo: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/30',
      hover: 'hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-700 dark:hover:text-orange-300',
      icon: 'text-orange-600 dark:text-orange-400',
      iconActive: 'text-orange-700 dark:text-orange-300',
    },
    teal: {
      ativo: 'bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-500/30',
      hover: 'hover:bg-teal-50 dark:hover:bg-teal-500/10 hover:text-teal-700 dark:hover:text-teal-300',
      icon: 'text-teal-600 dark:text-teal-400',
      iconActive: 'text-teal-700 dark:text-teal-300',
    },
    red: {
      ativo: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30',
      hover: 'hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300',
      icon: 'text-red-600 dark:text-red-400',
      iconActive: 'text-red-700 dark:text-red-300',
    },
    slate: {
      ativo: 'bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-500/30',
      hover: 'hover:bg-slate-50 dark:hover:bg-slate-500/10 hover:text-slate-700 dark:hover:text-slate-300',
      icon: 'text-slate-600 dark:text-slate-400',
      iconActive: 'text-slate-700 dark:text-slate-300',
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
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-3" onClick={fecharMobile}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
            <Globe className="w-5 h-5 text-white" />
          </div>
          {!recolhido && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="overflow-hidden"
            >
              <h1 className="font-bold text-foreground text-sm">Pesquisa Eleitoral</h1>
              <p className="text-[10px] text-muted-foreground font-mono">DF 2026 v2.0</p>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Menu Principal */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
        {!recolhido && (
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
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
                      ? `${corClasses.ativo} border font-medium`
                      : `text-foreground/70 ${corClasses.hover} border border-transparent`
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
                      ativo ? corClasses.iconActive : corClasses.icon
                    )}
                  />
                  {!recolhido && (
                    <div className="overflow-hidden flex-1">
                      <span className="block text-sm">{item.titulo}</span>
                      <span className={cn(
                        'block text-[10px] truncate',
                        ativo ? 'opacity-80' : 'text-muted-foreground'
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
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3">
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
                      'text-foreground/70 hover:text-foreground hover:bg-muted border border-transparent hover:border-border'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                      'bg-muted group-hover:bg-background'
                    )}>
                      <Icone className={cn('w-4 h-4', corClasses.icon)} />
                    </div>
                    <span className="text-sm">{acao.titulo}</span>
                    <Zap className="w-3 h-3 ml-auto text-muted-foreground group-hover:text-amber-500 transition-colors" />
                  </Link>
                </motion.div>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer da Sidebar */}
      <div className="p-3 border-t border-border">
        {/* Status do Sistema */}
        {!recolhido && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-muted-foreground">Sistema Online</span>
            </div>
          </div>
        )}

        {/* Botão Recolher */}
        <button
          onClick={toggleRecolhido}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all',
            'text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
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
          'bg-card/95 backdrop-blur-xl border-r border-border shadow-lg',
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
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={fecharMobile}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 z-50 h-screen w-72 flex flex-col transition-transform duration-300 ease-out',
          'bg-card backdrop-blur-xl border-r border-border shadow-2xl',
          mobileAberto ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={fecharMobile}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-muted transition-colors"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
