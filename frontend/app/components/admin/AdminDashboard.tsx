import React from "react";
import ConsentIntelligenceDashboard from "./ConsentIntelligenceDashboard";
import AuditAndLogs from "./AuditAndLogs";
import AIComplianceAssistant from "./AIComplianceAssistant";
import DSRHandling from "./DSRHandling";
import IncidentManagement from "./IncidentManagement";
import { useParams } from "react-router";
import { useConsentStore } from "../../stores/ConsentStore";

export default function AdminDashboard() {
  const { orgId } = useParams();
  const { orgLogs } = useConsentStore();
  const logs = orgLogs[orgId!] ?? [];
  return (
    <div className="p-6 bg-black min-h-screen text-white space-y-6">
      <h1 className="text-3xl font-bold mb-6">
        Admin Control Center — NDPR Compliance
      </h1>

      <ConsentIntelligenceDashboard logs={logs} />
      <AuditAndLogs />
      <AIComplianceAssistant />
      <DSRHandling />
      <IncidentManagement />
    </div>
  );
}
