import { Bell } from "lucide-react";
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
import { Input } from "../../components/ui/input";
import { SidebarTrigger } from "../ui/sidebar";
import { HeaderNotification } from "../HeaderNotification";

export function Header() {
  return (
    <header
      className="
        h-16 flex items-center justify-between px-6
        bg-[var(--color-card)] text-[var(--color-card-foreground)]
        border-b border-[var(--color-border)]
        sticky left-0 right-0 top-0 z-30 transition-colors duration-300
        backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--color-card)_90%,transparent)]
      "
    >
      {/* Left section — Sidebar toggle + search */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-[var(--color-foreground)]" />
        <Input
          placeholder="Search consents, organizations, etc."
          className="
            bg-[var(--color-input)]
            placeholder:text-[var(--color-muted-foreground)]
            border border-[var(--color-border)]
            focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]
            transition-colors w-64
          "
        />
      </div>
      <img src="/Nova-horizontal.png" alt="" className="h-8 object-contain" />
      {/* Right section — notifications + profile */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        {/* <Button
          variant="ghost"
          size="icon"
          className="relative text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-destructive)] rounded-full" />
        </Button> */}
        <HeaderNotification />
        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer border border-[var(--color-border)] hover:ring-2 hover:ring-[var(--color-ring)] transition-all">
              <AvatarImage src="/avatar.png" alt="User" />
              <AvatarFallback>EY</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-[var(--color-card)] text-[var(--color-card-foreground)] border border-[var(--color-border)] shadow-lg"
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
    </header>
  );
}
