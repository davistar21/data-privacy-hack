import {
  LayoutDashboard,
  ShieldCheck,
  FileText,
  ShoppingBag,
  Cookie,
  User,
  Settings,
  LogOut,
} from "lucide-react";

export const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Consents", href: "/consents", icon: ShieldCheck },
  { name: "Transparency Logs", href: "/transparency", icon: FileText },
  { name: "Marketplace", href: "/market", icon: ShoppingBag },
  { name: "Web Privacy", href: "/cookies", icon: Cookie },
];

export const bottomNavItems = [
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Logout", href: "/logout", icon: LogOut },
];
