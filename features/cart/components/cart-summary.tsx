import Link from "next/link";

type CartSummaryProps = {
  subtotal: string;
  itemCount: number;
};

export function CartSummary({ subtotal, itemCount }: CartSummaryProps) {
  const formattedSubtotal = Number(subtotal).toLocaleString();

  return (
    <div className="lg:w-80 shrink-0 mt-8 lg:mt-0">
      <div className="border border-border p-6 lg:sticky lg:top-32">
        <p className="font-sans text-[0.6875rem] tracking-[0.2em] uppercase text-muted-foreground mb-6">
          Order Summary
        </p>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-baseline">
            <span className="font-sans text-sm text-muted-foreground">
              Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
            </span>
            <span className="font-sans text-sm text-foreground">
              LE {formattedSubtotal}
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="font-sans text-sm text-muted-foreground">Shipping</span>
            <span className="font-sans text-xs text-muted-foreground">
              Calculated at checkout
            </span>
          </div>
        </div>

        <div className="border-t border-border pt-4 mb-6">
          <div className="flex justify-between items-baseline">
            <span className="font-sans text-sm font-medium text-foreground">Total</span>
            <span className="font-sans text-sm font-medium text-foreground">
              LE {formattedSubtotal}
            </span>
          </div>
        </div>

        {/* Coupon code — placeholder, action not wired */}
        <div className="flex items-center border-b border-border mb-6">
          <input
            type="text"
            placeholder="Coupon code"
            className="flex-1 font-sans text-xs py-2 bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            type="button"
            className="font-sans text-[0.6875rem] tracking-[0.15em] uppercase text-foreground pl-4 py-2 hover:text-gold transition-colors"
          >
            Apply
          </button>
        </div>

        <Link
          href="/checkout"
          className="block w-full font-sans text-[0.6875rem] tracking-[0.2em] uppercase bg-foreground text-background text-center py-4 hover:bg-gold transition-colors duration-300"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
