import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, setAuthToken, clearAuthToken } from '@/services/api';
import { notify } from './notifications-store';

interface Usuario {
  id: string;
  email: string;
  nome: string;
  papel: 'admin' | 'pesquisador' | 'visualizador' | 'leitor';
  provedor_auth: 'local' | 'google';
  ativo: boolean;
  aprovado: boolean;
  avatar_url?: string;
}

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  autenticado: boolean;
  carregando: boolean;
  hidratado: boolean; // Indica se o estado foi restaurado do localStorage
  login: (usuario: string, senha: string) => Promise<void>;
  logout: () => void;
  verificarToken: () => Promise<boolean>;
  setAuth: (token: string, usuario: Usuario) => void;
  setHidratado: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      token: null,
      autenticado: false,
      carregando: false,
      hidratado: false,

      setHidratado: () => set({ hidratado: true }),

      login: async (usuario: string, senha: string) => {
        set({ carregando: true });

        try {
          const response = await api.post('/auth/login', {
            usuario,
            senha,
          });

          const { access_token, usuario: dadosUsuario } = response.data;

          // Atualizar o header de autorização e o cache
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          setAuthToken(access_token);

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

      setAuth: (token: string, usuario: Usuario) => {
        // Atualizar o header de autorização e o cache
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setAuthToken(token);

        set({
          usuario,
          token,
          autenticado: true,
          carregando: false,
        });
      },

      logout: () => {
        // Remover header de autorização e limpar cache
        delete api.defaults.headers.common['Authorization'];
        clearAuthToken();

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
          // Atualizar header e cache
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setAuthToken(token);

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
      onRehydrateStorage: () => (state) => {
        // Marcar como hidratado quando o estado for restaurado do localStorage
        if (state) {
          state.setHidratado();
        }
      },
    }
  )
);

// Helpers para verificar permissões
export const useIsAdmin = () => {
  const usuario = useAuthStore((state) => state.usuario);
  return usuario?.papel === 'admin';
};

// Verifica se o estado foi hidratado do localStorage
export const useAuthHidratado = () => {
  return useAuthStore((state) => state.hidratado);
};

export const useCanUsarAPI = () => {
  const usuario = useAuthStore((state) => state.usuario);
  return usuario?.aprovado && usuario?.papel !== 'leitor';
};

export const usePapel = () => {
  const usuario = useAuthStore((state) => state.usuario);
  return usuario?.papel;
};
