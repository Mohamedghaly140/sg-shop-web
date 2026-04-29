import "./storefront.css";
import { StorefrontNav } from "./_components/nav";
import { StorefrontFooter } from "./_components/footer";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-theme="storefront" className="min-h-screen flex flex-col">
      <StorefrontNav cartCount={0} />
      {/* pt-28: 32px announcement bar + ~80px nav height */}
      <main className="flex-1 pt-28">{children}</main>
      <StorefrontFooter />
    </div>
  );
}
