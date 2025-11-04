import { OrgCard } from "./OrgCard";
import { motion } from "framer-motion";
import type { Consent } from "~/types";

export const ConsentList = ({ consents }: { consents: Consent[] }) => {
  if (consents.length === 0)
    return (
      <div className="text-center text-muted text-sm py-10">
        No consents match your filter
      </div>
    );

  return (
    <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {consents.map((c) => (
        <OrgCard key={c.id} consent={c} />
      ))}
    </motion.div>
  );
};
