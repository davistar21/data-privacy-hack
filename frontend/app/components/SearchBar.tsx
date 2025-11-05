"use client";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "./ui/input";
import { cn } from "../lib/utils";

export function SearchBar({
  placeholder = "Search...",
  onSearch,
  className,
}: {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        "relative flex items-center w-full max-w-lg py-1.5",
        "bg-white rounded-lg border border-border shadow-sm",
        "hover:shadow-md transition-all duration-300 focus-within:ring-2 focus-within:ring-[var(--color-ring)]",
        className
      )}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Search className="absolute left-3 w-4 h-4 text-[var(--color-muted-foreground)]" />
      <Input
        placeholder={placeholder}
        onChange={(e) => onSearch?.(e.target.value)}
        className="pl-9 pr-3 bg-transparent border-none focus-visible:ring-0 placeholder:text-[var(--color-muted-foreground)]"
      />
    </motion.div>
  );
}
