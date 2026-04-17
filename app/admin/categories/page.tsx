import AdminCategoriesFeature from "@/features/admin/categories";

type AdminCategoriesPageProps = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default function AdminCategoriesPage({ searchParams }: AdminCategoriesPageProps) {
  return <AdminCategoriesFeature searchParams={searchParams} />;
}
