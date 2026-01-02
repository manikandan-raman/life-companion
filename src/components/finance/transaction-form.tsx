"use client";

import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { transactionSchema } from "@/schemas/transaction";
import { useCategories, useAccounts } from "@/hooks/use-accounts";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/types";
import { TRANSACTION_TYPE_LABELS } from "@/types";

// Define form values type explicitly
interface FormValues {
  type: TransactionType;
  amount: number;
  description?: string | null;
  notes?: string | null;
  categoryId: string;
  subCategoryId?: string | null;
  accountId?: string | null;
  transactionDate: Date;
  tagIds?: string[];
}

interface TransactionFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const TRANSACTION_TYPES: TransactionType[] = ["income", "needs", "wants", "savings", "investments"];

export function TransactionForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Save Transaction",
}: TransactionFormProps) {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(transactionSchema) as never,
    defaultValues: {
      type: defaultValues?.type || "needs",
      amount: defaultValues?.amount ?? undefined,
      description: defaultValues?.description || "",
      notes: defaultValues?.notes || "",
      categoryId: defaultValues?.categoryId || "",
      subCategoryId: defaultValues?.subCategoryId || "",
      accountId: defaultValues?.accountId || "",
      transactionDate: defaultValues?.transactionDate || new Date(),
      tagIds: defaultValues?.tagIds || [],
    },
  });

  const selectedDate = watch("transactionDate");
  const selectedCategoryId = watch("categoryId");
  const selectedSubCategoryId = watch("subCategoryId");
  const selectedType = watch("type");
  const currentAccountId = watch("accountId");

  // Set default account when accounts are loaded and no account is selected
  useEffect(() => {
    if (accounts && !defaultValues?.accountId && !currentAccountId) {
      const defaultAccount = accounts.find((acc) => acc.isDefault);
      if (defaultAccount) {
        setValue("accountId", defaultAccount.id);
      }
    }
  }, [accounts, defaultValues?.accountId, currentAccountId, setValue]);

  // Get sub-categories for the selected category
  const selectedCategory = categories?.find((c) => c.id === selectedCategoryId);
  const subCategoriesForCategory = selectedCategory?.subCategories || [];

  // Reset sub-category when category changes
  const handleCategoryChange = (categoryId: string) => {
    setValue("categoryId", categoryId);
    setValue("subCategoryId", "");
  };

  const handleFormSubmit: SubmitHandler<FormValues> = async (data) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Type & Account - Side by Side */}
      <div className="grid grid-cols-2 gap-4">
        {/* Transaction Type */}
        <div className="space-y-2 min-w-0">
          <Label>Type</Label>
          <Select
            value={selectedType}
            onValueChange={(value) => setValue("type", value as TransactionType)}
          >
            <SelectTrigger className={cn("w-full", errors.type && "border-destructive")}>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {TRANSACTION_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {TRANSACTION_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-destructive">{errors.type.message}</p>
          )}
        </div>

        {/* Account */}
        <div className="space-y-2 min-w-0">
          <Label>Account</Label>
          <Select
            value={watch("accountId") || "none"}
            onValueChange={(value) =>
              setValue("accountId", value === "none" ? null : value)
            }
            disabled={accountsLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No account</SelectItem>
              {accounts?.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            ₹
          </span>
          <Input
            id="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="0.00"
            className={cn("pl-8 text-lg", errors.amount && "border-destructive")}
            {...register("amount", { valueAsNumber: true })}
          />
        </div>
        {errors.amount && (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        )}
      </div>

      {/* Category & Sub-category - Side by Side */}
      <div className="grid grid-cols-2 gap-4">
        {/* Category */}
        <div className="space-y-2 min-w-0">
          <Label>Category</Label>
          <Select
            value={selectedCategoryId}
            onValueChange={handleCategoryChange}
            disabled={categoriesLoading}
          >
            <SelectTrigger className={cn("w-full", errors.categoryId && "border-destructive")}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-sm text-destructive">{errors.categoryId.message}</p>
          )}
        </div>

        {/* Sub-category */}
        <div className="space-y-2 min-w-0">
          <Label>Sub-category</Label>
          <Select
            value={selectedSubCategoryId || "none"}
            onValueChange={(value) =>
              setValue("subCategoryId", value === "none" ? null : value)
            }
            disabled={!selectedCategoryId || subCategoriesForCategory.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={selectedCategoryId ? "Select" : "Select category first"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {subCategoriesForCategory.map((subCategory) => (
                <SelectItem key={subCategory.id} value={subCategory.id}>
                  {subCategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground",
                errors.transactionDate && "border-destructive"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setValue("transactionDate", date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.transactionDate && (
          <p className="text-sm text-destructive">
            {errors.transactionDate.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          placeholder="What was this for?"
          {...register("description")}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Input
          id="notes"
          placeholder="Any additional notes..."
          {...register("notes")}
        />
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
