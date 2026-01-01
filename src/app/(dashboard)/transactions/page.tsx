import { Suspense } from "react";
import { TransactionsClient } from "@/components/transactions/transactions-client";
import { Skeleton } from "@/components/ui/skeleton";

function TransactionsSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b" />
      <div className="px-4 py-6 md:px-6 space-y-6 max-w-4xl mx-auto">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-[140px]" />
        </div>

        {/* Transaction Count */}
        <Skeleton className="h-5 w-32" />

        {/* Transaction Groups */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<TransactionsSkeleton />}>
      <TransactionsClient />
    </Suspense>
  );
}
