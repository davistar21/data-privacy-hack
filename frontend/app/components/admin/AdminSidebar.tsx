import React from "react";
import { NavLink } from "react-router";
import {
  Shield,
  FileText,
  BarChart2,
  Settings,
  LogOut,
  Cookie,
  Store,
} from "lucide-react";
import { cn } from "../../lib/utils";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: Shield },
  { to: "/admin/consents", label: "Consents", icon: FileText },
  { to: "/admin/requests", label: "Requests", icon: Store },
  { to: "/admin/logs", label: "Audit Logs", icon: BarChart2 },
  { to: "/admin/reports", label: "Reports", icon: FileText },
  { to: "/admin/cookies", label: "Cookies", icon: Cookie },
];

export const AdminSidebar = () => (
  <aside className="w-64 h-screen bg-[color:var(--card)] flex flex-col justify-between shadow-lg">
    <div>
      <div className="p-4 text-xl font-semibold">PrivSync Admin</div>
      <nav className="px-3 space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[color:var(--hover)] transition-colors",
                isActive ? "bg-[color:var(--hover)] font-semibold" : ""
              )
            }
          >
            <Icon className="w-4 h-4" /> {label}
          </NavLink>
        ))}
      </nav>
    </div>

    <div className="border-t border-[color:var(--border)] p-3">
      <NavLink
        to="/admin/settings"
        className="flex items-center gap-3 px-3 py-2 hover:bg-[color:var(--hover)] rounded-md"
      >
        <Settings className="w-4 h-4" /> Settings
      </NavLink>
      <button className="flex items-center gap-3 px-3 py-2 w-full hover:bg-red-500/10 rounded-md text-red-400 mt-1">
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </div>
  </aside>
);
