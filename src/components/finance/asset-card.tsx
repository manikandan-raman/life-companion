"use client";

import { cn } from "@/lib/utils";
import { DEFAULT_COLORS } from "@/lib/colors";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Landmark,
  PiggyBank,
  Building2,
  Coins,
} from "lucide-react";
import type { Asset, AssetType, AssetSubtype } from "@/types";

const typeLabels: Record<AssetType, string> = {
  investment: "Investment",
  fixed_deposit: "Fixed Deposit",
  retirement: "Retirement",
};

const subtypeLabels: Record<AssetSubtype, string> = {
  mutual_fund: "Mutual Fund",
  stock: "Stock",
  etf: "ETF",
  fd: "FD",
  rd: "RD",
  epf: "EPF",
  ppf: "PPF",
  nps: "NPS",
  other: "Other",
};

interface AssetCardProps {
  asset: Asset;
  onEdit?: () => void;
  onDelete?: () => void;
  onUpdateValue?: () => void;
  className?: string;
}

export function AssetCard({
  asset,
  onEdit,
  onDelete,
  onUpdateValue,
  className,
}: AssetCardProps) {
  const formatAmount = (value: number | string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const currentValue = parseFloat(String(asset.currentValue));
  const purchaseValue = parseFloat(String(asset.purchaseValue));
  const returns = currentValue - purchaseValue;
  const returnsPercentage =
    purchaseValue > 0 ? ((returns / purchaseValue) * 100).toFixed(1) : "0.0";
  const isPositive = returns >= 0;

  const getIcon = () => {
    const iconColor = asset.color || DEFAULT_COLORS.asset;
    switch (asset.type as AssetType) {
      case "investment":
        return (
          <TrendingUp
            className="h-5 w-5"
            style={{ color: iconColor }}
          />
        );
      case "fixed_deposit":
        return (
          <Landmark
            className="h-5 w-5"
            style={{ color: iconColor }}
          />
        );
      case "retirement":
        return (
          <PiggyBank
            className="h-5 w-5"
            style={{ color: iconColor }}
          />
        );
      default:
        return (
          <Coins
            className="h-5 w-5"
            style={{ color: iconColor }}
          />
        );
    }
  };

  return (
    <Card className={cn("border-border/50", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ backgroundColor: `${asset.color}20` }}
            >
              {getIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{asset.name}</h3>
                <Badge variant="secondary" className="text-xs py-0 h-5">
                  {subtypeLabels[asset.subtype as AssetSubtype]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {typeLabels[asset.type as AssetType]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="font-semibold text-lg">{formatAmount(currentValue)}</p>
              <div
                className={cn(
                  "flex items-center justify-end gap-1 text-xs",
                  isPositive ? "text-emerald-600" : "text-red-500"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {isPositive ? "+" : ""}
                  {returnsPercentage}%
                </span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onUpdateValue}>
                  Update Value
                </DropdownMenuItem>
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
        </div>
        {purchaseValue > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50 flex justify-between text-xs text-muted-foreground">
            <span>Invested: {formatAmount(purchaseValue)}</span>
            <span
              className={isPositive ? "text-emerald-600" : "text-red-500"}
            >
              {isPositive ? "Gain" : "Loss"}: {formatAmount(Math.abs(returns))}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

