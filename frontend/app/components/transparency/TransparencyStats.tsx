import React, { useMemo } from "react";
import { useConsentStore } from "../../stores/ConsentStore";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

export const TransparencyStats: React.FC = () => {
  const logs = useConsentStore((s) => s.auditLogs);

  const totals = useMemo(() => {
    const total = logs.length;
    let important = 0;
    let sensitive = 0;
    let failed = 0;
    logs.forEach((l) => {
      if (l.category === "important") important++;
      if (l.category === "sensitive") sensitive++;
      if (l.status === "failed") failed++;
    });
    return { total, important, sensitive, failed };
  }, [logs]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Total Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{totals.total}</div>
          <div className="text-xs text-[color:var(--muted)] mt-1">
            All events
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Important</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{totals.important}</div>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <Badge className="bg-yellow-800/20 text-yellow-200">Review</Badge>
            <span className="text-[color:var(--muted)]">
              Action recommended
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sensitive</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{totals.sensitive}</div>
          <div className="text-xs text-[color:var(--muted)] mt-1">
            Requires caution
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Failed Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-rose-400">
            {totals.failed}
          </div>
          <div className="text-xs text-[color:var(--muted)] mt-1">
            Processing errors
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransparencyStats;
