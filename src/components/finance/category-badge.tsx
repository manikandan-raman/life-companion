"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { CategoryType } from "@/types";

interface CategoryBadgeProps {
  type: CategoryType;
  name?: string;
  className?: string;
}

const typeStyles: Record<CategoryType, string> = {
  income: "bg-income/15 text-income border-transparent hover:bg-income/25",
  needs: "bg-needs/15 text-needs border-transparent hover:bg-needs/25",
  wants: "bg-wants/15 text-wants border-transparent hover:bg-wants/25",
  savings: "bg-savings/15 text-savings border-transparent hover:bg-savings/25",
};

const typeLabels: Record<CategoryType, string> = {
  income: "Income",
  needs: "Needs",
  wants: "Wants",
  savings: "Savings",
};

export function CategoryBadge({ type, name, className }: CategoryBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", typeStyles[type], className)}
    >
      {name || typeLabels[type]}
    </Badge>
  );
}

