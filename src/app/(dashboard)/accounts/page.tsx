"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { AccountCard } from "@/components/finance/account-card";
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
import { useAccounts, useCreateAccount, useDeleteAccount } from "@/hooks/use-accounts";
import { accountSchema } from "@/schemas/account";
import { cn } from "@/lib/utils";

interface FormValues {
  name: string;
  type: "bank" | "cash" | "credit_card";
  balance: number;
  color: string;
  icon: string;
  isDefault: boolean;
}

const colorOptions = [
  { value: "#10b981", label: "Emerald" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#ec4899", label: "Pink" },
  { value: "#06b6d4", label: "Cyan" },
];

export default function AccountsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: accounts, isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const deleteAccount = useDeleteAccount();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(accountSchema) as never,
    defaultValues: {
      name: "",
      type: "bank",
      balance: 0,
      color: "#3b82f6",
      icon: "wallet",
      isDefault: false,
    },
  });

  const selectedColor = watch("color");
  const selectedType = watch("type");

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      await createAccount.mutateAsync(data);
      toast.success("Account created successfully");
      reset();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create account"
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return;
    
    try {
      await deleteAccount.mutateAsync(id);
      toast.success("Account deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete account"
      );
    }
  };

  // Calculate total balance from currentBalance (computed by DB view)
  const totalBalance = accounts?.reduce(
    (sum, acc) => sum + parseFloat(String(acc.currentBalance)),
    0
  ) || 0;

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
      <Header title="Accounts" />

      <div className="px-4 py-6 md:px-6 space-y-6 max-w-4xl mx-auto">
        {/* Total Balance */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
            <p className="text-3xl font-bold text-primary">
              {formatAmount(totalBalance)}
            </p>
          </CardContent>
        </Card>

        {/* Accounts List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Your Accounts</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Account</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Account Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., HDFC Bank"
                      {...register("name")}
                      className={cn(errors.name && "border-destructive")}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <Select
                      value={selectedType}
                      onValueChange={(v) => setValue("type", v as FormValues["type"])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">Bank Account</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="balance">Initial Balance</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ₹
                      </span>
                      <Input
                        id="balance"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-8"
                        {...register("balance", { valueAsNumber: true })}
                      />
                    </div>
                  </div>

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
                            selectedColor === color.value && "ring-2 ring-offset-2 ring-primary scale-110"
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
                    disabled={createAccount.isPending}
                  >
                    {createAccount.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : accounts?.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No accounts yet. Add your first account to start tracking.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {accounts?.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onDelete={() => handleDelete(account.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
