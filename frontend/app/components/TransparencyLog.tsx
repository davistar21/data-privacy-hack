import React, { useEffect, useMemo, useState } from "react";
import { useConsentStore } from "../stores/ConsentStore";
import TransparencyStats from "../components/transparency/TransparencyStats";
import TransparencyFilters from "../components/transparency/TransparencyFilters";
import TransparencyTable from "../components/transparency/TransparencyTable";
import TransparencyDetailDrawer from "../components/transparency/TransparencyDetailDrawer";
import { motion } from "framer-motion";

const TransparencyLogPage: React.FC = () => {
  const loadLogs = useConsentStore((s) => s.loadLogs);
  const logs = useConsentStore((s) => s.auditLogs);
  const loading = useConsentStore((s) => s.loadingLogs);

  // Filters & URL-driven choices could be added here — we keep simple internal state
  const [query, setQuery] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");
  const [range, setRange] = useState<"24h" | "7d" | "30d">("30d");

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const fromDate = useMemo(() => {
    const now = Date.now();
    if (range === "24h") return new Date(now - 24 * 60 * 60 * 1000);
    if (range === "7d") return new Date(now - 7 * 24 * 60 * 60 * 1000);
    return new Date(now - 30 * 24 * 60 * 60 * 1000);
  }, [range]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs
      .filter((l) => new Date(l.timestamp) >= fromDate)
      .filter((l) => (orgFilter === "all" ? true : l.orgId === orgFilter))
      .filter((l) =>
        q
          ? (l.message || "").toLowerCase().includes(q) ||
            (l.orgId || "").toLowerCase().includes(q)
          : true
      );
  }, [logs, fromDate, orgFilter, query]);

  // drawer state
  const [active, setActive] = useState<any | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openLog = (l: any) => {
    setActive(l);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    const data = JSON.stringify(filtered, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transparency-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-6 bg-[color:var(--bg)]">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[color:var(--text)]">
              Transparency Log
            </h1>
            <div className="text-sm text-[color:var(--muted)]">
              Complete immutable audit trail of actions and events
            </div>
          </div>
        </div>

        <TransparencyStats />

        <div className="bg-[color:var(--card)] p-4 rounded-lg shadow">
          <TransparencyFilters
            query={query}
            onQueryChange={setQuery}
            org={orgFilter}
            onOrgChange={setOrgFilter}
            range={range}
            onRangeChange={(r) => setRange(r)}
            onExport={handleExport}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-[color:var(--card)] p-4 rounded-lg shadow">
            {loading ? (
              <div className="text-sm text-[color:var(--muted)]">Loading…</div>
            ) : (
              <TransparencyTable logs={filtered} onOpen={openLog} />
            )}
          </div>
        </motion.div>

        <TransparencyDetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          log={active}
        />
      </div>
    </div>
  );
};

export default TransparencyLogPage;
