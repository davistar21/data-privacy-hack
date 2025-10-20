// src/components/TransparencyLog.tsx
import React, { useEffect } from "react";
import { useConsentStore } from "../stores/ConsentStore";
import { motion } from "framer-motion";

export const TransparencyLog: React.FC = () => {
  const logs = useConsentStore((s) => s.auditLogs);
  const loadLogs = useConsentStore((s) => s.loadLogs);
  const loading = useConsentStore((s) => s.loadingLogs);

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="bg-[color:var(--card)] rounded-lg p-4 shadow">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-semibold text-[color:var(--text)]">
          Transparency Log
        </h4>
        <div className="text-sm text-[color:var(--muted)]">
          {logs.length} events
        </div>
      </div>

      <div className="flex flex-col gap-3 max-h-60 overflow-auto">
        {loading && (
          <div className="text-sm text-[color:var(--muted)]">Loading...</div>
        )}
        {!loading && logs.length === 0 && (
          <div className="text-sm text-[color:var(--muted)]">
            No events yet.
          </div>
        )}
        {logs.map((l) => (
          <motion.div
            key={l.id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-md border border-transparent hover:border-slate-500/10"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-[color:var(--text)]">
                  {l.message}
                </div>
                <div className="text-xs text-[color:var(--muted)]">
                  {new Date(l.timestamp).toLocaleString()}
                </div>
              </div>
              <div
                className={`text-xs px-2 py-1 rounded ${l.status === "completed" ? "bg-green-900/30 text-green-300" : l.status === "failed" ? "bg-red-900/20 text-red-300" : "bg-yellow-900/20 text-yellow-300"}`}
              >
                {l.status ?? "unknown"}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
