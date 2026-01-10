import { NextResponse } from "next/server";
import { db, monthlyBudgets, budgetItems, categories, accounts, transactions } from "@/db";
import { eq, and, desc, gte, lte, sum } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { budgetFilterSchema, budgetItemSchema } from "@/schemas/budget";
import type { BudgetItemStatus } from "@/types";

// Helper function to compute budget item status (for payment type only)
function computeItemStatus(
  item: { itemType: string; dueDay: number | null; isPaid: boolean | null },
  month: number,
  year: number
): BudgetItemStatus {
  if (item.itemType === "limit") return "unpaid"; // Limits don't have paid/unpaid status
  if (item.isPaid) return "paid";

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();

  // If we're looking at a future month, it's upcoming
  if (year > currentYear || (year === currentYear && month > currentMonth)) {
    return "upcoming";
  }

  // If we're looking at a past month and unpaid, it's overdue
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return "overdue";
  }

  // Current month - check due day
  const dueDay = item.dueDay || 31;

  if (currentDay > dueDay) {
    return "overdue";
  } else if (currentDay === dueDay) {
    return "due_today";
  } else if (dueDay - currentDay <= 7) {
    return "upcoming";
  }

  return "unpaid";
}

// Helper to get or create monthly budget for a user/month/year
async function getOrCreateMonthlyBudget(userId: string, month: number, year: number) {
  let budget = await db.query.monthlyBudgets.findFirst({
    where: and(
      eq(monthlyBudgets.userId, userId),
      eq(monthlyBudgets.month, month),
      eq(monthlyBudgets.year, year)
    ),
  });

  if (!budget) {
    // Create new budget for this month
    const [newBudget] = await db
      .insert(monthlyBudgets)
      .values({ userId, month, year })
      .returning();
    budget = newBudget;

    // Copy recurring items from previous month
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    const prevBudget = await db.query.monthlyBudgets.findFirst({
      where: and(
        eq(monthlyBudgets.userId, userId),
        eq(monthlyBudgets.month, prevMonth),
        eq(monthlyBudgets.year, prevYear)
      ),
    });

    if (prevBudget) {
      const recurringItems = await db.query.budgetItems.findMany({
        where: and(
          eq(budgetItems.budgetId, prevBudget.id),
          eq(budgetItems.isRecurring, true)
        ),
      });

      if (recurringItems.length > 0) {
        await db.insert(budgetItems).values(
          recurringItems.map((item) => ({
            budgetId: budget!.id,
            userId,
            itemType: item.itemType,
            categoryId: item.categoryId,
            name: item.name,
            amount: item.amount,
            dueDay: item.dueDay,
            isRecurring: true,
            isPaid: false,
            accountId: item.accountId,
            notes: item.notes,
          }))
        );
      }
    }
  }

  return budget;
}

// GET - Get monthly budget with items
export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(request.url);

    const today = new Date();
    const params = budgetFilterSchema.parse({
      month: searchParams.get("month") || today.getMonth() + 1,
      year: searchParams.get("year") || today.getFullYear(),
      itemType: searchParams.get("itemType") || undefined,
      status: searchParams.get("status") || undefined,
    });

    const month = params.month || today.getMonth() + 1;
    const year = params.year || today.getFullYear();

    // Get or create budget for this month
    const budget = await getOrCreateMonthlyBudget(userId, month, year);

    // Get budget items with relations
    const items = await db.query.budgetItems.findMany({
      where: eq(budgetItems.budgetId, budget.id),
      with: {
        category: true,
        account: true,
        transaction: true,
      },
      orderBy: [desc(budgetItems.createdAt)],
    });

    // Calculate actual spending for limit items
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-${new Date(year, month, 0).getDate()}`;

    // Get spending by category for this month
    const spendingByCategory = await db
      .select({
        categoryId: transactions.categoryId,
        total: sum(transactions.amount),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.transactionDate, startDate),
          lte(transactions.transactionDate, endDate)
        )
      )
      .groupBy(transactions.categoryId);

    const spendingMap = new Map(
      spendingByCategory.map((s) => [s.categoryId, parseFloat(String(s.total || 0))])
    );

    // Add status and actual spending to items
    const itemsWithStatus = items.map((item) => {
      const status = computeItemStatus(item, month, year);
      const actualSpent =
        item.itemType === "limit" && item.categoryId
          ? spendingMap.get(item.categoryId) || 0
          : 0;

      return {
        ...item,
        status,
        actualSpent,
      };
    });

    // Filter by item type if requested
    let filteredItems = itemsWithStatus;
    if (params.itemType && params.itemType !== "all") {
      filteredItems = itemsWithStatus.filter((i) => i.itemType === params.itemType);
    }

    // Filter by status if requested
    if (params.status && params.status !== "all") {
      filteredItems = filteredItems.filter((i) => i.status === params.status);
    }

    // Calculate summary
    const limits = filteredItems.filter((i) => i.itemType === "limit");
    const payments = filteredItems.filter((i) => i.itemType === "payment");

    const summary = {
      month,
      year,
      totalBudgeted: filteredItems.reduce((sum, i) => sum + parseFloat(String(i.amount)), 0),
      totalSpent: limits.reduce((sum, i) => sum + i.actualSpent, 0),
      remaining: 0,
      limits: {
        total: limits.reduce((sum, i) => sum + parseFloat(String(i.amount)), 0),
        spent: limits.reduce((sum, i) => sum + i.actualSpent, 0),
        count: limits.length,
      },
      payments: {
        total: payments.reduce((sum, i) => sum + parseFloat(String(i.amount)), 0),
        paid: payments.filter((i) => i.status === "paid").length,
        unpaid: payments.filter((i) => i.status !== "paid").length,
        overdue: payments.filter((i) => i.status === "overdue").length,
        paidAmount: payments
          .filter((i) => i.status === "paid")
          .reduce((sum, i) => sum + parseFloat(String(i.paidAmount || i.amount)), 0),
        unpaidAmount: payments
          .filter((i) => i.status !== "paid")
          .reduce((sum, i) => sum + parseFloat(String(i.amount)), 0),
      },
    };
    summary.remaining = summary.limits.total - summary.limits.spent;

    return NextResponse.json({
      data: {
        budget,
        items: filteredItems,
        limits,
        payments,
      },
      summary,
      month,
      year,
    });
  } catch (error) {
    console.error("Get budget error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to get budget" }, { status: 500 });
  }
}

// POST - Create a new budget item
export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();

    // Get month/year from body or use current
    const today = new Date();
    const month = body.month || today.getMonth() + 1;
    const year = body.year || today.getFullYear();

    // Validate item data
    const validationResult = budgetItemSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Get or create budget for this month
    const budget = await getOrCreateMonthlyBudget(userId, month, year);

    // Verify category belongs to user (if provided)
    if (data.categoryId) {
      const category = await db.query.categories.findFirst({
        where: and(eq(categories.id, data.categoryId), eq(categories.userId, userId)),
      });
      if (!category) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }
    }

    // Verify account belongs to user (if provided)
    if (data.accountId) {
      const account = await db.query.accounts.findFirst({
        where: and(eq(accounts.id, data.accountId), eq(accounts.userId, userId)),
      });
      if (!account) {
        return NextResponse.json({ error: "Invalid account" }, { status: 400 });
      }
    }

    // Create budget item
    const [newItem] = await db
      .insert(budgetItems)
      .values({
        budgetId: budget.id,
        userId,
        itemType: data.itemType,
        categoryId: data.categoryId || null,
        name: data.name,
        amount: String(data.amount),
        dueDay: data.dueDay || null,
        isRecurring: data.isRecurring || false,
        accountId: data.accountId || null,
        notes: data.notes || null,
      })
      .returning();

    // Get full item with relations
    const fullItem = await db.query.budgetItems.findFirst({
      where: eq(budgetItems.id, newItem.id),
      with: {
        category: true,
        account: true,
      },
    });

    return NextResponse.json({
      data: fullItem,
      message: "Budget item created successfully",
    });
  } catch (error) {
    console.error("Create budget item error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create budget item" }, { status: 500 });
  }
}

