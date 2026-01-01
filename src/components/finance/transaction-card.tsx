"use client";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryBadge } from "./category-badge";
import type { TransactionWithRelations, CategoryType } from "@/types";
import {
  Briefcase,
  Gift,
  TrendingUp,
  PlusCircle,
  Home,
  ShoppingCart,
  Zap,
  Car,
  Shield,
  Heart,
  CreditCard,
  Film,
  Utensils,
  ShoppingBag,
  Tv,
  MoreHorizontal,
  PiggyBank,
  Landmark,
  BarChart,
  Lock,
  LifeBuoy,
  Circle,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  briefcase: Briefcase,
  gift: Gift,
  "trending-up": TrendingUp,
  "plus-circle": PlusCircle,
  home: Home,
  "shopping-cart": ShoppingCart,
  zap: Zap,
  car: Car,
  shield: Shield,
  heart: Heart,
  "credit-card": CreditCard,
  film: Film,
  utensils: Utensils,
  "shopping-bag": ShoppingBag,
  tv: Tv,
  "more-horizontal": MoreHorizontal,
  "piggy-bank": PiggyBank,
  landmark: Landmark,
  "bar-chart": BarChart,
  lock: Lock,
  "life-buoy": LifeBuoy,
  circle: Circle,
};

interface TransactionCardProps {
  transaction: TransactionWithRelations;
  onClick?: () => void;
  className?: string;
}

export function TransactionCard({
  transaction,
  onClick,
  className,
}: TransactionCardProps) {
  const categoryType = (transaction.category?.type || "needs") as CategoryType;
  const isIncome = categoryType === "income";
  const IconComponent = iconMap[transaction.category?.icon || "circle"] || Circle;

  const formatAmount = (value: number | string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const typeColors: Record<CategoryType, string> = {
    income: "bg-income/10 text-income",
    needs: "bg-needs/10 text-needs",
    wants: "bg-wants/10 text-wants",
    savings: "bg-savings/10 text-savings",
  };

  return (
    <Card
      className={cn(
        "border-border/50 hover:border-border/80 hover:shadow-sm transition-all cursor-pointer group",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className={cn(
              "flex items-center justify-center w-11 h-11 rounded-xl shrink-0 transition-transform group-hover:scale-105",
              typeColors[categoryType]
            )}
          >
            <IconComponent className="h-5 w-5" />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate text-[15px]">
                    {transaction.description}
                  </p>
                  <CategoryBadge
                    type={categoryType}
                    name={transaction.category?.name}
                    className="text-[11px] py-0 h-[22px] px-2 shrink-0"
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[11px] text-muted-foreground">
                    {format(new Date(transaction.transactionDate), "MMM d, yyyy")}
                  </span>
                  {transaction.account && (
                    <>
                      <span className="text-[11px] text-muted-foreground/60">•</span>
                      <span className="text-[11px] text-muted-foreground truncate max-w-[80px]">
                        {transaction.account.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p
                  className={cn(
                    "font-semibold text-[15px] tabular-nums",
                    isIncome ? "text-income" : "text-foreground"
                  )}
                >
                  {isIncome ? "+" : "-"}
                  {formatAmount(transaction.amount)}
                </p>
              </div>
            </div>
            {transaction.notes && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-1 opacity-70">
                {transaction.notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

