import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ToggleButton } from "../ToggleButton";
import ConfirmRevocationModal from "../ConfirmRevocationModal";
import { useConsentStore } from "../../stores/ConsentStore";
import type { Consent } from "~/types";
import {
  Building2,
  CheckCircle2,
  XCircle,
  ShieldOff,
  RefreshCcw,
  Info,
} from "lucide-react";

export const OrgCard = ({ consent }: { consent: Consent }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const revoke = useConsentStore((s) => s.revokeConsent);
  const undoRevocation = useConsentStore((s) => s.undoRevocation);

  const handleRevoke = async () => {
    setLoading(true);
    const res = await revoke(consent);
    setLoading(false);

    if (!res.success) toast.error("Revocation failed");
    else {
      toast.success("Revocation requested — Undo?", {
        action: {
          label: (
            <div className="flex items-center gap-1">
              <RefreshCcw className="w-3 h-3" /> Undo
            </div>
          ),
          onClick: () => undoRevocation(consent),
        },
        duration: 8000,
      });
    }
  };

  const status = consent.consentGiven ? "Active" : "Revoked";

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 80, damping: 12 },
    },
  };

  const tagVariants = {
    hidden: { opacity: 0, y: 5, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: i * 0.05, duration: 0.25 },
    }),
  };

  return (
    <motion.div
      layout
      // variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -10 }}
      whileHover={{
        scale: 1.02,
        transition: { type: "spring", stiffness: 200, damping: 15 },
      }}
      className="bg-[color:var(--card)] border border-slate-800/30 p-5 rounded-xl shadow-md hover:shadow-lg transition-all flex flex-col md:flex-row justify-between gap-4"
    >
      {/* Left section: Org info */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-[color:var(--text)] text-base">
            {consent.orgId}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
          <Info className="w-4 h-4 text-slate-400" />
          <span>Organization ID: {consent.orgId}</span>
        </div>

        <motion.div
          layout
          className="mt-2 flex flex-wrap gap-2"
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {consent.fields.map((f, i) => (
              <motion.span
                key={f}
                custom={i}
                variants={tagVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-700/30 rounded-full border border-slate-700/20 text-[color:var(--muted)]"
              >
                <ShieldOff className="w-3 h-3 text-slate-400" />
                {f}
              </motion.span>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Right section: Status + toggle */}
      <motion.div
        layout
        className="flex flex-col items-end justify-between gap-3 min-w-[140px]"
      >
        <div className="flex items-center gap-2">
          {consent.consentGiven ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400" />
          )}
          <span
            className={`text-sm font-medium ${
              consent.consentGiven ? "text-green-400" : "text-red-400"
            }`}
          >
            {status}
          </span>
        </div>

        <ToggleButton
          checked={consent.consentGiven}
          onChange={(val) => !val && setModalOpen(true)}
          disabled={loading}
        />
      </motion.div>

      {/* Confirm Revocation Modal */}
      <AnimatePresence>
        {modalOpen && (
          <ConfirmRevocationModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            consent={consent}
            onConfirm={handleRevoke}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
