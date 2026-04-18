import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCustomerDetailLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-md" />
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-52" />
        </div>
      </div>

      {/* Stats card */}
      <div className="rounded-lg border p-6 space-y-4">
        <Skeleton className="h-4 w-20" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Orders table */}
        <div className="lg:col-span-2 rounded-lg border">
          <div className="p-6 space-y-1">
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="border-b px-4 py-3 flex gap-4">
            {[90, 80, 80, 50, 80, 80].map((w, i) => (
              <Skeleton key={i} className="h-4" style={{ width: w }} />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex gap-4 items-center border-b last:border-0">
              <Skeleton className="h-4 w-[90px]" />
              <Skeleton className="h-5 w-[75px] rounded-full" />
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-4 w-[40px]" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[80px]" />
            </div>
          ))}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Profile card */}
          <div className="rounded-lg border p-6 space-y-4">
            <Skeleton className="h-4 w-16" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 shrink-0" />
                  <Skeleton className="h-4 w-36" />
                </div>
              ))}
            </div>
          </div>

          {/* Addresses card */}
          <div className="rounded-lg border p-6 space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-md border p-3 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
