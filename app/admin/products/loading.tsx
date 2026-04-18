import { Skeleton } from "@/components/ui/skeleton";

export default function AdminProductsLoading() {
  return (
    <div className="space-y-4 p-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 max-w-xs w-64" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      <div className="rounded-md border">
        <div className="border-b px-4 py-3 flex gap-4 items-center">
          {[56, 220, 120, 80, 60, 80, 100].map((w, i) => (
            <Skeleton key={i} className="h-4" style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="px-4 py-3 flex gap-4 items-center border-b last:border-0"
          >
            <Skeleton className="size-10 rounded-md shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-[180px]" />
              <Skeleton className="h-3 w-[120px]" />
            </div>
            <Skeleton className="h-4 w-[100px] ml-auto" />
            <Skeleton className="h-4 w-[60px]" />
            <Skeleton className="h-4 w-[40px]" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-8 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
