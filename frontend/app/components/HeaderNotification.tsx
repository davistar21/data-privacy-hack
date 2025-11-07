import React, { useEffect, useState } from "react";
import { Bell, Check, CheckCircle, Circle } from "lucide-react";
import { useNotificationStore } from "../stores/NotificationStore";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

export const HeaderNotification: React.FC = () => {
  const navigate = useNavigate();
  const {
    fetchNotifications,
    latest,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);
  const unread = getUnreadCount();
  const latestItems = latest();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-1 rounded-full hover:bg-[color:var(--sea-dark-100)] dark:hover:bg-[color:var(--sea-dark-700)] transition-colors">
          <Bell className="w-6 h-6 text-[color:var(--text)]" />
          {hydrated && unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 bg-gray-100 shadow-lg border border-[color:var(--color-border)] rounded-lg p-1"
      >
        <DropdownMenuLabel className="flex justify-between items-center mb-1">
          <span className="font-semibold text-sm">Notifications</span>
          {unread > 0 && (
            <button
              className="text-xs text-[color:var(--color-primary)] hover:underline"
              onClick={() => markAllAsRead()}
            >
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-96 overflow-y-auto scrollbar">
          {latestItems.length === 0 ? (
            <DropdownMenuItem className="text-center text-[color:var(--color-muted-foreground)]">
              No new notifications
            </DropdownMenuItem>
          ) : (
            <AnimatePresence>
              {latestItems.map((n, idx) => {
                const isUnread =
                  getUnreadCount() && n.id && n.id in latestItems;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.08 }}
                  >
                    <DropdownMenuItem
                      className={`flex items-start gap-2 rounded-md py-2 px-2 cursor-pointer hover:bg-[color:var(--sea-dark-50)] dark:hover:bg-[color:var(--sea-dark-700)] transition-colors ${
                        isUnread
                          ? "bg-[color:var(--sea-dark-100)] dark:bg-[color:var(--sea-dark-800)] font-semibold"
                          : "bg-transparent dark:bg-transparent text-[color:var(--color-muted-foreground)]"
                      }`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <span className="mt-0.5">
                        {isUnread ? (
                          <Circle className="w-3 h-3 text-[color:var(--color-primary)]" />
                        ) : (
                          <CheckCircle className="w-3 h-3 text-[color:var(--color-muted-foreground)]" />
                        )}
                      </span>
                      <div className="flex-1">
                        <div
                          className={`text-sm ${
                            isUnread
                              ? "text-[color:var(--color-foreground)]"
                              : "text-[color:var(--color-muted-foreground)]"
                          }`}
                        >
                          {n.message}
                        </div>
                        <div className="text-xs text-[color:var(--color-muted-foreground)] mt-0.5">
                          {new Date(n.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Button
            className="w-full"
            variant="outline"
            size="sm"
            onClick={() => navigate("/notifications")}
          >
            View All
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
