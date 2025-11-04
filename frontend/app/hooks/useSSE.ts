// src/hooks/useSSE.ts
import { useEffect, useRef } from "react";
import { useConsentStore } from "../stores/ConsentStore";
import { subscribeMockSSE, startMockSSESimulator } from "../api/mockApi";
import { type OrgAuditEvent } from "../types";

type SSEOptions = {
  role: "org" | "citizen";
  orgId?: string;
  userId?: string;
  url?: string; // optional SSE url override
  fallbackToMock?: boolean;
};

export function useSSE(opts: SSEOptions) {
  const { role, orgId, userId, url, fallbackToMock = true } = opts;
  const appendOrgLog = useConsentStore((s) => s.appendOrgLog);
  // const appendOrgLog = useConsentStore.getState().appendOrgLog;
  const startedMock = useRef(false);

  useEffect(() => {
    let es: EventSource | null = null;
    let unsubMock: () => void | undefined;

    // If a real SSE url is given try to connect
    const sseUrl =
      url ||
      `/api/sse/events?role=${role}${role === "org" && orgId ? `&orgId=${orgId}` : role === "citizen" && userId ? `&userId=${userId}` : ""}`;

    let connected = false;

    try {
      es = new EventSource(sseUrl);
      es.onopen = () => {
        connected = true;
        console.log("SSE connected to", sseUrl);
      };
      es.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data) as {
            type: string;
            payload: OrgAuditEvent;
          };
          const p = payload.payload;
          if (p && p.orgId) appendOrgLog(p.orgId, p);
        } catch (e) {
          console.warn("Invalid SSE message", e);
        }
      };
      es.onerror = (err) => {
        console.warn("SSE error", err);
        es?.close();
        es = null;
        // fallthrough to mock if fallback is allowed
      };
    } catch (e) {
      console.warn("SSE constructor failed", e);
      es = null;
    }

    if (!es && fallbackToMock) {
      // Start a mock simulator once globally (idempotent)
      if (!startedMock.current) {
        startMockSSESimulator(7000); // emit every 7s
        startedMock.current = true;
      }
      // subscribe to mock
      unsubMock = subscribeMockSSE((ev: OrgAuditEvent) => {
        // Only append for matching org when role=org
        if (role === "org" && orgId && ev.orgId === orgId) {
          appendOrgLog(orgId, ev);
        } else if (role === "citizen" && userId) {
          // If needed, append to user logs across orgs (or handle differently)
          appendOrgLog(ev.orgId, ev);
        }
      });
    }

    return () => {
      if (es) {
        es.close();
      }
      if (unsubMock) unsubMock();
    };
  }, [role, orgId, userId, url]);
}
