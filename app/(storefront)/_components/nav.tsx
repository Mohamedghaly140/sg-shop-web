"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LucideSearch,
  LucideHeart,
  LucideShoppingBag,
  LucideUser,
  LucideMenu,
  LucideX,
} from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";

const leftLinks = [
  { label: "Shop", href: "/products" },
  { label: "Collections", href: "/categories" },
  { label: "New In", href: "/products?sort=newest" },
];

type StorefrontNavProps = {
  cartCount: number;
};

export function StorefrontNav({ cartCount }: StorefrontNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Announcement bar — always visible, fixed top-0 */}
      <div className="fixed top-0 inset-x-0 z-40 bg-secondary border-b border-border py-1.5 text-center">
        <p className="font-sans text-[0.6875rem] tracking-[0.15em] uppercase text-gold">
          Free shipping on orders over LE 1,500
        </p>
      </div>

      {/* Main nav — fixed top-8 (sits below announcement bar) */}
      <header
        className={`fixed top-8 inset-x-0 z-50 transition-colors duration-300 ${
          scrolled ? "bg-background border-b border-border" : "bg-transparent"
        }`}
      >
        {/* ── Desktop (md+) ── */}
        <nav
          aria-label="Main"
          className="hidden md:grid max-w-7xl mx-auto px-8 py-5 grid-cols-3 items-center"
        >
          <div className="flex items-center gap-8">
            {leftLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex justify-center">
            <Link
              href="/"
              className="font-heading text-xl tracking-[0.2em] uppercase text-gold hover:opacity-80 transition-opacity"
            >
              SG
            </Link>
          </div>

          <div className="flex items-center justify-end gap-6">
            <Link
              href="/search"
              aria-label="Search"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <LucideSearch size={18} strokeWidth={1.5} />
            </Link>
            <Link
              href="/account/wishlist"
              aria-label="Wishlist"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <LucideHeart size={18} strokeWidth={1.5} />
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative text-muted-foreground hover:text-foreground transition-colors"
            >
              <LucideShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gold text-gold-foreground text-[0.5rem] w-4 h-4 rounded-full flex items-center justify-center font-sans leading-none">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            <Show when="signed-out">
              <Link
                href="/sign-in"
                aria-label="Sign in"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <LucideUser size={18} strokeWidth={1.5} />
              </Link>
            </Show>
            <Show when="signed-in">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "size-[18px]",
                    userButtonTrigger: "focus:shadow-none",
                  },
                }}
              />
            </Show>
          </div>
        </nav>

        {/* ── Mobile bar (< md) ── */}
        <div className="md:hidden flex items-center justify-between px-4 py-4">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="text-foreground"
          >
            <LucideMenu size={20} strokeWidth={1.5} />
          </button>

          <Link
            href="/"
            className="font-heading text-lg tracking-[0.2em] uppercase text-gold"
          >
            SG Couture
          </Link>

          <Link
            href="/cart"
            aria-label="Cart"
            className="relative text-foreground"
          >
            <LucideShoppingBag size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gold text-gold-foreground text-[0.5rem] w-4 h-4 rounded-full flex items-center justify-center font-sans leading-none">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* ── Mobile full-screen overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-60 bg-background flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-border">
            <Link
              href="/"
              className="font-heading text-lg tracking-[0.2em] uppercase text-gold"
              onClick={() => setMobileOpen(false)}
            >
              SG Couture
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="text-foreground"
            >
              <LucideX size={20} strokeWidth={1.5} />
            </button>
          </div>

          <nav className="flex-1 px-6 py-8 flex flex-col">
            {leftLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-heading text-3xl text-foreground py-5 border-b border-border hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <div className="flex gap-8 mt-10">
              {[
                { label: "Search", href: "/search" },
                { label: "Wishlist", href: "/account/wishlist" },
                { label: "Account", href: "/account" },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
