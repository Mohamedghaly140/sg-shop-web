import AdminProductDetailFeature from "@/features/admin/product-detail";

type AdminProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminProductDetailPage({
  params,
}: AdminProductDetailPageProps) {
  const { id } = await params;
  return <AdminProductDetailFeature productId={id} />;
}
