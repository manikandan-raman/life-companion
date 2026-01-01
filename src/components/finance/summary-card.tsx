"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SummaryCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "income" | "expense" | "balance";
  className?: string;
  style?: React.CSSProperties;
}

export function SummaryCard({
  title,
  amount,
  subtitle,
  trend,
  trendValue,
  variant = "default",
  className,
  style,
}: SummaryCardProps) {
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const variantStyles = {
    default: "card-modern",
    income: "card-modern card-income",
    expense: "card-modern card-expense",
    balance: "card-modern card-balance",
  };

  const amountStyles = {
    default: "text-foreground",
    income: "text-income",
    expense: "text-destructive",
    balance: "text-primary",
  };

  const iconBgStyles = {
    default: "bg-muted/50",
    income: "bg-income/15",
    expense: "bg-destructive/15",
    balance: "bg-primary/15",
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-income" : trend === "down" ? "text-destructive" : "text-muted-foreground";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-4 transition-all duration-200 active:scale-[0.98] cursor-pointer",
        variantStyles[variant],
        className
      )}
      style={style}
    >
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className={cn("text-2xl font-bold tracking-tight", amountStyles[variant])}>
            {formatAmount(amount)}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground/80">{subtitle}</p>
          )}
        </div>
        
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
              iconBgStyles[variant],
              trendColor
            )}
          >
            <TrendIcon className="h-3.5 w-3.5" />
            {trendValue && <span className="font-medium">{trendValue}</span>}
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <div
        className={cn(
          "absolute bottom-0 left-4 right-4 h-[2px] rounded-full opacity-50",
          variant === "income" && "bg-income",
          variant === "expense" && "bg-destructive",
          variant === "balance" && "bg-primary",
          variant === "default" && "bg-border"
        )}
      />
    </div>
  );
}
