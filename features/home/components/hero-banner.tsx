import Link from "next/link";

export function HeroBanner() {
  return (
    // pt-28 is consumed by the fixed header; hero fills remaining viewport height
    <section className="relative h-[calc(100vh-7rem)] flex overflow-hidden">
      {/* Editorial text panel */}
      <div className="flex-[3] flex flex-col justify-end pb-20 px-12 lg:px-24 z-10 bg-background">
        <div className="max-w-xl">
          <p
            className="font-sans text-xs tracking-[0.3em] uppercase text-gold mb-8"
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
            <em className="text-gold not-italic">Remarkable.</em>
          </h1>
          <div
            className="flex items-center gap-8"
            style={{ animation: "fadeUp 0.7s ease 0.4s both" }}
          >
            <Link
              href="/products"
              className="font-sans text-xs tracking-[0.2em] uppercase bg-foreground text-background px-8 py-4 hover:bg-gold transition-colors duration-300"
            >
              Shop Now
            </Link>
            <Link
              href="/categories"
              className="font-sans text-xs tracking-[0.2em] uppercase text-foreground border-b border-foreground pb-px hover:text-gold hover:border-gold transition-colors duration-300"
            >
              View Collections
            </Link>
          </div>
        </div>
      </div>

      {/* Right accent panel */}
      <div className="flex-[2] relative overflow-hidden bg-muted">
        <span className="absolute -left-12 top-1/2 -translate-y-1/2 font-heading text-[22rem] leading-none select-none text-muted-foreground/20 pointer-events-none">
          S
        </span>
        <div className="absolute bottom-0 inset-x-0 h-[3px] bg-gold" />
        <p
          className="absolute top-10 right-10 font-sans text-xs tracking-[0.25em] uppercase text-muted-foreground"
          style={{ writingMode: "vertical-rl" }}
        >
          Spring / Summer 2025
        </p>
      </div>
    </section>
  );
}
