import { NextResponse } from "next/server";
import { db, accounts } from "@/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { accountSchema } from "@/schemas/account";

// GET - Get a single account by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    const account = await db.query.accounts.findFirst({
      where: and(eq(accounts.id, id), eq(accounts.userId, userId)),
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json({ data: account });
  } catch (error) {
    console.error("Get account error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to get account" },
      { status: 500 }
    );
  }
}

// PATCH - Update an account
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Validate input (partial schema for updates)
    const partialSchema = accountSchema.partial();
    const validationResult = partialSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if account exists and belongs to user
    const existingAccount = await db.query.accounts.findFirst({
      where: and(eq(accounts.id, id), eq(accounts.userId, userId)),
    });

    if (!existingAccount) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // If setting this as default, unset other defaults first
    if (data.isDefault === true) {
      await db
        .update(accounts)
        .set({ isDefault: false })
        .where(eq(accounts.userId, userId));
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.balance !== undefined) updateData.balance = String(data.balance);
    if (data.color !== undefined) updateData.color = data.color;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;

    // Update account
    const [updatedAccount] = await db
      .update(accounts)
      .set(updateData)
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
      .returning();

    return NextResponse.json({
      data: updatedAccount,
      message: "Account updated successfully",
    });
  } catch (error) {
    console.error("Update account error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an account
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    // Check if account exists and belongs to user
    const existingAccount = await db.query.accounts.findFirst({
      where: and(eq(accounts.id, id), eq(accounts.userId, userId)),
    });

    if (!existingAccount) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Delete account
    await db
      .delete(accounts)
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}

