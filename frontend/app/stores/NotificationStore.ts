import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useConsentStore } from "./ConsentStore";
import type { Notification } from "../types";

interface NotificationState {
  notifications: Notification[];
  unreadIds: Set<string>;
  initialized: boolean;

  // derived selectors
  getUnreadCount: () => number;
  latest: () => Notification[];
  getPage: (page: number, perPage?: number) => Notification[];
  getByType: (type: Notification["type"]) => Notification[];

  // actions
  fetchNotifications: () => void;
  addNotification: (n: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadIds: new Set(),
      initialized: false,

      getUnreadCount: () => get().unreadIds.size,

      latest: () =>
        [...get().notifications.filter((e) => !e.read)]
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          .slice(0, 6),

      getPage: (page, perPage = 10) => {
        const sorted = [...get().notifications].sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        const start = (page - 1) * perPage;
        return sorted.slice(start, start + perPage);
      },

      getByType: (type) => get().notifications.filter((n) => n.type === type),

      fetchNotifications: () => {
        const consentStore = useConsentStore.getState();
        const consentNotifs =
          consentStore.auditLogs
            ?.filter((l) => l.isNotification)
            .map((l) => ({
              id: l.id,
              type: "consent" as const,
              message: l.message,
              timestamp: l.timestamp,
              meta: l.meta,
            })) || [];

        set((state) => {
          const combined = [...consentNotifs, ...state.notifications];
          const unique = Array.from(
            new Map(combined.map((n) => [n.id, n])).values()
          );

          return {
            notifications: unique,
            unreadIds: new Set(
              (unique as Notification[]).filter((n) => !n.read).map((n) => n.id)
            ),
            initialized: true,
          };
        });
      },

      addNotification: (n) =>
        set((state) => ({
          notifications: [n, ...state.notifications],
          unreadIds: new Set([n.id, ...state.unreadIds]),
        })),

      markAsRead: (id) =>
        set((state) => {
          const updatedNotifications = state.notifications.map((e) =>
            e.id === id ? { ...e, read: true } : e
          );
          const updatedUnread = new Set(state.unreadIds);
          updatedUnread.delete(id);
          return {
            notifications: updatedNotifications,
            unreadIds: updatedUnread,
          };
        }),

      markAllAsRead: () =>
        set((state) => {
          const updatedNotifications = state.notifications.map((e) => ({
            ...e,
            read: true,
          }));

          return {
            notifications: updatedNotifications,
            unreadIds: new Set(),
          };
        }),

      clearAll: () => set({ notifications: [], unreadIds: new Set() }),
    }),
    {
      name: "notification-store",
      partialize: (s) => ({
        notifications: s.notifications,
        unreadIds: Array.from(s.unreadIds),
      }),
      merge: (persisted, current) => {
        const p = persisted as {
          notifications: Notification[];
          unreadIds: string[];
        };
        return {
          ...current,
          ...p,
          unreadIds: new Set(p.unreadIds),
        };
      },
    }
  )
);
