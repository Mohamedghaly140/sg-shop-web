import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOrderDetailLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-md" />
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* Status stepper */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Body grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Items table */}
        <div className="lg:col-span-2 rounded-xl border bg-card">
          <div className="border-b px-6 py-4">
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="border-b px-4 py-3 flex gap-4">
            {[200, 80, 60, 80].map((w, i) => (
              <Skeleton key={i} className="h-4" style={{ width: w }} />
            ))}
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex gap-4 items-center border-b last:border-0">
              <Skeleton className="size-10 rounded-md shrink-0" />
              <Skeleton className="h-4 w-[180px]" />
              <Skeleton className="h-4 w-[70px]" />
              <Skeleton className="h-4 w-[50px]" />
              <Skeleton className="h-4 w-[70px]" />
            </div>
          ))}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <Skeleton className="h-4 w-20" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <Skeleton className="h-4 w-24" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-4 shrink-0" />
                <Skeleton className="h-3 w-36" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
