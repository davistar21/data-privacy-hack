import { motion } from "framer-motion";
import { toast } from "sonner";
import { useWebPrivacyStore } from "../stores/WebPrivacyStore";
import CookieSiteCard from "./CookieSiteCard";
import GlobalPreferenceCard from "./GlobalPreferenceCard";

export default function WebPrivacyCompanion() {
  const { websites } = useWebPrivacyStore();

  return (
    <motion.section
      className="p-6 rounded-2xl bg-sea-blue-900/20 dark:bg-white/5 shadow-lg mt-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-slate-100 dark:text-slate-800">
        Web Privacy Companion
      </h2>

      <GlobalPreferenceCard />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {websites.map((site) => (
          <CookieSiteCard key={site.id} site={site} />
        ))}
      </div>

      <p className="text-sm text-gray-400 mt-6">
        Future versions of CPA will automatically apply your cookie preferences
        across Nigerian websites via the CPA Browser Companion.
      </p>
    </motion.section>
  );
}
