// src/components/WebPrivacyCompanion.tsx
import React, { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  useWebPrivacyStore,
  type CookieCategory,
  type CookieSite,
} from "../stores/WebPrivacyStore";
import CookieSiteCard from "./CookieSiteCard";
import GlobalPreferenceCard from "./GlobalPreferenceCard";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { RecentCookieEvents } from "./RecentCookieEvents";

type Mode = "preview" | "full";

export default function WebPrivacyCompanion({
  mode = "preview",
}: {
  mode?: Mode;
}) {
  const { websites, loadSites, computeRiskScore } = useWebPrivacyStore();
  const { cookieLogs } = useWebPrivacyStore();

  useEffect(() => {
    loadSites();
  }, [loadSites, cookieLogs]);

  // determine urgent sites by risk threshold
  const urgentSites = useMemo(
    () => websites.filter((w) => (w.riskScore ?? computeRiskScore(w)) >= 70),
    [websites, computeRiskScore]
  );

  // preview mode shows a small compact card list (2)
  if (mode === "preview") {
    const preview = websites.slice(0, 2);
    return (
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[color:var(--card)] md:p-4 rounded-lg shadow"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Web Privacy Companion</h3>
          <a href="/cookies" className="text-sm text-[color:var(--muted)]">
            Manage cookies
          </a>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {preview.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-2 bg-[color:var(--bg)] rounded"
            >
              <div>
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-xs text-[color:var(--muted)]">
                  {s.domain}
                </div>
              </div>
              <div className="text-xs">
                <Badge className="bg-slate-700/10">{s.riskScore} risk</Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 text-xs text-[color:var(--muted)]">
          {cookieLogs
            .slice(0, 2)
            .map((a) => a.message)
            .join(" • ")}
        </div>
      </motion.section>
    );
  }

  // full mode
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Dashboard />
    </motion.section>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12, // adjust the delay between cards
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 18 },
  },
};

export const Dashboard: React.FC = () => {
  const { loadSites, websites, cookieLogs } = useWebPrivacyStore();

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  return (
    <div className="space-y-6 px-6 md:px-2">
      <h1 className="text-3xl font-bold text-gray-800">Cookie Tracker</h1>

      <p className="mt-2 text-lg text-gray-600">
        Manage cookie categories per site, view risk warnings, and generate
        audit records when you change cookie preferences.
      </p>

      <div className="mt-4">
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-500/20 text-yellow-600 border-amber-600">
              Privacy Alerts
            </Badge>
            <Badge className="bg-slate-700/10 text-[color:var(--muted)] border-border">
              {websites.length} sites
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-2 text-sm text-[color:var(--muted)] bg-gray-100 rounded-2xl px-2 py-3">
        <div className="w-12">
        <Info className="text-gray-500" />
        </div>
        <p className="xs:truncate">
          The Companion can issue session-only permissions ("Allow once").
          Essential cookies must remain enabled for basic site functionality.
        </p>
      </div>
      <GlobalPreferenceCard />

      <HighRiskSummary />
      <RecentCookieEvents cookieLogs={cookieLogs} />

      <CookieTable />
    </div>
  );
};

// src/components/HighRiskSummary.tsx

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

const MAX_DISPLAY = 5;

export const HighRiskSummary: React.FC = () => {
  const { websites } = useWebPrivacyStore();
  const [showAll, setShowAll] = useState(false);

  const highRiskSites = websites.filter((s) => (s.riskScore ?? 0) >= 80);
  const avgRisk =
    websites.length > 0
      ? Math.round(
          websites.reduce((acc, s) => acc + (s.riskScore ?? 0), 0) /
            websites.length
        )
      : 0;

  const sitesToDisplay = showAll
    ? highRiskSites
    : highRiskSites.slice(0, MAX_DISPLAY);
  const remaining = highRiskSites.length - MAX_DISPLAY;

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Privacy Risk Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Average Risk */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Average Risk</span>
          <span className="text-sm font-medium">{avgRisk}%</span>
        </div>
        <Progress value={avgRisk} className="h-2.5 rounded-full" />

        {/* High Risk Sites */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              High-Risk Websites
            </span>
            <Badge className="font-medium bg-gray-100 text-red-400">
              {highRiskSites.length} / {websites.length}
            </Badge>
          </div>

          {highRiskSites.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {sitesToDisplay.map((s) => (
                <span
                  key={s.id}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium cursor-pointer hover:bg-red-200 transition"
                  onClick={() => {
                    // optional: jump to site details
                    window.location.hash = `#${s.id}`;
                  }}
                >
                  {s.name}
                  <Badge className="bg-red-200 text-red-700 text-[10px] px-1 py-0.5 rounded">
                    {s.riskScore}%
                  </Badge>
                </span>
              ))}

              {remaining > 0 && !showAll && (
                <button
                  onClick={() => setShowAll(true)}
                  className="text-red-500 text-xs underline hover:text-red-600"
                >
                  +{remaining} more
                </button>
              )}

              {showAll && (
                <button
                  onClick={() => setShowAll(false)}
                  className="text-red-500 text-xs underline hover:text-red-600"
                >
                  Show less
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              No high-risk websites detected
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { ChevronLeft, ChevronRight, Info, MoreHorizontal } from "lucide-react";
const PAGE_SIZE = 10; // adjust rows per page

export const CookieTable: React.FC = () => {
  const { websites } = useWebPrivacyStore();
  const [selected, setSelected] = useState<CookieSite | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(websites.length / PAGE_SIZE);
  const paginatedSites = websites.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const goPrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
    <>
      <div className="bg-[color:var(--card)] rounded-xl border border-border p-5">
        <h2 className="text-lg font-semibold mb-4">
          Websites & Cookie Policies
        </h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Website</TableHead>
                <TableHead className="text-center">Domain</TableHead>
                <TableHead className="text-center">Risk</TableHead>
                <TableHead className="w-8"> </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSites.map((site) => (
                <TableRow
                  key={site.id}
                  onClick={() => setSelected(site)}
                  className="cursor-pointer hover:bg-muted/5 transition"
                >
                  <TableCell>{site.name}</TableCell>
                  <TableCell className="text-muted-foreground text-center">
                    {site.domain}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={`${
                        site.riskScore && site.riskScore > 80
                          ? "bg-red-600/20 text-red-600 border-red-500"
                          : site.riskScore && site.riskScore > 50
                            ? "bg-yellow-800/20 text-yellow-600/80 border-yellow-500"
                            : "bg-green-600/20 text-green-600 border-green-500"
                      }`}
                    >
                      {site.riskScore ?? "—"}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <MoreHorizontal size={16} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 mt-3 text-sm text-[color:var(--muted)]">
            <button
              onClick={goPrev}
              disabled={currentPage === 1}
              className="p-2 rounded hover:bg-muted/5 disabled:opacity-50 flex items-center justify-center"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="px-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={goNext}
              disabled={currentPage === totalPages}
              className="p-2 rounded hover:bg-muted/5 disabled:opacity-50 flex items-center justify-center"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {selected && (
        <CookieSiteCard
          currentSite={selected}
          open={!!selected}
          onOpenChange={() => setSelected(null)}
        />
      )}
    </>
  );
};
