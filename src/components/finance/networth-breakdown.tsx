"use client";

import { DonutChart, BarChart } from "@tremor/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { NetWorthSummary } from "@/types";

interface NetWorthBreakdownProps {
  data: NetWorthSummary | null;
  isLoading?: boolean;
}

// Tremor color mapping
const ASSET_COLORS = ["emerald", "teal", "cyan", "blue", "indigo"];
const LIABILITY_COLORS = ["rose", "orange", "amber"];

const ASSET_COLORS_HEX: Record<string, string> = {
  "Bank Accounts": "#10b981",
  Cash: "#14b8a6",
  Investments: "#06b6d4",
  "Fixed Deposits": "#3b82f6",
  Retirement: "#6366f1",
};

const LIABILITY_COLORS_HEX: Record<string, string> = {
  "Credit Cards": "#f43f5e",
  "Home Loan": "#f97316",
  "Personal Loan": "#f59e0b",
  "Other Loans": "#eab308",
};

export function NetWorthBreakdown({
  data,
  isLoading = false,
}: NetWorthBreakdownProps) {
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasAssets = data.assetsByType.length > 0;
  const hasLiabilities = data.liabilitiesByType.length > 0;

  // Prepare bar chart data for comparison
  const comparisonData = [
    { name: "Assets", value: data.totalAssets },
    { name: "Liabilities", value: data.totalLiabilities },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">
          Net Worth Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="space-y-4">
              <BarChart
                className="h-48 [&_text]:fill-foreground"
                data={comparisonData}
                index="name"
                categories={["value"]}
                colors={["blue"]}
                valueFormatter={valueFormatter}
                showLegend={false}
                showAnimation={true}
              />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-emerald-500/10">
                  <p className="text-xs text-muted-foreground">Total Assets</p>
                  <p className="text-lg font-semibold text-emerald-600">
                    {valueFormatter(data.totalAssets)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-rose-500/10">
                  <p className="text-xs text-muted-foreground">
                    Total Liabilities
                  </p>
                  <p className="text-lg font-semibold text-rose-600">
                    {valueFormatter(data.totalLiabilities)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <p className="text-xs text-muted-foreground">Net Worth</p>
                  <p
                    className={`text-lg font-semibold ${
                      data.netWorth >= 0 ? "text-blue-600" : "text-rose-600"
                    }`}
                  >
                    {valueFormatter(data.netWorth)}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assets" className="mt-4">
            {hasAssets ? (
              <div>
                <DonutChart
                  className="h-48 [&_text]:fill-foreground"
                  data={data.assetsByType}
                  category="value"
                  index="type"
                  colors={ASSET_COLORS.slice(0, data.assetsByType.length)}
                  valueFormatter={valueFormatter}
                  showLabel={true}
                  label={valueFormatter(data.totalAssets)}
                  showAnimation={true}
                />
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {data.assetsByType.map((item) => {
                    const percentage = (
                      (item.value / data.totalAssets) *
                      100
                    ).toFixed(0);
                    return (
                      <div key={item.type} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              ASSET_COLORS_HEX[item.type] || "#6b7280",
                          }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {item.type} ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No assets recorded
              </p>
            )}
          </TabsContent>

          <TabsContent value="liabilities" className="mt-4">
            {hasLiabilities ? (
              <div>
                <DonutChart
                  className="h-48 [&_text]:fill-foreground"
                  data={data.liabilitiesByType}
                  category="value"
                  index="type"
                  colors={LIABILITY_COLORS.slice(
                    0,
                    data.liabilitiesByType.length
                  )}
                  valueFormatter={valueFormatter}
                  showLabel={true}
                  label={valueFormatter(data.totalLiabilities)}
                  showAnimation={true}
                />
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {data.liabilitiesByType.map((item) => {
                    const percentage = (
                      (item.value / data.totalLiabilities) *
                      100
                    ).toFixed(0);
                    return (
                      <div key={item.type} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              LIABILITY_COLORS_HEX[item.type] || "#6b7280",
                          }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {item.type} ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No liabilities recorded
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

