import { Suspense } from "react";
import type { Metadata } from "next";
import { SpendingClient } from "@/components/spending/spending-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Spending",
  description: "Detailed spending breakdown by category and subcategory",
};

function SpendingSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b" />
      <div className="px-4 py-6 md:px-6 space-y-5 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-72 rounded-2xl" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SpendingPage() {
  return (
    <Suspense fallback={<SpendingSkeleton />}>
      <SpendingClient />
    </Suspense>
  );
}
