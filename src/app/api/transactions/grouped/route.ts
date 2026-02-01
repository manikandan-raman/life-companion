import { NextResponse } from "next/server";
import { db, transactions } from "@/db";
import { eq, desc, asc, and, gte, lte, ilike, or } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { formatDateToString } from "@/lib/utils";
import { z } from "zod";

const groupedQuerySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  categoryId: z.string().uuid().optional(),
  subCategoryId: z.string().uuid().optional(),
  type: z.enum(["income", "needs", "wants", "savings", "investments"]).optional(),
  accountId: z.string().uuid().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export interface GroupedTransaction {
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
      subCategoryId: searchParams.get("subCategoryId") || undefined,
      type: searchParams.get("type") || undefined,
      accountId: searchParams.get("accountId") || undefined,
      search: searchParams.get("search") || undefined,
      sortOrder: searchParams.get("sortOrder") || "desc",
    });

    const startDateStr = formatDateToString(params.startDate);
    const endDateStr = formatDateToString(params.endDate);

    // Build where conditions
    const conditions = [
      eq(transactions.userId, userId),
      gte(transactions.transactionDate, startDateStr),
      lte(transactions.transactionDate, endDateStr),
    ];

    if (params.categoryId) {
      conditions.push(eq(transactions.categoryId, params.categoryId));
    }
    if (params.subCategoryId) {
      conditions.push(eq(transactions.subCategoryId, params.subCategoryId));
    }
    if (params.type) {
      conditions.push(eq(transactions.type, params.type));
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

    // Fetch transactions with sorting
    const sortFn = params.sortOrder === "asc" ? asc : desc;
    const transactionList = await db.query.transactions.findMany({
      where: and(...conditions),
      with: {
        category: true,
        subCategory: true,
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
        { error: "Invalid parameters", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to get transactions" },
      { status: 500 }
    );
  }
}
