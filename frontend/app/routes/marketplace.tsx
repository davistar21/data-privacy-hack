import React, { useEffect, useMemo, useState } from "react";
import { useMarketplaceStore } from "../stores/MarketPlaceStore";
import { useConsentStore } from "../stores/ConsentStore";
import { MarketplaceCard } from "../components/MarketplaceCard";
import { MarketplacePreview } from "../components/MarketplacePreview";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { toast } from "sonner";
import type { ReuseOffer } from "~/types";

/**
 * MarketplacePage
 * - lists offers with filters
 * - shows "My Benefits" ledger
 */

export const MarketplacePage: React.FC = () => {
  const { offers, benefits, loadOffers, acceptOffer, undoAccept } =
    useMarketplaceStore();
  const [selectedOffer, setSelectedOffer] = useState<ReuseOffer | null>(null);

  const { auditLogs } = useConsentStore();
  // const toast = useToast();

  const [query, setQuery] = useState("");
  const [filterOrg, setFilterOrg] = useState<string>("all");
  const [filterExpiry, setFilterExpiry] = useState<
    "all" | "active" | "expiring"
  >("all");

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const orgOptions = useMemo(() => {
    const unique = Array.from(new Set(offers.map((o) => o.orgId)));
    return [
      { id: "all", name: "All" },
      ...unique.map((id) => ({ id, name: id })),
    ];
  }, [offers]);

  const visibleOffers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return offers
      .filter((o) => (filterOrg === "all" ? true : o.orgId === filterOrg))
      .filter((o) =>
        filterExpiry === "all"
          ? true
          : filterExpiry === "active"
            ? new Date(o.expiresAt ?? "").getTime() > Date.now()
            : new Date(o.expiresAt ?? "").getTime() - Date.now() <
              1000 * 60 * 60 * 24 * 3
      )
      .filter((o) =>
        !q
          ? true
          : (o.orgName ?? o.orgId).toLowerCase().includes(q) ||
            (o.summary ?? "").toLowerCase().includes(q)
      );
  }, [offers, filterOrg, filterExpiry, query]);

  const handleAccept = async (offerId: string) => {
    const res = await acceptOffer(offerId);
    if (res.success && res.requestId) {
      toast.success("Offer accepted. Undo?", {
        action: {
          label: "Undo",
          onClick: async () => {
            await undoAccept(res.requestId!);
            toast.success("Acceptance undone.");
          },
        },
        duration: 7000,
      });
    } else {
      toast.error("Could not accept offer.");
    }
  };

  return (
    <div className="min-h-screen p-2 md:p-6 bg-[color:var(--bg)]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-[color:var(--text)]">
              Consent Marketplace
            </h1>
            <Badge className="text-sm text-[var(--sea-dark-800)] border-[var(--sea-dark-600)] bg-[color:var(--sea-dark-200)] ml-auto">
              {offers.length} offers
            </Badge>
          </div>

          <div className="mb-4 flex gap-3 items-center">
            <Input
              placeholder="Search offers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select value={filterOrg} onValueChange={(v) => setFilterOrg(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All orgs" />
              </SelectTrigger>
              <SelectContent>
                {orgOptions.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterExpiry}
              onValueChange={(v) => setFilterExpiry(v as any)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Expiry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring">Expiring soon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="space-y-4">
            {visibleOffers.map((o) => (
              <MarketplaceCard
                key={o.id}
                offer={o}
                onAccept={() => handleAccept(o.id)}
              />
            ))}

            {visibleOffers.length === 0 && (
              <div className="text-[color:var(--muted)]">
                No offers match your filters.
              </div>
            )}
          </ScrollArea>
        </div>
        <ViewDetailsDialog
          selectedOffer={selectedOffer}
          setSelectedOffer={setSelectedOffer}
          acceptOffer={acceptOffer}
        />
        <aside>
          <div className="bg-[color:var(--card)] p-4 rounded-lg shadow mb-4">
            <h2 className="text-lg font-semibold text-[color:var(--text)]">
              My Benefits
            </h2>
            <div className="mt-3 flex flex-col gap-2">
              {benefits.length === 0 && (
                <div className="text-[color:var(--muted)]">
                  You have no benefits yet.
                </div>
              )}

              {benefits.map((b) => (
                <BenefitCard b={b} />
              ))}
            </div>
          </div>

          <div className="bg-[color:var(--card)] p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-[color:var(--text)]">
              Recent Audit Activity
            </h2>
            <div className="mt-3 text-sm text-[color:var(--muted)]">
              {auditLogs.slice(0, 6).map((a) => (
                <div key={a.id} className="py-1">
                  <div className="text-sm text-[var(--sea-dark-700)]">
                    {a.message}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(a.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* preview block for embedding on Dashboard can reuse MarketplacePreview component */}
      {/* <div className="max-w-6xl mx-auto mt-6">
        <MarketplacePreview
          offers={offers.slice(0, 3)}
          onAccept={(id) => handleAccept(id)}
        />
      </div> */}
    </div>
  );
};

export default MarketplacePage;

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "../components/ui/dialog";
const ViewDetailsDialog = ({
  selectedOffer,
  setSelectedOffer,
  acceptOffer,
}: {
  selectedOffer: ReuseOffer | null;
  setSelectedOffer: (selectedOffer: ReuseOffer | null) => void;
  acceptOffer: (
    offerId: string
  ) => Promise<{ success: boolean; requestId?: string }>;
}) => {
  return (
    <Dialog open={!!selectedOffer} onOpenChange={() => setSelectedOffer(null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Offer Details – {selectedOffer?.orgName}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Review the data and terms before accepting this offer.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-2 text-sm text-[color:var(--text)]">
          <p>
            <strong>Fields Requested:</strong>{" "}
            {selectedOffer?.fields.join(", ")}
          </p>
          <p>
            <strong>Benefit:</strong> {selectedOffer?.benefit}
          </p>
          <p>
            <strong>Expiration:</strong> {selectedOffer?.expiresAt}
          </p>

          <div className="mt-4 border-t border-slate-700/20 pt-3">
            <p className="font-medium mb-1">Legal & NDPR Notice:</p>
            <ul className="list-disc ml-5 space-y-1 text-muted-foreground text-sm">
              <li>Your data will only be reused for the stated purpose.</li>
              <li>You can revoke consent anytime from your dashboard.</li>
              <li>
                Processing complies with NDPR & GDPR transparency principles.
              </li>
              <li>Each reuse will be logged and auditable by regulators.</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setSelectedOffer(null)}>
            Close
          </Button>
          <Button
            onClick={() => {
              acceptOffer(selectedOffer?.id ?? "");
              setSelectedOffer(null);
            }}
          >
            Accept Offer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import { Calendar, CheckCircle, XCircle } from "lucide-react"; // Importing Lucide icons
import { Badge } from "../components/ui/badge";

const BenefitCard = ({
  b,
}: {
  b: { id: string; benefit: string; status: string; expiresAt: string | null };
}) => {
  const statusIcon =
    b.status === "issued" ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  const expiryDate = b.expiresAt
    ? new Date(b.expiresAt).toLocaleDateString()
    : "—";

  return (
    <div
      key={b.id}
      className="p-4 rounded-lg border border-border hover:border-slate-500/10 transition-all"
    >
      <div className="flex items-center space-x-2 mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{b.benefit}</h3>
        {b.status === "issued" ? (
          <Badge className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">
            Active
          </Badge>
        ) : (
          <Badge className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded-full">
            Inactive
          </Badge>
        )}
      </div>

      <div className="text-sm text-gray-500 mb-2 flex items-center space-x-1">
        {statusIcon}
        <span>Status: {b.status}</span>
      </div>

      <div className="text-sm text-gray-500 flex items-center space-x-1">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span>Expires: {expiryDate}</span>
      </div>
    </div>
  );
};
