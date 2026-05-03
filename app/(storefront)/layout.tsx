import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import "./storefront.css";
import { StorefrontNav } from "./_components/nav";
import { StorefrontFooter } from "./_components/footer";
import { getCartCount } from "@/features/cart/services/get-cart";
import { CART_SESSION_COOKIE } from "@/features/cart/constants";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CART_SESSION_COOKIE)?.value ?? null;
  const cartCount = await getCartCount({ userId, sessionToken });

  return (
    <div data-theme="storefront" className="min-h-screen flex flex-col bg-background text-foreground">
      <StorefrontNav cartCount={cartCount} />
      {/* pt-28: 32px announcement bar + ~80px nav height */}
      <main className="flex-1 pt-28">{children}</main>
      <StorefrontFooter />
    </div>
  );
}
