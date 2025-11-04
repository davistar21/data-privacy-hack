import React, { useEffect } from "react";
import { useConsentStore } from "../stores/ConsentStore";
import { OrgCard } from "../components/ConsentSection/OrgCard";
import TransparencyLog from "../components/TransparencyLog";
import { ConsentChart } from "../components/ConsentSection/ConsentChart";
import { IncidentBanner } from "../components/IncidentBanner";
import WebPrivacyCompanion from "../components/WebPrivacyCompanion";
import { MarketplacePreview } from "../components/MarketplacePreview";
import { useMarketplaceStore } from "../stores/MarketPlaceStore";
import { toast } from "sonner";
import { ConsentSection } from "../components/ConsentSection/ConsentSection";
import CitizenDashboard from "../dashboard/Dashboard";

const Dashboard: React.FC = () => {
  const loadConsents = useConsentStore((s) => s.loadConsents);
  const consents = useConsentStore((s) => s.consents);
  const loadLogs = useConsentStore((s) => s.loadLogs);
  const appendOrgLog = useConsentStore((s) => s.appendOrgLog);
  const { offers, benefits, loadOffers, acceptOffer, undoAccept } =
    useMarketplaceStore();
  const handleAccept = async (offerId: string) => {
    const res = await acceptOffer(offerId);
    if (res.success && res.requestId) {
      toast.success("Offer accepted!", {
        action: {
          label: "Undo",
          onClick: async () => {
            await undoAccept(res.requestId!);
            toast.success("Acceptance undone.");
          },
        },
        duration: 7000,
      });
    } else {
      toast.error("Could not accept offer.");
    }
  };

  useEffect(() => {
    loadConsents();
    loadLogs();
    // set global theme attribute for CSS variables
  }, []);

  return (
    <div className="min-h-screen p-2 md:p-6">
      <CitizenDashboard />
      <MarketplacePreview
        offers={offers.slice(0, 3)}
        onAccept={(id) => handleAccept(id)}
      />
      <ConsentPreview />
      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-[color:var(--text)]">
              Citizen Privacy Assistant
            </h1>
          </div>

          {/* Incident banner - for now we pass mocked empty array; later populate */}
          <IncidentBanner incidents={["Hello"]} />
          <ConsentSection mode="preview" />
          {/* <TransparencyLog mode="full" /> */}
          <div className="max-w-6xl mx-auto mt-6"></div>
          <div className="grid grid-cols-1 gap-4">
            {consents.map((c) => (
              <OrgCard key={c.id} consent={c} />
            ))}
          </div>
        </div>
        <aside className="col-span-4 space-y-4">
          <div className="bg-[color:var(--card)] p-4 rounded-lg shadow">
            {/* <ConsentChart /> */}
          </div>

          {/* <TransparencyLog /> */}
          {/* <WebPrivacyCompanion /> */}
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ConsentTimeline } from "../components/ConsentSection/ConsentTimeline";
import { ShieldCheck } from "lucide-react";

export const ConsentPreview = () => {
  const { consents } = useConsentStore();
  const active = consents.filter((c) => c.consentGiven).slice(0, 3);

  return (
    <Card className="bg-[color:var(--card)]/90 backdrop-blur-md border border-slate-800/30 shadow-md hover:shadow-lg transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-[color:var(--primary)]" />
          <CardTitle className="text-sm font-semibold text-[color:var(--text)]">
            Recent Consents
          </CardTitle>
        </div>
        <a
          href="/consents"
          className="text-xs text-[color:var(--muted)] hover:text-[color:var(--primary)] transition-colors"
        >
          View all →
        </a>
      </CardHeader>

      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {/* Chart Overview */}
        {/* <Card className="bg-[color:var(--card-foreground)]/5 border border-slate-800/20 rounded-xl shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-[color:var(--muted)] font-normal">
              Consent Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ConsentChart />
          </CardContent>
        </Card> */}

        {/* Timeline */}
        <Card className="bg-[color:var(--card-foreground)]/5 border border-slate-800/20 rounded-xl shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-[color:var(--muted)] font-normal">
              Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ConsentTimeline />
          </CardContent>
        </Card>
      </CardContent>

      {/* Quick Active Consent Cards */}
      <motion.div
        layout
        className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-4 pt-2"
      >
        {active.map((c) => (
          <OrgCard key={c.id} consent={c} />
        ))}
      </motion.div>
    </Card>
  );
};
