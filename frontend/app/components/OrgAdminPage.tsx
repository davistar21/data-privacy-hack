// src/components/OrgAdminPage.tsx
import React, { useEffect } from "react";
import { useParams } from "react-router";
import { useConsentStore } from "../stores/ConsentStore";
import { useSSE } from "../hooks/useSSE";
import { OrgHeader } from "./OrgHeader";
import { OrgLogItem } from "./OrgLogItem";

export const OrgAdminPage: React.FC = () => {
  // using react-router v7 useParams
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId!;
  const orgNameMap: Record<string, string> = {
    ecomshop: "EcomShop",
    zenith: "Zenith Bank",
    lagos_hospital: "Lagos Hospital",
    mobiletel: "MobileTel",
  };
  const orgName = orgNameMap[orgId] ?? orgId;

  const loadOrgLogs = useConsentStore((s) => s.loadOrgLogs);
  const logs = useConsentStore((s) => s.orgLogs[orgId] || []);
  const loading = useConsentStore((s) => s.loadingOrgLogs[orgId]);

  // Try real SSE, fallback to mock (configured inside hook)
  useSSE({
    role: "org",
    orgId,
    fallbackToMock: true,
    url: `/api/sse/events?role=org&orgId=${orgId}`,
  });

  useEffect(() => {
    loadOrgLogs(orgId);
  }, [orgId]);

  return (
    <div className="min-h-screen p-6 bg-[color:var(--bg)]">
      <div className="max-w-5xl mx-auto">
        <OrgHeader orgName={orgName} orgId={orgId} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="md:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[color:var(--text)]">
                Incoming Events & Audit Logs
              </h3>
              <div className="text-sm text-[color:var(--muted)]">
                {logs.length} events
              </div>
            </div>

            <div aria-live="polite" aria-atomic="true" className="space-y-3">
              {loading && (
                <div className="text-[color:var(--muted)]">Loading...</div>
              )}
              {!loading && logs.length === 0 && (
                <div className="text-[color:var(--muted)]">
                  No events yet. Waiting for revocations or AI audits...
                </div>
              )}
              {logs.map((ev) => (
                <OrgLogItem key={ev.id} ev={ev} />
              ))}
            </div>
          </section>

          <aside>
            <div className="bg-[color:var(--card)] p-4 rounded-lg shadow">
              <h4 className="text-md font-semibold text-[color:var(--text)]">
                Org Controls
              </h4>
              <p className="text-sm text-[color:var(--muted)] mt-2">
                Simulate an incoming event for demos
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  className="px-3 py-2 rounded bg-slate-800 text-white hover:bg-slate-700"
                  onClick={() => {
                    // create manual event via mockApi push - import lazily to avoid circular deps
                    import("../api/mockApi").then((m) => {
                      const ev = {
                        id: `ev-${Math.random().toString(36).slice(2, 8)}`,
                        type: "revocation",
                        userId: "user-99",
                        userName: "DemoUser",
                        orgId,
                        orgName,
                        message: "Demo: User requested revocation (simulated).",
                        fields: ["name", "phone"],
                        timestamp: new Date().toISOString(),
                        status: "completed",
                      } as any;
                      m.pushOrgEvent(ev);
                      // notify local store as if SSE pushed it
                      const { appendOrgLog } =
                        require("../store").useConsentStore.getState();
                      appendOrgLog(orgId, ev);
                    });
                  }}
                >
                  Simulate Revocation Event
                </button>

                <button
                  className="px-3 py-2 rounded border border-slate-600 text-[color:var(--text)]"
                  onClick={() => {
                    import("../api/mockApi").then((m) => {
                      const ev = {
                        id: `ev-${Math.random().toString(36).slice(2, 8)}`,
                        type: "audit",
                        userId: "user-99",
                        userName: "DemoUser",
                        orgId,
                        orgName,
                        message: "Demo: AI generated audit confirming action.",
                        fields: ["name"],
                        timestamp: new Date().toISOString(),
                        status: "completed",
                      } as any;
                      m.pushOrgEvent(ev);
                      const { appendOrgLog } =
                        require("../store").useConsentStore.getState();
                      appendOrgLog(orgId, ev);
                    });
                  }}
                >
                  Simulate Audit Entry
                </button>
              </div>
            </div>

            <div className="bg-[color:var(--card)] p-4 rounded-lg shadow mt-4">
              <h4 className="text-md font-semibold text-[color:var(--text)]">
                Tips
              </h4>
              <ul className="text-sm text-[color:var(--muted)] mt-2 list-disc ml-5">
                <li>Use the simulate buttons to test the real-time flow.</li>
                <li>
                  Open a second window on the Citizen Dashboard to trigger
                  revocations and see this panel update.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
