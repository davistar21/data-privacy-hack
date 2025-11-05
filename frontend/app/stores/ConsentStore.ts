// src/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Consent,
  AuditLogEntry,
  Organization,
  OrgAuditEvent,
} from "~/types";
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
  }) => Promise<{ success: boolean; message?: string; requestId?: string }>;
  loadLogs: () => Promise<void>;
  undoRevocation: (payload: {
    orgId: string;
    purpose: string;
    fields: string[];
  }) => Promise<{ success: boolean; message?: string; requestId?: string }>;
  setTheme: (t: "dark" | "light") => void;
  addLocalLog: (log: AuditLogEntry) => void;
  orgLogs: Record<string, OrgAuditEvent[]>; // keyed by orgId
  loadingOrgLogs: Record<string, boolean>;
  loadOrgLogs: (orgId: string) => Promise<void>;
  appendOrgLog: (orgId: string, ev: OrgAuditEvent) => void;
  clearOrgLogs: (orgId: string) => void;
};

export const useConsentStore = create<State>()(
  persist(
    (set, get) => ({
      userId: "ce4r90d4",
      consents: [],
      auditLogs: [],
      theme: "dark",
      loadingConsents: false,
      loadingLogs: false,

      loadConsents: async (userId) => {
        if (get().consents.length > 0) return;
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
      // revokeConsent: async ({ orgId, purpose, fields }) => {
      //   const uid = get().userId;
      //   const requestId = crypto.randomUUID();

      //   // optimistic pending entry
      //   const pendingLog = {
      //     id: requestId,
      //     type: "revocation",
      //     userId: uid,
      //     orgId,
      //     requestId,
      //     message: `Revocation requested for ${purpose}`,
      //     timestamp: new Date().toISOString(),
      //     status: "pending",
      //   } as AuditLogEntry;
      //   get().addLocalLog(pendingLog);

      //   // local optimistic UI
      //   const prev = get().consents;
      //   set({
      //     consents: prev.map((c) =>
      //       c.orgId === orgId && c.purpose === purpose
      //         ? { ...c, consentGiven: false, revokedAt: new Date().toISOString() }
      //         : c
      //     ),
      //   });

      //   try {
      //     const res = await fetch("/api/revocations", {
      //       method: "POST",
      //       headers: { "Content-Type": "application/json" },
      //       body: JSON.stringify({
      //         userId: uid,
      //         orgId,
      //         purpose,
      //         fields,
      //         requestId,
      //       }),
      //     });
      //     const data = await res.json();
      //     if (!data.success) throw new Error(data.message);

      //     // success response: wait for SSE to replace pending
      //     return { success: true, requestId };
      //   } catch (err) {
      //     // revert consent + mark failed
      //     set({ consents: prev });
      //     set((s) => ({
      //       auditLogs: s.auditLogs.map((l) =>
      //         l.id === requestId ? { ...l, status: "failed" } : l
      //       ),
      //     }));
      //     return { success: false, message: (err as any).message };
      //   }
      // },
      // resolvePendingAudit: (event: AuditLogEntry) => {
      //   set((s) => {
      //     const existing = s.auditLogs.find((l) => l.id === event.requestId);
      //     if (existing) {
      //       return {
      //         auditLogs: s.auditLogs.map((l) =>
      //           l.id === event.requestId ? { ...l, ...event } : l
      //         ),
      //       };
      //     }
      //     return { auditLogs: [event, ...s.auditLogs] };
      //   });
      // },

      revokeConsent: async ({ orgId, purpose, fields }) => {
        const uid = get().userId;
        // optimistic update: set consentGiven=false locally
        const prev = get().consents;
        set({
          consents: prev.map((c) =>
            c.orgId === orgId && c.purpose === purpose
              ? {
                  ...c,
                  consentGiven: false,
                  revokedAt: new Date().toISOString(),
                }
              : c
          ),
        });
        try {
          const res = await api.postRevocation({
            userId: uid,
            orgId,
            purpose,
            fields,
            type: "revoke",
          });
          if (res.success && res.audit) {
            // push audit log
            get().addLocalLog(res.audit);
            return { success: true, requestId: res.audit.id };
          } else {
            // revert
            set({ consents: prev });
            return {
              success: false,
              message: res.message || "Failed to revoke",
            };
          }
        } catch (error) {
          set({ consents: prev });
          return { success: false, message: "Network error" };
        }
      },

      loadLogs: async () => {
        if (get().auditLogs.length > 0) return;
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
      undoRevocation: async ({ orgId, purpose, fields }) => {
        const uid = get().userId;
        const prevConsents = get().consents;
        set({
          consents: prevConsents.map((c) =>
            c.orgId === orgId && c.purpose === purpose
              ? {
                  ...c,
                  consentGiven: true,
                  revokedAt: new Date().toISOString(),
                }
              : c
          ),
        });
        try {
          const res = await api.postRevocation({
            userId: uid,
            orgId,
            purpose,
            fields,
            type: "regrant",
          });
          if (res.success && res.audit) {
            get().addLocalLog(res.audit);
            return { success: true, requestId: res.audit.id };
          } else {
            // revert
            set({ consents: prevConsents });
            return {
              success: false,
              message: res.message || "Failed to revoke",
            };
          }
        } catch (error) {
          set({ consents: prevConsents });
          return { success: false, message: "Network error" };
        }
      },

      setTheme: (t) => set({ theme: t }),
      addLocalLog: (log) =>
        set((state) => ({ auditLogs: [log, ...state.auditLogs] })),
      orgLogs: {},
      loadingOrgLogs: {},
      loadOrgLogs: async (orgId: string) => {
        set((state) => ({
          loadingOrgLogs: { ...state.loadingOrgLogs, [orgId]: true },
        }));
        try {
          const logs = await api.getOrgLogs(orgId);
          set((state) => ({
            orgLogs: { ...state.orgLogs, [orgId]: logs },
            loadingOrgLogs: { ...state.loadingOrgLogs, [orgId]: false },
          }));
        } catch (err) {
          set((state) => ({
            loadingOrgLogs: { ...state.loadingOrgLogs, [orgId]: false },
          }));
          console.error(err);
        }
      },
      appendOrgLog: (orgId: string, ev: OrgAuditEvent) => {
        set((state) => {
          const list = state.orgLogs[orgId] || [];
          return { orgLogs: { ...state.orgLogs, [orgId]: [ev, ...list] } };
        });
      },
      clearOrgLogs: (orgId: string) =>
        set((state) => ({ orgLogs: { ...state.orgLogs, [orgId]: [] } })),
    }),
    {
      name: "consent_store",
    }
  )
);
