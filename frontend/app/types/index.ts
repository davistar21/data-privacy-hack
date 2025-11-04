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
  fields: string[];
  consentGiven: boolean;
  givenAt: string;
  revokedAt?: string | null;
};

export type AuditLogEntry = {
  id: string;
  type: "revocation" | "regrant" | "incident" | "other";
  userId: string;
  orgId: string;
  message: string;
  timestamp: string;
  status?: "pending" | "completed" | "failed";
  category?: "important" | "sensitive" | "normal";
  isNotification?: boolean;
  meta?: Record<string, any>;
};

export type RevocationPayload = {
  userId: string;
  orgId: string;
  purpose: string;
  fields: string[];
  type: "revoke" | "regrant";
};

export type OrgAuditEvent = {
  id: string;
  type: "revocation" | "audit" | "reuse_accepted" | "incident";
  userId?: string;
  userName?: string;
  orgId: string;
  orgName?: string;
  message: string;
  fields?: string[];
  timestamp: string;
  status?: "pending" | "completed" | "failed";
  meta?: Record<string, any>;
};
export type CookieAuditEvent = Omit<
  OrgAuditEvent,
  "type" | "orgId" | "orgName"
> & {
  type:
    | "cookie_enabled"
    | "cookie_revoked"
    | "cookie_allowed_once"
    | "cookie_updated";
  siteDomain: string;
  siteName: string;
};

export type ReuseOffer = {
  id: string;
  orgId: string;
  orgName?: string;
  fields: string[];
  benefit: string;
  summary?: string;
  expiresAt?: string;
};

export type BenefitRecord = {
  id: string;
  requestId: string;
  reuseOfferId: string;
  userId: string;
  orgId: string;
  benefit: string;
  status: "pending" | "issued" | "redeemed" | "revoked";
  issuedAt?: string;
  expiresAt?: string;
};

export type GlobalPreference = {
  globalPreference: "accept_all" | "essential_only" | "reject_all";
};
export interface Notification {
  id: string;
  type: "consent" | "marketplace" | "cookie" | "data-alert";
  message: string;
  timestamp: string;
  read?: boolean;
  meta?: Record<string, any>;
}
