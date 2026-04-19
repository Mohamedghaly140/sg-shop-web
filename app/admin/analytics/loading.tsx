"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";

// ─── Shared building blocks ───────────────────────────────────────────────────

function KpiCards({ count }: { count: number }) {
  return (
    <div
      className={`grid grid-cols-2 gap-4 ${
        count === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
      }`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-4 rounded" />
          </div>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

function ChartCard({ height = 250 }: { height?: number }) {
  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <div className="space-y-1">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <Skeleton className="w-full rounded-md" style={{ height }} />
    </div>
  );
}

function TableCard({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="p-6">
        <Skeleton className="h-5 w-36" />
      </div>
      <div className="px-6 space-y-3 pb-6">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

// ─── Per-tab skeletons ────────────────────────────────────────────────────────

function SalesSkeleton() {
  return (
    <>
      <KpiCards count={4} />
      <ChartCard height={250} />
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard height={250} />
        <ChartCard height={250} />
      </div>
    </>
  );
}

function ProductsSkeleton() {
  return (
    <>
      <KpiCards count={3} />
      <TableCard rows={10} />
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard height={250} />
        <ChartCard height={250} />
      </div>
    </>
  );
}

function CustomersSkeleton() {
  return (
    <>
      <KpiCards count={3} />
      <ChartCard height={250} />
      <TableCard rows={10} />
    </>
  );
}

function CouponsSkeleton() {
  return (
    <>
      <KpiCards count={3} />
      <ChartCard height={250} />
      <TableCard rows={8} />
    </>
  );
}

function GeographySkeleton() {
  return (
    <>
      <KpiCards count={2} />
      <ChartCard height={350} />
      <TableCard rows={8} />
    </>
  );
}

const TAB_SKELETONS: Record<string, React.ReactNode> = {
  sales: <SalesSkeleton />,
  products: <ProductsSkeleton />,
  customers: <CustomersSkeleton />,
  coupons: <CouponsSkeleton />,
  geography: <GeographySkeleton />,
};

// ─── Inner component that reads URL ──────────────────────────────────────────
// Must be wrapped in <Suspense> — useSearchParams() requires it.

function TabSkeletonContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "sales";
  return <>{TAB_SKELETONS[tab] ?? TAB_SKELETONS.sales}</>;
}

// ─── Exported loading UI ──────────────────────────────────────────────────────

export default function AdminAnalyticsLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-64" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-md" />
        ))}
      </div>

      {/* Tab content — reads URL for the correct skeleton.
          Suspense is required by Next.js when useSearchParams is used
          in a Client Component; the Sales skeleton is shown while
          the hook resolves. */}
      <Suspense fallback={<SalesSkeleton />}>
        <TabSkeletonContent />
      </Suspense>
    </div>
  );
}
