"use client";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
  ChevronRight,
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
  style?: React.CSSProperties;
}

export function TransactionCard({
  transaction,
  onClick,
  className,
  style,
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
    income: "bg-income/15 text-income ring-income/20",
    needs: "bg-needs/15 text-needs ring-needs/20",
    wants: "bg-wants/15 text-wants ring-wants/20",
    savings: "bg-savings/15 text-savings ring-savings/20",
  };

  const iconGlowColors: Record<CategoryType, string> = {
    income: "shadow-[0_0_12px_rgba(34,197,94,0.3)]",
    needs: "shadow-[0_0_12px_rgba(59,130,246,0.3)]",
    wants: "shadow-[0_0_12px_rgba(251,191,36,0.3)]",
    savings: "shadow-[0_0_12px_rgba(139,92,246,0.3)]",
  };

  return (
    <div
      className={cn(
        "card-modern group relative overflow-hidden rounded-2xl p-4 transition-all duration-200 active:scale-[0.98] cursor-pointer",
        className
      )}
      onClick={onClick}
      style={style}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none" />

      <div className="relative flex items-center gap-4">
        {/* Icon with glow effect */}
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-2xl shrink-0 ring-1 transition-all duration-200 group-hover:scale-105",
            typeColors[categoryType],
            "group-hover:" + iconGlowColors[categoryType]
          )}
        >
          <IconComponent className="h-5 w-5" strokeWidth={2} />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold truncate text-[15px] text-foreground">
                  {transaction.description}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <CategoryBadge
                  type={categoryType}
                  name={transaction.category?.name}
                  className="text-[10px] py-0.5 h-[20px] px-2 rounded-md"
                />
                <span className="text-[11px] text-muted-foreground/70">
                  {format(new Date(transaction.transactionDate), "MMM d")}
                </span>
                {transaction.account && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span className="text-[11px] text-muted-foreground/70 truncate max-w-[60px]">
                      {transaction.account.name}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <p
                  className={cn(
                    "font-bold text-base tabular-nums",
                    isIncome ? "text-income" : "text-foreground"
                  )}
                >
                  {isIncome ? "+" : "-"}
                  {formatAmount(transaction.amount)}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors" />
            </div>
          </div>
          {transaction.notes && (
            <p className="text-xs text-muted-foreground/60 mt-2 line-clamp-1 pl-0.5">
              {transaction.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
