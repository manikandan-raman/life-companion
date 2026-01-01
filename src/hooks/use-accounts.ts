"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Account, Category } from "@/types";
import type { AccountFormData } from "@/schemas/account";
import type { CategoryFormData } from "@/schemas/category";

// Accounts
export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const response = await api.get<{ data: Account[] }>("/api/accounts");
      return response.data;
    },
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AccountFormData) => {
      return api.post<{ data: Account; message: string }>("/api/accounts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<AccountFormData>;
    }) => {
      return api.patch<{ data: Account; message: string }>(
        `/api/accounts/${id}`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete<{ message: string }>(`/api/accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

// Categories
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get<{ data: Category[] }>("/api/categories");
      return response.data;
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CategoryFormData) => {
      return api.post<{ data: Category; message: string }>(
        "/api/categories",
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CategoryFormData>;
    }) => {
      return api.patch<{ data: Category; message: string }>(
        `/api/categories/${id}`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete<{ message: string }>(`/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

