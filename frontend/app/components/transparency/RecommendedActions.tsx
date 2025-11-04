import React from "react";
import { Button } from "../ui/button";

type Props = {
  category: "important" | "sensitive" | "normal" | undefined;
  onTakeAction?: (actionId: string) => void;
};

export const RecommendedActions: React.FC<Props> = ({
  category,
  onTakeAction,
}) => {
  if (!category || category === "normal") return null;

  const importantActions = [
    { id: "review-audit", label: "Review audit details" },
    {
      id: "contact-org",
      label: "Contact organisation (request justification)",
    },
    { id: "file-complaint", label: "File NDPR complaint (guide)" },
  ];

  const sensitiveActions = [
    { id: "view-data", label: "View data shared" },
    { id: "revoke-access", label: "Revoke access & notify org" },
    { id: "seek-legal", label: "View recommended legal references" },
  ];

  const list = category === "important" ? importantActions : sensitiveActions;

  return (
    <div className="bg-[color:var(--card)] p-3 rounded-md border border-slate-700/20">
      <div className="text-sm font-semibold mb-2">
        Recommended actions (
        {category === "important" ? "Important" : "Sensitive"})
      </div>
      <div className="flex flex-wrap gap-2">
        {list.map((a) => (
          <Button
            key={a.id}
            size="sm"
            variant="outline"
            onClick={() => onTakeAction?.(a.id)}
          >
            {a.label}
          </Button>
        ))}
      </div>
      <div className="text-xs text-[color:var(--muted)] mt-2">
        Suggestions are aligned with NDPR guidance — include justification
        requests, data minimisation checks, and retention queries.
      </div>
    </div>
  );
};

export default RecommendedActions;
