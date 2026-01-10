import { Suspense } from "react";
import { BudgetsClient } from "@/components/budgets/budgets-client";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Budgets | mk_digi",
  description: "Manage your monthly budget limits and payments",
};

function BudgetsSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b" />
      <div className="px-4 py-6 md:px-6 space-y-6 max-w-4xl mx-auto">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-[160px]" />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>

        {/* Budget Items */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BudgetsPage() {
  return (
    <Suspense fallback={<BudgetsSkeleton />}>
      <BudgetsClient />
    </Suspense>
  );
}

