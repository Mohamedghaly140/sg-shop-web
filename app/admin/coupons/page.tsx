import AdminCouponsFeature from "@/features/admin/coupons";

type AdminCouponsPageProps = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default function AdminCouponsPage({ searchParams }: AdminCouponsPageProps) {
  return <AdminCouponsFeature searchParams={searchParams} />;
}
