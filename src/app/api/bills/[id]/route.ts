import { NextResponse } from "next/server";
import { db, recurringBills, categories, accounts } from "@/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { recurringBillSchema } from "@/schemas/bill";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get a single recurring bill
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    const bill = await db.query.recurringBills.findFirst({
      where: and(eq(recurringBills.id, id), eq(recurringBills.userId, userId)),
      with: {
        category: true,
        account: true,
        payments: {
          orderBy: (payments, { desc }) => [desc(payments.year), desc(payments.month)],
          limit: 12, // Last 12 payments
          with: {
            account: true,
            transaction: true,
          },
        },
      },
    });

    if (!bill) {
      return NextResponse.json(
        { error: "Bill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: bill });
  } catch (error) {
    console.error("Get bill error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to get bill" },
      { status: 500 }
    );
  }
}

// PATCH - Update a recurring bill
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Check if bill exists and belongs to user
    const existingBill = await db.query.recurringBills.findFirst({
      where: and(eq(recurringBills.id, id), eq(recurringBills.userId, userId)),
    });

    if (!existingBill) {
      return NextResponse.json(
        { error: "Bill not found" },
        { status: 404 }
      );
    }

    // Validate input (partial)
    const validationResult = recurringBillSchema.partial().safeParse(body);
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

    // Verify account belongs to user (if provided)
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

    // Update bill
    const [updatedBill] = await db
      .update(recurringBills)
      .set({
        ...data,
        amount: data.amount !== undefined ? String(data.amount) : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(recurringBills.id, id), eq(recurringBills.userId, userId)))
      .returning();

    // Get the full bill with relations
    const fullBill = await db.query.recurringBills.findFirst({
      where: eq(recurringBills.id, updatedBill.id),
      with: {
        category: true,
        account: true,
      },
    });

    return NextResponse.json({
      data: fullBill,
      message: "Bill updated successfully",
    });
  } catch (error) {
    console.error("Update bill error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to update bill" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a recurring bill
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    // Check if bill exists and belongs to user
    const existingBill = await db.query.recurringBills.findFirst({
      where: and(eq(recurringBills.id, id), eq(recurringBills.userId, userId)),
    });

    if (!existingBill) {
      return NextResponse.json(
        { error: "Bill not found" },
        { status: 404 }
      );
    }

    // Delete the bill (cascade will delete payments)
    await db
      .delete(recurringBills)
      .where(and(eq(recurringBills.id, id), eq(recurringBills.userId, userId)));

    return NextResponse.json({ message: "Bill deleted successfully" });
  } catch (error) {
    console.error("Delete bill error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete bill" },
      { status: 500 }
    );
  }
}
