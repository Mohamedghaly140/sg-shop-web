import AdminOrderDetailFeature from "@/features/admin/order-detail";

type AdminOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;
  return <AdminOrderDetailFeature id={id} />;
}
