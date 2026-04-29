import Link from "next/link";
import Image from "next/image";
import { SectionHeader } from "./SectionHeader";

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
    <section className="py-12 md:py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <SectionHeader title="Shop by Category" href="/products" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group relative bg-muted aspect-[3/4] flex items-end p-8 overflow-hidden"
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
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gold group-hover:w-full transition-all duration-500 ease-out" />
            <div className="relative z-10">
              <p className="font-heading text-2xl text-foreground mb-2">
                {cat.name}
              </p>
              <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground group-hover:text-gold transition-colors duration-300">
                Explore →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
