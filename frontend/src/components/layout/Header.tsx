'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { useNotificationsStore, type Notification } from '@/stores/notifications-store';
import { useSidebarStore } from '@/stores/sidebar-store';
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
  CreditCard,
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

// Ícones e cores por tipo de notificação
const notificationStyles: Record<Notification['type'], { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  success: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
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
  const notificacoesRef = useRef<HTMLDivElement>(null);

  // Fechar notificações ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificacoesRef.current && !notificacoesRef.current.contains(event.target as Node)) {
        if (notificacoesAbertas) toggleNotificacoes();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificacoesAbertas, toggleNotificacoes]);

  // Aplicar tema ao montar
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  // Atalho de teclado Cmd+K / Ctrl+K
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
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Lado Esquerdo - Título */}
        <div className="flex items-center gap-4">
          {/* Botão menu mobile */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={toggleMobile}
            aria-label={mobileAberto ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileAberto ? (
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
          <button
            onClick={abrirBuscaGlobal}
            className="relative w-full text-left"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <div className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary border border-border hover:border-primary/50 transition-all text-sm text-muted-foreground cursor-pointer">
              Buscar eleitores, entrevistas...
            </div>
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground bg-background border border-border rounded">
              <span>⌘</span>
              <span>K</span>
            </kbd>
          </button>
        </div>

        {/* Lado Direito - Ações */}
        <div className="flex items-center gap-2">
          {/* Busca mobile */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={abrirBuscaGlobal}
          >
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Notificações */}
          <div className="relative" ref={notificacoesRef}>
            <button
              className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={toggleNotificacoes}
              aria-label="Notificações"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-primary rounded-full px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown de notificações */}
            {notificacoesAbertas && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-foreground">Notificações</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full">
                        {unreadCount} {unreadCount === 1 ? 'nova' : 'novas'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                        title="Marcar todas como lidas"
                      >
                        <CheckCheck className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAll}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                        title="Limpar todas"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Lista de notificações */}
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center">
                      <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Nenhuma notificação
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Você será notificado sobre atualizações importantes
                      </p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const style = notificationStyles[notif.type];
                      const Icon = style.icon;
                      return (
                        <div
                          key={notif.id}
                          className={`relative px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors ${
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
                                      className="p-1 rounded hover:bg-secondary transition-colors"
                                      title="Marcar como lida"
                                    >
                                      <Check className="w-3 h-3 text-muted-foreground" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => removeNotification(notif.id)}
                                    className="p-1 rounded hover:bg-secondary transition-colors"
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
              </div>
            )}
          </div>

          {/* Tema */}
          <button
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Separador */}
          <div className="w-px h-8 bg-border mx-2" />

          {/* Perfil do Usuário - Estilo SaaS */}
          <div className="relative group">
            <button className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-secondary transition-colors">
              {/* Avatar */}
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold text-sm">
                  {usuario?.nome ? usuario.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'US'}
                </div>
                {/* Status online */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
              </div>

              {/* Info */}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-foreground leading-tight">
                  {usuario?.nome?.split(' ')[0] || 'Usuário'}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight capitalize">
                  {usuario?.papel === 'admin' ? 'Administrador' : 'Usuário'}
                </p>
              </div>

              <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
            </button>

            {/* Dropdown Menu - Estilo SaaS */}
            <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {/* Header do Perfil */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-lg">
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
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[10px] font-medium bg-primary/20 text-primary rounded-full">
                        <Shield className="w-3 h-3" />
                        Administrador
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Opções do Menu */}
              <div className="py-2">
                {/* Admin Usuários - apenas para admins */}
                {usuario?.papel === 'admin' && (
                  <Link
                    href="/admin/usuarios"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    <Shield className="w-4 h-4 text-red-400" />
                    <div>
                      <p className="font-medium">Admin Usuários</p>
                      <p className="text-[10px] text-muted-foreground">Gerenciar e aprovar contas</p>
                    </div>
                  </Link>
                )}

                <Link
                  href="/configuracoes"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Meu Perfil</p>
                    <p className="text-[10px] text-muted-foreground">Editar informações</p>
                  </div>
                </Link>

                <Link
                  href="/configuracoes"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Configurações</p>
                    <p className="text-[10px] text-muted-foreground">Ajustes do sistema</p>
                  </div>
                </Link>
              </div>

              {/* Separador */}
              <div className="border-t border-border" />

              {/* Seção de ajuda */}
              <div className="py-2">
                <a
                  href="https://github.com/anthropics/claude-code/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Central de Ajuda</span>
                </a>

                <button
                  onClick={abrirBuscaGlobal}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Keyboard className="w-4 h-4" />
                    <span>Busca Rápida</span>
                  </div>
                  <kbd className="text-[10px] px-1.5 py-0.5 bg-secondary border border-border rounded">⌘K</kbd>
                </button>
              </div>

              {/* Separador */}
              <div className="border-t border-border" />

              {/* Logout */}
              <div className="py-2">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Sair da conta</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de busca global */}
      <GlobalSearch
        isOpen={buscaGlobalAberta}
        onClose={() => setBuscaGlobalAberta(false)}
      />
    </header>
  );
}
