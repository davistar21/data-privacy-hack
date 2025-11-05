import { useParams } from "react-router";
import { useConsentStore } from "../stores/ConsentStore";
import { StatCard } from "../components/StatCard";

export default function OverviewPage() {
  const { orgId } = useParams();
  const { orgLogs } = useConsentStore();
  const logs = orgLogs[orgId!] || [];

  const totalEvents = logs.length;
  const granted = logs.filter((l) => l.type === "audit").length;
  const revoked = logs.filter((l) => l.type === "revocation").length;
  const reuses = logs.filter((l) => l.type === "reuse_accepted").length;
  const incidents = logs.filter((l) => l.type === "incident");

  return (
    <div className="space-y-6 xs:p-2 sm:p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          {formatText(orgs.find((o) => o.id == orgId)?.name!, "capitalize")}
        </h1>
        <img
          src={orgs.find((o) => o.id)?.logoUrl ?? ""}
          alt=""
          className="w-12 md:w-16"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Events" value={totalEvents} />
        <StatCard title="Consents Granted" value={granted} />
        <StatCard title="Consents Revoked" value={revoked} />
        <StatCard title="Data Reuses" value={reuses} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-medium mb-3">Recent Activity</h2>
        <ul className="space-y-3">
          {logs.slice(0, 5).map((log) => (
            <li
              key={log.id}
              className="flex justify-between text-sm border-b pb-2"
            >
              <span>{log.message}</span>
              <span className="text-gray-400">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <OffersManagementPage />
      <DataRegistryPage />
      <AuditLogsPage />
    </div>
  );
}

import { ScrollArea } from "../components/ui/scroll-area";
import type { OrgAuditEvent } from "~/types";

export function AuditLogList({ logs }: { logs: OrgAuditEvent[] }) {
  if (!logs?.length)
    return <p className="text-sm text-gray-500">No audit logs yet.</p>;

  return (
    <ScrollArea className="h-[70vh] w-full">
      <ul className="space-y-3">
        {logs.map((log) => {
          const badgeColor =
            log.status === "completed"
              ? "green-100"
              : log.status === "pending"
                ? "yellow-200"
                : "red-100";
          return (
            <li
              key={log.id}
              className={`p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1 bg-${badgeColor}`}
            >
              <span className="text-sm text-gray-900 font-medium">
                {log.type.replace("_", " ").toUpperCase()}
              </span>
              <span className="text-sm text-gray-600">{log.message}</span>
              <span className="text-sm text-gray-600">{log.status}</span>
              <span className="text-xs text-gray-400">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </li>
          );
        })}
      </ul>
    </ScrollArea>
  );
}

// src/pages/admin/DashboardPage.tsx
import { useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";

import { useMarketplaceStore } from "../stores/MarketPlaceStore";

export function DashboardPage() {
  const { consents, auditLogs, loadConsents, loadLogs, orgLogs, userId } =
    useConsentStore();
  const { offers, loadOffers, benefits } = useMarketplaceStore();
  const { orgId } = useParams();
  const logs = orgLogs[orgId!];
  // console.log("orglogs by org", logs);
  // console.log(
  // "filtered audit logs",
  // auditLogs.filter((log) => log.orgId == orgId)
  // );
  useEffect(() => {
    loadConsents(userId);
    loadLogs();
    loadOffers();
  }, []);

  const activeConsents = consents.filter((c) => c.consentGiven).length;
  const revokedConsents = consents.length - activeConsents;
  const totalOffers = offers.length;
  const redeemedBenefits = benefits.filter((b) => b.status === "issued").length;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow">
          <CardContent className="p-4">
            <p className="text-gray-500">Total Consents</p>
            <h2 className="text-3xl font-semibold">{consents.length}</h2>
          </CardContent>
        </Card>

        <Card className="shadow">
          <CardContent className="p-4">
            <p className="text-gray-500">Active Consents</p>
            <h2 className="text-3xl font-semibold text-green-600">
              {activeConsents}
            </h2>
          </CardContent>
        </Card>

        <Card className="shadow">
          <CardContent className="p-4">
            <p className="text-gray-500">Revoked Consents</p>
            <h2 className="text-3xl font-semibold text-red-500">
              {revokedConsents}
            </h2>
          </CardContent>
        </Card>

        <Card className="shadow">
          <CardContent className="p-4">
            <p className="text-gray-500">Data Reuse Offers</p>
            <h2 className="text-3xl font-semibold">{totalOffers}</h2>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow">
          <CardContent className="p-4">
            <p className="text-gray-500">Redeemed Benefits</p>
            <h2 className="text-3xl font-semibold text-blue-600">
              {redeemedBenefits}
            </h2>
          </CardContent>
        </Card>

        <Card className="shadow">
          <CardContent className="p-4">
            <p className="text-gray-500">Audit Log Entries</p>
            <h2 className="text-3xl font-semibold">{auditLogs.length}</h2>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Button } from "../components/ui/button";
import { formatText } from "../utils/formatText";
import AdminDashboard from "../components/admin/AdminDashboard";
import OffersManagementPage from "../components/admin/OffersManagementPage";
import { orgs } from "../../constants/org";

export function OffersManagementPage2() {
  const { offers, loadOffers, clearOffers } = useMarketplaceStore();

  useEffect(() => {
    loadOffers();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Offers Management</h1>
        <Button variant="outline" onClick={clearOffers}>
          Clear Offers
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer) => (
          <Card key={offer.id} className="shadow hover:shadow-lg transition">
            <CardContent className="p-4 space-y-2">
              <h2 className="text-xl font-semibold">{offer.orgName}</h2>
              <p className="text-sm text-gray-500">{offer.summary}</p>
              <p className="text-sm">
                <strong>Benefit:</strong> {offer.benefit}
              </p>
              <p className="text-sm text-gray-500">
                Expires: {new Date(offer.expiresAt!).toLocaleDateString()}
              </p>
              <div className="pt-2">
                <Button size="sm">Edit Offer</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// src/pages/admin/DataRegistryPage.tsx

export function DataRegistryPage() {
  const { consents, loadConsents, userId } = useConsentStore();
  const { orgId } = useParams();
  useEffect(() => {
    loadConsents(userId);
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Data Registry</h1>
      <p className="text-gray-500 mb-4">
        Review all user consents across {formatText(orgId!, "capitalize")}
      </p>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Organization</th>
              <th className="px-4 py-2 text-left">Purpose</th>
              <th className="px-4 py-2 text-left">Fields</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Given At</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-gray-200">
            {consents
              .filter((c) => c.orgId === orgId)
              .map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{c.org?.name || c.orgId}</td>
                  <td className="px-4 py-2">{formatText(c.purpose)}</td>
                  <td className="px-4 py-2">
                    {c.fields
                      .map((field) => formatText(field, "capitalize"))
                      .join(", ")}
                  </td>
                  <td className="px-4 py-2">
                    {c.consentGiven ? (
                      <span className="text-green-600 font-medium">
                        Granted
                      </span>
                    ) : (
                      <span className="text-red-500 font-medium">Revoked</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(c.givenAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// src/pages/admin/AuditLogsPage.tsx

export function AuditLogsPage() {
  const { auditLogs, loadLogs } = useConsentStore();
  const { orgId } = useParams();
  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Audit Logs</h1>
      <p className="text-gray-500">
        View all audit events across {formatText(orgId!, "capitalize")}
      </p>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Timestamp</th>
              <th className="px-4 py-2 text-left">Organization</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Message</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {auditLogs
              .filter((a) => a.orgId == orgId)
              .map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    {formatText(log.orgId, "capitalize")}
                  </td>
                  <td className="px-4 py-2">{log.type}</td>
                  <td className="px-4 py-2">{log.message}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        log.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : log.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
