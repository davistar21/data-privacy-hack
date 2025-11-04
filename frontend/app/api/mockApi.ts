// src/api/mockApi.ts
import { consents } from "../../constants/consent";
import { orgs } from "../../constants/org";
import type {
  Consent,
  AuditLogEntry,
  Organization,
  RevocationPayload,
  OrgAuditEvent,
} from "~/types";

const LATENCY = 600;
const FAILURE_RATE = 0.08;

// ----------------------
// In-memory mock storage
// ----------------------
let auditLogs: AuditLogEntry[] = [];
let orgLogs: OrgAuditEvent[] = [];
let dataSubjectRequests: any[] = [];
let incidents: any[] = [];

// ----------------------
// Helpers
// ----------------------
function randomFail() {
  return Math.random() < FAILURE_RATE;
}

function delay(ms = LATENCY + Math.random() * 400) {
  return new Promise((r) => setTimeout(r, ms));
}

// ----------------------
// Consent Operations
// ----------------------
export async function getConsents(userId: string) {
  await delay();
  const userConsents = consents.filter((c) => c.userId === userId);
  return userConsents.map((c) => ({
    ...c,
    org: orgs.find((o) => o.id === c.orgId),
  }));
}

export async function postRevocation(payload: RevocationPayload) {
  await delay();
  if (randomFail()) return { success: false, message: "Network error" };

  const timestamp = new Date().toISOString();
  const c = consents.find(
    (x) =>
      x.userId === payload.userId &&
      x.orgId === payload.orgId &&
      x.purpose === payload.purpose
  );

  const categoryPool = ["important", "sensitive", "normal"];
  const randomCategory = categoryPool[
    Math.floor(Math.random() * categoryPool.length)
  ] as AuditLogEntry["category"];

  if (payload.type === "revoke") {
    // --- Handle Revocation ---
    if (c) {
      c.consentGiven = false;
      c.revokedAt = timestamp;
    } else {
      consents.push({
        id: `c-${Math.random().toString(36).slice(2, 9)}`,
        userId: payload.userId,
        orgId: payload.orgId,
        purpose: payload.purpose,
        fields: payload.fields,
        consentGiven: false,
        givenAt: timestamp,
        revokedAt: timestamp,
      });
    }

    const newAudit: AuditLogEntry = {
      id: `a-${Math.random().toString(36).slice(2, 9)}`,
      type: "revocation",
      userId: payload.userId,
      orgId: payload.orgId,
      message: `Revocation: User ${payload.userId} revoked ${payload.purpose} for fields ${payload.fields.join(", ")}.`,
      timestamp,
      status: "completed",
      category: randomCategory,
      isNotification: randomCategory === "important",
    };
    auditLogs.unshift(newAudit);
    return { success: true, audit: newAudit };
  }

  if (payload.type === "regrant") {
    // --- Handle Re-grant ---
    if (c) {
      c.consentGiven = true;
      c.revokedAt = null;
      c.givenAt = timestamp;
    } else {
      consents.push({
        id: `c-${Math.random().toString(36).slice(2, 9)}`,
        userId: payload.userId,
        orgId: payload.orgId,
        purpose: payload.purpose,
        fields: payload.fields,
        consentGiven: true,
        givenAt: timestamp,
        revokedAt: null,
      });
    }

    const newAudit: AuditLogEntry = {
      id: `a-${Math.random().toString(36).slice(2, 9)}`,
      type: "regrant",
      userId: payload.userId,
      orgId: payload.orgId,
      message: `Regrant: Under NDPR compliance, consent for "${payload.purpose}" with ${payload.orgId} reinstated for fields ${payload.fields.join(", ")}.`,
      timestamp,
      status: "completed",
    };
    auditLogs.unshift(newAudit);
    return { success: true, audit: newAudit };
  }

  return { success: false, message: "Invalid operation" };
}

// ----------------------
// Audit / Org Operations
// ----------------------
export async function getAuditLogs(userId: string, limit = 20) {
  await delay();
  return auditLogs.filter((a) => a.userId === userId).slice(0, limit);
}

export async function getOrgLogs(orgId: string, limit = 50) {
  await delay();
  return orgLogs
    .filter((l) => l.orgId === orgId)
    .slice(0, limit)
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}

export async function getOrganizations() {
  await delay();
  return orgs;
}

// ----------------------
// Org Event + SSE System
// ----------------------
export function pushOrgEvent(event: OrgAuditEvent) {
  orgLogs.unshift(event);
}

type SSECallback = (ev: OrgAuditEvent) => void;
const sseSubscribers: SSECallback[] = [];

export function subscribeMockSSE(cb: SSECallback) {
  sseSubscribers.push(cb);
  return () => {
    const idx = sseSubscribers.indexOf(cb);
    if (idx >= 0) sseSubscribers.splice(idx, 1);
  };
}

export function startMockSSESimulator(intervalMs = 8000) {
  setInterval(() => {
    const orgIds = ["ecomshop", "zenith", "lagos_hospital", "mobiletel"];
    const orgId = orgIds[Math.floor(Math.random() * orgIds.length)];
    const newEv: OrgAuditEvent = {
      id: `ev-${Math.random().toString(36).slice(2, 8)}`,
      type: Math.random() > 0.5 ? "revocation" : "audit",
      userId: `user-${Math.floor(Math.random() * 10)}`,
      userName: ["Tunde", "Aisha", "Chinedu", "Ngozi"][
        Math.floor(Math.random() * 4)
      ],
      orgId,
      orgName:
        orgId === "ecomshop"
          ? "EcomShop"
          : orgId === "zenith"
            ? "Zenith Bank"
            : orgId === "lagos_hospital"
              ? "Lagos Hospital"
              : "MobileTel",
      message:
        Math.random() > 0.5
          ? "User requested revocation of marketing consent."
          : "AI Compliance Gateway generated audit log confirming revocation.",
      fields: ["name", "phone"].slice(0, Math.floor(Math.random() * 2) + 1),
      timestamp: new Date().toISOString(),
      status: "completed",
    };
    pushOrgEvent(newEv);
    sseSubscribers.forEach((cb) => cb(newEv));
  }, intervalMs);
}

// ----------------------
// Additional Mock Modules
// ----------------------

// A. Consent Intelligence Dashboard
export async function getConsentSummary() {
  await delay();
  const total = consents.length;
  const granted = consents.filter((c) => c.consentGiven).length;
  const revoked = consents.filter((c) => !c.consentGiven).length;
  const expired = consents.filter((c) => c.revokedAt).length;
  const reused = Math.floor(granted * 0.1);

  return {
    total,
    granted,
    revoked,
    expired,
    reused,
    trend: { revocations: "+20%" },
    breakdown: {
      marketing: consents.filter((c) => c.purpose === "marketing").length,
      analytics: consents.filter((c) => c.purpose === "analytics").length,
      customer_service: consents.filter((c) => c.purpose === "customer_service")
        .length,
    },
    atRisk: [
      { segment: "Marketing", count: 1000 },
      { segment: "Inactive users", count: 750 },
    ],
  };
}

// B. DSR Handling
export async function getDSRRequests() {
  await delay();
  if (dataSubjectRequests.length === 0) {
    dataSubjectRequests = [
      {
        id: "r-001",
        type: "access",
        user: "John Doe",
        timeLeft: "48h",
        status: "pending",
      },
      {
        id: "r-002",
        type: "delete",
        user: "Amina",
        timeLeft: "12h",
        status: "in-progress",
      },
    ];
  }
  return dataSubjectRequests;
}

// C. Incident Management
export async function getIncidents() {
  await delay();
  if (incidents.length === 0) {
    incidents = [
      {
        id: "i-001",
        type: "breach",
        severity: "high",
        message: "Unauthorized access detected from foreign IP.",
        timestamp: new Date().toISOString(),
      },
    ];
  }
  return incidents;
}

// D. AI Assistant / Compliance Insights
export async function getComplianceInsights() {
  await delay(1200);
  return {
    reportSummary:
      "Detected 12 consents expired but still active. Suggest revoking marketing processing for inactive users older than 2 years.",
    recommendation: "Auto-generate NDPR compliance report weekly.",
    reference: "NDPR 2019 Section 2.2(3) - Lawful Processing.",
  };
}
