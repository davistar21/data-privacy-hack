// src/components/WebPrivacyCompanion.tsx
import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useWebPrivacyStore } from "../stores/WebPrivacyStore";
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
  console.log("cookieLogs", cookieLogs);
  // preview mode shows a small compact card list (2)
  if (mode === "preview") {
    const preview = websites.slice(0, 2);
    return (
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[color:var(--card)] p-4 rounded-lg shadow"
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
      className="p-6 rounded-2xl bg-[color:var(--card)] shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-[color:var(--text)]">
            Web Privacy Companion
          </h2>
          <p className="text-sm text-[color:var(--muted)] max-w-xl">
            Manage cookie categories per site, view risk warnings and generate
            audit records when you change cookie preferences.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-800/20 text-yellow-200">
              Privacy Alerts
            </Badge>
            <Badge className="bg-slate-700/10 text-[color:var(--muted)]">
              {websites.length} sites
            </Badge>
          </div>
          <div className="text-xs text-[color:var(--muted)]">
            Recent cookie events appear in your Transparency Log
          </div>
        </div>
      </div>

      {urgentSites.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-red-900/10 border-l-4 border-red-600">
          <div className="font-semibold">High-risk website detected</div>
          <div className="text-sm text-[color:var(--muted)]">
            We recommend reviewing cookie settings for these sites:
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {urgentSites.map((s) => (
              <Button
                key={s.id}
                variant="ghost"
                onClick={() => {
                  window.location.hash = `#${s.id}`;
                }}
              >
                {s.name} ({s.riskScore})
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlobalPreferenceCard />
        <RecentCookieEvents cookieLogs={cookieLogs} />
      </div>

      <CookieSiteList websites={websites} />

      <p className="text-sm text-[color:var(--muted)] mt-6">
        The Companion can issue session-only permissions ("Allow once").
        Essential cookies must remain enabled for basic site functionality.
      </p>
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

export function CookieSiteList({ websites }: { websites: any[] }) {
  return (
    <motion.div
      className="mt-6 grid grid-cols-1 md:grid-cols-1 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      layout
    >
      {websites.map((site) => (
        <motion.div key={site.id} variants={itemVariants} layout>
          <CookieSiteCard site={site} />
        </motion.div>
      ))}
    </motion.div>
  );
}
