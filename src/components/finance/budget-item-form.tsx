"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { budgetItemSchema } from "@/schemas/budget";
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
import { Loader2, Target, Receipt } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FormValues = z.infer<typeof budgetItemSchema>;

interface BudgetItemFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function BudgetItemForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Save",
}: BudgetItemFormProps) {
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: {
      itemType: "payment",
      name: "",
      amount: undefined,
      dueDay: undefined,
      isRecurring: false,
      ...defaultValues,
    },
  });

  const itemType = watch("itemType");
  const selectedCategoryId = watch("categoryId");
  const selectedAccountId = watch("accountId");
  const isRecurring = watch("isRecurring");

  // Set default account when accounts are loaded
  useEffect(() => {
    if (accounts && !defaultValues?.accountId && !selectedAccountId && itemType === "payment") {
      const defaultAccount = accounts.find((acc) => acc.isDefault);
      if (defaultAccount) {
        setValue("accountId", defaultAccount.id);
      }
    }
  }, [accounts, defaultValues?.accountId, selectedAccountId, itemType, setValue]);

  const handleFormSubmit = async (data: FormValues) => {
    await onSubmit(data);
  };

  const isLoadingData = accountsLoading || categoriesLoading;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Item Type Selector */}
      <div className="space-y-2">
        <Label>Type</Label>
        <Tabs
          value={itemType}
          onValueChange={(value) => setValue("itemType", value as "limit" | "payment")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payment" className="gap-2">
              <Receipt className="h-4 w-4" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="limit" className="gap-2">
              <Target className="h-4 w-4" />
              Spending Limit
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-xs text-muted-foreground">
          {itemType === "payment"
            ? "A specific bill or payment to track (e.g., Rent, Subscription)"
            : "A spending limit for a category (e.g., Groceries: ₹5000)"}
        </p>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          {itemType === "payment" ? "Payment Name *" : "Budget Name *"}
        </Label>
        <Input
          id="name"
          placeholder={
            itemType === "payment"
              ? "e.g., Electricity Bill, Netflix"
              : "e.g., Groceries, Dining Out"
          }
          {...register("name")}
          className={cn(errors.name && "border-destructive")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">
          {itemType === "payment" ? "Amount (₹) *" : "Budget Limit (₹) *"}
        </Label>
        <Input
          id="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="₹0.00"
          {...register("amount", { valueAsNumber: true })}
          className={cn(errors.amount && "border-destructive")}
        />
        {errors.amount && (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        )}
      </div>

      {/* Due Day - Only for payment type */}
      {itemType === "payment" && (
        <div className="space-y-2">
          <Label htmlFor="dueDay">Due Day of Month</Label>
          <Input
            id="dueDay"
            type="number"
            inputMode="numeric"
            min="1"
            max="31"
            placeholder="1-31 (optional)"
            {...register("dueDay", { valueAsNumber: true })}
            className={cn(errors.dueDay && "border-destructive")}
          />
          {errors.dueDay && (
            <p className="text-sm text-destructive">{errors.dueDay.message}</p>
          )}
        </div>
      )}

      {/* Category */}
      <div className="space-y-2">
        <Label>Category {itemType === "limit" && "*"}</Label>
        <Select
          value={selectedCategoryId || "none"}
          onValueChange={(value) =>
            setValue("categoryId", value === "none" ? null : value)
          }
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
          {itemType === "limit"
            ? "Category to track spending for"
            : "Category for transaction when marking as paid"}
        </p>
      </div>

      {/* Default Account - Only for payment type */}
      {itemType === "payment" && (
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
      )}

      {/* Recurring Toggle */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
        <input
          type="checkbox"
          id="isRecurring"
          {...register("isRecurring")}
          className="h-4 w-4 rounded border-border"
        />
        <div className="flex-1">
          <Label htmlFor="isRecurring" className="font-medium cursor-pointer">
            Recurring
          </Label>
          <p className="text-xs text-muted-foreground">
            Automatically copy to next month&apos;s budget
          </p>
        </div>
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

