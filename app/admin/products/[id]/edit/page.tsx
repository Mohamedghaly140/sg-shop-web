import AdminProductFormFeature from "@/features/admin/product-form";

type AdminEditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditProductPage({
  params,
}: AdminEditProductPageProps) {
  const { id } = await params;
  return <AdminProductFormFeature mode="edit" productId={id} />;
}
