import { Skeleton } from "@/components/ui/skeleton";

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="size-8 rounded-lg" />
      </div>
      <Skeleton className="h-9 w-36" />
      <div className="mt-2 flex items-center gap-2">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

function AlertCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <Skeleton className="size-12 shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-44 max-w-full" />
        </div>
      </div>
    </div>
  );
}

function ChartCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex flex-col gap-1.5 border-b px-6 py-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <div className="p-6 pt-0">
        <Skeleton className="h-[250px] w-full rounded-md" />
      </div>
    </div>
  );
}

function TableCardSkeleton({
  titleWidth,
  columnWidths,
  rows,
  badgeColumnIndex,
}: {
  titleWidth: string;
  columnWidths: number[];
  rows: number;
  badgeColumnIndex?: number;
}) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex flex-row items-center justify-between border-b px-6 py-6">
        <Skeleton className="h-6" style={{ width: titleWidth }} />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
      <div className="p-0">
        <div className="border-b px-4 py-3">
          <div className="flex gap-4">
            {columnWidths.map((w, i) => (
              <Skeleton key={i} className="h-4" style={{ width: w }} />
            ))}
          </div>
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 border-b px-4 py-3 last:border-0"
          >
            {columnWidths.map((w, j) => (
              <Skeleton
                key={j}
                className={
                  badgeColumnIndex === j
                    ? "h-5 w-[72px] rounded-full"
                    : "h-4"
                }
                style={badgeColumnIndex === j ? undefined : { width: w }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <AlertCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TableCardSkeleton
          titleWidth="140px"
          columnWidths={[72, 96, 72, 56, 48]}
          rows={5}
          badgeColumnIndex={2}
        />
        <TableCardSkeleton
          titleWidth="220px"
          columnWidths={[140, 80, 48, 72]}
          rows={5}
        />
      </div>
    </div>
  );
}
