import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import formatDate from "../../utils/formatDate";
import type { AuditLogEntry } from "~/types";
import { useConsentStore } from "../../stores/ConsentStore";

type Props = {
  logs: AuditLogEntry[];
  onOpen: (l: AuditLogEntry) => void;
  pageSizeOptions?: number[];
};

export const TransparencyTable: React.FC<Props> = ({
  logs,
  onOpen,
  pageSizeOptions = [10, 25, 50],
}) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...logs].sort((a, b) => {
      const ta = +new Date(a.timestamp);
      const tb = +new Date(b.timestamp);
      return sortDir === "desc" ? tb - ta : ta - tb;
    });
  }, [logs, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const page = useMemo(() => {
    const start = pageIndex * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pageIndex, pageSize]);

  const toggleSort = () => setSortDir((s) => (s === "desc" ? "asc" : "desc"));

  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Org</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {page.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="p-6 text-center text-sm text-[color:var(--muted)]"
                >
                  No events
                </TableCell>
              </TableRow>
            ) : (
              page.map((l) => (
                <TableRow
                  key={l.id}
                  className="cursor-pointer hover:bg-muted/5"
                  onClick={() => onOpen(l)}
                >
                  <TableCell>
                    <div className="text-sm font-medium">
                      {formatDate(l.timestamp)}
                    </div>
                    <div className="text-xs text-[color:var(--muted)]">
                      {l.userId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{l.orgId}</div>
                    <div className="text-xs text-[color:var(--muted)]">
                      {/*l.fields ||*/ ["placeholder-1", "placeholder-2"]
                        .slice(0, 3)
                        .join(", ")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{l.type}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`px-2 ${l.status === "completed" ? "bg-green-800/20 text-green-200" : l.status === "failed" ? "bg-red-800/20 text-red-300" : "bg-yellow-800/20 text-yellow-300"}`}
                    >
                      {l.status ?? "unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">{l.category ?? "—"}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen(l);
                        }}
                      >
                        Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      <div className="mt-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
          Showing {pageIndex * pageSize + 1} -{" "}
          {Math.min((pageIndex + 1) * pageSize, sorted.length)} of{" "}
          {sorted.length}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(0)}
            disabled={pageIndex === 0}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
            disabled={pageIndex === 0}
          >
            Prev
          </Button>

          <div className="text-sm px-2">
            Page {pageIndex + 1} / {pageCount}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(Math.min(pageCount - 1, pageIndex + 1))}
            disabled={pageIndex >= pageCount - 1}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(pageCount - 1)}
            disabled={pageIndex >= pageCount - 1}
          >
            Last
          </Button>

          <select
            aria-label="Rows per page"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPageIndex(0);
            }}
            className="ml-2 rounded border px-2 py-1 text-sm"
          >
            {pageSizeOptions.map((s) => (
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSort}
            className="ml-2"
          >
            Sort: {sortDir === "desc" ? "Newest" : "Oldest"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransparencyTable;
