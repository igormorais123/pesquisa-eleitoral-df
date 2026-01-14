'use client';

import { useAuthStore } from '@/stores/auth-store';
import {
  LogOut,
  User,
  Bell,
  Search,
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  titulo?: string;
  subtitulo?: string;
}

export function Header({ titulo, subtitulo }: HeaderProps) {
  const { usuario, logout } = useAuthStore();
  const [menuAberto, setMenuAberto] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Lado Esquerdo - Título */}
        <div className="flex items-center gap-4">
          {/* Botão menu mobile */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setMenuAberto(!menuAberto)}
          >
            {menuAberto ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>

          {titulo && (
            <div>
              <h1 className="text-lg font-semibold text-foreground">{titulo}</h1>
              {subtitulo && (
                <p className="text-sm text-muted-foreground">{subtitulo}</p>
              )}
            </div>
          )}
        </div>

        {/* Centro - Busca */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar eleitores, entrevistas..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground bg-background border border-border rounded">
              <span>⌘</span>
              <span>K</span>
            </kbd>
          </div>
        </div>

        {/* Lado Direito - Ações */}
        <div className="flex items-center gap-2">
          {/* Busca mobile */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setBuscaAberta(!buscaAberta)}
          >
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Notificações */}
          <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </button>

          {/* Tema (placeholder) */}
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <Moon className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Separador */}
          <div className="w-px h-8 bg-border mx-2" />

          {/* Usuário */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground">
                {usuario?.nome || 'Usuário'}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {usuario?.papel || 'admin'}
              </p>
            </div>

            <div className="relative group">
              <button className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors">
                <User className="w-5 h-5 text-primary" />
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-card border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium text-foreground">
                    {usuario?.nome || 'Usuário'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {usuario?.usuario || 'usuario'}
                  </p>
                </div>

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Busca mobile expandida */}
      {buscaAberta && (
        <div className="md:hidden px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary border border-border focus:border-primary outline-none text-sm text-foreground"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
