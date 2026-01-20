'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { useNotificationsStore, type Notification } from '@/stores/notifications-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  User,
  Bell,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  Check,
  CheckCheck,
  Trash2,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Settings,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GlobalSearch } from '@/components/search/GlobalSearch';

interface HeaderProps {
  titulo?: string;
  subtitulo?: string;
}

const notificationStyles: Record<Notification['type'], { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  success: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-500/10' },
};

export function Header({ titulo, subtitulo }: HeaderProps) {
  const { usuario, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const {
    notifications,
    unreadCount,
    isOpen: notificacoesAbertas,
    toggleOpen: toggleNotificacoes,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotificationsStore();

  const { mobileAberto, toggleMobile } = useSidebarStore();
  const [buscaGlobalAberta, setBuscaGlobalAberta] = useState(false);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const notificacoesRef = useRef<HTMLDivElement>(null);
  const perfilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificacoesRef.current && !notificacoesRef.current.contains(event.target as Node)) {
        if (notificacoesAbertas) toggleNotificacoes();
      }
      if (perfilRef.current && !perfilRef.current.contains(event.target as Node)) {
        setPerfilAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificacoesAbertas, toggleNotificacoes]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setBuscaGlobalAberta((prev) => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const abrirBuscaGlobal = useCallback(() => {
    setBuscaGlobalAberta(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        {/* Lado Esquerdo */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={toggleMobile}
          >
            {mobileAberto ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>

          {titulo && (
            <div>
              <h1 className="text-base font-semibold text-foreground">{titulo}</h1>
              {subtitulo && (
                <p className="text-xs text-muted-foreground">{subtitulo}</p>
              )}
            </div>
          )}
        </div>

        {/* Centro - Busca */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <button
            onClick={abrirBuscaGlobal}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-full bg-muted/50 border border-border hover:border-foreground/20 transition-colors"
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground flex-1 text-left">
              Buscar...
            </span>
            <kbd className="hidden lg:flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-muted-foreground bg-background border border-border rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Lado Direito */}
        <div className="flex items-center gap-1">
          {/* Busca mobile */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={abrirBuscaGlobal}
          >
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Notificações */}
          <div className="relative" ref={notificacoesRef}>
            <button
              className="relative p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={toggleNotificacoes}
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Dropdown Notificações */}
            <AnimatePresence>
              {notificacoesAbertas && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="font-medium text-foreground">Notificações</span>
                    <div className="flex items-center gap-1">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        >
                          <CheckCheck className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAll}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center">
                        <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">Sem notificações</p>
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const style = notificationStyles[notif.type];
                        const Icon = style.icon;
                        return (
                          <div
                            key={notif.id}
                            className={`px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${
                              !notif.read ? 'bg-muted/30' : ''
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`w-4 h-4 ${style.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{notif.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                                <span className="text-[10px] text-muted-foreground/70 mt-1 block">
                                  {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true, locale: ptBR })}
                                </span>
                              </div>
                              <button
                                onClick={() => removeNotification(notif.id)}
                                className="p-1 rounded hover:bg-muted transition-colors self-start"
                              >
                                <X className="w-3 h-3 text-muted-foreground" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tema */}
          <button
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {/* Separador */}
          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

          {/* Perfil */}
          <div className="relative" ref={perfilRef}>
            <button
              onClick={() => setPerfilAberto(!perfilAberto)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-background text-sm font-medium">
                {usuario?.nome ? usuario.nome[0].toUpperCase() : 'U'}
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground hidden sm:block transition-transform ${perfilAberto ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Perfil */}
            <AnimatePresence>
              {perfilAberto && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
                >
                  <div className="p-3 border-b border-border">
                    <p className="font-medium text-foreground text-sm">{usuario?.nome || 'Usuário'}</p>
                    <p className="text-xs text-muted-foreground">{usuario?.email || 'email@exemplo.com'}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/configuracoes"
                      onClick={() => setPerfilAberto(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <User className="w-4 h-4 text-muted-foreground" />
                      Meu Perfil
                    </Link>
                    <Link
                      href="/configuracoes"
                      onClick={() => setPerfilAberto(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      Configurações
                    </Link>
                  </div>

                  <div className="border-t border-border py-1">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <GlobalSearch
        isOpen={buscaGlobalAberta}
        onClose={() => setBuscaGlobalAberta(false)}
      />
    </header>
  );
}
