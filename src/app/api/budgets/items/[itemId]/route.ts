import { NextResponse } from "next/server";
import { db, budgetItems, categories, accounts } from "@/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { budgetItemSchema } from "@/schemas/budget";

// PATCH - Update a budget item
export async function PATCH(
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
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Budget item not found" }, { status: 404 });
    }

    // Validate input (partial)
    const validationResult = budgetItemSchema.partial().safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

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

    // Update budget item
    const [updatedItem] = await db
      .update(budgetItems)
      .set({
        ...(data.itemType && { itemType: data.itemType }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId || null }),
        ...(data.name && { name: data.name }),
        ...(data.amount && { amount: String(data.amount) }),
        ...(data.dueDay !== undefined && { dueDay: data.dueDay || null }),
        ...(data.isRecurring !== undefined && { isRecurring: data.isRecurring }),
        ...(data.accountId !== undefined && { accountId: data.accountId || null }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
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
      },
    });

    return NextResponse.json({
      data: fullItem,
      message: "Budget item updated successfully",
    });
  } catch (error) {
    console.error("Update budget item error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update budget item" }, { status: 500 });
  }
}

// DELETE - Delete a budget item
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { itemId } = await params;

    // Check if item exists and belongs to user
    const existingItem = await db.query.budgetItems.findFirst({
      where: and(eq(budgetItems.id, itemId), eq(budgetItems.userId, userId)),
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Budget item not found" }, { status: 404 });
    }

    // Delete the item
    await db.delete(budgetItems).where(eq(budgetItems.id, itemId));

    return NextResponse.json({
      message: "Budget item deleted successfully",
    });
  } catch (error) {
    console.error("Delete budget item error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to delete budget item" }, { status: 500 });
  }
}

