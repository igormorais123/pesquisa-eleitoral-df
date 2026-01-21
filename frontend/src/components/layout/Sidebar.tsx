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
  Settings,
  Activity,
} from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebar-store';
import { useAuthStore } from '@/stores/auth-store';
import { useEffect } from 'react';

const menuItems = [
  { titulo: 'Início', href: '/', icone: Home },
  { titulo: 'Admin Usuários', href: '/admin/usuarios', icone: Shield, adminOnly: true },
  { titulo: 'Validação', href: '/validacao', icone: CheckSquare },
  { titulo: 'Estimativas', href: '/estimativas', icone: Activity },
  { titulo: 'Eleitores', href: '/eleitores', icone: Users },
  { titulo: 'Parlamentares', href: '/parlamentares', icone: Landmark },
  { titulo: 'Gestores', href: '/gestores', icone: Building2 },
  { titulo: 'Candidatos', href: '/candidatos', icone: UserCircle },
  { titulo: 'Cenários', href: '/cenarios', icone: Target },
  { titulo: 'Templates', href: '/templates', icone: FileText },
  { titulo: 'Entrevistas', href: '/entrevistas', icone: MessageSquare },
  { titulo: 'Resultados', href: '/resultados', icone: BarChart3 },
  { titulo: 'Mapa', href: '/mapa', icone: Map },
  { titulo: 'Analytics', href: '/analytics', icone: TrendingUp },
  { titulo: 'Mensagens', href: '/mensagens', icone: Sparkles },
  { titulo: 'Histórico', href: '/historico', icone: History },
  { titulo: 'Configurações', href: '/configuracoes', icone: Settings },
];

const acoesRapidas = [
  { titulo: 'Upload Eleitores', href: '/eleitores/upload', icone: Upload },
  { titulo: 'Gerar Agentes', href: '/eleitores/gerar', icone: Sparkles },
];

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
      if (window.innerWidth >= 1024) fecharMobile();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fecharMobile]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-14 px-4 border-b border-border flex items-center">
        <Link href="/" className="flex items-center gap-3" onClick={fecharMobile}>
          <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center flex-shrink-0">
            <Target className="w-4 h-4 text-background" />
          </div>
          {!recolhido && (
            <span className="font-semibold text-foreground text-sm">Pesquisa DF</span>
          )}
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {menuItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
            const ativo = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icone = item.icone;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={fecharMobile}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  ativo
                    ? 'bg-foreground text-background font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                title={recolhido ? item.titulo : undefined}
              >
                <Icone className="w-4 h-4 flex-shrink-0" />
                {!recolhido && <span className="text-sm">{item.titulo}</span>}
              </Link>
            );
          })}

        {/* Ações Rápidas */}
        {!recolhido && (
          <>
            <div className="pt-4 pb-2 px-3">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
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
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Icone className="w-4 h-4" />
                  <span className="text-sm">{acao.titulo}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border">
        <button
          onClick={toggleRecolhido}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {recolhido ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Recolher</span>
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
          'bg-card border-r border-border',
          recolhido ? 'w-16' : 'w-56'
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
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={fecharMobile}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 z-50 h-screen w-64 flex flex-col transition-transform duration-300',
          'bg-card border-r border-border',
          mobileAberto ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={fecharMobile}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
