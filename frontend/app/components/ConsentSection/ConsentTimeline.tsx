import { motion } from "framer-motion";
import { useConsentStore } from "../../stores/ConsentStore";

export const ConsentTimeline = () => {
  const { auditLogs } = useConsentStore();
  const recent = auditLogs
    .filter((a) => a.type.includes("revocation"))
    .slice(-5)
    .reverse();

  if (!recent.length)
    return (
      <p className="text-sm text-muted-foreground">
        No recent consent activities
      </p>
    );

  return (
    <div className="relative pl-4 border-l border-border space-y-3">
      {recent.map((log, i) => (
        <motion.div
          key={log.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="text-sm"
        >
          <div className="absolute -left-2 top-1 w-3 h-3 rounded-full bg-emerald-500"></div>
          <p className="font-medium text-[color:var(--text)]">{log.message}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(log.timestamp).toLocaleString()}
          </p>
        </motion.div>
      ))}
    </div>
  );
};
