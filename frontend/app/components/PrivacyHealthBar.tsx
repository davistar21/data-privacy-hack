"use client";

import { Info } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";

export default function PrivacyHealthBar({
  score = 98,
  recommendations = [],
}: {
  score: number;
  recommendations: string[];
}) {
  // Color selection based on score
  const getBarColor = () => {
    if (score < 50) return "var(--color-destructive)";
    if (score < 80) return "#d0af0c";
    return "var(--sea-dark-400)";
  };

  return (
    <Card className="mb-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-foreground)]">
              Privacy Health
            </h3>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Your privacy health score is{" "}
              <span className="font-bold text-[var(--color-primary)]">
                {score}%
              </span>
            </p>
          </div>

          {/* Info Dropdown (modern UI) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition"
              >
                <Info size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-lg"
            >
              <DropdownMenuLabel className="text-[var(--color-foreground)]">
                Recommended Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {recommendations.length > 0 ? (
                recommendations.map((rec, i) => (
                  <DropdownMenuItem
                    key={i}
                    className="text-[var(--color-muted-foreground)] leading-snug"
                  >
                    {rec}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem className="text-[var(--color-muted-foreground)] italic">
                  No recommendations at this time.
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Animated Progress Bar */}
        <div className="relative mt-5 h-4 w-full rounded-full overflow-hidden bg-[var(--color-muted)]">
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full shadow-inner"
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              background: getBarColor(),
              boxShadow: `0 0 10px ${getBarColor()}`,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
