// src/components/IncidentBanner.tsx
import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router"; // if using React Router

interface IncidentBannerProps {
  incidents?: any[];
  onViewClick?: () => void; // optional callback (if you want to open a drawer instead of redirect)
}

export const IncidentBanner: React.FC<IncidentBannerProps> = ({
  incidents = [],
  onViewClick,
}) => {
  const navigate = useNavigate();

  if (!incidents.length) return null;

  const handleViewClick = () => {
    if (onViewClick) {
      onViewClick();
    } else {
      navigate("/consents"); // default behavior
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg border border-orange-200 bg-gradient-to-r from-orange-500 to-orange-600/80 p-4 text-white shadow-sm mb-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 text-white mt-[2px]" />
          <div>
            <h4 className="font-semibold leading-none">Incident Detected</h4>
            <p className="text-sm text-orange-100 mt-0.5">
              {incidents.length === 1
                ? "One organization that holds your data has reported a data incident."
                : `${incidents.length} organizations have reported data incidents. Review them immediately.`}
            </p>
          </div>
        </div>

        <Button
          onClick={handleViewClick}
          variant="secondary"
          size="sm"
          className="bg-white text-orange-600 hover:bg-orange-50 font-medium"
        >
          View
        </Button>
      </div>
    </motion.div>
  );
};
