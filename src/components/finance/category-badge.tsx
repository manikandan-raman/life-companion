"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { TransactionType } from "@/types";
import { TRANSACTION_TYPE_LABELS } from "@/types";

interface CategoryBadgeProps {
  type: TransactionType;
  name?: string;
  className?: string;
}

const typeStyles: Record<TransactionType, string> = {
  income: "bg-income/15 text-income border-transparent hover:bg-income/25",
  needs: "bg-needs/15 text-needs border-transparent hover:bg-needs/25",
  wants: "bg-wants/15 text-wants border-transparent hover:bg-wants/25",
  savings: "bg-savings/15 text-savings border-transparent hover:bg-savings/25",
  investments: "bg-savings/15 text-savings border-transparent hover:bg-savings/25",
};

export function CategoryBadge({ type, name, className }: CategoryBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", typeStyles[type], className)}
    >
      {name || TRANSACTION_TYPE_LABELS[type]}
    </Badge>
  );
}
