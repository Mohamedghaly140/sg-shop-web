import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { CART_SESSION_COOKIE } from "./constants";
import { getCart } from "./services/get-cart";
import { CartLineItem } from "./components/cart-line-item";
import { CartSummary } from "./components/cart-summary";
import { CartEmptyState } from "./components/cart-empty-state";

export default async function CartFeature() {
  const { userId } = await auth();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CART_SESSION_COOKIE)?.value ?? null;

  const cart = await getCart({ userId, sessionToken });

  if (!cart || cart.items.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <CartEmptyState />
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
      <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-10">
        Shopping Bag ({cart.itemCount}{" "}
        {cart.itemCount === 1 ? "item" : "items"})
      </h1>

      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_auto] lg:gap-12 lg:items-start">
        {/* Line items */}
        <div className="divide-y divide-border">
          {cart.items.map((item) => (
            <CartLineItem key={item.id} item={item} cartId={cart.id} />
          ))}
        </div>

        {/* Order summary — stacks below items on mobile, sticky aside on desktop */}
        <CartSummary subtotal={cart.subtotal} itemCount={cart.itemCount} />
      </div>
    </section>
  );
}
