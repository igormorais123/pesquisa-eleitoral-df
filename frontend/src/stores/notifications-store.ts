import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  setIsOpen: (isOpen: boolean) => void;
  toggleOpen: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isOpen: false,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          read: false,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Manter máximo 50
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (notification && !notification.read) {
            return {
              notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
              ),
              unreadCount: Math.max(0, state.unreadCount - 1),
            };
          }
          return state;
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: notification && !notification.read
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
          };
        });
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      setIsOpen: (isOpen) => {
        set({ isOpen });
      },

      toggleOpen: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },
    }),
    {
      name: 'pesquisa-eleitoral-notifications',
      partialize: (state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          timestamp: n.timestamp instanceof Date ? n.timestamp.toISOString() : n.timestamp,
        })),
        unreadCount: state.unreadCount,
      }),
      onRehydrateStorage: () => (state) => {
        // Converter timestamps de string para Date
        if (state) {
          state.notifications = state.notifications.map((n) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }));
        }
      },
    }
  )
);

// Helper para adicionar notificações de diferentes tipos
export const notify = {
  info: (title: string, message: string, action?: Notification['action']) => {
    useNotificationsStore.getState().addNotification({ type: 'info', title, message, action });
  },
  success: (title: string, message: string, action?: Notification['action']) => {
    useNotificationsStore.getState().addNotification({ type: 'success', title, message, action });
  },
  warning: (title: string, message: string, action?: Notification['action']) => {
    useNotificationsStore.getState().addNotification({ type: 'warning', title, message, action });
  },
  error: (title: string, message: string, action?: Notification['action']) => {
    useNotificationsStore.getState().addNotification({ type: 'error', title, message, action });
  },
};
