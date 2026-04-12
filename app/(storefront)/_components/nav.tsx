"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Heart, ShoppingBag, User } from "lucide-react";

const leftLinks = [
  { label: "Shop", href: "/products" },
  { label: "Collections", href: "/categories" },
  { label: "New In", href: "/products?sort=newest" },
];

const rightIcons = [
  { icon: Search, label: "Search", href: "/search" },
  { icon: Heart, label: "Wishlist", href: "/account/wishlist" },
  { icon: ShoppingBag, label: "Cart", href: "/cart" },
  { icon: User, label: "Account", href: "/account" },
] as const;

export function StorefrontNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-background border-b border-border text-foreground"
          : "bg-transparent text-foreground"
      }`}
    >
      <nav aria-label="Main" className="max-w-7xl mx-auto px-8 py-6 grid grid-cols-3 items-center">
        {/* Left links */}
        <div className="flex items-center gap-8">
          {leftLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Center logo */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="font-heading text-xl tracking-[0.2em] uppercase text-accent hover:opacity-80 transition-opacity"
          >
            SG Couture
          </Link>
        </div>

        {/* Right icons */}
        <div className="flex items-center justify-end gap-6">
          {rightIcons.map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon size={18} strokeWidth={1.5} />
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
