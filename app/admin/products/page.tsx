import AdminProductsFeature from "@/features/admin/products";

type AdminProductsPageProps = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  return <AdminProductsFeature searchParams={searchParams} />;
}
