"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { CategoryType } from "@/types";

interface BudgetProgressProps {
  type: CategoryType;
  label: string;
  current: number;
  goal: number;
  className?: string;
}

const typeColors: Record<CategoryType, { bg: string; progress: string; text: string }> = {
  income: {
    bg: "bg-income/10",
    progress: "[&>div]:bg-income",
    text: "text-income",
  },
  needs: {
    bg: "bg-needs/10",
    progress: "[&>div]:bg-needs",
    text: "text-needs",
  },
  wants: {
    bg: "bg-wants/10",
    progress: "[&>div]:bg-wants",
    text: "text-wants",
  },
  savings: {
    bg: "bg-savings/10",
    progress: "[&>div]:bg-savings",
    text: "text-savings",
  },
};

export function BudgetProgress({
  type,
  label,
  current,
  goal,
  className,
}: BudgetProgressProps) {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const isOverBudget = current > goal && type !== "income" && type !== "savings";
  const colors = typeColors[type];

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", colors.bg.replace("/10", ""))} 
               style={{ backgroundColor: `var(--${type})` }} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={cn(isOverBudget ? "text-destructive" : colors.text)}>
            {formatAmount(current)}
          </span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{formatAmount(goal)}</span>
        </div>
      </div>
      <Progress
        value={percentage}
        className={cn(
          "h-2",
          colors.bg,
          isOverBudget ? "[&>div]:bg-destructive" : colors.progress
        )}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{percentage.toFixed(0)}% used</span>
        {goal > current && (
          <span>{formatAmount(goal - current)} remaining</span>
        )}
        {isOverBudget && (
          <span className="text-destructive">
            {formatAmount(current - goal)} over budget
          </span>
        )}
      </div>
    </div>
  );
}

