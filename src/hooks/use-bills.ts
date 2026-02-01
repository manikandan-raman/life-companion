"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { serializeDateFields } from "@/lib/utils";
import type {
  RecurringBill,
  BillPayment,
  Category,
  SubCategory,
  Account,
  BillStatus,
} from "@/types";

// ============ Recurring Bill Types ============

export interface RecurringBillWithRelations extends RecurringBill {
  category: Category | null;
  subCategory: SubCategory | null;
  account: Account | null;
  payment: BillPaymentWithAccount | null;
  status: BillStatus;
}

export interface BillPaymentWithAccount extends BillPayment {
  account: Account | null;
}

export interface RecurringBillFormValues {
  name: string;
  amount: number;
  categoryId?: string | null;
  accountId?: string | null;
  dueDay: number;
  notes?: string | null;
  isActive?: boolean;
}

export interface BillPaymentFormValues {
  type: "needs" | "wants" | "savings" | "investments";
  paidDate: Date;
  paidAmount: number;
  accountId: string;
}

// ============ API Response Types ============

interface BillsResponse {
  data: RecurringBillWithRelations[];
  grouped: {
    overdue: RecurringBillWithRelations[];
    due_today: RecurringBillWithRelations[];
    upcoming: RecurringBillWithRelations[];
    pending: RecurringBillWithRelations[];
    paid: RecurringBillWithRelations[];
  };
  summary: {
    total: number;
    totalAmount: number;
    paid: number;
    paidAmount: number;
    unpaid: number;
    unpaidAmount: number;
    overdue: number;
  };
  month: number;
  year: number;
}

// ============ Recurring Bills Hooks ============

interface UseBillsOptions {
  month?: number;
  year?: number;
  categoryId?: string;
  isActive?: boolean;
  status?: BillStatus | "all";
}

export function useBills(options: UseBillsOptions = {}) {
  const today = new Date();
  const {
    month = today.getMonth() + 1,
    year = today.getFullYear(),
    categoryId,
    isActive,
    status,
  } = options;

  return useQuery({
    queryKey: ["bills", { month, year, categoryId, isActive, status }],
    queryFn: async () => {
      const params: Record<string, string | number | boolean> = { month, year };
      if (categoryId) params.categoryId = categoryId;
      if (isActive !== undefined) params.isActive = isActive;
      if (status) params.status = status;

      return api.get<BillsResponse>("/api/bills", { params });
    },
  });
}

export function useBill(id: string | undefined) {
  return useQuery({
    queryKey: ["bills", id],
    queryFn: async () => {
      if (!id) throw new Error("Bill ID is required");
      const response = await api.get<{ data: RecurringBillWithRelations }>(
        `/api/bills/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RecurringBillFormValues) => {
      return api.post<{ data: RecurringBillWithRelations; message: string }>(
        "/api/bills",
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    },
  });
}

export function useUpdateBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<RecurringBillFormValues>;
    }) => {
      return api.patch<{ data: RecurringBillWithRelations; message: string }>(
        `/api/bills/${id}`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    },
  });
}

export function useDeleteBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete<{ message: string }>(`/api/bills/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    },
  });
}

// ============ Bill Payment Hooks ============

interface PayBillParams {
  billId: string;
  month: number;
  year: number;
  data: BillPaymentFormValues;
}

export function usePayBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ billId, month, year, data }: PayBillParams) => {
      const serialized = serializeDateFields(data, ["paidDate"]);
      return api.post<{ data: BillPayment; message: string }>(
        `/api/bills/${billId}/pay?month=${month}&year=${year}`,
        serialized
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
