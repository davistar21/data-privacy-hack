// src/components/IncidentBanner.tsx
import React from "react";
import { motion } from "framer-motion";

export const IncidentBanner: React.FC<{ incidents?: any[] }> = ({
  incidents = [],
}) => {
  if (!incidents.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-orange-600/90 rounded-md p-3 text-white mb-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold">⚠️ Incident detected</div>
          <div className="text-sm">
            One or more organizations that hold your data have reported
            incidents. View details to take action.
          </div>
        </div>
        <div>
          <button className="bg-white/10 text-white px-3 py-1 rounded">
            View
          </button>
        </div>
      </div>
    </motion.div>
  );
};
