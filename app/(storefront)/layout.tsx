import { StorefrontNav } from "./_components/nav";
import { StorefrontFooter } from "./_components/footer";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-theme="storefront" className="min-h-screen flex flex-col">
      <StorefrontNav />
      <main className="flex-1 pt-20">{children}</main>
      <StorefrontFooter />
    </div>
  );
}
