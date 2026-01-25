import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ConfiguracoesState {
  limiteCustoPorSessao: number;
  modeloPadrao: 'opus' | 'sonnet' | 'haiku';
  notificacoesAtivas: boolean;
  setLimiteCusto: (limite: number) => void;
  setModeloPadrao: (modelo: 'opus' | 'sonnet' | 'haiku') => void;
  setNotificacoesAtivas: (ativas: boolean) => void;
}

export const useConfiguracoesStore = create<ConfiguracoesState>()(
  persist(
    (set) => ({
      limiteCustoPorSessao: 100,
      modeloPadrao: 'sonnet',
      notificacoesAtivas: true,

      setLimiteCusto: (limite) => {
        set({ limiteCustoPorSessao: limite });
      },

      setModeloPadrao: (modelo) => {
        set({ modeloPadrao: modelo });
      },

      setNotificacoesAtivas: (ativas) => {
        set({ notificacoesAtivas: ativas });
      },
    }),
    {
      name: 'pesquisa-eleitoral-configuracoes',
    }
  )
);
