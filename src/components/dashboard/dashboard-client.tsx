"use client";

import { useState } from "react";
import Link from "next/link";
import { startOfMonth, endOfMonth } from "date-fns";
import { Plus, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { SummaryCard } from "@/components/finance/summary-card";
import { BudgetProgress } from "@/components/finance/budget-progress";
import { TransactionCard } from "@/components/finance/transaction-card";
import { SpendingCharts } from "@/components/finance/spending-charts";
import { MonthPicker } from "@/components/finance/month-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSummary, type SummaryData } from "@/hooks/use-transactions";
import { useNetWorth } from "@/hooks/use-networth";
import type { CategoryType } from "@/types";

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
        <div className="flex items-center justify-center">
          <MonthPicker value={currentDate} onChange={setCurrentDate} />
        </div>

        {/* Summary Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              title="Total Income"
              amount={summary?.totalIncome || 0}
              variant="income"
            />
            <SummaryCard
              title="Total Expense"
              amount={summary?.totalExpense || 0}
              variant="expense"
            />
            <SummaryCard
              title="Balance"
              amount={summary?.balance || 0}
              variant="balance"
              trend={(summary?.balance || 0) >= 0 ? "up" : "down"}
            />
          </div>
        )}

        {/* Net Worth Card */}
        {isLoadingNetWorth ? (
          <Skeleton className="h-24 rounded-xl" />
        ) : (
          <Link href="/networth">
            <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Your Net Worth</p>
                    <p
                      className={`text-2xl font-bold ${
                        (netWorth?.netWorth || 0) >= 0
                          ? "text-blue-600"
                          : "text-red-500"
                      }`}
                    >
                      {formatAmount(netWorth?.netWorth || 0)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-emerald-600">
                        <TrendingUp className="h-3 w-3" />
                        <span className="text-xs">
                          {formatAmount(netWorth?.totalAssets || 0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-red-500">
                        <TrendingDown className="h-3 w-3" />
                        <span className="text-xs">
                          {formatAmount(netWorth?.totalLiabilities || 0)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Spending Charts - now receives pre-computed data */}
        <SpendingCharts
          spendingByType={summary?.spendingByType || []}
          spendingByCategory={summary?.spendingByCategory || []}
          isLoading={isLoading}
        />

        {/* Budget Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">
              Budget Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
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
                  current={summary?.savings.current || 0}
                  goal={summary?.savings.goal || 0}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions - data comes pre-sorted from server */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Recent Transactions</h3>
            <Link href="/transactions">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : !summary?.recentTransactions.length ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No transactions this month
                </p>
                <Link href="/transactions/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {summary.recentTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={{
                    id: transaction.id,
                    userId: "",
                    amount: transaction.amount,
                    description: transaction.description,
                    notes: transaction.notes,
                    transactionDate: transaction.transactionDate,
                    categoryId: transaction.category?.id || null,
                    accountId: transaction.account?.id || null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    category: transaction.category
                      ? {
                          id: transaction.category.id,
                          userId: "",
                          name: transaction.category.name,
                          type: transaction.category.type as CategoryType,
                          color: transaction.category.color,
                          icon: transaction.category.icon,
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

        {/* Floating Action Button - Mobile */}
        <Link href="/transactions/new" className="md:hidden">
          <Button
            size="lg"
            className="fixed right-4 bottom-24 h-14 w-14 rounded-full shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

