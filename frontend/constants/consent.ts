import type { Consent } from "~/types";
import { orgs } from "./org";

export const consents: Consent[] = Array.from({ length: 73 }, (_, i) => {
  const org = orgs[Math.floor(Math.random() * orgs.length)];
  const purposes = [
    "marketing",
    "analytics",
    "customer_service",
    "research",
    "fraud_prevention",
    "service_delivery",
  ];
  const fields = [
    ["name", "email"],
    ["name", "phone"],
    ["email", "purchase_history"],
    ["name", "address", "transaction_history"],
    ["phone", "usage_stats"],
    ["bvn", "account_number"],
    ["nin", "dob"],
  ];
  const randomPurpose = purposes[Math.floor(Math.random() * purposes.length)];
  const randomFields = fields[Math.floor(Math.random() * fields.length)];
  const givenDate = new Date(
    Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 90
  ).toISOString(); // within last 90 days
  const revoked = Math.random() < 0.35; // 35% revoked

  return {
    id: `c-${i + 1}`,
    userId: "user-1",
    orgId: org.id,
    purpose: randomPurpose,
    fields: randomFields,
    consentGiven: !revoked,
    givenAt: givenDate,
    revokedAt: revoked
      ? new Date(
          Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30
        ).toISOString()
      : null,
  };
});
