"use client";

import { useState } from "react";
import Link from "next/link";
import { startOfMonth, endOfMonth } from "date-fns";
import { Plus, TrendingUp, TrendingDown, ChevronRight, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/header";
import { SummaryCard } from "@/components/finance/summary-card";
import { BudgetProgress } from "@/components/finance/budget-progress";
import { TransactionCard } from "@/components/finance/transaction-card";
import { SpendingCharts } from "@/components/finance/spending-charts";
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

  return (
    <div className="min-h-screen">
      <Header title="Dashboard" />

      <div className="px-4 py-6 md:px-6 space-y-6 max-w-4xl mx-auto">
        {/* Month Picker */}
        <div className="flex items-center justify-center animate-card-enter">
          <MonthPicker value={currentDate} onChange={setCurrentDate} />
        </div>

        {/* Summary Cards with staggered animation */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              title="Total Income"
              amount={summary?.totalIncome || 0}
              variant="income"
              className="animate-card-enter"
            />
            <SummaryCard
              title="Total Expense"
              amount={summary?.totalExpense || 0}
              variant="expense"
              className="animate-card-enter"
              style={{ animationDelay: "50ms" }}
            />
            <SummaryCard
              title="Balance"
              amount={summary?.balance || 0}
              variant="balance"
              trend={(summary?.balance || 0) >= 0 ? "up" : "down"}
              className="animate-card-enter"
              style={{ animationDelay: "100ms" }}
            />
          </div>
        )}

        {/* Net Worth Card - Modern Design */}
        {isLoadingNetWorth ? (
          <Skeleton className="h-28 rounded-2xl" />
        ) : (
          <Link href="/networth" className="block animate-card-enter" style={{ animationDelay: "150ms" }}>
            <div className="card-modern card-networth relative overflow-hidden rounded-2xl p-5 transition-all duration-200 active:scale-[0.98] cursor-pointer group">
              {/* Decorative gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary/70" />
                    <p className="text-sm text-muted-foreground font-medium">Your Net Worth</p>
                  </div>
                  <p
                    className={`text-3xl font-bold tracking-tight ${
                      (netWorth?.netWorth || 0) >= 0
                        ? "text-primary"
                        : "text-destructive"
                    }`}
                  >
                    {formatAmount(netWorth?.netWorth || 0)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-1.5 text-income justify-end">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">
                        {formatAmount(netWorth?.totalAssets || 0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-destructive justify-end">
                      <TrendingDown className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">
                        {formatAmount(netWorth?.totalLiabilities || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Spending Charts */}
        <div className="animate-card-enter" style={{ animationDelay: "200ms" }}>
          <SpendingCharts
            spendingByType={summary?.spendingByType || []}
            spendingByCategory={summary?.spendingByCategory || []}
            isLoading={isLoading}
          />
        </div>

        {/* Budget Progress - Modern Card */}
        <div className="card-modern rounded-2xl overflow-hidden animate-card-enter" style={{ animationDelay: "250ms" }}>
          <div className="p-5 pb-3 border-b border-white/5">
            <h3 className="text-base font-semibold">Budget Overview</h3>
          </div>
          <div className="p-5 space-y-5">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
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
                  current={(summary?.savings.current || 0) + (summary?.investments?.current || 0)}
                  goal={(summary?.savings.goal || 0) + (summary?.investments?.goal || 0)}
                />
              </>
            )}
          </div>
        </div>

        {/* Bills Widget */}
        <div className="animate-card-enter" style={{ animationDelay: "275ms" }}>
          <BillsWidget />
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4 animate-card-enter" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Recent Transactions</h3>
            <Link href="/transactions">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
          ) : !summary?.recentTransactions.length ? (
            <div className="card-modern rounded-2xl border-dashed border-2 border-border/50">
              <div className="py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">
                  No transactions this month
                </p>
                <Link href="/transactions/new">
                  <Button className="fab-modern">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {summary.recentTransactions.map((transaction, index) => (
                <TransactionCard
                  key={transaction.id}
                  className="animate-card-enter"
                  style={{ animationDelay: `${350 + index * 50}ms` }}
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
                          type: transaction.account.type as "bank" | "cash" | "credit_card",
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

      </div>
    </div>
  );
}
