import { Suspense } from "react";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b" />
      <div className="px-4 py-6 md:px-6 space-y-6 max-w-4xl mx-auto">
        {/* Month Picker */}
        <div className="flex items-center justify-center">
          <Skeleton className="h-10 w-48" />
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>

        {/* Charts */}
        <Skeleton className="h-80 rounded-xl" />

        {/* Budget Progress */}
        <Skeleton className="h-64 rounded-xl" />

        {/* Recent Transactions */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient />
    </Suspense>
  );
}
