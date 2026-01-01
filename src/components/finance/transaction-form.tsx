"use client";

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
import type { CategoryType } from "@/types";

// Define form values type explicitly
interface FormValues {
  amount: number;
  description: string;
  notes?: string | null;
  categoryId: string;
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

const categoryTypeLabels: Record<CategoryType, string> = {
  income: "Income",
  needs: "Needs",
  wants: "Wants",
  savings: "Savings",
};

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
      amount: defaultValues?.amount || 0,
      description: defaultValues?.description || "",
      notes: defaultValues?.notes || "",
      categoryId: defaultValues?.categoryId || "",
      accountId: defaultValues?.accountId || "",
      transactionDate: defaultValues?.transactionDate || new Date(),
      tagIds: defaultValues?.tagIds || [],
    },
  });

  const selectedDate = watch("transactionDate");
  const selectedCategoryId = watch("categoryId");

  // Group categories by type
  const groupedCategories = categories?.reduce(
    (acc, cat) => {
      const type = cat.type as CategoryType;
      if (!acc[type]) acc[type] = [];
      acc[type].push(cat);
      return acc;
    },
    {} as Record<CategoryType, typeof categories>
  );

  const handleFormSubmit: SubmitHandler<FormValues> = async (data) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="What was this for?"
          className={cn(errors.description && "border-destructive")}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={selectedCategoryId}
          onValueChange={(value) => setValue("categoryId", value)}
          disabled={categoriesLoading}
        >
          <SelectTrigger className={cn(errors.categoryId && "border-destructive")}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {groupedCategories &&
              (Object.keys(groupedCategories) as CategoryType[]).map((type) => (
                <div key={type}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {categoryTypeLabels[type]}
                  </div>
                  {groupedCategories[type]?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </div>
              ))}
          </SelectContent>
        </Select>
        {errors.categoryId && (
          <p className="text-sm text-destructive">{errors.categoryId.message}</p>
        )}
      </div>

      {/* Account */}
      <div className="space-y-2">
        <Label>Account (Optional)</Label>
        <Select
          value={watch("accountId") || "none"}
          onValueChange={(value) =>
            setValue("accountId", value === "none" ? undefined : value)
          }
          disabled={accountsLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an account" />
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
