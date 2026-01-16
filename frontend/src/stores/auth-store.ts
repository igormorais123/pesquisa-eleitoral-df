import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/services/api';
import { notify } from './notifications-store';

interface Usuario {
  id: string;
  usuario: string;
  nome: string;
  papel: 'admin' | 'pesquisador' | 'visualizador';
}

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  autenticado: boolean;
  carregando: boolean;
  login: (usuario: string, senha: string) => Promise<void>;
  logout: () => void;
  verificarToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      token: null,
      autenticado: false,
      carregando: false,

      login: async (usuario: string, senha: string) => {
        set({ carregando: true });

        try {
          const response = await api.post('/auth/login', {
            usuario,
            senha,
          });

          const { access_token, usuario: dadosUsuario } = response.data;

          // Atualizar o header de autorização
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

          set({
            usuario: dadosUsuario,
            token: access_token,
            autenticado: true,
            carregando: false,
          });

          // Notificar login bem-sucedido
          notify.success(
            `Bem-vindo, ${dadosUsuario.nome}!`,
            'Login realizado com sucesso. Você está pronto para começar.',
            { label: 'Ver dashboard', href: '/' }
          );
        } catch (error) {
          set({ carregando: false });
          notify.error(
            'Erro no login',
            'Credenciais inválidas. Verifique seu usuário e senha.'
          );
          throw error;
        }
      },

      logout: () => {
        // Remover header de autorização
        delete api.defaults.headers.common['Authorization'];

        set({
          usuario: null,
          token: null,
          autenticado: false,
        });

        // Redirecionar para login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      verificarToken: async () => {
        const token = get().token;

        if (!token) {
          return false;
        }

        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/me');

          set({
            usuario: response.data,
            autenticado: true,
          });

          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      },
    }),
    {
      name: 'pesquisa-eleitoral-auth',
      partialize: (state) => ({
        usuario: state.usuario,
        token: state.token,
        autenticado: state.autenticado,
      }),
    }
  )
);
