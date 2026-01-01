"use client";

import { useState } from "react";
import { Plus, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { AssetCard } from "@/components/finance/asset-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAssets,
  useCreateAsset,
  useDeleteAsset,
  useAddAssetValuation,
} from "@/hooks/use-assets";
import { assetSchema } from "@/schemas/asset";
import { cn } from "@/lib/utils";
import type { AssetType, AssetSubtype } from "@/types";

interface FormValues {
  name: string;
  type: AssetType;
  subtype: AssetSubtype;
  currentValue: number;
  purchaseValue: number;
  purchaseDate?: Date | null;
  maturityDate?: Date | null;
  interestRate?: number | null;
  notes?: string | null;
  color: string;
}

const colorOptions = [
  { value: "#10b981", label: "Emerald" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#ec4899", label: "Pink" },
];

const typeOptions: { value: AssetType; label: string }[] = [
  { value: "investment", label: "Investment" },
  { value: "fixed_deposit", label: "Fixed Deposit" },
  { value: "retirement", label: "Retirement" },
];

const subtypeOptions: Record<AssetType, { value: AssetSubtype; label: string }[]> = {
  investment: [
    { value: "mutual_fund", label: "Mutual Fund" },
    { value: "stock", label: "Stock" },
    { value: "etf", label: "ETF" },
    { value: "other", label: "Other" },
  ],
  fixed_deposit: [
    { value: "fd", label: "Fixed Deposit" },
    { value: "rd", label: "Recurring Deposit" },
    { value: "other", label: "Other" },
  ],
  retirement: [
    { value: "epf", label: "EPF" },
    { value: "ppf", label: "PPF" },
    { value: "nps", label: "NPS" },
    { value: "other", label: "Other" },
  ],
};

export default function AssetsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [newValue, setNewValue] = useState("");

  const { data: assets, isLoading } = useAssets();
  const createAsset = useCreateAsset();
  const deleteAsset = useDeleteAsset();
  const addValuation = useAddAssetValuation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(assetSchema) as never,
    defaultValues: {
      name: "",
      type: "investment",
      subtype: "mutual_fund",
      currentValue: undefined,
      purchaseValue: undefined,
      color: "#10b981",
    },
  });

  const selectedColor = watch("color");
  const selectedType = watch("type");

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      await createAsset.mutateAsync(data);
      toast.success("Asset created successfully");
      reset();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create asset"
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;

    try {
      await deleteAsset.mutateAsync(id);
      toast.success("Asset deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete asset"
      );
    }
  };

  const handleUpdateValue = async () => {
    if (!selectedAssetId || !newValue) return;

    try {
      await addValuation.mutateAsync({
        assetId: selectedAssetId,
        data: {
          value: parseFloat(newValue),
          valuationDate: new Date(),
        },
      });
      toast.success("Value updated successfully");
      setIsValueDialogOpen(false);
      setSelectedAssetId(null);
      setNewValue("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update value"
      );
    }
  };

  // Calculate totals
  const totalCurrentValue =
    assets?.reduce(
      (sum, asset) => sum + parseFloat(String(asset.currentValue)),
      0
    ) || 0;
  const totalPurchaseValue =
    assets?.reduce(
      (sum, asset) => sum + parseFloat(String(asset.purchaseValue)),
      0
    ) || 0;
  const totalReturns = totalCurrentValue - totalPurchaseValue;
  const totalReturnsPercentage =
    totalPurchaseValue > 0
      ? ((totalReturns / totalPurchaseValue) * 100).toFixed(1)
      : "0.0";

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen">
      <Header title="Assets" />

      <div className="px-4 py-6 md:px-6 space-y-6 max-w-4xl mx-auto">
        {/* Total Value Summary */}
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              Total Asset Value
            </p>
            <p className="text-3xl font-bold text-emerald-600">
              {formatAmount(totalCurrentValue)}
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {totalReturns >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`text-sm ${
                  totalReturns >= 0 ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {totalReturns >= 0 ? "+" : ""}
                {formatAmount(totalReturns)} ({totalReturnsPercentage}%)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Assets List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Your Assets</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Asset</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4 mt-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Asset Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., HDFC Flexi Cap Fund"
                      {...register("name")}
                      className={cn(errors.name && "border-destructive")}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Asset Type</Label>
                      <Select
                        value={selectedType}
                        onValueChange={(v) => {
                          setValue("type", v as AssetType);
                          // Reset subtype when type changes
                          const firstSubtype =
                            subtypeOptions[v as AssetType]?.[0]?.value;
                          if (firstSubtype) {
                            setValue("subtype", firstSubtype);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {typeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Subtype</Label>
                      <Select
                        value={watch("subtype")}
                        onValueChange={(v) => setValue("subtype", v as AssetSubtype)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {subtypeOptions[selectedType]?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentValue">Current Value</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          ₹
                        </span>
                        <Input
                          id="currentValue"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-8"
                          {...register("currentValue", { valueAsNumber: true })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchaseValue">Invested Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          ₹
                        </span>
                        <Input
                          id="purchaseValue"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-8"
                          {...register("purchaseValue", { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  </div>

                  {(selectedType === "fixed_deposit" ||
                    selectedType === "retirement") && (
                    <div className="space-y-2">
                      <Label htmlFor="interestRate">Interest Rate (%)</Label>
                      <Input
                        id="interestRate"
                        type="number"
                        step="0.01"
                        placeholder="7.5"
                        {...register("interestRate", { valueAsNumber: true })}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setValue("color", color.value)}
                          className={cn(
                            "w-8 h-8 rounded-full transition-transform",
                            selectedColor === color.value &&
                              "ring-2 ring-offset-2 ring-primary scale-110"
                          )}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createAsset.isPending}
                  >
                    {createAsset.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Asset"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : assets?.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No assets yet. Add your investments, FDs, or retirement funds.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {assets?.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onDelete={() => handleDelete(asset.id)}
                  onUpdateValue={() => {
                    setSelectedAssetId(asset.id);
                    setNewValue(String(asset.currentValue));
                    setIsValueDialogOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Update Value Dialog */}
        <Dialog open={isValueDialogOpen} onOpenChange={setIsValueDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Asset Value</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="newValue">New Value</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id="newValue"
                    type="number"
                    step="0.01"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleUpdateValue}
                disabled={addValuation.isPending}
              >
                {addValuation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Value"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

