import AdminCustomerDetailFeature from "@/features/admin/customer-detail";

type AdminCustomerDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCustomerDetailPage({ params }: AdminCustomerDetailPageProps) {
  const { id } = await params;
  return <AdminCustomerDetailFeature id={id} />;
}
