"use client";

import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { iconMap } from "@/lib/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { TransactionWithRelations, TransactionType } from "@/types";
import { StickyNote, Circle } from "lucide-react";

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
  const [notesOpen, setNotesOpen] = useState(false);
  const transactionType = transaction.type as TransactionType;
  const isIncome = transactionType === "income";

  // Get icon name from subcategory first, then category
  const iconName =
    transaction.subCategory?.icon || transaction.category?.icon || "circle";

  const formatAmount = (value: number | string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const typeColors: Record<TransactionType, string> = {
    income: "bg-income/15 text-income",
    needs: "bg-needs/15 text-needs",
    wants: "bg-wants/15 text-wants",
    savings: "bg-savings/15 text-savings",
    investments: "bg-purple-500/15 text-purple-400",
  };

  // Main title: subcategory name if exists, otherwise category name
  const title =
    transaction.subCategory?.name ||
    transaction.category?.name ||
    "Uncategorized";

  // Show description if provided
  const hasDescription =
    transaction.description && transaction.description.trim().length > 0;
  const hasNotes = transaction.notes && transaction.notes.trim().length > 0;

  const handleNotesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotesOpen(!notesOpen);
  };

  // Get icon component - use Circle as fallback
  const Icon = iconMap[iconName] ?? Circle;

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
      <div className="absolute inset-0 bg-linear-to-br from-white/2 via-transparent to-transparent pointer-events-none" />

      <div className="relative flex items-center gap-4">
        {/* Icon */}
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-xl shrink-0 transition-all duration-200 group-hover:scale-105",
            typeColors[transactionType]
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          {/* Left side - Text content */}
          <div className="flex-1 min-w-0">
            {/* Subcategory/Category name as main title */}
            <p className="font-semibold text-[15px] text-foreground truncate leading-tight">
              {title}
            </p>

            {/* Meta row: Date + Account */}
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
              <span>
                {format(new Date(transaction.transactionDate), "MMM d")}
              </span>
              {transaction.account && (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="truncate max-w-[100px]">
                    {transaction.account.name}
                  </span>
                </>
              )}
            </div>

            {/* Description with notes icon inline */}
            {(hasDescription || hasNotes) && (
              <div className="flex items-center gap-1.5 mt-1.5">
                {hasDescription && (
                  <p className="text-xs text-muted-foreground/70 truncate">
                    {transaction.description}
                  </p>
                )}
                {!hasDescription && hasNotes && (
                  <span className="text-xs text-muted-foreground/50">
                    No description
                  </span>
                )}
                {hasNotes && (
                  <Popover open={notesOpen} onOpenChange={setNotesOpen}>
                    <PopoverTrigger asChild>
                      <button
                        onClick={handleNotesClick}
                        className="shrink-0 p-0.5 rounded hover:bg-muted/50 transition-colors text-muted-foreground/50 hover:text-muted-foreground"
                      >
                        <StickyNote className="h-3 w-3" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-72 p-3"
                      align="end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <StickyNote className="h-4 w-4 text-muted-foreground" />
                          Notes
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {transaction.notes}
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            )}
          </div>

          {/* Right side - Amount (vertically centered) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <p
              className={cn(
                "font-bold text-base tabular-nums text-right",
                isIncome ? "text-income" : "text-foreground"
              )}
            >
              {isIncome ? "+" : "-"}
              {formatAmount(transaction.amount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
