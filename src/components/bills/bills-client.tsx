"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Receipt, AlertCircle, Check, Clock } from "lucide-react";
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
import { BillCard } from "@/components/finance/bill-card";
import { BillForm } from "@/components/finance/bill-form";
import { BillPaymentDialog } from "@/components/finance/bill-payment-dialog";
import { MonthPicker } from "@/components/finance/month-picker";
import {
  useBills,
  useCreateBill,
  useUpdateBill,
  useDeleteBill,
  usePayBill,
  type RecurringBillWithRelations,
  type RecurringBillFormValues,
  type BillPaymentFormValues,
} from "@/hooks/use-bills";

export function BillsClient() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<RecurringBillWithRelations | null>(null);
  const [payingBill, setPayingBill] = useState<RecurringBillWithRelations | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const month = selectedMonth.getMonth() + 1;
  const year = selectedMonth.getFullYear();

  const { data: billsData, isLoading } = useBills({
    month,
    year,
    status: statusFilter === "all" ? undefined : (statusFilter as "paid" | "overdue" | "due_today" | "upcoming" | "pending"),
  });

  const createBill = useCreateBill();
  const updateBill = useUpdateBill();
  const deleteBill = useDeleteBill();
  const payBill = usePayBill();

  const handleCreateBill = async (data: RecurringBillFormValues) => {
    try {
      await createBill.mutateAsync(data);
      toast.success("Bill created successfully");
      setIsAddDialogOpen(false);
    } catch {
      toast.error("Failed to create bill");
    }
  };

  const handleUpdateBill = async (data: RecurringBillFormValues) => {
    if (!editingBill) return;
    try {
      await updateBill.mutateAsync({ id: editingBill.id, data });
      toast.success("Bill updated successfully");
      setEditingBill(null);
    } catch {
      toast.error("Failed to update bill");
    }
  };

  const handleDeleteBill = async (bill: RecurringBillWithRelations) => {
    if (!confirm(`Are you sure you want to delete "${bill.name}"?`)) return;
    try {
      await deleteBill.mutateAsync(bill.id);
      toast.success("Bill deleted successfully");
    } catch {
      toast.error("Failed to delete bill");
    }
  };

  const handlePayBill = async (data: BillPaymentFormValues) => {
    if (!payingBill) return;
    try {
      await payBill.mutateAsync({
        billId: payingBill.id,
        month,
        year,
        data,
      });
      toast.success("Bill marked as paid");
      setPayingBill(null);
    } catch {
      toast.error("Failed to mark bill as paid");
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

  const summary = billsData?.summary;
  const bills = billsData?.data || [];

  return (
    <div className="min-h-screen">
      <Header
        title="Bills"
        action={
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Bill
          </Button>
        }
      />

      <div className="px-4 py-6 md:px-6 space-y-6 max-w-4xl mx-auto">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bills</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="due_today">Due Today</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
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
                  <Receipt className="h-4 w-4" />
                  Total Due
                </div>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(summary.unpaidAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {summary.unpaid} bills
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
                  {formatCurrency(summary.paidAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {summary.paid} bills
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
                  {summary.overdue}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  bills overdue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="h-4 w-4" />
                  Total Bills
                </div>
                <p className="text-2xl font-bold mt-1">{summary.total}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatCurrency(summary.totalAmount)} total
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bills List */}
        <div className="space-y-3">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </>
          ) : bills.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No bills yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add your recurring monthly bills to track payments
                </p>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Your First Bill
                </Button>
              </CardContent>
            </Card>
          ) : (
            bills.map((bill) => (
              <BillCard
                key={bill.id}
                bill={bill}
                onEdit={() => setEditingBill(bill)}
                onDelete={() => handleDeleteBill(bill)}
                onMarkAsPaid={() => setPayingBill(bill)}
              />
            ))
          )}
        </div>
      </div>

      {/* Add Bill Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Bill</DialogTitle>
          </DialogHeader>
          <BillForm
            onSubmit={handleCreateBill}
            onCancel={() => setIsAddDialogOpen(false)}
            isLoading={createBill.isPending}
            submitLabel="Create Bill"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Bill Dialog */}
      <Dialog
        open={!!editingBill}
        onOpenChange={(open) => !open && setEditingBill(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Bill</DialogTitle>
          </DialogHeader>
          {editingBill && (
            <BillForm
              defaultValues={{
                name: editingBill.name,
                amount: parseFloat(String(editingBill.amount)),
                categoryId: editingBill.categoryId,
                accountId: editingBill.accountId,
                dueDay: editingBill.dueDay,
                notes: editingBill.notes,
                isActive: editingBill.isActive ?? true,
              }}
              onSubmit={handleUpdateBill}
              onCancel={() => setEditingBill(null)}
              isLoading={updateBill.isPending}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <BillPaymentDialog
        bill={payingBill}
        open={!!payingBill}
        onOpenChange={(open) => !open && setPayingBill(null)}
        onSubmit={handlePayBill}
        isLoading={payBill.isPending}
      />
    </div>
  );
}
