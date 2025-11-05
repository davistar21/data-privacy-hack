import React, { useMemo } from "react";
import { useConsentStore } from "../../stores/ConsentStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatText } from "../../utils/formatText";

const COLORS = ["#10B981", "#F59E0B", "#EF4444", "#06B6D4"];

export const ConsentChart: React.FC = () => {
  const consents = useConsentStore((s) => s.consents);

  // Preparing data
  const data = useMemo(() => {
    const map: Record<string, number> = {};
    consents.forEach((c) => {
      map[c.purpose] = (map[c.purpose] || 0) + (c.consentGiven ? 1 : 0);
    });

    return Object.keys(map).map((k, i) => ({
      name: formatText(k, "capitalize"), // Purpose name
      value: map[k], // Number of consents for this purpose
    }));
  }, [consents]);

  if (data.length === 0)
    return <div className="text-[color:var(--muted)]">No consent data</div>;

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#10B981">
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
