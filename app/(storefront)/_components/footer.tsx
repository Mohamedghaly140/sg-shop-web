import Link from "next/link";
import { CopyrightYear } from "./copyright-year";

const shopLinks = [
  { label: "All Products", href: "/products" },
  { label: "Collections", href: "/categories" },
  { label: "New In", href: "/products?sort=newest" },
  { label: "Sale", href: "/products?sale=true" },
];

const accountLinks = [
  { label: "My Account", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Wishlist", href: "/account/wishlist" },
  { label: "Addresses", href: "/account/addresses" },
];

export function StorefrontFooter() {
  return (
    <footer className="bg-muted mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <p className="font-heading text-xl tracking-[0.2em] uppercase">
              SG Couture
            </p>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              Minimal luxury. Thoughtfully made.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <p className="font-sans text-xs tracking-[0.15em] uppercase">
              Shop
            </p>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <p className="font-sans text-xs tracking-[0.15em] uppercase">
              Account
            </p>
            <ul className="space-y-3">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <p className="font-sans text-xs tracking-[0.15em] uppercase">
              Stay in Touch
            </p>
            <p className="font-sans text-sm text-muted-foreground">
              New arrivals, early access, and nothing else.
            </p>
            {/* TODO: wire up newsletter Server Action */}
            <form className="flex gap-0 border-b border-foreground">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-transparent font-sans text-sm py-2 text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="submit"
                className="font-sans text-xs tracking-widest uppercase py-2 px-4 hover:text-accent transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <p className="font-sans text-xs text-muted-foreground">
            © <CopyrightYear /> SG Couture. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
