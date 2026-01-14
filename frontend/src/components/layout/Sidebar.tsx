'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Vote,
  Home,
  FileText,
  Upload,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  {
    titulo: 'Início',
    href: '/',
    icone: Home,
    descricao: 'Visão geral do sistema',
  },
  {
    titulo: 'Eleitores',
    href: '/eleitores',
    icone: Users,
    descricao: 'Gerenciar agentes sintéticos',
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
    titulo: 'Configurações',
    href: '/configuracoes',
    icone: Settings,
    descricao: 'Ajustes do sistema',
  },
];

const acoesRapidas = [
  {
    titulo: 'Upload Eleitores',
    href: '/eleitores/upload',
    icone: Upload,
  },
  {
    titulo: 'Gerar Eleitores',
    href: '/eleitores/gerar',
    icone: Sparkles,
  },
  {
    titulo: 'Nova Entrevista',
    href: '/entrevistas/nova',
    icone: FileText,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [recolhido, setRecolhido] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 flex flex-col',
        recolhido ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Vote className="w-5 h-5 text-primary" />
          </div>
          {!recolhido && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-foreground text-sm">Pesquisa Eleitoral</h1>
              <p className="text-xs text-muted-foreground">DF 2026</p>
            </div>
          )}
        </Link>
      </div>

      {/* Menu Principal */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const ativo = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icone = item.icone;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group',
                ativo
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
              title={recolhido ? item.titulo : undefined}
            >
              <Icone
                className={cn(
                  'w-5 h-5 flex-shrink-0',
                  ativo ? 'text-primary-foreground' : 'group-hover:text-primary'
                )}
              />
              {!recolhido && (
                <div className="overflow-hidden">
                  <span className="block text-sm font-medium">{item.titulo}</span>
                  <span
                    className={cn(
                      'block text-xs',
                      ativo ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}
                  >
                    {item.descricao}
                  </span>
                </div>
              )}
            </Link>
          );
        })}

        {/* Separador */}
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

      {/* Botão Recolher */}
      <div className="p-4 border-t border-border">
        <button
          onClick={() => setRecolhido(!recolhido)}
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
    </aside>
  );
}
