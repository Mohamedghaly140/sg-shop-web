import Link from "next/link";
import { HeroBanner } from "./components/HeroBanner";
import { CategoryGrid } from "./components/CategoryGrid";
import { FeaturedProducts } from "./components/FeaturedProducts";
import { getFeaturedProducts, getHomeCategories } from "./services/get-home-data";

export default async function HomeFeature() {
  const [categories, featuredProducts] = await Promise.all([
    getHomeCategories(),
    getFeaturedProducts(),
  ]);

  return (
    <>
      <HeroBanner />

      {/* ─── Brand statement ──────────────────────────────── */}
      <section className="py-24 px-8 border-y border-border text-center">
        <p className="font-heading text-[clamp(1.8rem,4vw,3.5rem)] text-foreground max-w-4xl mx-auto leading-tight">
          Minimal luxury.{" "}
          <em className="text-accent not-italic">Thoughtfully</em> made.
        </p>
      </section>

      <CategoryGrid categories={categories} />

      <FeaturedProducts products={featuredProducts} />

      {/* ─── Editorial CTA ────────────────────────────────── */}
      <section className="relative overflow-hidden bg-foreground text-background py-32 px-8">
        <span className="absolute inset-0 flex items-center justify-center font-heading text-[22rem] text-white/[0.03] leading-none select-none pointer-events-none">
          SG
        </span>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-accent" />
        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-accent">
            Exclusive Access
          </p>
          <h2 className="font-heading text-[clamp(2.5rem,6vw,5rem)] leading-tight">
            Discover Your<br />Next Statement
          </h2>
          <p className="font-sans text-sm text-white/50 leading-relaxed max-w-sm mx-auto">
            Every piece is a quiet declaration. Crafted with intention,
            worn with confidence.
          </p>
          <Link
            href="/products"
            className="inline-block font-sans text-xs tracking-[0.2em] uppercase border border-white/40 text-background px-10 py-4 hover:border-accent hover:text-accent transition-colors duration-300"
          >
            Shop the Collection
          </Link>
        </div>
      </section>
    </>
  );
}
