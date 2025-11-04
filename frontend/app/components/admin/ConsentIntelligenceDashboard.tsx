import React, { useEffect, useState } from "react";
import type { OrgAuditEvent } from "~/types";

export default function ConsentIntelligenceDashboard({
  logs,
}: {
  logs: OrgAuditEvent[];
}) {
  const [stats, setStats] = useState<{
    total: number;
    revoked: number;
    regranted: number;
    recent: OrgAuditEvent[];
  } | null>(null);

  useEffect(() => {
    if (!logs || logs.length === 0) return;

    // Compute counts based on event type
    const revokedCount = logs.filter((l) => l.type === "revocation").length;
    const regrantCount = logs.filter((l) => l.type === "reuse_accepted").length;

    // Example placeholder "expired" as 10% of total for now
    const total = logs.length;

    setStats({
      total,
      revoked: revokedCount,
      regranted: regrantCount,
      recent: logs.slice(0, 5), // most recent logs
    });
  }, [logs]);

  if (!stats) return <div>Loading consent insights...</div>;

  return (
    <div className="p-4 bg-gray-900 text-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Consent Intelligence Dashboard</h2>

      {/* --- Top stats --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <Stat label="Total Events" value={stats.total} />
        <Stat label="Revoked" value={stats.revoked} />
        <Stat label="Regranted" value={stats.regranted} />
        <Stat label="Expired" value={Math.floor(stats.total * 0.029)} />
      </div>

      {/* --- Trend + breakdown placeholders --- */}
      <div className="mt-4">
        <p className="text-sm text-gray-300">
          Revocations trend this month:{" "}
          <span className="text-red-400">10%</span>
        </p>

        <h3 className="font-semibold mt-3">Breakdown by Consent Type:</h3>
        <ul className="text-gray-400 text-sm">
          marketing: 11 analytics: 10 customer_service: 13
        </ul>

        <h3 className="font-semibold mt-3">At-Risk Segments:</h3>
        <ul className="text-gray-400 text-sm">
          Marketing: 1000 users Inactive users: 750 users
        </ul>
      </div>

      {/* --- Recent activity preview --- */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Recent Activity</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          {stats.recent.map((log) => (
            <li
              key={log.id}
              className="bg-gray-800 p-3 rounded-md flex justify-between items-center"
            >
              <div>
                <p className="font-medium text-white">
                  {log.type === "revocation" ? "Revoked" : "Audit"} —{" "}
                  {log.orgName}
                </p>
                <p className="text-gray-400">
                  {log.userName}: {log.message}
                </p>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Small stat card
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-800 p-3 rounded-lg text-center">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}
