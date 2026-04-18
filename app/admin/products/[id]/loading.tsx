import { Skeleton } from "@/components/ui/skeleton";

export default function AdminProductDetailLoading() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-5 w-48" />
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
