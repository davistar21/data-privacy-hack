import React from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { type ReuseOffer } from "../types";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { formatText } from "../utils/formatText";

export const MarketplacePreview: React.FC<{
  offers: ReuseOffer[];
  onAccept: (id: string) => void;
}> = ({ offers, onAccept }) => {
  return (
    <Card className="bg-[color:var(--card)]/90 backdrop-blur-md border border-slate-800/30 shadow-md hover:shadow-lg transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[color:var(--primary)]" />
          <CardTitle className="text-[color:var(--text)] text-sm font-semibold">
            Top Marketplace Offers
          </CardTitle>
        </div>
        <a
          href="/market"
          className="flex gap-1 items-center text-sm text-[color:var(--muted)] hover:text-[color:var(--primary)] transition-colors"
        >
          View all <ArrowUpRight size={16} />
        </a>
      </CardHeader>

      <CardContent className="pt-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {offers.slice(0, 3).map((o, idx) => (
          <motion.div
            key={o.id}
            layout
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="bg-[color:var(--card-foreground)]/5 border border-slate-800/20 hover:border-[color:var(--primary)]/30 rounded-xl p-4 flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="text-sm font-semibold text-[color:var(--text)]">
                {o.orgName}
              </div>
              <div className="text-xs text-[color:var(--muted)] mt-1 line-clamp-2">
                {o.benefit}
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 gap-2">
              <div className="flex gap-2 items-center text-xs text-muted-foreground">
                {o.fields.map((field, index) => (
                  <span
                    key={index}
                    className="bg-card border border-border py-1 px-2 rounded-full"
                  >
                    {formatText(field)}
                  </span>
                ))}
              </div>
              <Button
                size="sm"
                className="text-xs font-medium"
                onClick={() => onAccept(o.id)}
              >
                Accept
              </Button>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};
