import { create } from 'zustand';

interface SidebarState {
  // Estado da sidebar em mobile (drawer aberto/fechado)
  mobileAberto: boolean;
  // Estado da sidebar recolhida em desktop
  recolhido: boolean;
  // Ações
  abrirMobile: () => void;
  fecharMobile: () => void;
  toggleMobile: () => void;
  toggleRecolhido: () => void;
}

export const useSidebarStore = create<SidebarState>()((set) => ({
  mobileAberto: false,
  recolhido: false,

  abrirMobile: () => set({ mobileAberto: true }),
  fecharMobile: () => set({ mobileAberto: false }),
  toggleMobile: () => set((state) => ({ mobileAberto: !state.mobileAberto })),
  toggleRecolhido: () => set((state) => ({ recolhido: !state.recolhido })),
}));
