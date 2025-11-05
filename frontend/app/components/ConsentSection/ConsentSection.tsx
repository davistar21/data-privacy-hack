import { useState, useMemo, useEffect } from "react";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { useConsentStore } from "../../stores/ConsentStore";
import { ConsentChart } from "./ConsentChart";
import { OrgCard } from "./OrgCard";
import { ConsentTimeline } from "./ConsentTimeline";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { ConsentList } from "./ConsentList";
import { ConsentDashboard } from "./ConsentDashboard";

export const ConsentSection = ({
  mode = "full",
}: {
  mode?: "preview" | "full";
}) => {
  const { consents } = useConsentStore();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const [tab, setTab] = useState("active");
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return (consents ?? [])
      .filter((c) => (filter === "all" ? true : c.orgId === filter))
      .filter((c) =>
        tab === "revoked"
          ? !c.consentGiven
          : tab === "active"
            ? c.consentGiven
            : true
      )
      .filter((c) =>
        q
          ? c.purpose.toLowerCase().includes(q) ||
            c.fields.join(", ").toLowerCase().includes(q) ||
            (c.org?.name || "").toLowerCase().includes(q)
          : true
      );
  }, [consents, query, filter, tab]);
  return (
    <div className="space-y-6">
      <motion.div layout className="space-y-6">
        {/* Toolbar */}

        {/* Stats Overview */}
        <ConsentStats consents={consents} />
        {/* <ConsentFilters setFilter={setFilter} /> */}
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="revoked">Revoked</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Table View */}
        <ConsentTable consents={filtered} />
        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Consent Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ConsentChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ConsentTimeline />
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

import { ShieldCheck, ShieldOff, RefreshCcw } from "lucide-react";

export const ConsentStats = ({ consents }: { consents: Consent[] }) => {
  // const { consents } = useConsentStore();
  const total = consents.length;
  const active = consents.filter((c) => c.consentGiven).length;
  const revoked = total - active;

  return (
    <motion.div layout className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <Card className="bg-[color:var(--card)] border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <ShieldCheck className="w-5 h-5" /> Active Consents
          </CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold text-[color:var(--text)]">
          {active}
        </CardContent>
      </Card>

      <Card className="bg-[color:var(--card)] border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <ShieldOff className="w-5 h-5" /> Revoked Consents
          </CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold text-[color:var(--text)]">
          {revoked}
        </CardContent>
      </Card>

      <Card className="bg-[color:var(--card)] border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <RefreshCcw className="w-5 h-5" /> Total Records
          </CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold text-[color:var(--text)]">
          {total}
        </CardContent>
      </Card>
    </motion.div>
  );
};

import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { ToggleButton } from "../../components/ToggleButton";
import ConfirmRevocationModal from "../../components/ConfirmRevocationModal";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const ConsentTable = ({
  consents,
}: {
  consents: (Consent & { org?: Organization })[];
}) => {
  const { revokeConsent, undoRevocation } = useConsentStore();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [modalConsent, setModalConsent] = useState<any | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return consents.filter(
      (c) =>
        c.org?.name.toLowerCase().includes(q) ||
        c.purpose.toLowerCase().includes(q)
    );
  }, [consents, query]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleRevoke = async (consent: any) => {
    const res = await revokeConsent(consent);
    if (!res.success) toast.error("Revocation failed");
    else {
      toast.success("Consent revoked — Undo?", {
        action: {
          label: "Undo",
          onClick: () => undoRevocation(consent),
        },
      });
    }
  };

  return (
    <motion.div
      layout
      className="bg-[color:var(--card)] rounded-xl border border-border p-5"
    >
      <div className="flex justify-between mb-4">
        <SearchBar
          onSearch={setQuery}
          placeholder="Search by organization or purpose..."
        />

        <span className="text-sm text-muted-foreground">
          {filtered.length} records
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Data Fields</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.org?.name}</TableCell>
                <TableCell>{formatText(c.purpose, "capitalize")}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {c.fields.map((f) => formatText(f)).join(", ")}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.consentGiven
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {c.consentGiven ? "Active" : "Revoked"}
                  </span>
                </TableCell>
                <TableCell>
                  <ToggleButton
                    checked={c.consentGiven}
                    onChange={(val) => !val && setModalConsent(c)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-3 mt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm">
          Page {page} of {Math.ceil(filtered.length / perPage) || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page * perPage >= filtered.length}
          onClick={() => setPage((p) => p + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalConsent && (
          <ConfirmRevocationModal
            open={!!modalConsent}
            onClose={() => setModalConsent(null)}
            consent={modalConsent}
            onConfirm={() => handleRevoke(modalConsent)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

import { Activity, Clock } from "lucide-react";
import type { Consent, Organization } from "~/types";
import { ConsentFilters } from "./ConsentFilters";
import { formatText } from "../../utils/formatText";
import { SearchBar } from "../SearchBar";

export const ConsentTimelineTwo = () => {
  const { auditLogs } = useConsentStore();
  const recent = auditLogs.slice(-6).reverse();

  if (!recent.length)
    return <p className="text-sm text-muted-foreground">No recent activity</p>;

  return (
    <motion.div
      layout
      className="relative pl-4 border-l border-border space-y-4 bg-[color:var(--card)] rounded-xl p-4 mt-6"
    >
      {recent.map((log, i) => (
        <motion.div
          key={log.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div className="absolute -left-2 top-2 w-3 h-3 rounded-full bg-emerald-500"></div>
          <p className="text-[color:var(--text)] font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            {log.message}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(log.timestamp).toLocaleString()}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
};
