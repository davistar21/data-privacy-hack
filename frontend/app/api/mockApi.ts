// src/mockApi.ts
import type {
  Consent,
  AuditLogEntry,
  Organization,
  RevocationPayload,
} from "~/types";

const LATENCY = 600; // ms baseline
const FAILURE_RATE = 0.08; // 8% simulated failure

// Mock data
const orgs: Organization[] = [
  { id: "zenith", name: "Zenith Bank", description: "Retail & corporate bank" },
  {
    id: "lagos-hospital",
    name: "Lagos Hospital",
    description: "Healthcare provider",
  },
  { id: "ecomshop", name: "EcomShop", description: "Online marketplace" },
  { id: "mobiletel", name: "MobileTel", description: "Telecom operator" },
];

let consents: Consent[] = [
  {
    id: "c-1",
    userId: "user-1",
    orgId: "zenith",
    purpose: "marketing",
    fields: ["name", "phone"],
    consentGiven: true,
    givenAt: new Date().toISOString(),
  },
  {
    id: "c-2",
    userId: "user-1",
    orgId: "lagos-hospital",
    purpose: "customer_service",
    fields: ["name"],
    consentGiven: true,
    givenAt: new Date().toISOString(),
  },
  {
    id: "c-3",
    userId: "user-1",
    orgId: "ecomshop",
    purpose: "marketing",
    fields: ["email", "purchase_history"],
    consentGiven: true,
    givenAt: new Date().toISOString(),
  },
  {
    id: "c-4",
    userId: "user-1",
    orgId: "mobiletel",
    purpose: "analytics",
    fields: ["phone", "usage_stats"],
    consentGiven: true,
    givenAt: new Date().toISOString(),
  },
];

let auditLogs: AuditLogEntry[] = [
  {
    id: "a-1",
    type: "other",
    userId: "user-1",
    orgId: "ecomshop",
    message: "User registered and gave initial consents.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

function randomFail() {
  return Math.random() < FAILURE_RATE;
}

export async function getConsents(userId: string) {
  await new Promise((r) => setTimeout(r, LATENCY + Math.random() * 300));
  // Return consents joined with org info for UI
  const userConsents = consents.filter((c) => c.userId === userId);
  const withOrg = userConsents.map((c) => ({
    ...c,
    org: orgs.find((o) => o.id === c.orgId),
  }));
  return withOrg;
}

export async function postRevocation(payload: RevocationPayload) {
  await new Promise((r) => setTimeout(r, LATENCY + Math.random() * 500));
  // Simulate occasional failure
  if (randomFail()) {
    return { success: false, message: "Network error" };
  }
  const revocationTime = new Date().toISOString();
  // mutate mock DB: find consent and mark revoked
  const c = consents.find(
    (x) =>
      x.userId === payload.userId &&
      x.orgId === payload.orgId &&
      x.purpose === payload.purpose
  );
  if (c) {
    c.consentGiven = false;
    c.revokedAt = revocationTime;
  } else {
    // create a record if not exists
    consents.push({
      id: `c-${Math.random().toString(36).slice(2, 9)}`,
      userId: payload.userId,
      orgId: payload.orgId,
      purpose: payload.purpose,
      fields: payload.fields,
      consentGiven: false,
      givenAt: new Date().toISOString(),
      revokedAt: revocationTime,
    });
  }
  // create an audit entry
  const newAudit: AuditLogEntry = {
    id: `a-${Math.random().toString(36).slice(2, 9)}`,
    type: "revocation",
    userId: payload.userId,
    orgId: payload.orgId,
    message: `Revocation: User ${payload.userId} revoked ${payload.purpose} for fields ${payload.fields.join(", ")}`,
    timestamp: revocationTime,
    status: "completed",
  };
  auditLogs.unshift(newAudit);
  return { success: true, audit: newAudit };
}

export async function getAuditLogs(userId: string, limit = 20) {
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 300));
  return auditLogs.filter((a) => a.userId === userId).slice(0, limit);
}

export async function getOrganizations() {
  await new Promise((r) => setTimeout(r, 200));
  return orgs;
}
