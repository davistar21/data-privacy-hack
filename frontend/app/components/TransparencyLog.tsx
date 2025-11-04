// import React, { useEffect, useMemo, useState } from "react";
// import { useSearchParams, useNavigate } from "react-router";
// import { useConsentStore } from "../stores/ConsentStore";
// import { motion } from "framer-motion";
// import { Input } from "../components/ui/input";
// import { Button } from "../components/ui/button";
// import {
//   Select,
//   SelectItem,
//   SelectContent,
//   SelectTrigger,
//   SelectValue,
// } from "../components/ui/select";
// import {
//   Tabs,
//   TabsList,
//   TabsTrigger,
//   TabsContent,
// } from "../components/ui/tabs";

// type Mode = "preview" | "full";

// const TransparencyLog: React.FC<{ mode?: Mode }> = ({ mode = "preview" }) => {
//   // const loadLogs = useConsentStore((s) => s.loadLogs);
//   const logs = useConsentStore((s) => s.auditLogs);
//   const consents = useConsentStore((s) => s.consents);
//   const loading = useConsentStore((s) => s.loadingLogs);
//   const [searchParams, setSearchParams] = useSearchParams();
//   const navigate = useNavigate();

//   // URL-driven state
//   const tabParam = searchParams.get("tab") || "important";
//   const orgParam = searchParams.get("org") || "all";
//   const qParam = searchParams.get("q") || "";
//   const rangeParam = searchParams.get("range") || "30d";

//   const [tab, setTab] = useState(tabParam);
//   const [orgFilter, setOrgFilter] = useState(orgParam);
//   const [query, setQuery] = useState(qParam);
//   const [range, setRange] = useState(rangeParam);

//   useEffect(() => {
//     // loadLogs();
//   }, []);

//   // persist to URL when changed (debounced simple)
//   useEffect(() => {
//     const params: Record<string, string> = {};
//     if (tab) params.tab = tab;
//     if (orgFilter) params.org = orgFilter;
//     if (query) params.q = query;
//     if (range) params.range = range;
//     setSearchParams(params);
//   }, [tab, orgFilter, query, range]);

//   // compute time window
//   const fromDate = useMemo(() => {
//     const now = Date.now();
//     if (range === "24h") return new Date(now - 24 * 60 * 60 * 1000);
//     if (range === "7d") return new Date(now - 7 * 24 * 60 * 60 * 1000);
//     // default 30d
//     return new Date(now - 30 * 24 * 60 * 60 * 1000);
//   }, [range]);

//   const orgOptions = useMemo(() => {
//     const unique = Array.from(new Set((consents ?? []).map((c) => c.orgId)));
//     return [
//       { id: "all", name: "All Orgs" },
//       ...unique.map((id) => ({ id, name: id })),
//     ];
//   }, [consents]);

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     return (logs ?? [])
//       .filter((l) => new Date(l.timestamp) >= fromDate)
//       .filter((l) => (orgFilter === "all" ? true : l.orgId === orgFilter))
//       .filter((l) =>
//         tab === "all"
//           ? true
//           : tab === "notifications"
//             ? (l as any).isNotification
//             : (l as any).category === tab ||
//               (l as any).category === "notification"
//       )
//       .filter((l) => (q ? (l.message || "").toLowerCase().includes(q) : true));
//   }, [logs, orgFilter, query, fromDate, tab]);

//   const notificationsCount = useMemo(
//     () => logs.filter((l) => (l as any).isNotification).length,
//     [logs]
//   );

//   // UI helpers
//   const handleExport = () => {
//     // mock export: download visible logs as JSON
//     const data = JSON.stringify(filtered, null, 2);
//     const blob = new Blob([data], { type: "application/json" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `transparency-logs-${new Date().toISOString()}.json`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   // small Log detail modal can be added (omitted for brevity) — link to nav
//   const openLog = (l: any) => {
//     // example: navigate to /transparency?logId=...
//     navigate(`/transparency?logId=${l.id}${tab ? `&tab=${tab}` : ""}`);
//   };

//   return (
//     <div className="bg-[color:var(--card)] p-4 rounded-lg shadow">
//       <div className="flex items-center justify-between mb-3">
//         <div>
//           <h2 className="text-lg font-semibold">Transparency Log</h2>
//           <div className="text-sm text-[color:var(--muted)]">
//             {logs.length} total events
//           </div>
//         </div>

//         {mode === "full" && (
//           <div className="flex items-center gap-3">
//             <Input
//               placeholder="Search logs..."
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//             />
//             <Select value={orgFilter} onValueChange={setOrgFilter}>
//               <SelectTrigger className="w-[180px]">
//                 <SelectValue placeholder="Select Org" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Orgs</SelectItem>
//                 {orgOptions.map((o) => (
//                   <SelectItem key={o.id} value={o.id}>
//                     {o.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             <Select value={range} onValueChange={setRange}>
//               <SelectTrigger className="w-[120px]">
//                 <SelectValue placeholder="Range" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="24h">24h</SelectItem>
//                 <SelectItem value="7d">7d</SelectItem>
//                 <SelectItem value="30d">30d</SelectItem>
//               </SelectContent>
//             </Select>
//             <Button onClick={handleExport} variant="outline">
//               Export
//             </Button>
//           </div>
//         )}
//       </div>

//       {/* Tabs */}
//       {mode === "full" && (
//         // <div className="flex gap-2 mb-3 overflow-auto">
//         //   {["important", "sensitive", "normal", "notifications", "all"].map(
//         //     (t) => (
//         //       <button
//         //         key={t}
//         //         onClick={() => setTab(t)}
//         //         className={`px-3 py-1 rounded-full text-sm ${tab === t ? "bg-[#0b7ca8] text-white" : "bg-transparent border border-[color:var(--muted)]/10"}`}
//         //       >
//         //         {t === "important"
//         //           ? "Important"
//         //           : t === "sensitive"
//         //             ? "Sensitive"
//         //             : t === "normal"
//         //               ? "Normal"
//         //               : t === "notifications"
//         //                 ? `Notifications (${notificationsCount})`
//         //                 : "All"}
//         //       </button>
//         //     )
//         //   )}
//         // </div>
//         <Tabs value={tab} onValueChange={setTab}>
//           <TabsList className="mb-3 overflow-auto">
//             <TabsTrigger value="important">Important</TabsTrigger>
//             <TabsTrigger value="sensitive">Sensitive</TabsTrigger>
//             <TabsTrigger value="normal">Normal</TabsTrigger>
//             <TabsTrigger value="notifications">
//               Notifications ({notificationsCount})
//             </TabsTrigger>
//             <TabsTrigger value="all">All</TabsTrigger>
//           </TabsList>
//         </Tabs>
//       )}

//       {/* Notification banner */}
//       {mode === "full" && notificationsCount > 0 && (
//         <div className="mb-3 p-3 rounded border-l-4 border-yellow-400 bg-yellow-900/10 text-sm">
//           You have <b>{notificationsCount}</b> urgent notification(s). Please
//           review them.
//         </div>
//       )}
//       <div className="h-px bg-gray-200 my-3"></div>

//       <div className="flex flex-col gap-3 max-h-[60vh] overflow-auto">
//         {loading && (
//           <div className="text-sm text-[color:var(--muted)]">Loading...</div>
//         )}
//         {!loading && filtered.length === 0 && (
//           <div className="text-sm text-[color:var(--muted)]">
//             No events found.
//           </div>
//         )}

//         {filtered.map((l) => (
//           <motion.div
//             key={l.id}
//             layout
//             initial={{ opacity: 0, y: 6 }}
//             animate={{ opacity: 1, y: 0 }}
//             className={`p-3 rounded border ${l.status === "completed" ? "border-green-800/30 bg-green-900/10" : l.status === "failed" ? "border-red-800/30 bg-red-900/10" : "border-yellow-800/30 bg-yellow-900/10"}`}
//             onClick={() => openLog(l)}
//             onKeyDown={(e) => e.key === "Enter" && openLog(l)}
//             role="button"
//             tabIndex={0}
//           >
//             <div className="flex justify-between items-start gap-4">
//               <div className="flex-1">
//                 <div className="text-sm font-medium">{l.message}</div>
//                 <div className="text-xs text-[color:var(--muted)] mt-1">
//                   {l.timestamp ? new Date(l.timestamp).toLocaleString() : "—"}
//                 </div>
//                 <div className="text-xs mt-2">
//                   <span className="mr-2 text-[color:var(--muted)]">Org:</span>{" "}
//                   <span className="font-medium">{l.orgId}</span>
//                   {(l as any).fields && (
//                     <span className="ml-3 text-[color:var(--muted)]">
//                       Fields: {(l as any).fields.join(", ")}
//                     </span>
//                   )}
//                 </div>
//               </div>
//               <div className="flex flex-col items-end gap-2">
//                 <div
//                   className={`text-xs px-2 py-1 rounded ${l.status === "completed" ? "bg-green-900/30 text-green-300" : l.status === "failed" ? "bg-red-900/20 text-red-300" : "bg-yellow-900/20 text-yellow-300"}`}
//                 >
//                   {l.status ?? "unknown"}
//                 </div>
//                 <div className="text-xs text-[color:var(--muted)]">
//                   {(l as any).category ?? "—"}
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// };
// export default TransparencyLog;

// src/pages/TransparencyLog.tsx
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
