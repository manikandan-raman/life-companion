"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Asset, AssetWithValuations } from "@/types";
import type { AssetFormData, AssetValuationFormData } from "@/schemas/asset";

// Get all assets
export function useAssets() {
  return useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const response = await api.get<{ data: AssetWithValuations[] }>(
        "/api/assets"
      );
      return response.data;
    },
  });
}

// Get single asset with valuations
export function useAsset(id: string) {
  return useQuery({
    queryKey: ["assets", id],
    queryFn: async () => {
      const response = await api.get<{ data: AssetWithValuations }>(
        `/api/assets/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
}

// Create asset
export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssetFormData) => {
      return api.post<{ data: Asset; message: string }>("/api/assets", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["networth"] });
    },
  });
}

// Update asset
export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: AssetFormData;
    }) => {
      return api.put<{ data: Asset; message: string }>(
        `/api/assets/${id}`,
        data
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assets", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["networth"] });
    },
  });
}

// Delete asset
export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete<{ message: string }>(`/api/assets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["networth"] });
    },
  });
}

// Add valuation to asset
export function useAddAssetValuation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      assetId,
      data,
    }: {
      assetId: string;
      data: Omit<AssetValuationFormData, "assetId">;
    }) => {
      return api.post<{ data: unknown; message: string }>(
        `/api/assets/${assetId}`,
        data
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assets", variables.assetId] });
      queryClient.invalidateQueries({ queryKey: ["networth"] });
    },
  });
}

