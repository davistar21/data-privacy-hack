import React from "react";
import { Bell, UserCircle } from "lucide-react";

export const AdminHeader: React.FC<{ title: string }> = ({ title }) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--border)] bg-[color:var(--card)]">
      <h1 className="text-xl font-semibold text-[color:var(--text)]">
        {title}
      </h1>
      <div className="flex items-center gap-4">
        <button className="relative">
          <Bell className="w-5 h-5 text-[color:var(--muted)]" />
          <span className="absolute top-0 right-0 bg-red-500 w-2 h-2 rounded-full" />
        </button>
        <div className="flex items-center gap-2">
          <UserCircle className="w-6 h-6 text-[color:var(--muted)]" />
          <span className="text-sm font-medium text-[color:var(--text)]">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
};
