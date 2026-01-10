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
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BudgetPaymentDialog } from "@/components/finance/budget-payment-dialog";
import {
  useBudget,
  usePayBudgetItem,
  type BudgetItemWithRelations,
  type BudgetItemPaymentFormValues,
} from "@/hooks/use-budgets";
import { cn } from "@/lib/utils";
import { ENTITY_COLORS } from "@/lib/colors";

export function BudgetWidget() {
  const [payingItem, setPayingItem] = useState<BudgetItemWithRelations | null>(null);

  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const { data: budgetData, isLoading } = useBudget({ month, year });
  const payItem = usePayBudgetItem();

  const formatAmount = (value: number | string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
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

  // Get unpaid payment items, prioritizing overdue and due today
  const unpaidPayments = (budgetData?.data?.payments || [])
    .filter((i) => i.status !== "paid")
    .sort((a, b) => {
      const priority: Record<string, number> = { overdue: 0, due_today: 1, upcoming: 2, unpaid: 3, paid: 4 };
      return (priority[a.status] ?? 3) - (priority[b.status] ?? 3);
    })
    .slice(0, 3);

  const summary = budgetData?.summary;

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
              <Target className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold">Monthly Budget</h3>
              {summary && summary.payments.overdue > 0 && (
                <Badge variant="destructive" className="text-xs py-0 h-5">
                  {summary.payments.overdue} overdue
                </Badge>
              )}
            </div>
            <Link href="/budgets">
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
                  Payments due:{" "}
                  <span className="text-foreground font-medium">
                    {formatAmount(summary.payments.unpaidAmount)}
                  </span>
                </span>
              </div>
              <span className="text-muted-foreground">
                {summary.payments.paid}/{summary.payments.paid + summary.payments.unpaid} paid
              </span>
            </div>
          )}

          {/* Payments List */}
          {unpaidPayments.length === 0 ? (
            <div className="text-center py-6">
              <Check className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">
                All payments completed for this month!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {unpaidPayments.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl bg-muted/30 transition-colors hover:bg-muted/50",
                    item.status === "overdue" && "bg-destructive/10 hover:bg-destructive/15",
                    item.status === "due_today" && "bg-orange-500/10 hover:bg-orange-500/15"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${ENTITY_COLORS.indigo.hex}20`,
                      }}
                    >
                      {item.status === "overdue" ? (
                        <AlertCircle
                          className="h-4 w-4"
                          style={{ color: ENTITY_COLORS.red.hex }}
                        />
                      ) : item.status === "due_today" ? (
                        <Clock
                          className="h-4 w-4"
                          style={{ color: ENTITY_COLORS.orange.hex }}
                        />
                      ) : (
                        <Receipt
                          className="h-4 w-4"
                          style={{ color: ENTITY_COLORS.indigo.hex }}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      {item.dueDay && (
                        <p className="text-xs text-muted-foreground">
                          Due on {item.dueDay}
                          {item.dueDay === 1 || item.dueDay === 21 || item.dueDay === 31
                            ? "st"
                            : item.dueDay === 2 || item.dueDay === 22
                            ? "nd"
                            : item.dueDay === 3 || item.dueDay === 23
                            ? "rd"
                            : "th"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "font-semibold text-sm",
                        item.status === "overdue" && "text-destructive"
                      )}
                    >
                      {formatAmount(item.amount)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => setPayingItem(item)}
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
      <BudgetPaymentDialog
        item={payingItem}
        open={!!payingItem}
        onOpenChange={(open) => !open && setPayingItem(null)}
        onSubmit={handlePayItem}
        isLoading={payItem.isPending}
      />
    </>
  );
}

