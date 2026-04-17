import AdminBrandsFeature from "@/features/admin/brands";

type AdminBrandsPageProps = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default function AdminBrandsPage({ searchParams }: AdminBrandsPageProps) {
  return <AdminBrandsFeature searchParams={searchParams} />;
}
