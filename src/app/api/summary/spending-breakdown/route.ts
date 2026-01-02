import { NextResponse } from "next/server";
import { db, transactions } from "@/db";
import { eq, and, gte, lte } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const querySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export interface SubCategorySpending {
  id: string;
  name: string;
  icon: string | null;
  amount: number;
  percentage: number;
}

export interface CategorySpending {
  id: string;
  name: string;
  icon: string | null;
  amount: number;
  percentage: number;
  type: string;
  subCategories: SubCategorySpending[];
}

export interface SpendingBreakdownResponse {
  categories: CategorySpending[];
  totalSpending: number;
}

// GET - Get spending breakdown by category and subcategory
export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Parse and validate query params
    const params = querySchema.parse({
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
    });

    const startDateStr = params.startDate.toISOString().split("T")[0];
    const endDateStr = params.endDate.toISOString().split("T")[0];

    // Fetch all expense transactions for the period (exclude income)
    const transactionList = await db.query.transactions.findMany({
      where: and(
        eq(transactions.userId, userId),
        gte(transactions.transactionDate, startDateStr),
        lte(transactions.transactionDate, endDateStr)
      ),
      with: {
        category: true,
        subCategory: true,
      },
    });

    // Filter only expense transactions (needs, wants, savings, investments)
    const expenseTransactions = transactionList.filter(
      (t) => t.type !== "income"
    );

    // Calculate total spending
    const totalSpending = expenseTransactions.reduce(
      (sum, t) => sum + parseFloat(String(t.amount)),
      0
    );

    // Group by category and subcategory
    const categoryMap = new Map<
      string,
      {
        id: string;
        name: string;
        icon: string | null;
        type: string;
        amount: number;
        subCategories: Map<
          string,
          {
            id: string;
            name: string;
            icon: string | null;
            amount: number;
          }
        >;
      }
    >();

    expenseTransactions.forEach((t) => {
      const categoryId = t.category?.id || "uncategorized";
      const categoryName = t.category?.name || "Uncategorized";
      const categoryIcon = t.category?.icon || null;
      const amount = parseFloat(String(t.amount));

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          id: categoryId,
          name: categoryName,
          icon: categoryIcon,
          type: t.type,
          amount: 0,
          subCategories: new Map(),
        });
      }

      const category = categoryMap.get(categoryId)!;
      category.amount += amount;

      // Track subcategory if present
      if (t.subCategory) {
        const subCategoryId = t.subCategory.id;
        if (!category.subCategories.has(subCategoryId)) {
          category.subCategories.set(subCategoryId, {
            id: subCategoryId,
            name: t.subCategory.name,
            icon: t.subCategory.icon,
            amount: 0,
          });
        }
        category.subCategories.get(subCategoryId)!.amount += amount;
      } else {
        // Track as "Other" subcategory for transactions without subcategory
        const otherKey = `${categoryId}-other`;
        if (!category.subCategories.has(otherKey)) {
          category.subCategories.set(otherKey, {
            id: otherKey,
            name: "Other",
            icon: null,
            amount: 0,
          });
        }
        category.subCategories.get(otherKey)!.amount += amount;
      }
    });

    // Convert to response format with percentages
    const categories: CategorySpending[] = Array.from(categoryMap.values())
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        type: cat.type,
        amount: Math.round(cat.amount * 100) / 100,
        percentage:
          totalSpending > 0
            ? Math.round((cat.amount / totalSpending) * 10000) / 100
            : 0,
        subCategories: Array.from(cat.subCategories.values())
          .map((sub) => ({
            id: sub.id,
            name: sub.name,
            icon: sub.icon,
            amount: Math.round(sub.amount * 100) / 100,
            percentage:
              cat.amount > 0
                ? Math.round((sub.amount / cat.amount) * 10000) / 100
                : 0,
          }))
          .sort((a, b) => b.amount - a.amount),
      }))
      .sort((a, b) => b.amount - a.amount);

    const response: SpendingBreakdownResponse = {
      categories,
      totalSpending: Math.round(totalSpending * 100) / 100,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get spending breakdown error:", error);
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
      { error: "Failed to get spending breakdown" },
      { status: 500 }
    );
  }
}

