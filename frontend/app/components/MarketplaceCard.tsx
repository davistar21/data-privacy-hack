// src/components/MarketplaceCard.tsx
import React, { useState } from "react";
import { type ReuseOffer } from "../types";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { formatText } from "../utils/formatText";

type Props = {
  offer: ReuseOffer;
  onAccept: () => void;
};

export const MarketplaceCard: React.FC<Props> = ({ offer, onAccept }) => {
  const [open, setOpen] = useState(false);

  const expiresIn = offer.expiresAt
    ? Math.max(
        0,
        Math.round(
          (new Date(offer.expiresAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  return (
    <div className="bg-[color:var(--card)] p-4 rounded-xl shadow-md flex items-start gap-4">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-[color:var(--text)]">
              {offer.orgName}
            </div>
            <div className="text-xs text-[color:var(--muted)] mt-1">
              {offer.summary}
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-medium">{offer.benefit}</div>
            <div className="text-xs text-[color:var(--muted)] flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              <span>
                {expiresIn !== null ? `${expiresIn}d left` : "No expiry"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {offer.fields.map((f) => (
            <Badge key={f} className="bg-accent/40 text-[color:var(--muted)]">
              {formatText(f)}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpen(true)}>Accept</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm acceptance</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-sm">
              <div>
                Grant <b>{offer.orgName}</b> access to:{" "}
                <span className="font-medium">{offer.fields.join(", ")}</span>
              </div>
              <div>
                In exchange you will receive:{" "}
                <span className="font-medium">{offer.benefit}</span>
              </div>
              {/* <div className="text-xs text-[color:var(--muted)]">
                You can undo this action for a short time after confirming.
              </div> */}
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  setOpen(false);
                  onAccept();
                }}
              >
                Confirm & Accept
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          variant="destructive"
          onClick={() => {
            toast.info("We are working on it!");
          }}
        >
          Decline
        </Button>
      </div>
    </div>
  );
};
