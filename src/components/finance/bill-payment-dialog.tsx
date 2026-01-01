"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { billPaymentSchema } from "@/schemas/bill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAccounts } from "@/hooks/use-accounts";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { RecurringBillWithRelations } from "@/hooks/use-bills";

// Transaction type options for bill payments (excluding income)
const BILL_TYPE_OPTIONS = [
  { value: "needs", label: "Needs" },
  { value: "wants", label: "Wants" },
  { value: "savings", label: "Savings" },
  { value: "investments", label: "Investments" },
] as const;

type BillTransactionType = "needs" | "wants" | "savings" | "investments";

// Define form values explicitly to avoid type issues with z.coerce.date()
interface FormValues {
  type: BillTransactionType;
  paidDate: Date;
  paidAmount: number;
  accountId: string;
}

interface BillPaymentDialogProps {
  bill: RecurringBillWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => Promise<void>;
  isLoading?: boolean;
}

export function BillPaymentDialog({
  bill,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: BillPaymentDialogProps) {
  const { data: accounts, isLoading: accountsLoading } = useAccounts();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormValues>({
    resolver: zodResolver(billPaymentSchema) as any,
    defaultValues: {
      type: "needs",
      paidDate: new Date(),
      paidAmount: bill ? parseFloat(String(bill.amount)) : 0,
      accountId: bill?.accountId || "",
    },
  });

  // Reset form when bill changes
  const billAmount = bill ? parseFloat(String(bill.amount)) : 0;
  const billAccountId = bill?.accountId || "";

  // Update form when bill changes
  if (open && bill) {
    const currentAmount = watch("paidAmount");
    const currentAccountId = watch("accountId");
    
    // Only update if values are different (to avoid infinite loop)
    if (currentAmount !== billAmount && currentAmount === 0) {
      setValue("paidAmount", billAmount);
    }
    if (currentAccountId !== billAccountId && currentAccountId === "") {
      setValue("accountId", billAccountId);
    }
  }

  const selectedType = watch("type");
  const selectedDate = watch("paidDate");
  const selectedAccountId = watch("accountId");

  const handleFormSubmit = async (data: FormValues) => {
    await onSubmit(data);
    reset();
    onOpenChange(false);
  };

  const formatAmount = (value: number | string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  if (!bill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark Bill as Paid</DialogTitle>
          <DialogDescription>
            Recording payment for <strong>{bill.name}</strong> ({formatAmount(bill.amount)})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Transaction Type *</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue("type", value as BillTransactionType)}
            >
              <SelectTrigger className={cn(errors.type && "border-destructive")}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {BILL_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Paid Date */}
          <div className="space-y-2">
            <Label>Payment Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground",
                    errors.paidDate && "border-destructive"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setValue("paidDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.paidDate && (
              <p className="text-sm text-destructive">{errors.paidDate.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="paidAmount">Amount Paid (₹) *</Label>
            <Input
              id="paidAmount"
              type="number"
              step="0.01"
              placeholder="₹0.00"
              {...register("paidAmount", { valueAsNumber: true })}
              className={cn(errors.paidAmount && "border-destructive")}
            />
            {errors.paidAmount && (
              <p className="text-sm text-destructive">{errors.paidAmount.message}</p>
            )}
          </div>

          {/* Account */}
          <div className="space-y-2">
            <Label>Paid From Account *</Label>
            <Select
              value={selectedAccountId}
              onValueChange={(value) => setValue("accountId", value)}
              disabled={accountsLoading}
            >
              <SelectTrigger className={cn(errors.accountId && "border-destructive")}>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts?.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: acc.color || "#3b82f6" }}
                      />
                      {acc.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.accountId && (
              <p className="text-sm text-destructive">{errors.accountId.message}</p>
            )}
          </div>

          {/* Info */}
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            A transaction will be created in your transactions list for this payment.
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || accountsLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
