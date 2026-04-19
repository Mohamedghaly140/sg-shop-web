import AdminAnalyticsFeature from "@/features/admin/analytics";

type AdminAnalyticsPageProps = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default function AdminAnalyticsPage({
  searchParams,
}: AdminAnalyticsPageProps) {
  return <AdminAnalyticsFeature searchParams={searchParams} />;
}
