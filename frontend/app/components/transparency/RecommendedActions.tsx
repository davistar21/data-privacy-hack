import React from "react";
import { Button } from "../ui/button";
import { sendMessage } from "../../components/Chatbot"; // Ensure sendMessage is properly imported

type Props = {
  category: "important" | "sensitive" | "normal" | undefined;
  log?: any; // log passed as prop
  onTakeAction?: (actionId: string) => void;
};

export const RecommendedActions: React.FC<Props> = ({
  category,
  log,
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

  // Function to handle sending a message to the chatbot
  const handleAction = async (actionId: string) => {
    if (!log) return;

    const actionDetails = list.find((a) => a.id === actionId);
    if (!actionDetails) return;

    // Create a query/message to send to Nina based on the selected action and log info
    const logDetails = `Request for Assistance || Action: ${actionDetails.label}, Log Message: ${log.message}, Organization: ${log.orgId}, Status: ${log.status ?? "N/A"}`;

    // Send this message to Nina chatbot
    await sendMessage(logDetails);

    // Optionally trigger the onTakeAction callback if needed (like triggering any additional actions)
    onTakeAction?.(actionId);
  };

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
            onClick={() => handleAction(a.id)} // Call handleAction with selected action
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
