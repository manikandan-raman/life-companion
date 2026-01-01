"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Landmark, CreditCard, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Account, AccountType } from "@/types";

const typeLabels: Record<AccountType, string> = {
  cash: "Cash",
  bank: "Bank",
  credit_card: "Credit Card",
};

interface AccountCardProps {
  account: Account;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function AccountCard({
  account,
  onEdit,
  onDelete,
  className,
}: AccountCardProps) {
  const formatAmount = (value: number | string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const getIcon = () => {
    switch (account.type as AccountType) {
      case "cash":
        return <Wallet className="h-5 w-5" style={{ color: account.color || "#3b82f6" }} />;
      case "bank":
        return <Landmark className="h-5 w-5" style={{ color: account.color || "#3b82f6" }} />;
      case "credit_card":
        return <CreditCard className="h-5 w-5" style={{ color: account.color || "#3b82f6" }} />;
      default:
        return <Wallet className="h-5 w-5" style={{ color: account.color || "#3b82f6" }} />;
    }
  };

  return (
    <Card className={cn("border-border/50", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ backgroundColor: `${account.color}20` }}
            >
              {getIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{account.name}</h3>
                {account.isDefault && (
                  <Badge variant="secondary" className="text-xs py-0 h-5">
                    Default
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {typeLabels[account.type as AccountType]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-lg">
              {formatAmount(account.balance)}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
      </CardContent>
    </Card>
  );
}
