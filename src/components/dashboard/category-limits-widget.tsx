"use client";

import Link from "next/link";
import { Target, ChevronRight, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBudget, type BudgetItemWithRelations } from "@/hooks/use-budgets";
import { cn } from "@/lib/utils";
import { ENTITY_COLORS } from "@/lib/colors";
import { getIcon } from "@/lib/icons";

export function CategoryLimitsWidget() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const { data: budgetData, isLoading } = useBudget({ month, year });

  const formatAmount = (value: number | string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  // Get spending limit items (max 4 for widget display)
  const limits = (budgetData?.data?.limits || []).slice(0, 4);
  const totalLimits = budgetData?.data?.limits?.length || 0;
  const overBudgetCount =
    budgetData?.data?.limits?.filter((item) => {
      const budgetAmount = parseFloat(String(item.amount));
      return item.actualSpent > budgetAmount;
    }).length || 0;

  if (isLoading) {
    return (
      <div className="card-modern rounded-2xl overflow-hidden">
        <div className="p-5 pb-3 border-b border-white/5">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="p-5 space-y-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </div>
    );
  }

  // Don't render if no limits are set
  if (totalLimits === 0) {
    return (
      <div className="card-modern rounded-2xl overflow-hidden">
        <div className="p-5 pb-3 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold">Category Limits</h3>
            </div>
            <Link href="/budgets">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground -mr-2"
              >
                Set up
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="p-5">
          <div className="text-center py-6">
            <Target className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No spending limits set for this month
            </p>
            <Link href="/budgets">
              <Button size="sm" variant="outline" className="mt-3">
                Add Spending Limit
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-modern rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold">Category Limits</h3>
            {overBudgetCount > 0 && (
              <Badge variant="destructive" className="text-xs py-0 h-5">
                {overBudgetCount} over
              </Badge>
            )}
          </div>
          <Link href="/budgets?filter=limit">
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
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            {totalLimits} limit{totalLimits !== 1 ? "s" : ""} set
          </span>
          {overBudgetCount > 0 ? (
            <span className="text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              {overBudgetCount} over budget
            </span>
          ) : (
            <span className="text-green-500 flex items-center gap-1">
              <Check className="h-3.5 w-3.5" />
              All within budget
            </span>
          )}
        </div>

        {/* Limits List */}
        <div className="space-y-3">
          {limits.map((item) => (
            <LimitItem key={item.id} item={item} formatAmount={formatAmount} />
          ))}
        </div>

        {/* Show more indicator if there are more limits */}
        {totalLimits > 4 && (
          <Link href="/budgets?filter=limit">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-foreground text-xs"
            >
              +{totalLimits - 4} more limit{totalLimits - 4 !== 1 ? "s" : ""}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

interface LimitItemProps {
  item: BudgetItemWithRelations;
  formatAmount: (value: number | string) => string;
}

function LimitItem({ item, formatAmount }: LimitItemProps) {
  const budgetAmount = parseFloat(String(item.amount));
  const spentAmount = item.actualSpent || 0;
  const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
  const isOverBudget = spentAmount > budgetAmount;
  const remaining = budgetAmount - spentAmount;

  // Get category icon
  const categoryIcon = item.category?.icon || "Target";
  const CategoryIcon = getIcon(categoryIcon);

  return (
    <div
      className={cn(
        "p-3 rounded-xl bg-muted/30 transition-colors hover:bg-muted/50",
        isOverBudget && "bg-destructive/10 hover:bg-destructive/15"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              backgroundColor: isOverBudget
                ? `${ENTITY_COLORS.red.hex}20`
                : `${ENTITY_COLORS.blue.hex}20`,
            }}
          >
            <CategoryIcon
              className="h-3.5 w-3.5"
              style={{
                color: isOverBudget
                  ? ENTITY_COLORS.red.hex
                  : ENTITY_COLORS.blue.hex,
              }}
            />
          </div>
          <span className="font-medium text-sm truncate">
            {item.name}
          </span>
        </div>
        <div className="text-right shrink-0">
          <span
            className={cn(
              "font-semibold text-sm",
              isOverBudget && "text-destructive"
            )}
          >
            {formatAmount(spentAmount)}
          </span>
          <span className="text-muted-foreground text-xs ml-1">
            / {formatAmount(budgetAmount)}
          </span>
        </div>
      </div>

      <Progress
        value={Math.min(percentage, 100)}
        className={cn("h-2", isOverBudget && "[&>div]:bg-destructive")}
      />

      <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
        <span>{Math.round(percentage)}% used</span>
        <span className={cn(isOverBudget && "text-destructive")}>
          {isOverBudget
            ? `${formatAmount(Math.abs(remaining))} over`
            : `${formatAmount(remaining)} left`}
        </span>
      </div>
    </div>
  );
}
