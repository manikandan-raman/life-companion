"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SummaryCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "income" | "expense" | "balance";
  className?: string;
}

export function SummaryCard({
  title,
  amount,
  subtitle,
  trend,
  trendValue,
  variant = "default",
  className,
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
    default: "",
    income: "border-income/20 bg-income/5",
    expense: "border-destructive/20 bg-destructive/5",
    balance: "border-primary/20 bg-primary/5",
  };

  const amountStyles = {
    default: "text-foreground",
    income: "text-income",
    expense: "text-destructive",
    balance: "text-primary",
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-income" : trend === "down" ? "text-destructive" : "text-muted-foreground";

  return (
    <Card className={cn("border", variantStyles[variant], className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={cn("text-2xl font-bold tracking-tight", amountStyles[variant])}>
              {formatAmount(amount)}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {trend && (
            <div className={cn("flex items-center gap-1 text-xs", trendColor)}>
              <TrendIcon className="h-3 w-3" />
              {trendValue && <span>{trendValue}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

