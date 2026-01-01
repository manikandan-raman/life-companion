"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { NetWorthSummary, NetWorthHistory } from "@/types";

// Get current net worth
export function useNetWorth() {
  return useQuery({
    queryKey: ["networth"],
    queryFn: async () => {
      const response = await api.get<NetWorthSummary>("/api/networth");
      return response;
    },
  });
}

// Get net worth history
export function useNetWorthHistory(limit: number = 12) {
  return useQuery({
    queryKey: ["networth", "history", limit],
    queryFn: async () => {
      const response = await api.get<{ data: NetWorthHistory[] }>(
        "/api/networth/history",
        { params: { limit } }
      );
      return response.data;
    },
  });
}

// Create a net worth snapshot
export function useCreateSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return api.post<{ data: unknown; message: string }>(
        "/api/networth/snapshot"
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["networth", "history"] });
    },
  });
}

