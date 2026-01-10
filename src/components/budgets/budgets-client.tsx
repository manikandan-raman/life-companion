"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Target, Receipt, AlertCircle, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/header";
import { BudgetItemCard } from "@/components/finance/budget-item-card";
import { BudgetItemForm } from "@/components/finance/budget-item-form";
import { BudgetPaymentDialog } from "@/components/finance/budget-payment-dialog";
import { MonthPicker } from "@/components/finance/month-picker";
import {
  useBudget,
  useCreateBudgetItem,
  useUpdateBudgetItem,
  useDeleteBudgetItem,
  usePayBudgetItem,
  type BudgetItemWithRelations,
  type BudgetItemFormValues,
  type BudgetItemPaymentFormValues,
} from "@/hooks/use-budgets";

export function BudgetsClient() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItemWithRelations | null>(null);
  const [payingItem, setPayingItem] = useState<BudgetItemWithRelations | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const month = selectedMonth.getMonth() + 1;
  const year = selectedMonth.getFullYear();

  const { data: budgetData, isLoading } = useBudget({
    month,
    year,
    itemType: typeFilter === "all" ? undefined : (typeFilter as "limit" | "payment"),
  });

  const createItem = useCreateBudgetItem();
  const updateItem = useUpdateBudgetItem();
  const deleteItem = useDeleteBudgetItem();
  const payItem = usePayBudgetItem();

  const handleCreateItem = async (data: BudgetItemFormValues) => {
    try {
      await createItem.mutateAsync({ ...data, month, year });
      toast.success("Budget item created successfully");
      setIsAddDialogOpen(false);
    } catch {
      toast.error("Failed to create budget item");
    }
  };

  const handleUpdateItem = async (data: BudgetItemFormValues) => {
    if (!editingItem) return;
    try {
      await updateItem.mutateAsync({ id: editingItem.id, data });
      toast.success("Budget item updated successfully");
      setEditingItem(null);
    } catch {
      toast.error("Failed to update budget item");
    }
  };

  const handleDeleteItem = async (item: BudgetItemWithRelations) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;
    try {
      await deleteItem.mutateAsync(item.id);
      toast.success("Budget item deleted successfully");
    } catch {
      toast.error("Failed to delete budget item");
    }
  };

  const handlePayItem = async (data: BudgetItemPaymentFormValues) => {
    if (!payingItem) return;
    try {
      await payItem.mutateAsync({
        itemId: payingItem.id,
        data,
      });
      toast.success("Payment recorded successfully");
      setPayingItem(null);
    } catch {
      toast.error("Failed to record payment");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const summary = budgetData?.summary;
  const items = budgetData?.data?.items || [];
  const limits = budgetData?.data?.limits || [];
  const payments = budgetData?.data?.payments || [];

  return (
    <div className="min-h-screen">
      <Header title="Budgets" />

      <div className="px-4 py-6 md:px-6 space-y-6 max-w-4xl mx-auto">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="limit">Spending Limits</SelectItem>
              <SelectItem value="payment">Payments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Target className="h-4 w-4" />
                  Budgeted
                </div>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(summary.limits.total)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {summary.limits.count} limit{summary.limits.count !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Receipt className="h-4 w-4" />
                  Payments Due
                </div>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(summary.payments.unpaidAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {summary.payments.unpaid} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Check className="h-4 w-4" />
                  Paid
                </div>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {formatCurrency(summary.payments.paidAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {summary.payments.paid} paid
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Overdue
                </div>
                <p className="text-2xl font-bold mt-1 text-destructive">
                  {summary.payments.overdue}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  payments overdue
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Budget Items List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No budget items yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add spending limits and payments to track your monthly budget
                </p>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Budget Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Spending Limits Section */}
              {(typeFilter === "all" || typeFilter === "limit") && limits.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Spending Limits
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      ({limits.length})
                    </span>
                  </div>
                  {limits.map((item) => (
                    <BudgetItemCard
                      key={item.id}
                      item={item}
                      onEdit={() => setEditingItem(item)}
                      onDelete={() => handleDeleteItem(item)}
                    />
                  ))}
                </div>
              )}

              {/* Payments Section */}
              {(typeFilter === "all" || typeFilter === "payment") && payments.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Payments
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      ({payments.length})
                    </span>
                  </div>
                  {payments.map((item) => (
                    <BudgetItemCard
                      key={item.id}
                      item={item}
                      onEdit={() => setEditingItem(item)}
                      onDelete={() => handleDeleteItem(item)}
                      onMarkAsPaid={() => setPayingItem(item)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Floating Action Button - Mobile */}
        <Button
          size="lg"
          onClick={() => setIsAddDialogOpen(true)}
          className="md:hidden fixed right-4 bottom-24 h-14 w-14 rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Budget Item</DialogTitle>
          </DialogHeader>
          <BudgetItemForm
            onSubmit={handleCreateItem}
            onCancel={() => setIsAddDialogOpen(false)}
            isLoading={createItem.isPending}
            submitLabel="Create Item"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Budget Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <BudgetItemForm
              defaultValues={{
                itemType: editingItem.itemType,
                categoryId: editingItem.categoryId,
                name: editingItem.name,
                amount: parseFloat(String(editingItem.amount)),
                dueDay: editingItem.dueDay,
                isRecurring: editingItem.isRecurring ?? false,
                accountId: editingItem.accountId,
                notes: editingItem.notes,
              }}
              onSubmit={handleUpdateItem}
              onCancel={() => setEditingItem(null)}
              isLoading={updateItem.isPending}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <BudgetPaymentDialog
        item={payingItem}
        open={!!payingItem}
        onOpenChange={(open) => !open && setPayingItem(null)}
        onSubmit={handlePayItem}
        isLoading={payItem.isPending}
      />
    </div>
  );
}

