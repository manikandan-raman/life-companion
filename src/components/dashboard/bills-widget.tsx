"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Receipt,
  ChevronRight,
  AlertCircle,
  Check,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BillPaymentDialog } from "@/components/finance/bill-payment-dialog";
import {
  useBills,
  usePayBill,
  type RecurringBillWithRelations,
  type BillPaymentFormValues,
} from "@/hooks/use-bills";
import { cn } from "@/lib/utils";
import { DEFAULT_COLORS, ENTITY_COLORS } from "@/lib/colors";

export function BillsWidget() {
  const [payingBill, setPayingBill] = useState<RecurringBillWithRelations | null>(null);

  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const { data: billsData, isLoading } = useBills({ month, year });
  const payBill = usePayBill();

  const formatAmount = (value: number | string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
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

  // Get unpaid bills, prioritizing overdue and due today
  const unpaidBills = (billsData?.data || [])
    .filter((b) => b.status !== "paid")
    .sort((a, b) => {
      const priority: Record<string, number> = { overdue: 0, due_today: 1, upcoming: 2, pending: 3, paid: 4 };
      return (priority[a.status] ?? 3) - (priority[b.status] ?? 3);
    })
    .slice(0, 3);

  const summary = billsData?.summary;

  if (isLoading) {
    return (
      <div className="card-modern rounded-2xl overflow-hidden">
        <div className="p-5 pb-3 border-b border-white/5">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="p-5 space-y-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card-modern rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-3 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold">Monthly Bills</h3>
              {summary && summary.overdue > 0 && (
                <Badge variant="destructive" className="text-xs py-0 h-5">
                  {summary.overdue} overdue
                </Badge>
              )}
            </div>
            <Link href="/bills">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground -mr-2"
              >
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {/* Summary Row */}
          {summary && (
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">
                  Due this month:{" "}
                  <span className="text-foreground font-medium">
                    {formatAmount(summary.unpaidAmount)}
                  </span>
                </span>
              </div>
              <span className="text-muted-foreground">
                {summary.paid}/{summary.total} paid
              </span>
            </div>
          )}

          {/* Bills List */}
          {unpaidBills.length === 0 ? (
            <div className="text-center py-6">
              <Check className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">
                All bills paid for this month!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {unpaidBills.map((bill) => (
                <div
                  key={bill.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl bg-muted/30 transition-colors hover:bg-muted/50",
                    bill.status === "overdue" && "bg-destructive/10 hover:bg-destructive/15",
                    bill.status === "due_today" && "bg-orange-500/10 hover:bg-orange-500/15"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${DEFAULT_COLORS.bill}20`,
                      }}
                    >
                      {bill.status === "overdue" ? (
                        <AlertCircle
                          className="h-4 w-4"
                          style={{ color: ENTITY_COLORS.red.hex }}
                        />
                      ) : bill.status === "due_today" ? (
                        <Clock
                          className="h-4 w-4"
                          style={{ color: ENTITY_COLORS.orange.hex }}
                        />
                      ) : (
                        <Receipt
                          className="h-4 w-4"
                          style={{ color: DEFAULT_COLORS.bill }}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{bill.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Due on {bill.dueDay}
                        {bill.dueDay === 1 || bill.dueDay === 21 || bill.dueDay === 31
                          ? "st"
                          : bill.dueDay === 2 || bill.dueDay === 22
                          ? "nd"
                          : bill.dueDay === 3 || bill.dueDay === 23
                          ? "rd"
                          : "th"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "font-semibold text-sm",
                        bill.status === "overdue" && "text-destructive"
                      )}
                    >
                      {formatAmount(bill.amount)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => setPayingBill(bill)}
                    >
                      Pay
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Dialog */}
      <BillPaymentDialog
        bill={payingBill}
        open={!!payingBill}
        onOpenChange={(open) => !open && setPayingBill(null)}
        onSubmit={handlePayBill}
        isLoading={payBill.isPending}
      />
    </>
  );
}
