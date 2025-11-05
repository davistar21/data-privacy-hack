import { Bell, ShoppingBag, Brain, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { SearchBar } from "../../components/SearchBar";
import { Button } from "../../components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { SidebarTrigger } from "../ui/sidebar";
import { HeaderNotification } from "../HeaderNotification";
import { useEffect, useState } from "react";

export function Header({ isAdmin = false }: { isAdmin?: boolean }) {
  const [isSticky, setIsSticky] = useState(false);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 10); // Toggle sticky class when scrolled past 100px
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <div className="relative">
      <motion.header
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={`${isSticky ? "fixed md:top-3 max-md:left-1/2 max-md:-translate-x-1/2 " : "absolute top-3 left-1/2 -translate-x-1/2"} w-[95%] max-w-6xl h-14 flex items-center justify-between gap-4 rounded-xl border border-[var(--color-foreground)]/40 bg-[var(--color-card)]/80 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.05)] px-4 md:px-6 z-11`}
      >
        {!isAdmin && (
          <SidebarTrigger className="text-s=econdary-foreground" size="lg" />
        )}

        <img
          src="/Nova-logo.png"
          alt="Nova"
          className="h-6 md:h-7 w-auto object-contain"
        />

        {/* --- Center Section: Search bar (hidden on small screens) --- */}
        <div className="flex flex-1 justify-center">
          <div className="w-full max-w-md">
            <SearchBar placeholder="Search consents, organizations, etc." />
          </div>
        </div>

        {/* --- Right Section: Actions --- */}
        {!isAdmin && (
          <div className="flex items-center gap-2 sm:gap-3">
            <HeaderNotification />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer border border-[var(--color-border)] hover:ring-2 hover:ring-[var(--color-ring)] transition-all">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback>EY</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[var(--color-card)] text-[var(--color-card-foreground)] border border-[var(--color-border)] shadow-xl rounded-lg"
              >
                <DropdownMenuItem asChild>
                  <a href="/profile">Profile</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/settings">Settings</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/logout" className="text-[var(--color-destructive)]">
                    Logout
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </motion.header>
    </div>
  );
}
