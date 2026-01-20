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
  Shield,
  ChevronDown,
  HelpCircle,
  Keyboard,
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
  info: { icon: Info, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/20' },
  success: { icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
  warning: { icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/20' },
  error: { icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/20' },
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
    <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Lado Esquerdo */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-accent transition-colors"
            onClick={toggleMobile}
            aria-label={mobileAberto ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileAberto ? (
              <X className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {titulo && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-lg font-semibold text-foreground">{titulo}</h1>
              {subtitulo && (
                <p className="text-xs text-muted-foreground">{subtitulo}</p>
              )}
            </motion.div>
          )}
        </div>

        {/* Centro - Busca */}
        <div className="hidden md:flex flex-1 max-w-lg mx-4">
          <button
            onClick={abrirBuscaGlobal}
            className="relative w-full group"
          >
            <div className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border hover:border-primary/30 hover:bg-muted transition-all">
              <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Buscar eleitores, entrevistas...
              </span>
              <kbd className="ml-auto hidden lg:flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-muted-foreground bg-background border border-border rounded-lg">
                <span>⌘</span>
                <span>K</span>
              </kbd>
            </div>
          </button>
        </div>

        {/* Lado Direito */}
        <div className="flex items-center gap-1">
          {/* Busca mobile */}
          <button
            className="md:hidden p-2.5 rounded-xl hover:bg-accent transition-colors"
            onClick={abrirBuscaGlobal}
          >
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Notificações */}
          <div className="relative" ref={notificacoesRef}>
            <button
              className="relative p-2.5 rounded-xl hover:bg-accent transition-colors"
              onClick={toggleNotificacoes}
              aria-label="Notificações"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center text-[10px] font-bold text-white bg-primary rounded-full px-1"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </button>

            {/* Dropdown Notificações */}
            <AnimatePresence>
              {notificacoesAbertas && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Bell className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-semibold text-foreground text-sm">Notificações</span>
                        {unreadCount > 0 && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full">
                            {unreadCount} nova{unreadCount !== 1 && 's'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                          title="Marcar todas como lidas"
                        >
                          <CheckCheck className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAll}
                          className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                          title="Limpar todas"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lista */}
                  <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                          <Bell className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          Você será notificado sobre atualizações
                        </p>
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const style = notificationStyles[notif.type];
                        const Icon = style.icon;
                        return (
                          <div
                            key={notif.id}
                            className={`relative px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors ${
                              !notif.read ? 'bg-primary/5' : ''
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`w-4 h-4 ${style.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-sm font-medium ${notif.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                                    {notif.title}
                                  </p>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    {!notif.read && (
                                      <button
                                        onClick={() => markAsRead(notif.id)}
                                        className="p-1 rounded hover:bg-accent transition-colors"
                                        title="Marcar como lida"
                                      >
                                        <Check className="w-3 h-3 text-muted-foreground" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => removeNotification(notif.id)}
                                      className="p-1 rounded hover:bg-accent transition-colors"
                                      title="Remover"
                                    >
                                      <X className="w-3 h-3 text-muted-foreground" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                  {notif.message}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-[10px] text-muted-foreground/70">
                                    {formatDistanceToNow(new Date(notif.timestamp), {
                                      addSuffix: true,
                                      locale: ptBR,
                                    })}
                                  </span>
                                  {notif.action && (
                                    <a
                                      href={notif.action.href}
                                      className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                                    >
                                      {notif.action.label}
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                            {!notif.read && (
                              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                            )}
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
            className="p-2.5 rounded-xl hover:bg-accent transition-colors"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Separador */}
          <div className="w-px h-8 bg-border mx-2 hidden sm:block" />

          {/* Perfil */}
          <div className="relative" ref={perfilRef}>
            <button
              onClick={() => setPerfilAberto(!perfilAberto)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-accent transition-colors"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-primary/20">
                  {usuario?.nome ? usuario.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'US'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-card rounded-full" />
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-foreground leading-tight">
                  {usuario?.nome?.split(' ')[0] || 'Usuário'}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight capitalize">
                  {usuario?.papel === 'admin' ? 'Administrador' : 'Usuário'}
                </p>
              </div>

              <ChevronDown className={`w-4 h-4 text-muted-foreground hidden sm:block transition-transform ${perfilAberto ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Perfil */}
            <AnimatePresence>
              {perfilAberto && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
                        {usuario?.nome ? usuario.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'US'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {usuario?.nome || 'Usuário'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {usuario?.email || 'email@exemplo.com'}
                        </p>
                        {usuario?.papel === 'admin' && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[10px] font-medium bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Opções */}
                  <div className="py-2">
                    {usuario?.papel === 'admin' && (
                      <Link
                        href="/admin/usuarios"
                        onClick={() => setPerfilAberto(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="font-medium">Admin Usuários</p>
                          <p className="text-[10px] text-muted-foreground">Gerenciar contas</p>
                        </div>
                      </Link>
                    )}

                    <Link
                      href="/configuracoes"
                      onClick={() => setPerfilAberto(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Meu Perfil</p>
                        <p className="text-[10px] text-muted-foreground">Editar informações</p>
                      </div>
                    </Link>

                    <Link
                      href="/configuracoes"
                      onClick={() => setPerfilAberto(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Settings className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Configurações</p>
                        <p className="text-[10px] text-muted-foreground">Ajustes do sistema</p>
                      </div>
                    </Link>
                  </div>

                  <div className="border-t border-border" />

                  {/* Ajuda */}
                  <div className="py-2">
                    <a
                      href="https://github.com/anthropics/claude-code/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>Central de Ajuda</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>

                    <button
                      onClick={() => { abrirBuscaGlobal(); setPerfilAberto(false); }}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Keyboard className="w-4 h-4" />
                        <span>Busca Rápida</span>
                      </div>
                      <kbd className="text-[10px] px-1.5 py-0.5 font-mono bg-muted border border-border rounded">⌘K</kbd>
                    </button>
                  </div>

                  <div className="border-t border-border" />

                  {/* Logout */}
                  <div className="py-2">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Sair da conta</span>
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
