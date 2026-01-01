import { NextResponse } from "next/server";
import { db, accounts } from "@/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { accountSchema } from "@/schemas/account";

// GET - List all accounts for the user
export async function GET() {
  try {
    const { userId } = await requireAuth();

    const userAccounts = await db.query.accounts.findMany({
      where: and(
        eq(accounts.userId, userId),
        eq(accounts.isArchived, false)
      ),
      orderBy: (accounts, { desc }) => [desc(accounts.isDefault), accounts.name],
    });

    return NextResponse.json({ data: userAccounts });
  } catch (error) {
    console.error("Get accounts error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to get accounts" },
      { status: 500 }
    );
  }
}

// POST - Create a new account
export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();

    // Validate input
    const validationResult = accountSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await db
        .update(accounts)
        .set({ isDefault: false })
        .where(eq(accounts.userId, userId));
    }

    // Create account
    const [newAccount] = await db
      .insert(accounts)
      .values({
        userId,
        name: data.name,
        type: data.type,
        balance: String(data.balance),
        color: data.color,
        icon: data.icon,
        isDefault: data.isDefault,
      })
      .returning();

    return NextResponse.json({
      data: newAccount,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Create account error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}

