// src/components/CookieSiteCard.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  BarChart3,
  Megaphone,
  Globe2,
  ShieldCheck,
  Undo2,
} from "lucide-react";
import type { CookieSite, CookieCategory } from "../stores/WebPrivacyStore";
import { useWebPrivacyStore } from "../stores/WebPrivacyStore";
import { useConsentStore } from "../stores/ConsentStore";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "../components/ui/drawer";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

const CATEGORY_LABEL: Record<CookieCategory, string> = {
  essential: "Essential",
  analytics: "Analytics",
  marketing: "Marketing",
  third_party: "Third-Party",
};

const CATEGORY_ICON: Record<CookieCategory, React.ReactNode> = {
  essential: <Shield className="w-4 h-4 text-[var(--color-chart-1)]" />,
  analytics: <BarChart3 className="w-4 h-4 text-[var(--color-chart-2)]" />,
  marketing: <Megaphone className="w-4 h-4 text-[var(--color-chart-3)]" />,
  third_party: <Globe2 className="w-4 h-4 text-[var(--color-chart-4)]" />,
};

export default function CookieSiteCard({
  currentSite,
  open,
  onOpenChange,
}: {
  currentSite: CookieSite;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toggleCategory, websites } = useWebPrivacyStore();
  const consentStore = useConsentStore();
  const [confirming, setConfirming] = useState<{
    open: boolean;
    category?: CookieCategory;
  } | null>(null);
  const site = websites.find((w) => w.id === currentSite.id) || currentSite;
  const handleToggle = async (
    category: CookieCategory,
    next: "enabled" | "disabled" | "allow_once"
  ) => {
    if (category === "essential" && next === "disabled") {
      toast.error("Essential cookies cannot be disabled.");
      return;
    }

    if (
      !confirming &&
      (category === "marketing" || category === "third_party") &&
      next === "disabled"
    ) {
      setConfirming({ open: true, category });
      return;
    }

    const res = await toggleCategory(site.id, category, next as any);
    if (res.success && res.requestId) {
      toast.success(`${CATEGORY_LABEL[category]} cookies updated`, {
        action: {
          label: <Undo2 className="w-4 h-4 inline bg-inherit text-inherit" />,
          onClick: async () => {
            const s = useWebPrivacyStore
              .getState()
              .websites.find((w) => w.id === site.id);
            const prev = s?.categories[category] ?? "enabled";
            const revertTo = prev === "allow_once" ? "disabled" : prev;

            await toggleCategory(site.id, category, revertTo as any);
            toast.success("Undo complete");
          },
        },
        duration: 6000,
      });
    } else {
      toast.error("Could not update cookie preference");
    }
  };

  const onConfirmDisable = async () => {
    const confirmedCategory = confirming?.category;
    setConfirming(null);
    await handleToggle(confirmedCategory!, "disabled");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="bg-white text-background border-border p-2 rounded-s-4xl">
        <DrawerHeader>
          <DrawerTitle>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--color-primary)]" />
              {site.name}
            </div>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
              {site.domain}
            </p>
          </DrawerTitle>
          <div className="mt-2 text-xs text-[var(--color-muted-foreground)] flex flex-wrap items-center gap-2">
            <span>Third parties: {site.thirdParties.length}</span> •{" "}
            <span>Reputation: {site.reputation}</span> •{" "}
            <Badge className="bg-[var(--color-muted)] text-[var(--color-card-foreground)] border border-[var(--color-border)]">
              Risk: {site.riskScore}
            </Badge>
          </div>
        </DrawerHeader>

        <motion.div layout className="flex flex-col gap-4">
          {(
            [
              "essential",
              "analytics",
              "marketing",
              "third_party",
            ] as CookieCategory[]
          ).map((cat) => {
            const status = site.categories[cat];
            const colorMap: Record<string, string> = {
              enabled:
                "bg-[var(--color-chart-2)]/20 text-[var(--color-chart-2)] border-[var(--color-chart-2)]/30",
              disabled:
                "bg-[var(--color-destructive)]/10 text-[var(--color-destructive)] border-[var(--color-destructive)]/30",
              allow_once:
                "bg-[var(--color-accent)]/20 text-[var(--color-accent)] border-[var(--color-accent)]/30",
            };

            return (
              <AnimatePresence key={cat}>
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className={`p-4 rounded-lg border shadow-sm hover:shadow-md transition-all bg-[var(--color-background)]  ${colorMap[status]}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {CATEGORY_ICON[cat]}
                      <span className="text-sm font-medium">
                        {CATEGORY_LABEL[cat]}
                      </span>
                    </div>
                    <Badge
                      className={`text-xs px-2 py-1 capitalize bg-transparent border border-[color:inherit] ${colorMap[status]}`}
                    >
                      {status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      size="sm"
                      variant={status === "enabled" ? "default" : "outline"}
                      onClick={() => handleToggle(cat, "enabled")}
                    >
                      Enable
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        status === "disabled" ? "destructive" : "outline"
                      }
                      onClick={() => handleToggle(cat, "disabled")}
                    >
                      Disable
                    </Button>
                    <Button
                      size="sm"
                      variant={status === "allow_once" ? "default" : "outline"}
                      onClick={() => handleToggle(cat, "allow_once")}
                    >
                      Allow Once
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            );
          })}
        </motion.div>

        <DrawerFooter className="justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DrawerFooter>

        {/* Confirm Dialog */}
        <Dialog
          open={!!confirming?.open}
          onOpenChange={() => setConfirming(null)}
        >
          <DialogContent className="bg-[var(--color-card)] text-[var(--color-card-foreground)] border-[var(--color-border)]">
            <DialogHeader>
              <DialogTitle>Confirm Cookie Revocation</DialogTitle>
            </DialogHeader>
            <div className="py-2 text-sm text-[var(--color-muted-foreground)]">
              Disabling marketing or third-party cookies may limit certain
              personalization and embedded content. Continue?
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirming(null)}>
                Cancel
              </Button>
              <Button onClick={onConfirmDisable}>Yes, Revoke</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DrawerContent>
    </Drawer>
  );
}
