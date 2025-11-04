import React from "react";
import { motion } from "framer-motion";
import type { OrgAuditEvent } from "../types";
import { Badge } from "../components/ui/badge";
import { ShieldCheck, AlertTriangle, FileText, User } from "lucide-react";

/**
 * OrgLogItem
 * - visually represents an org-level audit event
 * - accessible (role=listitem), keyboard focusable
 */

export const OrgLogItem: React.FC<{ ev: OrgAuditEvent }> = ({ ev }) => {
  const time = new Date(ev.timestamp).toLocaleString();

  const statusBadge = () => {
    if (ev.status === "completed")
      return (
        <Badge className="bg-green-800/30 text-green-200">completed</Badge>
      );
    if (ev.status === "failed")
      return <Badge className="bg-red-800/20 text-red-300">failed</Badge>;
    return <Badge className="bg-yellow-800/20 text-yellow-300">pending</Badge>;
  };

  const typeIcon = () => {
    if (ev.type === "audit")
      return <ShieldCheck className="w-5 h-5 text-blue-300" />;
    if (ev.type === "revocation")
      return <AlertTriangle className="w-5 h-5 text-yellow-300" />;
    if (ev.type === "incident")
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
    return <FileText className="w-5 h-5 text-slate-300" />;
  };

  const highlightClass =
    ev.type === "incident" || (ev as any).isNotification
      ? "ring-2 ring-yellow-700/20"
      : "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3 rounded-lg bg-[color:var(--card)] shadow-sm border border-transparent hover:border-slate-500/10 ${highlightClass}`}
      role="listitem"
      tabIndex={0}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">{typeIcon()}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-[color:var(--text)] truncate">
              {ev.message}
            </div>

            <div className="flex flex-col items-end gap-1">
              <div>{statusBadge()}</div>
              <div className="text-xs text-[color:var(--muted)]">{time}</div>
            </div>
          </div>

          <div className="mt-2 text-xs text-[color:var(--muted)] flex flex-wrap gap-3">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{ev.userName ?? ev.userId ?? "—"}</span>
            </div>

            {ev.fields && ev.fields.length > 0 && (
              <div>
                <span className="font-medium">Fields:</span>
                <span className="ml-1">{ev.fields.join(", ")}</span>
              </div>
            )}

            <div className="ml-auto text-xs text-[color:var(--muted)]">
              {ev.orgId}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
