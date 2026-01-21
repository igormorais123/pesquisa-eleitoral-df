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
  Target,
  Map,
  TrendingUp,
  FileText,
  Settings,
  Building2,
  UserCircle,
  Activity,
} from 'lucide-react';
import { useState } from 'react';

const menuPrincipal = [
  {
    titulo: 'Início',
    href: '/',
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
    titulo: 'Nova Entrevista',
    href: '/entrevistas/nova',
    icone: MessageSquare,
    descricao: 'Criar nova pesquisa com IA',
  },
  {
    titulo: 'Gerar Agentes',
    href: '/eleitores/gerar',
    icone: Sparkles,
    descricao: 'Criar eleitores e gestores com IA',
  },
  {
    titulo: 'Upload Eleitores',
    href: '/eleitores/upload',
    icone: Upload,
    descricao: 'Carregar arquivo JSON',
  },
];

const menuCompleto = [
  {
    categoria: 'Agentes',
    itens: [
      { titulo: 'Gestores', href: '/gestores', icone: Building2 },
      { titulo: 'Candidatos', href: '/candidatos', icone: UserCircle },
    ],
  },
  {
    categoria: 'Análise',
    itens: [
      { titulo: 'Cenários', href: '/cenarios', icone: Target },
      { titulo: 'Estimativas', href: '/estimativas', icone: Activity },
      { titulo: 'Analytics', href: '/analytics', icone: TrendingUp },
      { titulo: 'Mapa', href: '/mapa', icone: Map },
    ],
  },
  {
    categoria: 'Ferramentas',
    itens: [
      { titulo: 'Templates', href: '/templates', icone: FileText },
      { titulo: 'Mensagens', href: '/mensagens', icone: Sparkles },
      { titulo: 'Configurações', href: '/configuracoes', icone: Settings },
    ],
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <>
      {/* Bottom Navigation Bar - Visível apenas em mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border lg:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {menuPrincipal.map((item) => {
            const ativo = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));
            const Icone = item.icone;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[64px] transition-colors',
                  ativo ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icone className={cn('w-5 h-5', ativo && 'text-primary')} />
                <span className="text-[10px] font-medium">{item.titulo}</span>
              </Link>
            );
          })}

          {/* Botão Menu Extra */}
          <button
            onClick={() => setMenuAberto(true)}
            className="flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[64px] text-muted-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">Mais</span>
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
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl max-h-[80vh] lg:hidden animate-in slide-in-from-bottom duration-300">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-muted rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Vote className="w-5 h-5 text-primary" />
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
            <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
              {/* Ações Rápidas */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-3">
                  Ações Rápidas
                </p>
                <div className="space-y-2">
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
              </div>

              {/* Menu Completo por Categoria */}
              {menuCompleto.map((grupo) => (
                <div key={grupo.categoria}>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-3">
                    {grupo.categoria}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {grupo.itens.map((item) => {
                      const Icone = item.icone;
                      const ativo = pathname === item.href || pathname.startsWith(`${item.href}/`);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMenuAberto(false)}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98]',
                            ativo
                              ? 'bg-foreground text-background'
                              : 'bg-secondary/50 text-foreground'
                          )}
                        >
                          <Icone className="w-5 h-5" />
                          <span className="text-sm font-medium">{item.titulo}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Safe area padding */}
            <div className="h-8" />
          </div>
        </>
      )}
    </>
  );
}
