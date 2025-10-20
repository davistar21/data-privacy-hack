// src/store.ts
import { create } from "zustand";
import type { Consent, AuditLogEntry, Organization } from "~/types";
import * as api from "../api/mockApi";

type State = {
  userId: string;
  consents: (Consent & { org?: Organization })[];
  auditLogs: AuditLogEntry[];
  theme: "dark" | "light";
  loadingConsents: boolean;
  loadingLogs: boolean;
  // actions
  loadConsents: (userId?: string) => Promise<void>;
  revokeConsent: (payload: {
    orgId: string;
    purpose: string;
    fields: string[];
  }) => Promise<{ success: boolean; message?: string }>;
  loadLogs: () => Promise<void>;
  setTheme: (t: "dark" | "light") => void;
  addLocalLog: (log: AuditLogEntry) => void;
};

export const useConsentStore = create<State>((set, get) => ({
  userId: "user-1",
  consents: [],
  auditLogs: [],
  theme: "dark",
  loadingConsents: false,
  loadingLogs: false,

  loadConsents: async (userId) => {
    set({ loadingConsents: true });
    try {
      const uid = userId || get().userId;
      const data = await api.getConsents(uid);
      set({ consents: data as any, loadingConsents: false });
    } catch (e) {
      console.error(e);
      set({ loadingConsents: false });
    }
  },

  revokeConsent: async ({ orgId, purpose, fields }) => {
    const uid = get().userId;
    // optimistic update: set consentGiven=false locally
    const prev = get().consents;
    set({
      consents: prev.map((c) =>
        c.orgId === orgId && c.purpose === purpose
          ? { ...c, consentGiven: false, revokedAt: new Date().toISOString() }
          : c
      ),
    });
    try {
      const res = await api.postRevocation({
        userId: uid,
        orgId,
        purpose,
        fields,
      });
      if (res.success && res.audit) {
        // push audit log
        get().addLocalLog(res.audit);
        return { success: true };
      } else {
        // revert
        set({ consents: prev });
        return { success: false, message: res.message || "Failed to revoke" };
      }
    } catch (error) {
      set({ consents: prev });
      return { success: false, message: "Network error" };
    }
  },

  loadLogs: async () => {
    set({ loadingLogs: true });
    const uid = get().userId;
    try {
      const logs = await api.getAuditLogs(uid);
      set({ auditLogs: logs, loadingLogs: false });
    } catch (e) {
      console.error(e);
      set({ loadingLogs: false });
    }
  },

  setTheme: (t) => set({ theme: t }),
  addLocalLog: (log) =>
    set((state) => ({ auditLogs: [log, ...state.auditLogs] })),
}));
