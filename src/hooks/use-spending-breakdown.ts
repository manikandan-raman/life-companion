"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface SubCategorySpending {
  id: string;
  name: string;
  icon: string | null;
  amount: number;
  percentage: number;
}

export interface CategorySpending {
  id: string;
  name: string;
  icon: string | null;
  amount: number;
  percentage: number;
  type: string;
  subCategories: SubCategorySpending[];
}

export interface SpendingBreakdownData {
  categories: CategorySpending[];
  totalSpending: number;
}

interface UseSpendingBreakdownOptions {
  startDate: Date;
  endDate: Date;
}

export function useSpendingBreakdown(options: UseSpendingBreakdownOptions) {
  const { startDate, endDate } = options;

  return useQuery({
    queryKey: [
      "spending-breakdown",
      { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
    ],
    queryFn: async () => {
      return api.get<SpendingBreakdownData>("/api/summary/spending-breakdown", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
    },
  });
}

