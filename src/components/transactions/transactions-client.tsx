"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { startOfMonth, endOfMonth } from "date-fns";
import {
  Plus,
  Search,
  X,
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarDays,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { TransactionCard } from "@/components/finance/transaction-card";
import { MonthPicker } from "@/components/finance/month-picker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGroupedTransactions,
  type GroupedTransaction,
} from "@/hooks/use-transactions";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/types";

export function TransactionsClient() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [transactionType, setTransactionType] = useState<TransactionType | "all">("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);

  // Debounce search using useEffect
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Fetch grouped transactions from server (all filtering/sorting done server-side)
  const { data, isLoading } = useGroupedTransactions({
    startDate,
    endDate,
    type: transactionType === "all" ? undefined : transactionType,
    search: debouncedSearch || undefined,
    sortOrder,
  });

  const groups = data?.groups || [];
  const totalTransactions = data?.total || 0;

  // Calculate summary stats
  const summary = groups.reduce(
    (acc, group) => {
      group.transactions.forEach((t) => {
        const amount =
          typeof t.amount === "string" ? parseFloat(t.amount) : t.amount;
        if (t.type === "income") {
          acc.income += amount;
        } else {
          acc.expense += amount;
        }
      });
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const hasActiveFilters = transactionType !== "all" || debouncedSearch;

  const clearFilters = () => {
    setTransactionType("all");
    setSearchQuery("");
    setDebouncedSearch("");
  };

  // Convert GroupedTransaction to TransactionWithRelations format for TransactionCard
  const mapToTransactionWithRelations = (t: GroupedTransaction) => ({
    id: t.id,
    userId: "",
    type: t.type as TransactionType,
    amount: t.amount,
    description: t.description,
    notes: t.notes,
    transactionDate: t.transactionDate,
    categoryId: t.category?.id || null,
    subCategoryId: t.subCategory?.id || null,
    accountId: t.account?.id || null,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: t.category
      ? {
          id: t.category.id,
          userId: "",
          name: t.category.name,
          icon: t.category.icon,
          sortOrder: null,
          isSystem: null,
          isArchived: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      : null,
    subCategory: t.subCategory
      ? {
          id: t.subCategory.id,
          categoryId: t.category?.id || "",
          userId: "",
          name: t.subCategory.name,
          icon: t.subCategory.icon,
          sortOrder: null,
          isSystem: null,
          isArchived: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      : null,
    account: t.account
      ? {
          id: t.account.id,
          userId: "",
          name: t.account.name,
          type: t.account.type as "bank" | "cash" | "credit_card",
          balance: "0",
          color: t.account.color,
          icon: null,
          isDefault: null,
          isArchived: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      : null,
    tags: t.tags.map((tag) => ({
      id: tag.id,
      userId: "",
      name: tag.name,
      color: tag.color,
      createdAt: new Date(),
    })),
  });

  return (
    <div className="min-h-screen">
      <Header title="Transactions" />

      <div className="px-4 py-6 md:px-6 space-y-5 max-w-4xl mx-auto">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <MonthPicker value={currentDate} onChange={setCurrentDate} />

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={transactionType}
            onValueChange={(value) =>
              setTransactionType(value as TransactionType | "all")
            }
          >
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="needs">Needs</SelectItem>
              <SelectItem value="wants">Wants</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
              <SelectItem value="investments">Investments</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
          >
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Filters:</span>
            {transactionType !== "all" && (
              <Badge variant="secondary" className="gap-1 pl-2 pr-1 h-6">
                <span className="capitalize">{transactionType}</span>
                <button
                  onClick={() => setTransactionType("all")}
                  className="ml-1 hover:bg-muted rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {debouncedSearch && (
              <Badge variant="secondary" className="gap-1 pl-2 pr-1 h-6">
                <span>&quot;{debouncedSearch}&quot;</span>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedSearch("");
                  }}
                  className="ml-1 hover:bg-muted rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Summary Strip */}
        {!isLoading && totalTransactions > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-income/5 border border-income/10">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-income/15">
                <TrendingUp className="h-4 w-4 text-income" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Income
                </p>
                <p className="text-sm font-semibold text-income">
                  ₹{summary.income.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-destructive/5 border border-destructive/10">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/15">
                <TrendingDown className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Expenses
                </p>
                <p className="text-sm font-semibold text-destructive">
                  ₹{summary.expense.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Balance
                </p>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    summary.income - summary.expense >= 0
                      ? "text-income"
                      : "text-destructive"
                  )}
                >
                  {summary.income - summary.expense >= 0 ? "" : "-"}₹
                  {Math.abs(summary.income - summary.expense).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Count */}
        {!isLoading && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {totalTransactions} transaction
              {totalTransactions !== 1 ? "s" : ""} found
            </p>
          </div>
        )}

        {/* Transaction Groups - data comes pre-grouped from server */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <CalendarDays className="h-8 w-8 text-muted-foreground/50" />
                </div>
              </div>
              <h3 className="font-medium mb-1">
                {debouncedSearch
                  ? "No matching transactions"
                  : "No transactions yet"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                {debouncedSearch
                  ? `We couldn't find any transactions matching "${debouncedSearch}"`
                  : "Start tracking your finances by adding your first transaction"}
              </p>
              <div className="flex items-center justify-center gap-3">
                {debouncedSearch && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
                <Link href="/transactions/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {groups.map(({ date, transactions }, groupIndex) => (
              <div
                key={date}
                className="space-y-2"
                style={{
                  animation: `slideUp 0.3s ease-out ${groupIndex * 0.05}s both`,
                }}
              >
                {/* Transaction Cards */}
                <div className="space-y-2">
                  {transactions.map((transaction, index) => (
                    <div
                      key={transaction.id}
                      style={{
                        animation: `slideUp 0.3s ease-out ${
                          groupIndex * 0.05 + index * 0.03
                        }s both`,
                      }}
                    >
                      <TransactionCard
                        transaction={mapToTransactionWithRelations(transaction)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating Action Button - Mobile */}
        <Link href="/transactions/new" className="md:hidden">
          <Button
            size="lg"
            className="fixed right-4 bottom-24 h-14 w-14 rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
