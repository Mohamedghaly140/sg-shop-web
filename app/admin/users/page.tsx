import AdminUsersFeature from "@/features/admin/users";

type AdminUsersPageProps = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  return <AdminUsersFeature searchParams={searchParams} />;
}
