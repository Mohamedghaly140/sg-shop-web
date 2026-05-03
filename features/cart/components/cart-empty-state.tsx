import Link from "next/link";

export function CartEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-4">
        Your bag is empty
      </h2>
      <p className="font-sans text-sm text-muted-foreground mb-10 max-w-xs">
        Explore the collection and find your next statement piece.
      </p>
      <Link
        href="/products"
        className="font-sans text-[0.6875rem] tracking-[0.2em] uppercase bg-foreground text-background px-10 py-4 hover:bg-gold transition-colors duration-300"
      >
        Start Shopping
      </Link>
    </div>
  );
}
