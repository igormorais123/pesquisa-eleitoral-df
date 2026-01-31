'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Users,
  MessageSquare,
  BarChart3,
  Home,
  Menu,
  X,
  Upload,
  Sparkles,
  Vote,
  Landmark,
} from 'lucide-react';
import { useState } from 'react';

const menuPrincipal = [
  {
    titulo: 'Início',
    href: '/dashboard',
    icone: Home,
  },
  {
    titulo: 'Eleitores',
    href: '/eleitores',
    icone: Users,
  },
  {
    titulo: 'Parlamentares',
    href: '/parlamentares',
    icone: Landmark,
  },
  {
    titulo: 'Entrevistas',
    href: '/entrevistas',
    icone: MessageSquare,
  },
  {
    titulo: 'Resultados',
    href: '/resultados',
    icone: BarChart3,
  },
];

const menuSecundario = [
  {
    titulo: 'Upload Eleitores',
    href: '/eleitores/upload',
    icone: Upload,
    descricao: 'Carregar arquivo JSON',
  },
  {
    titulo: 'Gerar Agentes',
    href: '/eleitores/gerar',
    icone: Sparkles,
    descricao: 'Criar eleitores e gestores com IA',
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <>
      {/* Bottom Navigation Bar - Visível apenas em mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t lg:hidden safe-area-bottom bg-card/95 border-border/50 dark:bg-slate-900/95 dark:border-white/5 no-tap-highlight">
        <div className="flex items-center justify-around h-16 px-1">
          {menuPrincipal.map((item) => {
            const ativo = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
            const Icone = item.icone;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 py-2 px-2 min-w-[56px] rounded-xl transition-all active:scale-90 active:opacity-80',
                  ativo
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-xl transition-colors',
                  ativo && 'bg-primary/15'
                )}>
                  <Icone className={cn('w-5 h-5', ativo && 'text-primary')} />
                </div>
                <span className={cn(
                  'text-[10px] font-medium leading-tight',
                  ativo && 'text-primary'
                )}>{item.titulo}</span>
              </Link>
            );
          })}

          {/* Botão Menu Extra */}
          <button
            onClick={() => setMenuAberto(true)}
            className="flex flex-col items-center justify-center gap-0.5 py-2 px-2 min-w-[56px] text-muted-foreground transition-all active:scale-90 active:opacity-80 rounded-xl"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-xl">
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium leading-tight">Mais</span>
          </button>
        </div>
      </nav>

      {/* Drawer Menu - Para ações adicionais */}
      {menuAberto && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMenuAberto(false)}
          />

          {/* Drawer */}
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl max-h-[80vh] lg:hidden animate-in slide-in-from-bottom duration-300 bg-card border-t border-border dark:bg-slate-900 dark:border-white/10">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-4 border-b border-border dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <Vote className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">Pesquisa Eleitoral</h2>
                  <p className="text-xs text-muted-foreground">DF 2026</p>
                </div>
              </div>
              <button
                onClick={() => setMenuAberto(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2 overflow-y-auto max-h-[50vh]">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-3">
                Ações Rápidas
              </p>

              {menuSecundario.map((item) => {
                const Icone = item.icone;
                const ativo = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuAberto(false)}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl transition-all active:scale-[0.98]',
                      ativo
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary/50 hover:bg-secondary text-foreground'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        ativo ? 'bg-primary-foreground/20' : 'bg-background'
                      )}
                    >
                      <Icone className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="block font-medium">{item.titulo}</span>
                      <span
                        className={cn(
                          'block text-xs',
                          ativo ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        )}
                      >
                        {item.descricao}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Safe area padding */}
            <div className="safe-area-bottom" />
            <div className="h-4" />
          </div>
        </>
      )}
    </>
  );
}
