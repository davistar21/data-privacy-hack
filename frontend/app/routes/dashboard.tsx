// src/components/Dashboard.tsx
import React, { useEffect } from "react";
import { useConsentStore } from "../stores/ConsentStore";
import { OrgCard } from "../components/OrgCard";
import { TransparencyLog } from "../components/TransparencyLog";
import { ConsentChart } from "../components/ConsentChart";
import { IncidentBanner } from "../components/IncidentBanner";
import WebPrivacyCompanion from "../components/WebPrivacyCompanion";

const Dashboard: React.FC = () => {
  const loadConsents = useConsentStore((s) => s.loadConsents);
  const consents = useConsentStore((s) => s.consents);
  const theme = useConsentStore((s) => s.theme);
  const setTheme = useConsentStore((s) => s.setTheme);
  const loadLogs = useConsentStore((s) => s.loadLogs);

  useEffect(() => {
    loadConsents();
    loadLogs();
    // set global theme attribute for CSS variables
    document.documentElement.setAttribute(
      "data-theme",
      theme === "dark" ? "dark" : "light"
    );
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme === "dark" ? "dark" : "light"
    );
  }, [theme]);

  return (
    <div className="min-h-screen p-6 bg-[color:var(--bg)]">
      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-[color:var(--text)]">
              Citizen Privacy Assistant — Consent Hub
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="px-3 py-1 rounded bg-slate-700/20 text-[color:var(--text)]"
              >
                Toggle Theme
              </button>
            </div>
          </div>

          {/* Incident banner - for now we pass mocked empty array; later populate */}
          <IncidentBanner incidents={[]} />

          <div className="grid grid-cols-1 gap-4">
            {consents.map((c) => (
              <OrgCard key={c.id} consent={c} />
            ))}
          </div>
        </div>

        <aside className="col-span-4 space-y-4">
          <div className="bg-[color:var(--card)] p-4 rounded-lg shadow">
            <ConsentChart />
          </div>

          <TransparencyLog />
          <WebPrivacyCompanion />
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
