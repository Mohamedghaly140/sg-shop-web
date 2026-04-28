import Link from "next/link";
import Image from "next/image";

const SHADES = [
  "bg-[oklch(0.96_0.012_80)]",
  "bg-[oklch(0.944_0.006_85)]",
  "bg-[oklch(0.96_0.004_70)]",
  "bg-[oklch(0.958_0.008_75)]",
  "bg-[oklch(0.952_0.010_82)]",
  "bg-[oklch(0.962_0.006_78)]",
];

type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
};

type CategoryGridProps = {
  categories: Category[];
};

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) return null;

  return (
    <section className="py-20 px-8 max-w-7xl mx-auto">
      <div className="flex items-baseline justify-between mb-12">
        <h2 className="font-heading text-3xl">Shop by Category</h2>
        <Link
          href="/products"
          className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors border-b border-current pb-px"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {categories.map((cat, i) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className={`group relative ${SHADES[i % SHADES.length]} aspect-[3/4] flex items-end p-8 overflow-hidden`}
          >
            {cat.imageUrl && (
              <Image
                src={cat.imageUrl}
                alt={cat.name}
                fill
                className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            )}
            <span className="absolute top-6 right-8 font-heading text-8xl leading-none select-none text-[oklch(0.908_0.006_80)] group-hover:text-accent/20 transition-colors duration-500">
              0{i + 1}
            </span>
            <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-accent group-hover:w-full transition-all duration-500 ease-out" />
            <div className="relative z-10">
              <p className="font-heading text-2xl text-foreground mb-2">
                {cat.name}
              </p>
              <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground group-hover:text-accent transition-colors duration-300">
                Explore →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
