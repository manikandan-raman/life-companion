"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  MonthlyBudget,
  BudgetItem,
  Category,
  Account,
  Transaction,
  BudgetItemType,
  BudgetItemStatus,
  BudgetSummary,
} from "@/types";

// ============ Budget Item Types ============

export interface BudgetItemWithRelations extends BudgetItem {
  category: Category | null;
  account: Account | null;
  transaction: Transaction | null;
  status: BudgetItemStatus;
  actualSpent: number;
}

export interface BudgetItemFormValues {
  itemType: BudgetItemType;
  categoryId?: string | null;
  name: string;
  amount: number;
  dueDay?: number | null;
  isRecurring?: boolean;
  accountId?: string | null;
  notes?: string | null;
}

export interface BudgetItemPaymentFormValues {
  type: "needs" | "wants" | "savings" | "investments";
  paidDate: Date;
  paidAmount: number;
  accountId: string;
}

// ============ API Response Types ============

interface BudgetResponse {
  data: {
    budget: MonthlyBudget;
    items: BudgetItemWithRelations[];
    limits: BudgetItemWithRelations[];
    payments: BudgetItemWithRelations[];
  };
  summary: BudgetSummary;
  month: number;
  year: number;
}

// ============ Budget Hooks ============

interface UseBudgetOptions {
  month?: number;
  year?: number;
  itemType?: BudgetItemType | "all";
  status?: BudgetItemStatus | "all";
}

export function useBudget(options: UseBudgetOptions = {}) {
  const today = new Date();
  const {
    month = today.getMonth() + 1,
    year = today.getFullYear(),
    itemType,
    status,
  } = options;

  return useQuery({
    queryKey: ["budgets", { month, year, itemType, status }],
    queryFn: async () => {
      const params: Record<string, string | number> = { month, year };
      if (itemType) params.itemType = itemType;
      if (status) params.status = status;

      return api.get<BudgetResponse>("/api/budgets", { params });
    },
  });
}

export function useCreateBudgetItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BudgetItemFormValues & { month?: number; year?: number }) => {
      return api.post<{ data: BudgetItemWithRelations; message: string }>(
        "/api/budgets",
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useUpdateBudgetItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<BudgetItemFormValues>;
    }) => {
      return api.patch<{ data: BudgetItemWithRelations; message: string }>(
        `/api/budgets/items/${id}`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useDeleteBudgetItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete<{ message: string }>(`/api/budgets/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

// ============ Budget Item Payment Hook ============

export function usePayBudgetItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      data,
    }: {
      itemId: string;
      data: BudgetItemPaymentFormValues;
    }) => {
      return api.post<{ data: BudgetItemWithRelations; transaction: Transaction; message: string }>(
        `/api/budgets/items/${itemId}/pay`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

