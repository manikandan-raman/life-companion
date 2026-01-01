"use client";

import { DonutChart } from "@tremor/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SpendingByType, SpendingByCategory } from "@/hooks/use-transactions";

interface SpendingChartsProps {
  spendingByType: SpendingByType[];
  spendingByCategory: SpendingByCategory[];
  isLoading?: boolean;
}

// Custom tooltip component for better dark mode styling
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
  valueFormatter: (value: number) => string;
}

function CustomTooltip({ payload, active, colorMap, valueFormatter }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0];
  const name = data.payload.name;
  const value = data.value;
  const color = colorMap[name] || data.payload.fill || "#6b7280";

  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium text-popover-foreground">{name}</span>
      </div>
      <p className="text-sm text-muted-foreground mt-1 pl-5">
        {valueFormatter(value)}
      </p>
    </div>
  );
}

// Tremor color names for budget types
const TYPE_COLORS: Record<string, string> = {
  Needs: "blue",
  Wants: "amber",
  Savings: "violet",
};

// Hex colors for legend display
const TYPE_COLORS_HEX: Record<string, string> = {
  Needs: "#3b82f6",
  Wants: "#f59e0b",
  Savings: "#8b5cf6",
};

// Tremor color names for categories
const CATEGORY_COLORS = [
  "blue",
  "amber",
  "violet",
  "emerald",
  "pink",
  "cyan",
  "yellow",
  "indigo",
  "rose",
  "teal",
];

// Hex colors for category legend display
const CATEGORY_COLORS_HEX = [
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#10b981", // emerald
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#eab308", // yellow
  "#6366f1", // indigo
  "#f43f5e", // rose
  "#14b8a6", // teal
];

export function SpendingCharts({
  spendingByType,
  spendingByCategory,
  isLoading = false,
}: SpendingChartsProps) {
  // Calculate total expense from type data
  const totalExpense = spendingByType.reduce((sum, item) => sum + item.amount, 0);
  const hasData = totalExpense > 0;

  // Add colors to category data if not already present
  const categoryDataWithColors = spendingByCategory.map((item, index) => ({
    ...item,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    colorHex: CATEGORY_COLORS_HEX[index % CATEGORY_COLORS_HEX.length],
  }));

  // Custom value formatter
  const valueFormatter = (value: number) => {
    return `₹${value.toLocaleString("en-IN")}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            Spending Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            Spending Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No spending data for this month
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">
          Spending Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* By Budget Type */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-4 text-center">
              By Budget Type
            </h4>
            <DonutChart
              data={spendingByType}
              category="amount"
              index="name"
              valueFormatter={valueFormatter}
              colors={spendingByType.map(
                (item) => TYPE_COLORS[item.name] || "gray"
              )}
              showLabel={true}
              label={valueFormatter(totalExpense)}
              className="h-48 [&_text]:fill-foreground"
              customTooltip={(props) => (
                <CustomTooltip
                  {...props}
                  colorMap={TYPE_COLORS_HEX}
                  valueFormatter={valueFormatter}
                />
              )}
            />
            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {spendingByType.map((item) => {
                const percentage = ((item.amount / totalExpense) * 100).toFixed(
                  0
                );
                return (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: TYPE_COLORS_HEX[item.name] || "#6b7280",
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {item.name} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By Category */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-4 text-center">
              By Category
            </h4>
            <DonutChart
              data={categoryDataWithColors}
              category="amount"
              index="name"
              valueFormatter={valueFormatter}
              colors={categoryDataWithColors.map((item) => item.color)}
              showLabel={true}
              label={valueFormatter(totalExpense)}
              className="h-48 [&_text]:fill-foreground"
              customTooltip={(props) => {
                // Create a color map for categories
                const categoryColorMap = Object.fromEntries(
                  categoryDataWithColors.map((item) => [item.name, item.colorHex])
                );
                return (
                  <CustomTooltip
                    {...props}
                    colorMap={categoryColorMap}
                    valueFormatter={valueFormatter}
                  />
                );
              }}
            />
            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {categoryDataWithColors.slice(0, 5).map((item) => {
                const percentage = ((item.amount / totalExpense) * 100).toFixed(
                  0
                );
                return (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.colorHex }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {item.name} ({percentage}%)
                    </span>
                  </div>
                );
              })}
              {categoryDataWithColors.length > 5 && (
                <span className="text-xs text-muted-foreground">
                  +{categoryDataWithColors.length - 5} more
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
