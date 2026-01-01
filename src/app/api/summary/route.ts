import { NextResponse } from "next/server";
import { db, transactions, categories } from "@/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const summaryQuerySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export interface SpendingByType {
  name: string;
  amount: number;
}

export interface SpendingByCategory {
  name: string;
  amount: number;
  color: string;
  type: string;
}

export interface SummaryResponse {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  needs: { current: number; goal: number };
  wants: { current: number; goal: number };
  savings: { current: number; goal: number };
  spendingByType: SpendingByType[];
  spendingByCategory: SpendingByCategory[];
  recentTransactions: Array<{
    id: string;
    amount: string;
    description: string;
    notes: string | null;
    transactionDate: string;
    category: {
      id: string;
      name: string;
      type: string;
      color: string | null;
      icon: string | null;
    } | null;
    account: {
      id: string;
      name: string;
      type: string;
      color: string | null;
    } | null;
  }>;
}

// GET - Get monthly summary with pre-computed data
export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Parse and validate query params
    const params = summaryQuerySchema.parse({
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
    });

    const startDateStr = params.startDate.toISOString().split("T")[0];
    const endDateStr = params.endDate.toISOString().split("T")[0];

    // Fetch all transactions for the period with their categories
    const transactionList = await db.query.transactions.findMany({
      where: and(
        eq(transactions.userId, userId),
        gte(transactions.transactionDate, startDateStr),
        lte(transactions.transactionDate, endDateStr)
      ),
      with: {
        category: true,
        account: true,
      },
      orderBy: (transactions, { desc }) => [
        desc(transactions.transactionDate),
        desc(transactions.createdAt),
      ],
    });

    // Calculate summary totals
    let totalIncome = 0;
    let totalNeeds = 0;
    let totalWants = 0;
    let totalSavings = 0;
    const categoryTotals: Record<string, { amount: number; color: string; type: string }> = {};

    transactionList.forEach((t) => {
      const amount = parseFloat(String(t.amount));
      const type = t.category?.type;
      const categoryName = t.category?.name || "Uncategorized";

      switch (type) {
        case "income":
          totalIncome += amount;
          break;
        case "needs":
          totalNeeds += amount;
          break;
        case "wants":
          totalWants += amount;
          break;
        case "savings":
          totalSavings += amount;
          break;
      }

      // Track spending by category (exclude income)
      if (type && type !== "income") {
        if (!categoryTotals[categoryName]) {
          categoryTotals[categoryName] = {
            amount: 0,
            color: t.category?.color || "#6b7280",
            type: type,
          };
        }
        categoryTotals[categoryName].amount += amount;
      }
    });

    const totalExpense = totalNeeds + totalWants + totalSavings;
    const balance = totalIncome - totalExpense;

    // Budget goals based on 50/30/20 rule
    const needsGoal = totalIncome * 0.5;
    const wantsGoal = totalIncome * 0.3;
    const savingsGoal = totalIncome * 0.2;

    // Prepare spending by type data
    const spendingByType: SpendingByType[] = [];
    if (totalNeeds > 0) spendingByType.push({ name: "Needs", amount: Math.round(totalNeeds * 100) / 100 });
    if (totalWants > 0) spendingByType.push({ name: "Wants", amount: Math.round(totalWants * 100) / 100 });
    if (totalSavings > 0) spendingByType.push({ name: "Savings", amount: Math.round(totalSavings * 100) / 100 });

    // Prepare spending by category data
    const spendingByCategory: SpendingByCategory[] = Object.entries(categoryTotals)
      .map(([name, data]) => ({
        name,
        amount: Math.round(data.amount * 100) / 100,
        color: data.color,
        type: data.type,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Get recent transactions (top 5, already sorted)
    const recentTransactions = transactionList.slice(0, 5).map((t) => ({
      id: t.id,
      amount: t.amount,
      description: t.description,
      notes: t.notes,
      transactionDate: t.transactionDate,
      category: t.category
        ? {
            id: t.category.id,
            name: t.category.name,
            type: t.category.type,
            color: t.category.color,
            icon: t.category.icon,
          }
        : null,
      account: t.account
        ? {
            id: t.account.id,
            name: t.account.name,
            type: t.account.type,
            color: t.account.color,
          }
        : null,
    }));

    const response: SummaryResponse = {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpense: Math.round(totalExpense * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      needs: { current: Math.round(totalNeeds * 100) / 100, goal: Math.round(needsGoal * 100) / 100 },
      wants: { current: Math.round(totalWants * 100) / 100, goal: Math.round(wantsGoal * 100) / 100 },
      savings: { current: Math.round(totalSavings * 100) / 100, goal: Math.round(savingsGoal * 100) / 100 },
      spendingByType,
      spendingByCategory,
      recentTransactions,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get summary error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid parameters", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to get summary" },
      { status: 500 }
    );
  }
}

