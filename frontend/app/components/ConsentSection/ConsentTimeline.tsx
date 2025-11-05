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
    <div className="relative pl-6 border-l border-gray-300 dark:border-gray-700 space-y-4">
      {recent.map((log, i) => (
        <motion.div
          key={log.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="relative text-sm"
        >
          {/* Timeline Dot */}
          <div className="absolute -left-2 top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-lg"></div>

          {/* Event Details */}
          <div className="pl-8">
            <p className="font-medium text-gray-800 dark:text-white">
              {log.message}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(log.timestamp).toLocaleString()}
            </p>
          </div>

          {/* Hover effect for more interactivity */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-1 p-1 bg-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            {/* More Info Icon, replace with your icon library */}
            <span className="text-gray-600 dark:text-white">ⓘ</span>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};
