"use client";

import { Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/orders": "Orders",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/brands": "Brands",
  "/admin/customers": "Customers",
  "/admin/coupons": "Coupons",
  "/admin/analytics": "Analytics",
  "/admin/settings": "Settings",
  "/admin/users": "Users",
};

function getTitle(pathname: string): string {
  // exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // find longest prefix match
  const match = Object.keys(PAGE_TITLES)
    .filter((k) => k !== "/admin" && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return match ? PAGE_TITLES[match] : "Admin";
}

interface AdminTopbarProps {
  onToggle: () => void;
}

export function AdminTopbar({ onToggle }: AdminTopbarProps) {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <header className="flex h-[52px] flex-shrink-0 items-center justify-between border-b border-[#1f1f1f] bg-[#141414] px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[#6b7280] transition-colors hover:bg-[#1f1f1f] hover:text-[#d1d5db]"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>
        <span className="text-[13px] font-semibold text-[#e5e5e5]">
          {title}
        </span>
      </div>

      <UserButton />
    </header>
  );
}
