import { NextResponse } from "next/server";
import { db, transactions, budgetGoals } from "@/db";
import { eq, and, gte, lte } from "drizzle-orm";
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
  type: string;
}

export interface SummaryResponse {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  needs: { current: number; goal: number };
  wants: { current: number; goal: number };
  savings: { current: number; goal: number };
  investments: { current: number; goal: number };
  spendingByType: SpendingByType[];
  spendingByCategory: SpendingByCategory[];
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: string;
    description: string | null;
    notes: string | null;
    transactionDate: string;
    category: {
      id: string;
      name: string;
      icon: string | null;
    } | null;
    subCategory: {
      id: string;
      name: string;
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

// Default budget percentages (50/30/20 rule, with 20% split between savings and investments)
const DEFAULT_NEEDS_PERCENTAGE = 50;
const DEFAULT_WANTS_PERCENTAGE = 30;
const DEFAULT_SAVINGS_PERCENTAGE = 20; // This includes both savings and investments

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

    // Extract month and year from start date for budget goal lookup
    const month = params.startDate.getMonth() + 1; // getMonth() is 0-indexed
    const year = params.startDate.getFullYear();

    // Fetch budget goal for this month/year (if exists)
    const budgetGoal = await db.query.budgetGoals.findFirst({
      where: and(
        eq(budgetGoals.userId, userId),
        eq(budgetGoals.month, month),
        eq(budgetGoals.year, year)
      ),
    });

    // Use stored percentages or defaults
    const needsPercentage = budgetGoal 
      ? parseFloat(budgetGoal.needsPercentage) 
      : DEFAULT_NEEDS_PERCENTAGE;
    const wantsPercentage = budgetGoal 
      ? parseFloat(budgetGoal.wantsPercentage) 
      : DEFAULT_WANTS_PERCENTAGE;
    const savingsPercentage = budgetGoal 
      ? parseFloat(budgetGoal.savingsPercentage) 
      : DEFAULT_SAVINGS_PERCENTAGE;

    // Fetch all transactions for the period with their categories
    const transactionList = await db.query.transactions.findMany({
      where: and(
        eq(transactions.userId, userId),
        gte(transactions.transactionDate, startDateStr),
        lte(transactions.transactionDate, endDateStr)
      ),
      with: {
        category: true,
        subCategory: true,
        account: true,
      },
      orderBy: (transactions, { desc }) => [
        desc(transactions.transactionDate),
        desc(transactions.createdAt),
      ],
    });

    // Calculate summary totals using transaction type
    let totalIncome = 0;
    let totalNeeds = 0;
    let totalWants = 0;
    let totalSavings = 0;
    let totalInvestments = 0;
    const categoryTotals: Record<string, { amount: number; type: string }> = {};

    transactionList.forEach((t) => {
      const amount = parseFloat(String(t.amount));
      const type = t.type; // Use transaction type, not category type
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
        case "investments":
          totalInvestments += amount;
          break;
      }

      // Track spending by category (exclude income)
      if (type && type !== "income") {
        if (!categoryTotals[categoryName]) {
          categoryTotals[categoryName] = {
            amount: 0,
            type: type,
          };
        }
        categoryTotals[categoryName].amount += amount;
      }
    });

    const totalExpense = totalNeeds + totalWants + totalSavings + totalInvestments;
    const balance = totalIncome - totalExpense;

    // Calculate budget goals based on stored/default percentages
    // Savings percentage is split evenly between savings and investments (each gets half)
    const needsGoal = totalIncome * (needsPercentage / 100);
    const wantsGoal = totalIncome * (wantsPercentage / 100);
    const savingsGoal = totalIncome * (savingsPercentage / 100) * 0.5; // Half of savings allocation
    const investmentsGoal = totalIncome * (savingsPercentage / 100) * 0.5; // Half of savings allocation

    // Prepare spending by type data
    const spendingByType: SpendingByType[] = [];
    if (totalNeeds > 0) spendingByType.push({ name: "Needs", amount: Math.round(totalNeeds * 100) / 100 });
    if (totalWants > 0) spendingByType.push({ name: "Wants", amount: Math.round(totalWants * 100) / 100 });
    if (totalSavings > 0) spendingByType.push({ name: "Savings", amount: Math.round(totalSavings * 100) / 100 });
    if (totalInvestments > 0) spendingByType.push({ name: "Investments", amount: Math.round(totalInvestments * 100) / 100 });

    // Prepare spending by category data
    const spendingByCategory: SpendingByCategory[] = Object.entries(categoryTotals)
      .map(([name, data]) => ({
        name,
        amount: Math.round(data.amount * 100) / 100,
        type: data.type,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Get recent transactions (top 5, already sorted)
    const recentTransactions = transactionList.slice(0, 5).map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      description: t.description,
      notes: t.notes,
      transactionDate: t.transactionDate,
      category: t.category
        ? {
            id: t.category.id,
            name: t.category.name,
            icon: t.category.icon,
          }
        : null,
      subCategory: t.subCategory
        ? {
            id: t.subCategory.id,
            name: t.subCategory.name,
            icon: t.subCategory.icon,
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
      investments: { current: Math.round(totalInvestments * 100) / 100, goal: Math.round(investmentsGoal * 100) / 100 },
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
        { error: "Invalid parameters", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to get summary" },
      { status: 500 }
    );
  }
}
