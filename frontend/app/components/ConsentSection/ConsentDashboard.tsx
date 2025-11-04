import { useState, useMemo } from "react";
import { ConsentFilters } from "./ConsentFilters";
import { ConsentChart } from "./ConsentChart";
import { ConsentList } from "./ConsentList";
import { useConsentStore } from "../../stores/ConsentStore";
import { Input } from "../../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { motion } from "framer-motion";

export const ConsentDashboard = ({
  mode = "full",
}: {
  mode?: "preview" | "full";
}) => {
  const consents = useConsentStore((s) => s.consents);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredConsents = useMemo(() => {
    let list = [...consents];
    if (filter === "important") list = list.filter((c) => c);
    if (filter === "recent7d")
      list = list.filter(
        (c) => Date.now() - new Date(c.givenAt).getTime() <= 7 * 86400000
      );
    if (filter === "recent24h")
      list = list.filter(
        (c) => Date.now() - new Date(c.givenAt).getTime() <= 86400000
      );
    if (search)
      list = list.filter(
        (c) =>
          c.orgId.toLowerCase().includes(search.toLowerCase()) ||
          c.purpose.toLowerCase().includes(search.toLowerCase())
      );
    return list;
  }, [filter, search, consents]);

  return (
    <motion.div
      layout
      className="space-y-6 bg-[color:var(--background)] rounded-xl p-6 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <Input
          placeholder="Search organization or purpose..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:w-1/3"
        />
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="important">Important</TabsTrigger>
            <TabsTrigger value="recent7d">Last 7 Days</TabsTrigger>
            <TabsTrigger value="recent24h">Last 24h</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {mode === "full" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[color:var(--card)] p-4 rounded-lg shadow">
            <ConsentChart />
          </div>
          <ConsentFilters setFilter={setFilter} />
        </div>
      )}

      <ConsentList consents={filteredConsents} />
    </motion.div>
  );
};
