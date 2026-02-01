import { NextResponse } from "next/server";
import { db, budgetItems, accounts, transactions, monthlyBudgets } from "@/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { formatDateToString } from "@/lib/utils";
import { budgetItemPaymentSchema } from "@/schemas/budget";

// POST - Mark a budget payment item as paid
export async function POST(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { itemId } = await params;
    const body = await request.json();

    // Check if item exists and belongs to user
    const existingItem = await db.query.budgetItems.findFirst({
      where: and(eq(budgetItems.id, itemId), eq(budgetItems.userId, userId)),
      with: {
        budget: true,
        category: true,
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Budget item not found" }, { status: 404 });
    }

    if (existingItem.itemType !== "payment") {
      return NextResponse.json(
        { error: "Only payment items can be marked as paid" },
        { status: 400 }
      );
    }

    if (existingItem.isPaid) {
      return NextResponse.json(
        { error: "This item is already marked as paid" },
        { status: 400 }
      );
    }

    // Validate payment data
    const validationResult = budgetItemPaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify account belongs to user
    const account = await db.query.accounts.findFirst({
      where: and(eq(accounts.id, data.accountId), eq(accounts.userId, userId)),
    });

    if (!account) {
      return NextResponse.json({ error: "Invalid account" }, { status: 400 });
    }

    // Create transaction for the payment
    const budget = existingItem.budget as { month: number; year: number };
    const transactionDate = new Date(data.paidDate);
    const formattedDate = formatDateToString(transactionDate);

    const [newTransaction] = await db
      .insert(transactions)
      .values({
        userId,
        type: data.type,
        accountId: data.accountId,
        categoryId: existingItem.categoryId,
        amount: String(data.paidAmount),
        description: existingItem.name,
        notes: `Budget payment for ${budget.month}/${budget.year}`,
        transactionDate: formattedDate,
      })
      .returning();

    // Update budget item as paid
    const [updatedItem] = await db
      .update(budgetItems)
      .set({
        isPaid: true,
        paidDate: formattedDate,
        paidAmount: String(data.paidAmount),
        accountId: data.accountId,
        transactionId: newTransaction.id,
        updatedAt: new Date(),
      })
      .where(eq(budgetItems.id, itemId))
      .returning();

    // Get full item with relations
    const fullItem = await db.query.budgetItems.findFirst({
      where: eq(budgetItems.id, updatedItem.id),
      with: {
        category: true,
        account: true,
        transaction: true,
      },
    });

    return NextResponse.json({
      data: fullItem,
      transaction: newTransaction,
      message: "Payment recorded successfully",
    });
  } catch (error) {
    console.error("Pay budget item error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}

