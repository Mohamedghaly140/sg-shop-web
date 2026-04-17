import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCouponsLoading() {
  return (
    <div className="space-y-4 p-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 gap-2">
          <Skeleton className="h-9 max-w-xs w-full" />
          <Skeleton className="h-9 w-[150px]" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <div className="border-b px-4 py-3 flex gap-4">
          {[100, 70, 110, 90, 80, 80, 60].map((w, i) => (
            <Skeleton key={i} className="h-4" style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="px-4 py-3 flex gap-4 items-center border-b last:border-0"
          >
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-5 w-[60px] rounded-full" />
            <div className="flex flex-col gap-1 w-[110px]">
              <Skeleton className="h-1.5 w-full rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-[90px]" />
            <Skeleton className="h-5 w-[75px] rounded-full" />
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-8 w-20 ml-auto" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-[70px]" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-9 w-20" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-9 w-9" />
          ))}
          <Skeleton className="h-9 w-16" />
        </div>
      </div>
    </div>
  );
}
