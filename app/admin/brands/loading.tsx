import { Skeleton } from "@/components/ui/skeleton";

export default function AdminBrandsLoading() {
  return (
    <div className="space-y-4 p-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-9 max-w-xs w-full" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <div className="border-b px-4 py-3 flex gap-4 items-center">
          {[56, 120, 160, 80, 60].map((w, i) => (
            <Skeleton key={i} className="h-4" style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-4 py-3 flex gap-4 items-center border-b last:border-0">
            <Skeleton className="size-10 rounded-md shrink-0" />
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-4 w-[160px]" />
            <Skeleton className="h-4 w-[80px]" />
            <div className="ml-auto flex gap-1">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
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
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-9 w-9" />)}
          <Skeleton className="h-9 w-16" />
        </div>
      </div>
    </div>
  );
}
