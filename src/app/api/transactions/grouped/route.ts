import { NextResponse } from "next/server";
import { db, transactions, categories } from "@/db";
import { eq, desc, asc, and, gte, lte, inArray, ilike, or } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const groupedQuerySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  categoryId: z.string().uuid().optional(),
  categoryType: z.enum(["income", "needs", "wants", "savings"]).optional(),
  accountId: z.string().uuid().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export interface GroupedTransaction {
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
  tags: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
}

export interface GroupedTransactionsResponse {
  groups: Array<{
    date: string;
    transactions: GroupedTransaction[];
  }>;
  total: number;
}

// GET - Get transactions grouped by date
export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Parse and validate query params
    const params = groupedQuerySchema.parse({
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
      categoryId: searchParams.get("categoryId") || undefined,
      categoryType: searchParams.get("categoryType") || undefined,
      accountId: searchParams.get("accountId") || undefined,
      search: searchParams.get("search") || undefined,
      sortOrder: searchParams.get("sortOrder") || "desc",
    });

    const startDateStr = params.startDate.toISOString().split("T")[0];
    const endDateStr = params.endDate.toISOString().split("T")[0];

    // Build where conditions
    const conditions = [
      eq(transactions.userId, userId),
      gte(transactions.transactionDate, startDateStr),
      lte(transactions.transactionDate, endDateStr),
    ];

    if (params.categoryId) {
      conditions.push(eq(transactions.categoryId, params.categoryId));
    }
    if (params.accountId) {
      conditions.push(eq(transactions.accountId, params.accountId));
    }

    // Add search condition
    if (params.search) {
      const searchTerm = `%${params.search}%`;
      conditions.push(
        or(
          ilike(transactions.description, searchTerm),
          ilike(transactions.notes, searchTerm)
        )!
      );
    }

    // For category type filtering
    if (params.categoryType) {
      const matchingCategories = await db.query.categories.findMany({
        where: and(
          eq(categories.userId, userId),
          eq(categories.type, params.categoryType)
        ),
        columns: { id: true },
      });
      const categoryIds = matchingCategories.map((c) => c.id);
      
      if (categoryIds.length === 0) {
        return NextResponse.json({
          groups: [],
          total: 0,
        } as GroupedTransactionsResponse);
      }
      
      conditions.push(inArray(transactions.categoryId, categoryIds));
    }

    // Fetch transactions with sorting
    const sortFn = params.sortOrder === "asc" ? asc : desc;
    const transactionList = await db.query.transactions.findMany({
      where: and(...conditions),
      with: {
        category: true,
        account: true,
        transactionTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: [sortFn(transactions.transactionDate), desc(transactions.createdAt)],
    });

    // Group transactions by date
    const groupedMap = new Map<string, GroupedTransaction[]>();

    transactionList.forEach((t) => {
      const dateKey = t.transactionDate;
      
      const transformedTransaction: GroupedTransaction = {
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
        tags: t.transactionTags.map((tt) => ({
          id: tt.tag.id,
          name: tt.tag.name,
          color: tt.tag.color,
        })),
      };

      if (!groupedMap.has(dateKey)) {
        groupedMap.set(dateKey, []);
      }
      groupedMap.get(dateKey)!.push(transformedTransaction);
    });

    // Convert to array and sort dates
    const groups = Array.from(groupedMap.entries())
      .map(([date, transactions]) => ({ date, transactions }))
      .sort((a, b) => {
        const comparison = a.date.localeCompare(b.date);
        return params.sortOrder === "desc" ? -comparison : comparison;
      });

    const response: GroupedTransactionsResponse = {
      groups,
      total: transactionList.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get grouped transactions error:", error);
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
      { error: "Failed to get transactions" },
      { status: 500 }
    );
  }
}

