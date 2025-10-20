// src/components/ConsentChart.tsx
import React, { useMemo } from "react";
import { useConsentStore } from "../stores/ConsentStore";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#10B981", "#F59E0B", "#EF4444", "#06B6D4"];

export const ConsentChart: React.FC = () => {
  const consents = useConsentStore((s) => s.consents);
  const data = useMemo(() => {
    const map: Record<string, number> = {};
    consents.forEach((c) => {
      map[c.purpose] = (map[c.purpose] || 0) + (c.consentGiven ? 1 : 0);
    });
    return Object.keys(map).map((k, i) => ({ name: k, value: map[k] }));
  }, [consents]);

  if (data.length === 0)
    return <div className="text-[color:var(--muted)]">No consent data</div>;

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={32}
            outerRadius={56}
            paddingAngle={3}
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 text-xs text-[color:var(--muted)]">
        Consent distribution
      </div>
    </div>
  );
};
