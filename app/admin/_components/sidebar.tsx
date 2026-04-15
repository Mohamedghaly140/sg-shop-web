"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LucideLayoutDashboard,
  LucideClipboardList,
  LucidePackage,
  LucideFolder,
  LucideTag,
  LucideUsers,
  LucideTicket,
  LucideBarChart3,
  LucideSettings,
  LucideShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LucideLayoutDashboard, exact: true },
  { label: "Orders", href: "/admin/orders", icon: LucideClipboardList },
  { label: "Products", href: "/admin/products", icon: LucidePackage },
  { label: "Categories", href: "/admin/categories", icon: LucideFolder },
  { label: "Brands", href: "/admin/brands", icon: LucideTag },
  { label: "Customers", href: "/admin/customers", icon: LucideUsers },
  { label: "Coupons", href: "/admin/coupons", icon: LucideTicket },
  { label: "Analytics", href: "/admin/analytics", icon: LucideBarChart3 },
];

const ADMIN_ONLY_ITEMS = [
  { label: "Settings", href: "/admin/settings", icon: LucideSettings },
  { label: "Users", href: "/admin/users", icon: LucideShieldCheck },
];

interface AdminSidebarProps {
  collapsed: boolean;
  role: "ADMIN" | "MANAGER";
}

export function AdminSidebar({ collapsed, role }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const bottomItems =
    role === "ADMIN" ? ADMIN_ONLY_ITEMS : [];

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-[#1f1f1f] bg-[#0d0d0d] transition-all duration-200",
        collapsed ? "w-[52px]" : "w-[220px]",
      )}
    >
      {/* Logo */}
      <div className="flex h-[52px] flex-shrink-0 items-center border-b border-[#1f1f1f] px-3">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-white">
          <span className="text-[11px] font-black text-black">SG</span>
        </div>
        {!collapsed && (
          <span className="ml-2.5 text-[13px] font-bold text-white">
            SG Admin
          </span>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            active={isActive(item.href, item.exact)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Bottom: admin-only + settings */}
      {bottomItems.length > 0 && (
        <>
          <Separator className="bg-[#1f1f1f]" />
          <div className="flex flex-col gap-0.5 p-2">
            {bottomItems.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                active={isActive(item.href)}
                collapsed={collapsed}
              />
            ))}
          </div>
        </>
      )}
    </aside>
  );
}

interface NavItemProps {
  item: { label: string; href: string; icon: React.ElementType; exact?: boolean };
  active: boolean;
  collapsed: boolean;
}

function NavItem({ item, active, collapsed }: NavItemProps) {
  const Icon = item.icon;

  const inner = (
    <Button
      variant="ghost"
      size="sm"
      asChild
      className={cn(
        "w-full justify-start gap-2.5 text-[13px]",
        active
          ? "bg-[#262626] text-white hover:bg-[#262626] hover:text-white"
          : "text-[#6b7280] hover:bg-[#1a1a1a] hover:text-[#d1d5db]",
        collapsed && "justify-center px-0",
      )}
    >
      <Link href={item.href}>
        <Icon className="h-4 w-4 flex-shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    </Button>
  );

  if (!collapsed) return inner;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{inner}</TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}
