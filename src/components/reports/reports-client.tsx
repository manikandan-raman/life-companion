"use client";

import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { Download, FileText, Loader2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Header } from "@/components/layout/header";
import { MonthPicker } from "@/components/finance/month-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useReportData, useDownloadReport } from "@/hooks/use-reports";

// Format currency
function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

// Calculate percentage safely
function calculatePercentage(current: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min(100, Math.round((current / goal) * 100));
}

export function ReportsClient() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfMonth(new Date()));
  
  const month = selectedDate.getMonth() + 1;
  const year = selectedDate.getFullYear();

  const { summary, isLoading, isError } = useReportData({ month, year });
  const { downloadReport, isDownloading } = useDownloadReport();

  const handleDownload = () => {
    downloadReport(month, year);
  };

  const hasData = summary && summary.totalIncome > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header title="Reports" />

      <main className="px-4 py-6 md:px-6 space-y-6 max-w-4xl mx-auto pb-24">
        {/* Month Picker */}
        <div className="flex items-center justify-center">
          <MonthPicker
            value={selectedDate}
            onChange={setSelectedDate}
            monthsToShow={24}
            futureMonths={0}
          />
        </div>

        {/* Report Card */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Monthly Financial Report
                  </CardTitle>
                  <CardDescription>
                    {format(selectedDate, "MMMM yyyy")}
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={handleDownload}
                disabled={isDownloading || isLoading}
                className="gap-2"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {isLoading ? (
              <ReportSkeleton />
            ) : isError ? (
              <div className="text-center py-8">
                <p className="text-destructive">Failed to load report data</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Please try again later
                </p>
              </div>
            ) : !hasData ? (
              <div className="text-center py-12">
                <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">
                  No financial data for {format(selectedDate, "MMMM yyyy")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add transactions to generate a report
                </p>
              </div>
            ) : (
              <ReportPreview summary={summary} />
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg h-fit">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">About the Report</p>
                <p className="text-xs text-muted-foreground">
                  The monthly report includes a complete financial overview, budget analysis
                  based on the 50/30/20 rule, spending breakdown by type and category,
                  detailed transaction list, and key insights for the selected month.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Report Preview Component
function ReportPreview({ summary }: { summary: NonNullable<ReturnType<typeof useReportData>["summary"]> }) {
  const budgetItems = [
    {
      label: "Needs",
      current: summary.needs.current,
      goal: summary.needs.goal,
      target: "50%",
      color: "bg-blue-500",
    },
    {
      label: "Wants",
      current: summary.wants.current,
      goal: summary.wants.goal,
      target: "30%",
      color: "bg-amber-500",
    },
    {
      label: "Savings",
      current: summary.savings.current,
      goal: summary.savings.goal,
      target: "10%",
      color: "bg-violet-500",
    },
    {
      label: "Investments",
      current: summary.investments.current,
      goal: summary.investments.goal,
      target: "10%",
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Income
            </span>
          </div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(summary.totalIncome)}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Expenses
            </span>
          </div>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(summary.totalExpense)}
          </p>
        </div>

        <div
          className={`p-4 rounded-lg ${
            summary.balance >= 0
              ? "bg-blue-500/10 border border-blue-500/20"
              : "bg-orange-500/10 border border-orange-500/20"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Balance
            </span>
          </div>
          <p
            className={`text-xl font-bold ${
              summary.balance >= 0
                ? "text-blue-600 dark:text-blue-400"
                : "text-orange-600 dark:text-orange-400"
            }`}
          >
            {formatCurrency(summary.balance)}
          </p>
        </div>
      </div>

      {/* Budget Progress */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Budget Analysis (50/30/20 Rule)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {budgetItems.map((item) => {
            const percentage = calculatePercentage(item.current, item.goal);
            const isOverTarget = item.current > item.goal && item.goal > 0;
            // For needs/wants, going over budget is bad (red)
            // For savings/investments, going over target is good (keep original color)
            const isExpenseCategory = item.label === "Needs" || item.label === "Wants";
            const showWarning = isOverTarget && isExpenseCategory;
            return (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground text-xs">
                    Target: {item.target}
                  </span>
                </div>
                <Progress
                  value={percentage}
                  className={`h-2 ${showWarning ? "[&>div]:bg-red-500" : ""}`}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Spent: {formatCurrency(item.current)}
                  </span>
                  <span>
                    Goal: {formatCurrency(item.goal)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spending Breakdown Preview */}
      {summary.spendingByCategory && summary.spendingByCategory.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Top Spending Categories
          </h3>
          <div className="space-y-2">
            {summary.spendingByCategory.slice(0, 5).map((category, index) => {
              const percentage =
                summary.totalExpense > 0
                  ? ((category.amount / summary.totalExpense) * 100).toFixed(1)
                  : "0";
              return (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <span className="text-sm">{category.name}</span>
                  <div className="text-sm text-right">
                    <span className="font-medium">
                      {formatCurrency(category.amount)}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Download CTA */}
      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground text-center">
          Download the full PDF report for detailed transaction history and insights
        </p>
      </div>
    </div>
  );
}

// Skeleton Component
function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div>
        <Skeleton className="h-4 w-32 mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
