import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "../ui/drawer";
import { Button } from "../ui/button";
import RecommendedActions from "./RecommendedActions";
import formatDate from "../../utils/formatDate";
import type { AuditLogEntry } from "~/types";

type Props = {
  open: boolean;
  onClose: () => void;
  log?: AuditLogEntry | null;
};

export const TransparencyDetailDrawer: React.FC<Props> = ({
  open,
  onClose,
  log,
}) => {
  return (
    <Drawer
      direction="right"
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Event details</DrawerTitle>
          <DrawerDescription>
            {log ? formatDate(log.timestamp) : ""}
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-4 space-y-4">
          {!log && (
            <div className="text-sm text-[color:var(--muted)]">
              No event selected.
            </div>
          )}

          {log && (
            <>
              <div>
                <div className="text-sm text-[color:var(--muted)]">
                  Organization
                </div>
                <div className="font-medium">{log.orgId}</div>
              </div>

              <div>
                <div className="text-sm text-[color:var(--muted)]">Message</div>
                <div className="font-medium">{log.message}</div>
              </div>

              <div>
                {/* <div className="text-sm text-[color:var(--muted)]">Fields</div>
                <div className="text-xs">{(log as any).fields?.join(", ") ?? "—"}</div> */}
              </div>

              <div>
                <div className="text-sm text-[color:var(--muted)]">Status</div>
                <div className="text-xs">{log.status ?? "—"}</div>
              </div>

              <RecommendedActions category={log.category as any} />
            </>
          )}
        </div>

        <DrawerFooter>
          <Button onClick={onClose}>Close</Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default TransparencyDetailDrawer;
