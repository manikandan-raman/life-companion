"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { serializeDateFields } from "@/lib/utils";
import type { Liability, LiabilityWithPayments } from "@/types";
import type {
  LiabilityFormData,
  LiabilityPaymentFormData,
} from "@/schemas/liability";

// Get all liabilities
export function useLiabilities() {
  return useQuery({
    queryKey: ["liabilities"],
    queryFn: async () => {
      const response = await api.get<{ data: LiabilityWithPayments[] }>(
        "/api/liabilities"
      );
      return response.data;
    },
  });
}

// Get single liability with payments
export function useLiability(id: string) {
  return useQuery({
    queryKey: ["liabilities", id],
    queryFn: async () => {
      const response = await api.get<{ data: LiabilityWithPayments }>(
        `/api/liabilities/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
}

// Create liability
export function useCreateLiability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LiabilityFormData) => {
      const serialized = serializeDateFields(data, ["startDate", "endDate"]);
      return api.post<{ data: Liability; message: string }>(
        "/api/liabilities",
        serialized
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liabilities"] });
      queryClient.invalidateQueries({ queryKey: ["networth"] });
    },
  });
}

// Update liability
export function useUpdateLiability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: LiabilityFormData;
    }) => {
      const serialized = serializeDateFields(data, ["startDate", "endDate"]);
      return api.put<{ data: Liability; message: string }>(
        `/api/liabilities/${id}`,
        serialized
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["liabilities"] });
      queryClient.invalidateQueries({ queryKey: ["liabilities", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["networth"] });
    },
  });
}

// Delete liability
export function useDeleteLiability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete<{ message: string }>(`/api/liabilities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liabilities"] });
      queryClient.invalidateQueries({ queryKey: ["networth"] });
    },
  });
}

// Add payment to liability
export function useAddLiabilityPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      liabilityId,
      data,
    }: {
      liabilityId: string;
      data: Omit<LiabilityPaymentFormData, "liabilityId">;
    }) => {
      const serialized = serializeDateFields(data, ["paymentDate"]);
      return api.post<{ data: unknown; message: string }>(
        `/api/liabilities/${liabilityId}`,
        serialized
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["liabilities"] });
      queryClient.invalidateQueries({
        queryKey: ["liabilities", variables.liabilityId],
      });
      queryClient.invalidateQueries({ queryKey: ["networth"] });
    },
  });
}

