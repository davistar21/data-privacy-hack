// src/components/transparency/TransparencyFilters.tsx
import React, { useMemo } from "react";
import { Input } from "../ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Button } from "../ui/button";
import { useConsentStore } from "../../stores/ConsentStore";
import formatDate from "../../utils/formatDate";

type Props = {
  query: string;
  onQueryChange: (q: string) => void;
  org: string;
  onOrgChange: (o: string) => void;
  range: "24h" | "7d" | "30d";
  onRangeChange: (r: "24h" | "7d" | "30d") => void;
  onExport: () => void;
};

export const TransparencyFilters: React.FC<Props> = ({
  query,
  onQueryChange,
  org,
  onOrgChange,
  range,
  onRangeChange,
  onExport,
}) => {
  const consents = useConsentStore((s) => s.consents);

  const orgOptions = useMemo(() => {
    const unique = Array.from(new Set((consents ?? []).map((c) => c.orgId)));
    return [
      { id: "all", name: "All Orgs" },
      ...unique.map((id) => ({ id, name: id })),
    ];
  }, [consents]);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2 w-full md:w-[60%]">
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search logs (message, org, user)..."
          className="w-full"
        />
      </div>

      <div className="flex items-center gap-2">
        <Select value={org} onValueChange={(v) => onOrgChange(v as string)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Org" />
          </SelectTrigger>
          <SelectContent>
            {orgOptions.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={range} onValueChange={(v) => onRangeChange(v as any)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24h</SelectItem>
            <SelectItem value="7d">7d</SelectItem>
            <SelectItem value="30d">30d</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={onExport}>
          Export
        </Button>
      </div>
    </div>
  );
};

export default TransparencyFilters;
