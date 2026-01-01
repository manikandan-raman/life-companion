"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Account, AccountFromView, CategoryWithSubCategories, SubCategory } from "@/types";
import type { AccountFormData } from "@/schemas/account";
import type { CategoryFormData, SubCategoryFormData } from "@/schemas/category";

// Accounts - returns accounts with calculated currentBalance from the view
export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const response = await api.get<{ data: AccountFromView[] }>("/api/accounts");
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

// Categories - returns categories with nested sub-categories
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get<{ data: CategoryWithSubCategories[] }>("/api/categories");
      return response.data;
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CategoryFormData) => {
      return api.post<{ data: CategoryWithSubCategories; message: string }>(
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
      return api.patch<{ data: CategoryWithSubCategories; message: string }>(
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

// Sub-categories
export function useSubCategories(categoryId?: string) {
  return useQuery({
    queryKey: ["sub-categories", categoryId],
    queryFn: async () => {
      const url = categoryId 
        ? `/api/sub-categories?categoryId=${categoryId}`
        : "/api/sub-categories";
      const response = await api.get<{ data: SubCategory[] }>(url);
      return response.data;
    },
    enabled: categoryId !== undefined,
  });
}

export function useCreateSubCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubCategoryFormData) => {
      return api.post<{ data: SubCategory; message: string }>(
        "/api/sub-categories",
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["sub-categories"] });
    },
  });
}

export function useUpdateSubCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<SubCategoryFormData>;
    }) => {
      return api.patch<{ data: SubCategory; message: string }>(
        `/api/sub-categories/${id}`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["sub-categories"] });
    },
  });
}

export function useDeleteSubCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete<{ message: string }>(`/api/sub-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["sub-categories"] });
    },
  });
}
