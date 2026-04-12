import Link from "next/link";

const categories = [
  { label: "New Season", href: "/products?sort=newest", shade: "bg-[oklch(0.96_0.012_80)]" },
  { label: "Collections", href: "/categories", shade: "bg-[oklch(0.944_0.006_85)]" },
  { label: "Essentials", href: "/products?tag=essential", shade: "bg-[oklch(0.96_0.004_70)]" },
];

const newArrivals = [
  { id: 1, name: "Silk Drape Blouse", price: "LE 2,400", isNew: true },
  { id: 2, name: "Wide-Leg Trousers", price: "LE 3,200", isNew: false },
  { id: 3, name: "Linen Blazer", price: "LE 4,800", isNew: true },
  { id: 4, name: "Minimal Midi Dress", price: "LE 3,600", isNew: false },
];

export default function HomeFeature() {
  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative h-[calc(100vh-5rem)] flex overflow-hidden">
        {/* Editorial text panel */}
        <div className="flex-[3] flex flex-col justify-end pb-20 px-12 lg:px-24 z-10 bg-background">
          <div className="max-w-xl">
            <p
              className="font-sans text-xs tracking-[0.3em] uppercase text-accent mb-8"
              style={{ animation: "fadeUp 0.7s ease 0.1s both" }}
            >
              SS 2025 Collection
            </p>
            <h1
              className="font-heading text-[clamp(3.5rem,8vw,6.5rem)] leading-[0.88] tracking-tight text-foreground mb-12"
              style={{ animation: "fadeUp 0.7s ease 0.25s both" }}
            >
              Refined.<br />
              Rare.<br />
              <em className="text-accent not-italic">Remarkable.</em>
            </h1>
            <div
              className="flex items-center gap-8"
              style={{ animation: "fadeUp 0.7s ease 0.4s both" }}
            >
              <Link
                href="/products"
                className="font-sans text-xs tracking-[0.2em] uppercase bg-foreground text-background px-8 py-4 hover:bg-accent transition-colors duration-300"
              >
                Shop Now
              </Link>
              <Link
                href="/categories"
                className="font-sans text-xs tracking-[0.2em] uppercase text-foreground border-b border-foreground pb-px hover:text-accent hover:border-accent transition-colors duration-300"
              >
                View Collections
              </Link>
            </div>
          </div>
        </div>

        {/* Right accent panel */}
        <div className="flex-[2] relative overflow-hidden bg-[oklch(0.944_0.006_85)]">
          {/* Giant decorative glyph */}
          <span className="absolute -left-12 top-1/2 -translate-y-1/2 font-heading text-[22rem] leading-none select-none text-[oklch(0.908_0.006_80)] pointer-events-none">
            S
          </span>
          {/* Bottom accent rule */}
          <div className="absolute bottom-0 inset-x-0 h-[3px] bg-accent" />
          {/* Season label */}
          <p
            className="absolute top-10 right-10 font-sans text-xs tracking-[0.25em] uppercase text-muted-foreground"
            style={{ writingMode: "vertical-rl" }}
          >
            Spring / Summer 2025
          </p>
        </div>
      </section>

      {/* ─── Brand statement ──────────────────────────────── */}
      <section className="py-24 px-8 border-y border-border text-center">
        <p className="font-heading text-[clamp(1.8rem,4vw,3.5rem)] text-foreground max-w-4xl mx-auto leading-tight">
          Minimal luxury.{" "}
          <em className="text-accent not-italic">Thoughtfully</em> made.
        </p>
      </section>

      {/* ─── Featured Categories ──────────────────────────── */}
      <section className="py-20 px-8 max-w-7xl mx-auto">
        <div className="flex items-baseline justify-between mb-12">
          <h2 className="font-heading text-3xl">Shop by Category</h2>
          <Link
            href="/categories"
            className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors border-b border-current pb-px"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <Link
              key={cat.href}
              href={cat.href}
              className={`group relative ${cat.shade} aspect-[3/4] flex items-end p-8 overflow-hidden`}
            >
              {/* Decorative index */}
              <span className="absolute top-6 right-8 font-heading text-8xl leading-none select-none text-[oklch(0.908_0.006_80)] group-hover:text-accent/20 transition-colors duration-500">
                0{i + 1}
              </span>
              {/* Hover underline */}
              <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-accent group-hover:w-full transition-all duration-500 ease-out" />
              <div>
                <p className="font-heading text-2xl text-foreground mb-2">
                  {cat.label}
                </p>
                <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground group-hover:text-accent transition-colors duration-300">
                  Explore →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── New Arrivals ─────────────────────────────────── */}
      <section className="py-20 px-8 max-w-7xl mx-auto border-t border-border">
        <div className="flex items-baseline justify-between mb-12">
          <h2 className="font-heading text-3xl">New Arrivals</h2>
          <Link
            href="/products?sort=newest"
            className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors border-b border-current pb-px"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
          {newArrivals.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-4">
                {product.isNew && (
                  <span className="absolute top-4 left-4 z-10 font-sans text-[10px] tracking-[0.2em] uppercase bg-foreground text-background px-2 py-1">
                    New
                  </span>
                )}
                {/* Placeholder brand mark */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-heading text-5xl text-border group-hover:scale-105 transition-transform duration-700 select-none">
                    SG
                  </span>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
              </div>
              <p className="font-sans text-sm font-medium text-foreground tracking-wide mb-1">
                {product.name}
              </p>
              <p className="font-sans text-sm text-muted-foreground">
                {product.price}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Editorial CTA ────────────────────────────────── */}
      <section className="relative overflow-hidden bg-foreground text-background py-32 px-8">
        {/* Background glyph */}
        <span className="absolute inset-0 flex items-center justify-center font-heading text-[22rem] text-white/[0.03] leading-none select-none pointer-events-none">
          SG
        </span>
        {/* Accent top rule */}
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
