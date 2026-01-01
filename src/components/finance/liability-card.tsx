"use client";

import { cn } from "@/lib/utils";
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
import { Home, CreditCard, Wallet, MoreVertical } from "lucide-react";
import type { Liability, LiabilityType } from "@/types";

const typeLabels: Record<LiabilityType, string> = {
  home_loan: "Home Loan",
  personal_loan: "Personal Loan",
  other: "Other Loan",
};

interface LiabilityCardProps {
  liability: Liability;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddPayment?: () => void;
  className?: string;
}

export function LiabilityCard({
  liability,
  onEdit,
  onDelete,
  onAddPayment,
  className,
}: LiabilityCardProps) {
  const formatAmount = (value: number | string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const principalAmount = parseFloat(String(liability.principalAmount));
  const outstandingBalance = parseFloat(String(liability.outstandingBalance));
  const amountPaid = principalAmount - outstandingBalance;
  const progressPercentage = principalAmount > 0 
    ? Math.round((amountPaid / principalAmount) * 100) 
    : 0;

  const getIcon = () => {
    switch (liability.type as LiabilityType) {
      case "home_loan":
        return (
          <Home
            className="h-5 w-5"
            style={{ color: liability.color || "#ef4444" }}
          />
        );
      case "personal_loan":
        return (
          <Wallet
            className="h-5 w-5"
            style={{ color: liability.color || "#ef4444" }}
          />
        );
      default:
        return (
          <CreditCard
            className="h-5 w-5"
            style={{ color: liability.color || "#ef4444" }}
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
              style={{ backgroundColor: `${liability.color}20` }}
            >
              {getIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{liability.name}</h3>
                <Badge variant="secondary" className="text-xs py-0 h-5">
                  {liability.interestRate}% p.a.
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {typeLabels[liability.type as LiabilityType]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="font-semibold text-lg text-red-500">
                {formatAmount(outstandingBalance)}
              </p>
              {liability.emiAmount && (
                <p className="text-xs text-muted-foreground">
                  EMI: {formatAmount(liability.emiAmount)}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onAddPayment}>
                  Add Payment
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
        
        {/* Progress Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Paid: {formatAmount(amountPaid)}</span>
            <span>Principal: {formatAmount(principalAmount)}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            {progressPercentage}% completed
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

