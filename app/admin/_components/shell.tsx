"use client";

import { useState } from "react";
import { AdminSidebar } from "./sidebar";
import { AdminTopbar } from "./topbar";

interface AdminShellProps {
  children: React.ReactNode;
  defaultCollapsed: boolean;
  role: "ADMIN" | "MANAGER";
}

export function AdminShell({ children, defaultCollapsed, role }: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `admin_sidebar_collapsed=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }

  return (
    <div className="flex h-screen bg-[#141414]">
      <AdminSidebar collapsed={collapsed} role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar onToggle={toggle} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
