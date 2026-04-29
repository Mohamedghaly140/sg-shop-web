import ProductsFeature from "@/features/products";

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return <ProductsFeature searchParams={searchParams} />;
}
