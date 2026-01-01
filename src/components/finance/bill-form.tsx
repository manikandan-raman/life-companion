"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recurringBillSchema } from "@/schemas/bill";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAccounts, useCategories } from "@/hooks/use-accounts";
import { Loader2 } from "lucide-react";

type FormValues = z.infer<typeof recurringBillSchema>;

interface BillFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function BillForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Save",
}: BillFormProps) {
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(recurringBillSchema),
    defaultValues: {
      name: "",
      amount: undefined,
      dueDay: 1,
      isActive: true,
      ...defaultValues,
    },
  });

  const selectedCategoryId = watch("categoryId");
  const selectedSubCategoryId = watch("subCategoryId");
  const selectedAccountId = watch("accountId");

  // Get sub-categories for the selected category
  const selectedCategory = categories?.find((c) => c.id === selectedCategoryId);
  const subCategoriesForCategory = selectedCategory?.subCategories || [];

  // Reset sub-category when category changes
  const handleCategoryChange = (categoryId: string) => {
    setValue("categoryId", categoryId === "none" ? null : categoryId);
    setValue("subCategoryId", null);
  };

  const handleFormSubmit = async (data: FormValues) => {
    await onSubmit(data);
  };

  const isLoadingData = accountsLoading || categoriesLoading;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Bill Name *</Label>
        <Input
          id="name"
          placeholder="e.g., Electricity Bill"
          {...register("name")}
          className={cn(errors.name && "border-destructive")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (₹) *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="₹0.00"
          {...register("amount", { valueAsNumber: true })}
          className={cn(errors.amount && "border-destructive")}
        />
        {errors.amount && (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        )}
      </div>

      {/* Due Day */}
      <div className="space-y-2">
        <Label htmlFor="dueDay">Due Day of Month *</Label>
        <Input
          id="dueDay"
          type="number"
          min="1"
          max="31"
          placeholder="1-31"
          {...register("dueDay", { valueAsNumber: true })}
          className={cn(errors.dueDay && "border-destructive")}
        />
        {errors.dueDay && (
          <p className="text-sm text-destructive">{errors.dueDay.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={selectedCategoryId || "none"}
          onValueChange={handleCategoryChange}
          disabled={isLoadingData}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No category</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          This category will be used when creating transactions
        </p>
      </div>

      {/* Sub-category (only show if category is selected and has sub-categories) */}
      {selectedCategoryId && subCategoriesForCategory.length > 0 && (
        <div className="space-y-2">
          <Label>Sub-category (Optional)</Label>
          <Select
            value={selectedSubCategoryId || "none"}
            onValueChange={(value) =>
              setValue("subCategoryId", value === "none" ? null : value)
            }
            disabled={isLoadingData}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sub-category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No sub-category</SelectItem>
              {subCategoriesForCategory.map((subCat) => (
                <SelectItem key={subCat.id} value={subCat.id}>
                  {subCat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Default Account */}
      <div className="space-y-2">
        <Label>Default Account</Label>
        <Select
          value={selectedAccountId || "none"}
          onValueChange={(value) =>
            setValue("accountId", value === "none" ? null : value)
          }
          disabled={isLoadingData}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No default account</SelectItem>
            {accounts?.map((acc) => (
              <SelectItem key={acc.id} value={acc.id}>
                {acc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Default account for paying this bill
        </p>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          placeholder="Optional notes..."
          {...register("notes")}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || isLoadingData}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
