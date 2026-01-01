"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  TransactionWithRelations,
  PaginatedResponse,
  TransactionFilters,
  CategoryType,
} from "@/types";

// Form values type for creating/updating transactions
export interface TransactionFormValues {
  amount: number;
  description: string;
  notes?: string | null;
  categoryId: string;
  accountId?: string | null;
  transactionDate: Date;
  tagIds?: string[];
}

interface UseTransactionsOptions extends TransactionFilters {
  page?: number;
  pageSize?: number;
  sortBy?: "transactionDate" | "amount" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const {
    startDate,
    endDate,
    categoryId,
    categoryType,
    accountId,
    search,
    sortBy = "transactionDate",
    sortOrder = "desc",
    page = 1,
    pageSize = 20,
  } = options;

  return useQuery({
    queryKey: [
      "transactions",
      { startDate, endDate, categoryId, categoryType, accountId, search, sortBy, sortOrder, page, pageSize },
    ],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, pageSize, sortBy, sortOrder };
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();
      if (categoryId) params.categoryId = categoryId;
      if (categoryType) params.categoryType = categoryType;
      if (accountId) params.accountId = accountId;
      if (search) params.search = search;

      return api.get<PaginatedResponse<TransactionWithRelations>>(
        "/api/transactions",
        { params }
      );
    },
  });
}

// Summary API types
export interface SpendingByType {
  name: string;
  amount: number;
}

export interface SpendingByCategory {
  name: string;
  amount: number;
  color: string;
  type: string;
}

export interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  needs: { current: number; goal: number };
  wants: { current: number; goal: number };
  savings: { current: number; goal: number };
  spendingByType: SpendingByType[];
  spendingByCategory: SpendingByCategory[];
  recentTransactions: Array<{
    id: string;
    amount: string;
    description: string;
    notes: string | null;
    transactionDate: string;
    category: {
      id: string;
      name: string;
      type: string;
      color: string | null;
      icon: string | null;
    } | null;
    account: {
      id: string;
      name: string;
      type: string;
      color: string | null;
    } | null;
  }>;
}

interface UseSummaryOptions {
  startDate: Date;
  endDate: Date;
}

export function useSummary(options: UseSummaryOptions) {
  const { startDate, endDate } = options;

  return useQuery({
    queryKey: ["summary", { startDate: startDate.toISOString(), endDate: endDate.toISOString() }],
    queryFn: async () => {
      return api.get<SummaryData>("/api/summary", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
    },
  });
}

// Grouped transactions types
export interface GroupedTransaction {
  id: string;
  amount: string;
  description: string;
  notes: string | null;
  transactionDate: string;
  category: {
    id: string;
    name: string;
    type: string;
    color: string | null;
    icon: string | null;
  } | null;
  account: {
    id: string;
    name: string;
    type: string;
    color: string | null;
  } | null;
  tags: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
}

export interface GroupedTransactionsData {
  groups: Array<{
    date: string;
    transactions: GroupedTransaction[];
  }>;
  total: number;
}

interface UseGroupedTransactionsOptions {
  startDate: Date;
  endDate: Date;
  categoryId?: string;
  categoryType?: CategoryType;
  accountId?: string;
  search?: string;
  sortOrder?: "asc" | "desc";
}

export function useGroupedTransactions(options: UseGroupedTransactionsOptions) {
  const { startDate, endDate, categoryId, categoryType, accountId, search, sortOrder = "desc" } = options;

  return useQuery({
    queryKey: [
      "transactions",
      "grouped",
      { startDate: startDate.toISOString(), endDate: endDate.toISOString(), categoryId, categoryType, accountId, search, sortOrder },
    ],
    queryFn: async () => {
      const params: Record<string, string> = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        sortOrder,
      };
      if (categoryId) params.categoryId = categoryId;
      if (categoryType) params.categoryType = categoryType;
      if (accountId) params.accountId = accountId;
      if (search) params.search = search;

      return api.get<GroupedTransactionsData>("/api/transactions/grouped", { params });
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TransactionFormValues) => {
      return api.post<{ data: TransactionWithRelations; message: string }>(
        "/api/transactions",
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TransactionFormValues>;
    }) => {
      return api.patch<{ data: TransactionWithRelations; message: string }>(
        `/api/transactions/${id}`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete<{ message: string }>(`/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
