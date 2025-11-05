import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  ShieldCheck,
  Cookie,
  AlertTriangle,
  X,
  Info,
} from "lucide-react";
import type { JSX } from "react";

export function RecentCookieEvents({ cookieLogs }: { cookieLogs: any[] }) {
  // Map event type -> icon
  const eventIcons: Record<string, JSX.Element> = {
    cookie_revoked: <X className="w-4 h-4 text-red-400" />,
    cookie_enabled: <ShieldCheck className="w-4 h-4 text-green-400" />,
    cookie_allowed_once: <Info className="w-4 h-4 text-amber-400" />,
    cookie_added: <Cookie className="w-4 h-4 text-amber-400" />,
    warning: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
  };

  const recents = cookieLogs.slice(0, 6);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="bg-[color:var(--bg)] p-4 rounded-lg shadow-sm border border-slate-800/20"
    >
      <div className="flex items-center gap-2 mb-3">
        <Cookie className="w-4 h-4 text-amber-400" />
        <h4 className="text-md font-semibold text-[color:var(--text)]">
          Recent cookie events
        </h4>
      </div>

      <motion.div
        layout
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-2 text-sm text-[color:var(--muted)]"
      >
        <AnimatePresence>
          {recents.length > 0 ? (
            recents.map((a) => (
              <motion.div
                key={a.id}
                layout
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="flex items-start gap-2 py-2 px-2 rounded-md border border-transparent hover:border-slate-700/30 hover:bg-slate-800/20 transition-all"
              >
                <div className="mt-[2px] shrink-0">
                  {eventIcons[a.type] || (
                    <Cookie className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-[color:var(--text)]">
                    {a.message}
                  </div>
                  <div className="text-xs text-[color:var(--muted)] mt-0.5">
                    {new Date(a.timestamp).toLocaleString()}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              key="empty"
              layout
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.25 }}
              className="text-[color:var(--muted)] italic text-center py-3"
            >
              No cookie events yet.
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
