"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { BudgetGoalFormData } from "@/types";

// Budget goal response type
export interface BudgetGoalResponse {
  id: string | null;
  month: number;
  year: number;
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
  isCustom: boolean;
}

// Fetch budget goal for a specific month/year
export function useBudgetGoal(month: number, year: number) {
  return useQuery({
    queryKey: ["budget-goal", month, year],
    queryFn: async () => {
      const response = await api.get<BudgetGoalResponse>("/api/budget-goals", {
        params: { month, year },
      });
      return response;
    },
    enabled: month >= 1 && month <= 12 && year >= 2020,
  });
}

// Create or update budget goal (upsert)
export function useUpdateBudgetGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BudgetGoalFormData) => {
      return api.post<BudgetGoalResponse & { message: string }>(
        "/api/budget-goals",
        data
      );
    },
    onSuccess: (data) => {
      // Invalidate the specific month/year query
      queryClient.invalidateQueries({
        queryKey: ["budget-goal", data.month, data.year],
      });
      // Also invalidate summary as it uses budget goals
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}

// Reset budget goal to defaults (delete custom goal)
export function useResetBudgetGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ month, year }: { month: number; year: number }) => {
      return api.delete<{ message: string }>("/api/budget-goals", {
        params: { month, year },
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific month/year query
      queryClient.invalidateQueries({
        queryKey: ["budget-goal", variables.month, variables.year],
      });
      // Also invalidate summary as it uses budget goals
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}

