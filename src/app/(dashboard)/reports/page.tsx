import { Suspense } from "react";
import { ReportsClient } from "@/components/reports/reports-client";
import { Skeleton } from "@/components/ui/skeleton";

function ReportsSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b" />
      <div className="px-4 py-6 md:px-6 space-y-6 max-w-4xl mx-auto">
        {/* Month Picker */}
        <div className="flex items-center justify-center">
          <Skeleton className="h-10 w-48" />
        </div>

        {/* Report Card */}
        <div className="rounded-xl border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-3" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<ReportsSkeleton />}>
      <ReportsClient />
    </Suspense>
  );
}
