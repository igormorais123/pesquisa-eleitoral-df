'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Users,
  MessageSquare,
  BarChart3,
  Vote,
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
  Zap,
} from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebar-store';
import { useAuthStore } from '@/stores/auth-store';
import { useEffect } from 'react';
import { InteiaLogo } from '@/components/branding';

const menuItems = [
  {
    titulo: 'Início',
    href: '/',
    icone: Home,
    descricao: 'Visão geral do sistema',
  },
  {
    titulo: 'Admin Usuários',
    href: '/admin/usuarios',
    icone: Shield,
    descricao: 'Gerenciar e aprovar usuários',
    adminOnly: true,
  },
  {
    titulo: 'Validação',
    href: '/validacao',
    icone: CheckSquare,
    descricao: 'Validação estatística',
  },
  {
    titulo: 'Eleitores',
    href: '/eleitores',
    icone: Users,
    descricao: 'Gerenciar agentes sintéticos',
  },
  {
    titulo: 'Parlamentares',
    href: '/parlamentares',
    icone: Landmark,
    descricao: 'Deputados e senadores do DF',
  },
  {
    titulo: 'Gestores',
    href: '/gestores',
    icone: Building2,
    descricao: 'Gestores publicos e privados',
  },
  {
    titulo: 'Candidatos',
    href: '/candidatos',
    icone: UserCircle,
    descricao: 'Candidatos às eleições 2026',
  },
  {
    titulo: 'Cenários',
    href: '/cenarios',
    icone: Target,
    descricao: 'Simulador de cenários eleitorais',
  },
  {
    titulo: 'Templates',
    href: '/templates',
    icone: FileText,
    descricao: 'Modelos de perguntas prontos',
  },
  {
    titulo: 'Entrevistas',
    href: '/entrevistas',
    icone: MessageSquare,
    descricao: 'Criar e executar pesquisas',
  },
  {
    titulo: 'Resultados',
    href: '/resultados',
    icone: BarChart3,
    descricao: 'Análises e visualizações',
  },
  {
    titulo: 'Stress Tests',
    href: '/stress-tests',
    icone: Zap,
    descricao: 'Testes de resiliência do voto',
  },
  {
    titulo: 'Mapa',
    href: '/mapa',
    icone: Map,
    descricao: 'Mapa de calor por região',
  },
  {
    titulo: 'Analytics',
    href: '/analytics',
    icone: TrendingUp,
    descricao: 'Análises globais e correlações',
  },
  {
    titulo: 'Mensagens',
    href: '/mensagens',
    icone: Sparkles,
    descricao: 'Gerador de mensagens com IA',
  },
  {
    titulo: 'Histórico',
    href: '/historico',
    icone: History,
    descricao: 'Pesquisas anteriores',
  },
];

const acoesRapidas = [
  {
    titulo: 'Upload Eleitores',
    href: '/eleitores/upload',
    icone: Upload,
  },
  {
    titulo: 'Gerar Agentes',
    href: '/eleitores/gerar',
    icone: Sparkles,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { mobileAberto, recolhido, fecharMobile, toggleRecolhido } = useSidebarStore();
  const usuario = useAuthStore((state) => state.usuario);
  const isAdmin = usuario?.papel === 'admin';

  // Fechar sidebar mobile ao navegar
  useEffect(() => {
    fecharMobile();
  }, [pathname, fecharMobile]);

  // Fechar sidebar mobile ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        fecharMobile();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fecharMobile]);

  // Conteúdo da sidebar (reutilizado em desktop e mobile)
  const sidebarContent = (
    <>
      {/* Logo INTEIA */}
      <div className="p-4 border-b border-border dark:border-white/10">
        <Link href="/" className="flex items-center gap-3" onClick={fecharMobile}>
          {recolhido ? (
            <InteiaLogo size="sm" variant="icon" />
          ) : (
            <div className="flex flex-col">
              <InteiaLogo size="sm" variant="full" />
              <p className="text-[10px] text-muted-foreground mt-1 ml-7">
                Pesquisa Eleitoral DF 2026
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Menu Principal */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
          const ativo = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icone = item.icone;
          const isAdminItem = item.adminOnly;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={fecharMobile}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group',
                ativo
                  ? isAdminItem
                    ? 'bg-red-500/20 text-red-400 shadow-lg shadow-red-500/25'
                    : 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : isAdminItem
                    ? 'text-red-400/70 hover:text-red-400 hover:bg-red-500/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
              title={recolhido ? item.titulo : undefined}
            >
              <Icone
                className={cn(
                  'w-5 h-5 flex-shrink-0',
                  ativo
                    ? isAdminItem ? 'text-red-400' : 'text-primary-foreground'
                    : isAdminItem ? 'text-red-400/70' : 'group-hover:text-primary'
                )}
              />
              {!recolhido && (
                <div className="overflow-hidden">
                  <span className="block text-sm font-medium">{item.titulo}</span>
                  <span
                    className={cn(
                      'block text-xs',
                      ativo
                        ? isAdminItem ? 'text-red-400/70' : 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    )}
                  >
                    {item.descricao}
                  </span>
                </div>
              )}
            </Link>
          );
        })}

        {/* Separador - Ações Rápidas */}
        {!recolhido && (
          <>
            <div className="pt-4 pb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3">
                Ações Rápidas
              </span>
            </div>

            {acoesRapidas.map((acao) => {
              const Icone = acao.icone;

              return (
                <Link
                  key={acao.href}
                  href={acao.href}
                  onClick={fecharMobile}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all group"
                >
                  <Icone className="w-4 h-4 flex-shrink-0 group-hover:text-primary" />
                  <span className="text-sm">{acao.titulo}</span>
                </Link>
              );
            })}
          </>
        )}

      </nav>

      {/* Botão Recolher - apenas desktop */}
      <div className="hidden lg:block p-4 border-t border-border dark:border-white/10">
        <button
          onClick={toggleRecolhido}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        >
          {recolhido ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Recolher</span>
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Sidebar Desktop - fixa, escondida em mobile */}
      <aside
        className={cn(
          'hidden lg:flex fixed left-0 top-0 z-40 h-screen backdrop-blur-xl border-r transition-all duration-300 flex-col',
          'bg-card/80 border-border/50',
          'dark:bg-slate-900/80 dark:border-white/5',
          recolhido ? 'w-20' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Overlay mobile - escurece o fundo */}
      {mobileAberto && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={fecharMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Mobile - drawer lateral */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 z-50 h-screen w-72 backdrop-blur-xl border-r flex flex-col transition-transform duration-300 ease-in-out',
          'bg-card/95 border-border/50',
          'dark:bg-slate-900/95 dark:border-white/5',
          mobileAberto ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Botão fechar mobile */}
        <button
          onClick={fecharMobile}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors lg:hidden"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
