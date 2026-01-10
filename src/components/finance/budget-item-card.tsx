"use client";

import { cn } from "@/lib/utils";
import { ENTITY_COLORS } from "@/lib/colors";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Check,
  AlertCircle,
  Clock,
  Calendar,
  Wallet,
  Target,
  Receipt,
  Circle,
  Repeat,
} from "lucide-react";
import { getIcon } from "@/lib/icons";
import type { BudgetItemStatus } from "@/types";
import type { BudgetItemWithRelations } from "@/hooks/use-budgets";

const statusConfig: Record<
  BudgetItemStatus,
  {
    label: string;
    variant: "default" | "destructive" | "secondary" | "outline";
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  paid: { label: "Paid", variant: "default", icon: Check },
  unpaid: { label: "Pending", variant: "outline", icon: Clock },
  overdue: { label: "Overdue", variant: "destructive", icon: AlertCircle },
  due_today: { label: "Due Today", variant: "destructive", icon: Clock },
  upcoming: { label: "Upcoming", variant: "secondary", icon: Calendar },
};

interface BudgetItemCardProps {
  item: BudgetItemWithRelations;
  onEdit?: () => void;
  onDelete?: () => void;
  onMarkAsPaid?: () => void;
  className?: string;
}

export function BudgetItemCard({
  item,
  onEdit,
  onDelete,
  onMarkAsPaid,
  className,
}: BudgetItemCardProps) {
  const formatAmount = (value: number | string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const isLimit = item.itemType === "limit";
  const isPayment = item.itemType === "payment";
  const status = statusConfig[item.status];
  const StatusIcon = status.icon;

  // Get category icon
  const categoryIcon = item.category?.icon || (isLimit ? "Target" : "Receipt");
  const CategoryIcon = getIcon(categoryIcon);

  // Colors based on type
  const itemColor = isLimit ? ENTITY_COLORS.blue.hex : ENTITY_COLORS.indigo.hex;

  // Progress calculation for limits
  const budgetAmount = parseFloat(String(item.amount));
  const spentAmount = item.actualSpent || 0;
  const progressPercentage = isLimit && budgetAmount > 0
    ? Math.min((spentAmount / budgetAmount) * 100, 100)
    : 0;
  const isOverBudget = spentAmount > budgetAmount;

  const getDueText = () => {
    if (!item.dueDay) return null;
    const day = item.dueDay;
    const suffix =
      day === 1 || day === 21 || day === 31
        ? "st"
        : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
        ? "rd"
        : "th";
    return `${day}${suffix}`;
  };

  return (
    <Card
      className={cn(
        "border-border/50 transition-all hover:shadow-md overflow-hidden py-0 gap-0",
        isPayment && item.status === "overdue" && "border-destructive/50",
        isPayment && item.status === "due_today" && "border-orange-500/50",
        className
      )}
    >
      <CardContent className="p-4">
        {/* Main content row */}
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
            style={{
              backgroundColor: `${itemColor}15`,
            }}
          >
            <span style={{ color: itemColor }}>
              <CategoryIcon className="h-5 w-5" />
            </span>
          </div>

          {/* Info section */}
          <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 items-center">
            {/* Row 1: Name + Badges | Amount */}
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-semibold text-sm truncate max-w-[120px] md:max-w-[200px] lg:max-w-none">
                {item.name}
              </h3>
              {isPayment && (
                <Badge
                  variant={status.variant}
                  className="text-[10px] px-1.5 py-0 h-[18px] gap-0.5 shrink-0"
                >
                  <StatusIcon className="h-2.5 w-2.5" />
                  {status.label}
                </Badge>
              )}
              {isLimit && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-[18px] gap-0.5 shrink-0"
                >
                  <Target className="h-2.5 w-2.5" />
                  Limit
                </Badge>
              )}
              {item.isRecurring && (
                <Repeat className="h-3 w-3 text-muted-foreground shrink-0" />
              )}
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "font-bold text-base tabular-nums",
                  isPayment && item.status === "paid" && "text-muted-foreground line-through",
                  isPayment && item.status === "overdue" && "text-destructive",
                  isLimit && isOverBudget && "text-destructive"
                )}
              >
                {formatAmount(item.amount)}
              </p>
            </div>

            {/* Row 2: Category + Due | Spent/Paid info */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {item.category && (
                <>
                  <span className="truncate max-w-[80px] md:max-w-[150px]">
                    {item.category.name}
                  </span>
                  {isPayment && item.dueDay && <span className="text-border">•</span>}
                </>
              )}
              {isPayment && item.dueDay && (
                <span className="whitespace-nowrap">Due on {getDueText()}</span>
              )}
              {isLimit && (
                <span className={cn(isOverBudget && "text-destructive")}>
                  {formatAmount(spentAmount)} spent
                </span>
              )}
            </div>
            <div className="text-right">
              {isPayment && item.paidDate ? (
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  Paid{" "}
                  {new Date(item.paidDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              ) : isLimit ? (
                <p className={cn(
                  "text-xs whitespace-nowrap",
                  isOverBudget ? "text-destructive" : "text-muted-foreground"
                )}>
                  {formatAmount(budgetAmount - spentAmount)} {isOverBudget ? "over" : "left"}
                </p>
              ) : (
                <div className="h-4" />
              )}
            </div>
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 -mr-1"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isPayment && item.status !== "paid" && (
                <DropdownMenuItem onClick={onMarkAsPaid}>
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Paid
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Progress bar for limits */}
        {isLimit && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <Progress 
              value={progressPercentage} 
              className={cn(
                "h-2",
                isOverBudget && "[&>div]:bg-destructive"
              )}
            />
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
              <span>{Math.round(progressPercentage)}% used</span>
              <span>{formatAmount(budgetAmount)} budget</span>
            </div>
          </div>
        )}

        {/* Account info footer for payments */}
        {isPayment && item.account && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground">
            <Wallet className="h-3.5 w-3.5" />
            <span className="truncate">Pay from: {item.account.name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

