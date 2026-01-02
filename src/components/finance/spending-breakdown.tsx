"use client";

import { useState, useMemo } from "react";
import { DonutChart } from "@tremor/react";
import { ChevronRight, ArrowLeft, TrendingDown, Layers } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ENTITY_COLORS } from "@/lib/colors";
import { cn } from "@/lib/utils";
import type {
  CategorySpending,
  SubCategorySpending,
} from "@/hooks/use-spending-breakdown";

interface SpendingBreakdownProps {
  categories: CategorySpending[];
  totalSpending: number;
  isLoading?: boolean;
}

// Chart colors palette
const CHART_COLORS = [
  "blue",
  "emerald",
  "violet",
  "amber",
  "pink",
  "cyan",
  "indigo",
  "rose",
  "teal",
  "orange",
];

const CHART_COLORS_HEX = [
  ENTITY_COLORS.blue.hex,
  ENTITY_COLORS.emerald.hex,
  ENTITY_COLORS.violet.hex,
  ENTITY_COLORS.amber.hex,
  ENTITY_COLORS.pink.hex,
  ENTITY_COLORS.cyan.hex,
  ENTITY_COLORS.indigo.hex,
  "#f43f5e", // rose
  "#14b8a6", // teal
  "#f97316", // orange
];

// Custom tooltip
interface CustomTooltipProps {
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      name: string;
      amount: number;
      fill?: string;
    };
  }>;
  active?: boolean;
  colorMap: Record<string, string>;
}

function CustomTooltip({ payload, active, colorMap }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0];
  const name = data.payload.name;
  const value = data.value;
  const color = colorMap[name] || data.payload.fill || ENTITY_COLORS.gray.hex;

  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium text-popover-foreground">
          {name}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mt-1 pl-5">
        ₹{value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

// Category/Subcategory item component
interface SpendingItemProps {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon?: string | null;
  hasChildren?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
}

function SpendingItem({
  name,
  amount,
  percentage,
  color,
  hasChildren,
  onClick,
  isSelected,
}: SpendingItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200",
        "hover:bg-muted/50 active:scale-[0.98]",
        isSelected && "bg-muted/70 ring-1 ring-primary/20",
        !onClick && "cursor-default"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">
            {percentage.toFixed(1)}% of total
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground tabular-nums">
          ₹{amount.toLocaleString("en-IN")}
        </span>
        {hasChildren && (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </button>
  );
}

export function SpendingBreakdown({
  categories,
  totalSpending,
  isLoading = false,
}: SpendingBreakdownProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<CategorySpending | null>(null);

  // Prepare chart data and colors
  const { chartData, colorMap, colors } = useMemo(() => {
    const data = selectedCategory
      ? selectedCategory.subCategories.map((sub) => ({
          name: sub.name,
          amount: sub.amount,
        }))
      : categories.map((cat) => ({
          name: cat.name,
          amount: cat.amount,
        }));

    const colorMapObj: Record<string, string> = {};
    const colorList: string[] = [];

    data.forEach((item, index) => {
      const colorHex = CHART_COLORS_HEX[index % CHART_COLORS_HEX.length];
      colorMapObj[item.name] = colorHex;
      colorList.push(CHART_COLORS[index % CHART_COLORS.length]);
    });

    return { chartData: data, colorMap: colorMapObj, colors: colorList };
  }, [categories, selectedCategory]);

  // Get items to display (categories or subcategories)
  const displayItems = useMemo(() => {
    if (selectedCategory) {
      return selectedCategory.subCategories;
    }
    return categories;
  }, [categories, selectedCategory]);

  // Calculate display total
  const displayTotal = selectedCategory
    ? selectedCategory.amount
    : totalSpending;

  // Format amount
  const formatAmount = (value: number) => {
    return `₹${value.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  // Handle category click
  const handleCategoryClick = (category: CategorySpending) => {
    if (category.subCategories.length > 0) {
      setSelectedCategory(category);
    }
  };

  // Handle back button
  const handleBack = () => {
    setSelectedCategory(null);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl overflow-hidden bg-card border border-border/50">
        <div className="p-4 pb-3 border-b border-border/30">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="p-4 space-y-4">
          <Skeleton className="h-48 rounded-xl mx-auto max-w-[200px]" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!categories.length || totalSpending === 0) {
    return (
      <div className="rounded-2xl overflow-hidden bg-card border border-border/50">
        <div className="p-4 pb-3 border-b border-border/30 flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Spending Breakdown
          </h3>
        </div>
        <div className="p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
            <Layers className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No spending data for this month
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Add transactions to see your spending breakdown
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden bg-card border border-border/50">
      {/* Header */}
      <div className="p-4 pb-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedCategory ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="h-7 px-2 -ml-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Spending Breakdown
                </h3>
              </>
            )}
          </div>
          {selectedCategory && (
            <span className="text-sm font-medium text-foreground">
              {selectedCategory.name}
            </span>
          )}
        </div>
      </div>

      {/* Category Pills - Quick filter when viewing all categories */}
      {!selectedCategory && categories.length > 3 && (
        <div className="px-4 pt-3">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {categories.slice(0, 6).map((cat, index) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                    "bg-muted/50 hover:bg-muted transition-colors",
                    "border border-border/50 hover:border-border"
                  )}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        CHART_COLORS_HEX[index % CHART_COLORS_HEX.length],
                    }}
                  />
                  {cat.name}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {/* Chart Section */}
      <div className="p-4 pt-2">
        <div className="relative animate-fade-in">
          <DonutChart
            data={chartData}
            category="amount"
            index="name"
            valueFormatter={(value) => `₹${value.toLocaleString("en-IN")}`}
            colors={colors}
            showLabel={true}
            label={formatAmount(displayTotal)}
            className="h-52 [&_text]:fill-foreground"
            customTooltip={(props) => (
              <CustomTooltip {...props} colorMap={colorMap} />
            )}
          />
        </div>

        {/* Legend / Items List */}
        <div className="mt-4 space-y-1">
          {displayItems.map((item, index) => {
            const isCategory = "subCategories" in item;
            const hasChildren =
              isCategory &&
              (item as CategorySpending).subCategories.length > 0;

            return (
              <div
                key={item.id}
                className="animate-card-enter"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <SpendingItem
                  name={item.name}
                  amount={item.amount}
                  percentage={item.percentage}
                  color={CHART_COLORS_HEX[index % CHART_COLORS_HEX.length]}
                  icon={item.icon}
                  hasChildren={hasChildren}
                  onClick={
                    hasChildren
                      ? () => handleCategoryClick(item as CategorySpending)
                      : undefined
                  }
                  isSelected={
                    selectedCategory?.id === item.id && !("subCategories" in item)
                  }
                />
              </div>
            );
          })}
        </div>

        {/* Summary footer */}
        <div className="mt-4 pt-3 border-t border-border/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {selectedCategory
                ? `${selectedCategory.subCategories.length} subcategories`
                : `${categories.length} categories`}
            </span>
            <span className="font-semibold text-foreground">
              Total: {formatAmount(displayTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

