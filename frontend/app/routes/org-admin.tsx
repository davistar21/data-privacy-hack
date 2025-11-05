import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useConsentStore } from "../stores/ConsentStore";
import { useSSE } from "../hooks/useSSE";
import { OrgHeader } from "../components/OrgHeader";
import { OrgLogItem } from "../components/OrgLogItem";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { Clock, Wifi, Zap } from "lucide-react";

/**
 * OrgAdminPage
 * - subscribes to SSE via useSSE (fallback to mock inside hook)
 * - loads org logs via store
 * - shows filters (type, status, timeframe), search, SSE/activity badge
 * - accessible aria-live region for incoming logs
 */

const ORG_NAME_MAP: Record<string, string> = {
  ecomshop: "EcomShop",
  zenith: "Zenith Bank",
  lagos_hospital: "Lagos Hospital",
  mobiletel: "MobileTel",
};

export const OrgAdminPage: React.FC = () => {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId!;
  const orgName = ORG_NAME_MAP[orgId] ?? orgId;

  const loadOrgLogs = useConsentStore((s) => s.loadOrgLogs);
  const logs = useConsentStore((s) => s.orgLogs[orgId] || []);
  const loading = useConsentStore((s) => s.loadingOrgLogs[orgId]);

  const appendOrgLog = useConsentStore((s) => s.appendOrgLog);

  // time of last received event for activity badge
  const [lastEventAt, setLastEventAt] = useState<number | null>(null);

  // filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "revocation" | "audit">(
    "all"
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "completed" | "failed"
  >("all");
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("30d");

  // SSE config and subscription (useSSE handles real vs mock)
  // useSSE({
  //   role: "org",
  //   orgId,
  //   fallbackToMock: true,
  //   url: `/api/sse/events?role=org&orgId=${orgId}`,
  // });

  // When appendOrgLog is called by SSE or other flows, update lastEventAt.
  // We'll watch the org-specific logs and update timestamp whenever they change.
  useEffect(() => {
    if (logs.length > 0) {
      setLastEventAt(Date.now());
    }
  }, [logs.length]);

  useEffect(() => {
    if (!orgId) return;
    loadOrgLogs(orgId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  // computed time window
  const fromDate = useMemo(() => {
    const now = Date.now();
    if (timeRange === "24h") return new Date(now - 24 * 60 * 60 * 1000);
    if (timeRange === "7d") return new Date(now - 7 * 24 * 60 * 60 * 1000);
    return new Date(now - 30 * 24 * 60 * 60 * 1000);
  }, [timeRange]);

  // filtered logs
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return logs
      .filter((l) => new Date(l.timestamp) >= fromDate)
      .filter((l) => (filterType === "all" ? true : l.type === filterType))
      .filter((l) =>
        filterStatus === "all" ? true : (l.status ?? "") === filterStatus
      )
      .filter((l) =>
        q
          ? (l.message ?? "").toLowerCase().includes(q) ||
            (l.userId ?? "").toLowerCase().includes(q)
          : true
      )
      .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  }, [logs, fromDate, filterType, filterStatus, searchTerm]);

  // activity badge: connected if lastEventAt within last 12s (this indicates live events flowing)
  const isActive = lastEventAt && Date.now() - lastEventAt < 12_000;

  // accessible announcement for new events (aria-live)
  const [lastAnnouncedId, setLastAnnouncedId] = useState<string | null>(null);
  useEffect(() => {
    if (filtered.length === 0) return;
    const newest = filtered[0];
    if (!newest) return;
    if (newest.id !== lastAnnouncedId) {
      // set announced id so we don't re-announce same event
      setLastAnnouncedId(newest.id);
      // we rely on aria-live on the container; no manual speech API required
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.length]);

  return (
    <div className="min-h-screen p-6 bg-[color:var(--bg)]">
      <div className="max-w-6xl mx-auto">
        <OrgHeader orgName={orgName} orgId={orgId} />

        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-[color:var(--text)]">
              Incoming Events & Audit Logs
            </h3>
            <div className="text-sm text-[color:var(--muted)]">
              {logs.length} total events for {orgName}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Wifi
                className={`w-4 h-4 ${isActive ? "text-green-400" : "text-red-400"}`}
              />
              <Badge
                className={
                  isActive
                    ? "bg-green-800/30 text-green-200"
                    : "bg-red-800/20 text-red-300"
                }
              >
                {isActive ? "Live" : "Idle"}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
              <Clock className="w-4 h-4" />
              <div>
                Last event:{" "}
                {lastEventAt
                  ? `${Math.floor((Date.now() - lastEventAt) / 1000)}s ago`
                  : "—"}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* left: logs */}
          <section className="lg:col-span-2">
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search by user id or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[320px]"
                />

                <Select
                  value={filterType}
                  onValueChange={(v) => setFilterType(v as any)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="revocation">Revocations</SelectItem>
                    <SelectItem value="audit">Audits</SelectItem>
                    <SelectItem value="reuse_accepted">Reuse</SelectItem>
                    <SelectItem value="incident">Incidents</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filterStatus}
                  onValueChange={(v) => setFilterStatus(v as any)}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={timeRange}
                  onValueChange={(v) => setTimeRange(v as any)}
                >
                  <SelectTrigger className="w-[96px]">
                    <SelectValue placeholder="Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24h</SelectItem>
                    <SelectItem value="7d">7d</SelectItem>
                    <SelectItem value="30d">30d</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                    setFilterStatus("all");
                    setTimeRange("30d");
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[60vh]">
              <div
                aria-live="polite"
                aria-atomic="true"
                role="list"
                className="space-y-3 p-1"
              >
                {loading && (
                  <div className="text-[color:var(--muted)]">Loading logs…</div>
                )}
                {!loading && filtered.length === 0 && (
                  <div className="text-[color:var(--muted)]">
                    No events found for the selected filters.
                  </div>
                )}

                {filtered.map((ev) => (
                  <OrgLogItem key={ev.id} ev={ev} />
                ))}
              </div>
            </ScrollArea>
          </section>

          {/* right: controls + tips */}
          <aside>
            <div className="bg-[color:var(--card)] p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-semibold text-[color:var(--text)]">
                  Org Controls
                </h4>
                <Badge className="bg-slate-700/20 text-[color:var(--muted)]">
                  Demo Mode
                </Badge>
              </div>

              <p className="text-sm text-[color:var(--muted)] mt-3">
                This admin view receives events in real-time from the system.
                Trigger revocations from the Citizen Dashboard to see updates
                here.
              </p>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span>
                    Events reflect real user actions in demo (no manual simulate
                    buttons).
                  </span>
                </div>
                <div className="text-[color:var(--muted)]">
                  Open another tab with the Citizen Dashboard and revoke consent
                  to watch events appear here.
                </div>
              </div>
            </div>

            <div className="bg-[color:var(--card)] p-4 rounded-lg shadow mt-4">
              <h4 className="text-md font-semibold text-[color:var(--text)]">
                Tips
              </h4>
              <ul className="text-sm text-[color:var(--muted)] mt-2 list-disc ml-5">
                <li>
                  Filter by type/status to narrow down sensitive entries
                  quickly.
                </li>
                <li>Use time range to view recent vs historical events.</li>
                <li>
                  When an urgent event appears, it will be highlighted in the
                  list.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default OrgAdminPage;
