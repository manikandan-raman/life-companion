"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { startOfMonth, endOfMonth } from "date-fns";
import { Plus, ChevronRight, Settings2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { BudgetProgress } from "@/components/finance/budget-progress";
import { TransactionCard } from "@/components/finance/transaction-card";
import { MonthPicker } from "@/components/finance/month-picker";
import { BillsWidget } from "@/components/dashboard/bills-widget";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSummary } from "@/hooks/use-transactions";
import { useNetWorth } from "@/hooks/use-networth";
import type { TransactionType } from "@/types";

export function DashboardClient() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);

  const { data: summary, isLoading } = useSummary({
    startDate,
    endDate,
  });

  const { data: netWorth, isLoading: isLoadingNetWorth } = useNetWorth();

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate donut chart percentage
  const spentPercentage = useMemo(() => {
    if (!summary?.totalIncome || summary.totalIncome === 0) return 0;
    const percentage = (summary.totalExpense / summary.totalIncome) * 100;
    return Math.min(percentage, 100);
  }, [summary]);

  // SVG donut chart parameters
  const size = 140;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const spentOffset = circumference - (spentPercentage / 100) * circumference;
  const remainingOffset =
    circumference - ((100 - spentPercentage) / 100) * circumference;

  return (
    <div className="min-h-screen bg-background">
      <Header variant="greeting" />

      <div className="px-4 py-5 md:px-6 space-y-6 max-w-4xl mx-auto">
        {/* Month Selector - Compact pill style */}
        <div className="flex items-center justify-center animate-card-enter">
          <MonthPicker value={currentDate} onChange={setCurrentDate} />
        </div>

        {/* Consolidated Summary Card with Donut Chart */}
        <div className="animate-card-enter" style={{ animationDelay: "50ms" }}>
          {isLoading ? (
            <Skeleton className="h-48 rounded-3xl" />
          ) : (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-muted/20 border border-border/50 p-6 shadow-xl shadow-black/5">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

              <div className="relative flex items-center justify-between gap-6">
                {/* Left side - Income & Spent */}
                <div className="flex-1 space-y-5">
                  {/* Income */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full bg-income" />
                      <span className="text-sm text-muted-foreground font-medium">
                        Income
                      </span>
                    </div>
                    <p className="text-3xl font-bold tracking-tight text-income">
                      {formatAmount(summary?.totalIncome || 0)}
                    </p>
                  </div>

                  {/* Spent */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full bg-destructive" />
                      <span className="text-sm text-muted-foreground font-medium">
                        Spent
                      </span>
                    </div>
                    <p className="text-2xl font-bold tracking-tight text-destructive">
                      {formatAmount(summary?.totalExpense || 0)}
                    </p>
                  </div>
                </div>

                {/* Right side - Donut Chart */}
                <div className="relative">
                  <svg
                    width={size}
                    height={size}
                    className="transform -rotate-90"
                  >
                    {/* Background circle */}
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={strokeWidth}
                      className="text-muted/30"
                    />
                    {/* Remaining (income - spent) - green arc */}
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={remainingOffset}
                      strokeLinecap="round"
                      className="text-income transition-all duration-700 ease-out"
                    />
                    {/* Spent - coral/salmon arc */}
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={spentOffset}
                      strokeLinecap="round"
                      className="text-expense transition-all duration-700 ease-out"
                      style={{
                        transform: `rotate(${
                          (100 - spentPercentage) * 3.6
                        }deg)`,
                        transformOrigin: "center",
                      }}
                    />
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      Balance
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        (summary?.balance || 0) >= 0
                          ? "text-income"
                          : "text-destructive"
                      }`}
                    >
                      {spentPercentage > 0
                        ? `${Math.round(100 - spentPercentage)}%`
                        : "100%"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Balance bar at bottom */}
              <div className="mt-5 pt-4 border-t border-border/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Monthly Balance
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      (summary?.balance || 0) >= 0
                        ? "text-primary"
                        : "text-destructive"
                    }`}
                  >
                    {formatAmount(summary?.balance || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Budget Progress - Modern Card */}
        <div
          className="rounded-2xl overflow-hidden animate-card-enter bg-card border border-border/50"
          style={{ animationDelay: "150ms" }}
        >
          <div className="p-4 pb-3 border-b border-border/30 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Budget Overview
            </h3>
            <Link href="/settings/budget-goals">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
              >
                <Settings2 className="h-3.5 w-3.5 mr-1" />
                Customize
              </Button>
            </Link>
          </div>
          <div className="p-4 space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : (
              <>
                <BudgetProgress
                  type="needs"
                  label="Needs (50%)"
                  current={summary?.needs.current || 0}
                  goal={summary?.needs.goal || 0}
                />
                <BudgetProgress
                  type="wants"
                  label="Wants (30%)"
                  current={summary?.wants.current || 0}
                  goal={summary?.wants.goal || 0}
                />
                <BudgetProgress
                  type="savings"
                  label="Savings (20%)"
                  current={
                    (summary?.savings.current || 0) +
                    (summary?.investments?.current || 0)
                  }
                  goal={
                    (summary?.savings.goal || 0) +
                    (summary?.investments?.goal || 0)
                  }
                />
              </>
            )}
          </div>
        </div>

        {/* Bills Widget */}
        <div className="animate-card-enter" style={{ animationDelay: "200ms" }}>
          <BillsWidget />
        </div>

        {/* Recent Transactions */}
        <div
          className="space-y-3 animate-card-enter"
          style={{ animationDelay: "250ms" }}
        >
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Recent Transactions
            </h3>
            <Link href="/transactions">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-7 text-xs"
              >
                See All
                <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : !summary?.recentTransactions.length ? (
            <div className="rounded-2xl border-2 border-dashed border-border/50 bg-card/50">
              <div className="py-8 text-center">
                <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <Plus className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  No transactions this month
                </p>
                <Link href="/transactions/new">
                  <Button size="sm" className="h-8 px-4 text-xs font-medium">
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Transaction
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {summary.recentTransactions.map((transaction, index) => (
                <TransactionCard
                  key={transaction.id}
                  className="animate-card-enter"
                  style={{ animationDelay: `${300 + index * 50}ms` }}
                  transaction={{
                    id: transaction.id,
                    userId: "",
                    type: transaction.type as TransactionType,
                    amount: transaction.amount,
                    description: transaction.description,
                    notes: transaction.notes,
                    transactionDate: transaction.transactionDate,
                    categoryId: transaction.category?.id || null,
                    subCategoryId: transaction.subCategory?.id || null,
                    accountId: transaction.account?.id || null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    category: transaction.category
                      ? {
                          id: transaction.category.id,
                          userId: "",
                          name: transaction.category.name,
                          icon: transaction.category.icon,
                          sortOrder: 0,
                          isSystem: false,
                          isArchived: false,
                          createdAt: new Date(),
                          updatedAt: new Date(),
                        }
                      : null,
                    subCategory: transaction.subCategory
                      ? {
                          id: transaction.subCategory.id,
                          categoryId: transaction.category?.id || "",
                          userId: "",
                          name: transaction.subCategory.name,
                          icon: transaction.subCategory.icon,
                          sortOrder: 0,
                          isSystem: false,
                          isArchived: false,
                          createdAt: new Date(),
                          updatedAt: new Date(),
                        }
                      : null,
                    account: transaction.account
                      ? {
                          id: transaction.account.id,
                          userId: "",
                          name: transaction.account.name,
                          type: transaction.account.type as
                            | "bank"
                            | "cash"
                            | "credit_card",
                          balance: "0",
                          color: transaction.account.color,
                          icon: null,
                          isDefault: false,
                          isArchived: false,
                          createdAt: new Date(),
                          updatedAt: new Date(),
                        }
                      : null,
                    tags: [],
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom spacing for navigation */}
        <div className="h-4" />
      </div>
    </div>
  );
}
