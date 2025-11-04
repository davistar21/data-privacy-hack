import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { useWebPrivacyStore } from "../stores/WebPrivacyStore";
import { toast } from "sonner";
import React from "react";
import type { GlobalPreference } from "~/types";

export default function GlobalPreferenceCard() {
  const { globalPreference, setGlobalPreference } = useWebPrivacyStore();

  const handleChange = (pref: GlobalPreference["globalPreference"]) => {
    setGlobalPreference(pref);
    toast.success(`Global cookie preference set to: ${pref.replace("_", " ")}`);
  };

  const options = [
    {
      key: "accept_all",
      label: "Accept all",
      icon: CheckCircle2,
      color:
        "bg-[color:var(--sea-dark-400)] hover:bg-[color:var(--sea-dark-500)]",
    },
    {
      key: "essential_only",
      label: "Essential only",
      icon: ShieldCheck,
      color:
        "bg-[color:var(--sea-dark-300)] hover:bg-[color:var(--sea-dark-400)]",
    },
    {
      key: "reject_all",
      label: "Reject all",
      icon: XCircle,
      color:
        "bg-[color:var(--sea-dark-200)] hover:bg-[color:var(--sea-dark-300)]",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-5 rounded-xl mb-6 border border-[color:var(--sea-dark-400)] 
                 bg-[color:var(--sea-dark-100)]/50 dark:bg-[color:var(--sea-dark-800)]/60 
                 shadow-md backdrop-blur-md"
    >
      <motion.h3
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-lg font-semibold mb-3 text-[color:var(--sea-dark-900)] dark:text-[color:var(--sea-dark-50)]"
      >
        Global Cookie Preference
      </motion.h3>

      <motion.div
        className="flex flex-col sm:flex-row gap-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = globalPreference === opt.key;

          return (
            <motion.button
              key={opt.key}
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                handleChange(opt.key as GlobalPreference["globalPreference"])
              }
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all 
                ${
                  isActive
                    ? `${opt.color} text-white shadow-lg`
                    : "bg-[color:var(--sea-dark-50)]/30 dark:bg-[color:var(--sea-dark-900)]/40 text-[color:var(--sea-dark-700)] dark:text-[color:var(--sea-dark-200)] hover:bg-[color:var(--sea-dark-200)]/40 dark:hover:bg-[color:var(--sea-dark-700)]/60"
                }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive
                    ? "text-white"
                    : "text-[color:var(--sea-dark-600)] dark:text-[color:var(--sea-dark-300)]"
                }`}
              />
              <span>{opt.label}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
