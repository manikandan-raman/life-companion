import { NextResponse } from "next/server";
import { db, transactions, categories, accounts, tags, transactionTags } from "@/db";
import { eq, and, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { transactionSchema } from "@/schemas/transaction";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get a single transaction by ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    const transaction = await db.query.transactions.findFirst({
      where: and(
        eq(transactions.id, id),
        eq(transactions.userId, userId)
      ),
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

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        ...transaction,
        tags: transaction.transactionTags.map((tt) => tt.tag),
        transactionTags: undefined,
      },
    });
  } catch (error) {
    console.error("Get transaction error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to get transaction" },
      { status: 500 }
    );
  }
}

// PATCH - Update a transaction
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Check if transaction exists and belongs to user
    const existingTransaction = await db.query.transactions.findFirst({
      where: and(
        eq(transactions.id, id),
        eq(transactions.userId, userId)
      ),
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Validate input (partial validation for PATCH)
    const validationResult = transactionSchema.partial().safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify category belongs to user if provided
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

    // Verify account belongs to user if provided
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

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.amount !== undefined) {
      updateData.amount = String(data.amount);
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes || null;
    }
    if (data.categoryId !== undefined) {
      updateData.categoryId = data.categoryId;
    }
    if (data.accountId !== undefined) {
      updateData.accountId = data.accountId || null;
    }
    if (data.transactionDate !== undefined) {
      updateData.transactionDate = data.transactionDate.toISOString().split("T")[0];
    }

    // Update transaction
    await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id));

    // Handle tags update if provided
    if (data.tagIds !== undefined) {
      // Remove existing tags
      await db
        .delete(transactionTags)
        .where(eq(transactionTags.transactionId, id));

      // Add new tags
      if (data.tagIds.length > 0) {
        const userTags = await db.query.tags.findMany({
          where: and(
            eq(tags.userId, userId),
            inArray(tags.id, data.tagIds)
          ),
        });

        if (userTags.length > 0) {
          await db.insert(transactionTags).values(
            userTags.map((tag) => ({
              transactionId: id,
              tagId: tag.id,
            }))
          );
        }
      }
    }

    // Get the updated transaction with relations
    const updatedTransaction = await db.query.transactions.findFirst({
      where: eq(transactions.id, id),
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
        ...updatedTransaction,
        tags: updatedTransaction?.transactionTags.map((tt) => tt.tag) || [],
        transactionTags: undefined,
      },
      message: "Transaction updated successfully",
    });
  } catch (error) {
    console.error("Update transaction error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a transaction
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    // Check if transaction exists and belongs to user
    const existingTransaction = await db.query.transactions.findFirst({
      where: and(
        eq(transactions.id, id),
        eq(transactions.userId, userId)
      ),
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Delete transaction (cascade will handle transactionTags)
    await db
      .delete(transactions)
      .where(eq(transactions.id, id));

    return NextResponse.json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Delete transaction error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}

