import AdminCustomersFeature from "@/features/admin/customers";

type AdminCustomersPageProps = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default function AdminCustomersPage({ searchParams }: AdminCustomersPageProps) {
  return <AdminCustomersFeature searchParams={searchParams} />;
}
