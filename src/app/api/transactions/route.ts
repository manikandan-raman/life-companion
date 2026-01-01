import { NextResponse } from "next/server";
import { db, transactions, categories, accounts, tags, transactionTags } from "@/db";
import { eq, desc, asc, and, gte, lte, sql, inArray, ilike, or } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { transactionSchema, transactionFilterSchema } from "@/schemas/transaction";

// GET - List transactions with filters
export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Parse and validate query params
    const params = transactionFilterSchema.parse({
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      categoryType: searchParams.get("categoryType") || undefined,
      accountId: searchParams.get("accountId") || undefined,
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") || "transactionDate",
      sortOrder: searchParams.get("sortOrder") || "desc",
      page: searchParams.get("page") || 1,
      pageSize: searchParams.get("pageSize") || 20,
    });

    // Build where conditions for transactions
    const conditions = [eq(transactions.userId, userId)];

    if (params.startDate) {
      conditions.push(gte(transactions.transactionDate, params.startDate.toISOString().split("T")[0]));
    }
    if (params.endDate) {
      conditions.push(lte(transactions.transactionDate, params.endDate.toISOString().split("T")[0]));
    }
    if (params.categoryId) {
      conditions.push(eq(transactions.categoryId, params.categoryId));
    }
    if (params.accountId) {
      conditions.push(eq(transactions.accountId, params.accountId));
    }

    // Add search condition (server-side search)
    if (params.search) {
      const searchTerm = `%${params.search}%`;
      conditions.push(
        or(
          ilike(transactions.description, searchTerm),
          ilike(transactions.notes, searchTerm)
        )!
      );
    }

    // For category type filtering, we need to get category IDs first
    let categoryIds: string[] | null = null;
    if (params.categoryType) {
      const matchingCategories = await db.query.categories.findMany({
        where: and(
          eq(categories.userId, userId),
          eq(categories.type, params.categoryType)
        ),
        columns: { id: true },
      });
      categoryIds = matchingCategories.map((c) => c.id);
      
      // If no categories match the type, return empty result
      if (categoryIds.length === 0) {
        return NextResponse.json({
          data: [],
          total: 0,
          page: params.page,
          pageSize: params.pageSize,
          totalPages: 0,
        });
      }
      
      // Add category type condition
      conditions.push(inArray(transactions.categoryId, categoryIds));
    }

    // Get total count with all filters applied
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(and(...conditions));

    // Determine sort column and order
    const getSortColumn = () => {
      switch (params.sortBy) {
        case "amount":
          return transactions.amount;
        case "createdAt":
          return transactions.createdAt;
        case "transactionDate":
        default:
          return transactions.transactionDate;
      }
    };

    const sortFn = params.sortOrder === "asc" ? asc : desc;
    const sortColumn = getSortColumn();

    // Get transactions with pagination
    const offset = (params.page - 1) * params.pageSize;
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
      orderBy: [sortFn(sortColumn), desc(transactions.createdAt)],
      limit: params.pageSize,
      offset,
    });

    // Transform to include tags array
    const transformedTransactions = transactionList.map((t) => ({
      ...t,
      tags: t.transactionTags.map((tt) => tt.tag),
      transactionTags: undefined,
    }));

    return NextResponse.json({
      data: transformedTransactions,
      total: Number(count),
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(Number(count) / params.pageSize),
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to get transactions" },
      { status: 500 }
    );
  }
}

// POST - Create a new transaction
export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();

    // Validate input
    const validationResult = transactionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify category belongs to user
    if (data.categoryId) {
      const category = await db.query.categories.findFirst({
        where: and(
          eq(categories.id, data.categoryId),
          eq(categories.userId, userId)
        ),
      });
      if (!category) {
        return NextResponse.json(
          { error: "Invalid category" },
          { status: 400 }
        );
      }
    }

    // Verify account belongs to user
    if (data.accountId) {
      const account = await db.query.accounts.findFirst({
        where: and(
          eq(accounts.id, data.accountId),
          eq(accounts.userId, userId)
        ),
      });
      if (!account) {
        return NextResponse.json(
          { error: "Invalid account" },
          { status: 400 }
        );
      }
    }

    // Create transaction
    const [newTransaction] = await db
      .insert(transactions)
      .values({
        userId,
        amount: String(data.amount),
        description: data.description,
        notes: data.notes || null,
        categoryId: data.categoryId,
        accountId: data.accountId || null,
        transactionDate: data.transactionDate.toISOString().split("T")[0],
      })
      .returning();

    // Add tags if provided
    if (data.tagIds && data.tagIds.length > 0) {
      // Verify tags belong to user
      const userTags = await db.query.tags.findMany({
        where: and(
          eq(tags.userId, userId),
          inArray(tags.id, data.tagIds)
        ),
      });

      if (userTags.length > 0) {
        await db.insert(transactionTags).values(
          userTags.map((tag) => ({
            transactionId: newTransaction.id,
            tagId: tag.id,
          }))
        );
      }
    }

    // Get the full transaction with relations
    const fullTransaction = await db.query.transactions.findFirst({
      where: eq(transactions.id, newTransaction.id),
      with: {
        category: true,
        account: true,
        transactionTags: {
          with: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: {
        ...fullTransaction,
        tags: fullTransaction?.transactionTags.map((tt) => tt.tag) || [],
      },
      message: "Transaction created successfully",
    });
  } catch (error) {
    console.error("Create transaction error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
