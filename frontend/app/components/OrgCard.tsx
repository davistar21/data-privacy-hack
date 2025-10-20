// src/components/OrgCard.tsx
import React, { useState } from "react";
import { type Consent } from "../types";
import { ToggleButton } from "./ToggleButton";
import { motion } from "framer-motion";
import { useConsentStore } from "../stores/ConsentStore";
import { toast } from "sonner";

type Props = {
  consent: Consent & {
    org?: { id: string; name: string; description?: string };
  };
};

export const OrgCard: React.FC<Props> = ({ consent }) => {
  const { orgId, purpose, fields, consentGiven } = consent;
  const [loading, setLoading] = useState(false);
  const revoke = useConsentStore((s) => s.revokeConsent);

  const handleToggle = async (val: boolean) => {
    // If user is trying to revoke (val false)
    if (!val) {
      setLoading(true);
      const res = await revoke({
        orgId: consent.orgId,
        purpose: consent.purpose,
        fields: consent.fields,
      });
      setLoading(false);
      if (!res.success) {
        toast.error(res.message || "Failed to revoke consent");
      } else {
        toast.success("Revocation accepted. Audit recorded.");
      }
    } else {
      // Re-grant flow - for MVP we just simulate granting (not implemented)
      // You can implement re-grant as a separate API call if needed.
      toast.info("Granting consent not implemented in mock.");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[color:var(--card)] rounded-xl p-4 shadow-md flex items-start justify-between gap-4"
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-[color:var(--text)]">
          {consent.org?.name || consent.orgId}
        </h3>
        <p className="text-sm text-[color:var(--muted)]">
          {consent.org?.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {consent.fields.map((f) => (
            <span
              key={f}
              className="text-xs px-2 py-1 rounded-full bg-slate-700/30 text-slate-200"
            >
              {f}
            </span>
          ))}
        </div>
        <div className="mt-2 text-xs text-[color:var(--muted)]">
          Purpose: <span className="font-medium">{consent.purpose}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`text-sm ${consentGiven ? "text-green-400" : "text-red-400"}`}
          >
            {consentGiven ? "Active" : "Revoked"}
          </div>
          <ToggleButton
            checked={consentGiven}
            onChange={handleToggle}
            disabled={loading}
          />
        </div>
        <div className="text-xs text-[color:var(--muted)]">
          {consent.revokedAt
            ? `Revoked ${new Date(consent.revokedAt).toLocaleString()}`
            : `Given ${new Date(consent.givenAt).toLocaleString()}`}
        </div>
      </div>
    </motion.div>
  );
};
