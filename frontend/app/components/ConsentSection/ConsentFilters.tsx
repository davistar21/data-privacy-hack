import { Button } from "../../components/ui/button";
import { Filter } from "lucide-react";

export const ConsentFilters = ({
  setFilter,
}: {
  setFilter: (f: string) => void;
}) => (
  <div className="bg-[color:var(--card)] rounded-lg p-4 shadow flex flex-wrap gap-3">
    <Button variant="outline" onClick={() => setFilter("all")}>
      <Filter className="w-4 h-4 mr-2" /> All
    </Button>
    <Button variant="outline" onClick={() => setFilter("important")}>
      Important
    </Button>
    <Button variant="outline" onClick={() => setFilter("recent7d")}>
      7d
    </Button>
    <Button variant="outline" onClick={() => setFilter("recent24h")}>
      24h
    </Button>
  </div>
);
