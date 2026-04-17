import AdminOrdersFeature from "@/features/admin/orders";

type AdminOrdersPageProps = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  return <AdminOrdersFeature searchParams={searchParams} />;
}
