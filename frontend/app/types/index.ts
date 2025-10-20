// src/types.ts
export type User = {
  id: string;
  name: string;
  phone?: string;
  nin?: string;
};

export type Organization = {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string | null;
};

export type Consent = {
  id: string;
  userId: string;
  orgId: string;
  purpose: "marketing" | "customer_service" | "analytics" | string;
  fields: string[]; // e.g. ['name','phone']
  consentGiven: boolean;
  givenAt: string;
  revokedAt?: string | null;
};

export type AuditLogEntry = {
  id: string;
  type: "revocation" | "reuse" | "incident" | "other";
  userId: string;
  orgId: string;
  message: string;
  timestamp: string;
  status?: "pending" | "completed" | "failed";
};

export type RevocationPayload = {
  userId: string;
  orgId: string;
  purpose: string;
  fields: string[];
};
