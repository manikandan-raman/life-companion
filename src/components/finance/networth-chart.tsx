"use client";

import { AreaChart } from "@tremor/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { NetWorthHistory } from "@/types";

interface NetWorthChartProps {
  data: NetWorthHistory[];
  isLoading?: boolean;
}

export function NetWorthChart({ data, isLoading = false }: NetWorthChartProps) {
  const valueFormatter = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    }
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value.toLocaleString("en-IN")}`;
  };

  // Format dates for display
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
    }),
    "Net Worth": item.netWorth,
    Assets: item.totalAssets,
    Liabilities: item.totalLiabilities,
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            Net Worth Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            Net Worth Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No historical data available. Create snapshots to track your net
            worth over time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Net Worth Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <AreaChart
          className="h-64 [&_text]:fill-foreground"
          data={chartData}
          index="date"
          categories={["Assets", "Net Worth", "Liabilities"]}
          colors={["emerald", "blue", "rose"]}
          valueFormatter={valueFormatter}
          showLegend={true}
          showGridLines={true}
          showAnimation={true}
          curveType="monotone"
        />
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Assets</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-muted-foreground">Net Worth</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-xs text-muted-foreground">Liabilities</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

