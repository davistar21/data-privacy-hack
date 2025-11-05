import React, { useState, useMemo } from "react";
import { useNotificationStore } from "../stores/NotificationStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

const NotificationsPage: React.FC = () => {
  const { getUnreadCount, markAsRead, getPage, notifications } =
    useNotificationStore();

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"date" | "type">("date");
  const [filter, setFilter] = useState<
    "all" | "consent" | "marketplace" | "cookie" | "data-alert"
  >("all");

  const perPage = 10;
  const sortedAndFiltered = useMemo(() => {
    let filtered = [...notifications];
    if (filter !== "all") filtered = filtered.filter((n) => n.type === filter);

    if (sortBy === "date")
      filtered.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    else if (sortBy === "type")
      filtered.sort((a, b) => a.type.localeCompare(b.type));

    return filtered;
  }, [notifications, filter, sortBy]);

  const totalPages = Math.ceil(sortedAndFiltered.length / perPage);
  const paginated = sortedAndFiltered.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <div className="space-y-4">
      <div>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Notifications ({getUnreadCount()} unread)</CardTitle>
            <div className="flex gap-3">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="consent">Consent</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                  <SelectItem value="cookie">Cookie Alerts</SelectItem>
                  <SelectItem value="data-alert">Data Alerts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paginated.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No notifications found.
            </p>
          ) : (
            <ul className="space-y-3">
              {paginated.map((n) => (
                <li
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition hover:bg-[color:var(--card-hover)] ${
                    n.read ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{n.message}</div>
                      <div className="text-xs text-[color:var(--muted)] mt-1">
                        {new Date(n.timestamp).toLocaleString()} — {n.type}
                      </div>
                    </div>
                    {!n.read && (
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-4 gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft />
              </Button>
              <span className="text-sm text-[color:var(--muted)]">
                Page {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight />
              </Button>
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );
};

export default NotificationsPage;
